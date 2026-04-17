import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { verifyExtensionSession } from "./sessions";
import { computeEngagementScore, assessChurnRisk, toMs } from "./scoring";

const rawMemberValidator = v.object({
  skoolUserId: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  actStatus: v.optional(v.string()),
  lastOffline: v.optional(v.number()),
  points: v.number(),
  level: v.number(),
  attrComp: v.optional(v.string()),
  attrSrcComp: v.optional(v.string()),
  requestLocation: v.optional(v.string()),
});

export const syncMembers = mutation({
  args: {
    sessionToken: v.string(),
    communitySlug: v.string(),
    communityName: v.string(),
    members: v.array(rawMemberValidator),
  },
  handler: async (ctx, args) => {
    const session = await verifyExtensionSession(ctx, args.sessionToken);

    // Find or create community
    let community = await ctx.db
      .query("communities")
      .withIndex("by_skool_group", (q) =>
        q.eq("skoolGroupId", args.communitySlug)
      )
      .first();

    if (!community) {
      const communityId = await ctx.db.insert("communities", {
        skoolGroupId: args.communitySlug,
        name: args.communityName,
        ownerEmail: session.email,
        edition: "pro",
        lastSyncedAt: Date.now(),
      });
      community = (await ctx.db.get(communityId))!;
    } else {
      await ctx.db.patch(community._id, { lastSyncedAt: Date.now() });
    }

    const snapshotDate = Date.now();

    // Delete existing snapshots for today (idempotent sync)
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const existingSnapshots = await ctx.db
      .query("memberSnapshots")
      .withIndex("by_community_date", (q) =>
        q.eq("communityId", community!._id).gte("snapshotDate", todayStart)
      )
      .collect();

    for (const snap of existingSnapshots) {
      await ctx.db.delete(snap._id);
    }

    // Create new snapshots with computed scores.
    // Normalize Skool nanosecond timestamps to ms at the storage boundary.
    for (const member of args.members) {
      const lastOfflineMs = toMs(member.lastOffline);

      const engagementScore = computeEngagementScore({
        actStatus: member.actStatus,
        lastOfflineMs,
        points: member.points,
        level: member.level,
      });

      const churnRisk = assessChurnRisk(lastOfflineMs);

      await ctx.db.insert("memberSnapshots", {
        communityId: community!._id,
        skoolUserId: member.skoolUserId,
        firstName: member.firstName,
        lastName: member.lastName,
        engagementScore,
        actStatus: member.actStatus,
        lastOffline: lastOfflineMs,
        points: member.points,
        level: member.level,
        attrComp: member.attrComp,
        attrSrcComp: member.attrSrcComp,
        requestLocation: member.requestLocation,
        churnRisk,
        snapshotDate,
      });
    }

    return {
      communityId: community!._id,
      membersProcessed: args.members.length,
      snapshotDate,
    };
  },
});
