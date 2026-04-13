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
