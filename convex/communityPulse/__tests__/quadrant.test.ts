import { describe, it, expect } from "vitest";
import { assignQuadrant } from "../scoring";

const NOW = new Date("2026-04-17T00:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

describe("assignQuadrant", () => {
  it("maps Skool-active + community-active to ambassador", () => {
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: NOW - 2 * DAY_MS,
        now: NOW,
      })
    ).toBe("ambassador");
  });

  it("maps Skool-active + community-inactive to drifting", () => {
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: NOW - 30 * DAY_MS,
        now: NOW,
      })
    ).toBe("drifting");
  });

  it("maps Skool-active + never-contributed to drifting", () => {
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: undefined,
        now: NOW,
      })
    ).toBe("drifting");
  });

  it("maps Skool-inactive (medium) + community-active to loyal", () => {
    expect(
      assignQuadrant({
        churnRisk: "medium",
        lastActivityInCommunity: NOW - 3 * DAY_MS,
        now: NOW,
      })
    ).toBe("loyal");
  });

  it("maps Skool-inactive (high) + community-active to loyal", () => {
    expect(
      assignQuadrant({
        churnRisk: "high",
        lastActivityInCommunity: NOW - 10 * DAY_MS,
        now: NOW,
      })
    ).toBe("loyal");
  });

  it("maps Skool-inactive + community-inactive to at_risk", () => {
    expect(
      assignQuadrant({
        churnRisk: "high",
        lastActivityInCommunity: NOW - 60 * DAY_MS,
        now: NOW,
      })
    ).toBe("at_risk");
  });

  it("maps Skool-inactive + never-contributed to at_risk", () => {
    expect(
      assignQuadrant({
        churnRisk: "high",
        lastActivityInCommunity: undefined,
        now: NOW,
      })
    ).toBe("at_risk");
  });

  it("treats exactly 14 days as community-inactive (boundary)", () => {
    // The rule is "within 14 days" = active. 14 days flat is the first
    // moment no longer inside the window.
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: NOW - 14 * DAY_MS,
        now: NOW,
      })
    ).toBe("drifting");
  });

  it("treats 13 days 23 hours as community-active (boundary)", () => {
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: NOW - (14 * DAY_MS - 60 * 60 * 1000),
        now: NOW,
      })
    ).toBe("ambassador");
  });

  it("normalizes nanosecond timestamps in lastActivityInCommunity", () => {
    const nsTwoDaysAgo = (NOW - 2 * DAY_MS) * 1_000_000;
    expect(
      assignQuadrant({
        churnRisk: "low",
        lastActivityInCommunity: nsTwoDaysAgo,
        now: NOW,
      })
    ).toBe("ambassador");
  });
});
