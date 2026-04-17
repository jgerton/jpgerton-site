import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create an extension session for the currently authenticated website user.
 * Called from the /pilots/connect-extension page after the user signs in.
 * Uses getAuthUserId from @convex-dev/auth to get the authenticated user,
 * then looks up their pilotProfile by userId.
 */
export const createWebSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Look up pilotProfile by userId
    const profile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("No pilot profile found");
    }

    if (
      profile.approvalStatus !== "approved" &&
      profile.approvalStatus !== "auto-approved"
    ) {
      throw new Error("Profile not approved");
    }

    // Clean up existing sessions for this email
    const existing = await ctx.db
      .query("extensionSessions")
      .withIndex("by_email", (q) => q.eq("email", profile.email))
      .collect();

    for (const session of existing) {
      await ctx.db.delete(session._id);
    }

    // Create new session (7-day expiry)
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("extensionSessions", {
      token,
      email: profile.email,
      googleSub: userId,
      pilotProfileId: profile._id,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      sessionToken: token,
      profile: {
        email: profile.email,
        preferredName: profile.preferredName,
        communityName: profile.communityName,
      },
    };
  },
});
