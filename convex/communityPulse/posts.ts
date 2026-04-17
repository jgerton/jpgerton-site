import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { verifyExtensionSession } from "./sessions";
import { toMs } from "./scoring";
import { buildMemberPatches, type PostInput, type SnapshotInput } from "./aggregation";

const rawPostValidator = v.object({
  skoolPostId: v.string(),
  skoolGroupId: v.string(),
  authorSkoolUserId: v.string(),
  postType: v.string(),
  labelId: v.optional(v.string()),
  title: v.string(),
  contributorIds: v.array(v.string()),
  commentCount: v.number(),
  upvotes: v.number(),
  pinned: v.boolean(),
  createdAt: v.number(),          // ms or ns; normalized server-side
  lastCommentAt: v.optional(v.number()),
});

/**
 * Sync the community feed: upsert recent posts, recompute per-member
 * community activity + quadrant, and patch today's memberSnapshots.
 * Requires an extension session. Assumes syncMembers ran earlier today
 * so memberSnapshots for the community exist.
 */
export const syncCommunityActivity = mutation({
  args: {
    sessionToken: v.string(),
    communitySlug: v.string(),
    posts: v.array(rawPostValidator),
  },
  handler: async (ctx, args) => {
    const session = await verifyExtensionSession(ctx, args.sessionToken);

    // Find the community this session owner has sync'd
    let community = await ctx.db
      .query("communities")
      .withIndex("by_skool_group", (q) =>
        q.eq("skoolGroupId", args.communitySlug)
      )
      .first();

    if (!community) {
      community = await ctx.db
        .query("communities")
        .withIndex("by_owner", (q) => q.eq("ownerEmail", session.email))
        .first();
    }

    if (!community) {
      throw new Error("No community found for this session. Sync members first.");
    }

    // Ownership guard
    if (community.ownerEmail !== session.email) {
      throw new Error("Session does not own this community");
    }

    const syncedAt = Date.now();

    // Upsert posts (by community + skoolPostId)
    for (const p of args.posts) {
      const createdAtMs = toMs(p.createdAt) ?? syncedAt;
      const lastCommentMs = toMs(p.lastCommentAt);

      const existing = await ctx.db
        .query("posts")
        .withIndex("by_community_post", (q) =>
          q.eq("communityId", community!._id).eq("skoolPostId", p.skoolPostId)
        )
        .first();

      const row = {
        communityId: community._id,
        skoolPostId: p.skoolPostId,
        skoolGroupId: p.skoolGroupId,
        authorSkoolUserId: p.authorSkoolUserId,
        postType: p.postType,
        labelId: p.labelId,
        title: p.title,
        contributorIds: p.contributorIds,
        commentCount: p.commentCount,
        upvotes: p.upvotes,
        pinned: p.pinned,
        createdAt: createdAtMs,
        lastCommentAt: lastCommentMs,
        syncedAt,
      };

      if (existing) {
        await ctx.db.patch(existing._id, row);
      } else {
        await ctx.db.insert("posts", row);
      }
    }

    // Load today's memberSnapshots for this community
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const snapshots = await ctx.db
      .query("memberSnapshots")
      .withIndex("by_community_date", (q) =>
        q.eq("communityId", community!._id).gte("snapshotDate", todayStart)
      )
      .collect();

    // Keep the header's "Last synced" fresh regardless of whether snapshots exist.
    await ctx.db.patch(community._id, { lastSyncedAt: syncedAt });

    if (snapshots.length === 0) {
      return {
        communityId: community._id,
        postsProcessed: args.posts.length,
        snapshotsPatched: 0,
        warning: "No member snapshots for today; run syncMembers first.",
      };
    }

    // Build the pure-function inputs
    const snapshotInputs: SnapshotInput[] = snapshots.map((s) => ({
      _id: s._id as unknown as string,
      skoolUserId: s.skoolUserId,
      churnRisk: s.churnRisk,
    }));

    const postInputs: PostInput[] = args.posts.map((p) => ({
      skoolPostId: p.skoolPostId,
      authorSkoolUserId: p.authorSkoolUserId,
      contributorIds: p.contributorIds,
      createdAt: p.createdAt,
      lastCommentAt: p.lastCommentAt,
    }));

    const patches = buildMemberPatches(snapshotInputs, postInputs, syncedAt);

    // Apply patches (snapshotId is a string here; cast back to Id when patching)
    const idMap = new Map(snapshots.map((s) => [s._id as unknown as string, s._id]));
    for (const { snapshotId, patch } of patches) {
      const realId = idMap.get(snapshotId);
      if (!realId) continue;
      await ctx.db.patch(realId, patch);
    }

    return {
      communityId: community._id,
      postsProcessed: args.posts.length,
      snapshotsPatched: patches.length,
    };
  },
});
