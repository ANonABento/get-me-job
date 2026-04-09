import { describe, expect, it } from "vitest";
import {
  buildNegotiationScriptText,
  getSalaryRangeInsight,
} from "@/features/salary/utils";

describe("buildNegotiationScriptText", () => {
  it("formats the full negotiation script for clipboard copy", () => {
    expect(
      buildNegotiationScriptText({
        opening: "Thank you for the offer.",
        valuePoints: ["I ship quickly", "I mentor teams"],
        theAsk: "I am looking for $180,000.",
        pushbackResponses: [{ objection: "Budget", response: "Can we revisit equity?" }],
        close: "I am excited to make this work.",
      })
    ).toContain('Q: "Budget"\nA: "Can we revisit equity?"');
  });
});

describe("getSalaryRangeInsight", () => {
  it("builds a readable range summary", () => {
    expect(
      getSalaryRangeInsight({
        location: "Remote",
        range: { median: 150000, percentile75: 180000 },
        role: "Staff Engineer",
        yearsExperience: "8",
      })
    ).toContain("Staff Engineer roles in Remote with 8 years of experience");
  });
});

