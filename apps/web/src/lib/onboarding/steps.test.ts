import { describe, expect, it } from "vitest";
import {
  ADVANCED_ONBOARDING_STEPS,
  BASIC_ONBOARDING_STEPS,
  countCompletedSteps,
  getActiveStepIndex,
} from "./steps";
import type { OnboardingStats } from "./types";

function stats(overrides: Partial<OnboardingStats> = {}): OnboardingStats {
  return {
    documentsCount: 0,
    resumesGenerated: 0,
    jobsByStatus: {},
    ...overrides,
  };
}

describe("onboarding step registry", () => {
  it("defines the basic onboarding steps in product order", () => {
    expect(BASIC_ONBOARDING_STEPS.map((step) => step.id)).toEqual([
      "upload-resume",
      "install-extension",
      "add-opportunity",
      "create-tailored-doc",
    ]);
    expect(BASIC_ONBOARDING_STEPS).toHaveLength(4);
    expect(BASIC_ONBOARDING_STEPS.every((step) => step.tier === "basic")).toBe(
      true,
    );
  });

  it("defines advanced onboarding steps for shipped surfaces", () => {
    expect(ADVANCED_ONBOARDING_STEPS.map((step) => step.id)).toEqual([
      "draft-cover-letter",
      "practice-interview",
      "research-salary",
      "choose-studio-template",
      "review-calendar",
    ]);
    expect(
      ADVANCED_ONBOARDING_STEPS.every((step) => step.tier === "advanced"),
    ).toBe(true);
    expect(ADVANCED_ONBOARDING_STEPS.map((step) => step.href)).toEqual([
      "/studio?mode=cover-letter",
      "/interview",
      "/toolkit?tab=salary",
      "/studio",
      "/calendar",
    ]);
  });

  it("returns the first incomplete step index", () => {
    expect(getActiveStepIndex(BASIC_ONBOARDING_STEPS, stats())).toBe(0);
    expect(
      getActiveStepIndex(BASIC_ONBOARDING_STEPS, stats({ documentsCount: 1 })),
    ).toBe(1);
    expect(
      getActiveStepIndex(
        BASIC_ONBOARDING_STEPS,
        stats({ documentsCount: 1, extensionInstalled: true }),
      ),
    ).toBe(2);
    expect(
      getActiveStepIndex(
        BASIC_ONBOARDING_STEPS,
        stats({
          documentsCount: 1,
          extensionInstalled: true,
          jobsByStatus: { applied: 1 },
          resumesGenerated: 1,
        }),
      ),
    ).toBe(-1);
  });

  it("counts completed steps from registry predicates", () => {
    expect(countCompletedSteps(BASIC_ONBOARDING_STEPS, stats())).toBe(0);
    expect(
      countCompletedSteps(
        BASIC_ONBOARDING_STEPS,
        stats({
          documentsCount: 1,
          extensionInstalled: true,
          jobsByStatus: { pending: 1 },
        }),
      ),
    ).toBe(3);
    expect(
      countCompletedSteps(
        BASIC_ONBOARDING_STEPS,
        stats({
          documentsCount: 1,
          extensionInstalled: true,
          jobsByStatus: { offered: 1 },
          resumesGenerated: 1,
        }),
      ),
    ).toBe(4);
  });

  it("marks the extension step complete only when detected", () => {
    const extensionStep = BASIC_ONBOARDING_STEPS.find(
      (step) => step.id === "install-extension",
    );

    expect(extensionStep?.isComplete(stats())).toBe(false);
    expect(extensionStep?.isComplete(stats({ extensionInstalled: true }))).toBe(
      true,
    );
  });
});
