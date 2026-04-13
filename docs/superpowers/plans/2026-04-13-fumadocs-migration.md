# Fumadocs Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom pilots hub layout, sidebar, scroll spy, and MDX rendering with Fumadocs v16, keeping all Convex backend, auth, exercises, and feedback functionality.

**Architecture:** Fumadocs handles content rendering, sidebar, mobile nav, dark mode, scroll spy/TOC, and SSR. Custom components (exercises, feedback, callouts) register via `mdx-components.tsx`. Auth gating moves to middleware redirects. The pilots landing page and auth pages (signin, signup, pending) remain as regular Next.js pages outside the Fumadocs layout. Content files stay in `content/pilots/` with added `meta.json` files for sidebar ordering.

**Tech Stack:** Fumadocs v16, Next.js 16, Tailwind v4, Convex, MDX, Bun

**Spec:** `docs/superpowers/specs/2026-04-11-pilots-hub-ui-redesign.md` (features), Fumadocs v16 docs (framework)

---

## File Structure

### New Files

```
source.config.ts                              # Fumadocs content source config
mdx-components.tsx                            # Global MDX component registry
lib/pilots-source.ts                          # Fumadocs loader for /pilots content
app/pilots/docs/layout.tsx                    # Fumadocs DocsLayout for content pages
app/pilots/docs/[[...slug]]/page.tsx          # Fumadocs catch-all content renderer
app/pilots/signup/page.tsx                    # Profile creation (moved from layout logic)
app/pilots/pending/page.tsx                   # YCAH pending approval page
content/pilots/meta.json                      # Root sidebar ordering
content/pilots/freemium-playbook/meta.json    # Project-level sidebar ordering
content/pilots/freemium-playbook/build-1/meta.json  # Build-level sidebar ordering
```

### Modified Files

```
next.config.ts                                # Wrap with createMDX()
app/globals.css                               # Add Fumadocs CSS imports
app/layout.tsx                                # Add RootProvider
app/pilots/layout.tsx                         # Simplified: auth check only, no custom layout
app/pilots/page.tsx                           # Keep as-is (project listing)
app/pilots/signin/page.tsx                    # Keep as-is
middleware.ts                                 # Update route patterns for new structure
content/pilots/freemium-playbook/build-1/index.mdx     # Remove YAML manifest (Fumadocs uses meta.json)
content/pilots/freemium-playbook/build-1/module-1.mdx  # Keep PilotExercise, works with new registry
content/pilots/freemium-playbook/exercise-configs.ts    # Keep as-is
components/pilots/exercise-callout.tsx        # Update to use useParams() for slugs
hooks/use-form-state.ts                       # Keep as-is
```

### Deleted Files

```
components/pilots/pilot-layout.tsx            # Replaced by Fumadocs DocsLayout
components/pilots/pilot-sidebar.tsx           # Replaced by Fumadocs sidebar
components/pilots/mobile-context-bar.tsx      # Replaced by Fumadocs mobile nav
components/pilots/module-header.tsx           # Replaced by Fumadocs DocsTitle/DocsDescription
components/pilots/section-observer.tsx        # Replaced by Fumadocs TOC scroll spy
components/pilots/section-observer-wrapper.tsx # Replaced by Fumadocs page layout
components/pilots/resume-banner.tsx           # Deferred (re-add later as custom component)
components/mdx-renderer.tsx                   # Replaced by Fumadocs MDX rendering
components/mdx/callouts.tsx                   # Move to mdx-components.tsx registry (file stays)
app/pilots/[project]/                         # Entire nested route structure replaced
```

### Kept As-Is

```
convex/*                                      # All Convex schema, mutations, queries
hooks/*                                       # All custom hooks (useFormState, useProgress, etc.)
components/pilots/pilot-signup-form.tsx        # Used by signup page
components/pilots/pending-approval.tsx         # Used by pending page
components/pilots/welcome-modal.tsx            # Used by docs layout
components/pilots/exercise-callout.tsx         # Registered in mdx-components.tsx
components/pilots/exercise-form.tsx            # Used by exercise-callout
components/pilots/exercise-alternatives.tsx    # Used by exercise-callout
components/pilots/module-feedback-form.tsx     # Registered in mdx-components.tsx
components/pilots/ux-feedback-form.tsx         # Used by UX feedback prompt
components/pilots/ux-feedback-prompt.tsx       # Used by docs layout wrapper
```

