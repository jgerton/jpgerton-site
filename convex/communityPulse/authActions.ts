import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create an extension session for the currently authenticated website user.
 * Called from the /pilots/connect-extension page after the user signs in.
 */
export const createWebSession = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("No email in identity");
    }

    // Look up pilotProfile by email
    const profile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
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
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    for (const session of existing) {
      await ctx.db.delete(session._id);
    }

    // Create new session (7-day expiry)
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("extensionSessions", {
      token,
      email,
      googleSub: identity.subject ?? "",
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
