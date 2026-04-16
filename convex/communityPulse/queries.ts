import { query } from "../_generated/server";
import { v } from "convex/values";

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

    return {
      communityName: community.name,
      totalMembers,
      activeMembers,
      atRiskCount,
      watchCount,
      engagementRate,
      lastSyncedAt: community.lastSyncedAt,
    };
  },
});

export const getCommunityBySlug = query({
  args: {
    slug: v.string(),
    ownerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_skool_group", (q) =>
        q.eq("skoolGroupId", args.slug)
      )
      .first();
    return community;
  },
});
