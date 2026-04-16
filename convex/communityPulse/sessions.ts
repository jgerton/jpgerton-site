import { QueryCtx, MutationCtx } from "../_generated/server";

export async function verifyExtensionSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string
) {
  const session = await ctx.db
    .query("extensionSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session) {
    throw new Error("Invalid session token");
  }

  if (session.expiresAt < Date.now()) {
    throw new Error("Session expired");
  }

  return session;
}
