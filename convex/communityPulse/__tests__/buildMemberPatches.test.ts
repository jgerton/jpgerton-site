import { describe, it, expect } from "vitest";
import { buildMemberPatches } from "../aggregation";
import type { PostInput, SnapshotInput } from "../aggregation";

const NOW = new Date("2026-04-17T00:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function snap(
  overrides: Partial<SnapshotInput> & { id: string; skoolUserId: string; churnRisk: SnapshotInput["churnRisk"] }
): SnapshotInput {
  return {
    _id: overrides.id,
    skoolUserId: overrides.skoolUserId,
    churnRisk: overrides.churnRisk,
  };
}

function post(overrides: Partial<PostInput> & { id: string; author: string }): PostInput {
  return {
    skoolPostId: overrides.id,
    authorSkoolUserId: overrides.author,
    contributorIds: overrides.contributorIds ?? [overrides.author],
    createdAt: overrides.createdAt ?? NOW - 5 * DAY_MS,
    lastCommentAt: overrides.lastCommentAt,
  };
}

describe("buildMemberPatches", () => {
  it("returns one patch per snapshot, in the same order", () => {
    const snapshots = [
      snap({ id: "s1", skoolUserId: "alice", churnRisk: "low" }),
      snap({ id: "s2", skoolUserId: "bob", churnRisk: "high" }),
    ];
    const result = buildMemberPatches(snapshots, [], NOW);
    expect(result.map((r) => r.snapshotId)).toEqual(["s1", "s2"]);
  });

  it("assigns at_risk when no posts and member is Skool-inactive", () => {
    const snapshots = [
      snap({ id: "s1", skoolUserId: "alice", churnRisk: "high" }),
    ];
    const result = buildMemberPatches(snapshots, [], NOW);
    expect(result[0]!.patch).toEqual({
      postsAuthored: 0,
      postsCommentedOn: 0,
      lastActivityInCommunity: undefined,
      quadrant: "at_risk",
    });
  });

  it("assigns drifting when Skool-active but never contributed", () => {
    const snapshots = [
      snap({ id: "s1", skoolUserId: "alice", churnRisk: "low" }),
    ];
    const result = buildMemberPatches(snapshots, [], NOW);
    expect(result[0]!.patch.quadrant).toBe("drifting");
  });

  it("assigns ambassador when Skool-active and recent community activity", () => {
    const snapshots = [
      snap({ id: "s1", skoolUserId: "alice", churnRisk: "low" }),
    ];
    const posts = [post({ id: "p1", author: "alice", createdAt: NOW - 2 * DAY_MS })];
    const result = buildMemberPatches(snapshots, posts, NOW);
    expect(result[0]!.patch.postsAuthored).toBe(1);
    expect(result[0]!.patch.quadrant).toBe("ambassador");
  });

  it("assigns loyal when Skool-inactive but recent community activity", () => {
    const snapshots = [
      snap({ id: "s1", skoolUserId: "alice", churnRisk: "high" }),
    ];
    const posts = [
      post({
        id: "p1",
        author: "bob",
        contributorIds: ["bob", "alice"],
        createdAt: NOW - 10 * DAY_MS,
        lastCommentAt: NOW - 3 * DAY_MS,
      }),
    ];
    const result = buildMemberPatches(snapshots, posts, NOW);
    expect(result[0]!.patch.postsCommentedOn).toBe(1);
    expect(result[0]!.patch.quadrant).toBe("loyal");
  });

  it("handles a full 10-member / 5-post scenario", () => {
    const ids = ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10"];
    const snapshots = ids.map((u, i) =>
      snap({
        id: `snap-${u}`,
        skoolUserId: u,
        churnRisk: i < 5 ? "low" : "high",
      })
    );
    const posts = [
      post({ id: "p1", author: "m01", createdAt: NOW - 1 * DAY_MS }),
      post({
        id: "p2",
        author: "m02",
        contributorIds: ["m02", "m03", "m06"],
        createdAt: NOW - 5 * DAY_MS,
        lastCommentAt: NOW - 1 * DAY_MS,
      }),
      post({ id: "p3", author: "m04", createdAt: NOW - 30 * DAY_MS }),
      post({
        id: "p4",
        author: "m07",
        contributorIds: ["m07", "m08"],
        createdAt: NOW - 60 * DAY_MS,
        lastCommentAt: NOW - 60 * DAY_MS,
      }),
      post({
        id: "p5",
        author: "m09",
        contributorIds: ["m09"],
        createdAt: NOW - 5 * DAY_MS,
      }),
    ];
    const result = buildMemberPatches(snapshots, posts, NOW);
    expect(result).toHaveLength(10);

    const byUser = Object.fromEntries(
      snapshots.map((s, i) => [s.skoolUserId, result[i]!.patch])
    );
    expect(byUser.m01!.quadrant).toBe("ambassador"); // low + recent authored
    expect(byUser.m02!.quadrant).toBe("ambassador"); // low + recent author
    expect(byUser.m03!.quadrant).toBe("ambassador"); // low + recent comment
    expect(byUser.m04!.quadrant).toBe("drifting");   // low + 30d old authored
    expect(byUser.m05!.quadrant).toBe("drifting");   // low + no activity
    expect(byUser.m06!.quadrant).toBe("loyal");      // high + recent comment on p2
    expect(byUser.m07!.quadrant).toBe("at_risk");    // high + 60d old authored
    expect(byUser.m08!.quadrant).toBe("at_risk");    // high + 60d old comment
    expect(byUser.m09!.quadrant).toBe("loyal");      // high + 5d authored
    expect(byUser.m10!.quadrant).toBe("at_risk");    // high + no activity
  });

  it("normalizes ns timestamps from raw Skool inputs", () => {
    const snapshots = [snap({ id: "s1", skoolUserId: "alice", churnRisk: "low" })];
    const posts = [
      {
        skoolPostId: "p1",
        authorSkoolUserId: "alice",
        contributorIds: ["alice"],
        createdAt: (NOW - 2 * DAY_MS) * 1_000_000,
      } as PostInput,
    ];
    const result = buildMemberPatches(snapshots, posts, NOW);
    expect(result[0]!.patch.lastActivityInCommunity).toBe(NOW - 2 * DAY_MS);
    expect(result[0]!.patch.quadrant).toBe("ambassador");
  });
});
