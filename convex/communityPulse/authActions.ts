import { httpAction, internalMutation } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const extensionLogin = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json();
  const { accessToken } = body as { accessToken: string };

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Missing accessToken" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate Google access token
  const googleRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!googleRes.ok) {
    return new Response(
      JSON.stringify({ error: "Invalid Google token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const googleUser = (await googleRes.json()) as {
    sub: string;
    email: string;
    name: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };

  // Look up pilotProfile by email
  const profile = await ctx.runQuery(api.pilotProfiles.getByEmail, {
    email: googleUser.email,
  });

  if (!profile) {
    return new Response(
      JSON.stringify({
        error: "No pilot profile found",
        message: "Sign up at jpgerton.com/pilots first",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (
    profile.approvalStatus !== "approved" &&
    profile.approvalStatus !== "auto-approved"
  ) {
    return new Response(
      JSON.stringify({
        error: "Profile not approved",
        status: profile.approvalStatus,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create extension session (7 day expiry)
  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await ctx.runMutation(internal.communityPulse.authActions.createSession, {
    token,
    email: googleUser.email,
    googleSub: googleUser.sub,
    pilotProfileId: profile._id,
    expiresAt,
  });

  return new Response(
    JSON.stringify({
      sessionToken: token,
      profile: {
        email: profile.email,
        preferredName: profile.preferredName,
        communityName: profile.communityName,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

export const createSession = internalMutation({
  args: {
    token: v.string(),
    email: v.string(),
    googleSub: v.string(),
    pilotProfileId: v.id("pilotProfiles"),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Remove existing sessions for this email (one session per user)
    const existing = await ctx.db
      .query("extensionSessions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    for (const session of existing) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.insert("extensionSessions", {
      token: args.token,
      email: args.email,
      googleSub: args.googleSub,
      pilotProfileId: args.pilotProfileId,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});
