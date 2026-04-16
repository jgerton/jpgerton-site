const DAY_MS = 24 * 60 * 60 * 1000;

const WEIGHT_ACTIVITY = 0.4;
const WEIGHT_RECENCY = 0.35;
const WEIGHT_POINTS = 0.25;

const ACT_STATUS_SCORES: Record<string, number> = {
  hardcore: 100,
  active: 70,
};
const ACT_STATUS_DEFAULT = 20;

export interface ScoringInput {
  actStatus?: string;
  lastOfflineMs?: number;
  points: number;
  level: number;
}

export function computeEngagementScore(input: ScoringInput): number {
  const activityScore =
    ACT_STATUS_SCORES[input.actStatus ?? ""] ?? ACT_STATUS_DEFAULT;

  let recencyScore = 0;
  if (input.lastOfflineMs != null) {
    const daysSince = (Date.now() - input.lastOfflineMs) / DAY_MS;
    recencyScore = Math.max(0, Math.min(100, 100 * Math.exp(-daysSince / 7)));
  }

  const ptsComponent = Math.min(100, Math.log1p(input.points) * 15);
  const lvComponent = Math.min(100, input.level * 20);
  const pointsScore = (ptsComponent + lvComponent) / 2;

  const raw =
    activityScore * WEIGHT_ACTIVITY +
    recencyScore * WEIGHT_RECENCY +
    pointsScore * WEIGHT_POINTS;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

export type ChurnRisk = "low" | "medium" | "high";

const MEDIUM_THRESHOLD_DAYS = 7;
const HIGH_THRESHOLD_DAYS = 14;

export function assessChurnRisk(lastOfflineMs: number | undefined): ChurnRisk {
  if (lastOfflineMs == null) return "high";
  const daysSince = (Date.now() - lastOfflineMs) / DAY_MS;
  if (daysSince < MEDIUM_THRESHOLD_DAYS) return "low";
  if (daysSince < HIGH_THRESHOLD_DAYS) return "medium";
  return "high";
}