---

## Task 1: Install Fumadocs and Configure Next.js

**Files:**
- Modify: `next.config.ts`
- Create: `source.config.ts`

- [ ] **Step 1: Install Fumadocs packages**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bun add fumadocs-mdx fumadocs-core fumadocs-ui`

- [ ] **Step 2: Create source.config.ts at project root**

```ts
// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";

export const pilots = defineDocs({
  dir: "content/pilots",
});

export default defineConfig();
```

- [ ] **Step 3: Update next.config.ts to wrap with createMDX**

Replace the entire file:

```ts
// next.config.ts
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const withMDX = createMDX();

export default withMDX(nextConfig);
```

- [ ] **Step 4: Verify it builds**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add source.config.ts next.config.ts package.json bun.lock
git commit -m "feat: install Fumadocs v16 and configure MDX source

source.config.ts defines content/pilots/ as docs source.
next.config.ts wrapped with createMDX()."
```

---

## Task 2: Add Fumadocs CSS and RootProvider

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add Fumadocs CSS imports to globals.css**

Add these two lines after the existing `@import "tailwindcss";` line at the top of `app/globals.css`:

```css
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";
```

So the top of the file becomes:

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";

/* Custom theme configuration for Tailwind v4 */
@theme {
```

- [ ] **Step 2: Add RootProvider to app/layout.tsx**

Replace the entire file:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider";
import { inter, spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <RootProvider>
          <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>
              <Nav />
              <main>{children}</main>
              <Footer />
            </ConvexClientProvider>
          </ConvexAuthNextjsServerProvider>
        </RootProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add Fumadocs RootProvider and CSS imports

RootProvider wraps the app for theme/search. Fumadocs neutral
color preset and Tailwind v4 preset imported."
```

---

## Task 3: Create Content Source and MDX Components Registry

**Files:**
- Create: `lib/pilots-source.ts`
- Create: `mdx-components.tsx`

- [ ] **Step 1: Create lib/pilots-source.ts**

```ts
// lib/pilots-source.ts
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { pilots } from "@/source.config";

export const pilotsSource = loader({
  baseUrl: "/pilots/docs",
  source: createMDXSource(pilots.docs, pilots.meta),
});
```

- [ ] **Step 2: Create mdx-components.tsx at project root**

```tsx
// mdx-components.tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  KeyData,
  Insight,
  Action,
  Exercise,
  WatchOut,
  OpenQuestion,
} from "@/components/mdx/callouts";
import { PilotExerciseWrapper } from "@/components/pilots/pilot-exercise-wrapper";
import { ModuleFeedbackForm } from "@/components/pilots/module-feedback-form";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    KeyData,
    Insight,
    Action,
    Exercise,
    WatchOut,
    OpenQuestion,
    PilotExercise: PilotExerciseWrapper,
    ModuleFeedback: ModuleFeedbackForm,
    ...components,
  };
}
```

- [ ] **Step 3: Create the PilotExerciseWrapper that reads slugs from URL**

Create `components/pilots/pilot-exercise-wrapper.tsx`:

```tsx
// components/pilots/pilot-exercise-wrapper.tsx
"use client";

import { useParams } from "next/navigation";
import { ExerciseCallout } from "./exercise-callout";
import { exerciseConfigs } from "@/content/pilots/freemium-playbook/exercise-configs";

export function PilotExerciseWrapper({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children: React.ReactNode;
}) {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];

  // URL: /pilots/docs/freemium-playbook/build-1/module-1
  // slugParts: ["freemium-playbook", "build-1", "module-1"]
  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";

  const config = exerciseConfigs[exerciseId];
  if (!config) return <div>Unknown exercise: {exerciseId}</div>;

  return (
    <ExerciseCallout
      exerciseId={exerciseId}
      title={config.title}
      fields={config.fields}
      prompt={config.prompt}
      emailSubject={config.emailSubject}
      projectSlug={projectSlug}
      buildSlug={buildSlug}
    >
      {children}
    </ExerciseCallout>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`

Note: This may fail because `fumadocs-mdx` generates `.source/` at dev time. Run `bun run dev` briefly to trigger generation if needed, then re-check.

- [ ] **Step 5: Commit**

```bash
git add lib/pilots-source.ts mdx-components.tsx components/pilots/pilot-exercise-wrapper.tsx
git commit -m "feat: add Fumadocs content source and MDX component registry

pilotsSource loads content/pilots/ with /pilots/docs base URL.
MDX components include callouts, PilotExercise, and ModuleFeedback."
```

---

## Task 4: Add Content Meta Files for Sidebar

**Files:**
- Create: `content/pilots/meta.json`
- Create: `content/pilots/freemium-playbook/meta.json`
- Create: `content/pilots/freemium-playbook/build-1/meta.json`
- Modify: `content/pilots/freemium-playbook/build-1/index.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-1.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-2.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-3.mdx`
- Modify: `content/pilots/freemium-playbook/build-1/module-4.mdx`

- [ ] **Step 1: Create content/pilots/meta.json**

```json
{
  "title": "Pilots",
  "pages": ["freemium-playbook"]
}
```

- [ ] **Step 2: Create content/pilots/freemium-playbook/meta.json**

```json
{
  "title": "Freemium Playbook",
  "pages": ["build-1"]
}
```

- [ ] **Step 3: Create content/pilots/freemium-playbook/build-1/meta.json**

```json
{
  "title": "Build 1",
  "pages": [
    "index",
    "module-1",
    "module-2",
    "module-3",
    "module-4"
  ]
}
```

- [ ] **Step 4: Simplify index.mdx frontmatter**

Replace the large YAML manifest in `content/pilots/freemium-playbook/build-1/index.mdx` with simple Fumadocs frontmatter. Keep all body content. The frontmatter becomes:

```yaml
---
title: "The Freemium Community Playbook"
description: "A data-verified playbook for building a freemium Skool community, built in public with pilots."
---
```

Remove the entire `modules:` YAML block (the `meta.json` files handle sidebar ordering now). Keep all the prose content below the frontmatter unchanged.

- [ ] **Step 5: Simplify module frontmatter**

Each module MDX file keeps its title but adds a description. The `moduleNumber` field is no longer needed (Fumadocs sidebar ordering comes from `meta.json`).

For `module-1.mdx`, change frontmatter to:

```yaml
---
title: "The Economics of Free"
description: "Why freemium works as a conversion engine, backed by data and real case studies."
---
```

For `module-2.mdx`:

```yaml
---
title: "Your Two-Tier Architecture"
description: "Pricing, tier configuration, Start Here module, and gamification setup."
---
```

For `module-3.mdx`:

```yaml
---
title: "Seed or Co-Create? Preparing to Launch"
description: "Choosing your launch approach and defining your Day 1 activation metric."
---
```

For `module-4.mdx`:

```yaml
---
title: "The First 100 Members"
description: "Honest timelines, growth priorities, and the content flywheel."
---
```

- [ ] **Step 6: Commit**

```bash
git add content/pilots/
git commit -m "feat: add Fumadocs meta.json files and simplify MDX frontmatter

Sidebar ordering via meta.json. Module frontmatter simplified to
title + description (no more YAML manifest)."
```

---

## Task 5: Create Fumadocs Routes

**Files:**
- Create: `app/pilots/docs/layout.tsx`
- Create: `app/pilots/docs/[[...slug]]/page.tsx`

- [ ] **Step 1: Create the Fumadocs docs layout**

```tsx
// app/pilots/docs/layout.tsx
import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { pilotsSource } from "@/lib/pilots-source";

export default function PilotsDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={pilotsSource.pageTree}
      nav={{
        title: "Pilots Hub",
      }}
      sidebar={{
        defaultOpenLevel: 2,
      }}
    >
      {children}
    </DocsLayout>
  );
}
```

- [ ] **Step 2: Create the catch-all content page**

```tsx
// app/pilots/docs/[[...slug]]/page.tsx
import { notFound } from "next/navigation";
import { pilotsSource } from "@/lib/pilots-source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = pilotsSource.getPage(slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return pilotsSource.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pilotsSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
```

- [ ] **Step 3: Verify with dev server**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bun run dev`

Navigate to `http://localhost:3000/pilots/docs/freemium-playbook/build-1/module-1` and verify:
- Content renders with Fumadocs layout
- Sidebar shows Build 1 modules
- TOC shows section headings on the right
- Mobile responsive (resize browser)

- [ ] **Step 4: Commit**

```bash
git add app/pilots/docs/
git commit -m "feat: add Fumadocs routes for pilots content

DocsLayout with sidebar at /pilots/docs/. Catch-all page renders
MDX with Fumadocs page components. SSR by default."
```

---

## Task 6: Create Auth Gate Pages and Update Middleware

**Files:**
- Create: `app/pilots/signup/page.tsx`
- Create: `app/pilots/pending/page.tsx`
- Modify: `app/pilots/layout.tsx`
- Modify: `middleware.ts`

- [ ] **Step 1: Create signup page**

```tsx
// app/pilots/signup/page.tsx
"use client";

import { PilotSignUpForm } from "@/components/pilots/pilot-signup-form";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const { hasProfile, approvalStatus } = usePilotProfile();
  const router = useRouter();

  useEffect(() => {
    if (hasProfile && approvalStatus === "pending") {
      router.replace("/pilots/pending");
    } else if (hasProfile && (approvalStatus === "auto-approved" || approvalStatus === "approved")) {
      router.replace("/pilots/docs");
    }
  }, [hasProfile, approvalStatus, router]);

  return (
    <section className="py-24 px-6">
      <PilotSignUpForm
        onDone={() => {
          // Profile created, redirect handled by effect above
        }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Create pending page**

```tsx
// app/pilots/pending/page.tsx
"use client";

import { PendingApproval } from "@/components/pilots/pending-approval";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { approvalStatus } = usePilotProfile();
  const router = useRouter();

  // Auto-redirect when approved (Convex reactivity)
  useEffect(() => {
    if (approvalStatus === "auto-approved" || approvalStatus === "approved") {
      router.replace("/pilots/docs");
    }
  }, [approvalStatus, router]);

  return (
    <PendingApproval
      onEditProfile={() => router.push("/pilots/signup")}
    />
  );
}
```

- [ ] **Step 3: Simplify app/pilots/layout.tsx**

Replace the entire file. No more client-side auth state machine. Just a simple server layout:

```tsx
// app/pilots/layout.tsx
export default function PilotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Update middleware.ts for new route structure**

