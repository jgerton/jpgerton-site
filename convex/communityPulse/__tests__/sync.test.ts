/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { api } from "../../_generated/api";

// convex-test's findModulesRoot extracts the prefix from the _generated path.
// From this file's location, Vite normalizes paths so _generated is at "../../_generated/"
// and sibling module files are at "../<name>.ts" instead of "../../communityPulse/<name>.ts".
// We remap the module keys so every path uses the "../../" prefix consistently.
const _rawModules = import.meta.glob("../../**/*.*s");
const modules = Object.fromEntries(
  Object.entries(_rawModules).map(([key, loader]) => {
    // ../foo.ts -> ../../communityPulse/foo.ts
    const remapped = key.startsWith("../") && !key.startsWith("../../")
      ? "../../communityPulse/" + key.slice("../".length)
      : key;
    return [remapped, loader];
  })
);

async function seedPilotSession(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { email: "jon@example.com" } as any);
    const profileId = await ctx.db.insert("pilotProfiles", {
      userId, email: "jon@example.com", firstName: "Jon", preferredName: "Jon",
      approvalStatus: "approved", createdAt: 0, updatedAt: 0,
    });
    await ctx.db.insert("extensionSessions", {
      token: "fake-token", email: "jon@example.com", googleSub: userId,
      pilotProfileId: profileId, expiresAt: Date.now() + 60_000, createdAt: Date.now(),
    });
    return { userId, profileId };
  });
}

describe("syncMembers — pilotProfile identity backfill", () => {
  it("patches ownSkoolUserId and ownSkoolUserName onto the pilot's profile", async () => {
    const t = convexTest(schema, modules);
    await seedPilotSession(t);
    await t.mutation(api.communityPulse.sync.syncMembers, {
      sessionToken: "fake-token",
      communitySlug: "ycah",
      communityName: "YCAH",
      ownSkoolUserId: "u_pilot123",
      ownSkoolUserName: "jon-gerton",
      members: [],
    });
    const profile = await t.run(async (ctx) =>
      ctx.db
        .query("pilotProfiles")
        .withIndex("by_email", (q) => q.eq("email", "jon@example.com"))
        .first()
    );
    expect(profile?.ownSkoolUserId).toBe("u_pilot123");
    expect(profile?.ownSkoolUserName).toBe("jon-gerton");
  });

  it("does not overwrite ownSkoolUserId if already set", async () => {
    const t = convexTest(schema, modules);
    const { profileId } = await seedPilotSession(t);
    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, {
        ownSkoolUserId: "u_pre_existing",
        ownSkoolUserName: "pre-existing",
      });
    });
    await t.mutation(api.communityPulse.sync.syncMembers, {
      sessionToken: "fake-token",
      communitySlug: "ycah",
      communityName: "YCAH",
      ownSkoolUserId: "u_new_value",
      ownSkoolUserName: "new-value",
      members: [],
    });
    const profile = await t.run(async (ctx) => ctx.db.get(profileId));
    expect(profile?.ownSkoolUserId).toBe("u_pre_existing");
    expect(profile?.ownSkoolUserName).toBe("pre-existing");
  });

  it("patches ownSkoolUserId alone when ownSkoolUserName is omitted", async () => {
    const t = convexTest(schema, modules);
    await seedPilotSession(t);
    await t.mutation(api.communityPulse.sync.syncMembers, {
      sessionToken: "fake-token",
      communitySlug: "ycah",
      communityName: "YCAH",
      ownSkoolUserId: "u_pilot123",
      // no ownSkoolUserName
      members: [],
    });
    const profile = await t.run(async (ctx) =>
      ctx.db
        .query("pilotProfiles")
        .withIndex("by_email", (q) => q.eq("email", "jon@example.com"))
        .first()
    );
    expect(profile?.ownSkoolUserId).toBe("u_pilot123");
    expect(profile?.ownSkoolUserName).toBeUndefined();
  });

  it("stores skoolName on each memberSnapshot", async () => {
    const t = convexTest(schema, modules);
    await seedPilotSession(t);
    await t.mutation(api.communityPulse.sync.syncMembers, {
      sessionToken: "fake-token",
      communitySlug: "ycah",
      communityName: "YCAH",
      members: [
        {
          skoolUserId: "u_member1",
          firstName: "Judy",
          lastName: "Lee",
          skoolName: "judy-lee",
          points: 100,
          level: 3,
        },
      ],
    });
    const snap = await t.run(async (ctx) =>
      ctx.db.query("memberSnapshots").first()
    );
    expect(snap?.skoolName).toBe("judy-lee");
  });
});
