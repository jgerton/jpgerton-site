# Pilots Hub UI Redesign

**Date:** 2026-04-11
**Status:** Approved (all 6 sections)
**Project:** jpgerton.com/pilots
**Stack:** Next.js 16, Tailwind v4, Convex, MDX, Google OAuth

## Overview

Redesign the pilots hub from a plain MDX text dump into a modern, modular experience with research-backed content presentation, side navigation, onboarding, exercise tools, progress tracking, and feedback collection. All five priorities ship before inviting co-pilots.

**Priority order:** Layout/Nav (A) > Onboarding (D) > Exercise Tools (C) > Progress Tracking (E) > Feedback Collection (B)

## Key Decisions

- **jpgerton.com/pilots is the full experience.** Content, exercises, feedback, and detailed discussion all happen on the pilots site. YCAH Skool gets a promotional post with link. Wins/success stories welcome in YCAH feed. Detailed playbook discussion stays off Skool.
- **Ship everything, then invite.** Monolithic build of all five priorities. Framework is lightweight (Tailwind + MDX + Convex), changes are fast once pilots are generating feedback.
- **Separation of concerns throughout.** Each feature is its own set of components/hooks with clear boundaries. No tangling between layout, content rendering, progress tracking, exercises, and feedback.

---

## Section 1: Content Structure and Routing

### Route Structure

```
/pilots                              -> project listing (exists)
/pilots/[project]                    -> project overview + build list (exists)
/pilots/[project]/[build]            -> build preamble (modified)
/pilots/[project]/[build]/[module]   -> individual module page (new)
```

### File Structure

```
content/pilots/freemium-playbook/
  build-1/
    index.mdx          -> preamble + build manifest in frontmatter
    module-1.mdx        -> The Economics of Free
    module-2.mdx        -> Your Two-Tier Architecture
    module-3.mdx        -> Seed or Co-Create
    module-4.mdx        -> The First 100 Members
```

### Build Manifest (frontmatter in index.mdx)

```yaml
---
title: "The Freemium Community Playbook"
build: 1
status: ready
modules:
  - slug: module-1
    title: "The Economics of Free"
    sections: 7
    exercises: 3
  - slug: module-2
    title: "Your Two-Tier Architecture"
    sections: 6
    exercises: 3
  - slug: module-3
    title: "Seed or Co-Create? Preparing to Launch"
    sections: 5
    exercises: 3
  - slug: module-4
    title: "The First 100 Members"
    sections: 5
    exercises: 3
---
```

### Content Presentation Rules (Research-Backed)

1. **No accordions or collapsible sections.** Primary learning content stays fully visible. NN/g research: people scroll relevant, well-organized content. Hiding it adds interaction cost without improving comprehension. (Source: NN/g accordion research, RicketyRoo A/B test showing +14.7% scroll depth when accordions removed)

