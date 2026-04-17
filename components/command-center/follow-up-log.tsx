"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface FollowUpLogProps {
  communityId: Id<"communities">;
  skoolUserId: string;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function prettyAction(action: string): string {
  return action.replace(/_/g, " ");
}

export function FollowUpLog({ communityId, skoolUserId }: FollowUpLogProps) {
  const followups = useQuery(api.communityPulse.queries.getFollowupsByMember, {
    communityId,
    skoolUserId,
  });

  if (followups === undefined) {
    return (
      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Loading history...</p>
    );
  }
  if (followups.length === 0) {
    return (
      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
        No follow-ups logged yet.
      </p>
    );
  }

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {followups.map((f) => (
        <li
          key={f._id}
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            fontFamily: "Figtree, sans-serif",
            display: "flex",
            gap: 10,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(f.actedAt)}</span>
          <span style={{ color: "var(--text-primary)", textTransform: "capitalize" as const }}>
            {prettyAction(f.action)}
          </span>
          {f.outcome && (
            <span>· {f.outcome}</span>
          )}
          {f.note && <span style={{ fontStyle: "italic" }}>— {f.note}</span>}
        </li>
      ))}
    </ul>
  );
}
