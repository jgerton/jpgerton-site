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

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-xs text-fd-muted-foreground">
        <span>Related:</span>
        <a href="/pilots/docs/freemium-playbook/build-2/module-5" className="text-fd-primary underline">
          Exercise 5: Retention
        </a>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-fd-muted rounded-lg">
        {SEGMENTS.map(({ key, label }) => {
          const count = key === "at-risk" ? atRisk.length
            : key === "watch" ? watch.length
            : key === "active" ? active.length
            : allMembers.length;

          return (
            <button
              key={key}
              onClick={() => setSegment(key)}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                segment === key
                  ? "bg-fd-background text-fd-foreground font-medium shadow-sm"
                  : "text-fd-muted-foreground hover:text-fd-foreground"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-fd-border rounded-lg bg-fd-background mb-4 focus:outline-none focus:ring-2 focus:ring-fd-primary"
      />

      <div className="border border-fd-border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-fd-muted-foreground text-center py-8">
            No members in this segment.
          </p>
        ) : (
          <div className="divide-y divide-fd-border px-4">
            {filtered.map((member) => (
              <MemberRow key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-fd-muted-foreground mt-3">
        Showing {filtered.length} of {allMembers.length} members
      </p>
    </div>
  );
}
