interface DashboardSummary {
  communityName: string;
  totalMembers: number;
  activeMembers: number;
  atRiskCount: number;
  watchCount: number;
  engagementRate: number;
  lastSyncedAt: number;
  ambassadorCount?: number;
  driftingCount?: number;
  loyalCount?: number;
  quadrantAtRiskCount?: number;
}

interface CcHeaderProps {
  communityName: string;
  summary: DashboardSummary | null | undefined;
  projectSlug: string;
}

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CcHeader({ communityName, summary, projectSlug }: CcHeaderProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Status line with pulse dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 10, height: 10 }}>
          <span
            className="pulse-dot-glow"
            style={{
              position: "absolute",
              display: "inline-flex",
              width: "100%",
              height: "100%",
              borderRadius: "9999px",
              background: "var(--pulse-glow)",
            }}
          />
          <span style={{
            position: "relative",
            display: "inline-flex",
            width: 7,
            height: 7,
            borderRadius: "9999px",
            background: "var(--warm-accent)",
          }} />
        </span>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
          color: "var(--text-secondary)",
          fontFamily: "Archivo, sans-serif",
        }}>
          Community Ops
        </span>
      </div>

      {/* Community name + nav */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "Figtree, sans-serif" }}>
          {communityName}
        </h1>
        <a
          href={`/pilots/${projectSlug}`}
          style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Back to playbook
        </a>
      </div>

      {/* Stat cards */}
      {summary && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}>
          <StatCard label="Members" value={summary.totalMembers} />
          <StatCard label="Engaged" value={`${summary.engagementRate}%`} accent="success" />
          <StatCard label="At Risk" value={summary.atRiskCount} accent="danger" />
          <StatCard label="Watch" value={summary.watchCount} accent="warning" />
        </div>
      )}

      {summary && (
        <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 12 }}>
          Last synced: {timeAgo(summary.lastSyncedAt)}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "danger" | "warning" | "success";
}) {
  const accentColor =
    accent === "danger" ? "var(--danger)"
    : accent === "warning" ? "var(--warm-urgent)"
    : accent === "success" ? "var(--success)"
    : "var(--warm-accent)";

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 8,
      padding: "16px 16px 12px",
      borderLeft: `3px solid ${accentColor}`,
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        fontFamily: "Archivo, sans-serif",
        fontVariantNumeric: "tabular-nums",
        color: accent ? accentColor : "var(--text-primary)",
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        color: "var(--text-secondary)",
        marginTop: 6,
        fontFamily: "Archivo, sans-serif",
      }}>
        {label}
      </div>
    </div>
  );
}
