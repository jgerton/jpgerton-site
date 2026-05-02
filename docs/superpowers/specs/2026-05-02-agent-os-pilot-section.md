# Agent OS Pilot Section + n8n Bridge + Webhook Rename

**Date:** 2026-05-02
**Status:** Approved
**Plan:** `docs/superpowers/plans/2026-05-02-agent-os-pilot-section.md`
**Stack:** Next.js 15, Convex, Fumadocs, Tailwind, bun, Docker

---

## Overview

Three coordinated deliverables:

- **Phase A:** Local dockerized n8n instance bridging the gap until the mini-PC arrives 2026-05-04
- **Phase B:** Rename the stale Zapier webhook in `convex/http.ts` to a generic `/webhook/ycah-member` path (feature branch)
- **Phase C:** New `agent-os` pilot section at `/pilots/docs/agent-os/`, 5 modules, 5 exercises, no approval gating

No Convex schema changes required. All pilot tables are already `projectSlug`-keyed. The only Convex change is in Phase B (`http.ts` + mutation rename).

---

## Phase A: Dockerized n8n

### docker-compose.yml

Location: `~/n8n-local/docker-compose.yml`

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - GENERIC_TIMEZONE=America/Chicago
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### .env.example

```
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=changeme
WEBHOOK_URL=http://localhost:5678/
```

### .env (not committed)

Copy `.env.example` to `.env`; set real credentials. `.gitignore` must include `.env`.

### .gitignore

```
.env
```

### Verification

After `docker compose up -d`:
- `http://localhost:5678` loads n8n login screen
- Log in with basic auth credentials
- Create a webhook node; trigger it with `curl`; confirm execution log shows the request

### Mini-PC migration path (2026-05-04)

```
scp ~/n8n-local/docker-compose.yml ubuntu@<mini-pc-ip>:~/n8n-local/
ssh ubuntu@<mini-pc-ip>
cd ~/n8n-local && cp .env.example .env  # fill in credentials
docker compose up -d
```

Workflows are stored in the Docker volume `n8n_data`. To migrate existing workflows: export from current instance (n8n UI > Settings > Export), import on mini-PC after first boot.

---

## Phase B: Webhook rename

### convex/http.ts diff

```diff
- path: "/zapier/ycah-member",
+ path: "/webhook/ycah-member",

- const secret = request.headers.get("x-zapier-secret");
- const expectedSecret = process.env.ZAPIER_WEBHOOK_SECRET;
+ const secret = request.headers.get("x-webhook-secret");
+ const expectedSecret = process.env.WEBHOOK_SECRET;

- await ctx.runMutation(api.ycahMembers.syncFromZapier, {
+ await ctx.runMutation(api.ycahMembers.syncFromWebhook, {
```

### convex/ycahMembers.ts diff

```diff
- export const syncFromZapier = mutation({
+ export const syncFromWebhook = mutation({
```

`syncSource: "zapier"` literal left unchanged in the mutation body. The schema `v.union(v.literal("zapier"), v.literal("manual"))` stays as-is. Historical rows are not migrated. New rows written by `syncFromWebhook` will still carry `syncSource: "zapier"` -- this is acceptable; the field is an audit marker for the original sync source, and renaming it now would require a schema migration for marginal benefit.

### Convex prod env var

```bash
bunx convex env set --prod WEBHOOK_SECRET <value>
```

The value is the same secret currently stored as `ZAPIER_WEBHOOK_SECRET`. Retrieve from Convex dashboard before running. After the deploy, `ZAPIER_WEBHOOK_SECRET` can be deleted from Convex prod env.

### Branch and PR

