import { describe, it, expect } from "vitest";
import { aggregateMemberActivity } from "../aggregation";
import type { PostInput, MemberInput } from "../aggregation";

const NOW = new Date("2026-04-17T00:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

const m = (id: string): MemberInput => ({ skoolUserId: id });

function post(overrides: Partial<PostInput> & { id: string; author: string }): PostInput {
  return {
    skoolPostId: overrides.id,
    authorSkoolUserId: overrides.author,
    contributorIds: overrides.contributorIds ?? [overrides.author],
    createdAt: overrides.createdAt ?? NOW - 5 * DAY_MS,
    lastCommentAt: overrides.lastCommentAt,
  };
}

describe("aggregateMemberActivity", () => {
  it("returns zero counts for an empty posts list", () => {
    const result = aggregateMemberActivity([m("alice"), m("bob")], []);
    expect(result).toEqual([
      {
        skoolUserId: "alice",
        postsAuthored: 0,
        postsCommentedOn: 0,
        lastActivityInCommunity: undefined,
      },
      {
        skoolUserId: "bob",
        postsAuthored: 0,
        postsCommentedOn: 0,
        lastActivityInCommunity: undefined,
      },
    ]);
  });

  it("counts posts authored by a member and uses createdAt as activity", () => {
    const result = aggregateMemberActivity(
      [m("alice")],
      [post({ id: "p1", author: "alice", createdAt: NOW - 3 * DAY_MS })]
    );
    expect(result[0]).toEqual({
      skoolUserId: "alice",
      postsAuthored: 1,
      postsCommentedOn: 0,
      lastActivityInCommunity: NOW - 3 * DAY_MS,
    });
  });

  it("does NOT count an authored post in postsCommentedOn when the author is in contributors", () => {
    // Skool's contributors array includes the author. Must subtract own posts.
    const result = aggregateMemberActivity(
      [m("alice")],
      [
        post({
          id: "p1",
          author: "alice",
          contributorIds: ["alice", "bob"],
          createdAt: NOW - 3 * DAY_MS,
        }),
      ]
    );
    expect(result[0]!.postsAuthored).toBe(1);
    expect(result[0]!.postsCommentedOn).toBe(0);
  });

  it("counts a member as a commenter only when they are in contributors and not the author", () => {
    const result = aggregateMemberActivity(
      [m("alice"), m("bob")],
      [
        post({
          id: "p1",
          author: "alice",
          contributorIds: ["alice", "bob"],
          createdAt: NOW - 3 * DAY_MS,
          lastCommentAt: NOW - 1 * DAY_MS,
        }),
      ]
    );
    const alice = result.find((r) => r.skoolUserId === "alice")!;
    const bob = result.find((r) => r.skoolUserId === "bob")!;
    expect(alice.postsAuthored).toBe(1);
    expect(alice.postsCommentedOn).toBe(0);
    expect(bob.postsAuthored).toBe(0);
    expect(bob.postsCommentedOn).toBe(1);
    expect(bob.lastActivityInCommunity).toBe(NOW - 1 * DAY_MS);
  });

  it("falls back to post.createdAt when lastCommentAt is missing but member is a commenter", () => {
    const result = aggregateMemberActivity(
      [m("bob")],
      [
        post({
          id: "p1",
          author: "alice",
          contributorIds: ["alice", "bob"],
          createdAt: NOW - 5 * DAY_MS,
        }),
      ]
    );
    expect(result[0]!.postsCommentedOn).toBe(1);
    expect(result[0]!.lastActivityInCommunity).toBe(NOW - 5 * DAY_MS);
  });

  it("picks the most recent activity across multiple posts", () => {
    const result = aggregateMemberActivity(
      [m("alice")],
      [
        post({ id: "p1", author: "alice", createdAt: NOW - 10 * DAY_MS }),
        post({ id: "p2", author: "alice", createdAt: NOW - 2 * DAY_MS }),
        post({
          id: "p3",
          author: "bob",
          contributorIds: ["bob", "alice"],
          createdAt: NOW - 20 * DAY_MS,
          lastCommentAt: NOW - 1 * DAY_MS,
        }),
      ]
    );
    const alice = result[0]!;
    expect(alice.postsAuthored).toBe(2);
    expect(alice.postsCommentedOn).toBe(1);
    expect(alice.lastActivityInCommunity).toBe(NOW - 1 * DAY_MS);
  });

  it("ignores contributor IDs that are not in the members list", () => {
    const result = aggregateMemberActivity(
      [m("alice")],
      [
        post({
          id: "p1",
          author: "ghost",
          contributorIds: ["ghost", "alice", "other-non-member"],
          createdAt: NOW - 3 * DAY_MS,
          lastCommentAt: NOW - 1 * DAY_MS,
        }),
      ]
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.skoolUserId).toBe("alice");
    expect(result[0]!.postsCommentedOn).toBe(1);
  });

  it("normalizes nanosecond timestamps in post fields", () => {
    const nsCreatedAt = (NOW - 4 * DAY_MS) * 1_000_000;
    const nsLastComment = (NOW - 1 * DAY_MS) * 1_000_000;
    const result = aggregateMemberActivity(
      [m("alice"), m("bob")],
      [
        {
          skoolPostId: "p1",
          authorSkoolUserId: "alice",
          contributorIds: ["alice", "bob"],
          createdAt: nsCreatedAt,
          lastCommentAt: nsLastComment,
        },
      ]
    );
    const alice = result.find((r) => r.skoolUserId === "alice")!;
    const bob = result.find((r) => r.skoolUserId === "bob")!;
    expect(alice.lastActivityInCommunity).toBe(NOW - 4 * DAY_MS);
    expect(bob.lastActivityInCommunity).toBe(NOW - 1 * DAY_MS);
  });

  it("returns undefined lastActivityInCommunity for a member with no posts or comments", () => {
    const result = aggregateMemberActivity(
      [m("alice"), m("bob")],
      [post({ id: "p1", author: "alice", createdAt: NOW - 3 * DAY_MS })]
    );
    const bob = result.find((r) => r.skoolUserId === "bob")!;
    expect(bob.postsAuthored).toBe(0);
    expect(bob.postsCommentedOn).toBe(0);
    expect(bob.lastActivityInCommunity).toBeUndefined();
  });
});
