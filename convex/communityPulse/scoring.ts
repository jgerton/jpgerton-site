const DAY_MS = 24 * 60 * 60 * 1000;

const WEIGHT_ACTIVITY = 0.4;
const WEIGHT_RECENCY = 0.35;
const WEIGHT_POINTS = 0.25;

const ACT_STATUS_SCORES: Record<string, number> = {
  hardcore: 100,
  active: 70,
};
const ACT_STATUS_DEFAULT = 20;

// Skool sends lastOffline as nanosecond timestamps (19 digits).
// Anything past year 5000 in ms is assumed to actually be ns.
const NS_THRESHOLD = 1e15;

export function toMs(timestamp: number | undefined): number | undefined {
  if (timestamp == null) return undefined;
  if (timestamp > NS_THRESHOLD) return Math.floor(timestamp / 1e6);
  return timestamp;
}

export interface ScoringInput {
  actStatus?: string;
  lastOfflineMs?: number;
  points: number;
  level: number;
}

export function computeEngagementScore(input: ScoringInput): number {
  const activityScore =
    ACT_STATUS_SCORES[input.actStatus ?? ""] ?? ACT_STATUS_DEFAULT;

  const lastOfflineMs = toMs(input.lastOfflineMs);

  let recencyScore = 0;
  if (lastOfflineMs != null) {
    const daysSince = (Date.now() - lastOfflineMs) / DAY_MS;
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

export function assessChurnRisk(lastOffline: number | undefined): ChurnRisk {
  const lastOfflineMs = toMs(lastOffline);
  if (lastOfflineMs == null) return "high";
  const daysSince = (Date.now() - lastOfflineMs) / DAY_MS;
  if (daysSince < MEDIUM_THRESHOLD_DAYS) return "low";
  if (daysSince < HIGH_THRESHOLD_DAYS) return "medium";
  return "high";
}

export type Quadrant = "ambassador" | "drifting" | "loyal" | "at_risk";

const COMMUNITY_ACTIVE_THRESHOLD_DAYS = 14;

export interface QuadrantInput {
  churnRisk: ChurnRisk;
  lastActivityInCommunity: number | undefined;
  now: number;
}

export function assignQuadrant(input: QuadrantInput): Quadrant {
  const skoolActive = input.churnRisk === "low";
  const lastMs = toMs(input.lastActivityInCommunity);
  const communityActive =
    lastMs != null &&
    (input.now - lastMs) / DAY_MS < COMMUNITY_ACTIVE_THRESHOLD_DAYS;

  if (skoolActive && communityActive) return "ambassador";
  if (skoolActive && !communityActive) return "drifting";
  if (!skoolActive && communityActive) return "loyal";
  return "at_risk";
}
