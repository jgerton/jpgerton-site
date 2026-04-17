# Community Pulse Slice 2: Community-Specific Scoring + Action Queue

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single Skool-wide engagement score with a 2x2 quadrant model (Skool-wide active/inactive x community active/inactive) driven by real `postTrees` data. Add an action queue that prescribes a different owner action per quadrant. Add follow-up tracking so actions become a lightweight CRM.

**Spec anchors:**
- Insight: `E:/Vault/insights/2026-04-17-community-engagement-2x2-matrix.md`
- Research: `E:/Vault/insights/2026-04-17-skool-posttrees-engagement-model.md`
- Slice 1 retrospective: `E:/Vault/sessions/2026-04-17-community-pulse-slice-1-implementation.md`

**Preconditions (must resolve before starting Task 1):**
- Run the DevTools snippet from the research insight on a logged-in YCAH feed page. Record: exact field name for post author userId, postTree children shape (if any), page size, default sortType. Paste findings into the top of this plan as **Verified field names**.
- Confirm `sortType: "newest-cm"` is the correct value for "newest comment" ordering.

**Verified field names (2026-04-17 capture on YCAH feed):**
- Post author field: `post.userId` (top-level, plus `post.groupId`, `post.rootId`, `post.postType`, `post.labelId`)
- Embedded author: `post.user` is a full `SkoolUser` (includes `metadata.lastOffline`, `metadata.spData`) — no separate members join needed to enrich author rows
- postTree children: `postTree` has only `{ post }`. Comment bodies/authors are NOT on the feed; require the post-detail page to get per-comment userIds and timestamps
- Page context also exposes: `self`, `currentGroup`, `channelId`, `leaderboardsData`, `settings`, `upcomingEvents`
- Metadata additions beyond existing types: `pinned: 0|1` (number, not boolean), `myView`, `myVote`, `lastCommentView`, `rca` (encoded activity marker)
- `contributors` JSON matches existing `SkoolContributor[]` exactly (id, name, first_name/last_name, metadata with picture URLs)
- `sortType: "newest-cm"` confirmed as default; `total` = 49 posts in YCAH feed at capture time
- Contributor truncation: NONE. Snippet 2 on YCAH (15 posts) showed `contribCount ≤ comments` with deduped unique participants including author (e.g. 10-comment post had 4 contribs — a 4-person back-and-forth thread). Safe to use `contributors` directly for unique-participant counts.
- Page size: not recorded (snippet 2 "posts on this page" line was truncated from output). Assume 20/page for MVP; confirm on first live sync.

**Architecture:**
- **Content script** gains a community-feed handler that ships `postTrees` to the background worker.
- **Background worker** batches post activity and calls a new Convex mutation `syncCommunityActivity`.
- **Convex scoring** adds `assignQuadrant` and a new `aggregateMemberActivity` helper.
- **Community Ops page** replaces the current risk tabs with a 4-tile quadrant grid; each tile opens a per-quadrant list with an action CTA.
- **Follow-up CRM** is a new `memberFollowups` table tracking `action`, `actedAt`, and `outcome` per member.

**Tech Stack:** Convex v1.x, Next.js 16, WXT, React 19, Chrome extension MV3, TypeScript, Vitest

---

## File Structure

### New Files (jpgerton-site)

```
convex/communityPulse/
  posts.ts                       # new: syncCommunityActivity mutation, getPostsByCommunity query
  followups.ts                   # new: logFollowup mutation, getFollowupsByMember query
  aggregation.ts                 # new: aggregateMemberActivity helper (pure fn, tested)
  __tests__/
    aggregation.test.ts          # new: tests for per-member post/contributor counts
    quadrant.test.ts             # new: tests for assignQuadrant
components/command-center/
  quadrant-grid.tsx              # new: 2x2 tile grid with counts + action blurbs
  action-card.tsx                # new: action prompt with "Mark done" / "Snooze" buttons
  follow-up-log.tsx              # new: inline history of actions taken on a member
app/pilots/[projectSlug]/community-ops/
  quadrant/[key]/page.tsx        # new: per-quadrant detail view with action queue
```

### Modified Files (jpgerton-site)

```
convex/schema.ts                          # add posts, memberFollowups tables; extend memberSnapshots
convex/communityPulse/scoring.ts          # add assignQuadrant + types
convex/communityPulse/sync.ts             # accept activity summary; write aggregated fields to snapshots
convex/communityPulse/queries.ts          # getDashboardSummary returns quadrant counts; add getMembersByQuadrant
convex/communityPulse/__tests__/scoring.test.ts  # expand with quadrant assignment tests
components/command-center/member-row.tsx         # add quadrant badge + deep link to Skool post
components/command-center/members-view.tsx       # replace segment tabs with QuadrantGrid
app/pilots/[projectSlug]/community-ops/page.tsx  # switch to quadrant summary as primary view
```

### New Files (community-pulse)

```
apps/pro/entrypoints/content/feed-handler.ts   # new: extracts postTrees + posts to background
apps/pro/entrypoints/background/sync-activity.ts   # new: batches posts -> Convex syncCommunityActivity
packages/core/src/skool/posts.ts               # new: normalizePost helper (handles ns timestamps, parses contributors)
packages/core/__tests__/posts.test.ts          # new
```

