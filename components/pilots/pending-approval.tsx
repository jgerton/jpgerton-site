"use client";

import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useAuthActions } from "@convex-dev/auth/react";

export function PendingApproval({ onEditProfile }: { onEditProfile?: () => void }) {
  const { profile } = usePilotProfile();
  const { signOut } = useAuthActions();

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
        <p className="text-sm text-muted-foreground">
          Signed in as <strong>{profile?.email}</strong>
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
        <div className="flex justify-center gap-4 pt-4 border-t border-border">
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Edit profile
            </button>
          )}
          <button
            onClick={() => void signOut()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}
