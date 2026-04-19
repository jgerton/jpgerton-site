# Community Pulse Slice 3: Draft Foundations + Voice Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AI drafting foundation — provider adapter, prompt assembly, voice profile extractor, and 15-test anti-slop + voice validator — and prove the full pipeline end-to-end by generating two sample drafts (one DM, one post reply) that Jon approves.

**Spec anchors:**
- Roadmap: `E:/Projects/community-pulse/ROADMAP.md` (Slice 3 section + Done criteria)
- Session retro: `E:/Vault/sessions/2026-04-18-community-pulse-cutover-and-v1-roadmap.md`
- Voice profile insight: `E:/Vault/insights/2026-04-18-voice-profile-from-synced-corpus.md`
- Anti-slop tests 9-15: `C:/Users/jonge/.claude/references/anti-slop-english.md`
- Voice calibration tests 1-8: `C:/Users/jonge/.claude/references/voice-calibration.md`
- Slice 2 plan for format reference: `E:/Projects/jpgerton-site/docs/superpowers/plans/2026-04-17-community-pulse-slice-2.md`

**Architecture:**
- A new **`packages/core/src/drafting/`** module houses all pure logic: types, prompt assembly, validator (regex + LLM-judge dispatch), retry-prompt builder, voice profile extractor. No provider calls, no DOM, no Convex imports. Fully unit-testable.
- A new **provider adapter** abstraction (`Provider` interface) lives alongside drafting. Three concrete adapters: `OpenRouterProvider`, `AnthropicProvider`, `OpenAIProvider`. Each implements `complete({ model, system, user, temperature }) => { text, usage }`.
- **Pro edition wiring:** a Convex `action` calls `OpenRouterProvider` server-side with `process.env.OPENROUTER_API_KEY`, runs validator, auto-retries once, returns the draft + validator report.
- **Builder edition wiring:** adapter is callable client-side with a BYO API key from `chrome.storage.local`. Slice 3 does not ship a Builder UI; adapter is validated via unit tests against a second provider (Anthropic Haiku 4.5 or OpenAI GPT-4o-mini) to satisfy the "2 providers" DoD.
- **Voice profile** is generated from posts already in the `posts` table, filtered by the pilot's `ownSkoolUserId`. A one-shot action calls the provider with the pilot's posts and a structured extraction prompt, saving markdown-format `voiceProfile` to `pilotProfiles`.
- **Schema prep** lands in Phase 1: `ownSkoolUserId` + voice-profile fields on `pilotProfiles`, `skoolName` on `memberSnapshots`.

**Tech Stack:** Convex v1.x, Next.js 16, WXT, React 19, TypeScript, Vitest, OpenRouter (primary provider), Anthropic SDK (@anthropic-ai/sdk), OpenAI SDK (openai).

---

## Verified field names

Captured in Slice 2 research on 2026-04-17 on a logged-in YCAH feed page:

- `pageProps.self` is a full `SkoolUser` record for the logged-in user, available on BOTH the members page and the community feed page. Fields: `self.id` (Skool user ID), `self.name` (slug), `self.firstName`, `self.lastName`, `self.metadata.pictureProfile`, etc.
- `pageProps.currentGroup` is also present with the current community's `id`, `name`, `slug` — useful as a cross-check for `communitySlug`.
- Members page users array: each user has `user.name` (display slug like `jon-gerton`) separate from `user.firstName`/`user.lastName`. This is what goes into Skool profile URLs (`skool.com/@<name>`).

**Pre-Task-1 verification (Jon runs once):** on a logged-in YCAH members page, open DevTools console and run:

```js
const d = JSON.parse(document.getElementById("__NEXT_DATA__").textContent);
console.log("self.id:", d.props.pageProps.self?.id);
console.log("self.name:", d.props.pageProps.self?.name);
console.log("first user.name:", d.props.pageProps.users?.[0]?.name);
```

Paste output here before implementing Task 1.2. If `self.id` is undefined on members page (was only observed on feed), move the capture point into the community-feed content-script path instead.

