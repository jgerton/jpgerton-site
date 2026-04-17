import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * One-off migration: populate the Slice 2 fields on any memberSnapshot that
 * predates the schema extension. Idempotent — skips rows that already have
 * `quadrant` set. Safe to re-run. Delete after it has been run against every
 * deployment.
 */
export const backfillQuadrants = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const snapshots = await ctx.db.query("memberSnapshots").collect();

    let patched = 0;
    for (const snap of snapshots) {
      if (snap.quadrant != null) continue;
      await ctx.db.patch(snap._id, {
        postsAuthored: 0,
        postsCommentedOn: 0,
        lastActivityInCommunity: undefined,
        quadrant: "at_risk" as const,
      });
      patched += 1;
    }

    return {
      totalSnapshots: snapshots.length,
      patched,
      skipped: snapshots.length - patched,
    };
  },
});
