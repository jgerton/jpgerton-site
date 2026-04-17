import Link from "next/link";

export type Quadrant = "ambassador" | "drifting" | "loyal" | "at_risk";

interface QuadrantGridProps {
  projectSlug: string;
  counts: Record<Quadrant, number>;
}

interface TileSpec {
  key: Quadrant;
  label: string;
  blurb: string;
  accent: string;   // CSS var
}

const TILES: TileSpec[] = [
  {
    key: "ambassador",
    label: "Ambassadors",
    blurb: "Invite to lead, co-create, drive referrals",
    accent: "var(--cool-accent)",
  },
  {
    key: "drifting",
    label: "Drifting",
    blurb: "Personal check-in; engaged elsewhere, forgetting you",
    accent: "var(--warm-urgent)",
  },
  {
    key: "loyal",
    label: "Loyal",
    blurb: "Nurture the relationship; rare and valuable",
    accent: "var(--cool-accent)",
  },
  {
    key: "at_risk",
    label: "At Risk",
    blurb: "Urgent outreach; may be leaving the platform",
    accent: "var(--danger)",
  },
];

export function QuadrantGrid({ projectSlug, counts }: QuadrantGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
    >
      {TILES.map((tile) => (
        <QuadrantTile
          key={tile.key}
          tile={tile}
          count={counts[tile.key] ?? 0}
          projectSlug={projectSlug}
        />
      ))}
    </div>
  );
}

function QuadrantTile({
  tile,
  count,
  projectSlug,
}: {
  tile: TileSpec;
  count: number;
  projectSlug: string;
}) {
  return (
    <Link
      href={`/pilots/${projectSlug}/community-ops/quadrant/${tile.key}`}
      style={{
        display: "block",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${tile.accent}`,
        borderRadius: 8,
        padding: "16px 18px",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.15s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface)")}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            color: tile.accent,
            fontFamily: "Archivo, sans-serif",
          }}
        >
          {tile.label}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "Archivo, sans-serif",
            fontVariantNumeric: "tabular-nums",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          marginTop: 8,
          marginBottom: 0,
          fontFamily: "Figtree, sans-serif",
          lineHeight: 1.4,
        }}
      >
        {tile.blurb}
      </p>
    </Link>
  );
}
