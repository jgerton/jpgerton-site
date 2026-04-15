"use client";

import { PendingApproval } from "@/components/pilots/pending-approval";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { approvalStatus } = usePilotProfile();
  const router = useRouter();

  useEffect(() => {
    if (approvalStatus === "auto-approved" || approvalStatus === "approved") {
      router.replace("/pilots/docs");
    }
  }, [approvalStatus, router]);

  return (
    <PendingApproval
      onEditProfile={() => router.push("/pilots/signup")}
    />
  );
}