**Captured values (2026-04-19, logged-in YCAH members page):**
- `self.id`: `b9bff32eede7463d97dea5564d09eb2c` (32-char hex; same shape as `users[].id` so the index join in `posts.by_community_author` works without format conversion)
- `self.name`: `jon-gerton-9814` (URL slug form with numeric suffix — this is what goes into `skool.com/@<name>` profile URLs, so it's the correct value for `pilotProfiles.ownSkoolUserName`)
- first `users[].name`: `judiee` (URL slug form; confirms `user.name` on the members array is the slug, consistent with how `self.name` is shaped)

Conclusions:
- Task 1.5 `extractMemberData` must map `user.name` onto each `skoolName` field unchanged (slug format, no transformation needed).
- `pageProps.self` IS present on the members page — no need to fall back to capturing from the feed page.
- Task 1.1 is complete. Phase 1 implementation can proceed.

---

## File Structure

### New Files (community-pulse)

```
packages/core/src/drafting/
  index.ts                        # re-exports
  types.ts                        # Provider, DraftRequest, DraftResponse, ValidationResult, Flag, VoiceProfile
  prompts.ts                      # assembleDMPrompt, assemblePostReplyPrompt, buildRetryPrompt
  validator.ts                    # validateDraft; dispatches to regex tests + LLM-judge
  validator-regex.ts              # all 9 deterministic regex tests
  validator-judge.ts              # LLM-judge tests 1-5, 8 (single batched call)
  voice-profile.ts                # extractVoiceProfile, VOICE_PROFILE_PROMPT
  retry.ts                        # generateAndValidate loop
  providers/
    index.ts                      # createProvider factory
    openrouter.ts                 # OpenRouterProvider
    anthropic.ts                  # AnthropicProvider (Haiku 4.5 floor)
    openai.ts                     # OpenAIProvider (GPT-4o-mini floor)
    fake.ts                       # FakeProvider for unit tests (scriptable responses)

packages/core/__tests__/drafting/
  types.test.ts
  prompts.test.ts
  validator-regex.test.ts         # one describe block per test 9-15 + voice 6, 7
  validator.test.ts               # dispatch + merge with fake judge
  voice-profile.test.ts           # extractor prompt shape + input filtering
  retry.test.ts                   # fake provider, scripted fail-then-pass
  providers/
    openrouter.test.ts            # fake fetch; shape of request + parse of response
    anthropic.test.ts             # fake fetch; shape check
    openai.test.ts                # fake fetch; shape check
```

### Modified Files (community-pulse)

```
packages/core/src/index.ts        # re-export drafting surface
apps/pro/lib/convex.ts            # add generateDraft + generateVoiceProfile client callers
apps/pro/entrypoints/background.ts  # forward pageProps.self on SKOOL_MEMBERS_DATA payload
apps/pro/entrypoints/content.tsx  # include self.id + self.name in SKOOL_MEMBERS_DATA message
packages/core/package.json        # add @anthropic-ai/sdk, openai (optional peer deps; loaded lazily)
```

### New Files (jpgerton-site)

```
convex/communityPulse/
  drafting.ts                     # generateDraft action (Convex action, calls OpenRouter)
  voiceProfile.ts                 # generateVoiceProfile action + approveVoiceProfile mutation
  __tests__/
    drafting.test.ts              # calls action with fake provider env
    voiceProfile.test.ts
app/pilots/[projectSlug]/community-ops/
  voice-profile/page.tsx          # onboarding screen
  voice-profile/actions.tsx       # client component: generate + approve buttons
  draft-sample/page.tsx           # dev-only Slice 3 proof surface; generates one DM + one reply
components/command-center/
  voice-profile-panel.tsx         # shows profile markdown + approve CTA
  draft-sample-card.tsx           # shows draft + validator scorecard
```

### Modified Files (jpgerton-site)

```
convex/schema.ts                          # add ownSkoolUserId + voice-profile fields to pilotProfiles; skoolName to memberSnapshots
convex/communityPulse/sync.ts             # accept ownSkoolUserId, ownSkoolUserName; patch pilotProfile; store skoolName on snapshots
convex/communityPulse/queries.ts          # add getOwnPosts, getPilotVoiceProfile
app/pilots/[projectSlug]/community-ops/page.tsx  # add "Voice profile: approved/pending/missing" strip + link
package.json                              # add @anthropic-ai/sdk, openai
```

---

## Schema Changes (convex/schema.ts)

```typescript
pilotProfiles: defineTable({
  // ... existing fields unchanged ...
  // Slice 3 additions. All optional during migration.
  ownSkoolUserId: v.optional(v.string()),              // from pageProps.self.id on any sync
  ownSkoolUserName: v.optional(v.string()),            // from pageProps.self.name (the URL slug)
  voiceProfile: v.optional(v.string()),                // markdown prose, injected into prompts
  voiceProfileApproved: v.optional(v.boolean()),       // user flips true in onboarding UI
  voiceProfileGeneratedAt: v.optional(v.number()),     // ms
  voiceProfileSourceCount: v.optional(v.number()),     // how many posts the profile was extracted from
})
  // Existing indexes unchanged. Add one for owner-by-Skool-id lookups during sync.
  .index("by_ownSkoolUserId", ["ownSkoolUserId"])

memberSnapshots: defineTable({
  // ... existing fields unchanged ...
  skoolName: v.optional(v.string()),  // user.name slug, for Skool profile URLs
})
```

No new tables in Slice 3. Slice 4 will introduce a drafts cache; Slice 3's two sample drafts are inspected via UI and not persisted beyond Convex action return values.

---

## Provider Contract (packages/core/src/drafting/types.ts)

```typescript
export interface ProviderResponse {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface ProviderRequest {
  model: string;
  system: string;
  user: string;
  temperature?: number;         // default 0.3 for drafts, 0 for judge
  maxTokens?: number;           // default 1024
  responseFormat?: "text" | "json";  // json = strict JSON output for judge calls
}

export interface Provider {
  readonly kind: "openrouter" | "anthropic" | "openai" | "fake";
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}
```

All three real providers wrap `fetch` directly (no SDK dependencies at build time; SDKs are optional peers used only by tests). OpenRouter uses `POST https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer <key>`. Anthropic uses `POST https://api.anthropic.com/v1/messages` with `x-api-key`. OpenAI uses `POST https://api.openai.com/v1/chat/completions`. Each adapter translates the unified `ProviderRequest` into the provider's native shape and maps the response back.

---

## Validator Contract (packages/core/src/drafting/types.ts)

```typescript
export type TestId =
  | "voice-1-lead" | "voice-2-practitioner" | "voice-3-systems"
  | "voice-4-reframe" | "voice-5-specificity" | "voice-6-hedge"
  | "voice-7-filler" | "voice-8-rhythm"
  | "antislop-9-negative-parallelism" | "antislop-10-copula-avoidance"
  | "antislop-11-rule-of-three" | "antislop-12-filler-ceremony"
  | "antislop-13-persuasive-authority" | "antislop-14-significance-inflation"
  | "antislop-15-passive-voice";

export interface Flag {
  test: TestId;
  excerpt: string;    // the offending line or phrase
  reason: string;     // why it was flagged
  suggestion?: string; // optional revision suggestion (LLM-judge fills; regex doesn't)
}

export interface ValidationResult {
  pass: boolean;      // true iff flags.length === 0
  flags: Flag[];
  ranJudge: boolean;  // false if judge was skipped (e.g., draft < 100 words, see test 4)
}
```

9 regex tests run synchronously. 6 LLM-judge tests run as a **single batched** provider call producing a strict JSON array of `{ test: TestId, passes: boolean, excerpt, reason, suggestion }`. Temperature 0. If JSON parsing fails the judge result is treated as `ranJudge: false` with a synthetic flag `{ test: "voice-1-lead", reason: "Judge returned unparseable output" }` — surfaced but non-blocking for the auto-retry (only regex-test fails trigger retry; semantic flags surface as advisory).

**Note on determinism:** the Slice 3 DoD requires a "deterministic pass/fail" from the validator. Regex tests are deterministic by construction. LLM-judge is deterministic enough at temperature 0 with a schema-constrained prompt, which is the standard approach for eval-as-judge. This is acceptable for MVP. If false positives cluster during Slice 3-4 dogfooding, the replan trigger in ROADMAP.md ("anti-slop pass rate stays below 80% after tuning") will fire.

---

## Retry Loop (packages/core/src/drafting/retry.ts)

```typescript
export interface GenerateOptions {
  request: DraftRequest;
  provider: Provider;           // same provider used for both drafting and judge
  draftingModel: string;        // e.g. "google/gemini-flash-1.5-8b"
  judgeModel: string;           // e.g. "anthropic/claude-haiku-4-5"
  maxRetries?: number;          // default 1
}

export interface GenerateResult {
  draft: string;
  validation: ValidationResult;
  retried: boolean;
  surfaced: boolean;            // true if validation still failed after retries
  providerCalls: number;
}

export async function generateAndValidate(opts: GenerateOptions): Promise<GenerateResult>;
```

Loop:
1. Assemble prompt via `assembleDMPrompt` or `assemblePostReplyPrompt`.
2. Call provider with `draftingModel`, temperature 0.3.
3. Run `validateDraft(text, provider, judgeModel)`.
4. If `pass === true`: return.
5. Else if retries remaining AND any regex flags present: call `buildRetryPrompt(originalRequest, validationResult.flags)` and loop. (Semantic-only flags don't trigger retry — they often are correct calls out that the draft needs a redirect the model won't resolve by itself.)
6. If retries exhausted: return with `surfaced: true`.

---

## Tasks

### Phase 1: Schema prep and field capture (blocks all generation work)

- [x] **Task 1.1 — Verify `pageProps.self` shape on YCAH members page.** ✅ Completed 2026-04-19. See "Captured values" above. `self.id` and `self.name` both present on members page; members-page capture path confirmed.

- [x] **Task 1.2a — Install convex-test infrastructure (jpgerton-site).** ✅ Completed 2026-04-19 with commit `e694cfc` (landed inline during Phase 1b member sync work). `convex-test@0.0.49` and `@edge-runtime/vm@5.0.0` are devDependencies; `vitest.config.ts` sets `environment: "edge-runtime"`; `sync.test.ts` uses the `convexTest` + `seedPilotSession` pattern that Phase 7 voiceProfile mutation tests will reuse.

- [ ] **Task 1.2 — Write failing test for pilotProfiles sync patch.** File: `convex/communityPulse/__tests__/sync.test.ts` (new). Fake a mutation ctx, call `syncMembers` with `ownSkoolUserId: "u_pilot123"`, assert the pilot's `pilotProfiles` row (looked up by session email) is patched with `ownSkoolUserId: "u_pilot123"` and `ownSkoolUserName: "jon-gerton"`. Expected: FAIL.

```typescript
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { api } from "../../_generated/api";

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
    const t = convexTest(schema);
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
      ctx.db.query("pilotProfiles").withIndex("by_email", q => q.eq("email", "jon@example.com")).first()
    );
    expect(profile?.ownSkoolUserId).toBe("u_pilot123");
    expect(profile?.ownSkoolUserName).toBe("jon-gerton");
  });
});
```

Run: `bun run test` — expect the test to fail because `syncMembers` does not accept `ownSkoolUserId`.

- [ ] **Task 1.3 — Add schema fields.** File: `convex/schema.ts`. Add `ownSkoolUserId`, `ownSkoolUserName`, `voiceProfile`, `voiceProfileApproved`, `voiceProfileGeneratedAt`, `voiceProfileSourceCount` to `pilotProfiles` (all `v.optional`). Add `skoolName` (`v.optional(v.string())`) to `memberSnapshots`. Add `.index("by_ownSkoolUserId", ["ownSkoolUserId"])` on pilotProfiles. Run `bunx convex dev --once --configured` locally to regen types. Run: `bun run test` — schema compiles, Task 1.2 test still fails for the right reason (mutation arg not accepted).

- [ ] **Task 1.4 — Extend `syncMembers` mutation args and handler.** File: `convex/communityPulse/sync.ts`. Add `ownSkoolUserId: v.optional(v.string())` and `ownSkoolUserName: v.optional(v.string())` to args. After the existing community upsert and snapshot writes, look up the `pilotProfile` by `session.email` and patch with the new identity fields if both args are present and the profile has no existing `ownSkoolUserId` (idempotent — don't overwrite once set). Also: during the snapshot-insert loop, include `skoolName: member.skoolName` (add `skoolName: v.optional(v.string())` to `rawMemberValidator`). Run: `bun run test` — Task 1.2 passes.

- [ ] **Task 1.5 — Update content script + background to forward identity.** Files: `apps/pro/entrypoints/content.tsx`, `apps/pro/entrypoints/background.ts`. In content.tsx (members-page branch), extract `pageProps.self?.id` and `pageProps.self?.name` and include them in the `SKOOL_MEMBERS_DATA` message as `ownSkoolUserId` and `ownSkoolUserName`. In content.tsx (members-page branch), also include `user.name` for each member in the `data` array (extend the forwarded shape). In background.ts (in `extractMemberData`), map `user.name` onto each `skoolName` field and forward `ownSkoolUserId`/`ownSkoolUserName` to `syncMembers`.

- [ ] **Task 1.6 — Update `RawMember` type and `syncMembers` client signature.** File: `apps/pro/lib/convex.ts`. Add `skoolName?: string` to `RawMember`. Extend `syncMembers` args to accept `ownSkoolUserId?: string` and `ownSkoolUserName?: string`. Type-check: `cd apps/pro && bun run typecheck` — expect clean.

- [ ] **Task 1.7 — Commit.**

```bash
git add convex/schema.ts convex/communityPulse/sync.ts convex/communityPulse/__tests__/sync.test.ts
git add apps/pro/entrypoints/content.tsx apps/pro/entrypoints/background.ts apps/pro/lib/convex.ts
git commit -m "feat(cp): capture ownSkoolUserId + skoolName during member sync"
```

**Done when Phase 1 complete:** Running `syncMembers` from the extension on a logged-in YCAH members page populates `pilotProfiles.ownSkoolUserId`, `pilotProfiles.ownSkoolUserName`, and every new memberSnapshot carries `skoolName`.

---

### Phase 2: Drafting package skeleton and types (TDD, no providers yet)

- [ ] **Task 2.1 — Write failing test for DraftRequest/DraftResponse shapes.** File: `packages/core/__tests__/drafting/types.test.ts` (new).

```typescript
import { describe, it, expect } from "vitest";
import type { DraftRequest, DraftResponse, Provider } from "../../src/drafting/types.js";

describe("drafting types exist", () => {
  it("DraftRequest tagged union has dm and post_reply kinds", () => {
    const dm: DraftRequest = {
      kind: "dm",
      quadrant: "drifting",
      targetMember: { firstName: "Sam", skoolName: "sam" },
      voiceProfileMarkdown: "prose...",
    };
    const reply: DraftRequest = {
      kind: "post_reply",
      post: { title: "t", content: "c", authorFirstName: "A" },
      voiceProfileMarkdown: "prose...",
      intent: "supportive",
    };
    expect(dm.kind).toBe("dm");
    expect(reply.kind).toBe("post_reply");
  });
});
```

Run: `bun run test:core` — expect FAIL (module missing).

- [ ] **Task 2.2 — Create `packages/core/src/drafting/types.ts`** with the types listed below in full:

```typescript
export type Quadrant = "ambassador" | "drifting" | "loyal" | "at_risk";

export interface VoiceProfile {
  markdown: string;
  generatedAt: number;
  sourceCount: number;
}

export interface TargetMember {
  firstName: string;
  lastName?: string;
  skoolName?: string;
  quadrant?: Quadrant;
  lastActivityInCommunity?: number;
}

export interface PostToReply {
  title: string;
  content: string;
  authorFirstName: string;
  labelId?: string;
}

export type ReplyIntent = "supportive" | "question_answer" | "celebrate_win";

export type DraftRequest =
  | { kind: "dm"; quadrant: Quadrant; targetMember: TargetMember; voiceProfileMarkdown: string; principle?: string; }
  | { kind: "post_reply"; post: PostToReply; voiceProfileMarkdown: string; intent: ReplyIntent; };

export interface DraftResponse {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

export type TestId =
  | "voice-1-lead" | "voice-2-practitioner" | "voice-3-systems"
  | "voice-4-reframe" | "voice-5-specificity" | "voice-6-hedge"
  | "voice-7-filler" | "voice-8-rhythm"
  | "antislop-9-negative-parallelism" | "antislop-10-copula-avoidance"
  | "antislop-11-rule-of-three" | "antislop-12-filler-ceremony"
  | "antislop-13-persuasive-authority" | "antislop-14-significance-inflation"
  | "antislop-15-passive-voice";

export interface Flag {
  test: TestId;
  excerpt: string;
  reason: string;
  suggestion?: string;
}

export interface ValidationResult {
  pass: boolean;
  flags: Flag[];
  ranJudge: boolean;
}

export interface ProviderResponse {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface ProviderRequest {
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
}

export interface Provider {
  readonly kind: "openrouter" | "anthropic" | "openai" | "fake";
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}
```

- [ ] **Task 2.3 — Create `packages/core/src/drafting/index.ts`** as the public export surface. Re-export every named export from `types.ts`. Run: `bun run test:core` — Task 2.1 passes.

- [ ] **Task 2.4 — Re-export drafting from package root.** File: `packages/core/src/index.ts`. Add `export * from "./drafting/index.js";`. Run `bun run typecheck` — clean.

- [ ] **Task 2.5 — Commit.**

```bash
git add packages/core/src/drafting/ packages/core/src/index.ts packages/core/__tests__/drafting/
git commit -m "feat(cp): scaffold drafting package with shared types"
```

**Done when Phase 2 complete:** `import { DraftRequest, Provider, Flag } from "@community-pulse/core"` resolves cleanly; types test passes.

---

### Phase 3: Regex validator tests (9 deterministic tests)

Each regex test is its own named export of signature `(draft: string) => Flag | null`. `null` means pass. Co-locate the test list in an ordered array so Task 4.3 can iterate.

- [ ] **Task 3.1 — Write failing tests for all 9 regex checks.** File: `packages/core/__tests__/drafting/validator-regex.test.ts`. One `describe` block per test. Each block: at least 2 pass cases and 2 fail cases pulled from the anti-slop and voice-calibration reference docs.

```typescript
import { describe, it, expect } from "vitest";
import {
  checkNegativeParallelism,     // antislop-9
  checkCopulaAvoidance,          // antislop-10
  checkRuleOfThree,              // antislop-11
  checkFillerCeremony,           // antislop-12
  checkPersuasiveAuthority,      // antislop-13
  checkSignificanceInflation,    // antislop-14
  checkPassiveVoice,             // antislop-15
  checkHedge,                    // voice-6
  checkFillerOpener,             // voice-7
} from "../../src/drafting/validator-regex.js";

describe("checkNegativeParallelism (antislop-9)", () => {
  it("passes a clean draft", () => {
    expect(checkNegativeParallelism("Your price signals who this community is for.")).toBeNull();
  });
  it("flags three-or-more not-just/not-only constructions", () => {
    const draft = "It's not only X. This isn't just Y. It goes beyond A to B.";
    const flag = checkNegativeParallelism(draft);
    expect(flag?.test).toBe("antislop-9-negative-parallelism");
    expect(flag?.excerpt.toLowerCase()).toContain("not only");
  });
  it("allows a single usage", () => {
    expect(checkNegativeParallelism("This is not just X, but Y.")).toBeNull();
  });
});

describe("checkCopulaAvoidance (antislop-10)", () => {
  it("passes natural verb use", () => {
    expect(checkCopulaAvoidance("Configuring your tiers is the first decision.")).toBeNull();
  });
  it("flags 'the implementation of' / 'the utilization of' nominalizations", () => {
    const draft = "The implementation of the feature required careful thought. The utilization of resources matters.";
    const flag = checkCopulaAvoidance(draft);
    expect(flag?.test).toBe("antislop-10-copula-avoidance");
  });
});

describe("checkRuleOfThree (antislop-11)", () => {
  it("passes when lists vary", () => {
    expect(checkRuleOfThree("We use two tools. Later, we added four more.")).toBeNull();
  });
  it("flags 3+ triplet lists in one draft", () => {
    const draft = "Trust, credibility, and authority. Engagement, consistency, and authenticity. Growth, retention, and revenue.";
    const flag = checkRuleOfThree(draft);
    expect(flag?.test).toBe("antislop-11-rule-of-three");
  });
});

describe("checkFillerCeremony (antislop-12)", () => {
  it("passes clean writing", () => {
    expect(checkFillerCeremony("Lower prices reduce churn.")).toBeNull();
  });
  it("flags 'it's worth noting that'", () => {
    const flag = checkFillerCeremony("It's worth noting that pricing matters.");
    expect(flag?.test).toBe("antislop-12-filler-ceremony");
  });
  it("flags 'let's dive into'", () => {
    const flag = checkFillerCeremony("Let's dive into the data.");
    expect(flag?.test).toBe("antislop-12-filler-ceremony");
  });
});

describe("checkPersuasiveAuthority (antislop-13)", () => {
  it("passes when evidence speaks", () => {
    expect(checkPersuasiveAuthority("Skool Games data shows 85% completion.")).toBeNull();
  });
  it("flags 'research clearly shows'", () => {
    const flag = checkPersuasiveAuthority("Research clearly shows community models win.");
    expect(flag?.test).toBe("antislop-13-persuasive-authority");
  });
});

describe("checkSignificanceInflation (antislop-14)", () => {
  it("passes calibrated language", () => {
    expect(checkSignificanceInflation("This changes how you set your price.")).toBeNull();
  });
  it("flags 'fundamentally transforms' + 'paradigm shift'", () => {
    const flag = checkSignificanceInflation("This fundamentally transforms community pricing and represents a paradigm shift.");
    expect(flag?.test).toBe("antislop-14-significance-inflation");
  });
});

describe("checkPassiveVoice (antislop-15)", () => {
  it("passes one passive usage", () => {
    expect(checkPassiveVoice("The feature was built last week.")).toBeNull();
  });
  it("flags 3+ passive markers", () => {
    const draft = "It was determined that communities were found to have lower churn, as was observed in studies.";
    const flag = checkPassiveVoice(draft);
    expect(flag?.test).toBe("antislop-15-passive-voice");
  });
});

describe("checkHedge (voice-6)", () => {
  it("passes committed claims", () => {
    expect(checkHedge("An employee cannot disable this.")).toBeNull();
  });
  it("flags 'I think maybe'", () => {
    const flag = checkHedge("I think maybe this could be an issue.");
    expect(flag?.test).toBe("voice-6-hedge");
  });
});

describe("checkFillerOpener (voice-7)", () => {
  it("passes a direct opener", () => {
    expect(checkFillerOpener("Claude Code's source leaked. Same vector as last time.")).toBeNull();
  });
  it("flags 'in today's fast-paced world'", () => {
    const flag = checkFillerOpener("In today's fast-paced world, community matters.");
    expect(flag?.test).toBe("voice-7-filler");
  });
  it("flags 'without further ado'", () => {
    const flag = checkFillerOpener("Without further ado, let's begin.");
    expect(flag?.test).toBe("voice-7-filler");
  });
});
```

Run: `bun run test:core` — all regex tests FAIL (module missing).

- [ ] **Task 3.2 — Implement `validator-regex.ts` with all 9 checks.** File: `packages/core/src/drafting/validator-regex.ts`. Each check returns the first offending excerpt. Regex patterns listed inline below — implement verbatim, no shortcuts.

```typescript
import type { Flag, TestId } from "./types.js";

function findFirst(draft: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = draft.match(p);
    if (m) return m[0];
  }
  return null;
}

function countMatches(draft: string, pattern: RegExp): number {
  return (draft.match(pattern) ?? []).length;
}

export function checkNegativeParallelism(draft: string): Flag | null {
  const pattern = /\b(not\s+just|isn'?t\s+just|not\s+only|more\s+than\s+just|goes?\s+beyond\s+[^.]+?\s+to|isn'?t\s+merely)\b/gi;
  const count = countMatches(draft, pattern);
  if (count < 3) return null;
  const first = draft.match(pattern)?.[0] ?? "";
  return {
    test: "antislop-9-negative-parallelism",
    excerpt: first,
    reason: `Found ${count} negative-parallelism constructions; 3+ is an AI tell.`,
  };
}

export function checkCopulaAvoidance(draft: string): Flag | null {
  const patterns = [
    /\bthe\s+implementation\s+of\b/gi,
    /\bthe\s+utilization\s+of\b/gi,
    /\bthe\s+configuration\s+of\b/gi,
    /\bthe\s+optimization\s+of\b/gi,
  ];
  const excerpt = findFirst(draft, patterns);
  if (!excerpt) return null;
  return {
    test: "antislop-10-copula-avoidance",
    excerpt,
    reason: "Nominalization where a verb would be clearer.",
  };
}

export function checkRuleOfThree(draft: string): Flag | null {
  // Matches "X, Y, and Z" oxford-list triplets where X, Y, Z are 1-3-word tokens.
  const triplet = /\b(\w+(?:\s\w+){0,2}),\s+(\w+(?:\s\w+){0,2}),\s+and\s+(\w+(?:\s\w+){0,2})\b/g;
  const matches = [...draft.matchAll(triplet)];
  if (matches.length < 3) return null;
  return {
    test: "antislop-11-rule-of-three",
    excerpt: matches[0]![0],
    reason: `Found ${matches.length} triplet lists; 3+ suggests pattern-matching.`,
  };
}

export function checkFillerCeremony(draft: string): Flag | null {
  const patterns = [
    /\bit'?s\s+worth\s+noting\s+that\b/gi,
    /\bit'?s\s+important\s+to\s+understand\s+that\b/gi,
    /\blet'?s\s+take\s+a\s+closer\s+look\s+at\b/gi,
    /\blet'?s\s+dive\s+in(?:to)?\b/gi,
    /\blet'?s\s+explore\b/gi,
    /\bhere'?s\s+the\s+thing\b/gi,
    /\bthe\s+reality\s+is\b/gi,
    /\bthe\s+truth\s+is\b/gi,
    /\bat\s+the\s+end\s+of\s+the\s+day\b/gi,
    /\bwhen\s+it\s+comes\s+to\b/gi,
    /\bin\s+terms\s+of\b/gi,
    /\bwhat\s+this\s+means\s+is\b/gi,
  ];
  const excerpt = findFirst(draft, patterns);
  if (!excerpt) return null;
  return {
    test: "antislop-12-filler-ceremony",
    excerpt,
    reason: "Ceremonial phrase adds no information.",
  };
}

export function checkPersuasiveAuthority(draft: string): Flag | null {
  const patterns = [
    /\bresearch\s+clearly\s+shows\b/gi,
    /\bexperts\s+agree\b/gi,
    /\bstudies\s+have\s+proven\b/gi,
    /\bit'?s\s+well[-\s]established\s+that\b/gi,
    /\bas\s+we\s+all\s+know\b/gi,
    /\bthe\s+science\s+is\s+clear\b/gi,
    /\bdata\s+unequivocally\s+demonstrates\b/gi,
  ];
  const excerpt = findFirst(draft, patterns);
  if (!excerpt) return null;
  return {
    test: "antislop-13-persuasive-authority",
    excerpt,
    reason: "Unearned authority. Let evidence speak instead.",
  };
}

export function checkSignificanceInflation(draft: string): Flag | null {
  const words = [
    "dramatically", "fundamentally", "transformative", "revolutionary",
    "game-changing", "unprecedented", "groundbreaking", "paradigm shift",
    "incredibly", "remarkably", "staggeringly",
  ];
  const pattern = new RegExp(`\\b(${words.map(w => w.replace(/ /g, "\\s+")).join("|")})\\b`, "gi");
  const matches = [...draft.matchAll(pattern)];
  if (matches.length < 2) return null;
  return {
    test: "antislop-14-significance-inflation",
    excerpt: matches[0]![0],
    reason: `Found ${matches.length} significance-inflating words; 2+ is a tell.`,
  };
}

export function checkPassiveVoice(draft: string): Flag | null {
  const patterns = [
    /\b(was|were|is|are|has\s+been|have\s+been)\s+(found|shown|considered|determined|observed|implemented)\b/gi,
    /\bit\s+(was|should\s+be)\s+(determined|noted|observed|found)\s+that\b/gi,
    /\bcan\s+be\s+seen\s+as\b/gi,
  ];
  let count = 0;
  let first: string | null = null;
  for (const p of patterns) {
    const matches = [...draft.matchAll(p)];
    count += matches.length;
    if (!first && matches[0]) first = matches[0][0];
  }
  if (count < 3) return null;
  return {
    test: "antislop-15-passive-voice",
    excerpt: first!,
    reason: `Found ${count} passive markers; overuse hides agency.`,
  };
}

export function checkHedge(draft: string): Flag | null {
  const patterns = [
    /\bI\s+think\s+maybe\b/gi,
    /\bit\s+could\s+potentially\b/gi,
    /\barguably\b/gi,
    /\bit\s+seems\s+like\b/gi,
    /\bto\s+be\s+fair\b/gi,
  ];
  const excerpt = findFirst(draft, patterns);
  if (!excerpt) return null;
  return {
    test: "voice-6-hedge",
    excerpt,
    reason: "Hedge language. Commit to the claim or name the uncertainty directly.",
  };
}

export function checkFillerOpener(draft: string): Flag | null {
  // Only inspect the first 100 chars — openers only.
  const head = draft.slice(0, 150).toLowerCase();
  const patterns = [
    /^in\s+today'?s\s+fast[-\s]paced\s+world/,
    /^let'?s\s+dive\s+in/,
    /^without\s+further\s+ado/,
    /^in\s+this\s+(post|article),?\s+I\s+will/i,
  ];
  for (const p of patterns) {
    if (p.test(head)) {
      const m = head.match(p);
      return {
        test: "voice-7-filler",
        excerpt: m?.[0] ?? "",
        reason: "Throat-clearing opener. Start with the point.",
      };
    }
  }
  return null;
}

export const REGEX_CHECKS: ReadonlyArray<(draft: string) => Flag | null> = [
  checkNegativeParallelism, checkCopulaAvoidance, checkRuleOfThree,
  checkFillerCeremony, checkPersuasiveAuthority, checkSignificanceInflation,
  checkPassiveVoice, checkHedge, checkFillerOpener,
];
```

Run: `bun run test:core` — all regex tests in Task 3.1 PASS.

- [ ] **Task 3.3 — Commit.**

```bash
git add packages/core/src/drafting/validator-regex.ts packages/core/__tests__/drafting/validator-regex.test.ts
git commit -m "feat(cp): regex-based anti-slop and voice validators (9 checks)"
```

**Done when Phase 3 complete:** 9 regex checks with full test coverage; `REGEX_CHECKS` exports an ordered array used by the dispatcher in Phase 4.

---

### Phase 4: LLM-judge and validator dispatcher (TDD)

- [ ] **Task 4.1 — Write a FakeProvider for tests.** File: `packages/core/src/drafting/providers/fake.ts`. Scriptable responses.

```typescript
import type { Provider, ProviderRequest, ProviderResponse } from "../types.js";

export class FakeProvider implements Provider {
  readonly kind = "fake" as const;
  private queue: ProviderResponse[] = [];
  public calls: ProviderRequest[] = [];
  enqueue(r: ProviderResponse): void { this.queue.push(r); }
  enqueueText(text: string, model = "fake/model"): void {
    this.enqueue({ text, model, usage: { inputTokens: 0, outputTokens: 0 } });
  }
  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    this.calls.push(req);
    const r = this.queue.shift();
    if (!r) throw new Error("FakeProvider: no response queued");
    return r;
  }
}
```

- [ ] **Task 4.2 — Write failing test for the LLM-judge output parser.** File: `packages/core/__tests__/drafting/validator.test.ts`.

```typescript
import { describe, it, expect } from "vitest";
import { validateDraft } from "../../src/drafting/validator.js";
import { FakeProvider } from "../../src/drafting/providers/fake.js";

describe("validateDraft", () => {
  it("returns pass when both regex and judge are clean", async () => {
    const provider = new FakeProvider();
    provider.enqueueText(JSON.stringify([
      { test: "voice-1-lead", passes: true, excerpt: "", reason: "opens with the point" },
      { test: "voice-2-practitioner", passes: true, excerpt: "", reason: "I built X" },
      { test: "voice-3-systems", passes: true, excerpt: "", reason: "connects to system" },
      { test: "voice-4-reframe", passes: true, excerpt: "", reason: "n/a short" },
      { test: "voice-5-specificity", passes: true, excerpt: "", reason: "has specifics" },
      { test: "voice-8-rhythm", passes: true, excerpt: "", reason: "varied" },
    ]));
    const result = await validateDraft("A clean and direct draft with specifics like 89 lines.", provider, "fake/judge");
    expect(result.pass).toBe(true);
    expect(result.flags).toHaveLength(0);
    expect(result.ranJudge).toBe(true);
  });

  it("fails on a regex flag and does not call the judge unnecessarily", async () => {
    const provider = new FakeProvider();
    // Still enqueue a judge response in case it gets called.
    provider.enqueueText(JSON.stringify([]));
    const result = await validateDraft("It's worth noting that pricing matters.", provider, "fake/judge");
    expect(result.pass).toBe(false);
    expect(result.flags.some(f => f.test === "antislop-12-filler-ceremony")).toBe(true);
  });

  it("merges regex + judge flags", async () => {
    const provider = new FakeProvider();
    provider.enqueueText(JSON.stringify([
      { test: "voice-1-lead", passes: false, excerpt: "In the world of AI tools", reason: "setup opener", suggestion: "lead with the insight" },
      { test: "voice-2-practitioner", passes: true, excerpt: "", reason: "" },
      { test: "voice-3-systems", passes: true, excerpt: "", reason: "" },
      { test: "voice-4-reframe", passes: true, excerpt: "", reason: "" },
      { test: "voice-5-specificity", passes: true, excerpt: "", reason: "" },
      { test: "voice-8-rhythm", passes: true, excerpt: "", reason: "" },
    ]));
    const result = await validateDraft("Arguably this seems like maybe the right call.", provider, "fake/judge");
    expect(result.pass).toBe(false);
    const testIds = result.flags.map(f => f.test);
    expect(testIds).toContain("voice-6-hedge");
    expect(testIds).toContain("voice-1-lead");
  });

  it("skips judge when draft is very short (< 100 words) and only runs regex", async () => {
    const provider = new FakeProvider();
    const result = await validateDraft("Short direct message.", provider, "fake/judge");
    expect(result.ranJudge).toBe(false);
    expect(provider.calls).toHaveLength(0);
  });

  it("recovers gracefully from unparseable judge output", async () => {
    const provider = new FakeProvider();
    provider.enqueueText("not-json");
    const longDraft = "This is a long draft. ".repeat(60);
    const result = await validateDraft(longDraft, provider, "fake/judge");
    expect(result.ranJudge).toBe(false);
    // Regex must still have run
    expect(result.pass).toBe(true);  // nothing regex-flaggable in this draft
  });
});
```

Run: `bun run test:core` — FAIL (validator not implemented).

- [ ] **Task 4.3 — Implement `validator-judge.ts`.** File: `packages/core/src/drafting/validator-judge.ts`. Builds the judge prompt with explicit JSON schema, calls the provider at temp 0, parses.

```typescript
import type { Provider, Flag, TestId } from "./types.js";

const JUDGE_TESTS: Array<{ id: TestId; question: string; guidance: string }> = [
  { id: "voice-1-lead", question: "Does the piece open with the insight/decision, not setup?",
    guidance: "Read first 1-2 sentences. If context-building before the point, FAIL." },
  { id: "voice-2-practitioner", question: "Is there an 'I built / tested / discovered' moment grounded in a specific detail?",
    guidance: "Needs a concrete tool, number, file, or outcome to PASS." },
  { id: "voice-3-systems", question: "Does the piece connect the topic to a larger system or pattern?",
    guidance: "Isolated surface-only treatment FAILs." },
  { id: "voice-4-reframe", question: "Is there a moment where the obvious question gets reframed?",
    guidance: "Short content (< 100 words) auto-PASSes. Otherwise needs a 'the real issue is Y' redirect." },
  { id: "voice-5-specificity", question: "Are claims anchored to concrete details (numbers, names, tools, paths)?",
    guidance: "Vague claims without anchors FAIL." },
  { id: "voice-8-rhythm", question: "Is there variation between short punchy sentences and longer specific ones?",
    guidance: "All-same-length or run-on chains FAIL." },
];

const SYSTEM = `You are a writing quality evaluator. You receive a draft and return ONLY a JSON array, no preamble, no markdown fences. Each entry has: test (string), passes (boolean), excerpt (string, empty if passes), reason (string, one sentence), suggestion (string, optional). Temperature 0. If the draft is too short for a test (e.g. voice-4-reframe on under 100 words), set passes=true and reason="n/a short draft".`;

function buildUserPrompt(draft: string): string {
  const lines = [
    "Evaluate this draft against these tests:",
    ...JUDGE_TESTS.map(t => `- ${t.id}: ${t.question} (${t.guidance})`),
    "",
    "Draft:",
    "```",
    draft,
    "```",
    "",
    "Return the JSON array now.",
  ];
  return lines.join("\n");
}

