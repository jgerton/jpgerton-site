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
        <label htmlFor="pilot-firstName" className="block text-sm font-medium mb-1">
          First name <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="pilot-firstName"
          type="text"
          required
          aria-required="true"
          value={form.values.firstName}
          onChange={(e) => form.setValue("firstName", e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label htmlFor="pilot-lastName" className="block text-sm font-medium mb-1">Last name</label>
        <input
          id="pilot-lastName"
          type="text"
          value={form.values.lastName}
          onChange={(e) => form.setValue("lastName", e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label htmlFor="pilot-preferredName" className="block text-sm font-medium mb-1">
          What should we call you?
        </label>
        <input
          id="pilot-preferredName"
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
        <label htmlFor="pilot-skoolUsername" className="block text-sm font-medium mb-1">Skool username</label>
        <input
          id="pilot-skoolUsername"
          type="text"
          value={form.values.skoolUsername}
          onChange={(e) => form.setValue("skoolUsername", e.target.value)}
          placeholder="@yourhandle"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label htmlFor="pilot-communityUrl" className="block text-sm font-medium mb-1">Your Skool community URL</label>
        <input
          id="pilot-communityUrl"
          type="url"
          value={form.values.communityUrl}
          onChange={(e) => form.setValue("communityUrl", e.target.value)}
          placeholder="https://www.skool.com/your-community"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        />
      </div>

      <div>
        <label htmlFor="pilot-communityName" className="block text-sm font-medium mb-1">Community name</label>
        <input
          id="pilot-communityName"
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
        {form.isSubmitting
          ? "Saving..."
          : form.isSubmitted && !form.isDirty
            ? "Saved"
            : isEditing && !form.isDirty
              ? "No unsaved changes"
              : isEditing
                ? "Save changes"
                : "Continue"}
      </button>
      {form.isSubmitted && !form.isDirty && (
        <p className="text-sm text-center text-green-600 dark:text-green-400">
          Profile saved successfully.
        </p>
      )}
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
