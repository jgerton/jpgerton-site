"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

export function PilotNav() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
  );
}