2. **Visual chunking via three layers.** Module headers, six callout types, and inline images create meaningful visual groups. Chunk meaningfulness matters more than chunk count. Short paragraphs, clear hierarchy, whitespace between groups. (Source: NN/g chunking research, Miller's law)

3. **Read time at two levels.** Module header shows total read time. Side nav shows per-section read time. (Source: Simpleview Europe study showing up to 40% engagement increase with read time estimates)

4. **Visual milestone breaks between sections.** Modules are 15-25 min reads (above the 5-10 min microlearning sweet spot). Clear visual breathing room at section boundaries lets pilots self-pace into smaller sessions. Not page breaks, just visual separation. (Source: eLearning Industry microlearning statistics showing 80% completion at 5-10 min vs 20-30% for longer formats)

5. **Exercises stay inline, visually prominent.** Primary task content must be visible (NN/g). Exercises use the indigo Exercise callout type. Reading is prep; the exercise is the destination.

6. **Progress data model uses timestamps, not booleans.** Tracks when a pilot last visited each section, not just "done/not done." Enables future spaced repetition prompts. (Source: microlearning retention research showing 25-60% improvement with spaced review)

### Three Visual Layers

**Layer 1: Module Headers** - dark gradient banner with module number, title, description, section count, exercise count, read time.

**Layer 2: Inline Images** - three types:
- Screenshots with browser chrome frame (showing Skool UI where text references it)
- Before/after comparisons (side by side)
- Diagrams (conceptual flows, could be Excalidraw in production)

**Layer 3: Six Callout Types** (MDX components)

| Type | Color | Border | Use Case |
|------|-------|--------|----------|
| Key Data | Teal (#0D9488) | Left 3px | Verified numbers, benchmarks, sourced claims |
| Insight | Amber (#F59E0B) | Left 3px | Principles, frameworks, mental models |
| Action | Green (#22C55E) | Left 3px | Concrete steps to take now |
| Exercise | Indigo (#6366F1) | Left 3px | Hands-on work with deliverables |
| Watch Out | Red (#EF4444) | Left 3px | Common mistakes, gotchas |
| Open Question | Purple (#A855F7) | Left 3px | What co-pilot data will answer |

Each callout has: gradient background, colored left border, icon + uppercase label, content area.

### Module-Level Frontmatter

Each module MDX file also needs frontmatter for its own metadata:

```yaml
---
title: "Your Two-Tier Architecture"
moduleNumber: 2
sections:
  - id: pricing-data
    title: "What the pricing data actually shows"
  - id: thinking-about-price
    title: "How to think about your price"
  - id: configuring-tiers
    title: "Configuring your Skool freemium tiers"
  - id: start-here-module
    title: "Building your Start Here module"
  - id: gamification
    title: "Setting up gamification level unlocks"
  - id: exercises
    title: "Exercises"
exercises:
  - id: ex4
    title: "Configure your tiers"
  - id: ex5
    title: "Build your Start Here module"
  - id: ex6
    title: "Set up gamification"
---
```

This frontmatter drives the sidebar section list, read time calculation, scroll spy anchor IDs, and exercise tracking. Section `id` values become the HTML heading anchors.

### What Stays the Same

- Convex `pilotProjects` and `pilotBuilds` tables
- File-system driven routing pattern
- Google OAuth via Convex Auth
- MDX authoring format

---

## Section 2: Layout and Side Navigation

### Research Basis

- 70% of users rely on sidebars for quick navigation (UX Design Trends 2025)
- Recommended sidebar width: 240-320px for text + icons (ALF Design Group 2026)
- Hamburger menus make nav "inherently less discoverable" even on mobile (NN/g, UX Planet)
- Sidebar must stay fixed while user scrolls (UX Planet, CSS-Tricks)

### Desktop Layout (>=1024px)

Two-column layout:
- **Left:** 260px sticky sidebar
- **Right:** Scrolling content area, max-width 720px (65-75 characters per line at 14-16px)

### Sidebar Content

- Project + build context at top (e.g., "Freemium Playbook / Build 1")
- Overview link (build preamble page)
- Module list with:
  - Module number (01, 02, etc.)
  - Module title
  - Read time
  - Progress indicator (empty circle / partial fill / checkmark)
- Active module is highlighted (teal left border, bold text) and expanded to show sections
- Only the active module's sections are expanded; others show title + read time only
- Sections show: name, per-section read time, read/unread dot
- Exercise count per module

### Scroll Spy

- Intersection Observer API (native, no polling)
- As pilot scrolls, the active section in sidebar highlights automatically
- Clicking a section smooth-scrolls to it within the page
- Clicking a different module navigates to that module's page

### Mobile Layout (<1024px)

- Sidebar becomes a context bar (always visible) showing current module name + "Sections" dropdown toggle
- Content goes full-width
- Expanding "Sections" shows a drawer/sheet with the section list
- Module header is compact on mobile

### Components

| Component | Responsibility |
|-----------|---------------|
| `PilotSidebar` | Reads build manifest, renders nav, handles scroll spy. No content rendering awareness. |
| `PilotLayout` | Two-column grid on desktop, stacked on mobile. Owns responsive breakpoint logic. |
| `ModuleHeader` | Renders dark banner. Props: title, module number, section count, exercise count, read time. |
| `MDXRenderer` | Extended with callout components. Renders module content. No layout awareness. |
| `MobileContextBar` | Current module + Sections toggle. Only renders below 1024px. |

---

## Section 3: First-Time Pilot Onboarding

### Research Basis

- Bad onboarding causes up to 80% abandonment before first use (DesignerUp, 200+ flow study)
- 3-step tours hit 72% completion (best of any length), from 58M tour interactions analyzed (Appcues)
- 2-step: 42% completion (too little value). 4-step: 45% (fatigue). 3 is the sweet spot.
- Effective onboarding increases retention by up to 50% (DesignerUp)
- "Get to the first win fast" and "always offer a skip option" (DesignerUp 200+ flow study)

### Design

Welcome modal (not tooltip tour). Pilots need context about the collaboration model before they see content. 3 screens, each one concept.

**Screen 1: Welcome**
- "Welcome, pilot."
- Acknowledges they're early, frames the build-in-public experiment
- Personal tone: "your experience, your results, and your honest feedback directly shape what this becomes"

**Screen 2: What You're Signing Up For**
- Read each build, do exercises, share feedback
- Three items with icons
- "No pressure" message: no meetings, no deadlines, no obligations
- Clear: this is self-paced

**Screen 3: Get Started**
- Shows all 4 modules as preview cards with read time + exercise count
- Module 1 is highlighted
- Big CTA: "Start Module 1"
- Note: "You can revisit this welcome anytime from the ? in the sidebar"

### Behavior

- Shown on first sign-in only (checked via Convex)
- Skip button on every screen
- Back button on screens 2-3
- Progress dots (1/3, 2/3, 3/3)
- "?" icon in sidebar re-opens anytime
- Dismissable, never forced

### Convex Table: `pilotOnboarding`

```
{
  userId: Id<"users">,
  completedAt: number | null,
  skippedAt: number | null,
  lastScreenSeen: number,        // 1, 2, or 3
}
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `WelcomeModal` | Renders 3-screen flow. Receives onboarding state, emits complete/skip. No layout awareness. |
| `useOnboarding` | Hook. Reads/writes `pilotOnboarding`. Returns `{ showWelcome, complete, skip, reopen }`. |
| `PilotLayout` | Checks `useOnboarding().showWelcome`, renders `WelcomeModal` if true. Single integration point. |

---

## Section 4: Exercise Tools

### Research Basis

- 89% better retention when theory combined with hands-on exercises (UX research workshops study)
- Multi-step forms boost completion up to 300% vs long single forms (Formstack, Responsify)
- 70%+ completion with coaching + community support vs 10-15% self-paced (Online Learning Statistics 2026)
- Letting users choose their preferred input channel increases completion (Fillout, Smart Insights)

### Design

Exercises stay inline within the module content, rendered via the Exercise callout (indigo). Below the exercise description, an interactive zone provides tools.

**Primary channel: Web form (Convex)**
- Text area(s) where pilots type their answer directly on the page
- Auto-saves as draft while typing
- Explicit "Save response" button to submit
- Pilot identity known from OAuth, no additional auth needed
- Lowest friction: already here, already reading, already authenticated

**Featured secondary: Copy prompt for Claude**
- Elevated above other alternatives (prominent button, not just a text link)
- Copies a well-crafted prompt to clipboard including exercise context, instructions, structured output format
- The prompt is a standalone thinking tool, not just fill-in-the-blanks
- Pilot works through the exercise conversationally with Claude, pastes result back into web form
- This is the most natural workflow for YCAH members (AI practitioners)

**Other alternatives: Email and Google Sheets**
- Email: mailto link to jgerton.ai.assistant@gmail.com with pre-filled subject line
- Google Sheets: link to pre-formatted template for data-heavy exercises
- Visually secondary to the Claude prompt option

**Saved state:** Drafts persist if pilot navigates away. Completed exercises show saved response with edit option.

### Email Subject Line System

Pattern: `[PILOT-{PROJECT}-{TYPE}{NUMBER}] {Description}`

```
[PILOT-PLAYBOOK-EX1] Free Tier Value Prop
[PILOT-PLAYBOOK-EX2] Free vs Gate Split
[PILOT-PLAYBOOK-EX3] Baseline Numbers
...
[PILOT-PLAYBOOK-FEEDBACK] General Feedback
[PILOT-PLAYBOOK-UX] Site Experience Feedback
```

### Convex Table: `pilotExerciseResponses`

```
{
  userId: Id<"users">,
  projectSlug: string,
  buildSlug: string,
  exerciseId: string,             // "ex1", "ex2", etc.
  response: string,
  channel: "web" | "email" | "sheets",
  status: "draft" | "submitted",
  createdAt: number,
  updatedAt: number,
}
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `ExerciseCallout` | MDX component. Renders description + interactive zone. Receives exerciseId, fields config. No Convex awareness. |
| `ExerciseForm` | Renders text areas, save button, auto-save logic. Child of ExerciseCallout. Writes via `useExercise`. |
| `ExerciseAlternatives` | Renders Claude prompt button (featured) + email/sheets options. Handles clipboard, mailto, Sheets link. No form state. |
| `useExercise` | Hook. Reads/writes `pilotExerciseResponses`. Returns `{ response, draft, save, submit, status }`. |

---

## Section 5: Progress Tracking

### Research Basis

- Endowed progress effect: people more motivated to complete tasks when they see progress, even if artificially shown (Arounda, Bricx Labs)
- Losing scroll position causes frustration; track by section/paragraph, not pixel offset (Smashing Magazine, DEV Community)
- Multi-dimensional progress dashboards (reading + exercises + time) more motivating than single progress bars (Artsy Course Experts, AccessAlly)
- Timestamps enable future spaced repetition; academic fatigue detection important for longer courses (eLearning Industry, Engageli)

### Design

**Two dimensions:** Reading progress (sections scrolled through) + Exercise progress (exercises with responses).

**Section-level granularity:** Each module has 5-7 sections. Tracking at this level means:
- "Resume where you left off" works within a module page
- Sidebar shows partial progress through a module
- Future spaced repetition has meaningful units to prompt

**Visual treatment: Subtle, not gamified.**
- Module indicators: empty circle (not started), partially filled circle (in progress), green checkmark (complete)
- Section indicators: small dots (teal = read, gray = unread)
- Exercise counts per module (e.g., "1/3 exercises")
- Overall build progress bar at sidebar top
- No badges, streaks, or celebration animations. Professional tone.

**Resume prompt:** When a pilot returns to a partially-read module, a subtle banner offers to scroll to where they left off. "Pick up where you left off? You were reading 'Configuring your Skool freemium tiers'" with Dismiss and Resume buttons.

### Convex Table: `pilotProgress`

```
{
  userId: Id<"users">,
  projectSlug: string,
  buildSlug: string,
  moduleSlug: string,
  sectionId: string,              // heading anchor id
  firstVisitedAt: number,
  lastVisitedAt: number,          // for spaced repetition later
}
// Index: by_user_module ["userId", "projectSlug", "buildSlug", "moduleSlug"]
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `useProgress` | Hook. Reads `pilotProgress` for current user + module. Returns section visit states. Writes on Intersection Observer triggers. |
| `SectionObserver` | Wraps module content. Attaches Intersection Observer to each section heading. Fires `useProgress` updates as sections enter viewport. |
| `ResumeBanner` | Reads `useProgress` to find last visited section. Shows banner if module is partially read. Handles dismiss + scroll-to-section. |
| `PilotSidebar` | (Extended from Section 2) Now also reads `useProgress` + `useExercise` to render progress dots and exercise counts. |

---

## Section 6: Feedback Collection

### Research Basis

- In-app surveys: 27.5% response rate with 24.8% completion (Featurebase, Survicate)
- 44% of respondents leave open-text comments when given the opportunity (CustomerGauge)
- ~50% completion rate achievable with proper widget placement (Refiner)
- Contextual feedback (triggered after specific action) yields higher quality than general surveys (Braze, Userpilot)
- Rating scale + open-text "why" gives trackable metric + rich context (Qualtrics, Hotjar)

### Two Distinct Feedback Surfaces

**1. Content Feedback (per module)**

Appears at the bottom of each module page, below the last exercise. Based on Jon's existing feedback form spec.

Fields:
- **Signal question (required):** "How ready do you feel to act on this module?" Three visual button options: Not ready (too many gaps), Getting there (need more specifics), Ready (I know my next step)
- **What landed (optional):** Open text. Helper: "What clicked for you? A specific data point, case study, or idea."
- **What's missing or unclear (optional):** Open text. Helper: "Where did you get stuck or feel like it didn't address your situation?"
- **Your situation (optional):** Open text. Helper: "Niche, size, stage, platform. Helps us understand whose feedback we're reading."

Target: under 2 minutes. Feels like a blank page with gentle nudges.

**2. Site UX Feedback (once per threshold)**

Triggered after pilot completes 2+ modules (meaningful interaction threshold). Appears as a dismissable banner. Can be re-accessed from sidebar.

Fields:
- **Navigation (optional):** 1-5 scale. "How easy is it to find your way around?" (1 = lost, 5 = intuitive)
- **Readability (optional):** 1-5 scale. "How readable is the content?" (1 = hard to follow, 5 = clear)
- **Exercise tools (optional):** 1-5 scale. "How useful are the exercise tools?" (1 = didn't use, 5 = essential)
- **Open text (optional):** "What's working well? What's frustrating? What would make the pilot experience better?"

### Convex Tables

**`pilotFeedback`** (content feedback, per module):
```
{
  userId: Id<"users">,
  projectSlug: string,
  buildSlug: string,
  moduleSlug: string,
  readiness: "not-ready" | "getting-there" | "ready",
  whatLanded: string | undefined,
  whatsMissing: string | undefined,
  situation: string | undefined,
  createdAt: number,
}
```

**`pilotUXFeedback`** (site experience):
```
{
  userId: Id<"users">,
  navigation: number | undefined,      // 1-5
  readability: number | undefined,     // 1-5
  exerciseTools: number | undefined,   // 1-5
  openText: string | undefined,
  createdAt: number,
}
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `ModuleFeedbackForm` | Renders content feedback form at module bottom. Writes to `pilotFeedback` via `useFeedback`. |
| `UXFeedbackPrompt` | Banner checking `useProgress` for 2+ completed modules. Shows once, dismissable, reopenable from sidebar. |
| `UXFeedbackForm` | Renders rating scales + open text. Writes to `pilotUXFeedback`. Separate from content feedback. |
| `useFeedback` | Hook. Reads/writes `pilotFeedback` for current module. Returns `{ submitted, response, submit }`. |
| `useUXFeedback` | Hook. Reads/writes `pilotUXFeedback`. Returns `{ shouldPrompt, submitted, dismiss, submit }`. |

---

## Section 7: Access Control and YCAH Membership Verification

### Why This Matters

Pilot project access requires YCAH Skool community membership. This creates a virtuous cycle:
- Community owners (willingness to pay, invested personal effort) join YCAH to access pilot projects
- Drives YCAH membership growth with high-value, engaged members
- Increases community activity from serious practitioners
- Pilots can promote their own Skool communities within the pilots hub

### Research: What Skool Supports

**Officially supported (no TOS risk):**
- Zapier integration (included in Pro plan at $99/mo, no extra cost) ([source](https://help.skool.com/article/56-zapier-integration))
- Membership Questions plugin: up to 3 questions, required on join, field types: text box, multiple choice, email ([source](https://help.skool.com/article/57-how-to-set-up-membership-questions))
- "Answered Membership Questions" Zapier trigger: fires when a member is accepted, sends name + email + question answers ([source](https://help.skool.com/article/59-zapier-for-membership-questions))
- Instant membership approval toggle (auto-accept vs manual review) in Settings > Plugins

**Not supported:**
- No Zapier trigger for free members joining (only paid member trigger exists; free member trigger is a feature request)
- No Zapier trigger for members leaving
- No API to query current member list
- Scraping/automation explicitly prohibited by platform policy ([source](https://help.skool.com/article/179-platform-policy))

### Cost

```
VERIFIED: Skool Zapier plugin included in Pro plan ($99/mo already paid)
VERIFIED: Zapier free plan supports 2-step Zaps, 100 tasks/mo, 15-min polling
ASSUMED: YCAH will have under 100 new members per month initially
RISK: 15-minute delay between YCAH join and pilots site auto-approval
COST: $0 additional. If exceeding 100 new members/mo, Zapier Professional is $29.99/mo
```

### Architecture: Zapier + Membership Questions + Convex

```
YCAH Skool (member joins)
  → Membership Questions (captures email + community URL)
  → Member accepted (auto or manual)
  → Zapier trigger: "Answered Membership Questions"
  → Zapier action: Webhook POST to Convex HTTP endpoint
  → Convex creates/updates ycahMembers record

jpgerton.com/pilots (pilot signs up)
  → Google OAuth (identity + email)
  → Profile form (name, preferred name, Skool username, community URL)
  → Check email against ycahMembers table
  → Match found: auto-approved
  → No match: "Join YCAH first" with link + "pending" state
```

### Setup Process for Jon (One-Time Configuration)

**Step 1: Configure YCAH Membership Questions in Skool**

1. Go to YCAH community Settings > Plugins
2. Click EDIT next to "Membership questions"
3. Toggle ON
4. Add 3 questions:
   - **Q1** (Email type): "What email do you use for AI tools and services?" - This captures their email for matching against Google OAuth on the pilots site. Using the email field type ensures valid format.
   - **Q2** (Text box): "What's your Skool community URL? (Leave blank if you don't have one yet)" - Identifies community owners vs aspiring community owners.
   - **Q3** (Multiple choice): "How did you find YCAH?" - Attribution tracking. Options: "Search/Discovery", "Social media", "Referral from another member", "Pilot project link", "Other"
5. Decide approval mode: Settings > Plugins > "Instant membership approval" - toggle ON for auto-accept or leave OFF for manual review. Recommendation: leave manual review ON initially to filter spam, switch to auto-accept once volume warrants it.

**Step 2: Create a Zapier Account and Zap**

1. Sign up at zapier.com (free plan, 100 tasks/mo)
2. Click "Create Zap"
3. **Trigger configuration:**
   - Search for "Skool" as trigger app
   - Select event: "Answered Membership Questions"
   - Click "Connect new account"
   - Get your API key from YCAH Settings > Plugins > Zapier > API Key
   - Enter your group URL identifier (the slug from your YCAH URL, e.g., `you-craft-and-ai-helps`)
   - Test trigger (requires at least one member to have answered questions in pending state)
4. **Action configuration:**
   - Search for "Webhooks by Zapier" as action app
   - Select event: "POST"
   - URL: `https://benevolent-hummingbird-297.convex.site/zapier/ycah-member` (Convex HTTP endpoint, to be created)
   - Payload type: JSON
   - Map fields:
     - `email`: Q1 answer (email)
     - `name`: Member name (from Skool)
     - `communityUrl`: Q2 answer (community URL)
     - `source`: Q3 answer (how they found YCAH)
     - `skoolTransactionId`: Transaction ID (from Skool)
5. Test the action
6. Name the Zap: "YCAH Member Join > Convex Sync"
7. Publish and toggle ON

**Step 3: Create Convex HTTP Endpoint**

A new HTTP endpoint at `/zapier/ycah-member` that:
- Accepts POST requests from Zapier
- Validates a shared secret (set as Convex env var, passed as header by Zapier)
- Creates or updates a record in the `ycahMembers` table
- Returns 200 OK

**Step 4: Update Pilots Sign-Up Flow**

The existing Google OAuth flow gets an additional step:
1. User clicks "Sign in with Google" (existing)
2. Google OAuth completes (existing)
3. **NEW:** Profile form appears: first name, last name (optional), preferred name, Skool username (optional), community URL (optional)
4. **NEW:** System checks `ycahMembers` table for email match
5. Match found: `approvalStatus` set to `"auto-approved"`, pilot proceeds to welcome modal
6. No match: pilot sees a friendly message explaining YCAH membership is required, with a link to join YCAH. Record created with `approvalStatus: "pending"`. When they join YCAH and the Zapier sync fires, their status auto-updates to `"auto-approved"` via a Convex mutation that checks pending pilots against new ycahMembers records.

### Handling Edge Cases

**15-minute Zapier delay:** If a pilot joins YCAH and immediately tries the pilots site, their email may not be synced yet. The UI shows: "We're syncing your YCAH membership. This usually takes a few minutes. You can close this page and come back, or wait here and we'll refresh automatically." (Convex reactivity means the page updates live once the record arrives.)

**Member leaves YCAH:** No automated trigger available. Options:
- Periodic manual review (Jon checks YCAH member list against active pilots)
- Grace period approach: don't auto-revoke. If someone leaves YCAH, their pilot content stays accessible. The relationship is built on value, not enforcement.
- Future: if Skool adds a "member left" Zapier trigger, wire it up to set `approvalStatus: "revoked"`

**Manual override:** Jon can manually approve or revoke any pilot via Convex dashboard or a simple admin endpoint, regardless of YCAH membership status. This handles VIPs, testers, or special cases.

### Personalization

The `pilotProfiles` table stores `preferredName` which is used throughout the UI:
- Welcome modal: "Welcome, Sarah." instead of "Welcome, pilot."
- Sidebar: shows preferred name
- Exercise submissions: attributed to preferred name
- Feedback: associated with pilot profile

### Convex Tables

**`ycahMembers`** (synced from Skool via Zapier):
```
{
  email: string,                    // from membership question (email type)
  skoolName: string,                // member name from Skool
  communityUrl: string | undefined, // from membership question
  source: string | undefined,       // how they found YCAH
  skoolTransactionId: string,       // unique ID from Skool
  syncedAt: number,                 // when Zapier synced this record
  syncSource: "zapier" | "manual",
}
// Index: by_email ["email"]
```

**`pilotProfiles`** (created on pilot sign-up):
```
{
  userId: Id<"users">,
  email: string,                    // from Google OAuth
  firstName: string,
  lastName: string | undefined,
  preferredName: string,            // used in welcome + UI personalization
  skoolUsername: string | undefined, // their @handle on Skool
  communityUrl: string | undefined, // their Skool community
  communityName: string | undefined, // display name for "Meet the Pilots"
  approvalStatus: "auto-approved" | "pending" | "approved" | "revoked",
  ycahMemberId: string | undefined, // reference to ycahMembers record
  createdAt: number,
  updatedAt: number,
}
// Index: by_email ["email"], by_status ["approvalStatus"]
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `PilotSignUpForm` | Profile form after Google OAuth. Captures name, preferred name, Skool username, community URL. Checks YCAH membership. |
| `PendingApproval` | Shown when email not found in ycahMembers. Link to YCAH, explanation, auto-refresh via Convex reactivity. |
| `useYCAHMembership` | Hook. Checks ycahMembers for email match. Returns `{ isMember, isPending, memberData }`. |
| `usePilotProfile` | Hook. Reads/writes pilotProfiles. Returns `{ profile, updateProfile, approvalStatus }`. |

### Future: Meet the Pilots

A "Meet the Pilots" section on the pilots site showing approved pilots with:
- Preferred name
- Community name + link (if provided)
- A one-line description of their community
- Opt-in only (pilots choose to be listed)

This creates a promotion incentive: join YCAH, become a pilot, get your community showcased to other community owners. Implementation deferred to after initial launch, but the data model supports it now.

---

## Complete Convex Schema Additions

New tables to add alongside existing `pilotProjects` and `pilotBuilds`:

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `ycahMembers` | YCAH membership records synced via Zapier | by_email |
| `pilotProfiles` | Pilot identity, preferences, approval status | by_email, by_status |
| `pilotOnboarding` | Welcome flow state per user | by userId |
| `pilotProgress` | Section-level reading timestamps | by_user_module |
| `pilotExerciseResponses` | Exercise answers with channel + status | by userId + exerciseId |
| `pilotFeedback` | Content feedback per module | by userId + moduleSlug |
| `pilotUXFeedback` | Site experience ratings | by userId |

---

## Complete Component Map

### Layout Layer
- `PilotLayout` - two-column responsive grid, onboarding integration point
- `PilotSidebar` - sticky nav with scroll spy, progress, exercise counts
- `MobileContextBar` - mobile module context + section drawer
- `ModuleHeader` - dark gradient banner with module metadata

### Content Layer
- `MDXRenderer` - extended with callout components
- `KeyData`, `Insight`, `Action`, `Exercise`, `WatchOut`, `OpenQuestion` - six callout MDX components
- `SectionObserver` - Intersection Observer wrapper for progress tracking
- `ResumeBanner` - "pick up where you left off" prompt

### Access Control Layer
- `PilotSignUpForm` - profile form after Google OAuth, YCAH membership check
- `PendingApproval` - shown when email not in ycahMembers, link to YCAH, auto-refresh
- `useYCAHMembership` - checks ycahMembers for email match
- `usePilotProfile` - pilot identity and approval status CRUD

### Interactive Layer
- `WelcomeModal` - 3-screen onboarding flow (uses preferredName from pilotProfiles)
- `ExerciseCallout` - exercise description + interactive zone
- `ExerciseForm` - inline web form with auto-save
- `ExerciseAlternatives` - Claude prompt (featured) + email + sheets
- `ModuleFeedbackForm` - content feedback at module bottom
- `UXFeedbackPrompt` - site feedback trigger banner
- `UXFeedbackForm` - site experience rating form

### Hook Layer
- `useOnboarding` - welcome flow state
- `useProgress` - section visit tracking
- `useExercise` - exercise response CRUD
- `useFeedback` - content feedback per module
- `useUXFeedback` - site experience feedback

---

## Skool/Pilots Site Boundary

- jpgerton.com/pilots is the full pilot experience (content, exercises, feedback, discussion)
- YCAH Skool gets a promotional post with link to sign up
- Co-pilots keep detailed playbook discussion on the pilots site
- Wins and success stories ARE welcome in the YCAH feed (social proof)
- Cannot enforce topic restrictions in Skool, but can frame guidance: don't share details that would overwhelm non-community-owners
- Future pilot projects that are more Skool-related can be discussed more openly in YCAH
- Skool has no sub-groups or private discussion areas within a single community (verified via Skool Help Center)

---

## Future Considerations (Not In Scope)

- Spaced repetition prompts based on `lastVisitedAt` timestamps
- YCAH-branded Chrome extension for pilot project access
- Productization of the pilots hub infrastructure for other founders
- Multi-platform content flywheel (research-backed UX patterns as playbook content)
- AI assistant auto-processing of emailed exercise responses
- Downloadable Claude Code skills for exercises
- "Meet the Pilots" showcase page (data model supports it, UI deferred)
- Auto-revocation when Skool adds "member left" Zapier trigger
- Skool "Pilots" tab or private course as a lightweight gateway to jpgerton.com/pilots