Replace the entire file:

```ts
// middleware.ts
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/pilots/signin"]);
const isProtectedRoute = createRouteMatcher([
  "/pilots/docs(.*)",
  "/pilots/signup",
  "/pilots/pending",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/pilots/docs");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/pilots/signin");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 5: Commit**

```bash
git add app/pilots/signup/ app/pilots/pending/ app/pilots/layout.tsx middleware.ts
git commit -m "feat: auth gate pages and middleware for Fumadocs routes

Signup and pending as standalone pages with auto-redirect on approval.
Middleware protects /pilots/docs/*, /pilots/signup, /pilots/pending.
Pilots layout simplified to passthrough."
```

---

## Task 7: Remove Old Custom Components and Routes

**Files:**
- Delete: `components/pilots/pilot-layout.tsx`
- Delete: `components/pilots/pilot-sidebar.tsx`
- Delete: `components/pilots/mobile-context-bar.tsx`
- Delete: `components/pilots/module-header.tsx`
- Delete: `components/pilots/section-observer.tsx`
- Delete: `components/pilots/section-observer-wrapper.tsx`
- Delete: `components/pilots/resume-banner.tsx`
- Delete: `components/mdx-renderer.tsx`
- Delete: `app/pilots/[project]/` (entire directory tree)

- [ ] **Step 1: Delete old custom layout components**

Run:
```bash
cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign
rm components/pilots/pilot-layout.tsx
rm components/pilots/pilot-sidebar.tsx
rm components/pilots/mobile-context-bar.tsx
rm components/pilots/module-header.tsx
rm components/pilots/section-observer.tsx
rm components/pilots/section-observer-wrapper.tsx
rm components/pilots/resume-banner.tsx
rm components/mdx-renderer.tsx
```

- [ ] **Step 2: Delete old route structure**

Run:
```bash
rm -rf app/pilots/\[project\]/
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`

Fix any remaining import references to deleted files.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove custom layout, sidebar, and old route structure

Replaced by Fumadocs DocsLayout, built-in sidebar, and catch-all route.
Components deleted: pilot-layout, pilot-sidebar, mobile-context-bar,
module-header, section-observer, section-observer-wrapper, resume-banner,
mdx-renderer."
```

---

## Task 8: Update Pilots Landing Page Links

**Files:**
- Modify: `app/pilots/page.tsx`
- Modify: `app/pilots/signin/page.tsx`
- Modify: `app/pilots/[project]/page.tsx` (if it still exists at this path)

- [ ] **Step 1: Update pilots landing page links**

In `app/pilots/page.tsx`, the project links currently point to `/pilots/${project.slug}`. Update them to point to `/pilots/docs/${project.slug}`:

Change:
```tsx
href={`/pilots/${project.slug}`}
```
To:
```tsx
href={`/pilots/docs/${project.slug}`}
```

Also update the sign-in copy to say "Sign in with Google" instead of "Sign in with your email":

Change:
```tsx
Sign in with your email
```
To:
```tsx
Sign in with Google
```

- [ ] **Step 2: Update signin page redirect**

In `app/pilots/signin/page.tsx`, verify the post-signin redirect points to `/pilots/docs` rather than `/pilots`.

- [ ] **Step 3: Commit**

```bash
git add app/pilots/page.tsx app/pilots/signin/page.tsx
git commit -m "fix: update links for new /pilots/docs/ route structure"
```

---

## Task 9: Integration Test with Dev Server

- [ ] **Step 1: Start both servers**

Terminal 1: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx convex dev`
Terminal 2: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bun run dev`

- [ ] **Step 2: Test unauthenticated flow**

1. Open `http://localhost:3000/pilots` - should show project listing (public)
2. Click the playbook link - should redirect to `/pilots/signin`
3. Try `http://localhost:3000/pilots/docs/freemium-playbook/build-1/module-1` directly - should redirect to signin

- [ ] **Step 3: Test authenticated flow**

1. Sign in with Google
2. Should see signup form (if no profile) or redirect to `/pilots/docs`
3. Fill in profile, submit
4. If email not in ycahMembers: should see pending page, auto-redirects when approved
5. When approved: should see Fumadocs content with sidebar

- [ ] **Step 4: Test content rendering**

1. Navigate to `/pilots/docs/freemium-playbook/build-1/module-1`
2. Verify: sidebar shows Build 1 modules on the left
3. Verify: TOC shows section headings on the right
4. Verify: callout components render (colored boxes with icons)
5. Verify: exercises render with interactive forms
6. Verify: "Copy prompt for Claude" button works
7. Verify: mobile responsive (resize browser to <1024px)

- [ ] **Step 5: Test feedback**

1. Scroll to bottom of Module 1
2. Check if ModuleFeedbackForm renders (may need to add `<ModuleFeedback>` tag to module MDX)

- [ ] **Step 6: Fix any issues found**

Address bugs discovered during testing.

- [ ] **Step 7: Commit fixes**

```bash
git add -A
git commit -m "fix: address issues found during Fumadocs integration testing"
```