Branch: `feat/webhook-rename`
Commit message: `feat(webhook): rename zapier route to generic /webhook/ycah-member`
No test file changes expected (existing tests don't cover the HTTP route handler).

---

## Phase C: Pilot section

### C1: PilotExerciseWrapper refactor

**File:** `components/pilots/pilot-exercise-wrapper.tsx`

Current state: hardcodes `import { exerciseConfigs } from "@/content/pilots/freemium-playbook/exercise-configs"`.

Target state: builds a config lookup from a static map of per-project configs, resolved by `projectSlug` from the URL.

```tsx
"use client";

import { useParams } from "next/navigation";
import { ExerciseCallout } from "./exercise-callout";
import { exerciseConfigs as freemiumConfigs } from "@/content/pilots/freemium-playbook/exercise-configs";
import { exerciseConfigs as agentOsConfigs } from "@/content/pilots/agent-os/exercise-configs";
import type { ExerciseConfig } from "@/content/pilots/freemium-playbook/exercise-configs";

const configsByProject: Record<string, Record<string, ExerciseConfig>> = {
  "freemium-playbook": freemiumConfigs,
  "agent-os": agentOsConfigs,
};

export function PilotExerciseWrapper({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children: React.ReactNode;
}) {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];

  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";

  const projectConfigs = configsByProject[projectSlug] ?? {};
  const config = projectConfigs[exerciseId];
  if (!config) return <div>Unknown exercise: {exerciseId}</div>;

  return (
    <ExerciseCallout
      exerciseId={exerciseId}
      title={config.title}
      fields={config.fields}
      prompt={config.prompt}
      emailBody={config.emailBody}
      emailSubject={config.emailSubject}
      projectSlug={projectSlug}
      buildSlug={buildSlug}
    >
      {children}
    </ExerciseCallout>
  );
}
```

### C2: DocsPageWrapper refactor

**File:** `components/pilots/docs-page-wrapper.tsx`

Current state: hardcodes `buildModules` array for freemium-playbook build-1.

Target state: per-project module manifest map. The map only needs titles and counts (used by WelcomeModal). Full content lives in MDX.

```tsx
type ModuleManifestEntry = {
  slug: string;
  title: string;
  sections: { id: string; title: string }[];
  exercises: { id: string; title: string }[];
};

const modulesByProject: Record<string, ModuleManifestEntry[]> = {
  "freemium-playbook": [
    {
      slug: "module-1",
      title: "The Economics of Free",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }, { id: "s5", title: "" }, { id: "s6", title: "" }, { id: "s7", title: "" }],
      exercises: [{ id: "ex1", title: "" }, { id: "ex2", title: "" }, { id: "ex3", title: "" }],
    },
    {
      slug: "module-2",
      title: "Your Two-Tier Architecture",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }, { id: "s5", title: "" }, { id: "s6", title: "" }],
      exercises: [{ id: "ex4", title: "" }, { id: "ex5", title: "" }, { id: "ex6", title: "" }],
    },
    {
      slug: "module-3",
      title: "Seed or Co-Create? Preparing to Launch",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }],
      exercises: [{ id: "ex7", title: "" }, { id: "ex8", title: "" }, { id: "ex9", title: "" }],
    },
    {
      slug: "module-4",
      title: "The First 100 Members",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }],
      exercises: [{ id: "ex10", title: "" }, { id: "ex11", title: "" }, { id: "ex12", title: "" }],
    },
  ],
  "agent-os": [
    {
      slug: "module-1",
      title: "Install vault-intake",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }],
      exercises: [{ id: "ex1", title: "" }],
    },
    {
      slug: "module-2",
      title: "Configure Your Vault",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }],
      exercises: [{ id: "ex2", title: "" }],
    },
    {
      slug: "module-3",
      title: "Your First Capture",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }],
      exercises: [{ id: "ex3", title: "" }],
    },
    {
      slug: "module-4",
      title: "Friction Reporting",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }],
      exercises: [{ id: "ex4", title: "" }],
    },
    {
      slug: "module-5",
      title: "Wishes, Edge Cases, and Surprises",
      sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }],
      exercises: [{ id: "ex5", title: "" }],
    },
  ],
};
```

In the component body, replace the `buildModules` const with:

```tsx
const buildModules = modulesByProject[projectSlug] ?? modulesByProject["freemium-playbook"];
```

### C3: Content directory structure

```
content/pilots/agent-os/
  meta.json
  index.mdx
  exercise-configs.ts
  build-1/
    meta.json
    index.mdx
    module-1.mdx
    module-2.mdx
    module-3.mdx
    module-4.mdx
    module-5.mdx
```

### C4: meta.json files

**`content/pilots/agent-os/meta.json`**

```json
{
  "title": "Agent OS",
  "pages": ["index", "build-1"]
}
```

**`content/pilots/agent-os/build-1/meta.json`**

```json
{
  "title": "Build 1: First Capture",
  "pages": ["index", "module-1", "module-2", "module-3", "module-4", "module-5"]
}
```

### C5: exercise-configs.ts

**`content/pilots/agent-os/exercise-configs.ts`**

Re-exports `ExerciseConfig` type; defines 5 exercises. Email subjects use `[PILOT-AGENT-OS-EX{N}]` prefix for inbox filterability.

```ts
import type { ExerciseConfig } from "@/content/pilots/freemium-playbook/exercise-configs";

export { ExerciseConfig };

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  ex1: {
    title: "Exercise 1: Install and verify vault-intake",
    fields: [
      {
        label: "Installation path",
        placeholder: "CLI / Claude Desktop / Cowork (pick one)",
      },
      {
        label: "Verification output",
        placeholder: "Paste the output of your first test run, or describe what you saw...",
      },
    ],
    prompt: `I just installed vault-intake as part of the Agent OS pilot.

My installation method: [CLI / Claude Desktop / Cowork]

What happened when I ran it: [paste output or describe]

Help me interpret what I'm seeing and confirm the installation is working correctly. If something looks wrong, help me diagnose it.`,
    emailBody: `Exercise 1: Install and verify vault-intake

Installation method (CLI / Claude Desktop / Cowork):

Verification output or description:

Any issues encountered:

`,
    emailSubject: "[PILOT-AGENT-OS-EX1] Install Verification",
  },
  ex2: {
    title: "Exercise 2: Write your Vault Config block",
    fields: [
      {
        label: "Your CLAUDE.md Vault Config block",
        placeholder: "Paste the full block you added to your CLAUDE.md...",
      },
      {
        label: "Domain list",
        placeholder: "What domains or topic areas did you include?",
      },
    ],
    prompt: `I'm configuring vault-intake by adding a Vault Config block to my CLAUDE.md.

Here's the block I wrote: [paste]

My domain list: [list your domains]

Review this config for me:
1. Are my domains specific enough to be useful, or too broad?
2. Is anything missing that would make captures more accurate?
3. Does the structure follow the vault-intake conventions?`,
    emailBody: `Exercise 2: Write your Vault Config block

Your CLAUDE.md Vault Config block (paste the full block):

Your domain list:

Questions or things you weren't sure about:

`,
    emailSubject: "[PILOT-AGENT-OS-EX2] Vault Config Block",
  },
  ex3: {
    title: "Exercise 3: Your first capture",
    fields: [
      {
        label: "What you captured",
        placeholder: "Describe the content: a video, article, conversation, doc...",
      },
      {
        label: "What landed",
        placeholder: "What came out of the capture that felt useful or accurate?",
      },
      {
        label: "What surprised you",
        placeholder: "Anything unexpected -- good or bad -- about how it processed?",
      },
    ],
    prompt: `I just ran my first capture with vault-intake.

What I captured: [describe the source]

What the capture produced: [describe or paste the output]

What landed well: [what felt useful or accurate]

What surprised me: [anything unexpected]

Help me understand whether this is a good capture. What signals indicate it worked well? What would indicate it needs tuning?`,
    emailBody: `Exercise 3: Your first capture

What you captured (source type and topic):

What the capture produced:

What landed well:

What surprised you:

`,
    emailSubject: "[PILOT-AGENT-OS-EX3] First Capture",
  },
  ex4: {
    title: "Exercise 4: Friction report",
    fields: [
      {
        label: "Friction items",
        placeholder: "Each item on its own line: what felt slow, confusing, broken, or annoying...",
      },
    ],
    prompt: `I've been using vault-intake and want to report friction points.

Here's what felt slow, confusing, broken, or annoying: [list]

For each item, help me think through whether it's:
1. A configuration issue I can fix myself
2. A workflow habit I need to change
3. Something that should be raised as a product issue

Be direct. I'm here to help improve the tool, not to validate it.`,
    emailBody: `Exercise 4: Friction report

List each friction item (one per line):

`,
    emailSubject: "[PILOT-AGENT-OS-EX4] Friction Report",
  },
  ex5: {
    title: "Exercise 5: Wishes, edge cases, and surprises",
    fields: [
      {
        label: "Wishes",
        placeholder: "What would you add, change, or remove if you could?",
      },
      {
        label: "Edge cases",
        placeholder: "Situations where vault-intake didn't handle something well or you weren't sure how to use it...",
      },
      {
        label: "Surprises",
        placeholder: "Anything that worked better than expected, or differently than you assumed?",
      },
    ],
    prompt: `I'm doing a forward-looking feedback pass on vault-intake after my first week of use.

Wishes (what I'd add, change, or remove): [list]

Edge cases I hit (situations it didn't handle well): [list]

Surprises (things that worked better or differently than I expected): [list]

Help me articulate these clearly so they're useful as product feedback. Push back if anything sounds more like a workaround than a real product need.`,
    emailBody: `Exercise 5: Wishes, edge cases, and surprises

Wishes (what you'd add, change, or remove):

Edge cases (situations it didn't handle well):

Surprises (better or different than expected):

`,
    emailSubject: "[PILOT-AGENT-OS-EX5] Wishes + Edge Cases + Surprises",
  },
};
```

### C6: Module outlines

#### index.mdx (project root)

Introduces agent-os as the umbrella product. Covers:
- What Agent OS is: a toolkit for knowledge workers who use AI daily, starting with vault-intake (structured Obsidian capture) and expanding to additional verticals
- The 3-tier YCAH context: Basic (self-serve AI tools, of which vault-intake is the first), Premium (guided workflows + community), Pro (personalized builds)
- The vault portability principle: your knowledge stays in your vault, under your control, in plain markdown
- Link to the GitHub repo (`https://github.com/jgerton/vault-intake`)
- Elio's role as the first design-partner pilot and what that means for how this section evolves
- How to use this pilot section: read the modules, do the exercises, submit responses via the web form or email, expect direct feedback in return