### Modified Files (community-pulse)

```
packages/core/src/types/skool.ts         # add authorSkoolUserId to SkoolPost after DevTools verification
apps/pro/entrypoints/content.tsx         # delegate to feed-handler when pageData has postTrees
apps/pro/entrypoints/background/index.ts # route new message types
```

---

## Schema Changes (convex/schema.ts)

```typescript
posts: defineTable({
  communityId: v.id("communities"),
  skoolPostId: v.string(),            // post.id
  skoolGroupId: v.string(),           // post.groupId (denormalized for faster queries)
  authorSkoolUserId: v.string(),      // post.userId (verified 2026-04-17)
  postType: v.string(),               // post.postType, e.g. "generic"
  labelId: v.optional(v.string()),    // post.labelId (category)
  title: v.string(),
  contributorIds: v.array(v.string()),
  commentCount: v.number(),           // metadata.comments
  upvotes: v.number(),
  pinned: v.boolean(),                // derived from metadata.pinned (0|1) -> bool
  createdAt: v.number(),              // ms, normalized from post.createdAt ISO
  lastCommentAt: v.optional(v.number()),  // ms, normalized from metadata.lastComment ns
  syncedAt: v.number(),
})
  .index("by_community_created", ["communityId", "createdAt"])
  .index("by_community_author", ["communityId", "authorSkoolUserId"]),

memberFollowups: defineTable({
  memberSnapshotId: v.id("memberSnapshots"),
  communityId: v.id("communities"),
  skoolUserId: v.string(),
  quadrant: v.union(
    v.literal("ambassador"), v.literal("drifting"),
    v.literal("loyal"), v.literal("at_risk"),
  ),
  action: v.string(),                 // "personal_checkin", "invite_to_lead", etc
  note: v.optional(v.string()),
  actedAt: v.number(),
  outcome: v.optional(v.string()),    // "responded", "no_response", "converted", etc
  outcomeAt: v.optional(v.number()),
})
  .index("by_member", ["skoolUserId", "communityId"])
  .index("by_community_acted", ["communityId", "actedAt"]),

// Extend existing memberSnapshots
memberSnapshots: defineTable({
  // ...existing fields
  postsAuthored: v.number(),
  postsCommentedOn: v.number(),
  lastActivityInCommunity: v.optional(v.number()),   // ms
  quadrant: v.union(
    v.literal("ambassador"), v.literal("drifting"),
    v.literal("loyal"), v.literal("at_risk"),
  ),
})
  // add index for quadrant queries
  .index("by_community_quadrant", ["communityId", "quadrant"]),
```

---

## Tasks

### Phase 1: Research Verification (blocks all other work)

- [ ] **Task 1.1 — Verify postTrees fields.** Jon runs the DevTools snippet from the research insight on a logged-in YCAH feed page. Paste the output into the **Verified field names** section above. If `post.userId` is not the actual author field, update the field names in Tasks 3.1 and 4.1 before implementing.

### Phase 2: Schema and Pure Functions (TDD, no side effects)

- [ ] **Task 2.1 — Write failing tests for `assignQuadrant`.** File: `convex/communityPulse/__tests__/quadrant.test.ts`. Cases: (a) skool=low + community active → ambassador, (b) skool=low + community inactive → drifting, (c) skool=medium|high + community active → loyal, (d) skool=medium|high + community inactive → at_risk. Also: boundary test at exactly 14 days since last community activity.
- [ ] **Task 2.2 — Implement `assignQuadrant`** in `convex/communityPulse/scoring.ts`. Takes `{ churnRisk, lastActivityInCommunity, now }` and returns the quadrant string. Keep pure (no `Date.now()` inside the function — pass `now` in).
- [ ] **Task 2.3 — Write failing tests for `aggregateMemberActivity`.** File: `convex/communityPulse/__tests__/aggregation.test.ts`. Given a member list and a post list, compute `{ postsAuthored, postsCommentedOn, lastActivityInCommunity }` per member. **Critical test:** a member who is the author of a post must NOT have that post counted in `postsCommentedOn` (contributors array includes author; subtract it).
- [ ] **Task 2.4 — Implement `aggregateMemberActivity`** in `convex/communityPulse/aggregation.ts`. Pure function over arrays. Uses `toMs` from scoring.ts for all timestamp normalization.

### Phase 3: Schema Migration

- [ ] **Task 3.1 — Add `posts` and `memberFollowups` tables and extend `memberSnapshots`** in `convex/schema.ts`. Mark the new memberSnapshots fields as `v.optional(...)` initially so existing snapshots remain valid during migration.
- [ ] **Task 3.2 — Backfill existing `memberSnapshots`.** One-off mutation `backfillQuadrants` that reads all current snapshots and defaults them to `at_risk` with zero counts. Safe to re-run (idempotent). Delete after first run.

### Phase 4: Server Sync Mutations

