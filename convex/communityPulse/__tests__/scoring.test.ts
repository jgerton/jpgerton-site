import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeEngagementScore, assessChurnRisk } from "../scoring";

describe("computeEngagementScore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("scores hardcore + recent + high points higher than defaults", () => {
    const high = computeEngagementScore({
      actStatus: "hardcore",
      lastOfflineMs: Date.now() - 1000 * 60 * 60, // 1 hour ago
      points: 500,
      level: 5,
    });
    const low = computeEngagementScore({
      actStatus: undefined,
      lastOfflineMs: undefined,
      points: 0,
      level: 0,
    });
    expect(high).toBeGreaterThan(low);
  });

  it("returns a score between 0 and 100", () => {
    const score = computeEngagementScore({
      actStatus: "hardcore",
      lastOfflineMs: Date.now(),
      points: 1000,
      level: 10,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives zero recency when lastOfflineMs is undefined", () => {
    const score = computeEngagementScore({
      actStatus: undefined,
      lastOfflineMs: undefined,
      points: 0,
      level: 0,
    });
    // Only activity default (20 * 0.4 = 8) + zero recency + zero points
    expect(score).toBe(8);
  });

  it("recent activity scores higher than stale", () => {
    const recent = computeEngagementScore({
      actStatus: "active",
      lastOfflineMs: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      points: 100,
      level: 3,
    });
    const stale = computeEngagementScore({
      actStatus: "active",
      lastOfflineMs: Date.now() - 1000 * 60 * 60 * 24 * 20, // 20 days ago
      points: 100,
      level: 3,
    });
    expect(recent).toBeGreaterThan(stale);
  });
});

describe("assessChurnRisk", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns low for activity within 7 days", () => {
    expect(assessChurnRisk(Date.now() - 1000 * 60 * 60 * 24 * 3)).toBe("low");
  });

  it("returns medium for 7-14 days inactive", () => {
    expect(assessChurnRisk(Date.now() - 1000 * 60 * 60 * 24 * 10)).toBe("medium");
  });

  it("returns high for 14+ days inactive", () => {
    expect(assessChurnRisk(Date.now() - 1000 * 60 * 60 * 24 * 20)).toBe("high");
  });

  it("returns high when lastOfflineMs is undefined", () => {
    expect(assessChurnRisk(undefined)).toBe("high");
  });
});