export interface JudgeEntry {
  test: TestId;
  passes: boolean;
  excerpt: string;
  reason: string;
  suggestion?: string;
}

export async function runJudge(
  draft: string,
  provider: Provider,
  model: string,
): Promise<{ flags: Flag[]; ranJudge: boolean }> {
  try {
    const response = await provider.complete({
      model,
      system: SYSTEM,
      user: buildUserPrompt(draft),
      temperature: 0,
      maxTokens: 800,
      responseFormat: "json",
    });
    const parsed = JSON.parse(response.text) as JudgeEntry[];
    if (!Array.isArray(parsed)) return { flags: [], ranJudge: false };
    const flags: Flag[] = parsed
      .filter(e => e && e.passes === false)
      .map(e => ({ test: e.test, excerpt: e.excerpt ?? "", reason: e.reason, suggestion: e.suggestion }));
    return { flags, ranJudge: true };
  } catch {
    return { flags: [], ranJudge: false };
  }
}
```

- [ ] **Task 4.4 — Implement `validator.ts` dispatcher.** File: `packages/core/src/drafting/validator.ts`.

```typescript
import type { Provider, ValidationResult, Flag } from "./types.js";
import { REGEX_CHECKS } from "./validator-regex.js";
import { runJudge } from "./validator-judge.js";

