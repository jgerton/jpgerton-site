import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  pilotProjects: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("active"), v.literal("coming-soon"), v.literal("archived")),
  }).index("by_slug", ["slug"]),
  pilotBuilds: defineTable({
    projectSlug: v.string(),
    buildSlug: v.string(),
    title: v.string(),
    contentPath: v.string(),
    order: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
  })
    .index("by_project", ["projectSlug"])
    .index("by_slugs", ["projectSlug", "buildSlug"]),
});
