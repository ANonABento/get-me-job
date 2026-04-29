import { describe, it, expect } from "vitest";
import type { GroupedBankEntries, BankEntry } from "@/types";
import type { BankMatch } from "./analyze";
import { generateFromBank } from "./generate";

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

function makeBank(): GroupedBankEntries {
  return {
    experience: [
      makeBankEntry({
        id: "e1",
        category: "experience",
        content: {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020-01",
          endDate: "2023-06",
          highlights: ["Led team of 5", "Built React dashboard"],
          skills: ["React", "TypeScript"],
        },
      }),
      makeBankEntry({
        id: "e2",
        category: "experience",
        content: {
          company: "Beta Inc",
          title: "Junior Developer",
          startDate: "2018-01",
          endDate: "2020-01",
          highlights: ["Wrote Python scripts"],
          skills: ["Python"],
        },
      }),
    ],
    skill: [
      makeBankEntry({ id: "s1", content: { name: "React" } }),
      makeBankEntry({ id: "s2", content: { name: "TypeScript" } }),
      makeBankEntry({ id: "s3", content: { name: "Python" } }),
    ],
    education: [
      makeBankEntry({
        id: "ed1",
        category: "education",
        content: {
          institution: "MIT",
          degree: "BS",
          field: "Computer Science",
          endDate: "2018",
        },
      }),
    ],
    project: [],
    hackathon: [],
    achievement: [],
    certification: [],
  };
}

function makeMatchedEntries(bank: GroupedBankEntries): BankMatch[] {
  return [
    {
      entry: bank.experience[0],
      relevanceScore: 0.8,
      matchedKeywords: ["react", "typescript"],
    },
    {
      entry: bank.skill[0],
      relevanceScore: 0.6,
      matchedKeywords: ["react"],
    },
    {
      entry: bank.skill[1],
      relevanceScore: 0.5,
      matchedKeywords: ["typescript"],
    },
  ];
}

describe("generateFromBank", () => {
  it("should generate a basic resume without LLM", async () => {
    const bank = makeBank();
    const matched = makeMatchedEntries(bank);

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: matched,
        contact: { name: "Jane Doe", email: "jane@example.com" },
        summary: "Experienced developer",
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "We need a React developer",
      },
      null
    );

    expect(result.contact.name).toBe("Jane Doe");
    expect(result.summary).toBe("Experienced developer");
    expect(result.experiences.length).toBeGreaterThan(0);
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.education.length).toBeGreaterThan(0);
  });

  it("should prioritize matched experiences", async () => {
    const bank = makeBank();
    const matched = makeMatchedEntries(bank);

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: matched,
        contact: { name: "Jane Doe" },
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "React developer needed",
      },
      null
    );

    // The first experience (Acme Corp) was matched, should appear first
    expect(result.experiences[0].company).toBe("Acme Corp");
  });

  it("should fill experiences from bank when few matches", async () => {
    const bank = makeBank();

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [], // No matches
        contact: { name: "Jane Doe" },
        jobTitle: "Backend Engineer",
        company: "Test Corp",
        jobDescription: "Python developer needed",
      },
      null
    );

    // Should still have experiences pulled from bank
    expect(result.experiences.length).toBeGreaterThan(0);
  });

  it("should prioritize matched skills", async () => {
    const bank = makeBank();
    const matched: BankMatch[] = [
      {
        entry: bank.skill[0], // React
        relevanceScore: 0.8,
        matchedKeywords: ["react"],
      },
    ];

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: matched,
        contact: { name: "Jane Doe" },
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "React developer",
      },
      null
    );

    // React should appear first in skills since it was matched
    expect(result.skills[0]).toBe("React");
  });

  it("should use default summary when none provided", async () => {
    const bank = makeBank();

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Acme",
        jobDescription: "Some job",
      },
      null
    );

    expect(result.summary).toContain("Engineer");
    expect(result.summary).toContain("Acme");
  });

  it("should map education from bank entries", async () => {
    const bank = makeBank();

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Test",
        jobDescription: "Some job",
      },
      null
    );

    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe("MIT");
    expect(result.education[0].degree).toBe("BS");
    expect(result.education[0].field).toBe("Computer Science");
  });

  it("should limit skills to 15", async () => {
    const bank = makeBank();
    // Add many skills
    for (let i = 0; i < 20; i++) {
      bank.skill.push(
        makeBankEntry({
          id: `skill-${i}`,
          content: { name: `Skill${i}` },
        })
      );
    }

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Test",
        jobDescription: "Some job",
      },
      null
    );

    expect(result.skills.length).toBeLessThanOrEqual(15);
  });
});
