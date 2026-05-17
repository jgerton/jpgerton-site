# Agent OS Pilot Section + n8n Bridge + Webhook Rename

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three deliverables in one session: (A) stand up a dockerized n8n bridge instance on the current machine until the mini-PC arrives 2026-05-04; (B) rename the stale Zapier webhook in jpgerton-site to a generic `/webhook/ycah-member` path; (C) build the agent-os pilot section in jpgerton.com/pilots -- 5 modules, 5 exercises, no approval gating (alpha Option C), accessible at `/pilots/docs/agent-os/build-1/`.

**Locked decisions:**
- Project slug: `agent-os`
- Approval gating: Option C (none; existing YCAH-member auto-approve + manual pending is sufficient for 10-seat alpha)
- Build 1: 5 modules, 5 exercises (1 per module)
- n8n location: `~/n8n-local/` standalone dir committed to a new `n8n-config` repo
- Webhook rename branch: `feat/webhook-rename`
- `syncSource` field: leave existing `"zapier"` literal as-is; no schema migration
- Mini-PC OS: Ubuntu Server 22.04 LTS (headless); n8n runs in Docker container (~500-800 MB total)

**Kickoff doc:** `docs/2026-05-02-agent-os-pilot-section-kickoff.md`

**Spec:** `docs/superpowers/specs/2026-05-02-agent-os-pilot-section.md`

**Vault insight (n8n switch):** `E:/Vault/insights/2026-05-02-zapier-trial-ended-switched-to-local-n8n.md`

**Tech stack:** Next.js 15, Convex (`benevolent-hummingbird-297` prod), Fumadocs, Tailwind, bun, Docker

---

## Locked architecture

### Phase A: n8n Docker bridge

- Official `n8nio/n8n` image via Docker Compose
- Volume-mounted data dir for workflow persistence across restarts
- `restart: unless-stopped` policy
- `.env` file for `N8N_BASIC_AUTH_*` and `WEBHOOK_URL`
- Committed to `~/n8n-local/` + new `n8n-config` GitHub repo

### Phase B: Webhook rename

- `convex/http.ts`: path `/zapier/ycah-member` -> `/webhook/ycah-member`; header `x-zapier-secret` -> `x-webhook-secret`; env var `ZAPIER_WEBHOOK_SECRET` -> `WEBHOOK_SECRET`
- `convex/ycahMembers.ts`: mutation renamed `syncFromZapier` -> `syncFromWebhook`; `syncSource` literal stays `"zapier"` (no schema migration)
- Convex prod env var updated via `bunx convex env set --prod WEBHOOK_SECRET <value>`
- Feature branch `feat/webhook-rename`, PR, merge to master

### Phase C: Pilot section

- `PilotExerciseWrapper`: swap hardcoded freemium-playbook import for a `projectSlug`-routed lookup across per-project `exercise-configs.ts` files
- `DocsPageWrapper`: make `buildModules` dynamic -- load from a per-project config map keyed by `projectSlug`
- New `content/pilots/agent-os/` subtree: meta.json, index.mdx, exercise-configs.ts, build-1/ with 5 module MDX files
- `content/pilots/index.mdx` and `content/pilots/meta.json` updated to surface agent-os on the hub
- No Convex schema changes; all pilot tables are already `projectSlug`-keyed

---

## File structure

### New files

```
~/n8n-local/
  docker-compose.yml
  .env.example

content/pilots/agent-os/
  meta.json
  index.mdx
  exercise-configs.ts
  build-1/
    meta.json
    index.mdx
    module-1.mdx    (Install vault-intake)
    module-2.mdx    (Configure your vault)
    module-3.mdx    (First capture)
    module-4.mdx    (Friction reporting)
    module-5.mdx    (Wishes + edge cases + surprises)
```

### Modified files

```
convex/http.ts                                         (webhook rename)
convex/ycahMembers.ts                                  (mutation rename)
components/pilots/pilot-exercise-wrapper.tsx           (multi-project routing)
components/pilots/docs-page-wrapper.tsx                (dynamic buildModules)
content/pilots/index.mdx                               (add agent-os card)
content/pilots/meta.json                               (add agent-os to pages array)
```

---

## Tasks

### Phase A: Dockerized n8n bridge

- [ ] **A1.** Pull `n8nio/n8n` Docker image; confirm Docker is running on current machine
- [ ] **A2.** Write `~/n8n-local/docker-compose.yml` with volume mount, restart policy, port 5678
- [ ] **A3.** Write `~/n8n-local/.env.example` (document required vars); copy to `.env` with real values
- [ ] **A4.** `docker compose up -d`; verify n8n UI accessible at `http://localhost:5678`
- [ ] **A5.** Create test workflow in n8n (simple webhook -> respond node); confirm webhook fires
- [ ] **A6.** `git init ~/n8n-local && git remote add origin <new n8n-config repo>`; commit compose file + .env.example (NOT .env); push

### Phase B: Webhook rename

