"use client";

import { useState } from "react";
import { MemberRow } from "./member-row";

type Segment = "at-risk" | "watch" | "active" | "all";

interface MemberSnapshot {
  _id: string;
  firstName: string;
  lastName: string;
  engagementScore: number;
  churnRisk: "low" | "medium" | "high";
  lastOffline?: number;
  actStatus?: string;
  points: number;
  level: number;
}

interface MembersViewProps {
  atRisk: MemberSnapshot[];
  watch: MemberSnapshot[];
  active: MemberSnapshot[];
}

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "at-risk", label: "At Risk" },
  { key: "watch", label: "Watch" },
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
];

export function MembersView({ atRisk, watch, active }: MembersViewProps) {
  const [segment, setSegment] = useState<Segment>("at-risk");
  const [search, setSearch] = useState("");

  const allMembers = [...atRisk, ...watch, ...active];

  const displayMembers =
    segment === "at-risk" ? atRisk
    : segment === "watch" ? watch
    : segment === "active" ? active
    : allMembers;

  const filtered = search
    ? displayMembers.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : displayMembers;

  const getCount = (key: Segment) =>
    key === "at-risk" ? atRisk.length
    : key === "watch" ? watch.length
    : key === "active" ? active.length
    : allMembers.length;

  return (
    <div>
      {/* Contextual link */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 12, color: "var(--text-secondary)" }}>
        <span>Related:</span>
        <a
          href="/pilots/docs/freemium-playbook/build-2/module-5"
          style={{ color: "var(--warm-accent)", textDecoration: "underline" }}
        >
          Exercise 5: Retention
        </a>
      </div>

      {/* Segment tabs */}
      <div style={{
        display: "flex",
        gap: 4,
        marginBottom: 16,
        padding: 4,
        background: "var(--surface)",
        borderRadius: 8,
      }}>
        {SEGMENTS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSegment(key)}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: 13,
              fontFamily: "Figtree, sans-serif",
              fontWeight: segment === key ? 600 : 400,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: segment === key ? "var(--surface-hover)" : "transparent",
              color: segment === key ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: segment === key ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {label} ({getCount(key)})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          fontSize: 13,
          fontFamily: "Figtree, sans-serif",
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--surface)",
          color: "var(--text-primary)",
          outline: "none",
          marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      {/* Member list */}
      <div style={{
        background: "var(--surface)",
        borderRadius: 8,
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {filtered.length === 0 ? (
          <p style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            textAlign: "center",
            padding: "32px 16px",
          }}>
            All clear here. Your community is thriving.
          </p>
        ) : (
          <div style={{ padding: "0 16px" }}>
            {filtered.map((member) => (
              <MemberRow key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 12 }}>
        Showing {filtered.length} of {allMembers.length} members
      </p>
    </div>
  );
}