const JUDGE_MIN_WORDS = 100;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export async function validateDraft(
  draft: string,
  provider: Provider,
  judgeModel: string,
): Promise<ValidationResult> {
  const regexFlags: Flag[] = [];
  for (const check of REGEX_CHECKS) {
    const f = check(draft);
    if (f) regexFlags.push(f);
  }

  const longEnough = wordCount(draft) >= JUDGE_MIN_WORDS;
  if (!longEnough) {
    return { pass: regexFlags.length === 0, flags: regexFlags, ranJudge: false };
  }

  const judged = await runJudge(draft, provider, judgeModel);
  const allFlags = [...regexFlags, ...judged.flags];
  return { pass: allFlags.length === 0, flags: allFlags, ranJudge: judged.ranJudge };
}
```

Run: `bun run test:core` — Task 4.2 tests PASS.

- [ ] **Task 4.5 — Commit.**

```bash
git add packages/core/src/drafting/validator.ts packages/core/src/drafting/validator-judge.ts packages/core/src/drafting/providers/fake.ts packages/core/__tests__/drafting/validator.test.ts
git commit -m "feat(cp): LLM-judge + validator dispatcher with 15-test coverage"
```

**Done when Phase 4 complete:** `validateDraft("some text", provider, "model")` returns `{ pass, flags, ranJudge }`; 5 dispatcher tests pass; short drafts skip the judge.

---

### Phase 5: Provider adapters (OpenRouter + Anthropic + OpenAI)

- [ ] **Task 5.1 — Write failing test for OpenRouterProvider.** File: `packages/core/__tests__/drafting/providers/openrouter.test.ts`. Mock global `fetch`. Assert URL, headers, body shape, response parsing.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterProvider } from "../../../src/drafting/providers/openrouter.js";

describe("OpenRouterProvider", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("sends POST to /chat/completions with bearer auth and correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hi" } }],
        model: "google/gemini-flash-1.5-8b",
        usage: { prompt_tokens: 10, completion_tokens: 2 },
      }),
    });
    globalThis.fetch = mockFetch as any;

    const provider = new OpenRouterProvider({ apiKey: "sk-or-test" });
    const result = await provider.complete({
      model: "google/gemini-flash-1.5-8b",
      system: "sys",
      user: "usr",
      temperature: 0.3,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer sk-or-test",
          "Content-Type": "application/json",
        }),
      }),
    );
    const bodyRaw = (mockFetch.mock.calls[0][1] as any).body;
    const body = JSON.parse(bodyRaw);
    expect(body.model).toBe("google/gemini-flash-1.5-8b");
    expect(body.messages).toEqual([
      { role: "system", content: "sys" },
      { role: "user", content: "usr" },
    ]);
    expect(body.temperature).toBe(0.3);

    expect(result.text).toBe("Hi");
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 2 });
  });

  it("throws on non-ok HTTP status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 429, text: async () => "rate limited",
    }) as any;
    const provider = new OpenRouterProvider({ apiKey: "sk-or-test" });
    await expect(provider.complete({ model: "x", system: "", user: "" }))
      .rejects.toThrow(/429/);
  });

  it("sets response_format json_object when responseFormat=json", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "[]" } }], model: "x", usage: { prompt_tokens: 0, completion_tokens: 0 } }),
    });
    globalThis.fetch = mockFetch as any;
    await new OpenRouterProvider({ apiKey: "k" })
      .complete({ model: "x", system: "s", user: "u", responseFormat: "json" });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.response_format).toEqual({ type: "json_object" });
  });
});
```