- [ ] **B1.** Create branch `feat/webhook-rename` from master
- [ ] **B2.** In `convex/http.ts`: rename path, header name, env var reference
- [ ] **B3.** In `convex/ycahMembers.ts`: rename exported mutation `syncFromZapier` -> `syncFromWebhook`
- [ ] **B4.** Run `bun run test` -- confirm no test references to old names break
- [ ] **B5.** `bunx convex dev` -- confirm no type errors; Convex codegen picks up renamed mutation
- [ ] **B6.** `bunx convex env set --prod WEBHOOK_SECRET <value>` (copy value from existing `ZAPIER_WEBHOOK_SECRET`)
- [ ] **B7.** Dispatch Codex review on Phase B diff; apply findings autonomously
- [ ] **B8.** Commit with message `feat(webhook): rename zapier route to generic /webhook/ycah-member`; open PR; merge to master
- [ ] **B9.** Verify Convex prod deploy succeeded; smoke-test endpoint with `curl`

### Phase C: Agent OS pilot section

#### C1: Code changes

- [ ] **C1a.** Dispatch Codex to implement `PilotExerciseWrapper` refactor: swap hardcoded freemium-playbook import for a `projectSlug`-routed lookup map `{ "freemium-playbook": freemiumConfigs, "agent-os": agentOsConfigs }`. Read `components/pilots/pilot-exercise-wrapper.tsx` and `content/pilots/freemium-playbook/exercise-configs.ts` before writing. Output: updated component + stub `content/pilots/agent-os/exercise-configs.ts` with correct `ExerciseConfig` shape and placeholder entries.
- [ ] **C1b.** Dispatch Codex to implement `DocsPageWrapper` refactor: replace hardcoded `buildModules` array with a per-project config map keyed by `projectSlug`; freemium-playbook array becomes the `"freemium-playbook"` entry; agent-os entry uses 5-module titles from the spec. Read `components/pilots/docs-page-wrapper.tsx` before writing.
- [ ] **C1c.** Review Codex output for both components; apply or adjust as needed
- [ ] **C1d.** Run `bun run test`; confirm existing tests pass
- [ ] **C1e.** `bunx convex dev` type-check pass

#### C2: Content authoring

- [ ] **C2a.** Dispatch Codex to generate `content/pilots/agent-os/exercise-configs.ts`: 5 exercises (ex1-ex5) matching the `ExerciseConfig` type from freemium-playbook. Read `content/pilots/freemium-playbook/exercise-configs.ts` for the type shape and field conventions. Exercise content from spec module outlines. Review and refine output before committing.
- [ ] **C2b.** Write `content/pilots/agent-os/meta.json`
- [ ] **C2c.** Write `content/pilots/agent-os/index.mdx` (project intro, 3-tier context, vault portability, GitHub link, Elio design-partner mention)
- [ ] **C2d.** Write `content/pilots/agent-os/build-1/meta.json`
- [ ] **C2e.** Write `content/pilots/agent-os/build-1/index.mdx` (Build 1 intro: what to expect, how to use exercises, how feedback flows back)
- [ ] **C2f.** Write `module-1.mdx`: Install vault-intake (CLI path + Cowork/Claude Desktop path)
- [ ] **C2g.** Write `module-2.mdx`: Configure your vault (CLAUDE.md Vault Config block walkthrough)
- [ ] **C2h.** Write `module-3.mdx`: First capture (step-by-step through a real content piece)
- [ ] **C2i.** Write `module-4.mdx`: Friction reporting (structured prompts for what felt off)
- [ ] **C2j.** Write `module-5.mdx`: Wishes + edge cases + surprises (forward-indicator feedback)
- [ ] **C2k.** Update `content/pilots/index.mdx` to add agent-os project card
- [ ] **C2l.** Update `content/pilots/meta.json` to include agent-os in pages array

#### C3: Test and deploy

- [ ] **C3a.** `bun run dev`; navigate to `/pilots/docs/agent-os/`; confirm hub page renders
- [ ] **C3b.** Navigate to `/pilots/docs/agent-os/build-1/module-1`; confirm module renders, `DocsPageWrapper` loads correct module list for welcome modal
- [ ] **C3c.** Complete exercise ex1; confirm response saves to `pilotExerciseResponses` with `projectSlug: "agent-os"`
- [ ] **C3d.** Submit module feedback at end of module; confirm `pilotFeedback` row created
- [ ] **C3e.** Dispatch Codex review on Phase C code changes (C1a, C1b, exercise-configs.ts); apply findings autonomously
- [ ] **C3f.** Commit on feature branch `feat/agent-os-pilot-section`; open PR; merge to master
- [ ] **C3g.** Vercel auto-deploy; verify `/pilots/docs/agent-os/` is live on prod

### Phase D: Wrap-up

- [ ] **D1.** Update memory: `project_jpgerton_site_pilot_architecture.md` (canonical pilot infrastructure reference)
- [ ] **D2.** Update memory: `project_m1_implementation_progress.md` with agent-os pilot section live
- [ ] **D3.** Note follow-ups: (1) mini-PC n8n migration 2026-05-04; (2) wire first n8n workflow (Skool paid-member -> Convex `/webhook/ycah-member`); (3) decide Elio pilot site migration

---

## Sequence

```
Phase A (n8n bridge, ~45 min) -- independent, do first as warm-up
Phase B (webhook rename, ~45 min) -- small isolated change, own branch
Phase C (pilot section, ~3.5 hrs) -- bulk of session
  C1 code changes (~30 min) -> C2 content (~2.5 hrs) -> C3 test+deploy (~30 min)
Phase D (wrap-up, ~15 min)
```

Phases A and B can be done in either order. Phase C depends on B completing first (the renamed mutation reference may appear in content MDX examples if any).
