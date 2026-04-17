"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { MemberRow } from "@/components/command-center/member-row";
import { ActionCard } from "@/components/command-center/action-card";
import { FollowUpLog } from "@/components/command-center/follow-up-log";
import type { Quadrant } from "@/components/command-center/quadrant-grid";

const QUADRANT_LABELS: Record<Quadrant, string> = {
  ambassador: "Ambassadors",
  drifting: "Drifting",
  loyal: "Loyal",
  at_risk: "At Risk",
};

function isValidQuadrant(key: string): key is Quadrant {
  return key === "ambassador" || key === "drifting" || key === "loyal" || key === "at_risk";
}

export default function QuadrantPage() {
  const params = useParams<{ projectSlug: string; key: string }>();
  const { profile } = usePilotProfile();
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const keyParam = params.key;
  const quadrant: Quadrant | null = isValidQuadrant(keyParam) ? keyParam : null;

  const community = useQuery(
    api.communityPulse.queries.getCommunityBySlug,
    profile?.email ? { slug: params.projectSlug, ownerEmail: profile.email } : "skip"
  );

  const members = useQuery(
    api.communityPulse.queries.getMembersByQuadrant,
    community && quadrant ? { communityId: community._id, quadrant } : "skip"
  );

  if (!quadrant) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", padding: "32px 24px" }}>
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Figtree, sans-serif" }}>
            Unknown quadrant
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
            Try ambassador, drifting, loyal, or at_risk.
          </p>
          <Link
            href={`/pilots/${params.projectSlug}/community-ops`}
            style={{ color: "var(--warm-accent)", textDecoration: "underline", fontSize: 13 }}
          >
            Back to Community Ops
          </Link>
        </div>
      </div>
    );
  }

  if (community === undefined || members === undefined) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", padding: "32px 24px" }}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", padding: "32px 24px" }}>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            No community found. Sync members first from the extension.
          </p>
          <Link
            href={`/pilots/${params.projectSlug}/community-ops`}
            style={{ color: "var(--warm-accent)", textDecoration: "underline", fontSize: 13 }}
          >
            Back to Community Ops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh", padding: "32px 24px" }}>
      <div className="max-w-4xl mx-auto">
        <div style={{ marginBottom: 24 }}>
          <Link
            href={`/pilots/${params.projectSlug}/community-ops`}
            style={{ fontSize: 12, color: "var(--text-secondary)", textDecoration: "none" }}
          >
            ← Back to Community Ops
          </Link>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "8px 0 0",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            {QUADRANT_LABELS[quadrant]}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>

        {members.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "32px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              No one is in this quadrant right now. That's good news.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {members.map((member, i) => {
              const snapshotId = member._id as Id<"memberSnapshots">;
              const isExpanded = expandedMemberId === snapshotId;
              return (
                <div
                  key={snapshotId}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedMemberId(isExpanded ? null : snapshotId)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MemberRow member={member} index={i} />
                  </div>
                  <ActionCard
                    quadrant={quadrant}
                    memberSnapshotId={snapshotId}
                    memberName={`${member.firstName} ${member.lastName}`}
                  />
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase" as const,
                          color: "var(--text-secondary)",
                          fontFamily: "Archivo, sans-serif",
                          marginBottom: 6,
                        }}
                      >
                        History
                      </div>
                      <FollowUpLog
                        communityId={community._id}
                        skoolUserId={member.skoolUserId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
