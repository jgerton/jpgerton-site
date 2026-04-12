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