Run: `bun run test:core` — FAIL.

- [ ] **Task 5.2 — Implement `OpenRouterProvider`.** File: `packages/core/src/drafting/providers/openrouter.ts`.

```typescript
import type { Provider, ProviderRequest, ProviderResponse } from "../types.js";

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;                     // default https://openrouter.ai/api/v1
  siteUrl?: string;                     // optional, for attribution headers
  appName?: string;                     // optional
}

export class OpenRouterProvider implements Provider {
  readonly kind = "openrouter" as const;
  constructor(private config: OpenRouterConfig) {}

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const baseUrl = this.config.baseUrl ?? "https://openrouter.ai/api/v1";
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };
    if (this.config.siteUrl) headers["HTTP-Referer"] = this.config.siteUrl;
    if (this.config.appName) headers["X-Title"] = this.config.appName;

    const body: Record<string, unknown> = {
      model: req.model,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      temperature: req.temperature ?? 0.3,
      max_tokens: req.maxTokens ?? 1024,
    };
    if (req.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errorText}`);
    }
    const json = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number };
    };
    return {
      text: json.choices[0]?.message?.content ?? "",
      model: json.model,
      usage: {
        inputTokens: json.usage.prompt_tokens,
        outputTokens: json.usage.completion_tokens,
      },
    };
  }
}
```

Run: `bun run test:core` — OpenRouter tests PASS.

- [ ] **Task 5.3 — Write failing test for AnthropicProvider.** File: `packages/core/__tests__/drafting/providers/anthropic.test.ts`. Same structure. Asserts `POST https://api.anthropic.com/v1/messages`, `x-api-key` + `anthropic-version: 2023-06-01` headers, body with `system` string + `messages: [{role: "user", content}]`. Response mock: `{ content: [{ type: "text", text: "Hi" }], model: "claude-haiku-4-5", usage: { input_tokens: 10, output_tokens: 2 } }`.

- [ ] **Task 5.4 — Implement `AnthropicProvider`.** File: `packages/core/src/drafting/providers/anthropic.ts`. Enforce Haiku 4.5 as the minimum — if request model does not start with `claude-haiku-4-5` or `claude-sonnet-` or `claude-opus-`, throw "Anthropic provider requires Haiku 4.5 or newer". Map native shape:

```typescript
import type { Provider, ProviderRequest, ProviderResponse } from "../types.js";

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;  // default https://api.anthropic.com/v1
}

export class AnthropicProvider implements Provider {
  readonly kind = "anthropic" as const;
  constructor(private config: AnthropicConfig) {}

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    if (!/^claude-(haiku-4-5|sonnet-|opus-)/.test(req.model)) {
      throw new Error(`Anthropic provider requires Haiku 4.5 or newer; got "${req.model}"`);
    }
    const baseUrl = this.config.baseUrl ?? "https://api.anthropic.com/v1";
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: req.model,
        system: req.system,
        messages: [{ role: "user", content: req.user }],
        temperature: req.temperature ?? 0.3,
        max_tokens: req.maxTokens ?? 1024,
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic ${response.status}: ${await response.text()}`);
    }
    const json = await response.json() as {
      content: Array<{ type: string; text?: string }>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
    };
    const text = json.content.filter(b => b.type === "text").map(b => b.text ?? "").join("");
    return {
      text,
      model: json.model,
      usage: { inputTokens: json.usage.input_tokens, outputTokens: json.usage.output_tokens },
    };
  }
}
```

Run: `bun run test:core` — Anthropic tests PASS.

- [ ] **Task 5.5 — Write failing test + implement `OpenAIProvider`.** Similar to OpenRouter (same Chat Completions shape), base URL `https://api.openai.com/v1`, auth `Authorization: Bearer <key>`, no HTTP-Referer headers. Enforce GPT-4o-mini or newer via model prefix check (`gpt-4o-mini`, `gpt-4o`, `o1-`, `o3-`). Test + implement.

- [ ] **Task 5.6 — Add provider factory.** File: `packages/core/src/drafting/providers/index.ts`.

```typescript
import { OpenRouterProvider, type OpenRouterConfig } from "./openrouter.js";
import { AnthropicProvider, type AnthropicConfig } from "./anthropic.js";
import { OpenAIProvider, type OpenAIConfig } from "./openai.js";
import type { Provider } from "../types.js";

export type ProviderConfig =
  | ({ kind: "openrouter" } & OpenRouterConfig)
  | ({ kind: "anthropic" } & AnthropicConfig)
  | ({ kind: "openai" } & OpenAIConfig);

export function createProvider(config: ProviderConfig): Provider {
  switch (config.kind) {
    case "openrouter": return new OpenRouterProvider(config);
    case "anthropic": return new AnthropicProvider(config);
    case "openai": return new OpenAIProvider(config);
  }
}

export { OpenRouterProvider, AnthropicProvider, OpenAIProvider };
export { FakeProvider } from "./fake.js";
```

- [ ] **Task 5.7 — Re-export from drafting index.** Add `export * from "./providers/index.js"` to `packages/core/src/drafting/index.ts`. Run `bun run typecheck`.

- [ ] **Task 5.8 — Commit.**

```bash
git add packages/core/src/drafting/providers/ packages/core/__tests__/drafting/providers/ packages/core/src/drafting/index.ts
git commit -m "feat(cp): OpenRouter + Anthropic + OpenAI provider adapters"
```

**Done when Phase 5 complete:** Three providers implemented, each with fetch-mocked unit tests. `createProvider({ kind, apiKey, ... })` returns a working adapter. Satisfies the "adapter pattern tested with at least 2 providers" DoD.

---

### Phase 6: Prompt assembly + retry loop

- [ ] **Task 6.1 — Write failing test for `assembleDMPrompt`.** File: `packages/core/__tests__/drafting/prompts.test.ts`.

```typescript
import { describe, it, expect } from "vitest";
import { assembleDMPrompt, assemblePostReplyPrompt, buildRetryPrompt } from "../../src/drafting/prompts.js";
import type { DraftRequest, Flag } from "../../src/drafting/types.js";

describe("assembleDMPrompt", () => {
  it("injects voiceProfileMarkdown verbatim into the system prompt", () => {
    const voice = "I write short direct sentences. I open with the point.";
    const req: DraftRequest = {
      kind: "dm", quadrant: "drifting",
      targetMember: { firstName: "Sam" },
      voiceProfileMarkdown: voice,
    };
    const { system, user } = assembleDMPrompt(req);
    expect(system).toContain(voice);
    expect(system).toContain("no em dashes");
    expect(user).toContain("Sam");
    expect(user).toContain("drifting");
  });

  it("embeds baseline anti-slop rules in the system prompt", () => {
    const req: DraftRequest = {
      kind: "dm", quadrant: "ambassador",
      targetMember: { firstName: "A" },
      voiceProfileMarkdown: "v",
    };
    const { system } = assembleDMPrompt(req);
    expect(system.toLowerCase()).toContain("no filler");
    expect(system.toLowerCase()).toContain("no significance inflation");
  });
});

describe("assemblePostReplyPrompt", () => {
  it("includes the post content and intent", () => {
    const req: DraftRequest = {
      kind: "post_reply",
      post: { title: "T", content: "Body", authorFirstName: "A" },
      voiceProfileMarkdown: "v", intent: "supportive",
    };
    const { system, user } = assemblePostReplyPrompt(req);
    expect(user).toContain("T");
    expect(user).toContain("Body");
    expect(system).toContain("supportive");
  });
});

describe("buildRetryPrompt", () => {
  it("embeds failing test excerpts so the model avoids repeating them", () => {
    const flags: Flag[] = [
      { test: "antislop-12-filler-ceremony", excerpt: "it's worth noting that", reason: "filler" },
      { test: "antislop-14-significance-inflation", excerpt: "fundamentally", reason: "inflation" },
    ];
    const { system } = buildRetryPrompt("original system", flags);
    expect(system).toContain("it's worth noting that");
    expect(system).toContain("fundamentally");
    expect(system.toLowerCase()).toContain("do not use");
  });
});
```

Run: `bun run test:core` — FAIL.

- [ ] **Task 6.2 — Implement `prompts.ts`.** File: `packages/core/src/drafting/prompts.ts`.

```typescript
import type { DraftRequest, Flag } from "./types.js";

const BASELINE_RULES = `
Baseline writing rules (strict):
- No em dashes. Use commas, periods, or semicolons.
- No filler ceremonies ("it's worth noting that", "let's dive into", "at the end of the day").
- No significance inflation (fundamentally, transformative, paradigm shift, game-changing).
- No rule-of-three listing patterns (avoid three consecutive "X, Y, and Z" triplets).
- No hedge language (arguably, it seems like, I think maybe). Commit to claims or name uncertainty directly.
- Lead with the point, not setup.
- Ground claims with specifics when possible.
`.trim();

function quadrantIntent(q: string): string {
  switch (q) {
    case "ambassador": return "thank them for their contribution and invite deeper involvement";
    case "drifting": return "re-engage with a specific reference to something they did or would value";
    case "loyal": return "check in and invite them to contribute";
    case "at_risk": return "offer genuine support and surface one specific next step";
    default: return "check in";
  }
}

export function assembleDMPrompt(req: Extract<DraftRequest, { kind: "dm" }>) {
  const intent = quadrantIntent(req.quadrant);
  const system = [
    "You draft short, personal Skool DMs in the community owner's voice.",
    "Target length: 2-4 sentences.",
    BASELINE_RULES,
    "",
    "Voice profile (match this exactly):",
    req.voiceProfileMarkdown,
    req.principle ? `\nPlaybook principle to apply: ${req.principle}` : "",
  ].filter(Boolean).join("\n");

  const user = [
    `Member: ${req.targetMember.firstName}${req.targetMember.lastName ? " " + req.targetMember.lastName : ""}`,
    `Quadrant: ${req.quadrant}`,
    `Intent: ${intent}`,
    "",
    "Write the DM. Output only the message body, no greeting lines like 'Here is the draft:'.",
  ].join("\n");

  return { system, user };
}

export function assemblePostReplyPrompt(req: Extract<DraftRequest, { kind: "post_reply" }>) {
  const system = [
    "You draft concise reply comments to Skool community posts in the owner's voice.",
    "Target length: 1-3 sentences.",
    `Reply intent: ${req.intent}.`,
    BASELINE_RULES,
    "",
    "Voice profile (match this exactly):",
    req.voiceProfileMarkdown,
  ].join("\n");

  const user = [
    `Post author: ${req.post.authorFirstName}`,
    `Title: ${req.post.title}`,
    `Content:`,
    req.post.content,
    "",
    "Write the reply. Output only the comment body.",
  ].join("\n");

  return { system, user };
}

export function buildRetryPrompt(originalSystem: string, flags: Flag[]) {
  const bannedLines = flags
    .filter(f => f.excerpt.trim().length > 0)
    .map(f => `- "${f.excerpt}" (${f.reason})`);
  const extra = [
    "",
    "The previous draft failed validation. Do not use any of these exact phrases:",
    ...bannedLines,
    "",
    "Regenerate with fewer words and more specifics.",
  ].join("\n");
  return { system: originalSystem + extra };
}
```

