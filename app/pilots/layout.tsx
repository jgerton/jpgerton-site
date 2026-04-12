"use client";

import { useState } from "react";
import { PilotNav } from "@/components/pilot-nav";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { useConvexAuth } from "convex/react";
import { PilotSignUpForm } from "@/components/pilots/pilot-signup-form";
import { PendingApproval } from "@/components/pilots/pending-approval";

export default function PilotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { isLoading, hasProfile, approvalStatus } = usePilotProfile();
  const [editing, setEditing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div>
        <div className="max-w-3xl mx-auto px-6 pt-4">
          <PilotNav />
        </div>
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 px-6 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!hasProfile || editing) {
    return (
      <section className="py-24 px-6">
        <PilotSignUpForm onDone={() => setEditing(false)} />
      </section>
    );
  }

  if (approvalStatus === "pending") {
    return <PendingApproval onEditProfile={() => setEditing(true)} />;
  }

  if (approvalStatus === "revoked") {
    return (
      <section className="py-24 px-6 text-center">
        <h1 className="text-2xl font-heading font-bold">Access Removed</h1>
        <p className="text-muted-foreground mt-2">
          Your pilot access has been revoked. Contact us if you think this is an error.
        </p>
      </section>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 pt-4 lg:hidden">
        <PilotNav />
      </div>
      {children}
    </div>
  );
}
