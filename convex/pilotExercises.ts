import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getExerciseResponse = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .first();
  },
});

export const getBuildExercises = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_project", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
      )
      .collect();
  },
});

export const saveResponse = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    exerciseId: v.string(),
    response: v.string(),
    channel: v.union(
      v.literal("web"),
      v.literal("email"),
      v.literal("sheets")
    ),
    status: v.union(v.literal("draft"), v.literal("submitted")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        response: args.response,
        channel: args.channel,
        status: args.status,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("pilotExerciseResponses", {
      userId,
      projectSlug: args.projectSlug,
      buildSlug: args.buildSlug,
      exerciseId: args.exerciseId,
      response: args.response,
      channel: args.channel,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
