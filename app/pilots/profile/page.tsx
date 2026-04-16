"use client";

import { PilotSignUpForm } from "@/components/pilots/pilot-signup-form";
import { useConvexAuth } from "convex/react";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { hasProfile, isLoading: profileLoading } = usePilotProfile();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!isAuthenticated) {
      router.replace("/pilots/signin");
    } else if (!hasProfile) {
      router.replace("/pilots/signup");
    }
  }, [authLoading, profileLoading, isAuthenticated, hasProfile, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !hasProfile) return null;

  return (
    <section className="py-24 px-6">
      <PilotSignUpForm onDone={() => router.push("/pilots/docs")} />
    </section>
  );
}
