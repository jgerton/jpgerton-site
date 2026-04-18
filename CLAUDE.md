@AGENTS.md

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Community Pulse (Slice 1 + Slice 2, shipped 2026-04-17)

This repo hosts **both the Convex backend AND the Community Ops web UI** for the Community Pulse Chrome extension. The extension itself lives in [jgerton/community-pulse](https://github.com/jgerton/community-pulse).

### Convex tables (`convex/communityPulse/`)

- `communities` — one row per Skool community being tracked
- `memberSnapshots` — per-member state at sync time; includes churn risk (Slice 1) and 2x2 quadrant + community activity counts (Slice 2)
- `posts` — Slice 2 raw post records from the feed, keyed by `(communityId, skoolPostId)`
- `memberFollowups` — Slice 2 append-only CRM log of owner actions
- `extensionSessions` — auth tokens issued to the browser extension

### Key functions (`convex/communityPulse/`)

- `sync.ts` / `syncMembers` — extension-auth mutation, members page
- `posts.ts` / `syncCommunityActivity` — extension-auth mutation, community feed (Slice 2)
- `authActions.ts` / `createWebSession` — called from `/pilots/connect-extension` to issue an extension token
- `followups.ts` / `logFollowup` + `logFollowupWeb` — two parallel mutations for CRM logging (extension session vs website pilot)
- `queries.ts` — `getDashboardSummary`, `getAtRiskMembers`, `getMembersByQuadrant`, `getFollowupsByMember`, `getCommunityBySlug`
- `scoring.ts` — pure helpers: `computeEngagementScore`, `assessChurnRisk`, `assignQuadrant`, `toMs` (ns->ms timestamp normalizer)
- `aggregation.ts` — pure helpers: `aggregateMemberActivity`, `buildMemberPatches`
- `__tests__/` — 37 Vitest tests covering all pure helpers (run with `bun run test`)

### Routes

- `/pilots/connect-extension` — creates a session token and sends to the extension via `chrome.runtime.sendMessage` (uses a narrow ambient `chrome` declaration; no `@types/chrome` dep)
- `/pilots/[projectSlug]/community-ops` — primary dashboard with `QuadrantGrid`
- `/pilots/[projectSlug]/community-ops/quadrant/[key]` — per-quadrant detail with `ActionCard` + `FollowUpLog`

### Deployment

- Convex prod: `benevolent-hummingbird-297`
- Convex dev: `fiery-penguin-668`
- Vercel auto-deploys master; Preview env uses a separate Convex preview deploy key (creates fresh per-branch backends)

### Known follow-ups (non-blocking)

- Churn-risk stat cards on the header coexist with the quadrant grid — intentional or swap deliberately
- `cc-header.tsx` `DashboardSummary` interface is duplicated from the query return type; could unify
- Convex-level auth on queries (pre-existing Slice 1 follow-up; page-level `PilotsAuthGate` is currently the only gate)

### Reference

- Slice 2 plan: `docs/superpowers/plans/2026-04-17-community-pulse-slice-2.md`
- Vault session notes: `E:/Vault/sessions/2026-04-17-community-pulse-slice-{1,2}-implementation.md`
- 2x2 insight: `E:/Vault/insights/2026-04-17-community-engagement-2x2-matrix.md`
- postTrees data model: `E:/Vault/insights/2026-04-17-skool-posttrees-engagement-model.md`
