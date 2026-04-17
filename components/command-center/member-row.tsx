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
  quadrant?: "ambassador" | "drifting" | "loyal" | "at_risk";
}

interface MemberRowProps {
  member: MemberSnapshot;
  index: number;
}

const RISK_STYLES = {
  high: { color: "var(--danger)", label: "At Risk" },
  medium: { color: "var(--warm-urgent)", label: "Watch" },
  low: { color: "var(--cool-accent)", label: "Active" },
};

const QUADRANT_COLORS = {
  ambassador: "var(--cool-accent)",
  drifting: "var(--warm-urgent)",
  loyal: "var(--cool-accent)",
  at_risk: "var(--danger)",
} as const;

function toMs(timestamp: number | undefined): number | undefined {
  if (timestamp == null) return undefined;
  // Skool sends nanosecond timestamps (19 digits). Convert to milliseconds.
  if (timestamp > 1e15) return Math.floor(timestamp / 1e6);
  return timestamp;
}

function timeAgo(raw: number | undefined): string {
  const ms = toMs(raw);
  if (ms == null) return "unknown";
  const days = Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));
  if (days < 0) return "online";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function MemberRow({ member, index }: MemberRowProps) {
  const risk = RISK_STYLES[member.churnRisk];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "6px 12px",
      background: index % 2 === 0 ? "transparent" : "var(--surface-hover)",
      borderRadius: 4,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: risk.color,
        flexShrink: 0,
      }} title={`Skool-wide: ${risk.label}`} />
      {member.quadrant && (
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: QUADRANT_COLORS[member.quadrant],
          flexShrink: 0,
          outline: "1.5px solid var(--surface)",
        }} title={`Quadrant: ${member.quadrant}`} />
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "Figtree, sans-serif" }}>
          {member.firstName} {member.lastName}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          <span title="Engagement score (0-100)">
            Score {member.engagementScore}
          </span>
          {" · "}
          {timeAgo(member.lastOffline)}
        </span>
      </div>
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "Archivo, sans-serif",
        letterSpacing: "0.03em",
        textTransform: "uppercase" as const,
        color: risk.color,
      }}>
        {risk.label}
      </span>
    </div>
  );
}
