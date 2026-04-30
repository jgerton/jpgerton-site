"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

export function PilotNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="border-b border-border bg-background/50">
      <div className="container mx-auto flex h-10 items-center justify-end gap-4 px-4 text-sm text-muted-foreground">
        <Link href="/pilots" className="hover:text-accent">
          All Projects
        </Link>
        <button
          onClick={() => void signOut()}
          className="hover:text-accent"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
