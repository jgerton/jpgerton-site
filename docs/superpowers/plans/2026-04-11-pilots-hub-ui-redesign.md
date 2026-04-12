# Pilots Hub UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the pilots hub from a plain MDX text dump into a modular, research-backed experience with side navigation, visual callouts, onboarding, exercise tools, progress tracking, feedback collection, and YCAH membership verification.

**Architecture:** Split the monolithic build-1.mdx into per-module files with frontmatter manifests. Add a two-column layout with sticky sidebar + scroll spy. Extend Convex schema with 7 new tables for profiles, onboarding, progress, exercises, and feedback. Zapier webhook from YCAH Skool syncs membership for auto-approval. All new UI is React components with custom hooks for Convex state, composed into MDX via the extended renderer.

**Tech Stack:** Next.js 16, Tailwind v4, Convex (backend + auth), MDX (next-mdx-remote), Google OAuth, Zapier (webhook), Intersection Observer API

**Spec:** `docs/superpowers/specs/2026-04-11-pilots-hub-ui-redesign.md`

---

## File Structure

### New Files

```
convex/
  ycahMembers.ts                  # Queries/mutations for YCAH membership records
  pilotProfiles.ts                # Queries/mutations for pilot profiles + approval
  pilotOnboarding.ts              # Queries/mutations for welcome flow state
  pilotProgress.ts                # Queries/mutations for section-level reading progress
  pilotExercises.ts               # Queries/mutations for exercise responses
  pilotFeedback.ts                # Queries/mutations for content + UX feedback

components/
  pilots/
    pilot-layout.tsx              # Two-column responsive layout
    pilot-sidebar.tsx             # Sticky nav with scroll spy + progress
    mobile-context-bar.tsx        # Mobile module context + section drawer
    module-header.tsx             # Dark gradient banner with module metadata
    section-observer.tsx          # Intersection Observer wrapper for progress
    resume-banner.tsx             # "Pick up where you left off" prompt
    welcome-modal.tsx             # 3-screen onboarding flow
    pilot-signup-form.tsx         # Profile form + YCAH membership check
    pending-approval.tsx          # Shown when email not in ycahMembers
    exercise-callout.tsx          # Exercise description + interactive zone
    exercise-form.tsx             # Inline web form with auto-save
    exercise-alternatives.tsx     # Claude prompt (featured) + email + sheets
    module-feedback-form.tsx      # Content feedback at module bottom
    ux-feedback-prompt.tsx        # Site feedback trigger banner
    ux-feedback-form.tsx          # Site experience rating form
  mdx/
    callouts.tsx                  # KeyData, Insight, Action, WatchOut, OpenQuestion components
    exercise-mdx.tsx              # Exercise MDX component (wraps exercise-callout)

hooks/
  use-ycah-membership.ts          # Checks ycahMembers for email match
  use-pilot-profile.ts            # Pilot identity and approval status
  use-onboarding.ts               # Welcome flow state
  use-progress.ts                 # Section visit tracking
  use-exercise.ts                 # Exercise response CRUD
  use-feedback.ts                 # Content feedback per module
  use-ux-feedback.ts              # Site experience feedback

app/
  pilots/
    [project]/
      [build]/
        [module]/
          page.tsx                # New module page route
        layout.tsx                # Build-level layout with sidebar
        page.tsx                  # Modified: build preamble (reads index.mdx)

content/
  pilots/
    freemium-playbook/
      build-1/
        index.mdx                 # Preamble extracted from build-1.mdx
        module-1.mdx              # Split from build-1.mdx lines 93-267
        module-2.mdx              # Split from build-1.mdx lines 268-463
        module-3.mdx              # Split from build-1.mdx lines 464-548
        module-4.mdx              # Split from build-1.mdx lines 549-675
```

### Modified Files

```
convex/schema.ts                  # Add 7 new tables
convex/http.ts                    # Add Zapier webhook endpoint
components/mdx-renderer.tsx       # Extend with callout + exercise components
components/pilot-nav.tsx          # Add profile name, help button
middleware.ts                     # Update protected route pattern for new [module] route
app/pilots/layout.tsx             # Integrate PilotLayout
app/pilots/signin/page.tsx        # Update copy (remove "magic link" reference)
```

---

## Task 1: Convex Schema Extensions

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add all 7 new tables to the schema**

```typescript
// In convex/schema.ts, add after pilotBuilds table:

ycahMembers: defineTable({
  email: v.string(),
  skoolName: v.string(),
  communityUrl: v.optional(v.string()),
  source: v.optional(v.string()),
  skoolTransactionId: v.string(),
  syncedAt: v.number(),
  syncSource: v.union(v.literal("zapier"), v.literal("manual")),
}).index("by_email", ["email"]),

pilotProfiles: defineTable({
  userId: v.id("users"),
  email: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  preferredName: v.string(),
  skoolUsername: v.optional(v.string()),
  communityUrl: v.optional(v.string()),
  communityName: v.optional(v.string()),
  approvalStatus: v.union(
    v.literal("auto-approved"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("revoked")
  ),
  ycahMemberId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_email", ["email"])
  .index("by_status", ["approvalStatus"]),

pilotOnboarding: defineTable({
  userId: v.id("users"),
  completedAt: v.optional(v.number()),
  skippedAt: v.optional(v.number()),
  lastScreenSeen: v.number(),
}).index("by_userId", ["userId"]),

pilotProgress: defineTable({
  userId: v.id("users"),
  projectSlug: v.string(),
  buildSlug: v.string(),
  moduleSlug: v.string(),
  sectionId: v.string(),
  firstVisitedAt: v.number(),
  lastVisitedAt: v.number(),
}).index("by_user_module", [
  "userId",
  "projectSlug",
  "buildSlug",
  "moduleSlug",
]),

pilotExerciseResponses: defineTable({
  userId: v.id("users"),
  projectSlug: v.string(),
  buildSlug: v.string(),
  exerciseId: v.string(),
  response: v.string(),
  channel: v.union(
    v.literal("web"),
    v.literal("email"),
    v.literal("sheets")
  ),
  status: v.union(v.literal("draft"), v.literal("submitted")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user_exercise", ["userId", "exerciseId"])
  .index("by_user_project", ["userId", "projectSlug", "buildSlug"]),

pilotFeedback: defineTable({
  userId: v.id("users"),
  projectSlug: v.string(),
  buildSlug: v.string(),
  moduleSlug: v.string(),
  readiness: v.union(
    v.literal("not-ready"),
    v.literal("getting-there"),
    v.literal("ready")
  ),
  whatLanded: v.optional(v.string()),
  whatsMissing: v.optional(v.string()),
  situation: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_user_module", [
  "userId",
  "projectSlug",
  "buildSlug",
  "moduleSlug",
]),

pilotUXFeedback: defineTable({
  userId: v.id("users"),
  navigation: v.optional(v.number()),
  readability: v.optional(v.number()),
  exerciseTools: v.optional(v.number()),
  openText: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_userId", ["userId"]),
```

- [ ] **Step 2: Push schema to dev deployment**

Run: `cd E:/Projects/jpgerton-site && bunx convex dev`
Expected: Schema pushed successfully, 7 new tables created.

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add 7 new Convex tables for pilots hub redesign

Tables: ycahMembers, pilotProfiles, pilotOnboarding, pilotProgress,
pilotExerciseResponses, pilotFeedback, pilotUXFeedback"
```

---

## Task 2: YCAH Membership Sync (Convex Backend)

**Files:**
- Create: `convex/ycahMembers.ts`
- Modify: `convex/http.ts`

- [ ] **Step 1: Create ycahMembers.ts with sync mutation and query**

```typescript
// convex/ycahMembers.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncFromZapier = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    communityUrl: v.optional(v.string()),
    source: v.optional(v.string()),
    skoolTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        skoolName: args.name,
        communityUrl: args.communityUrl,
        source: args.source,
        syncedAt: Date.now(),
      });
      return existing._id;
    }

    const id = await ctx.db.insert("ycahMembers", {
      email: args.email,
      skoolName: args.name,
      communityUrl: args.communityUrl,
      source: args.source,
      skoolTransactionId: args.skoolTransactionId,
      syncedAt: Date.now(),
      syncSource: "zapier",
    });

    // Auto-approve any pending pilot profiles with this email
    const pendingProfile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (pendingProfile && pendingProfile.approvalStatus === "pending") {
      await ctx.db.patch(pendingProfile._id, {
        approvalStatus: "auto-approved",
        updatedAt: Date.now(),
      });
    }

    return id;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const addManual = mutation({
  args: {
    email: v.string(),
    skoolName: v.string(),
    communityUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("ycahMembers", {
      email: args.email,
      skoolName: args.skoolName,
      communityUrl: args.communityUrl,
      skoolTransactionId: "manual",
      syncedAt: Date.now(),
      syncSource: "manual",
    });
  },
});
```

- [ ] **Step 2: Add Zapier webhook endpoint to http.ts**

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/zapier/ycah-member",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("x-zapier-secret");
    const expectedSecret = process.env.ZAPIER_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    await ctx.runMutation(api.ycahMembers.syncFromZapier, {
      email: body.email,
      name: body.name,
      communityUrl: body.communityUrl || undefined,
      source: body.source || undefined,
      skoolTransactionId: body.skoolTransactionId || "unknown",
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

- [ ] **Step 3: Set the ZAPIER_WEBHOOK_SECRET env var in Convex**

Run: `cd E:/Projects/jpgerton-site && bunx convex env set ZAPIER_WEBHOOK_SECRET "$(openssl rand -hex 32)"`
Expected: Environment variable set. Save the value for Zapier configuration later.

- [ ] **Step 4: Test with Convex dev and a manual curl**

Run: `curl -X POST http://localhost:3001/zapier/ycah-member -H "Content-Type: application/json" -H "x-zapier-secret: YOUR_SECRET_HERE" -d '{"email":"test@example.com","name":"Test User","skoolTransactionId":"test-123"}'`
Expected: 200 OK response.

