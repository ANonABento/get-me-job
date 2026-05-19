import { describe, expect, it } from "vitest";
import type { OpportunityAutoTagRule } from "@slothing/shared/schemas";
import { applyAutoTagRules } from "./auto-tag";

function makeRule(
  overrides: Partial<OpportunityAutoTagRule>,
): OpportunityAutoTagRule {
  return {
    id: "rule-1",
    enabled: true,
    trigger: "source-equals",
    triggerValue: "waterlooworks",
    tags: ["ww"],
    ...overrides,
  };
}

describe("applyAutoTagRules", () => {
  it("returns empty array when no rules are given", () => {
    expect(applyAutoTagRules({ source: "waterlooworks" }, [])).toEqual([]);
  });

  it("source-equals matches case-insensitively", () => {
    const rules = [
      makeRule({ trigger: "source-equals", triggerValue: "WaterlooWorks" }),
    ];
    expect(applyAutoTagRules({ source: "waterlooworks" }, rules)).toEqual([
      "ww",
    ]);
  });

  it("title-includes matches case-insensitively", () => {
    const rules = [
      makeRule({
        trigger: "title-includes",
        triggerValue: "co-op",
        tags: ["co-op"],
      }),
    ];
    expect(
      applyAutoTagRules({ title: "Co-op Software Engineer" }, rules),
    ).toEqual(["co-op"]);
  });

  it("work-term-includes matches partial work term strings", () => {
    const rules = [
      makeRule({
        trigger: "work-term-includes",
        triggerValue: "fall",
        tags: ["fall-2026"],
      }),
    ];
    expect(applyAutoTagRules({ workTerm: "2026 - Fall" }, rules)).toEqual([
      "fall-2026",
    ]);
  });

  it("level-equals matches the parsed level enum value", () => {
    const rules = [
      makeRule({
        trigger: "level-equals",
        triggerValue: "junior",
        tags: ["entry-friendly"],
      }),
    ];
    expect(applyAutoTagRules({ level: "junior" }, rules)).toEqual([
      "entry-friendly",
    ]);
  });

  it("skips disabled rules", () => {
    const rules = [
      makeRule({
        enabled: false,
        trigger: "source-equals",
        triggerValue: "waterlooworks",
        tags: ["ww"],
      }),
    ];
    expect(applyAutoTagRules({ source: "waterlooworks" }, rules)).toEqual([]);
  });

  it("dedupes tags case-insensitively across rules, preserving first-seen casing", () => {
    const rules = [
      makeRule({ id: "r1", tags: ["Co-op"] }),
      makeRule({
        id: "r2",
        trigger: "title-includes",
        triggerValue: "engineer",
        tags: ["co-op", "engineer"],
      }),
    ];
    expect(
      applyAutoTagRules(
        { source: "waterlooworks", title: "Software Engineer" },
        rules,
      ),
    ).toEqual(["Co-op", "engineer"]);
  });

  it("returns no tags when the opportunity is missing the trigger's field", () => {
    const rules = [
      makeRule({
        trigger: "work-term-includes",
        triggerValue: "fall",
        tags: ["fall-2026"],
      }),
    ];
    expect(applyAutoTagRules({ source: "waterlooworks" }, rules)).toEqual([]);
  });

  it("rejects empty triggerValue at runtime (defense-in-depth)", () => {
    // The schema validates this at the API layer, but applyAutoTagRules
    // is called downstream and should be safe against an empty value
    // sneaking through.
    const rules = [
      makeRule({
        trigger: "title-includes",
        triggerValue: "   ",
        tags: ["whatever"],
      }),
    ];
    expect(applyAutoTagRules({ title: "anything" }, rules)).toEqual([]);
  });

  it("composes multiple matching rules into the ordered tag list", () => {
    const rules = [
      makeRule({
        id: "r1",
        trigger: "source-equals",
        triggerValue: "waterlooworks",
        tags: ["ww"],
      }),
      makeRule({
        id: "r2",
        trigger: "work-term-includes",
        triggerValue: "fall",
        tags: ["fall-2026", "co-op-2026"],
      }),
      makeRule({
        id: "r3",
        trigger: "title-includes",
        triggerValue: "intern",
        tags: ["intern"],
      }),
    ];
    expect(
      applyAutoTagRules(
        {
          source: "waterlooworks",
          title: "Co-op Software Engineering Intern",
          workTerm: "2026 - Fall",
        },
        rules,
      ),
    ).toEqual(["ww", "fall-2026", "co-op-2026", "intern"]);
  });
});
