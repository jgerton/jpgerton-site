/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { api, internal } from "../../_generated/api";

// convex-test's findModulesRoot extracts the prefix from the _generated path.
// From this file's location, Vite normalizes paths so _generated is at "../../_generated/"
// and sibling module files are at "../<name>.ts" instead of "../../communityPulse/<name>.ts".
// We remap the module keys so every path uses the "../../" prefix consistently.
const _rawModules = import.meta.glob("../../**/*.*s");
const modules = Object.fromEntries(
  Object.entries(_rawModules).map(([key, loader]) => {
    const remapped = key.startsWith("../") && !key.startsWith("../../")
      ? "../../communityPulse/" + key.slice("../".length)
      : key;
    return [remapped, loader];
  })
);

async function seedProfileWithPosts(t: ReturnType<typeof convexTest>, opts: { ownSkoolUserId?: string }) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { email: "jon@example.com" } as any);
    const profileId = await ctx.db.insert("pilotProfiles", {
      userId, email: "jon@example.com", firstName: "Jon", preferredName: "Jon",
      approvalStatus: "approved", createdAt: 0, updatedAt: 0,
      ownSkoolUserId: opts.ownSkoolUserId,
    });
    const communityId = await ctx.db.insert("communities", {
      skoolGroupId: "ycah", name: "YCAH", ownerEmail: "jon@example.com",
      edition: "pro", lastSyncedAt: Date.now(),
    });
    const mkPost = (authorId: string, i: number) =>
      ctx.db.insert("posts", {
        communityId, skoolPostId: `p${i}`, skoolGroupId: "ycah",
        authorSkoolUserId: authorId, postType: "generic",
        title: `post ${i}`, contributorIds: [], commentCount: 0, upvotes: 0,
        pinned: false, createdAt: i, syncedAt: Date.now(),
      });
    if (opts.ownSkoolUserId) {
      await mkPost(opts.ownSkoolUserId, 1);
      await mkPost(opts.ownSkoolUserId, 2);
    }
    await mkPost("other_1", 3);
    await mkPost("other_2", 4);
    await mkPost("other_3", 5);
    return { profileId };
  });
}

describe("getOwnPosts", () => {
  it("returns posts where authorSkoolUserId matches the pilot's ownSkoolUserId", async () => {
    const t = convexTest(schema, modules);
    const { profileId } = await seedProfileWithPosts(t, { ownSkoolUserId: "u_pilot" });
    const posts = await t.query(api.communityPulse.queries.getOwnPosts, { pilotProfileId: profileId });
    expect(posts).toHaveLength(2);
    expect(posts.every(p => p.authorSkoolUserId === "u_pilot")).toBe(true);
  });

  it("throws if pilotProfile has no ownSkoolUserId", async () => {
    const t = convexTest(schema, modules);
    const { profileId } = await seedProfileWithPosts(t, { ownSkoolUserId: undefined });
    await expect(
      t.query(api.communityPulse.queries.getOwnPosts, { pilotProfileId: profileId })
    ).rejects.toThrow(/ownSkoolUserId/);
  });
});

describe("saveVoiceProfile", () => {
  it("patches pilotProfiles with markdown, sourceCount, generatedAt, and resets approval to false", async () => {
    const t = convexTest(schema, modules);
    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { email: "jon@x.com" } as any);
      return ctx.db.insert("pilotProfiles", {
        userId, email: "jon@x.com", firstName: "Jon",
        preferredName: "Jon", approvalStatus: "approved",
        voiceProfileApproved: true,
        createdAt: 0, updatedAt: 0,
      });
    });
    await t.mutation(internal.communityPulse.voiceProfile.saveVoiceProfile, {
      pilotProfileId: profileId,
      markdown: "## Voice\n\nDirect.",
      sourceCount: 10,
      generatedAt: 123,
    });
    const patched = await t.run(async (ctx) => ctx.db.get(profileId));
    expect(patched?.voiceProfile).toBe("## Voice\n\nDirect.");
    expect(patched?.voiceProfileSourceCount).toBe(10);
    expect(patched?.voiceProfileGeneratedAt).toBe(123);
    expect(patched?.voiceProfileApproved).toBe(false);
  });
});

describe("approveVoiceProfile", () => {
  it("flips voiceProfileApproved to true for the authenticated owner", async () => {
    const t = convexTest(schema, modules);
    const { userId, profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { email: "jon@x.com" } as any);
      const profileId = await ctx.db.insert("pilotProfiles", {
        userId, email: "jon@x.com", firstName: "Jon", preferredName: "Jon",
        approvalStatus: "approved", createdAt: 0, updatedAt: 0,
        voiceProfileApproved: false,
      });
      return { userId, profileId };
    });
    const asUser = t.withIdentity({ subject: userId as unknown as string });
    await asUser.mutation(api.communityPulse.voiceProfile.approveVoiceProfile, { pilotProfileId: profileId });
    const patched = await t.run(async (ctx) => ctx.db.get(profileId));
    expect(patched?.voiceProfileApproved).toBe(true);
  });

  it("throws when caller is not the profile owner", async () => {
    const t = convexTest(schema, modules);
    const { otherUserId, profileId } = await t.run(async (ctx) => {
      const ownerId = await ctx.db.insert("users", { email: "owner@x.com" } as any);
      const otherUserId = await ctx.db.insert("users", { email: "other@x.com" } as any);
      const profileId = await ctx.db.insert("pilotProfiles", {
        userId: ownerId, email: "owner@x.com", firstName: "O", preferredName: "O",
        approvalStatus: "approved", createdAt: 0, updatedAt: 0,
      });
      return { otherUserId, profileId };
    });
    const asOther = t.withIdentity({ subject: otherUserId as unknown as string });
    await expect(
      asOther.mutation(api.communityPulse.voiceProfile.approveVoiceProfile, { pilotProfileId: profileId })
    ).rejects.toThrow(/Forbidden/);
  });
});
