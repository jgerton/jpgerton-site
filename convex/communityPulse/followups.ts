import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { verifyExtensionSession } from "./sessions";

const quadrantValidator = v.union(
  v.literal("ambassador"),
  v.literal("drifting"),
  v.literal("loyal"),
  v.literal("at_risk")
);

/**
 * Log an owner follow-up action against a specific member snapshot.
 * Append-only; no update. Use a second logFollowup call with `outcome`
 * to record what happened after the action.
 */
export const logFollowup = mutation({
  args: {
    sessionToken: v.string(),
    memberSnapshotId: v.id("memberSnapshots"),
    quadrant: quadrantValidator,
    action: v.string(),
    note: v.optional(v.string()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await verifyExtensionSession(ctx, args.sessionToken);

    const snapshot = await ctx.db.get(args.memberSnapshotId);
    if (!snapshot) {
      throw new Error("Member snapshot not found");
    }

    const community = await ctx.db.get(snapshot.communityId);
    if (!community) {
      throw new Error("Community not found for snapshot");
    }
    if (community.ownerEmail !== session.email) {
      throw new Error("Session does not own this member's community");
    }

    const actedAt = Date.now();
    const id = await ctx.db.insert("memberFollowups", {
      memberSnapshotId: args.memberSnapshotId,
      communityId: snapshot.communityId,
      skoolUserId: snapshot.skoolUserId,
      quadrant: args.quadrant,
      action: args.action,
      note: args.note,
      actedAt,
      outcome: args.outcome,
      outcomeAt: args.outcome ? actedAt : undefined,
    });

    return { followupId: id, actedAt };
  },
});
