interface DashboardSummary {
  communityName: string;
  totalMembers: number;
  activeMembers: number;
  atRiskCount: number;
  watchCount: number;
  engagementRate: number;
  lastSyncedAt: number;
}

interface CcHeaderProps {
  communityName: string;
  summary: DashboardSummary | null;
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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{communityName}</h1>
        <a
          href={`/pilots/${projectSlug}`}
          className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          Back to playbook
        </a>
      </div>
      <p className="text-sm text-fd-muted-foreground mb-6">Command Center</p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Members" value={summary.totalMembers} />
          <StatCard label="Engagement Rate" value={`${summary.engagementRate}%`} />
          <StatCard label="At Risk" value={summary.atRiskCount} variant="danger" />
          <StatCard label="Watch" value={summary.watchCount} variant="warning" />
        </div>
      )}

      {summary && (
        <p className="text-xs text-fd-muted-foreground mt-3">
          Last synced: {timeAgo(summary.lastSyncedAt)}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant?: "danger" | "warning";
}) {
  const borderClass =
    variant === "danger"
      ? "border-red-200 dark:border-red-900"
      : variant === "warning"
        ? "border-amber-200 dark:border-amber-900"
        : "border-fd-border";

  return (
    <div className={`rounded-lg border p-4 ${borderClass}`}>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-fd-muted-foreground mt-1">{label}</div>
    </div>
  );
}
