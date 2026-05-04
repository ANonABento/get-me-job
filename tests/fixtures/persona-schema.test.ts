import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  validateExpectedPersona,
  validateTargetJob,
} from "./persona-schema";

describe("persona fixture schemas", () => {
  it("accepts a valid expected parser output fixture", () => {
    const parsed = validateExpectedPersona({
      personaSlug: "entry-cs-grad",
      expectedExperiences: [
        {
          title: "Software Engineering Intern",
          company: "Northstar Labs",
          startDate: "2025-05",
          endDate: "2025-08",
          location: "Austin, TX",
          summary: "Built React features for onboarding.",
          category: "experience",
        },
      ],
      expectedEducation: [
        {
          degree: "B.S. Computer Science",
          school: "Lone Star State University",
          startDate: "2022-09",
          endDate: "2026-05",
          gpa: "3.8",
        },
      ],
      expectedSkills: ["TypeScript", "React"],
      expectedProjects: [
        {
          name: "Campus Course Planner",
          description: "Degree planning app for students.",
          technologies: ["TypeScript", "SQLite"],
        },
      ],
      expectedTotalEntryCount: 5,
      knownLimitations: ["GPA may be parser-strategy dependent."],
    });

    expect(parsed.personaSlug).toBe("entry-cs-grad");
  });

  it("rejects expected fixtures with malformed dates", () => {
    expect(() =>
      validateExpectedPersona({
        personaSlug: "bad-date",
        expectedExperiences: [
          {
            title: "Engineer",
            company: "Example Labs",
            startDate: "May 2025",
            endDate: "2025-08",
            summary: "Built software.",
            category: "experience",
          },
        ],
        expectedEducation: [],
        expectedSkills: ["TypeScript"],
        expectedProjects: [],
        expectedTotalEntryCount: 1,
        knownLimitations: [],
      })
    ).toThrow();
  });

  it("accepts target jobs and rejects inverted salary ranges", () => {
    expect(
      validateTargetJob({
        title: "Junior Frontend Engineer",
        company: "Plausible Product Co",
        location: "Remote - US",
        remoteType: "remote",
        level: "junior",
        salaryMin: 90000,
        salaryMax: 120000,
        currency: "USD",
        techStack: ["React", "TypeScript"],
        summary: "Build product UI for a small engineering team.",
        url: "https://plausible-product.example.com/careers/junior-frontend",
      }).salaryMax
    ).toBe(120000);

    expect(() =>
      validateTargetJob({
        title: "Junior Frontend Engineer",
        company: "Plausible Product Co",
        location: "Remote - US",
        remoteType: "remote",
        level: "junior",
        salaryMin: 120000,
        salaryMax: 90000,
        currency: "USD",
        techStack: ["React", "TypeScript"],
        summary: "Build product UI for a small engineering team.",
        url: "https://plausible-product.example.com/careers/junior-frontend",
      })
    ).toThrow();
  });

  it("validates the checked-in persona fixture corpus", () => {
    const personasDir = path.join(process.cwd(), "tests/fixtures/personas");
    const personaSlugs = fs
      .readdirSync(personasDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(personaSlugs).toHaveLength(10);

    let jobCount = 0;
    for (const slug of personaSlugs) {
      const personaDir = path.join(personasDir, slug);
      const resume = fs.readFileSync(path.join(personaDir, "resume.pdf"));
      expect(resume.subarray(0, 5).toString("ascii")).toBe("%PDF-");

      const expected = JSON.parse(
        fs.readFileSync(path.join(personaDir, "expected.json"), "utf8")
      );
      expect(validateExpectedPersona(expected).personaSlug).toBe(slug);

      const jobsDir = path.join(personaDir, "target-jobs");
      const jobFiles = fs
        .readdirSync(jobsDir)
        .filter((file) => /^job-\d+\.json$/.test(file))
        .sort();
      expect(jobFiles).toHaveLength(5);

      for (const file of jobFiles) {
        const job = JSON.parse(
          fs.readFileSync(path.join(jobsDir, file), "utf8")
        );
        expect(validateTargetJob(job).url).toContain(".example.com/");
        jobCount += 1;
      }
    }

    expect(jobCount).toBe(50);
  });
});