- [ ] **Step 5: Commit**

```bash
git add convex/ycahMembers.ts convex/http.ts
git commit -m "feat: add YCAH membership sync via Zapier webhook

Convex HTTP endpoint at /zapier/ycah-member accepts POST from Zapier.
Auto-approves pending pilot profiles when email matches."
```

---

## Task 3: Pilot Profiles (Convex Backend)

**Files:**
- Create: `convex/pilotProfiles.ts`

- [ ] **Step 1: Create pilotProfiles.ts with CRUD operations**

```typescript
// convex/pilotProfiles.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.optional(v.string()),
    preferredName: v.string(),
    skoolUsername: v.optional(v.string()),
    communityUrl: v.optional(v.string()),
    communityName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user email from the auth users table
    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error("No email found for user");

    // Check if profile already exists
    const existing = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;

    // Check YCAH membership
    const ycahMember = await ctx.db
      .query("ycahMembers")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .first();

    const approvalStatus = ycahMember ? "auto-approved" : "pending";

    return await ctx.db.insert("pilotProfiles", {
      userId,
      email: user.email,
      firstName: args.firstName,
      lastName: args.lastName,
      preferredName: args.preferredName,
      skoolUsername: args.skoolUsername,
      communityUrl: args.communityUrl,
      communityName: args.communityName,
      approvalStatus,
      ycahMemberId: ycahMember?._id ? String(ycahMember._id) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    preferredName: v.optional(v.string()),
    skoolUsername: v.optional(v.string()),
    communityUrl: v.optional(v.string()),
    communityName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("pilotProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("No profile found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.preferredName !== undefined) updates.preferredName = args.preferredName;
    if (args.skoolUsername !== undefined) updates.skoolUsername = args.skoolUsername;
    if (args.communityUrl !== undefined) updates.communityUrl = args.communityUrl;
    if (args.communityName !== undefined) updates.communityName = args.communityName;

    await ctx.db.patch(profile._id, updates);
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add convex/pilotProfiles.ts
git commit -m "feat: add pilot profiles with YCAH membership auto-approval

Creates profile on sign-up, checks ycahMembers for email match,
sets auto-approved or pending status."
```

---

## Task 4: Remaining Convex Modules (Onboarding, Progress, Exercises, Feedback)

**Files:**
- Create: `convex/pilotOnboarding.ts`
- Create: `convex/pilotProgress.ts`
- Create: `convex/pilotExercises.ts`
- Create: `convex/pilotFeedback.ts`

- [ ] **Step 1: Create pilotOnboarding.ts**

```typescript
// convex/pilotOnboarding.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateScreen = mutation({
  args: { screen: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastScreenSeen: args.screen });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        lastScreenSeen: args.screen,
      });
    }
  },
});

export const complete = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completedAt: Date.now(),
        lastScreenSeen: 3,
      });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        completedAt: Date.now(),
        lastScreenSeen: 3,
      });
    }
  },
});

export const skip = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotOnboarding")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { skippedAt: Date.now() });
    } else {
      await ctx.db.insert("pilotOnboarding", {
        userId,
        skippedAt: Date.now(),
        lastScreenSeen: 1,
      });
    }
  },
});
```

- [ ] **Step 2: Create pilotProgress.ts**

```typescript
// convex/pilotProgress.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getModuleProgress = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .collect();
  },
});

export const getBuildProgress = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all progress records for this build across all modules
    const allProgress = await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
      )
      .collect();

    return allProgress;
  },
});

export const markSectionVisited = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotProgress")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastVisitedAt: Date.now() });
    } else {
      await ctx.db.insert("pilotProgress", {
        userId,
        projectSlug: args.projectSlug,
        buildSlug: args.buildSlug,
        moduleSlug: args.moduleSlug,
        sectionId: args.sectionId,
        firstVisitedAt: Date.now(),
        lastVisitedAt: Date.now(),
      });
    }
  },
});
```

- [ ] **Step 3: Create pilotExercises.ts**

```typescript
// convex/pilotExercises.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getExerciseResponse = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .first();
  },
});

export const getBuildExercises = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_project", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
      )
      .collect();
  },
});

export const saveResponse = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    exerciseId: v.string(),
    response: v.string(),
    channel: v.union(
      v.literal("web"),
      v.literal("email"),
      v.literal("sheets")
    ),
    status: v.union(v.literal("draft"), v.literal("submitted")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotExerciseResponses")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        response: args.response,
        channel: args.channel,
        status: args.status,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("pilotExerciseResponses", {
      userId,
      projectSlug: args.projectSlug,
      buildSlug: args.buildSlug,
      exerciseId: args.exerciseId,
      response: args.response,
      channel: args.channel,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 4: Create pilotFeedback.ts**

```typescript
// convex/pilotFeedback.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getModuleFeedback = query({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotFeedback")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .first();
  },
});

export const submitModuleFeedback = mutation({
  args: {
    projectSlug: v.string(),
    buildSlug: v.string(),
    moduleSlug: v.string(),
    readiness: v.union(
      v.literal("not-ready"),
      v.literal("getting-there"),
      v.literal("ready")
    ),
    whatLanded: v.optional(v.string()),
    whatsMissing: v.optional(v.string()),
    situation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("pilotFeedback", {
      userId,
      projectSlug: args.projectSlug,
      buildSlug: args.buildSlug,
      moduleSlug: args.moduleSlug,
      readiness: args.readiness,
      whatLanded: args.whatLanded,
      whatsMissing: args.whatsMissing,
      situation: args.situation,
      createdAt: Date.now(),
    });
  },
});

export const getMyUXFeedback = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("pilotUXFeedback")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const submitUXFeedback = mutation({
  args: {
    navigation: v.optional(v.number()),
    readability: v.optional(v.number()),
    exerciseTools: v.optional(v.number()),
    openText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("pilotUXFeedback", {
      userId,
      navigation: args.navigation,
      readability: args.readability,
      exerciseTools: args.exerciseTools,
      openText: args.openText,
      createdAt: Date.now(),
    });
  },
});
```

- [ ] **Step 5: Push all to dev and verify**

Run: `cd E:/Projects/jpgerton-site && bunx convex dev`
Expected: All functions deployed successfully.

- [ ] **Step 6: Commit**

```bash
git add convex/pilotOnboarding.ts convex/pilotProgress.ts convex/pilotExercises.ts convex/pilotFeedback.ts
git commit -m "feat: add Convex modules for onboarding, progress, exercises, feedback

Four new Convex files with queries and mutations for all pilot hub features."
```

---

## Task 5: Split MDX Content

**Files:**
- Create: `content/pilots/freemium-playbook/build-1/index.mdx`
- Create: `content/pilots/freemium-playbook/build-1/module-1.mdx`
- Create: `content/pilots/freemium-playbook/build-1/module-2.mdx`
- Create: `content/pilots/freemium-playbook/build-1/module-3.mdx`
- Create: `content/pilots/freemium-playbook/build-1/module-4.mdx`

- [ ] **Step 1: Create the build-1 directory**

Run: `mkdir -p E:/Projects/jpgerton-site/content/pilots/freemium-playbook/build-1`

- [ ] **Step 2: Extract preamble into index.mdx**

Extract lines 1-92 from `build-1.mdx` into `build-1/index.mdx`. Add frontmatter manifest:

```yaml
---
title: "The Freemium Community Playbook"
build: 1
status: ready
modules:
  - slug: module-1
    title: "The Economics of Free"
    sections:
      - id: why-community-changes-the-math
        title: "Why community changes the math"
      - id: conversion-numbers
        title: "What the conversion numbers actually look like"
      - id: psychology-behind-free
        title: "The psychology behind free"
      - id: case-studies
        title: "Case studies: what actually happened"
      - id: free-vs-gate-framework
        title: "The free vs. gate decision framework"
      - id: when-freemium-is-wrong
        title: "When freemium is the wrong model"
      - id: what-we-dont-know-yet
        title: "What we don't know yet"
    exercises:
      - id: ex1
        title: "Define your free tier value proposition"
      - id: ex2
        title: "Map your free vs. gate split"
      - id: ex3
        title: "Find your baseline numbers"
  - slug: module-2
    title: "Your Two-Tier Architecture"
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
      - id: what-we-dont-know-yet-2
        title: "What we don't know yet"
    exercises:
      - id: ex4
        title: "Configure your tiers"
      - id: ex5
        title: "Build your Start Here module"
      - id: ex6
        title: "Set up gamification"
  - slug: module-3
    title: "Seed or Co-Create? Preparing to Launch"
    sections:
      - id: case-for-seeding
        title: "The case for seeding first"
      - id: case-for-cocreating
        title: "The case for co-creating with founding members"
      - id: day-1-activation
        title: "Day 1 activation: what to measure"
    exercises:
      - id: ex7
        title: "Choose your launch approach"
      - id: ex8
        title: "Create your seed content plan"
      - id: ex9
        title: "Define your activation metric"
  - slug: module-4
    title: "The First 100 Members"
    sections:
      - id: honest-timelines
        title: "Honest timelines: what the data shows"
      - id: what-to-actually-do
        title: "What to actually do (in order of priority)"
      - id: content-flywheel
        title: "The content flywheel"
      - id: what-we-dont-know-yet-4
        title: "What we don't know yet"
    exercises:
      - id: ex10
        title: "Set a realistic timeline"
      - id: ex11
        title: "Identify your audience spaces"
      - id: ex12
        title: "Create your flywheel piece"
---
```

Then paste the preamble content (lines 1-92 from the original, with the `#` title and all content up to but not including `### Module 1`).

- [ ] **Step 3: Extract Module 1 into module-1.mdx**

Extract lines 93-267 from `build-1.mdx`. Add frontmatter:

```yaml
---
title: "The Economics of Free"
moduleNumber: 1
---
```

