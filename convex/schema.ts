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

  // --- Community Pulse tables (Slice 1) ---
  communities: defineTable({
    skoolGroupId: v.string(),
    name: v.string(),
    ownerEmail: v.string(),
    edition: v.union(v.literal("builder"), v.literal("pro")),
    lastSyncedAt: v.number(),
  })
    .index("by_skool_group", ["skoolGroupId"])
    .index("by_owner", ["ownerEmail"]),

  memberSnapshots: defineTable({
    communityId: v.id("communities"),
    skoolUserId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    engagementScore: v.number(),
    actStatus: v.optional(v.string()),
    lastOffline: v.optional(v.number()),
    points: v.number(),
    level: v.number(),
    attrComp: v.optional(v.string()),
    attrSrcComp: v.optional(v.string()),
    requestLocation: v.optional(v.string()),
    churnRisk: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    snapshotDate: v.number(),
    // Slice 2: community-specific activity + 2x2 quadrant.
    // Optional during migration; populated by backfillQuadrants and then by
    // syncCommunityActivity on every subsequent sync.
    postsAuthored: v.optional(v.number()),
    postsCommentedOn: v.optional(v.number()),
    lastActivityInCommunity: v.optional(v.number()),
    quadrant: v.optional(
      v.union(
        v.literal("ambassador"),
        v.literal("drifting"),
        v.literal("loyal"),
        v.literal("at_risk")
      )
    ),
  })
    .index("by_community", ["communityId"])
    .index("by_community_date", ["communityId", "snapshotDate"])
    .index("by_churn_risk", ["communityId", "churnRisk"])
    .index("by_community_quadrant", ["communityId", "quadrant"]),

  // Slice 2: raw community-feed posts. One row per Skool post per community.
  // Rewritten on each sync; contributor list and comment counts are refreshed.
  posts: defineTable({
    communityId: v.id("communities"),
    skoolPostId: v.string(),
    skoolGroupId: v.string(),
    authorSkoolUserId: v.string(),
    postType: v.string(),
    labelId: v.optional(v.string()),
    title: v.string(),
    contributorIds: v.array(v.string()),
    commentCount: v.number(),
    upvotes: v.number(),
    pinned: v.boolean(),
    createdAt: v.number(),              // ms
    lastCommentAt: v.optional(v.number()), // ms
    syncedAt: v.number(),
  })
    .index("by_community_created", ["communityId", "createdAt"])
    .index("by_community_author", ["communityId", "authorSkoolUserId"])
    .index("by_community_post", ["communityId", "skoolPostId"]),

  // Slice 2: follow-up CRM. Append-only log of owner actions per member.
  memberFollowups: defineTable({
    memberSnapshotId: v.id("memberSnapshots"),
    communityId: v.id("communities"),
    skoolUserId: v.string(),
    quadrant: v.union(
      v.literal("ambassador"),
      v.literal("drifting"),
      v.literal("loyal"),
      v.literal("at_risk")
    ),
    action: v.string(),
    note: v.optional(v.string()),
    actedAt: v.number(),
    outcome: v.optional(v.string()),
    outcomeAt: v.optional(v.number()),
  })
    .index("by_member", ["skoolUserId", "communityId"])
    .index("by_community_acted", ["communityId", "actedAt"]),

  extensionSessions: defineTable({
    token: v.string(),
    email: v.string(),
    googleSub: v.string(),
    pilotProfileId: v.optional(v.id("pilotProfiles")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),
});
