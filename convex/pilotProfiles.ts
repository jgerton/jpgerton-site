import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.optional(v.string()),
    preferredName: v.string(),
    skoolUsername: v.optional(v.string()),
    communityUrl: v.optional(v.string()),
    communityName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user email from the auth users table
    const user = await ctx.db.get(userId);
    const userEmail = user?.email as string;
    if (!userEmail) throw new Error("No email found for user");

    // Check if profile already exists
    const existing = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;

    // Check YCAH membership
    const ycahMember = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", userEmail))
      .first();

    const approvalStatus = ycahMember ? "auto-approved" : "pending";

    return await ctx.db.insert("pilotProfiles", {
      userId,
      email: userEmail,
      firstName: args.firstName,
      lastName: args.lastName,
      preferredName: args.preferredName,
      skoolUsername: args.skoolUsername,
      communityUrl: args.communityUrl,
      communityName: args.communityName,
      approvalStatus,
      ycahMemberId: ycahMember ? String(ycahMember._id) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    preferredName: v.optional(v.string()),
    skoolUsername: v.optional(v.string()),
    communityUrl: v.optional(v.string()),
    communityName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("No profile found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.preferredName !== undefined) updates.preferredName = args.preferredName;
    if (args.skoolUsername !== undefined) updates.skoolUsername = args.skoolUsername;
    if (args.communityUrl !== undefined) updates.communityUrl = args.communityUrl;
    if (args.communityName !== undefined) updates.communityName = args.communityName;

    await ctx.db.patch(profile._id, updates);
  },
});
