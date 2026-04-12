# Shared Form State Hook (`useFormState`)

**Date:** 2026-04-12
**Status:** Approved
**Project:** jpgerton.com/pilots
**Context:** All pilot hub forms need consistent reset, cancel, submit, and edit-after-submit behavior.

## Problem

Four forms in the pilots hub each manage their own submitting/dirty/reset state with duplicated patterns. Two forms (module feedback, UX feedback) lock after submission with no way to edit. No form supports reset-to-saved-values.

## Solution

A shared `useFormState<T>` hook that manages dirty tracking, reset, submitting state, and edit-after-submit. Each form component keeps its own field layout and validation. The hook handles the behavioral state machine.

## Hook API

```typescript
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
```

### Behavior

- `values` starts from `savedValues` if provided, otherwise `initialValues`.
- `isDirty` is true when any value differs from the reference state (`savedValues` or `initialValues`).
- `reset()` reverts values to `savedValues` if available, otherwise `initialValues`.
- `submit()` calls `onSubmit(values)`, sets `isSubmitting` during the call, sets `isSubmitted` on success. On success, updates the internal reference state to current values (so `isDirty` becomes false).
- `edit()` sets `isSubmitted` back to false so the form re-opens.
- If `savedValues` changes (e.g., Convex reactivity updates the record), the reference state updates and values sync to the new saved state (only if the form is not dirty).

## Per-Form Integration

### PilotSignUpForm

- `initialValues`: empty strings for all fields.
- `savedValues`: populated from `usePilotProfile().profile` when editing.
- `onSubmit`: calls `createProfile` or `updateProfile` depending on `hasProfile`.
- Reset: clears to saved profile values (edit mode) or empty (create mode).
- No `isSubmitted` usage (form disappears after create; edit returns to previous view via `onDone`).

### ExerciseForm

- `initialValues`: empty strings array.
- `savedValues`: populated from existing Convex response (parsed JSON).
- `onSubmit`: calls `submit()` from `useExercise` hook.
- Auto-save (2s debounce) stays in the component, not in the hook. Auto-save calls the exercise hook's `save()` (draft status), not the form hook's `submit()`.
- After submit: shows read-only view with "Edit response" link that calls `form.edit()`.
- Reset: reverts to last saved draft or empty.

### ModuleFeedbackForm

- `initialValues`: `{ readiness: null, whatLanded: "", whatsMissing: "", situation: "" }`.
- `savedValues`: populated from `useFeedback().response` if it exists.
- `onSubmit`: calls feedback hook's `submit()`. If `savedValues` exists, calls new `update()` mutation instead.
- After submit: shows "thanks" confirmation with "Edit your response" link.
- Reset: clears to saved feedback or empty.

### UXFeedbackForm

- `initialValues`: `{ navigation: undefined, readability: undefined, exerciseTools: undefined, openText: "" }`.
- `savedValues`: populated from `useUXFeedback()` existing record.
- `onSubmit`: calls UX feedback hook's `submit()`. If updating, calls new `update()` mutation.
- After submit: shows thanks with "Edit your response" link.
- Reset: clears to saved values or empty.

## Backend Changes

### New Convex mutations

**`pilotFeedback.updateModuleFeedback`**: Updates an existing `pilotFeedback` record. Accepts same args as `submitModuleFeedback` but patches the existing record instead of inserting. Finds existing record by userId + projectSlug + buildSlug + moduleSlug.

**`pilotFeedback.updateUXFeedback`**: Updates an existing `pilotUXFeedback` record. Accepts same args as `submitUXFeedback` but patches the existing record found by userId.

### Updated hooks

**`useFeedback`**: Add `update` method that calls `updateModuleFeedback`. Return `update` alongside `submit`.

**`useUXFeedback`**: Add `update` method that calls `updateUXFeedback`. Return `update` alongside `submit`.

## Button Convention

Every form follows this pattern for its action area:

| Button | Condition | Style |
|--------|-----------|-------|
| Submit/Save | Always shown | Primary, disabled when `!isDirty \|\| isSubmitting` |
| Reset | `isDirty` | Text link, secondary |
| Cancel | Form has `onCancel`/`onDone`/`onClose` prop | Text link, secondary |
| Edit response | `isSubmitted` (in the "thanks" view) | Text link |

## What This Hook Does NOT Do

- Field-level validation (forms handle their own required fields).
- Auto-save (exercise-specific behavior, stays in ExerciseForm).
- Navigation-away dirty warnings (low value for small pilot cohort).
- Form layout or button rendering (each form owns its UI).

## Files

### New
- `hooks/use-form-state.ts` - the shared hook

### Modified
- `convex/pilotFeedback.ts` - add `updateModuleFeedback` and `updateUXFeedback` mutations
- `hooks/use-feedback.ts` - add `update` method
- `hooks/use-ux-feedback.ts` - add `update` method
- `components/pilots/pilot-signup-form.tsx` - refactor to use `useFormState`
- `components/pilots/exercise-form.tsx` - refactor to use `useFormState` + add edit-after-submit
- `components/pilots/module-feedback-form.tsx` - refactor to use `useFormState` + add edit-after-submit
- `components/pilots/ux-feedback-form.tsx` - refactor to use `useFormState` + add edit-after-submit