Run: `bun run test:core` — Task 6.1 tests PASS.

- [ ] **Task 6.3 — Write failing test for `generateAndValidate` retry loop.** File: `packages/core/__tests__/drafting/retry.test.ts`.

```typescript
import { describe, it, expect } from "vitest";
import { generateAndValidate } from "../../src/drafting/retry.js";
import { FakeProvider } from "../../src/drafting/providers/fake.js";
import type { DraftRequest } from "../../src/drafting/types.js";

const dmReq: DraftRequest = {
  kind: "dm", quadrant: "drifting",
  targetMember: { firstName: "Sam" },
  voiceProfileMarkdown: "direct",
};

describe("generateAndValidate", () => {
  it("passes on first try when validator is clean", async () => {
    const provider = new FakeProvider();
    provider.enqueueText("Hey Sam, saw your post last week about notion templates. Worth a quick chat.");
    const result = await generateAndValidate({
      request: dmReq, provider,
      draftingModel: "fake/draft", judgeModel: "fake/judge",
    });
    expect(result.retried).toBe(false);
    expect(result.validation.pass).toBe(true);
    expect(result.providerCalls).toBe(1);
  });

  it("retries once when regex validator flags the first draft", async () => {
    const provider = new FakeProvider();
    provider.enqueueText("It's worth noting that you should reply.");
    provider.enqueueText("Hey Sam, saw your post about notion templates. Want to trade notes?");
    const result = await generateAndValidate({
      request: dmReq, provider,
      draftingModel: "fake/draft", judgeModel: "fake/judge",
    });
    expect(result.retried).toBe(true);
    expect(result.validation.pass).toBe(true);
    expect(result.surfaced).toBe(false);
    expect(result.providerCalls).toBe(2);
  });

  it("surfaces after exhausting retries", async () => {
    const provider = new FakeProvider();
    provider.enqueueText("It's worth noting that pricing fundamentally transforms communities.");
    provider.enqueueText("Let's dive into why it's worth noting that arguably things seem like maybe.");
    const result = await generateAndValidate({
      request: dmReq, provider,
      draftingModel: "fake/draft", judgeModel: "fake/judge",
    });
    expect(result.retried).toBe(true);
    expect(result.surfaced).toBe(true);
    expect(result.validation.pass).toBe(false);
  });

  it("does not retry when only semantic (judge) flags fired", async () => {
    const provider = new FakeProvider();
    // draft is short (<100 words) so judge is skipped entirely; add a semantic-only failing scenario
    // by making draft long + queuing a judge response with a single failing semantic flag.
    const longDraft = "We should meet. " + "I will send details. ".repeat(40);
    provider.enqueueText(longDraft);
    provider.enqueueText(JSON.stringify([
      { test: "voice-1-lead", passes: false, excerpt: "We should meet", reason: "weak opener", suggestion: "lead with a specific" },
      { test: "voice-2-practitioner", passes: true, excerpt: "", reason: "" },
      { test: "voice-3-systems", passes: true, excerpt: "", reason: "" },
      { test: "voice-4-reframe", passes: true, excerpt: "", reason: "" },
      { test: "voice-5-specificity", passes: true, excerpt: "", reason: "" },
      { test: "voice-8-rhythm", passes: true, excerpt: "", reason: "" },
    ]));
    const result = await generateAndValidate({
      request: dmReq, provider,
      draftingModel: "fake/draft", judgeModel: "fake/judge",
    });
    expect(result.retried).toBe(false);
    expect(result.surfaced).toBe(true);
    expect(result.validation.pass).toBe(false);
    expect(result.providerCalls).toBe(2);  // draft + judge, no retry
  });
});
```

Run: FAIL.

- [ ] **Task 6.4 — Implement `retry.ts`.** File: `packages/core/src/drafting/retry.ts`.

```typescript
import type { Provider, DraftRequest, ValidationResult } from "./types.js";
import { assembleDMPrompt, assemblePostReplyPrompt, buildRetryPrompt } from "./prompts.js";
import { validateDraft } from "./validator.js";

export interface GenerateOptions {
  request: DraftRequest;
  provider: Provider;
  draftingModel: string;
  judgeModel: string;
  maxRetries?: number;
}

export interface GenerateResult {
  draft: string;
  validation: ValidationResult;
  retried: boolean;
  surfaced: boolean;
  providerCalls: number;
}

function assembleFor(req: DraftRequest) {
  return req.kind === "dm" ? assembleDMPrompt(req) : assemblePostReplyPrompt(req);
}

function hasRegexFlags(v: ValidationResult): boolean {
  return v.flags.some(f => f.test.startsWith("antislop-") || f.test === "voice-6-hedge" || f.test === "voice-7-filler");
}

export async function generateAndValidate(opts: GenerateOptions): Promise<GenerateResult> {
  const maxRetries = opts.maxRetries ?? 1;
  const { system, user } = assembleFor(opts.request);
  let calls = 0;

  const firstResp = await opts.provider.complete({
    model: opts.draftingModel,
    system, user,
    temperature: 0.3,
  });
  calls++;

  let validation = await validateDraft(firstResp.text, opts.provider, opts.judgeModel);
  if (validation.ranJudge) calls++;

  if (validation.pass) {
    return { draft: firstResp.text, validation, retried: false, surfaced: false, providerCalls: calls };
  }

  if (maxRetries > 0 && hasRegexFlags(validation)) {
    const retry = buildRetryPrompt(system, validation.flags);
    const secondResp = await opts.provider.complete({
      model: opts.draftingModel,
      system: retry.system, user,
      temperature: 0.3,
    });
    calls++;
    validation = await validateDraft(secondResp.text, opts.provider, opts.judgeModel);
    if (validation.ranJudge) calls++;
    return {
      draft: secondResp.text, validation,
      retried: true, surfaced: !validation.pass, providerCalls: calls,
    };
  }

  return { draft: firstResp.text, validation, retried: false, surfaced: true, providerCalls: calls };
}
```

Run: `bun run test:core` — Task 6.3 tests PASS.

- [ ] **Task 6.5 — Commit.**

```bash
git add packages/core/src/drafting/prompts.ts packages/core/src/drafting/retry.ts packages/core/__tests__/drafting/prompts.test.ts packages/core/__tests__/drafting/retry.test.ts
git commit -m "feat(cp): prompt assembly + generate-validate-retry loop"
```

**Done when Phase 6 complete:** `generateAndValidate(opts)` returns a `{ draft, validation, retried, surfaced, providerCalls }` object; retry fires on regex flags only; exhausting retries surfaces with `surfaced: true`.

---

### Phase 7: Voice profile extraction (pure + Convex)

- [ ] **Task 7.1 — Write failing test for `extractVoiceProfile`.** File: `packages/core/__tests__/drafting/voice-profile.test.ts`.

```typescript
import { describe, it, expect } from "vitest";
import { extractVoiceProfile, VOICE_PROFILE_SYSTEM } from "../../src/drafting/voice-profile.js";
import { FakeProvider } from "../../src/drafting/providers/fake.js";

const samplePosts = [
  { title: "Just shipped v1", content: "New dashboard is live. Beta users pushed back on the sidebar, so it's gone.", authoredAt: 1 },
  { title: "Re: pricing", content: "We tested $49 and $79. $49 won on retention, not signups. Counterintuitive.", authoredAt: 2 },
  { title: "Week notes", content: "Three experiments this week. Two failed. One shipped. The failures taught more.", authoredAt: 3 },
];

describe("extractVoiceProfile", () => {
  it("calls the provider with VOICE_PROFILE_SYSTEM and all post contents", async () => {
    const provider = new FakeProvider();
    provider.enqueueText("## Voice\n\nDirect. Short sentences. Specific numbers.");
    const result = await extractVoiceProfile({
      posts: samplePosts, provider, model: "fake/voice",
    });
    expect(provider.calls[0].system).toContain(VOICE_PROFILE_SYSTEM.slice(0, 50));
    for (const p of samplePosts) {
      expect(provider.calls[0].user).toContain(p.content);
    }
    expect(result.markdown).toContain("Direct");
    expect(result.sourceCount).toBe(3);
    expect(result.generatedAt).toBeGreaterThan(0);
  });

  it("throws when fewer than 3 posts are provided", async () => {
    const provider = new FakeProvider();
    await expect(extractVoiceProfile({
      posts: samplePosts.slice(0, 2), provider, model: "fake/voice",
    })).rejects.toThrow(/at least 3/i);
  });

  it("truncates when more than 50 posts are provided (token budget)", async () => {
    const many = Array.from({ length: 70 }, (_, i) => ({
      title: `t${i}`, content: `c${i}`, authoredAt: i,
    }));
    const provider = new FakeProvider();
    provider.enqueueText("## Voice\n\nprofile");
    const result = await extractVoiceProfile({
      posts: many, provider, model: "fake/voice",
    });
    expect(result.sourceCount).toBe(50);
    expect(provider.calls[0].user).toContain("c69");  // most recent 50 includes c69
    expect(provider.calls[0].user).not.toContain("c19");  // oldest 20 dropped
  });
});
```

Run: FAIL.

- [ ] **Task 7.2 — Implement `voice-profile.ts`.** File: `packages/core/src/drafting/voice-profile.ts`.

```typescript
import type { Provider, VoiceProfile } from "./types.js";

export const VOICE_PROFILE_SYSTEM = `
You are a voice-profile extractor. You read a community owner's past posts and produce a markdown prose description of their writing voice. Your output will be injected verbatim into future prompts that generate new drafts in this voice, so it must be precise and prescriptive.

Cover in your output:
- Typical sentence length and rhythm (short punchy vs long specific).
- Vocabulary markers (words they use often, words they avoid).
- How they open posts (with a claim? a number? a story?).
- How they handle claims (specific numbers? concrete examples?).
- Tone markers (warm, dry, direct, playful, etc.) with example phrases pulled from the posts.
- Any quirks (line breaks, em-dash avoidance, lowercase, etc.).