- [ ] **Task 4.1 — Write failing test for `syncCommunityActivity`.** Feed it a mock payload with 5 posts and 10 members. Expect the 10 memberSnapshots to receive updated `postsAuthored/postsCommentedOn/lastActivityInCommunity/quadrant` fields.
- [ ] **Task 4.2 — Implement `syncCommunityActivity`** in `convex/communityPulse/posts.ts`. Validates session, writes/upserts `posts` rows, calls `aggregateMemberActivity`, patches each memberSnapshot with its aggregated fields + assigned quadrant.
- [ ] **Task 4.3 — Add `logFollowup` mutation** in `convex/communityPulse/followups.ts`. Validates session, writes a `memberFollowups` row linked to the current snapshot.

### Phase 5: Queries

- [ ] **Task 5.1 — Add `getMembersByQuadrant`** in `convex/communityPulse/queries.ts`. Pagination by `lastActivityInCommunity desc`. Authenticated.
- [ ] **Task 5.2 — Extend `getDashboardSummary`** to return `{ ambassadorCount, driftingCount, loyalCount, atRiskCount }`.
- [ ] **Task 5.3 — Add `getFollowupsByMember`** for the follow-up history panel.

### Phase 6: Extension (Pro) — Feed Capture

- [ ] **Task 6.1 — Extract postTrees in content script.** `apps/pro/entrypoints/content.tsx` already detects `"postTrees" in pageData`. Replace the placeholder with a dispatch to `feed-handler.ts`.
- [ ] **Task 6.2 — Build `normalizePost` helper** in `packages/core/src/skool/posts.ts`. Parses contributors, converts ns timestamps, extracts author userId. Tested in `posts.test.ts`.
- [ ] **Task 6.3 — Background sync.** `sync-activity.ts` receives the normalized post list + community slug, looks up session token, calls `syncCommunityActivity`.
- [ ] **Task 6.4 — Multi-page fetch (optional for MVP).** If page size is small, use `_next/data/` fetch to pull pages 2..5 on the same visit. Gate behind a setting so it's off by default.

### Phase 7: UI — Community Ops Redesign

- [ ] **Task 7.1 — Build `QuadrantGrid`** component. 2x2 tiles (Ambassador, Drifting, Loyal, At Risk). Each tile: count, one-line action blurb, color coded (cool-accent for Ambassador/Loyal, warm-urgent for Drifting, danger for At Risk). Click opens the per-quadrant route.
- [ ] **Task 7.2 — Per-quadrant page `quadrant/[key]/page.tsx`.** Reuses `MemberRow` but adds an inline `ActionCard` at the top prescribing the action ("Send personal check-in to 3 drifting members"). Members list is `getMembersByQuadrant`.
- [ ] **Task 7.3 — Update `MemberRow`** to add a quadrant-colored dot in addition to the existing churn-risk dot (or replace — decide during review). Add a "Open in Skool" link using `post.id` of the member's most recent post; if no posts, link to their profile.
- [ ] **Task 7.4 — Action logging.** `ActionCard` exposes "Mark done" (logs to `memberFollowups`) and "Snooze 7 days" (logs with `outcome: "snoozed"`). Members with a recent follow-up move to the bottom of their quadrant list.
- [ ] **Task 7.5 — Follow-up history panel.** Click a member to expand `FollowUpLog`: chronological list of `memberFollowups`. Read-only, no editing in Slice 2.

### Phase 8: Verification

- [ ] **Task 8.1 — Run full Vitest suite.** All 11 existing + ~15 new tests pass.
- [ ] **Task 8.2 — End-to-end smoke on YCAH.** Log in to Skool, visit YCAH feed, click extension popup, confirm sync runs. Open Community Ops page, confirm quadrants are populated with non-zero counts for known ambassadors (e.g., Judy Lee).
- [ ] **Task 8.3 — Regression check.** The Slice 1 at-risk view still works under the new schema (via the `at_risk` quadrant).
- [ ] **Task 8.4 — Session extract.** Write a session note in `E:/Vault/sessions/YYYY-MM-DD-community-pulse-slice-2-implementation.md`.

---

## Risks and Open Questions

- **Page size + coverage.** If Skool returns only 20 posts per page and the extension captures only page 1, communities with >20 posts in the last 14 days will underreport contributions. Task 6.4 is the mitigation; consider making it default-on for Pro.
- **Pinned posts skew lastActivity.** Pinned posts may have recent `lastComment` timestamps from churned members. Exclude pinned from recency-driven signals but include in authored/contributed counts.
- **Contributor list truncation.** Skool may cap `contributors` to top N. If so, members in the long tail will appear "inactive in community" even when they commented. Flag for verification during Task 1.1 — check if a post with 50+ comments lists 50+ contributors.
- **Quadrant thrash.** A member who bounces between community-active and community-inactive daily will produce noisy action cards. Consider applying a 3-day hysteresis before re-classifying at_risk ↔ loyal.
- **`memberFollowups` growth.** Unbounded over time. Slice 3 concern; add retention policy later.

## Success Criteria

- Each quadrant in a real YCAH sync has at least one member assigned correctly (judged by manual inspection against owner intuition).
- Action cards render within 500ms of opening Community Ops.
- Follow-up logging persists across page reloads.
- Zero regression in Slice 1 at-risk detection.
