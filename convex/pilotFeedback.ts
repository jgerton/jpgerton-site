import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getModuleFeedback = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotFeedback")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .first();
  },
});

export const submitModuleFeedback = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    readiness: v.union(
      v.literal("not-ready"),
      v.literal("getting-there"),
      v.literal("ready")
    ),
    whatLanded: v.optional(v.string()),
    whatsMissing: v.optional(v.string()),
    situation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotFeedback")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        readiness: args.readiness,
        whatLanded: args.whatLanded,
        whatsMissing: args.whatsMissing,
        situation: args.situation,
      });
      return existing._id;
    }

    return await ctx.db.insert("pilotFeedback", {
      userId,
      projectSlug: args.projectSlug,
      buildSlug: args.buildSlug,
      moduleSlug: args.moduleSlug,
      readiness: args.readiness,
      whatLanded: args.whatLanded,
      whatsMissing: args.whatsMissing,
      situation: args.situation,
      createdAt: Date.now(),
    });
  },
});

export const updateModuleFeedback = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    readiness: v.union(
      v.literal("not-ready"),
      v.literal("getting-there"),
      v.literal("ready")
    ),
    whatLanded: v.optional(v.string()),
    whatsMissing: v.optional(v.string()),
    situation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotFeedback")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .first();

    if (!existing) throw new Error("No feedback to update");

    await ctx.db.patch(existing._id, {
      readiness: args.readiness,
      whatLanded: args.whatLanded,
      whatsMissing: args.whatsMissing,
      situation: args.situation,
    });
  },
});

export const getMyUXFeedback = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotUXFeedback")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const submitUXFeedback = mutation({
  args: {
    navigation: v.optional(v.number()),
    readability: v.optional(v.number()),
    exerciseTools: v.optional(v.number()),
    openText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("pilotUXFeedback", {
      userId,
      navigation: args.navigation,
      readability: args.readability,
      exerciseTools: args.exerciseTools,
      openText: args.openText,
      createdAt: Date.now(),
    });
  },
});

export const updateUXFeedback = mutation({
  args: {
    navigation: v.optional(v.number()),
    readability: v.optional(v.number()),
    exerciseTools: v.optional(v.number()),
    openText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotUXFeedback")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existing) throw new Error("No UX feedback to update");

    await ctx.db.patch(existing._id, {
      navigation: args.navigation,
      readability: args.readability,
      exerciseTools: args.exerciseTools,
      openText: args.openText,
    });
  },
});