#### build-1/index.mdx (Build 1 intro)

Sets expectations for Build 1: "First Capture."
- What Build 1 covers: getting vault-intake installed and running your first real capture
- What it does NOT cover yet: advanced workflows, multi-source pipelines, automation
- How exercises work: short, one-response prompts; submit via form or email; no right answers, only useful answers
- How feedback flows back: responses are read directly; patterns that surface in multiple pilots inform the next build
- Time estimate: 1-2 hours total across 5 modules

#### module-1.mdx (Install vault-intake)

Intent: get the pilot from zero to a working installation with a verified first run. Two parallel paths -- CLI and Cowork/Claude Desktop -- so the module reads whichever is relevant.

Covers:
- Prerequisites: Node.js (CLI path) or Claude Desktop with MCP (Cowork path)
- CLI path: `npm install -g vault-intake` (or equivalent), initial config, first test run
- Cowork/Claude Desktop path: MCP server install, Claude Desktop config JSON, test invocation via chat
- What "verified" looks like: expected output from a successful first run
- Common issues: permission errors, path issues, MCP server not found

Exercise ex1: install using your chosen method; paste the verification output.

#### module-2.mdx (Configure your vault)

Intent: help the pilot write a CLAUDE.md Vault Config block that reflects their actual domains and workflow.

