import { describe, expect, it } from "vitest";
import {
  TOUCH_TARGET_COMFORT_CSS_PX,
  TOUCH_TARGET_MIN_CSS_PX,
  evaluateTouchTarget,
  findHeadingOrderIssues,
  hasAccessibleName,
  parseHeadingLevel,
} from "./a11y";

describe("evaluateTouchTarget", () => {
  it("fails when box is missing", () => {
    expect(evaluateTouchTarget(null).verdict).toBe("fail");
    expect(evaluateTouchTarget(undefined).verdict).toBe("fail");
  });

  it("fails when smallest side is below the WCAG floor", () => {
    const result = evaluateTouchTarget({
      width: TOUCH_TARGET_MIN_CSS_PX - 0.5,
      height: 80,
    });
    expect(result.verdict).toBe("fail");
    expect(result.reason).toContain("WCAG");
  });

  it("warns when smaller than comfort but at or above the floor", () => {
    const result = evaluateTouchTarget({
      width: TOUCH_TARGET_MIN_CSS_PX,
      height: TOUCH_TARGET_MIN_CSS_PX,
    });
    expect(result.verdict).toBe("comfort-warning");
  });

  it("warns at sizes between floor and comfort target", () => {
    const result = evaluateTouchTarget({ width: 36, height: 36 });
    expect(result.verdict).toBe("comfort-warning");
  });

  it("passes when smallest side meets the comfort target", () => {
    const result = evaluateTouchTarget({
      width: TOUCH_TARGET_COMFORT_CSS_PX,
      height: 200,
    });
    expect(result.verdict).toBe("pass");
  });

  it("uses the smallest dimension to make verdicts", () => {
    const tooThin = evaluateTouchTarget({ width: 8, height: 80 });
    expect(tooThin.verdict).toBe("fail");
    const tooShort = evaluateTouchTarget({ width: 80, height: 12 });
    expect(tooShort.verdict).toBe("fail");
  });
});

describe("parseHeadingLevel", () => {
  it("returns numeric level for h1-h6 (any case)", () => {
    expect(parseHeadingLevel("H1")).toBe(1);
    expect(parseHeadingLevel("h2")).toBe(2);
    expect(parseHeadingLevel("H6")).toBe(6);
  });

  it("returns null for non-heading tags", () => {
    expect(parseHeadingLevel("DIV")).toBeNull();
    expect(parseHeadingLevel("H7")).toBeNull();
    expect(parseHeadingLevel(null)).toBeNull();
    expect(parseHeadingLevel(undefined)).toBeNull();
    expect(parseHeadingLevel("")).toBeNull();
  });
});

describe("findHeadingOrderIssues", () => {
  it("returns no issues for empty input", () => {
    expect(findHeadingOrderIssues([])).toEqual([]);
  });

  it("returns no issues for sequential headings", () => {
    const issues = findHeadingOrderIssues([
      { level: 1, text: "Page" },
      { level: 2, text: "Section" },
      { level: 3, text: "Detail" },
      { level: 2, text: "Section 2" },
    ]);
    expect(issues).toEqual([]);
  });

  it("flags skipped levels (e.g. h2 -> h4)", () => {
    const issues = findHeadingOrderIssues([
      { level: 1, text: "Page" },
      { level: 2, text: "Section" },
      { level: 4, text: "Skipped" },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      index: 2,
      level: 4,
      previousLevel: 2,
      text: "Skipped",
    });
  });

  it("ignores ascending starts past h1", () => {
    const issues = findHeadingOrderIssues([
      { level: 3, text: "Card title" },
      { level: 4, text: "Detail" },
    ]);
    expect(issues).toEqual([]);
  });
});

describe("hasAccessibleName", () => {
  it("returns true when aria-label is present", () => {
    expect(hasAccessibleName({ ariaLabel: "Close" })).toBe(true);
  });

  it("returns true when aria-labelledby is present", () => {
    expect(hasAccessibleName({ ariaLabelledBy: "label-id" })).toBe(true);
  });

  it("returns true when text content is non-empty", () => {
    expect(hasAccessibleName({ textContent: "Submit" })).toBe(true);
  });

  it("returns true when title is non-empty", () => {
    expect(hasAccessibleName({ title: "More info" })).toBe(true);
  });

  it("treats whitespace-only values as missing", () => {
    expect(
      hasAccessibleName({
        ariaLabel: "  ",
        textContent: "\n\t",
        title: " ",
      }),
    ).toBe(false);
  });

  it("returns false when no naming inputs are provided", () => {
    expect(hasAccessibleName({})).toBe(false);
    expect(
      hasAccessibleName({ ariaLabel: null, textContent: null, title: null }),
    ).toBe(false);
  });
});
