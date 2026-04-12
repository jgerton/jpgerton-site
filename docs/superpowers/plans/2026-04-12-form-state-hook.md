# useFormState Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared `useFormState` hook that gives all pilot hub forms consistent reset, dirty tracking, submit, and edit-after-submit behavior.

**Architecture:** One generic hook (`useFormState<T>`) manages the state machine (values, dirty, submitting, submitted). Each form component uses the hook for state and renders its own fields and buttons following a shared button convention. Two new Convex mutations enable updating existing feedback records.

**Tech Stack:** React hooks, TypeScript generics, Convex mutations

**Spec:** `docs/superpowers/specs/2026-04-12-form-state-hook.md`

---

## File Structure

### New Files

```
hooks/use-form-state.ts              # Shared form state hook
```

### Modified Files

```
convex/pilotFeedback.ts              # Add updateModuleFeedback, updateUXFeedback mutations
hooks/use-feedback.ts                # Add update method
hooks/use-ux-feedback.ts             # Add update method
components/pilots/pilot-signup-form.tsx    # Refactor to useFormState
components/pilots/exercise-form.tsx       # Refactor to useFormState + edit-after-submit
components/pilots/module-feedback-form.tsx # Refactor to useFormState + edit-after-submit
components/pilots/ux-feedback-form.tsx     # Refactor to useFormState + edit-after-submit
```

---

## Task 1: Create `useFormState` Hook

**Files:**
- Create: `hooks/use-form-state.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/use-form-state.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type UseFormStateOptions<T extends Record<string, unknown>> = {
  initialValues: T;
  savedValues?: T;
  onSubmit: (values: T) => Promise<void>;
};

type UseFormStateReturn<T extends Record<string, unknown>> = {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submit: () => Promise<void>;
  reset: () => void;
  edit: () => void;
};

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

export function useFormState<T extends Record<string, unknown>>({
  initialValues,
  savedValues,
  onSubmit,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const referenceValues = savedValues ?? initialValues;
  const [values, setValues] = useState<T>(referenceValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    savedValues !== undefined && savedValues !== null
  );
  const prevSavedRef = useRef(savedValues);
  const dirtyRef = useRef(false);

  // Track dirty state
  const isDirty = !shallowEqual(values, referenceValues);
  dirtyRef.current = isDirty;

  // Sync values when savedValues changes externally (Convex reactivity),
  // but only if the user hasn't made unsaved edits
  useEffect(() => {
    if (savedValues && prevSavedRef.current !== savedValues) {
      prevSavedRef.current = savedValues;
      if (!dirtyRef.current) {
        setValues(savedValues);
        setIsSubmitted(true);
      }
    }
  }, [savedValues]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values]);

  const reset = useCallback(() => {
    setValues(referenceValues);
  }, [referenceValues]);

  const edit = useCallback(() => {
    setIsSubmitted(false);
  }, []);

  return {
    values,
    setValue,
    isDirty,
    isSubmitting,
    isSubmitted,
    submit,
    reset,
    edit,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-form-state.ts
git commit -m "feat: add useFormState hook for consistent form behavior

Generic hook managing dirty tracking, reset, submit state, and
edit-after-submit. Syncs with Convex reactivity when not dirty."
```

---

## Task 2: Add Backend Update Mutations

**Files:**
- Modify: `convex/pilotFeedback.ts`

- [ ] **Step 1: Add `updateModuleFeedback` mutation**

Add after the existing `submitModuleFeedback` mutation in `convex/pilotFeedback.ts`:

```typescript
export const updateModuleFeedback = mutation({
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

    const existing = await ctx.db
      .query("pilotFeedback")
      .withIndex("by_user_module", (q) =>
        q
          .eq("userId", userId)
          .eq("projectSlug", args.projectSlug)
          .eq("buildSlug", args.buildSlug)
          .eq("moduleSlug", args.moduleSlug)
      )
      .first();

    if (!existing) throw new Error("No feedback to update");

    await ctx.db.patch(existing._id, {
      readiness: args.readiness,
      whatLanded: args.whatLanded,
      whatsMissing: args.whatsMissing,
      situation: args.situation,
    });
  },
});
```

- [ ] **Step 2: Add `updateUXFeedback` mutation**

Add after the existing `submitUXFeedback` mutation in `convex/pilotFeedback.ts`:

