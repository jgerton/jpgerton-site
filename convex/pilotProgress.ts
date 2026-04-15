import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getModuleProgress = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .collect();
  },
});

export const getBuildProgress = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
      )
      .collect();
  },
});

export const markSectionVisited = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastVisitedAt: Date.now() });
    } else {
      await ctx.db.insert("pilotProgress", {
        userId,
        projectSlug: args.projectSlug,
        buildSlug: args.buildSlug,
        moduleSlug: args.moduleSlug,
        sectionId: args.sectionId,
        firstVisitedAt: Date.now(),
        lastVisitedAt: Date.now(),
      });
    }
  },
});
