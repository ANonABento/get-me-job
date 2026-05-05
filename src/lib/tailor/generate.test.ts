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
        userId: "default",
      },
      null
    );

    expect(result.resume.contact.name).toBe("Jane Doe");
    expect(result.resume.summary).toBe("Experienced developer");
    expect(result.resume.experiences.length).toBeGreaterThan(0);
    expect(result.resume.skills.length).toBeGreaterThan(0);
    expect(result.resume.education.length).toBeGreaterThan(0);
    expect(result.promptVariantId).toBeNull();
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
        userId: "default",
      },
      null
    );

    // The first experience (Acme Corp) was matched, should appear first
    expect(result.resume.experiences[0].company).toBe("Acme Corp");
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
        userId: "default",
      },
      null
    );

    // Should still have experiences pulled from bank
    expect(result.resume.experiences.length).toBeGreaterThan(0);
  });

  it("should use hackathons as resume experiences in the non-LLM fallback", async () => {
    const bank = makeBank();
    bank.experience = [];
    bank.hackathon = [
      makeBankEntry({
        id: "h1",
        category: "hackathon",
        content: {
          name: "AI Build Weekend",
          organizer: "Devpost",
          startDate: "2026-05-10",
          endDate: "2026-05-12",
          prizes: ["Best AI App"],
          tracks: ["AI/ML"],
          themes: ["Accessibility"],
          notes: "Submitted a working demo",
        },
      }),
    ];

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "React developer needed",
        userId: "default",
      },
      null
    );

    expect(result.resume.experiences[0]).toEqual({
      company: "Devpost",
      title: "AI Build Weekend",
      dates: "2026-05-10 - 2026-05-12",
      highlights: [
        "Prizes: Best AI App",
        "Tracks: AI/ML",
        "Themes: Accessibility",
        "Submitted a working demo",
      ],
    });
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
        userId: "default",
      },
      null
    );

    // React should appear first in skills since it was matched
    expect(result.resume.skills[0]).toBe("React");
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
        userId: "default",
      },
      null
    );

    expect(result.resume.summary).toContain("Engineer");
    expect(result.resume.summary).toContain("Acme");
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
        userId: "default",
      },
      null
    );

    expect(result.resume.education).toHaveLength(1);
    expect(result.resume.education[0].institution).toBe("MIT");
    expect(result.resume.education[0].degree).toBe("BS");
    expect(result.resume.education[0].field).toBe("Computer Science");
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
        userId: "default",
      },
      null
    );

    expect(result.resume.skills.length).toBeLessThanOrEqual(15);
  });
});
