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

interface MemberRowProps {
  member: MemberSnapshot;
}

const RISK_STYLES = {
  high: { color: "var(--danger)", label: "At Risk" },
  medium: { color: "var(--warm-urgent)", label: "Watch" },
  low: { color: "var(--cool-accent)", label: "Active" },
};

function timeAgo(ms: number | undefined): string {
  if (ms == null) return "unknown";
  const days = Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function MemberRow({ member }: MemberRowProps) {
  const risk = RISK_STYLES[member.churnRisk];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid var(--rule)",
    }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: risk.color,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "Figtree, sans-serif" }}>
          {member.firstName} {member.lastName}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
          Score: {member.engagementScore} · Last seen: {timeAgo(member.lastOffline)}
        </div>
      </div>
      <span style={{
        fontSize: 11,
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