Covers:
- What the Vault Config block is and where it lives in CLAUDE.md
- The `domains` array: what makes a good domain entry (specific enough to be useful, broad enough to catch related content)
- The `vault_path` setting and how vault-intake resolves it
- Frontmatter defaults: what fields are added automatically to captured notes
- Example config for a practitioner-educator domain set

Exercise ex2: write your own Vault Config block; share your domain list; describe anything you weren't sure about.

#### module-3.mdx (First capture)

Intent: walk the pilot through capturing a real piece of content from start to finish.

Covers:
- Choosing a good first source: something you actually want to keep (video, article, transcript, document)
- Running the capture command (CLI) or invoking via chat (Cowork)
- Reading the output: what the generated note looks like, how frontmatter is populated, where the file lands
- Spot-checking the capture: is the content accurate? Are the tags right? Does the title match?
- What to do if something looks wrong: friction report vs. config adjustment

Exercise ex3: describe what you captured, what came out, what landed, what surprised you.

#### module-4.mdx (Friction reporting)

Intent: structure the pilot's first batch of friction feedback into something actionable.

Covers:
- What counts as friction: anything that slowed you down, confused you, required a workaround, or felt broken
- Three categories: config issue (fixable by pilot), workflow habit (fixable by pilot with practice), product issue (needs a fix in vault-intake)
- How to write a good friction report: specific, reproducible, one item per line
- What happens to friction reports: they go into a product log; patterns across pilots drive the Build 2 scope

Exercise ex4: list your friction items (free-form, one per line).

#### module-5.mdx (Wishes, edge cases, and surprises)

Intent: collect forward-looking signal -- what pilots want next, what edge cases they hit, and what exceeded expectations.

