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
  ycahMembers: defineTable({
    email: v.string(),
    skoolName: v.string(),
    communityUrl: v.optional(v.string()),
    source: v.optional(v.string()),
    skoolTransactionId: v.string(),
    syncedAt: v.number(),
    syncSource: v.union(v.literal("zapier"), v.literal("manual")),
  }).index("by_email", ["email"]),
  pilotProfiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    preferredName: v.string(),
    skoolUsername: v.optional(v.string()),
    communityUrl: v.optional(v.string()),
    communityName: v.optional(v.string()),
    approvalStatus: v.union(
      v.literal("auto-approved"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("revoked")
    ),
    ycahMemberId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["approvalStatus"]),
  pilotOnboarding: defineTable({
    userId: v.id("users"),
    completedAt: v.optional(v.number()),
    skippedAt: v.optional(v.number()),
    lastScreenSeen: v.number(),
  }).index("by_userId", ["userId"]),
  pilotProgress: defineTable({
    userId: v.id("users"),
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    sectionId: v.string(),
    firstVisitedAt: v.number(),
    lastVisitedAt: v.number(),
  }).index("by_user_module", [
    "userId",
    "projectSlug",
    "buildSlug",
    "moduleSlug",
  ]),
  pilotExerciseResponses: defineTable({
    userId: v.id("users"),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_exercise", ["userId", "exerciseId"])
    .index("by_user_project", ["userId", "projectSlug", "buildSlug"]),
  pilotFeedback: defineTable({
    userId: v.id("users"),
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
    createdAt: v.number(),
  }).index("by_user_module", [
    "userId",
    "projectSlug",
    "buildSlug",
    "moduleSlug",
  ]),
  pilotUXFeedback: defineTable({
    userId: v.id("users"),
    navigation: v.optional(v.number()),
    readability: v.optional(v.number()),
    exerciseTools: v.optional(v.number()),
    openText: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
