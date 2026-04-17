import { toMs } from "./scoring";

export interface MemberInput {
  skoolUserId: string;
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
