import { query } from "../_generated/server";
import { v } from "convex/values";

const quadrantValidator = v.union(
  v.literal("ambassador"),
  v.literal("drifting"),
  v.literal("loyal"),
  v.literal("at_risk")
);

export const getAtRiskMembers = query({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("memberSnapshots")
      .withIndex("by_community", (q) =>
        q.eq("communityId", args.communityId)
      )
      .order("desc")
      .collect();

    // Deduplicate: keep only the latest snapshot per member
    const latestByMember = new Map<string, typeof snapshots[0]>();
    for (const snap of snapshots) {
      if (!latestByMember.has(snap.skoolUserId)) {
        latestByMember.set(snap.skoolUserId, snap);
      }
    }

    const latest = Array.from(latestByMember.values());

    const atRisk = latest
      .filter((s) => s.churnRisk === "high")
      .sort((a, b) => a.engagementScore - b.engagementScore);
    const watch = latest
      .filter((s) => s.churnRisk === "medium")
      .sort((a, b) => a.engagementScore - b.engagementScore);
    const active = latest
      .filter((s) => s.churnRisk === "low")
      .sort((a, b) => b.engagementScore - a.engagementScore);

    return { atRisk, watch, active };
  },
});

export const getDashboardSummary = query({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return null;

    const snapshots = await ctx.db
      .query("memberSnapshots")
      .withIndex("by_community", (q) =>
        q.eq("communityId", args.communityId)
      )
      .order("desc")
      .collect();

    const latestByMember = new Map<string, typeof snapshots[0]>();
    for (const snap of snapshots) {
      if (!latestByMember.has(snap.skoolUserId)) {
        latestByMember.set(snap.skoolUserId, snap);
      }
    }

    const latest = Array.from(latestByMember.values());
    const totalMembers = latest.length;
    const activeMembers = latest.filter((s) => s.churnRisk === "low").length;
    const atRiskCount = latest.filter((s) => s.churnRisk === "high").length;
    const watchCount = latest.filter((s) => s.churnRisk === "medium").length;
    const engagementRate =
      totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    // Slice 2: quadrant counts. Missing quadrant (pre-backfill) treated as at_risk.
    const quadrantOf = (s: (typeof latest)[number]) => s.quadrant ?? "at_risk";
    const ambassadorCount = latest.filter((s) => quadrantOf(s) === "ambassador").length;
    const driftingCount = latest.filter((s) => quadrantOf(s) === "drifting").length;
    const loyalCount = latest.filter((s) => quadrantOf(s) === "loyal").length;
    const quadrantAtRiskCount = latest.filter((s) => quadrantOf(s) === "at_risk").length;

    return {
      communityName: community.name,
      totalMembers,
      activeMembers,
      atRiskCount,
      watchCount,
      engagementRate,
      lastSyncedAt: community.lastSyncedAt,
      ambassadorCount,
      driftingCount,
      loyalCount,
      quadrantAtRiskCount,
    };
  },
});

export const getMembersByQuadrant = query({
  args: {
    communityId: v.id("communities"),
    quadrant: quadrantValidator,
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("memberSnapshots")
      .withIndex("by_community", (q) =>
        q.eq("communityId", args.communityId)
      )
      .order("desc")
      .collect();

    // Dedup to latest snapshot per member
    const latestByMember = new Map<string, (typeof snapshots)[number]>();
    for (const snap of snapshots) {
      if (!latestByMember.has(snap.skoolUserId)) {
        latestByMember.set(snap.skoolUserId, snap);
      }
    }

    const latest = Array.from(latestByMember.values());

    // Missing quadrant (pre-backfill) is treated as at_risk so it still lists.
    const filtered = latest.filter(
      (s) => (s.quadrant ?? "at_risk") === args.quadrant
    );

    // Most recently active first; undefined sorts to the bottom
    filtered.sort((a, b) => {
      const av = a.lastActivityInCommunity ?? -Infinity;
      const bv = b.lastActivityInCommunity ?? -Infinity;
      return bv - av;
    });

    return filtered;
  },
});

export const getFollowupsByMember = query({
  args: {
    communityId: v.id("communities"),
    skoolUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const followups = await ctx.db
      .query("memberFollowups")
      .withIndex("by_member", (q) =>
        q.eq("skoolUserId", args.skoolUserId).eq("communityId", args.communityId)
      )
      .collect();
    followups.sort((a, b) => b.actedAt - a.actedAt);
    return followups;
  },
});

export const getCommunityBySlug = query({
  args: {
    slug: v.string(),
    ownerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try by Skool group slug first
    const bySlug = await ctx.db
      .query("communities")
      .withIndex("by_skool_group", (q) =>
        q.eq("skoolGroupId", args.slug)
      )
      .first();

    if (bySlug) {
      if (args.ownerEmail && bySlug.ownerEmail !== args.ownerEmail) {
        return null;
      }
      return bySlug;
    }

    // Fallback: find by owner email (Slice 1: one community per user)
    if (args.ownerEmail) {
      return await ctx.db
        .query("communities")
        .withIndex("by_owner", (q) => q.eq("ownerEmail", args.ownerEmail!))
        .first();
    }

    return null;
  },
});