Convert `### Module 1: The Economics of Free` to `# The Economics of Free` (promote to H1 since it's now its own page). Convert all `####` headings to `###` and add `id` attributes matching the manifest section IDs. For example, `#### Why community changes the math` becomes:

```markdown
### Why community changes the math {#why-community-changes-the-math}
```

- [ ] **Step 4: Extract Modules 2-4 following the same pattern**

Same process for each:
- Module 2: lines 268-463, frontmatter with `moduleNumber: 2`
- Module 3: lines 464-548, frontmatter with `moduleNumber: 3`
- Module 4: lines 549-675, frontmatter with `moduleNumber: 4`

Each module: promote headings by one level, add section IDs matching manifest.

- [ ] **Step 5: Verify all files exist and content is complete**

Run: `ls -la E:/Projects/jpgerton-site/content/pilots/freemium-playbook/build-1/`
Expected: index.mdx, module-1.mdx, module-2.mdx, module-3.mdx, module-4.mdx

Run: `wc -l E:/Projects/jpgerton-site/content/pilots/freemium-playbook/build-1/*.mdx`
Expected: Line counts should roughly sum to 675 (the content portion of the original 765-line file, minus future module outlines).

- [ ] **Step 6: Keep the original build-1.mdx as backup (rename)**

Run: `mv E:/Projects/jpgerton-site/content/pilots/freemium-playbook/build-1.mdx E:/Projects/jpgerton-site/content/pilots/freemium-playbook/build-1.mdx.bak`

- [ ] **Step 7: Commit**

```bash
git add content/pilots/freemium-playbook/build-1/
git add content/pilots/freemium-playbook/build-1.mdx.bak
git commit -m "feat: split build-1.mdx into per-module files with frontmatter manifests

index.mdx: preamble + module manifest
module-1 through module-4: individual module content with section IDs
Original file kept as .bak for reference"
```

---

## Task 6: MDX Callout Components

**Files:**
- Create: `components/mdx/callouts.tsx`

- [ ] **Step 1: Create the six callout components**

```tsx
// components/mdx/callouts.tsx
import type { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode;
  title?: string;
};

const calloutStyles = {
  "key-data": { border: "#0D9488", bg: "rgba(13,148,136,0.08)", label: "Key Data", icon: "📊", labelColor: "#0D9488" },
  insight: { border: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Insight", icon: "💡", labelColor: "#D97706" },
  action: { border: "#22C55E", bg: "rgba(34,197,94,0.08)", label: "Action", icon: "✅", labelColor: "#16A34A" },
  exercise: { border: "#6366F1", bg: "rgba(99,102,241,0.08)", label: "Exercise", icon: "🔨", labelColor: "#6366F1" },
  "watch-out": { border: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Watch Out", icon: "⚠️", labelColor: "#EF4444" },
  "open-question": { border: "#A855F7", bg: "rgba(168,85,247,0.08)", label: "What We Don't Know Yet", icon: "🔬", labelColor: "#A855F7" },
} as const;

type CalloutType = keyof typeof calloutStyles;

function Callout({ type, title, children }: CalloutProps & { type: CalloutType }) {
  const style = calloutStyles[type];

  return (
    <div
      className="rounded-r-lg my-5 px-5 py-4"
      style={{
        borderLeft: `3px solid ${style.border}`,
        background: `linear-gradient(135deg, ${style.bg}, ${style.bg.replace("0.08", "0.03")})`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{style.icon}</span>
        <span
          className="font-semibold text-xs uppercase tracking-wider"
          style={{ color: style.labelColor }}
        >
          {title || style.label}
        </span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function KeyData({ title, children }: CalloutProps) {
  return <Callout type="key-data" title={title}>{children}</Callout>;
}

export function Insight({ title, children }: CalloutProps) {
  return <Callout type="insight" title={title}>{children}</Callout>;
}

export function Action({ title, children }: CalloutProps) {
  return <Callout type="action" title={title}>{children}</Callout>;
}

export function Exercise({ title, children }: CalloutProps) {
  return <Callout type="exercise" title={title}>{children}</Callout>;
}

export function WatchOut({ title, children }: CalloutProps) {
  return <Callout type="watch-out" title={title}>{children}</Callout>;
}

export function OpenQuestion({ title, children }: CalloutProps) {
  return <Callout type="open-question" title={title}>{children}</Callout>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/mdx/callouts.tsx
git commit -m "feat: add six MDX callout components with brand colors

KeyData, Insight, Action, Exercise, WatchOut, OpenQuestion
Each with icon, colored left border, gradient background"
```

---

## Task 7: Extended MDX Renderer

**Files:**
- Modify: `components/mdx-renderer.tsx`

- [ ] **Step 1: Import callouts and add to components map**

```tsx
// components/mdx-renderer.tsx
"use client";

import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import {
  KeyData,
  Insight,
  Action,
  Exercise,
  WatchOut,
  OpenQuestion,
} from "@/components/mdx/callouts";

const components = {
  // Existing typography components (keep all existing ones)
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 className="text-3xl font-heading font-bold mt-12 mb-4" {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="text-2xl font-heading font-semibold mt-10 mb-3" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-xl font-heading font-semibold mt-8 mb-2" {...props} />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <h4 className="text-lg font-heading font-medium mt-6 mb-2" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-accent pl-4 my-4 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="my-8 border-border" {...props} />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto mb-4">
      <table {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className="border border-border px-3 py-2 text-left font-medium bg-card"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td className="border border-border px-3 py-2" {...props} />
  ),
  // Callout components
  KeyData,
  Insight,
  Action,
  Exercise,
  WatchOut,
  OpenQuestion,
};

export function MDXRenderer({
  source,
}: {
  source: MDXRemoteSerializeResult;
}) {
  return <MDXRemote {...source} components={components} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/mdx-renderer.tsx
git commit -m "feat: extend MDX renderer with callout components

Six callout types now available in MDX: KeyData, Insight, Action,
Exercise, WatchOut, OpenQuestion"
```

---

## Task 8: Custom Hooks Layer

**Files:**
- Create: `hooks/use-ycah-membership.ts`
- Create: `hooks/use-pilot-profile.ts`
- Create: `hooks/use-onboarding.ts`
- Create: `hooks/use-progress.ts`
- Create: `hooks/use-exercise.ts`
- Create: `hooks/use-feedback.ts`
- Create: `hooks/use-ux-feedback.ts`

- [ ] **Step 1: Create all 7 hooks**

```typescript
// hooks/use-ycah-membership.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useYCAHMembership(email: string | undefined) {
  const member = useQuery(
    api.ycahMembers.getByEmail,
    email ? { email } : "skip"
  );
  return {
    isMember: member !== null && member !== undefined,
    isPending: member === undefined,
    memberData: member,
  };
}
```

```typescript
// hooks/use-pilot-profile.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePilotProfile() {
  const profile = useQuery(api.pilotProfiles.getMyProfile);
  const createProfile = useMutation(api.pilotProfiles.createProfile);
  const updateProfile = useMutation(api.pilotProfiles.updateProfile);

  return {
    profile,
    isLoading: profile === undefined,
    hasProfile: profile !== null && profile !== undefined,
    approvalStatus: profile?.approvalStatus,
    preferredName: profile?.preferredName,
    createProfile,
    updateProfile,
  };
}
```

```typescript
// hooks/use-onboarding.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useOnboarding() {
  const onboarding = useQuery(api.pilotOnboarding.getMyOnboarding);
  const updateScreen = useMutation(api.pilotOnboarding.updateScreen);
  const complete = useMutation(api.pilotOnboarding.complete);
  const skip = useMutation(api.pilotOnboarding.skip);

  const showWelcome =
    onboarding !== undefined &&
    onboarding === null;

  const hasCompleted =
    onboarding !== null &&
    onboarding !== undefined &&
    (onboarding.completedAt !== undefined || onboarding.skippedAt !== undefined);

  return {
    showWelcome: showWelcome || false,
    hasCompleted,
    lastScreen: onboarding?.lastScreenSeen ?? 1,
    updateScreen,
    complete,
    skip,
    reopen: () => {}, // Handled by parent component state
  };
}
```

```typescript
// hooks/use-progress.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useProgress(
  projectSlug: string,
  buildSlug: string,
  moduleSlug?: string
) {
  const moduleProgress = useQuery(
    api.pilotProgress.getModuleProgress,
    moduleSlug
      ? { projectSlug, buildSlug, moduleSlug }
      : "skip"
  );

  const buildProgress = useQuery(api.pilotProgress.getBuildProgress, {
    projectSlug,
    buildSlug,
  });

  const markVisited = useMutation(api.pilotProgress.markSectionVisited);

  const visitedSections = new Set(
    (moduleProgress ?? []).map((p) => p.sectionId)
  );

  const lastVisitedSection = (moduleProgress ?? []).reduce(
    (latest, p) =>
      !latest || p.lastVisitedAt > latest.lastVisitedAt ? p : latest,
    null as (typeof moduleProgress extends (infer T)[] | undefined ? T : never) | null
  );

  return {
    visitedSections,
    lastVisitedSection,
    buildProgress: buildProgress ?? [],
    markVisited: (sectionId: string) =>
      moduleSlug
        ? markVisited({ projectSlug, buildSlug, moduleSlug, sectionId })
        : Promise.resolve(),
  };
}
```

```typescript
// hooks/use-exercise.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useExercise(
  exerciseId: string,
  projectSlug: string,
  buildSlug: string
) {
  const response = useQuery(api.pilotExercises.getExerciseResponse, {
    exerciseId,
  });
  const saveResponse = useMutation(api.pilotExercises.saveResponse);

  return {
    response: response?.response ?? "",
    status: response?.status ?? null,
    isSubmitted: response?.status === "submitted",
    isDraft: response?.status === "draft",
    save: (text: string, status: "draft" | "submitted" = "draft") =>
      saveResponse({
        projectSlug,
        buildSlug,
        exerciseId,
        response: text,
        channel: "web",
        status,
      }),
    submit: (text: string) =>
      saveResponse({
        projectSlug,
        buildSlug,
        exerciseId,
        response: text,
        channel: "web",
        status: "submitted",
      }),
  };
}
```

```typescript
// hooks/use-feedback.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFeedback(
  projectSlug: string,
  buildSlug: string,
  moduleSlug: string
) {
  const feedback = useQuery(api.pilotFeedback.getModuleFeedback, {
    projectSlug,
    buildSlug,
    moduleSlug,
  });
  const submitFeedback = useMutation(api.pilotFeedback.submitModuleFeedback);

  return {
    submitted: feedback !== null && feedback !== undefined,
    response: feedback,
    submit: (data: {
      readiness: "not-ready" | "getting-there" | "ready";
      whatLanded?: string;
      whatsMissing?: string;
      situation?: string;
    }) =>
      submitFeedback({
        projectSlug,
        buildSlug,
        moduleSlug,
        ...data,
      }),
  };
}
```

```typescript
// hooks/use-ux-feedback.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProgress } from "./use-progress";

export function useUXFeedback(projectSlug: string, buildSlug: string) {
  const existing = useQuery(api.pilotFeedback.getMyUXFeedback);
  const submitUX = useMutation(api.pilotFeedback.submitUXFeedback);
  const { buildProgress } = useProgress(projectSlug, buildSlug);

  // Count unique modules with any progress
  const modulesWithProgress = new Set(
    buildProgress.map((p) => p.moduleSlug)
  ).size;

  return {
    shouldPrompt: modulesWithProgress >= 2 && existing === null,
    submitted: existing !== null && existing !== undefined,
    submit: (data: {
      navigation?: number;
      readability?: number;
      exerciseTools?: number;
      openText?: string;
    }) => submitUX(data),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/
git commit -m "feat: add 7 custom hooks for pilot hub state management

useYCAHMembership, usePilotProfile, useOnboarding, useProgress,
useExercise, useFeedback, useUXFeedback"
```

---

## Task 9: Pilot Sign-Up Flow Components

**Files:**
- Create: `components/pilots/pilot-signup-form.tsx`
- Create: `components/pilots/pending-approval.tsx`

- [ ] **Step 1: Create PilotSignUpForm**

```tsx
// components/pilots/pilot-signup-form.tsx
"use client";

import { useState } from "react";
import { usePilotProfile } from "@/hooks/use-pilot-profile";

export function PilotSignUpForm() {
  const { createProfile } = usePilotProfile();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [skoolUsername, setSkoolUsername] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await createProfile({
      firstName,
      lastName: lastName || undefined,
      preferredName: preferredName || firstName,
      skoolUsername: skoolUsername || undefined,
      communityUrl: communityUrl || undefined,
      communityName: communityName || undefined,
    });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-heading font-bold text-center">
        Complete your pilot profile
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        Tell us a bit about yourself so we can personalize your experience.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">
          First name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Last name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          What should we call you?
        </label>
        <input
          type="text"
          value={preferredName}
          onChange={(e) => setPreferredName(e.target.value)}
          placeholder={firstName || "Your preferred name"}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used in your welcome message and throughout the site.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Skool username
        </label>
        <input
          type="text"
          value={skoolUsername}
          onChange={(e) => setSkoolUsername(e.target.value)}
          placeholder="@yourhandle"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Your Skool community URL
        </label>
        <input
          type="url"
          value={communityUrl}
          onChange={(e) => setCommunityUrl(e.target.value)}
          placeholder="https://www.skool.com/your-community"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Community name
        </label>
        <input
          type="text"
          value={communityName}
          onChange={(e) => setCommunityName(e.target.value)}
          placeholder="My Awesome Community"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!firstName || submitting}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Setting up..." : "Continue"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create PendingApproval**

```tsx
// components/pilots/pending-approval.tsx
"use client";

import { usePilotProfile } from "@/hooks/use-pilot-profile";

export function PendingApproval() {
  const { profile } = usePilotProfile();

  return (
    <section className="py-24 px-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="text-4xl">🔄</div>
        <h1 className="text-2xl font-heading font-bold">
          Almost there{profile?.preferredName ? `, ${profile.preferredName}` : ""}!
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Pilot projects are available to YCAH community members. We're syncing
          your membership now. This usually takes a few minutes.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          If you haven't joined YCAH yet, you can do so here:
        </p>
        <a
          href="https://www.skool.com/you-craft-ai-helps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Join YCAH on Skool
        </a>
        <p className="text-xs text-muted-foreground">
          Already a member? Sit tight. Your access will activate automatically
          once our systems sync.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/pilots/pilot-signup-form.tsx components/pilots/pending-approval.tsx
git commit -m "feat: add pilot sign-up form and pending approval components

Profile capture (name, preferred name, Skool details) with YCAH
membership check and friendly pending state."
```

---

## Task 10: Module Header Component

**Files:**
- Create: `components/pilots/module-header.tsx`

- [ ] **Step 1: Create ModuleHeader**

```tsx
// components/pilots/module-header.tsx
type ModuleHeaderProps = {
  moduleNumber: number;
  totalModules: number;
  title: string;
  description?: string;
  sectionCount: number;
  exerciseCount: number;
  readTimeMinutes: number;
};

export function ModuleHeader({
  moduleNumber,
  totalModules,
  title,
  description,
  sectionCount,
  exerciseCount,
  readTimeMinutes,
}: ModuleHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-8 mb-8" style={{
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    }}>
      {/* Decorative circles */}
      <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full" style={{
        background: "rgba(13,148,136,0.15)",
      }} />
      <div className="absolute -bottom-8 right-10 w-20 h-20 rounded-full" style={{
        background: "rgba(245,158,11,0.1)",
      }} />

      <div className="relative">
        <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#0D9488" }}>
          Module {moduleNumber} of {totalModules}
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-50 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            {description}
          </p>
        )}
        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          <span><span style={{ color: "#0D9488" }}>●</span> {sectionCount} sections</span>
          <span><span style={{ color: "#6366F1" }}>●</span> {exerciseCount} exercises</span>
          <span><span style={{ color: "#F59E0B" }}>●</span> {readTimeMinutes} min read</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/pilots/module-header.tsx
