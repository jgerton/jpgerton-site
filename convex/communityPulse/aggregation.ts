import { toMs, assignQuadrant, type ChurnRisk, type Quadrant } from "./scoring";

export interface MemberInput {
  skoolUserId: string;
}

export interface SnapshotInput {
  _id: string;
  skoolUserId: string;
  churnRisk: ChurnRisk;
}

export interface MemberPatch {
  postsAuthored: number;
  postsCommentedOn: number;
  lastActivityInCommunity: number | undefined;
  quadrant: Quadrant;
}

export interface SnapshotPatch {
  snapshotId: string;
  patch: MemberPatch;
}

export interface PostInput {
  skoolPostId: string;
  authorSkoolUserId: string;
  contributorIds: string[];
  createdAt: number;              // accepts ms or ns; normalized internally
  lastCommentAt?: number;         // accepts ms or ns
}

export interface MemberActivity {
  skoolUserId: string;
  postsAuthored: number;
  postsCommentedOn: number;
  lastActivityInCommunity: number | undefined;
}

export function aggregateMemberActivity(
  members: MemberInput[],
  posts: PostInput[],
): MemberActivity[] {
  const memberIds = new Set(members.map((m) => m.skoolUserId));

  const initial: Map<string, MemberActivity> = new Map(
    members.map((m) => [
      m.skoolUserId,
      {
        skoolUserId: m.skoolUserId,
        postsAuthored: 0,
        postsCommentedOn: 0,
        lastActivityInCommunity: undefined,
      },
    ]),
  );

  for (const p of posts) {
    const createdAtMs = toMs(p.createdAt);
    const lastCommentMs = toMs(p.lastCommentAt);

    // Author side
    if (memberIds.has(p.authorSkoolUserId)) {
      const row = initial.get(p.authorSkoolUserId)!;
      row.postsAuthored += 1;
      if (createdAtMs != null) {
        row.lastActivityInCommunity = maxDefined(
          row.lastActivityInCommunity,
          createdAtMs,
        );
      }
    }

    // Commenter side: contributors excluding the author
    const activityMs = lastCommentMs ?? createdAtMs;
    for (const contribId of p.contributorIds) {
      if (contribId === p.authorSkoolUserId) continue;
      if (!memberIds.has(contribId)) continue;
      const row = initial.get(contribId)!;
      row.postsCommentedOn += 1;
      if (activityMs != null) {
        row.lastActivityInCommunity = maxDefined(
          row.lastActivityInCommunity,
          activityMs,
        );
      }
    }
  }

  return Array.from(initial.values());
}

function maxDefined(a: number | undefined, b: number): number {
  return a == null ? b : Math.max(a, b);
}

/**
 * Compose aggregation + quadrant assignment into per-snapshot patches.
 * Pure: no DB access, no Date.now(). Pass `now` in from the caller.
 */
export function buildMemberPatches(
  snapshots: SnapshotInput[],
  posts: PostInput[],
  now: number,
): SnapshotPatch[] {
  const members: MemberInput[] = snapshots.map((s) => ({
    skoolUserId: s.skoolUserId,
  }));
  const activity = aggregateMemberActivity(members, posts);
  const byUserId = new Map(activity.map((a) => [a.skoolUserId, a]));

  return snapshots.map((snap) => {
    const a = byUserId.get(snap.skoolUserId);
    const postsAuthored = a?.postsAuthored ?? 0;
    const postsCommentedOn = a?.postsCommentedOn ?? 0;
    const lastActivityInCommunity = a?.lastActivityInCommunity;
    const quadrant = assignQuadrant({
      churnRisk: snap.churnRisk,
      lastActivityInCommunity,
      now,
    });
    return {
      snapshotId: snap._id,
      patch: {
        postsAuthored,
        postsCommentedOn,
        lastActivityInCommunity,
        quadrant,
      },
    };
  });
}