Covers:
- Wishes: features you want, things you'd remove, workflows you expected vault-intake to support
- Edge cases: sources it couldn't handle, outputs that were wrong or incomplete, situations where you weren't sure what to do
- Surprises: things that worked better than expected, or behaved differently than you assumed (positive or negative)
- Why this matters: surprises and edge cases are higher-signal than wishes for product prioritization

Exercise ex5: three free-form fields (wishes, edge cases, surprises).

### C7: Hub updates

**`content/pilots/index.mdx`** -- add agent-os card below the freemium-playbook entry:

```mdx
- [Agent OS Pilot](/pilots/docs/agent-os) - Build and test vault-intake, the first Agent OS tool: structured AI-powered capture for Obsidian vaults. 10-seat alpha; YCAH members get access.
```

**`content/pilots/meta.json`** -- add `"agent-os"` to the pages array:

```json
{
  "pages": ["index", "freemium-playbook", "agent-os"]
}
```

### C8: Approval gating decision (locked Option C)

No gating changes needed. The existing flow:

1. Pilot signs in via Google OAuth
2. `pilotProfiles.createProfile` runs; checks `ycahMembers` by email
3. YCAH members: `approvalStatus: "auto-approved"` immediately
4. Non-members: `approvalStatus: "pending"`; manual approval by Jon via Convex dashboard

This is sufficient for a 10-seat alpha where all initial pilots are YCAH members. Per-project allowlists (Option A/B) add complexity only needed when multiple projects have different access tiers. Defer to Build 2 planning if public signups open before then.

---

## Codex dispatch prompts

### For C1a (PilotExerciseWrapper)

> Read `components/pilots/pilot-exercise-wrapper.tsx` and `content/pilots/freemium-playbook/exercise-configs.ts`. Refactor `PilotExerciseWrapper` to route exercise config lookup by `projectSlug` using a static map: `{ "freemium-playbook": freemiumConfigs, "agent-os": agentOsConfigs }`. Also create a stub `content/pilots/agent-os/exercise-configs.ts` that exports a `exerciseConfigs` object with the correct `ExerciseConfig` type shape and 5 placeholder entries (ex1-ex5) with empty strings for all fields. Do not change any other files.

### For C1b (DocsPageWrapper)

> Read `components/pilots/docs-page-wrapper.tsx`. Replace the hardcoded `buildModules` const with a `modulesByProject` map. The `"freemium-playbook"` entry preserves the existing array exactly. The `"agent-os"` entry has 5 modules: "Install vault-intake" (ex1), "Configure Your Vault" (ex2), "Your First Capture" (ex3), "Friction Reporting" (ex4), "Wishes, Edge Cases, and Surprises" (ex5). Each module has 2-4 section stubs and 1 exercise stub. In the component body, replace the `buildModules` const with: `const buildModules = modulesByProject[projectSlug] ?? modulesByProject["freemium-playbook"];`. Do not change any other logic.

### For C2a (exercise-configs.ts)

> Read `content/pilots/freemium-playbook/exercise-configs.ts` to understand the `ExerciseConfig` type and field conventions. Write `content/pilots/agent-os/exercise-configs.ts` with 5 exercises (ex1-ex5) for a vault-intake pilot onboarding flow: ex1 (install and verify), ex2 (Vault Config block), ex3 (first capture), ex4 (friction report), ex5 (wishes + edge cases + surprises). Match the field structure, prompt style, emailBody format, and emailSubject prefix convention from the freemium-playbook file. Email subjects should use `[PILOT-AGENT-OS-EX{N}]` prefix. Prompts should be direct and practitioner-focused, not academic.

---

## Definition of done

- [ ] n8n UI loads at `http://localhost:5678`; test webhook fires successfully
- [ ] `curl -X POST https://benevolent-hummingbird-297.convex.site/webhook/ycah-member -H "x-webhook-secret: <value>" -d '{"name":"test","skoolTransactionId":"test-123"}' -w "%{http_code}"` returns 200
- [ ] `/pilots/docs/agent-os/` renders on local dev and on prod (Vercel)
- [ ] `/pilots/docs/agent-os/build-1/module-1` renders; WelcomeModal shows agent-os module list
- [ ] Exercise ex1 response saves with `projectSlug: "agent-os"` in Convex `pilotExerciseResponses`
- [ ] Module 1 end-of-module feedback form submits successfully
- [ ] freemium-playbook exercises still work (no regression)
- [ ] `bun run test` passes