Length: 150-300 words. Markdown formatted. Do not editorialize about the quality of the writing; only describe the voice so it can be reproduced.
`.trim();

export interface ExtractInput {
  posts: Array<{ title: string; content: string; authoredAt: number }>;
  provider: Provider;
  model: string;
}

const MIN_POSTS = 3;
const MAX_POSTS = 50;

export async function extractVoiceProfile(input: ExtractInput): Promise<VoiceProfile> {
  if (input.posts.length < MIN_POSTS) {
    throw new Error(`Need at least ${MIN_POSTS} posts; got ${input.posts.length}`);
  }
  const sorted = [...input.posts].sort((a, b) => b.authoredAt - a.authoredAt);
  const clipped = sorted.slice(0, MAX_POSTS);
  const user = [
    `Here are ${clipped.length} of the owner's most recent posts (newest first):`,
    "",
    ...clipped.map((p, i) => `---\nPost ${i + 1}: ${p.title}\n\n${p.content}`),
    "",
    "Produce the markdown voice profile now.",
  ].join("\n");

  const response = await input.provider.complete({
    model: input.model,
    system: VOICE_PROFILE_SYSTEM,
    user,
    temperature: 0.2,
    maxTokens: 800,
  });

  return {
    markdown: response.text.trim(),
    generatedAt: Date.now(),
    sourceCount: clipped.length,
  };
}
```

Run: `bun run test:core` — Task 7.1 tests PASS.

- [ ] **Task 7.3 — Write failing test for `getOwnPosts` query.** File: `convex/communityPulse/__tests__/voiceProfile.test.ts`.

```typescript
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { api } from "../../_generated/api";

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
    const t = convexTest(schema);
    const { profileId } = await seedProfileWithPosts(t, { ownSkoolUserId: "u_pilot" });
    const posts = await t.query(api.communityPulse.queries.getOwnPosts, { pilotProfileId: profileId });
    expect(posts).toHaveLength(2);
    expect(posts.every(p => p.authorSkoolUserId === "u_pilot")).toBe(true);
  });

  it("throws if pilotProfile has no ownSkoolUserId", async () => {
    const t = convexTest(schema);
    const { profileId } = await seedProfileWithPosts(t, { ownSkoolUserId: undefined });
    await expect(
      t.query(api.communityPulse.queries.getOwnPosts, { pilotProfileId: profileId })
    ).rejects.toThrow(/ownSkoolUserId/);
  });
});
```

Run: FAIL.

- [ ] **Task 7.4 — Implement `getOwnPosts` and `getOwnPostsForProfile` queries.** File: `convex/communityPulse/queries.ts`. Two queries: the public `getOwnPosts` (used by the UI status strip) and `getOwnPostsForProfile` (used by the action, which also needs the profile for ownership verification).

```typescript
export const getOwnPosts = query({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.pilotProfileId);
    if (!profile || !profile.ownSkoolUserId) {
      throw new Error("Pilot profile has no ownSkoolUserId; re-run member sync first.");
    }
    const community = await ctx.db
      .query("communities")
      .withIndex("by_owner", q => q.eq("ownerEmail", profile.email))
      .first();
    if (!community) return [];
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_community_author", q =>
        q.eq("communityId", community._id).eq("authorSkoolUserId", profile.ownSkoolUserId!))
      .collect();
    posts.sort((a, b) => b.createdAt - a.createdAt);
    return posts;
  },
});