```typescript
export const updateUXFeedback = mutation({
  args: {
    navigation: v.optional(v.number()),
    readability: v.optional(v.number()),
    exerciseTools: v.optional(v.number()),
    openText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pilotUXFeedback")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existing) throw new Error("No UX feedback to update");

    await ctx.db.patch(existing._id, {
      navigation: args.navigation,
      readability: args.readability,
      exerciseTools: args.exerciseTools,
      openText: args.openText,
    });
  },
});
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add convex/pilotFeedback.ts
git commit -m "feat: add update mutations for module feedback and UX feedback

updateModuleFeedback patches existing record by user + module.
updateUXFeedback patches existing record by userId."
```

---

## Task 3: Update Feedback Hooks with Update Methods

**Files:**
- Modify: `hooks/use-feedback.ts`
- Modify: `hooks/use-ux-feedback.ts`

- [ ] **Step 1: Add `update` method to `useFeedback`**

Replace the entire file `hooks/use-feedback.ts`:

```typescript
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
  const updateFeedback = useMutation(api.pilotFeedback.updateModuleFeedback);

  const data = {
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
    update: (data: {
      readiness: "not-ready" | "getting-there" | "ready";
      whatLanded?: string;
      whatsMissing?: string;
      situation?: string;
    }) =>
      updateFeedback({
        projectSlug,
        buildSlug,
        moduleSlug,
        ...data,
      }),
  };

  return data;
}
```

- [ ] **Step 2: Add `update` method to `useUXFeedback`**

Replace the entire file `hooks/use-ux-feedback.ts`:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProgress } from "./use-progress";

export function useUXFeedback(projectSlug: string, buildSlug: string) {
  const existing = useQuery(api.pilotFeedback.getMyUXFeedback);
  const submitUX = useMutation(api.pilotFeedback.submitUXFeedback);
  const updateUX = useMutation(api.pilotFeedback.updateUXFeedback);
  const { buildProgress } = useProgress(projectSlug, buildSlug);

  const modulesWithProgress = new Set(
    buildProgress.map((p) => p.moduleSlug)
  ).size;

  return {
    shouldPrompt: modulesWithProgress >= 2 && existing === null,
    submitted: existing !== null && existing !== undefined,
    response: existing,
    submit: (data: {
      navigation?: number;
      readability?: number;
      exerciseTools?: number;
      openText?: string;
    }) => submitUX(data),
    update: (data: {
      navigation?: number;
      readability?: number;
      exerciseTools?: number;
      openText?: string;
    }) => updateUX(data),
  };
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-feedback.ts hooks/use-ux-feedback.ts
git commit -m "feat: add update methods to feedback hooks

useFeedback and useUXFeedback now expose update() alongside submit()
for editing previously submitted feedback."
```

---

## Task 4: Refactor PilotSignUpForm to Use `useFormState`

**Files:**
- Modify: `components/pilots/pilot-signup-form.tsx`

- [ ] **Step 1: Rewrite PilotSignUpForm**

Replace the entire file `components/pilots/pilot-signup-form.tsx`:

```tsx
"use client";

import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useFormState } from "@/hooks/use-form-state";
import { useAuthActions } from "@convex-dev/auth/react";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  preferredName: string;
  skoolUsername: string;
  communityUrl: string;
  communityName: string;
};

