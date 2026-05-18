import { describe, expect, it } from "vitest";
import { PROMPT_QA_FIXTURES } from "../../../evals/prompt-qa/fixtures";
import {
  buildTailorAutofixPrompt,
  buildTailoredResumePrompt,
} from "./prompt-builders";

describe("tailor prompt builders", () => {
  it("includes bank evidence, target job context, and JSON guardrails", () => {
    const fixture = PROMPT_QA_FIXTURES[0];
    const prompt = buildTailoredResumePrompt(
      {
        bankEntries: fixture.bankEntries,
        contact: fixture.contact,
        summary: fixture.profile.summary,
        jobTitle: fixture.job.title,
        company: fixture.job.company,
        jobDescription: fixture.job.description,
      },
      "Keep claims evidence-based.",
    );

    expect(prompt).toContain("ONLY the knowledge bank entries provided");
    expect(prompt).toContain("Campus Pantry Finder");
    expect(prompt).toContain("Frontend Engineer Intern");
    expect(prompt).toContain("ATS strictness: balanced");
    expect(prompt).toContain("Return ONLY a JSON object");
  });

  it("includes strict ATS guidance when requested", () => {
    const fixture = PROMPT_QA_FIXTURES[0];
    const prompt = buildTailoredResumePrompt(
      {
        bankEntries: fixture.bankEntries,
        contact: fixture.contact,
        jobTitle: fixture.job.title,
        company: fixture.job.company,
        jobDescription: fixture.job.description,
        settings: {
          bulletsPerRole: { min: 1, max: 4 },
          bulletsPerProject: { min: 0, max: 3 },
          maxRoles: 5,
          maxProjects: 3,
          atsStrictness: "strict",
          dropBulletsShorterThan: 0,
        },
      },
      "Keep claims evidence-based.",
    );

    expect(prompt).toContain("ATS strictness: strict");
    expect(prompt).toContain("plain, keyword-forward phrasing");
  });

  it("caps autofix keyword and job description context", () => {
    const fixture = PROMPT_QA_FIXTURES[5];
    const prompt = buildTailorAutofixPrompt({
      resume: fixture.resume,
      keywordsMissing: Array.from({ length: 20 }, (_, index) => `kw${index}`),
      jobDescription: "x".repeat(2100),
    });

    expect(prompt).toContain("kw14");
    expect(prompt).not.toContain("kw15");
    expect(prompt).toContain("Keep contact info and education unchanged");
  });
});
