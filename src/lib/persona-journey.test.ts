import { describe, expect, it } from "vitest";
import {
  collectExpectedBankAssertions,
  fixturePathFor,
  formatSkipReason,
  missingFixtureLabels,
  parseTargetOpportunity,
  personaFixtureRequirements,
} from "./persona-journey";

describe("persona journey helpers", () => {
  it("expands fixture paths for a persona slug", () => {
    expect(
      fixturePathFor(
        personaFixtureRequirements.resumePdf,
        "career-switcher",
      ),
    ).toBe("tests/fixtures/personas/career-switcher/resume.pdf");
  });

  it("returns only missing fixture labels", () => {
    const existing = new Set([
      "tests/fixtures/personas/new-grad/resume.pdf",
      "tests/fixtures/personas/new-grad/expected.json",
    ]);

    expect(missingFixtureLabels("new-grad", existing)).toEqual([
      "target opportunity (tests/fixtures/personas/new-grad/target-jobs/job-1.json)",
    ]);
  });

  it("formats an empty skip reason when all fixtures exist", () => {
    expect(formatSkipReason("remote-only", [])).toBe("");
  });

  it("formats the missing fixture skip reason with dependency context", () => {
    expect(formatSkipReason("remote-only", ["resume PDF"])).toBe(
      "Persona journey 'remote-only' requires fixtures from Test 1.1: resume PDF",
    );
  });

  it("parses target opportunity fixtures from common job keys", () => {
    expect(
      parseTargetOpportunity({
        job: {
          role: "Frontend Engineer",
          employer: "Acme",
          jobDescription: "Build accessible UI",
          jobUrl: "https://example.com/job",
          requirements: ["React", "TypeScript"],
        },
      }),
    ).toEqual({
      title: "Frontend Engineer",
      company: "Acme",
      summary: "Build accessible UI",
      url: "https://example.com/job",
      location: undefined,
      skills: ["React", "TypeScript"],
    });
  });

  it("requires target opportunity fields needed by the UI form", () => {
    expect(() => parseTargetOpportunity({ title: "Missing company" })).toThrow(
      /title, company, and summary/,
    );
  });

  it("collects stable rendered bank assertions from expected fixtures", () => {
    expect(
      collectExpectedBankAssertions({
        entries: [
          {
            id: "entry-1",
            category: "experience",
            content: {
              company: "Globex",
              achievement: "Reduced onboarding time",
            },
          },
        ],
      }),
    ).toEqual(["experience", "Globex", "Reduced onboarding time"]);
  });
});