export function PilotSignUpForm({ onDone }: { onDone?: () => void }) {
  const { profile, hasProfile, createProfile, updateProfile } = usePilotProfile();
  const { signOut } = useAuthActions();
  const isEditing = hasProfile;

  const form = useFormState<ProfileFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      skoolUsername: "",
      communityUrl: "",
      communityName: "",
    },
    savedValues: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName ?? "",
          preferredName: profile.preferredName,
          skoolUsername: profile.skoolUsername ?? "",
          communityUrl: profile.communityUrl ?? "",
          communityName: profile.communityName ?? "",
        }
      : undefined,
    onSubmit: async (values) => {
      if (isEditing) {
        await updateProfile({
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          preferredName: values.preferredName || values.firstName,
          skoolUsername: values.skoolUsername || undefined,
          communityUrl: values.communityUrl || undefined,
          communityName: values.communityName || undefined,
        });
      } else {
        await createProfile({
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          preferredName: values.preferredName || values.firstName,
          skoolUsername: values.skoolUsername || undefined,
          communityUrl: values.communityUrl || undefined,
          communityName: values.communityName || undefined,
        });
      }
      onDone?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.submit();
      }}
      className="max-w-md mx-auto space-y-4"
    >
      <h2 className="text-2xl font-heading font-bold text-center">
        {isEditing ? "Edit your profile" : "Complete your pilot profile"}
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
          value={form.values.firstName}
          onChange={(e) => form.setValue("firstName", e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Last name</label>
        <input
          type="text"
          value={form.values.lastName}
          onChange={(e) => form.setValue("lastName", e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          What should we call you?
        </label>
        <input
          type="text"
          value={form.values.preferredName}
          onChange={(e) => form.setValue("preferredName", e.target.value)}
          placeholder={form.values.firstName || "Your preferred name"}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used in your welcome message and throughout the site.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Skool username</label>
        <input
          type="text"
          value={form.values.skoolUsername}
          onChange={(e) => form.setValue("skoolUsername", e.target.value)}
          placeholder="@yourhandle"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Your Skool community URL</label>
        <input
          type="url"
          value={form.values.communityUrl}
          onChange={(e) => form.setValue("communityUrl", e.target.value)}
          placeholder="https://www.skool.com/your-community"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Community name</label>
        <input
          type="text"
          value={form.values.communityName}
          onChange={(e) => form.setValue("communityName", e.target.value)}
          placeholder="My Awesome Community"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!form.values.firstName || !form.isDirty || form.isSubmitting}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {form.isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Continue"}
      </button>
      <div className="flex justify-center gap-4 pt-2">
        {form.isDirty && (
          <button
            type="button"
            onClick={form.reset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
        {isEditing && onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pilots/pilot-signup-form.tsx
git commit -m "refactor: PilotSignUpForm uses useFormState

Adds reset button when dirty, consistent submit/cancel/sign-out pattern."
```

---

## Task 5: Refactor ExerciseForm to Use `useFormState`

**Files:**
- Modify: `components/pilots/exercise-form.tsx`

- [ ] **Step 1: Rewrite ExerciseForm**

Replace the entire file `components/pilots/exercise-form.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useExercise } from "@/hooks/use-exercise";
import { useFormState } from "@/hooks/use-form-state";

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
  const exercise = useExercise(exerciseId, projectSlug, buildSlug);

  // Parse saved response into per-field values
  function parseResponse(raw: string): Record<string, string> {
    const result: Record<string, string> = {};
    fields.forEach((_, i) => {
      result[`field_${i}`] = "";
    });
    if (!raw) return result;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((v, i) => {
          if (i < fields.length) result[`field_${i}`] = v;
        });
      }
    } catch {
      if (fields.length === 1) result["field_0"] = raw;
    }
    return result;
  }

  function valuesToArray(vals: Record<string, string>): string[] {
    return fields.map((_, i) => vals[`field_${i}`] ?? "");
  }

  const emptyValues: Record<string, string> = {};
  fields.forEach((_, i) => {
    emptyValues[`field_${i}`] = "";
  });

  const savedParsed = exercise.response ? parseResponse(exercise.response) : undefined;

  const form = useFormState<Record<string, string>>({
    initialValues: emptyValues,
    savedValues: savedParsed,
    onSubmit: async (values) => {
      await exercise.submit(JSON.stringify(valuesToArray(values)));
    },
  });

  // Auto-save debounce (exercise-specific, not in the hook)
  const autoSave = useCallback(
    async (vals: Record<string, string>) => {
      const arr = valuesToArray(vals);
      if (arr.every((v) => !v.trim())) return;
      await exercise.save(JSON.stringify(arr));
    },
    [exercise, fields],
  );

  const [autoSaveValues, setAutoSaveValues] = useState(form.values);
  useEffect(() => {
    setAutoSaveValues(form.values);
  }, [form.values]);

  useEffect(() => {
    const timer = setTimeout(() => autoSave(autoSaveValues), 2000);
    return () => clearTimeout(timer);
  }, [autoSaveValues, autoSave]);

  // Submitted view with edit option
  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="mt-4 pt-4 border-t border-indigo-500/15">
        <div className="text-xs text-muted-foreground mb-2">Your response (submitted):</div>
        {fields.map((field, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-medium mb-1">{field.label}</div>
            <div className="text-sm text-muted-foreground bg-card rounded-md px-3 py-2 border border-border">
              {form.values[`field_${i}`] || "(empty)"}
            </div>
          </div>
        ))}
        <button
          onClick={form.edit}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
        >
          Edit response
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-indigo-500/15">
      {fields.map((field, i) => (
        <div key={i} className="mb-3">
          <label className="text-xs font-medium block mb-1">{field.label}</label>
          <textarea
            value={form.values[`field_${i}`] ?? ""}
            onChange={(e) => form.setValue(`field_${i}`, e.target.value)}
            placeholder={field.placeholder || "Type your answer here..."}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void form.submit()}
            disabled={form.isSubmitting || valuesToArray(form.values).every((v) => !v.trim())}
            className="px-5 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "#6366F1" }}
          >
            {form.isSubmitting ? "Saving..." : "Save response"}
          </button>
          {form.isDirty && (
            <button
              onClick={form.reset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">Auto-saves as you type</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pilots/exercise-form.tsx
git commit -m "refactor: ExerciseForm uses useFormState with edit-after-submit

Adds reset button, edit link on submitted view. Auto-save stays
as exercise-specific behavior outside the shared hook."
```

---

## Task 6: Refactor ModuleFeedbackForm to Use `useFormState`

**Files:**
- Modify: `components/pilots/module-feedback-form.tsx`

- [ ] **Step 1: Rewrite ModuleFeedbackForm**

Replace the entire file `components/pilots/module-feedback-form.tsx`:

```tsx
"use client";

import { useFeedback } from "@/hooks/use-feedback";
import { useFormState } from "@/hooks/use-form-state";

type FeedbackValues = {
  readiness: string;
  whatLanded: string;
  whatsMissing: string;
  situation: string;
};

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
  const feedback = useFeedback(projectSlug, buildSlug, moduleSlug);

  const form = useFormState<FeedbackValues>({
    initialValues: {
      readiness: "",
      whatLanded: "",
      whatsMissing: "",
      situation: "",
    },
    savedValues: feedback.response
      ? {
          readiness: feedback.response.readiness,
          whatLanded: feedback.response.whatLanded ?? "",
          whatsMissing: feedback.response.whatsMissing ?? "",
          situation: feedback.response.situation ?? "",
        }
      : undefined,
    onSubmit: async (values) => {
      const data = {
        readiness: values.readiness as "not-ready" | "getting-there" | "ready",
        whatLanded: values.whatLanded || undefined,
        whatsMissing: values.whatsMissing || undefined,
        situation: values.situation || undefined,
      };
      if (feedback.submitted) {
        await feedback.update(data);
      } else {
        await feedback.submit(data);
      }
    },
  });

  // Submitted/thanks view
  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✓</span>
          <h3 className="text-lg font-heading font-semibold">Thanks for your feedback!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your input directly shapes the next iteration of this module.
        </p>
        <button
          onClick={form.edit}
          className="mt-3 text-sm text-primary hover:underline"
        >
          Edit your response
        </button>
      </div>
    );
  }

  const readinessOptions = [
    { value: "not-ready", label: "Not ready", sublabel: "Too many gaps" },
    { value: "getting-there", label: "Getting there", sublabel: "Need more specifics" },
    { value: "ready", label: "Ready", sublabel: "I know my next step" },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-heading font-semibold mb-1">Module feedback</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Takes under 2 minutes. Your honest input shapes the next iteration.
      </p>

      {/* Signal question */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          How ready do you feel to act on this module? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {readinessOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => form.setValue("readiness", option.value)}
              className={`flex-1 px-3 py-3 rounded-lg border text-center transition-colors ${
                form.values.readiness === option.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-[10px] mt-0.5">{option.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Open text fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">What landed?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            What clicked for you? A specific data point, case study, or idea.
          </p>
          <textarea
            value={form.values.whatLanded}
            onChange={(e) => form.setValue("whatLanded", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">What&apos;s missing or unclear?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Where did you get stuck or feel like it didn&apos;t address your situation?
          </p>
          <textarea
            value={form.values.whatsMissing}
            onChange={(e) => form.setValue("whatsMissing", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Your situation</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Niche, size, stage, platform. Helps us understand whose feedback we&apos;re reading.
          </p>
          <textarea
            value={form.values.situation}
            onChange={(e) => form.setValue("situation", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => void form.submit()}
          disabled={!form.values.readiness || !form.isDirty || form.isSubmitting}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {form.isSubmitting ? "Submitting..." : "Submit feedback"}
        </button>
        {form.isDirty && (
          <button
            onClick={form.reset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pilots/module-feedback-form.tsx
git commit -m "refactor: ModuleFeedbackForm uses useFormState with edit-after-submit

Adds reset when dirty, edit link on thanks view, uses update mutation
for re-submissions."
```

---

## Task 7: Refactor UXFeedbackForm to Use `useFormState`

**Files:**
- Modify: `components/pilots/ux-feedback-form.tsx`

- [ ] **Step 1: Rewrite UXFeedbackForm**

Replace the entire file `components/pilots/ux-feedback-form.tsx`:

```tsx
"use client";

import { useUXFeedback } from "@/hooks/use-ux-feedback";
import { useFormState } from "@/hooks/use-form-state";

type UXFeedbackValues = {
  navigation: string;
  readability: string;
  exerciseTools: string;
  openText: string;
};

type UXFeedbackFormProps = {
  projectSlug: string;
  buildSlug: string;
  onClose: () => void;
};

function RatingScale({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="mb-5">
      <label className="text-sm font-medium block mb-2">{label}</label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
              value === String(n)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UXFeedbackForm({
  projectSlug,
  buildSlug,
  onClose,
}: UXFeedbackFormProps) {
  const uxFeedback = useUXFeedback(projectSlug, buildSlug);

  const form = useFormState<UXFeedbackValues>({
    initialValues: {
      navigation: "",
      readability: "",
      exerciseTools: "",
      openText: "",
    },
    savedValues: uxFeedback.response
      ? {
          navigation: uxFeedback.response.navigation?.toString() ?? "",
          readability: uxFeedback.response.readability?.toString() ?? "",
          exerciseTools: uxFeedback.response.exerciseTools?.toString() ?? "",
          openText: uxFeedback.response.openText ?? "",
        }
      : undefined,
    onSubmit: async (values) => {
      const data = {
        navigation: values.navigation ? Number(values.navigation) : undefined,
        readability: values.readability ? Number(values.readability) : undefined,
        exerciseTools: values.exerciseTools ? Number(values.exerciseTools) : undefined,
        openText: values.openText || undefined,
      };
      if (uxFeedback.submitted) {
        await uxFeedback.update(data);
      } else {
        await uxFeedback.submit(data);
      }
    },
  });

  // Thanks view
  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="text-3xl mb-3">🙌</div>
          <h2 className="text-xl font-heading font-bold mb-2">Thanks!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your feedback helps us make the pilot experience better for everyone.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={form.edit}
              className="text-sm text-primary hover:underline"
            >
              Edit your response
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-heading font-bold mb-1">Site experience feedback</h2>
        <p className="text-sm text-muted-foreground mb-6">
          All fields optional. Rate 1 (poor) to 5 (great).
        </p>

        <RatingScale
          value={form.values.navigation}
          onChange={(v) => form.setValue("navigation", v)}
          label="How easy is it to find your way around?"
        />
        <RatingScale
          value={form.values.readability}
          onChange={(v) => form.setValue("readability", v)}
          label="How readable is the content?"
        />
        <RatingScale
          value={form.values.exerciseTools}
          onChange={(v) => form.setValue("exerciseTools", v)}
          label="How useful are the exercise tools?"
        />

        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">Anything else?</label>
          <textarea
            value={form.values.openText}
            onChange={(e) => form.setValue("openText", e.target.value)}
            placeholder="What's working well? What's frustrating?"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px] resize-y"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void form.submit()}
            disabled={!form.isDirty || form.isSubmitting}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {form.isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {form.isDirty && (
            <button
              onClick={form.reset}
              className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd E:/Projects/jpgerton-site/.worktrees/pilots-hub-redesign && bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pilots/ux-feedback-form.tsx
git commit -m "refactor: UXFeedbackForm uses useFormState with edit-after-submit

Adds reset button, edit link on thanks view, uses update mutation
for re-submissions. Rating scales use string values internally."
```
