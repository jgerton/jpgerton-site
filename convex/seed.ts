import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedProject = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("active"), v.literal("coming-soon"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pilotProjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("pilotProjects", args);
  },
});

export const seedBuild = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    title: v.string(),
    contentPath: v.string(),
    order: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pilotBuilds")
      .withIndex("by_slugs", (q) =>
        q.eq("projectSlug", args.projectSlug).eq("buildSlug", args.buildSlug)
      )
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("pilotBuilds", args);
  },
});
