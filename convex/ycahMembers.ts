// convex/ycahMembers.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const syncFromWebhook = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    communityUrl: v.optional(v.string()),
    source: v.optional(v.string()),
    skoolTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        skoolName: args.name,
        communityUrl: args.communityUrl,
        source: args.source,
        syncedAt: Date.now(),
      });
      return existing._id;
    }

    const id = await ctx.db.insert("ycahMembers", {
      email: args.email,
      skoolName: args.name,
      communityUrl: args.communityUrl,
      source: args.source,
      skoolTransactionId: args.skoolTransactionId,
      syncedAt: Date.now(),
      syncSource: "zapier",
    });

    // Auto-approve any pending pilot profiles with this email
    const pendingProfile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (pendingProfile && pendingProfile.approvalStatus === "pending") {
      await ctx.db.patch(pendingProfile._id, {
        approvalStatus: "auto-approved",
        updatedAt: Date.now(),
      });
    }

    return id;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return member ? { isMember: true } : null;
  },
});

export const addManual = mutation({
  args: {
    email: v.string(),
    skoolName: v.string(),
    communityUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("ycahMembers", {
      email: args.email,
      skoolName: args.skoolName,
      communityUrl: args.communityUrl,
      skoolTransactionId: "manual",
      syncedAt: Date.now(),
      syncSource: "manual",
    });
  },
});
