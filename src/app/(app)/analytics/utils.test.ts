import { describe, expect, it } from "vitest";
import { getPipelineSkillsGridClass, shouldShowSkillsOverview } from "./utils";

describe("analytics page utils", () => {
  it("hides the skills overview when there are no skills", () => {
    expect(shouldShowSkillsOverview({ total: 0 })).toBe(false);
  });

  it("shows the skills overview when skills exist", () => {
    expect(shouldShowSkillsOverview({ total: 1 })).toBe(true);
  });

  it("collapses the pipeline row when skills are hidden", () => {
    expect(getPipelineSkillsGridClass(false)).toBe("grid gap-6");
  });

  it("splits the row when skills are shown", () => {
    expect(getPipelineSkillsGridClass(true)).toBe("grid gap-6 lg:grid-cols-2");
  });
});