git commit -m "feat: add module header component with dark gradient banner"
```

---

## Task 11: Pilot Sidebar Component

**Files:**
- Create: `components/pilots/pilot-sidebar.tsx`

- [ ] **Step 1: Create PilotSidebar with scroll spy, progress, and module navigation**

```tsx
// components/pilots/pilot-sidebar.tsx
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProgress } from "@/hooks/use-progress";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

type Section = { id: string; title: string };
type ExerciseRef = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: ExerciseRef[];
};

type PilotSidebarProps = {
  projectSlug: string;
  buildSlug: string;
  modules: Module[];
  buildTitle: string;
};

export function PilotSidebar({
  projectSlug,
  buildSlug,
  modules,
  buildTitle,
}: PilotSidebarProps) {
  const params = useParams<{ module?: string }>();
  const pathname = usePathname();
  const activeModule = params.module;
  const { buildProgress } = useProgress(projectSlug, buildSlug);
  const buildExercises = useQuery(api.pilotExercises.getBuildExercises, {
    projectSlug,
    buildSlug,
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll spy: observe section headings
  useEffect(() => {
    if (!activeModule) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    const headings = document.querySelectorAll("[data-section-id]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [activeModule, pathname]);

  // Calculate progress per module
  function getModuleProgress(moduleSlug: string, sections: Section[]) {
    const visited = new Set(
      buildProgress
        .filter((p) => p.moduleSlug === moduleSlug)
        .map((p) => p.sectionId)
    );
    return { visited: visited.size, total: sections.length };
  }

  function getExerciseCount(moduleExercises: ExerciseRef[]) {
    const submitted = (buildExercises ?? []).filter(
      (e) => moduleExercises.some((me) => me.id === e.exerciseId) && e.status === "submitted"
    );
    return { done: submitted.length, total: moduleExercises.length };
  }

  // Overall progress
  const totalSections = modules.reduce((sum, m) => sum + m.sections.length, 0);
  const totalVisited = buildProgress.length;
  const overallPercent = totalSections > 0 ? Math.round((totalVisited / totalSections) * 100) : 0;

  return (
    <nav className="w-[260px] min-w-[260px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border bg-card py-4 text-sm hidden lg:block">
      {/* Project/Build context */}
      <div className="px-4 pb-3 mb-3 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          {buildTitle}
        </div>
        <div className="text-xs text-muted-foreground">Build {buildSlug.replace("build-", "")}</div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%`, background: "#0D9488" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{overallPercent}%</span>
        </div>
      </div>

      {/* Overview link */}
      <div className="px-4 py-1.5">
        <Link
          href={`/pilots/${projectSlug}/${buildSlug}`}
          className={`text-sm ${!activeModule ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          Overview
        </Link>
      </div>

      {/* Module list */}
      {modules.map((mod, i) => {
        const isActive = activeModule === mod.slug;
        const progress = getModuleProgress(mod.slug, mod.sections);
        const exercises = getExerciseCount(mod.exercises);
        const isComplete = progress.visited >= progress.total;

        return (
          <div key={mod.slug} className={`mt-1 ${isActive ? "bg-accent/30 border-l-2 border-primary" : ""}`}>
            <Link
              href={`/pilots/${projectSlug}/${buildSlug}/${mod.slug}`}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center gap-2">
                {/* Progress indicator */}
                {isComplete ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground">✓</span>
                  </div>
                ) : progress.visited > 0 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: `${(progress.visited / progress.total) * 100}%`,
                        background: "rgba(13,148,136,0.3)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border" />
                )}
                <span className={`text-xs opacity-50 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {mod.title}
                </span>
              </div>
            </Link>

            {/* Expanded sections for active module */}
            {isActive && (
              <div className="ml-10 pb-2 flex flex-col gap-0.5">
                {mod.sections.map((section) => {
                  const isVisited = buildProgress.some(
                    (p) => p.moduleSlug === mod.slug && p.sectionId === section.id
                  );
                  const isSectionActive = activeSection === section.id;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-1.5 py-0.5 text-xs"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isVisited ? "#0D9488" : "var(--border)" }}
                      />
                      <span className={
                        isSectionActive
                          ? "text-primary font-medium"
                          : isVisited
                            ? "text-muted-foreground"
                            : "text-muted-foreground opacity-60"
                      }>
                        {section.title}
                      </span>
                    </a>
                  );
                })}
                {exercises.total > 0 && (
                  <div className="text-[10px] mt-1" style={{ color: "#6366F1" }}>
                    {exercises.done}/{exercises.total} exercises
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/pilots/pilot-sidebar.tsx
git commit -m "feat: add pilot sidebar with scroll spy, progress dots, and module navigation

260px sticky sidebar, Intersection Observer scroll spy, progress
indicators, exercise counts, overall build progress bar."
```

---

## Task 12: Pilot Layout and Build-Level Layout

**Files:**
- Create: `components/pilots/pilot-layout.tsx`
- Create: `components/pilots/mobile-context-bar.tsx`
- Create: `app/pilots/[project]/[build]/layout.tsx`

- [ ] **Step 1: Create PilotLayout (responsive two-column wrapper)**

```tsx
// components/pilots/pilot-layout.tsx
"use client";

import { PilotSidebar } from "./pilot-sidebar";
import { MobileContextBar } from "./mobile-context-bar";
import { WelcomeModal } from "./welcome-modal";
import { useOnboarding } from "@/hooks/use-onboarding";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useState } from "react";

type Section = { id: string; title: string };
type ExerciseRef = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: ExerciseRef[];
};

type PilotLayoutProps = {
  projectSlug: string;
  buildSlug: string;
  buildTitle: string;
  modules: Module[];
  children: React.ReactNode;
};

export function PilotLayout({
  projectSlug,
  buildSlug,
  buildTitle,
  modules,
  children,
}: PilotLayoutProps) {
  const { showWelcome, hasCompleted, complete, skip, updateScreen } = useOnboarding();
  const { preferredName } = usePilotProfile();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const shouldShowWelcome = showWelcome && !hasCompleted;

  return (
    <>
      {(shouldShowWelcome || welcomeOpen) && (
        <WelcomeModal
          preferredName={preferredName ?? undefined}
          modules={modules}
          onComplete={async () => {
            await complete();
            setWelcomeOpen(false);
          }}
          onSkip={async () => {
            await skip();
            setWelcomeOpen(false);
          }}
          onScreenChange={(screen) => updateScreen({ screen })}
        />
      )}

      <div className="flex min-h-screen">
        <PilotSidebar
          projectSlug={projectSlug}
          buildSlug={buildSlug}
          buildTitle={buildTitle}
          modules={modules}
        />
        <div className="flex-1 flex flex-col">
          <MobileContextBar modules={modules} />
          <main className="flex-1 px-6 md:px-10 py-8 max-w-3xl">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create MobileContextBar**

```tsx
// components/pilots/mobile-context-bar.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

type Section = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: { id: string; title: string }[];
};

export function MobileContextBar({ modules }: { modules: Module[] }) {
  const params = useParams<{ module?: string }>();
  const [open, setOpen] = useState(false);
  const activeModule = modules.find((m) => m.slug === params.module);

  if (!activeModule) return null;

  return (
    <div className="lg:hidden border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <div className="text-xs text-muted-foreground">
            Module {modules.indexOf(activeModule) + 1} of {modules.length}
          </div>
          <div className="text-sm font-medium">{activeModule.title}</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1.5 rounded bg-accent/30 text-primary font-medium"
        >
          Sections {open ? "▴" : "▾"}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-3 border-t border-border">
          {activeModule.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
              className="block py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {section.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create build-level layout that reads the manifest**

```tsx
// app/pilots/[project]/[build]/layout.tsx
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { PilotLayout } from "@/components/pilots/pilot-layout";

type LayoutProps = {
  params: Promise<{ project: string; build: string }>;
  children: React.ReactNode;
};

export default async function BuildLayout({ params, children }: LayoutProps) {
  const { project, build } = await params;
  const indexPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );

  const raw = await readFile(indexPath, "utf-8");
  const { data } = matter(raw);

  return (
    <PilotLayout
      projectSlug={project}
      buildSlug={build}
      buildTitle={data.title}
      modules={data.modules}
    >
      {children}
    </PilotLayout>
  );
}
```

- [ ] **Step 4: Install gray-matter if not already installed**

Run: `cd E:/Projects/jpgerton-site && bun add gray-matter`

- [ ] **Step 5: Commit**

```bash
git add components/pilots/pilot-layout.tsx components/pilots/mobile-context-bar.tsx app/pilots/\[project\]/\[build\]/layout.tsx
git commit -m "feat: add two-column pilot layout with mobile context bar

Build-level layout reads manifest from index.mdx frontmatter.
Desktop: sticky sidebar + content. Mobile: context bar with section drawer."
```

---

## Task 13: Module Page Route

**Files:**
- Create: `app/pilots/[project]/[build]/[module]/page.tsx`
- Modify: `app/pilots/[project]/[build]/page.tsx`

- [ ] **Step 1: Create the module page**

```tsx
// app/pilots/[project]/[build]/[module]/page.tsx
import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { ModuleHeader } from "@/components/pilots/module-header";
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ project: string; build: string; module: string }>;
};

export default async function ModulePage({ params }: PageProps) {
  const { project, build, module: moduleSlug } = await params;

  // Read module MDX
  const modulePath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    `${moduleSlug}.mdx`
  );

  let source;
  let frontmatter;
  try {
    const raw = await readFile(modulePath, "utf-8");
    const { content, data } = matter(raw);
    frontmatter = data;
    source = await serialize(content);
  } catch {
    notFound();
  }

  // Read build manifest for module metadata
  const indexPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );
  const indexRaw = await readFile(indexPath, "utf-8");
  const { data: buildData } = matter(indexRaw);
  const moduleInfo = buildData.modules?.find(
    (m: { slug: string }) => m.slug === moduleSlug
  );

  if (!moduleInfo) notFound();

  const moduleIndex = buildData.modules.indexOf(moduleInfo);
  const totalModules = buildData.modules.length;

  // Estimate read time: ~200 words per minute
  const wordCount = source.compiledSource.split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div>
      <ModuleHeader
        moduleNumber={moduleIndex + 1}
        totalModules={totalModules}
        title={frontmatter.title || moduleInfo.title}
        sectionCount={moduleInfo.sections?.length ?? 0}
        exerciseCount={moduleInfo.exercises?.length ?? 0}
        readTimeMinutes={readTime}
      />
      <MDXRenderer source={source} />
    </div>
  );
}
```

- [ ] **Step 2: Update the build page to serve the preamble from index.mdx**

```tsx
// app/pilots/[project]/[build]/page.tsx
import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ project: string; build: string }>;
};

export default async function BuildPage({ params }: PageProps) {
  const { project, build } = await params;
  const contentPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );

  let source;
  try {
    const raw = await readFile(contentPath, "utf-8");
    const { content } = matter(raw);
    source = await serialize(content);
  } catch {
    notFound();
  }

  return (
    <div>
      <MDXRenderer source={source} />
    </div>
  );
}
```

- [ ] **Step 3: Update middleware to protect new module route**

In `middleware.ts`, change the protected route pattern:

```typescript
const isProtectedRoute = createRouteMatcher(["/pilots/(.*)/(.*)"]);
```

This already matches `/pilots/project/build/module` since it uses `(.*)` twice, but verify it works for the 3-segment and 4-segment paths.

- [ ] **Step 4: Commit**

```bash
git add app/pilots/\[project\]/\[build\]/\[module\]/page.tsx app/pilots/\[project\]/\[build\]/page.tsx middleware.ts
git commit -m "feat: add module page route and update build page for split content

Module page reads per-module MDX with frontmatter, renders with
ModuleHeader. Build page now reads index.mdx preamble."
```

---

## Task 14: Welcome Modal Component

**Files:**
- Create: `components/pilots/welcome-modal.tsx`

- [ ] **Step 1: Create WelcomeModal with 3 screens**

```tsx
// components/pilots/welcome-modal.tsx
"use client";

import { useState } from "react";

type Module = {
  slug: string;
  title: string;
  sections: { id: string; title: string }[];
  exercises: { id: string; title: string }[];
};

type WelcomeModalProps = {
  preferredName?: string;
  modules: Module[];
  onComplete: () => void;
  onSkip: () => void;
  onScreenChange: (screen: number) => void;
};

export function WelcomeModal({
  preferredName,
  modules,
  onComplete,
  onSkip,
  onScreenChange,
}: WelcomeModalProps) {
  const [screen, setScreen] = useState(1);

  function goTo(s: number) {
    setScreen(s);
    onScreenChange(s);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full mx-4 p-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="w-6 h-0.5 rounded-full"
              style={{ background: s <= screen ? "#0D9488" : "var(--border)" }}
            />
          ))}
        </div>

        {screen === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold mb-3">
              Welcome{preferredName ? `, ${preferredName}` : ", pilot"}.
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed text-left space-y-3">
              <p>
                You're one of the first people testing this playbook. That means
                your experience, your results, and your honest feedback directly
                shape what this becomes.
              </p>
              <p>
                This isn't a finished course. It's a build-in-public experiment,
                and you're part of the team building it.
              </p>
            </div>
          </div>
        )}

        {screen === 2 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-4 text-center">
              What you're signing up for
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>📖</div>
                <div>
                  <div className="font-medium">Read each build as it ships</div>
                  <div className="text-muted-foreground">Research-backed modules with exercises you run on your own community</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>🔨</div>
                <div>
                  <div className="font-medium">Do the exercises</div>
                  <div className="text-muted-foreground">Each one has a clear deliverable. Share your results if you want.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>💬</div>
                <div>
                  <div className="font-medium">Share feedback</div>
                  <div className="text-muted-foreground">Your input shapes the playbook. We'll ask at the end of each module.</div>
                </div>
              </div>
              <div className="pt-3 border-t border-border text-muted-foreground">
                <strong className="text-foreground">No pressure.</strong> No weekly meetings. No deadlines. No obligation to share anything you're not comfortable sharing. Go at your own pace.
              </div>
            </div>
          </div>
        )}

        {screen === 3 && (
          <div className="text-center">
            <h2 className="text-xl font-heading font-bold mb-2">
              You're all set.
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Build 1 has {modules.length} modules. Start with Module 1 and work through at your own pace.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left mb-6">
              {modules.map((mod, i) => (
                <div
                  key={mod.slug}
                  className={`rounded-lg p-3 border ${
                    i === 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-border opacity-60"
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    Module {i + 1}
                  </div>
                  <div className="text-xs font-medium">{mod.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {mod.sections.length} sections · {mod.exercises.length} exercises
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Start Module 1 →
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              You can revisit this welcome anytime from the <strong>?</strong> in the sidebar
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          {screen < 3 && (
            <div className="flex gap-2">
              {screen > 1 && (
                <button
                  onClick={() => goTo(screen - 1)}
                  className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => goTo(screen + 1)}
                className="px-6 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/pilots/welcome-modal.tsx
git commit -m "feat: add 3-screen welcome modal for first-time pilots

Personalized greeting, expectations, module preview grid.
Dismissable with skip, re-openable from sidebar."
```

---

## Task 15: Section Observer and Resume Banner

**Files:**
- Create: `components/pilots/section-observer.tsx`
- Create: `components/pilots/resume-banner.tsx`

- [ ] **Step 1: Create SectionObserver**

```tsx
// components/pilots/section-observer.tsx
"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

type SectionObserverProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  children: React.ReactNode;
};

export function SectionObserver({
  projectSlug,
  buildSlug,
  moduleSlug,
  children,
}: SectionObserverProps) {
  const { markVisited } = useProgress(projectSlug, buildSlug, moduleSlug);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            markVisited(entry.target.id);
          }
        }
      },
      { threshold: 0.5 }
    );

    // Observe all elements with data-section-id attribute
    const sections = document.querySelectorAll("[data-section-id]");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [moduleSlug, markVisited]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Create ResumeBanner**

```tsx
// components/pilots/resume-banner.tsx
"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/use-progress";

type ResumeBannerProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  sections: { id: string; title: string }[];
};

export function ResumeBanner({
  projectSlug,
  buildSlug,
  moduleSlug,
  sections,
}: ResumeBannerProps) {
  const { visitedSections, lastVisitedSection } = useProgress(
    projectSlug,
    buildSlug,
    moduleSlug
  );
  const [dismissed, setDismissed] = useState(false);

  // Only show if partially read (some sections visited but not all)
  if (
    dismissed ||
    visitedSections.size === 0 ||
    visitedSections.size >= sections.length ||
    !lastVisitedSection
  ) {
    return null;
  }

  const sectionTitle = sections.find(
    (s) => s.id === lastVisitedSection.sectionId
  )?.title;

  function scrollToSection() {
    const el = document.getElementById(lastVisitedSection!.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setDismissed(true);
  }

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-base">📍</span>
        <div>
          <div className="text-sm font-medium">Pick up where you left off?</div>
          {sectionTitle && (
            <div className="text-xs text-muted-foreground">
              You were reading "{sectionTitle}"
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
        <button
          onClick={scrollToSection}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          Resume →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/pilots/section-observer.tsx components/pilots/resume-banner.tsx
git commit -m "feat: add section observer for progress tracking and resume banner

SectionObserver wraps content, tracks sections via Intersection Observer.
ResumeBanner offers to scroll to last-read section on return."
```

---

## Task 16: Exercise Components

**Files:**
- Create: `components/pilots/exercise-callout.tsx`
- Create: `components/pilots/exercise-form.tsx`
- Create: `components/pilots/exercise-alternatives.tsx`
- Create: `components/mdx/exercise-mdx.tsx`

- [ ] **Step 1: Create ExerciseForm**

```tsx
// components/pilots/exercise-form.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useExercise } from "@/hooks/use-exercise";

type Field = { label: string; placeholder?: string };

type ExerciseFormProps = {
  exerciseId: string;
  projectSlug: string;
  buildSlug: string;
  fields: Field[];
};

export function ExerciseForm({
  exerciseId,
  projectSlug,
  buildSlug,
  fields,
}: ExerciseFormProps) {
  const { response, status, save, submit } = useExercise(
    exerciseId,
    projectSlug,
    buildSlug
  );
  const [values, setValues] = useState<string[]>(
    fields.map(() => "")
  );
  const [saving, setSaving] = useState(false);

  // Load existing response
  useEffect(() => {
    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) setValues(parsed);
      } catch {
        if (fields.length === 1) setValues([response]);
      }
    }
  }, [response, fields.length]);

  // Auto-save debounce
  const autoSave = useCallback(
    async (vals: string[]) => {
      const combined = JSON.stringify(vals);
      if (combined === "[]" || vals.every((v) => !v.trim())) return;
      await save(combined);
    },
    [save]
  );

  useEffect(() => {
    const timer = setTimeout(() => autoSave(values), 2000);
    return () => clearTimeout(timer);
  }, [values, autoSave]);

  async function handleSubmit() {
    setSaving(true);
    await submit(JSON.stringify(values));
    setSaving(false);
  }

  if (status === "submitted") {
    return (
      <div className="mt-4 pt-4 border-t border-indigo-500/15">
        <div className="text-xs text-muted-foreground mb-2">Your response (submitted):</div>
        {fields.map((field, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-medium mb-1">{field.label}</div>
            <div className="text-sm text-muted-foreground bg-card rounded-md px-3 py-2 border border-border">
              {values[i] || "(empty)"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-indigo-500/15">
      {fields.map((field, i) => (
        <div key={i} className="mb-3">
          <label className="text-xs font-medium block mb-1">{field.label}</label>
          <textarea
            value={values[i]}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              setValues(next);
            }}
            placeholder={field.placeholder || "Type your answer here..."}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSubmit}
          disabled={saving || values.every((v) => !v.trim())}
          className="px-5 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#6366F1" }}
        >
          {saving ? "Saving..." : "Save response"}
        </button>
        <span className="text-[10px] text-muted-foreground">Auto-saves as you type</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ExerciseAlternatives**

```tsx
// components/pilots/exercise-alternatives.tsx
"use client";

import { useState } from "react";

type ExerciseAlternativesProps = {
  exerciseId: string;
  exerciseTitle: string;
  prompt: string;
  emailSubject: string;
};

export function ExerciseAlternatives({
  exerciseId,
  exerciseTitle,
  prompt,
  emailSubject,
}: ExerciseAlternativesProps) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:jgerton.ai.assistant@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`My response to ${exerciseTitle}:\n\n`)}`;

  return (
    <div className="mt-4 pt-3 border-t border-indigo-500/10">
      {/* Featured: Claude prompt */}
      <button
        onClick={copyPrompt}
        className="w-full mb-3 flex items-center gap-2 px-3 py-2.5 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-sm text-foreground hover:bg-indigo-500/10 transition-colors"
      >
        <span>📋</span>
        <span className="font-medium">
          {copied ? "Copied!" : "Copy prompt for Claude"}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Work through this exercise with AI
        </span>
      </button>

      {/* Secondary options */}
      <div className="flex gap-2 text-[11px]">
        <span className="text-muted-foreground">Or:</span>
        <a
          href={mailtoHref}
          className="px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          📧 Email response
        </a>
        <span className="px-2 py-1 rounded border border-border text-muted-foreground flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
          📊 Google Sheets
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ExerciseCallout (combines description + form + alternatives)**

```tsx
// components/pilots/exercise-callout.tsx
"use client";

import { ExerciseForm } from "./exercise-form";
import { ExerciseAlternatives } from "./exercise-alternatives";

type Field = { label: string; placeholder?: string };

type ExerciseCalloutProps = {
  exerciseId: string;
  title: string;
  projectSlug: string;
  buildSlug: string;
  fields: Field[];
  prompt: string;
  emailSubject: string;
  children: React.ReactNode;
};

export function ExerciseCallout({
  exerciseId,
  title,
  projectSlug,
  buildSlug,
  fields,
  prompt,
  emailSubject,
  children,
}: ExerciseCalloutProps) {
  return (
    <div
      className="rounded-r-lg my-5 px-5 py-4"
      style={{
        borderLeft: "3px solid #6366F1",
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🔨</span>
        <span
          className="font-semibold text-xs uppercase tracking-wider"
          style={{ color: "#6366F1" }}
        >
          {title}
        </span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>

      <ExerciseForm
        exerciseId={exerciseId}
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        fields={fields}
      />

      <ExerciseAlternatives
        exerciseId={exerciseId}
        exerciseTitle={title}
        prompt={prompt}
        emailSubject={emailSubject}
      />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/pilots/exercise-callout.tsx components/pilots/exercise-form.tsx components/pilots/exercise-alternatives.tsx
git commit -m "feat: add exercise components with inline form, Claude prompt, and alternatives

ExerciseCallout wraps description + ExerciseForm (auto-save to Convex)
+ ExerciseAlternatives (featured Claude prompt copy, email, sheets)."
```

---

## Task 17: Feedback Components

**Files:**
- Create: `components/pilots/module-feedback-form.tsx`
- Create: `components/pilots/ux-feedback-prompt.tsx`
- Create: `components/pilots/ux-feedback-form.tsx`

- [ ] **Step 1: Create ModuleFeedbackForm**

```tsx
// components/pilots/module-feedback-form.tsx
"use client";

import { useState } from "react";
import { useFeedback } from "@/hooks/use-feedback";

type ModuleFeedbackFormProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
};

export function ModuleFeedbackForm({
  projectSlug,
  buildSlug,
  moduleSlug,
}: ModuleFeedbackFormProps) {
  const { submitted, submit } = useFeedback(projectSlug, buildSlug, moduleSlug);
  const [readiness, setReadiness] = useState<"not-ready" | "getting-there" | "ready" | null>(null);
  const [whatLanded, setWhatLanded] = useState("");
  const [whatsMissing, setWhatsMissing] = useState("");
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className="mt-12 pt-8 border-t-2 border-border">
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm">Thanks for your feedback. It shapes the next version of this module.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!readiness) return;
    setSubmitting(true);
    await submit({
      readiness,
      whatLanded: whatLanded || undefined,
      whatsMissing: whatsMissing || undefined,
      situation: situation || undefined,
    });
    setSubmitting(false);
  }

  const readinessOptions = [
    { value: "not-ready" as const, icon: "🤔", label: "Not ready", sub: "Too many gaps" },
    { value: "getting-there" as const, icon: "🔄", label: "Getting there", sub: "Need more specifics" },
    { value: "ready" as const, icon: "✅", label: "Ready", sub: "I know my next step" },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-12 pt-8 border-t-2 border-border">
      <h2 className="text-xl font-heading font-bold mb-1">How did this module land?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Everything below is optional except the first question. Even one sentence helps shape the next version.
      </p>

      {/* Signal question */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          How ready do you feel to act on this module? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {readinessOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReadiness(opt.value)}
              className={`flex-1 p-3 rounded-md border text-center text-sm transition-colors ${
                readiness === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="text-base mb-1">{opt.icon}</div>
              <div className={readiness === opt.value ? "font-medium text-primary" : "text-muted-foreground"}>
                {opt.label}
              </div>
              <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Open text fields */}
      <div className="mb-4">
        <label className="text-sm font-medium block mb-1">What landed</label>
        <p className="text-xs text-muted-foreground mb-1.5">
          What clicked for you? A specific data point, case study, or idea that changed how you're thinking.
        </p>
        <textarea
          value={whatLanded}
          onChange={(e) => setWhatLanded(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[70px] resize-y"
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium block mb-1">What's missing or unclear</label>
        <p className="text-xs text-muted-foreground mb-1.5">
          Where did you get stuck or feel like it didn't address your situation?
        </p>
        <textarea
          value={whatsMissing}
          onChange={(e) => setWhatsMissing(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[70px] resize-y"
        />
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium block mb-1">What's your situation</label>
        <p className="text-xs text-muted-foreground mb-1.5">
          Niche, size, stage, platform. Helps us understand whose feedback we're reading.
        </p>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[70px] resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={!readiness || submitting}
        className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit feedback"}
      </button>
      <span className="text-xs text-muted-foreground ml-3">Under 2 minutes.</span>
    </form>
  );
}
```

- [ ] **Step 2: Create UXFeedbackPrompt**

```tsx
// components/pilots/ux-feedback-prompt.tsx
"use client";

import { useState } from "react";
import { useUXFeedback } from "@/hooks/use-ux-feedback";
import { UXFeedbackForm } from "./ux-feedback-form";

type UXFeedbackPromptProps = {
  projectSlug: string;
  buildSlug: string;
};

export function UXFeedbackPrompt({ projectSlug, buildSlug }: UXFeedbackPromptProps) {
  const { shouldPrompt, submitted } = useUXFeedback(projectSlug, buildSlug);
  const [dismissed, setDismissed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!shouldPrompt || submitted || dismissed) return null;

  if (showForm) {
    return <UXFeedbackForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="mb-6 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-base">💬</span>
        <div>
          <div className="text-sm font-medium">How's the experience so far?</div>
          <div className="text-xs text-muted-foreground">
            You've completed 2+ modules. We'd love your input on the site itself.
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Later
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          Give feedback
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create UXFeedbackForm**

```tsx
// components/pilots/ux-feedback-form.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type UXFeedbackFormProps = {
  onClose: () => void;
};

function RatingScale({
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium block mb-2">{label}</label>
      <div className="flex gap-1.5 items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
              value === n
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="text-[10px] text-muted-foreground ml-2">
          1 = {lowLabel}, 5 = {highLabel}
        </span>
      </div>
    </div>
  );
}

export function UXFeedbackForm({ onClose }: UXFeedbackFormProps) {
  const submitUX = useMutation(api.pilotFeedback.submitUXFeedback);
  const [navigation, setNavigation] = useState<number | undefined>();
  const [readability, setReadability] = useState<number | undefined>();
  const [exerciseTools, setExerciseTools] = useState<number | undefined>();
  const [openText, setOpenText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await submitUX({
      navigation,
      readability,
      exerciseTools,
      openText: openText || undefined,
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-heading font-bold mb-1">Site experience feedback</h3>
      <p className="text-sm text-muted-foreground mb-5">Help us improve the pilots hub. Everything is optional.</p>

      <RatingScale label="How easy is it to find your way around?" lowLabel="lost" highLabel="intuitive" value={navigation} onChange={setNavigation} />
      <RatingScale label="How readable is the content?" lowLabel="hard to follow" highLabel="clear" value={readability} onChange={setReadability} />
      <RatingScale label="How useful are the exercise tools?" lowLabel="didn't use" highLabel="essential" value={exerciseTools} onChange={setExerciseTools} />

      <div className="mb-5">
        <label className="text-sm font-medium block mb-1">Anything else about the site experience?</label>
        <p className="text-xs text-muted-foreground mb-1.5">What's working well? What's frustrating?</p>
        <textarea
          value={openText}
          onChange={(e) => setOpenText(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[70px] resize-y"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/pilots/module-feedback-form.tsx components/pilots/ux-feedback-prompt.tsx components/pilots/ux-feedback-form.tsx
git commit -m "feat: add content feedback form and UX feedback components

ModuleFeedbackForm: signal question + 3 open text fields at module end.
UXFeedbackPrompt: triggered after 2+ modules with 1-5 rating scales."
```

---

## Task 18: Wire Module Page with All Features

**Files:**
- Modify: `app/pilots/[project]/[build]/[module]/page.tsx`

- [ ] **Step 1: Update module page to include SectionObserver, ResumeBanner, ModuleFeedbackForm, and UXFeedbackPrompt**

```tsx
// app/pilots/[project]/[build]/[module]/page.tsx
import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { ModuleHeader } from "@/components/pilots/module-header";
import { SectionObserverWrapper } from "@/components/pilots/section-observer-wrapper";
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ project: string; build: string; module: string }>;
};

export default async function ModulePage({ params }: PageProps) {
  const { project, build, module: moduleSlug } = await params;

  const modulePath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    `${moduleSlug}.mdx`
  );

  let source;
  let frontmatter;
  try {
    const raw = await readFile(modulePath, "utf-8");
    const { content, data } = matter(raw);
    frontmatter = data;
    source = await serialize(content);
  } catch {
    notFound();
  }

  const indexPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );
  const indexRaw = await readFile(indexPath, "utf-8");
  const { data: buildData } = matter(indexRaw);
  const moduleInfo = buildData.modules?.find(
    (m: { slug: string }) => m.slug === moduleSlug
  );

  if (!moduleInfo) notFound();

  const moduleIndex = buildData.modules.indexOf(moduleInfo);
  const totalModules = buildData.modules.length;
  const wordCount = source.compiledSource.split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <SectionObserverWrapper
      projectSlug={project}
      buildSlug={build}
      moduleSlug={moduleSlug}
      sections={moduleInfo.sections}
    >
      <ModuleHeader
        moduleNumber={moduleIndex + 1}
        totalModules={totalModules}
        title={frontmatter.title || moduleInfo.title}
        sectionCount={moduleInfo.sections?.length ?? 0}
        exerciseCount={moduleInfo.exercises?.length ?? 0}
        readTimeMinutes={readTime}
      />
      <MDXRenderer source={source} />
    </SectionObserverWrapper>
  );
}
```

- [ ] **Step 2: Create the client wrapper that combines SectionObserver, ResumeBanner, feedback, and UX prompt**

```tsx
// components/pilots/section-observer-wrapper.tsx
"use client";

import { SectionObserver } from "./section-observer";
import { ResumeBanner } from "./resume-banner";
import { ModuleFeedbackForm } from "./module-feedback-form";
import { UXFeedbackPrompt } from "./ux-feedback-prompt";

type Section = { id: string; title: string };

type SectionObserverWrapperProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  sections: Section[];
  children: React.ReactNode;
};

export function SectionObserverWrapper({
  projectSlug,
  buildSlug,
  moduleSlug,
  sections,
  children,
}: SectionObserverWrapperProps) {
  return (
    <SectionObserver
      projectSlug={projectSlug}
      buildSlug={buildSlug}
      moduleSlug={moduleSlug}
    >
      <UXFeedbackPrompt projectSlug={projectSlug} buildSlug={buildSlug} />
      <ResumeBanner
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        moduleSlug={moduleSlug}
        sections={sections}
      />
      {children}
      <ModuleFeedbackForm
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        moduleSlug={moduleSlug}
      />
    </SectionObserver>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pilots/\[project\]/\[build\]/\[module\]/page.tsx components/pilots/section-observer-wrapper.tsx
git commit -m "feat: wire module page with all features

SectionObserver, ResumeBanner, UXFeedbackPrompt, and ModuleFeedbackForm
all integrated into the module page via SectionObserverWrapper."
```

---

## Task 19: Update Pilots Layout and Sign-In Flow

**Files:**
- Modify: `app/pilots/layout.tsx`
- Modify: `app/pilots/signin/page.tsx`
- Modify: `components/pilot-nav.tsx`

- [ ] **Step 1: Update pilots layout to check for profile and approval**

```tsx
// app/pilots/layout.tsx
"use client";

import { PilotNav } from "@/components/pilot-nav";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useConvexAuth } from "convex/react";
import { PilotSignUpForm } from "@/components/pilots/pilot-signup-form";
import { PendingApproval } from "@/components/pilots/pending-approval";

export default function PilotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { profile, isLoading, hasProfile, approvalStatus } = usePilotProfile();

  // Not authenticated: show children (sign-in page or project listing)
  if (!isAuthenticated) {
    return (
      <div>
        <div className="max-w-3xl mx-auto px-6 pt-4">
          <PilotNav />
        </div>
        {children}
      </div>
    );
  }

  // Loading profile state
  if (isLoading) {
    return (
      <div className="py-24 px-6 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // No profile yet: show sign-up form
  if (!hasProfile) {
    return (
      <section className="py-24 px-6">
        <PilotSignUpForm />
      </section>
    );
  }

  // Pending approval: show YCAH membership message
  if (approvalStatus === "pending") {
    return <PendingApproval />;
  }

  // Revoked: show access removed message
  if (approvalStatus === "revoked") {
    return (
      <section className="py-24 px-6 text-center">
        <h1 className="text-2xl font-heading font-bold">Access Removed</h1>
        <p className="text-muted-foreground mt-2">
          Your pilot access has been revoked. Contact us if you think this is an error.
        </p>
      </section>
    );
  }

  // Approved: show full pilots experience
  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 pt-4 lg:hidden">
        <PilotNav />
      </div>
      {children}
    </div>
  );
}
```

Note: This converts the layout to a client component. The build-level layout (Task 12) handles the two-column structure with sidebar for authenticated, approved pilots.

- [ ] **Step 2: Update sign-in page copy**

```tsx
// app/pilots/signin/page.tsx
import { SignInForm } from "@/components/sign-in-form";

export const metadata = {
  title: "Sign In | Pilots Hub",
  description: "Sign in to access pilot projects on jpgerton.com",
};

export default function SignInPage() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-heading font-bold">Pilots Hub</h1>
        <p className="text-lg text-muted-foreground">
          Sign in with Google to access pilot projects. You'll need to be a
          YCAH community member to get started.
        </p>
        <SignInForm />
        <p className="text-sm text-muted-foreground">
          Not a YCAH member yet?{" "}
          <a
            href="https://www.skool.com/you-craft-ai-helps"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the community
          </a>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pilots/layout.tsx app/pilots/signin/page.tsx components/pilot-nav.tsx
git commit -m "feat: update pilots layout with profile check and YCAH verification flow

Authenticated users without profile see sign-up form.
Pending users see YCAH membership message with join link.
Approved users get full pilots experience."
```

---

## Task 20: Integration Testing and Polish

- [ ] **Step 1: Start dev server and Convex**

Run: `cd E:/Projects/jpgerton-site && bun run dev`
Run (separate terminal): `cd E:/Projects/jpgerton-site && bunx convex dev`

- [ ] **Step 2: Test the full sign-up flow**

1. Open http://localhost:3000/pilots
2. Click sign in, complete Google OAuth
3. Should see PilotSignUpForm (no profile yet)
4. Fill in name, preferred name, Skool details
5. If email not in ycahMembers: should see PendingApproval
6. Manually add your email to ycahMembers via Convex dashboard
7. Page should auto-update to approved (Convex reactivity)

- [ ] **Step 3: Test the content flow**

1. Navigate to /pilots/freemium-playbook/build-1
2. Should see preamble from index.mdx
3. Sidebar should show 4 modules
4. Click Module 1
5. Should see ModuleHeader + module content
6. Scroll through sections, verify sidebar scroll spy highlights
7. Check progress dots update as you scroll

- [ ] **Step 4: Test the welcome modal**

1. Clear pilotOnboarding record from Convex dashboard
2. Navigate to a build page
3. Welcome modal should appear with 3 screens
4. Verify Skip, Back, Next buttons work
5. Verify "Start Module 1" navigates correctly

- [ ] **Step 5: Test feedback form**

1. Scroll to bottom of any module
2. Select a readiness option
3. Fill in optional text fields
4. Submit
5. Verify "Thanks" confirmation appears
6. Check Convex dashboard for pilotFeedback record

- [ ] **Step 6: Fix any issues found during testing**

Address bugs, styling issues, and edge cases discovered during manual testing.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during integration testing"
```

---

## Task 21: Add Section ID Attributes to MDX Content

**Files:**
- Modify: `content/pilots/freemium-playbook/build-1/module-1.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-2.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-3.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-4.mdx`

- [ ] **Step 1: Add `data-section-id` attributes to section headings in MDX renderer**

Update the h2 and h3 components in `mdx-renderer.tsx` to pass through `id` attributes:

```tsx
h2: (props: React.ComponentProps<"h2">) => (
  <h2
    className="text-2xl font-heading font-semibold mt-10 mb-3"
    data-section-id={props.id}
    {...props}
  />
),
h3: (props: React.ComponentProps<"h3">) => (
  <h3
    className="text-xl font-heading font-semibold mt-8 mb-2"
    data-section-id={props.id}
    {...props}
  />
),
```

This ensures the Intersection Observer in PilotSidebar and SectionObserver can find section headings by their `data-section-id` attribute.

- [ ] **Step 2: Verify heading IDs are generated from MDX**

next-mdx-remote with rehype-slug generates IDs from heading text automatically. If not already installed:

Run: `cd E:/Projects/jpgerton-site && bun add rehype-slug`

Update the `serialize` call in the module page to include rehype-slug:

```tsx
import rehypeSlug from "rehype-slug";

source = await serialize(content, {
  mdxOptions: {
    rehypePlugins: [rehypeSlug],
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/mdx-renderer.tsx app/pilots/\[project\]/\[build\]/\[module\]/page.tsx app/pilots/\[project\]/\[build\]/page.tsx
git commit -m "feat: add section ID attributes for scroll spy and progress tracking

data-section-id on h2/h3 elements, rehype-slug for auto ID generation."
```

---

## Task 22: Add Callout Markup to Module Content

**Files:**
- Modify: `content/pilots/freemium-playbook/build-1/module-1.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-2.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-3.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-4.mdx`

- [ ] **Step 1: Add callout components to Module 1**

Go through module-1.mdx and wrap appropriate content in callout components. Examples from the actual content:

```mdx
<KeyData>
Courses with community support see 85-90% completion rates. Self-paced courses without community see 5-15%. That's an order of magnitude difference.

*Sources: ResearchGate comparative study, Open Praxis peer-reviewed*
</KeyData>

<Insight>
The format of your free tier matters more than the content in it. A free community with mediocre content will outperform a polished course library with no community. The interaction IS the product.
</Insight>

<WatchOut>
"Active" is the key word. If you have 1,000 free members and 300 are active, you're converting 8-15% of 300, not 1,000. Most benchmarks don't specify this.
</WatchOut>
```

- [ ] **Step 2: Repeat for Modules 2-4**

Apply callouts systematically to each module, using the six types as defined in the spec:
- Key Data for verified numbers and benchmarks
- Insight for principles and frameworks
- Action for concrete steps
- Exercise for hands-on deliverables (these will later become ExerciseCallout components)
- Watch Out for gotchas
- Open Question for what co-pilot data will answer

- [ ] **Step 3: Commit**

```bash
git add content/pilots/freemium-playbook/build-1/
git commit -m "feat: add callout markup to all 4 module MDX files

KeyData, Insight, Action, WatchOut, OpenQuestion callouts added
throughout Build 1 content for visual chunking."
```

---

## Task 23: Deploy to Production

- [ ] **Step 1: Push Convex schema to production**

Run: `cd E:/Projects/jpgerton-site && bunx convex deploy`

- [ ] **Step 2: Set production environment variables**

Run: `bunx convex env set ZAPIER_WEBHOOK_SECRET "YOUR_SECRET" --prod`

- [ ] **Step 3: Commit all remaining changes and push**

```bash
git add -A
git commit -m "chore: final polish before production deploy"
git push origin master
```

- [ ] **Step 4: Verify Vercel deployment**

Check https://jpgerton.com/pilots after Vercel auto-deploys from master.

- [ ] **Step 5: Seed the ycahMembers table with Jon's email**

Use Convex dashboard to manually add Jon's email to ycahMembers so he can test the full flow on production.

---

## Task 24: Zapier Configuration (Jon's Manual Setup)

This task is performed by Jon, not by code. Documented here for completeness.

- [ ] **Step 1: Configure YCAH Membership Questions in Skool**

1. Go to YCAH community Settings > Plugins
2. Click EDIT next to "Membership questions"
3. Toggle ON
4. Add question 1 (Email type): "What email do you use for AI tools and services?"
5. Add question 2 (Text box): "What's your Skool community URL? (Leave blank if you don't have one yet)"
6. Add question 3 (Multiple choice): "How did you find YCAH?" with options: "Search/Discovery", "Social media", "Referral from another member", "Pilot project link", "Other"
7. Save

- [ ] **Step 2: Create Zapier Zap**

1. Sign up at zapier.com (free plan)
2. Click "Create Zap"
3. Trigger: Search "Skool", select "Answered Membership Questions"
4. Connect Skool: get API key from YCAH Settings > Plugins > Zapier, enter group URL slug
5. Test trigger
6. Action: Search "Webhooks by Zapier", select "POST"
7. URL: `https://benevolent-hummingbird-297.convex.site/zapier/ycah-member`
8. Headers: `x-zapier-secret: YOUR_ZAPIER_WEBHOOK_SECRET`
9. Payload: JSON with fields mapped from Skool trigger data
10. Test action
11. Name: "YCAH Member Join > Convex Sync"
12. Publish and toggle ON
