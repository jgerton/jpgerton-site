import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateScreen = mutation({
  args: { screen: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastScreenSeen: args.screen });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        lastScreenSeen: args.screen,
      });
    }
  },
});

export const complete = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completedAt: Date.now(),
        lastScreenSeen: 3,
      });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        completedAt: Date.now(),
        lastScreenSeen: 3,
      });
    }
  },
});

export const skip = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { skippedAt: Date.now() });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        skippedAt: Date.now(),
        lastScreenSeen: 1,
      });
    }
  },
});