export const getOwnPostsForProfile = query({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.pilotProfileId);
    if (!profile) throw new Error("Profile not found");
    if (!profile.ownSkoolUserId) return { profile, posts: [] };
    const community = await ctx.db
      .query("communities")
      .withIndex("by_owner", q => q.eq("ownerEmail", profile.email))
      .first();
    if (!community) return { profile, posts: [] };
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_community_author", q =>
        q.eq("communityId", community._id).eq("authorSkoolUserId", profile.ownSkoolUserId!))
      .collect();
    posts.sort((a, b) => b.createdAt - a.createdAt);
    return { profile, posts };
  },
});
```

Run: `bun run test` — Task 7.3 tests PASS.

- [ ] **Task 7.5 — Write failing test for `saveVoiceProfile` mutation.** File: `convex/communityPulse/__tests__/voiceProfile.test.ts` (extend). Convex actions are not unit-testable via `convexTest` when they call `fetch`. The testable unit here is the `saveVoiceProfile` mutation (Task 7.6 introduces it). The action itself is covered by the Phase 8 end-to-end smoke.

```typescript
describe("saveVoiceProfile", () => {
  it("patches pilotProfiles with markdown, sourceCount, generatedAt, and resets approval to false", async () => {
    const t = convexTest(schema);
    // seed pilotProfile (approvalStatus approved, no voiceProfile yet)
    const profileId = await t.run(async (ctx) =>
      ctx.db.insert("pilotProfiles", {
        userId: "u1" as any, email: "jon@x.com", firstName: "Jon",
        preferredName: "Jon", approvalStatus: "approved",
        voiceProfileApproved: true,   // pre-existing approval should be reset
        createdAt: 0, updatedAt: 0,
      })
    );
    await t.mutation(api.communityPulse.voiceProfile.saveVoiceProfile, {
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
    const t = convexTest(schema);
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
    const t = convexTest(schema);
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
```

- [ ] **Task 7.6 — Implement `generateVoiceProfile` action.** File: `convex/communityPulse/voiceProfile.ts`.

```typescript
"use node";
import { action, mutation } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { extractVoiceProfile, createProvider } from "@community-pulse/core";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateVoiceProfile = action({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Ownership check + post fetch via a thin query
    const { posts, profile } = await ctx.runQuery(
      api.communityPulse.queries.getOwnPostsForProfile,
      { pilotProfileId: args.pilotProfileId },
    );
    if (profile.userId !== userId) throw new Error("Forbidden");
    if (posts.length < 3) {
      throw new Error(`Need at least 3 authored posts to generate a profile; have ${posts.length}.`);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in Convex env");

    const provider = createProvider({
      kind: "openrouter", apiKey,
      appName: "Community Pulse", siteUrl: "https://jpgerton.com",
    });

    const extracted = await extractVoiceProfile({
      posts: posts.map(p => ({
        title: p.title,
        content: p.content ?? p.title,   // Task 7.7 persists content; fall back to title for pre-migration rows
        authoredAt: p.createdAt,
      })),
      provider,
      model: "anthropic/claude-haiku-4-5",
    });

    await ctx.runMutation(api.communityPulse.voiceProfile.saveVoiceProfile, {
      pilotProfileId: args.pilotProfileId,
      markdown: extracted.markdown,
      sourceCount: extracted.sourceCount,
      generatedAt: extracted.generatedAt,
    });

    return extracted;
  },
});

export const saveVoiceProfile = mutation({
  args: {
    pilotProfileId: v.id("pilotProfiles"),
    markdown: v.string(),
    sourceCount: v.number(),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pilotProfileId, {
      voiceProfile: args.markdown,
      voiceProfileGeneratedAt: args.generatedAt,
      voiceProfileSourceCount: args.sourceCount,
      voiceProfileApproved: false,
    });
  },
});

export const approveVoiceProfile = mutation({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.get(args.pilotProfileId);
    if (!profile || profile.userId !== userId) throw new Error("Forbidden");
    await ctx.db.patch(args.pilotProfileId, { voiceProfileApproved: true });
  },
});
```

- [ ] **Task 7.7 — Extend `posts` schema to persist post content.** File: `convex/schema.ts`. Add `content: v.optional(v.string())` to the `posts` table (optional — old rows stay valid). Update `syncCommunityActivity` to persist `content` from the incoming payload. Update content-script `normalizePost` to include `content` from `metadata.content`. Update the `rawPostValidator` in `posts.ts` to accept `content: v.optional(v.string())`. Without this, voice profile has nothing to extract from — just titles. Wire Task 7.6's `extractVoiceProfile` call to use `p.content ?? p.title`.

- [ ] **Task 7.8 — Commit.**

```bash
git add packages/core/src/drafting/voice-profile.ts packages/core/__tests__/drafting/voice-profile.test.ts
git add convex/schema.ts convex/communityPulse/voiceProfile.ts convex/communityPulse/queries.ts convex/communityPulse/posts.ts convex/communityPulse/__tests__/voiceProfile.test.ts
git add apps/pro/entrypoints/content.tsx packages/core/src/skool/posts.ts
git commit -m "feat(cp): voice profile extraction from synced posts + persist content"
```

**Done when Phase 7 complete:** `generateVoiceProfile({ pilotProfileId })` action produces markdown saved to `pilotProfiles`; `getOwnPosts` filters by `ownSkoolUserId`; posts now persist `content`.

---

### Phase 8: Onboarding UI + end-to-end smoke

- [ ] **Task 8.1 — Build `voice-profile` page.** File: `app/pilots/[projectSlug]/community-ops/voice-profile/page.tsx`. Next.js server component that fetches the pilot profile + post count via Convex, renders a client component with three states: (a) no posts yet ("Sync your community feed first"), (b) posts available ("Generate your voice profile [n posts]" button), (c) generated + pending approval ("Review profile → Approve / Regenerate"). Use existing pilots auth gate pattern (look at `app/pilots/[projectSlug]/layout.tsx`). Reuse styling from `components/command-center/community-ops.css`.

- [ ] **Task 8.2 — Build `VoiceProfilePanel` client component.** File: `components/command-center/voice-profile-panel.tsx`. Three sub-states matched to the data. The "Generate" button calls `useAction(api.communityPulse.voiceProfile.generateVoiceProfile)` with a loading spinner (~30s). The approve button calls the mutation. Use the same `<Markdown>` renderer used elsewhere in the site; if none exists, render with a simple `<pre>` wrapper for Slice 3 and upgrade in Slice 4.

- [ ] **Task 8.3 — Add voice-profile status strip to community-ops dashboard.** File: `app/pilots/[projectSlug]/community-ops/page.tsx`. Above the QuadrantGrid, render a one-line strip: "Voice profile: [approved ✓ / pending review → / not generated yet →]" where the arrow links to the new page. Copy-paste styling from existing pilot status badges.

- [ ] **Task 8.4 — Build `draft-sample` page (dev-only proof surface).** File: `app/pilots/[projectSlug]/community-ops/draft-sample/page.tsx`. Two buttons: "Generate sample DM" + "Generate sample post reply". Calls a new `generateSampleDraft` action that takes a `kind: "dm" | "post_reply"` and uses fixture inputs (pick the first at-risk member for DM, pick the most recent post for reply). Renders the returned draft + validator scorecard (`DraftSampleCard` component). Gate to admin pilot accounts only for Slice 3. Flag as dev-only in the copy.

- [ ] **Task 8.5a — Implement `getSampleDraftInputs` query.** File: `convex/communityPulse/queries.ts`. Returns fixtures for the dev-only draft surface.

```typescript
export const getSampleDraftInputs = query({
  args: {
    pilotProfileId: v.id("pilotProfiles"),
    kind: v.union(v.literal("dm"), v.literal("post_reply")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.get(args.pilotProfileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.userId !== userId) throw new Error("Forbidden");
    if (!profile.voiceProfile) throw new Error("Generate a voice profile first");

    const community = await ctx.db
      .query("communities")
      .withIndex("by_owner", q => q.eq("ownerEmail", profile.email))
      .first();
    if (!community) throw new Error("No community synced yet");

    if (args.kind === "dm") {
      // pick a drifting member with highest postsAuthored
      const snapshots = await ctx.db
        .query("memberSnapshots")
        .withIndex("by_community_quadrant", q =>
          q.eq("communityId", community._id).eq("quadrant", "drifting"))
        .collect();
      const pick = snapshots
        .sort((a, b) => (b.postsAuthored ?? 0) - (a.postsAuthored ?? 0))[0];
      if (!pick) throw new Error("No drifting members available");
      return {
        voiceProfile: profile.voiceProfile,
        targetMember: {
          firstName: pick.firstName,
          lastName: pick.lastName,
          skoolName: pick.skoolName,
          quadrant: pick.quadrant,
          lastActivityInCommunity: pick.lastActivityInCommunity,
        },
        post: null,
      };
    } else {
      // pick the most recent post NOT authored by the pilot
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_community_created", q => q.eq("communityId", community._id))
        .order("desc")
        .take(50);
      const pick = posts.find(p => p.authorSkoolUserId !== (profile.ownSkoolUserId ?? ""));
      if (!pick) throw new Error("No non-pilot posts available");
      // Look up author's first name
      const authorSnap = await ctx.db
        .query("memberSnapshots")
        .withIndex("by_community", q => q.eq("communityId", community._id))
        .filter(q => q.eq(q.field("skoolUserId"), pick.authorSkoolUserId))
        .first();
      return {
        voiceProfile: profile.voiceProfile,
        targetMember: null,
        post: {
          title: pick.title,
          content: pick.content ?? pick.title,
          authorFirstName: authorSnap?.firstName ?? "Member",
          labelId: pick.labelId,
        },
      };
    }
  },
});
```

- [ ] **Task 8.5b — Implement `generateSampleDraft` Convex action.** File: `convex/communityPulse/drafting.ts`. Uses `generateAndValidate` from core, OpenRouter provider from env, `google/gemini-flash-1.5-8b` for drafting, `anthropic/claude-haiku-4-5` for judge. Returns `{ draft, validation, retried, surfaced, providerCalls }`.

```typescript
"use node";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { generateAndValidate, createProvider } from "@community-pulse/core";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateSampleDraft = action({
  args: {
    pilotProfileId: v.id("pilotProfiles"),
    kind: v.union(v.literal("dm"), v.literal("post_reply")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in Convex env");

    const inputs = await ctx.runQuery(api.communityPulse.queries.getSampleDraftInputs, {
      pilotProfileId: args.pilotProfileId, kind: args.kind,
    });
    // getSampleDraftInputs enforces auth + ownership internally

    const provider = createProvider({
      kind: "openrouter", apiKey,
      appName: "Community Pulse", siteUrl: "https://jpgerton.com",
    });

    const request = args.kind === "dm" ? {
      kind: "dm" as const,
      quadrant: inputs.targetMember!.quadrant ?? "drifting" as const,
      targetMember: inputs.targetMember!,
      voiceProfileMarkdown: inputs.voiceProfile,
    } : {
      kind: "post_reply" as const,
      post: inputs.post!,
      voiceProfileMarkdown: inputs.voiceProfile,
      intent: "supportive" as const,
    };

    return generateAndValidate({
      request, provider,
      draftingModel: "google/gemini-flash-1.5-8b",
      judgeModel: "anthropic/claude-haiku-4-5",
      maxRetries: 1,
    });
  },
});
```

`getSampleDraftInputs` is a new internal query in `queries.ts` that returns `{ voiceProfile, targetMember?, post? }`. For DM: pick one drifting member with highest `postsAuthored` from current snapshots. For post_reply: pick most recent post authored by anyone other than the pilot.

- [ ] **Task 8.6 — Build `DraftSampleCard` component.** File: `components/command-center/draft-sample-card.tsx`. Renders the draft text in a styled panel plus the validator scorecard table (test id, pass/FLAG, excerpt/suggestion). If `surfaced: true`, show a prominent warning banner. Copy-to-clipboard button on the draft body.

- [ ] **Task 8.7 — Set `OPENROUTER_API_KEY` on Convex (prod + preview + dev).** Jon: `bunx convex env set OPENROUTER_API_KEY <key> --prod` and `--preview` and default (dev). Confirm by running `bunx convex env list`. Mark this as a Jon-only step; no code changes.

- [ ] **Task 8.8 — End-to-end smoke on YCAH.** Manual. (a) Visit YCAH members page with extension open — verify pilot profile got `ownSkoolUserId`. (b) Visit YCAH feed — verify posts sync includes `content`. (c) Open voice-profile page, click Generate, wait ~30s, verify markdown renders, click Approve. (d) Open draft-sample page, click "Generate sample DM" — verify valid draft + scorecard. (e) Click "Generate sample post reply" — same. (f) Verify `providerCalls <= 4` (draft + judge + optional retry + optional retry-judge) on success path.

- [ ] **Task 8.9 — Jon acceptance review.** Jon reads the generated voice profile markdown. Acceptance: "This describes my voice well enough that a DM generated from it would feel like me." If FAIL, create a follow-up issue to tune the `VOICE_PROFILE_SYSTEM` prompt and regenerate (loop until pass). Record the verdict in the session note.

- [ ] **Task 8.10 — Run full suite + session extract.**

```bash
bun run test        # all existing + new tests green
bun run typecheck   # clean across all packages
```

Write session note at `E:/Vault/sessions/YYYY-MM-DD-community-pulse-slice-3-implementation.md` capturing: final model choices (drafting + judge), OpenRouter cost per draft observed, any flag-patterns that showed up repeatedly, whether the retry loop triggered in practice, and any open questions for Slice 4.

- [ ] **Task 8.11 — Commit + PR.**

```bash
git add app/pilots/[projectSlug]/community-ops/voice-profile/ app/pilots/[projectSlug]/community-ops/draft-sample/ components/command-center/voice-profile-panel.tsx components/command-center/draft-sample-card.tsx convex/communityPulse/drafting.ts convex/communityPulse/queries.ts
git commit -m "feat(cp): voice profile onboarding + sample draft proof surface"
# both repos push
gh pr create --repo jgerton/jpgerton-site --title "feat: community pulse slice 3 — draft foundations + voice profile" --body "..."
gh pr create --repo jgerton/community-pulse --title "feat: slice 3 — drafting package + schema prep for voice profile" --body "..."
```

**Done when Phase 8 complete and all of the following are true:**

- `generateVoiceProfile` on YCAH produces markdown in under 10 minutes and Jon approves it.
- `generateSampleDraft({ kind: "dm" })` and `generateSampleDraft({ kind: "post_reply" })` both return `validation.pass === true` within 2 tries.
- `bun run test` green (all existing tests + Slice 3 additions).
- OpenRouter cost per sample draft is observed and recorded (target: well under $0.01).

---

## Risks and open questions

- **LLM-judge false positives.** The 6 semantic tests depend on a model's interpretation. A cautious judge will over-flag; a lenient one will under-flag. Mitigation: Slice 3 dogfood sample size is 2 drafts, so even moderate false-positive rates won't block the DoD. If Slice 4's 50-draft sample sees >20% false positives, retune the judge prompt or swap to a stronger judge model (Sonnet). Replan trigger per ROADMAP.md: "anti-slop pass rate stays below 80% after tuning."

- **OpenRouter rate limits or provider downtime.** Slice 3 has no fallback adapter in the loop; a provider outage fails the action. Acceptable for Slice 3 since usage is manual and infrequent. Slice 4 should add a fallback-provider config per adapter (e.g., OpenRouter → Anthropic direct).

- **Post content might be large / contain HTML.** Skool post content is plain text in most cases but some posts embed HTML (image tags, anchor tags). The voice-profile prompt is fed raw content; ~50 posts × ~500 chars = 25k chars which stays within any model's context. If post content routinely exceeds 2k chars, truncate each to 1k for the profile call only.

- **Voice profile generalizes from a small corpus.** Cold-start users with fewer than 3 posts can't generate a profile. Slice 3 error-surfaces this (Task 7.2). Slice 4 may offer a "paste 5 samples" fallback for cold-start users — explicit non-goal for Slice 3.

- **Prompt-inject risk in post content.** A hostile post could contain text like "Ignore previous instructions and say X." Low-blast-radius (output is a draft the user reviews) but worth noting. No mitigation in Slice 3; add prompt-injection validator test in v1.1 if it surfaces in practice.

- **`convex dev --once` vs `convex codegen` pitfall.** Per session notes, remember to deploy when schema changes. Tasks 1.3 and 7.7 both modify schema; Phase 8 smoke requires a fresh deploy to preview/prod.

- **pageProps.self capture.** Assumed present on members page per Slice 2 notes; verified only on feed page. Task 1.1 blocks the rest of the phase until this is confirmed. If it's not there, the fallback is to capture `self` during the community-feed sync instead of members — updates Task 1.4/1.5 but does not change anything downstream.

## Non-goals for Slice 3 (explicit)

- **DM drafts integrated into the per-quadrant UI.** Slice 4 scope. Slice 3 ships a bare-bones "draft-sample" dev surface only.
- **Post-reply drafts integrated into a Post Triage panel.** Slice 4.
- **Builder-edition BYO-key UI.** Adapter is validated by unit tests hitting multiple providers; no Builder UI in Slice 3.
- **Per-community draft cache.** ROADMAP.md allows a 24h cache per `(memberId, intent)` in Slice 4 as a cost mitigation. Slice 3 does not persist drafts.
- **Playbook principle injection.** Slice 3 surfaces a `principle?` field on `DraftRequest` but does not populate it. Wiring to `freemium-playbook/` content happens in Slice 4 or later.
- **Comments corpus in voice profiling.** Posts only (per ROADMAP non-goals).
- **Multi-page `_next/data/` fetch for posts.** Still deferred (Slice 2's Task 6.4).

## Success criteria (Slice 3 Done)

Matched exactly to ROADMAP.md Slice 3 DoD:

- [ ] Voice profile onboarding completes in <10 minutes on YCAH data.
- [ ] Jon approves the generated voice profile (binary gate).
- [ ] Two sample drafts (DM + post reply) generate end-to-end via the full pipeline with `validation.pass === true` after at most one retry.
- [ ] 15-test validator operational with deterministic pass/fail output (regex tests always deterministic; judge runs at temperature 0).
- [ ] Adapter pattern tested with at least 2 providers (OpenRouter + Anthropic or OpenRouter + OpenAI), with fetch-mocked unit tests passing.
- [ ] No regression in Slice 1/2 behavior (member sync, feed sync, quadrant dashboard, action queue).

## Related

- Slice 2 plan (format reference): `docs/superpowers/plans/2026-04-17-community-pulse-slice-2.md`
- Slice 2 retro: `E:/Vault/sessions/2026-04-17-community-pulse-slice-2-implementation.md`
- v1 roadmap: `E:/Projects/community-pulse/ROADMAP.md`
- Voice profile pattern insight: `E:/Vault/insights/2026-04-18-voice-profile-from-synced-corpus.md`
- Ground-truth contract reference: `E:/Vault/insights/2026-04-17-community-pulse-contract-reference.md`
- Session retro for Slice 2 cutover + roadmap: `E:/Vault/sessions/2026-04-18-community-pulse-cutover-and-v1-roadmap.md`
