"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Quadrant } from "./quadrant-grid";

const BLURBS: Record<Quadrant, { action: string; prompt: string }> = {
  ambassador: {
    action: "invite_to_lead",
    prompt:
      "Invite your ambassadors to co-create content, lead a live session, or bring in a referral.",
  },
  drifting: {
    action: "personal_checkin",
    prompt:
      "Send a personal check-in. They're engaged on Skool but forgetting you.",
  },
  loyal: {
    action: "nurture",
    prompt:
      "Nurture the relationship. Active in your community even though quiet on Skool elsewhere.",
  },
  at_risk: {
    action: "urgent_outreach",
    prompt:
      "Urgent outreach. Offer help before they leave Skool entirely.",
  },
};

interface ActionCardProps {
  quadrant: Quadrant;
  memberSnapshotId: Id<"memberSnapshots">;
  memberName: string;
}

export function ActionCard({ quadrant, memberSnapshotId, memberName }: ActionCardProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "snoozed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const logFollowup = useMutation(api.communityPulse.followups.logFollowupWeb);

  const { action, prompt } = BLURBS[quadrant];

  async function mark(outcome?: "snoozed") {
    setStatus("saving");
    setError(null);
    try {
      await logFollowup({
        memberSnapshotId,
        quadrant,
        action,
        outcome,
      });
      setStatus(outcome === "snoozed" ? "snoozed" : "done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to log");
    }
  }

  if (status === "done" || status === "snoozed") {
    const label = status === "done" ? "Logged" : "Snoozed 7 days";
    return (
      <p
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          fontFamily: "Archivo, sans-serif",
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
          margin: 0,
        }}
      >
        {label} for {memberName}
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <p
        style={{
          flex: 1,
          fontSize: 12,
          color: "var(--text-secondary)",
          margin: 0,
          fontFamily: "Figtree, sans-serif",
        }}
      >
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{memberName}.</span>{" "}
        {prompt}
      </p>
      <button
        onClick={() => mark()}
        disabled={status === "saving"}
        style={primaryButtonStyle}
      >
        Mark done
      </button>
      <button
        onClick={() => mark("snoozed")}
        disabled={status === "saving"}
        style={secondaryButtonStyle}
      >
        Snooze 7d
      </button>
      {error && (
        <span style={{ fontSize: 11, color: "var(--danger)" }}>{error}</span>
      )}
    </div>
  );
}

const primaryButtonStyle = {
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "Archivo, sans-serif",
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  background: "var(--warm-accent)",
  color: "white",
};

const secondaryButtonStyle = {
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "Archivo, sans-serif",
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  background: "transparent",
  color: "var(--text-secondary)",
};
