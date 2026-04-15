"use client";

import { useConvexAuth } from "convex/react";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PilotsAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { isLoading: profileLoading, hasProfile, approvalStatus } = usePilotProfile();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!isAuthenticated) {
      router.replace("/pilots/signin");
      return;
    }

    if (!hasProfile) {
      router.replace("/pilots/signup");
      return;
    }

    if (approvalStatus === "pending") {
      router.replace("/pilots/pending");
      return;
    }

    if (approvalStatus === "revoked") {
      router.replace("/pilots");
      return;
    }
  }, [authLoading, profileLoading, isAuthenticated, hasProfile, approvalStatus, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-fd-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !hasProfile) return null;
  if (approvalStatus !== "auto-approved" && approvalStatus !== "approved") return null;

  return <>{children}</>;
}
