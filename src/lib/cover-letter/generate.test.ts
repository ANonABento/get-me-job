import { describe, it, expect } from "vitest";
import type { GroupedBankEntries, BankEntry } from "@/types";
import {
  buildSelectionRewritePrompt,
  buildSystemPrompt,
  buildRevisionPrompt,
  filterBankEntriesByIds,
  getTotalBankEntries,
} from "./generate";
import type { CoverLetterInput } from "./generate";

function makeBankEntry(overrides: Partial<BankEntry> = {}): BankEntry {
  return {
    id: "entry-1",
    userId: "default",
    category: "skill",
    content: { name: "React" },
    confidenceScore: 0.9,
    createdAt: "2024-01-01",
    ...overrides,
  };
}

function makeEmptyBank(): GroupedBankEntries {
  return {
    experience: [],
    skill: [],
    project: [],
    hackathon: [],
    education: [],
    achievement: [],
    certification: [],
  };
}

function makePopulatedBank(): GroupedBankEntries {
  return {
    experience: [
      makeBankEntry({
        id: "exp-1",
        category: "experience",
        content: {
          title: "Software Engineer",
          company: "Acme Corp",
          highlights: ["Built scalable APIs", "Led team of 5"],
        },
      }),
    ],
    skill: [
      makeBankEntry({
        id: "skill-1",
        category: "skill",
        content: { name: "TypeScript" },
      }),
      makeBankEntry({
        id: "skill-2",
        category: "skill",
        content: { name: "React" },
      }),
    ],
    project: [
      makeBankEntry({
        id: "proj-1",
        category: "project",
        content: { name: "Dashboard App", highlights: ["Real-time data viz"] },
      }),
    ],
    hackathon: [
      makeBankEntry({
        id: "hack-1",
        category: "hackathon",
        content: {
          name: "AI Build Weekend",
          prizes: ["Best AI App"],
          tracks: ["AI/ML"],
        },
      }),
    ],
    education: [
      makeBankEntry({
        id: "edu-1",
        category: "education",
        content: { degree: "BS Computer Science", institution: "MIT" },
      }),
    ],
    achievement: [
      makeBankEntry({
        id: "ach-1",
        category: "achievement",
        content: { description: "Won internal hackathon" },
      }),
    ],
    certification: [
      makeBankEntry({
        id: "cert-1",
        category: "certification",
        content: { name: "AWS Solutions Architect" },
      }),
    ],
  };
}

describe("getTotalBankEntries", () => {
  it("returns 0 for empty bank", () => {
    expect(getTotalBankEntries(makeEmptyBank())).toBe(0);
  });

  it("counts all entries across categories", () => {
    const bank = makePopulatedBank();
    expect(getTotalBankEntries(bank)).toBe(8);
  });
});

describe("filterBankEntriesByIds", () => {
  it("keeps only selected entries across categories", () => {
    const filtered = filterBankEntriesByIds(makePopulatedBank(), [
      "exp-1",
      "skill-2",
      "cert-1",
    ]);

    expect(filtered.experience.map((entry) => entry.id)).toEqual(["exp-1"]);
    expect(filtered.skill.map((entry) => entry.id)).toEqual(["skill-2"]);
    expect(filtered.project).toEqual([]);
    expect(filtered.hackathon).toEqual([]);
    expect(filtered.certification.map((entry) => entry.id)).toEqual(["cert-1"]);
    expect(getTotalBankEntries(filtered)).toBe(3);
  });
});

describe("buildSystemPrompt", () => {
  it("includes company and job title", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      jobTitle: "Frontend Engineer",
      company: "Google",
      bankEntries: makeEmptyBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("Google");
    expect(prompt).toContain("Frontend Engineer");
  });

  it("includes user name when provided", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makeEmptyBank(),
      userName: "John Doe",
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("John Doe");
  });

  it("does not include user name line when not provided", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makeEmptyBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).not.toContain("candidate's name is");
  });

  it("includes experience entries from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("Software Engineer at Acme Corp");
    expect(prompt).toContain("Built scalable APIs");
  });

  it("includes skills from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("React");
  });

  it("includes education from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("BS Computer Science");
    expect(prompt).toContain("MIT");
  });

  it("includes projects from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("Dashboard App");
  });

  it("includes hackathons from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("AI Build Weekend");
  });

  it("includes achievements from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("Won internal hackathon");
  });

  it("includes certifications from bank", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makePopulatedBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("AWS Solutions Architect");
  });

  it("uses defaults when company and jobTitle not provided", () => {
    const input: CoverLetterInput = {
      jobDescription: "We need a developer",
      bankEntries: makeEmptyBank(),
    };
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("the company");
    expect(prompt).toContain("the position");
  });
});

describe("buildRevisionPrompt", () => {
  it("includes the instruction", () => {
    const prompt = buildRevisionPrompt("make it more concise");
    expect(prompt).toContain("make it more concise");
  });

  it("asks for only the revised letter", () => {
    const prompt = buildRevisionPrompt("add more detail");
    expect(prompt).toContain("ONLY the revised cover letter");
  });
});

describe("buildSelectionRewritePrompt", () => {
  it("includes the selected passage and instruction", () => {
    const prompt = buildSelectionRewritePrompt(
      "I built APIs quickly.",
      "Add reliability impact"
    );

    expect(prompt).toContain("I built APIs quickly.");
    expect(prompt).toContain("Add reliability impact");
  });

  it("asks for only the rewritten passage", () => {
    const prompt = buildSelectionRewritePrompt("Old text", "Rewrite");

    expect(prompt).toContain("ONLY the rewritten passage");
    expect(prompt).not.toContain("full cover letter");
  });
});
