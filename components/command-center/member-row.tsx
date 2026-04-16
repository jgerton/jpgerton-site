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
  high: { dot: "bg-red-500", label: "At Risk", labelClass: "text-red-600 dark:text-red-400" },
  medium: { dot: "bg-amber-500", label: "Watch", labelClass: "text-amber-600 dark:text-amber-400" },
  low: { dot: "bg-blue-500", label: "Active", labelClass: "text-blue-600 dark:text-blue-400" },
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
    <div className="flex items-center gap-3 py-3 border-b border-fd-border last:border-b-0">
      <span className={`w-2 h-2 rounded-full ${risk.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {member.firstName} {member.lastName}
        </div>
        <div className="text-xs text-fd-muted-foreground">
          Score: {member.engagementScore} · Last seen: {timeAgo(member.lastOffline)}
        </div>
      </div>
      <span className={`text-xs font-medium ${risk.labelClass}`}>
        {risk.label}
      </span>
    </div>
  );
}
