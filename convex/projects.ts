import { query } from "./_generated/server";
import { v } from "convex/values";

export const listActiveProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pilotProjects")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getProject = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pilotProjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getBuildsForProject = query({
  args: { projectSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pilotBuilds")
      .withIndex("by_project", (q) => q.eq("projectSlug", args.projectSlug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();
  },
});

export const getBuild = query({
  args: { projectSlug: v.string(), buildSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pilotBuilds")
      .withIndex("by_slugs", (q) =>
        q.eq("projectSlug", args.projectSlug).eq("buildSlug", args.buildSlug)
      )
      .first();
  },
});
