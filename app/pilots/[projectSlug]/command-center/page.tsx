"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { CcHeader } from "@/components/command-center/cc-header";
import { MembersView } from "@/components/command-center/members-view";

export default function CommandCenterPage() {
  const params = useParams<{ projectSlug: string }>();
  const searchParams = useSearchParams();
  const { profile } = usePilotProfile();

  const community = useQuery(
    api.communityPulse.queries.getCommunityBySlug,
    profile?.email
      ? { slug: params.projectSlug, ownerEmail: profile.email }
      : "skip"
  );

  const summary = useQuery(
    api.communityPulse.queries.getDashboardSummary,
    community ? { communityId: community._id } : "skip"
  );

  const members = useQuery(
    api.communityPulse.queries.getAtRiskMembers,
    community ? { communityId: community._id } : "skip"
  );

  const view = searchParams.get("view") ?? "members";

  if (community === undefined || summary === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-fd-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Community Data Yet</h1>
        <p className="text-fd-muted-foreground mb-6">
          Install the Community Pulse Pro extension and visit your Skool
          community&apos;s members page to start syncing data.
        </p>
        <a
          href={`/pilots/${params.projectSlug}`}
          className="text-fd-primary underline"
        >
          Back to playbook
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <CcHeader
        communityName={summary?.communityName ?? community.name}
        summary={summary}
        projectSlug={params.projectSlug}
      />

      {view === "members" && members && (
        <MembersView
          atRisk={members.atRisk}
          watch={members.watch}
          active={members.active}
        />
      )}
    </div>
  );
}
