import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GroupedBankEntries, BankEntry } from "@/types";
import type { BankMatch } from "./analyze";

const { completeMock } = vi.hoisted(() => ({
  completeMock: vi.fn(),
}));

vi.mock("@/lib/llm/client", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/llm/client")>();
  return {
    ...actual,
    LLMClient: class MockLLMClient {
      complete = completeMock;
    },
  };
});

vi.mock("@/lib/db/prompt-variants", () => ({
  DEFAULT_PROMPT_CONTENT:
    "Use source-backed achievements only and preserve factual details.",
  getActivePromptVariant: vi.fn(() => ({
    id: "variant-1",
    name: "Variant",
    version: 1,
    content: "Prefer concise bullets.",
    active: true,
    createdAt: "2026-05-10",
    updatedAt: "2026-05-10",
  })),
}));

import { buildBankTailoredResumePrompt, generateFromBank } from "./generate";

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
    paragraph: [],
    bullet: [],
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
  beforeEach(() => {
    completeMock.mockReset();
  });

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
      null,
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
      null,
    );

    // The first experience (Acme Corp) was matched, should appear first
    expect(result.resume.experiences[0].company).toBe("Acme Corp");
  });

  it("honors per-user tailor settings — maxRoles, bulletsPerRole.max, dropBulletsShorterThan", async () => {
    const bank = makeBank();
    // Add a third experience so we can verify the cap. Also include short
    // + long bullets to verify the `dropBulletsShorterThan` filter.
    bank.experience.push(
      makeBankEntry({
        id: "e3",
        category: "experience",
        content: {
          company: "Gamma Co",
          title: "Engineer",
          startDate: "2017-01",
          endDate: "2017-12",
          highlights: [
            "Bad",
            "Wrote unit tests",
            "Built a comprehensive observability stack",
            "Reduced p95 latency by 40%",
            "Mentored five engineers across two teams",
          ],
          skills: [],
        },
      }),
    );

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Test Corp",
        jobDescription:
          "Looking for an experienced engineer with strong fundamentals.",
        userId: "default",
        settings: {
          bulletsPerRole: { min: 1, max: 2 },
          bulletsPerProject: { min: 0, max: 0 },
          maxRoles: 1,
          maxProjects: 0,
          atsStrictness: "balanced",
          dropBulletsShorterThan: 10,
        },
      },
      null,
    );

    // maxRoles=1 → only the first experience survives.
    expect(result.resume.experiences).toHaveLength(1);
    // bulletsPerRole.max=2 → at most 2 highlights per experience.
    expect(result.resume.experiences[0].highlights.length).toBeLessThanOrEqual(
      2,
    );
    // dropBulletsShorterThan=10 → "Bad" (3 chars) must NOT appear.
    expect(
      result.resume.experiences.flatMap((e) => e.highlights),
    ).not.toContain("Bad");
  });

  it("falls back to default settings when none provided", async () => {
    const bank = makeBank();
    bank.experience[0].content.highlights = [
      "A", // short — kept by default (no length filter)
      "Built a thing",
      "Did stuff",
      "Mentored juniors",
      "Hit p95 targets",
    ];

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Test Corp",
        jobDescription: "Looking for a senior engineer.",
        userId: "default",
      },
      null,
    );

    // Defaults: bulletsPerRole.max=4, dropBulletsShorterThan=0 (no filter).
    // 5 highlights → truncated to 4, "A" survives because filter is off.
    expect(result.resume.experiences[0].highlights).toHaveLength(4);
    expect(result.resume.experiences[0].highlights[0]).toBe("A");
  });

  it("applies strict ATS formatting to deterministic output", async () => {
    const bank = makeBank();
    bank.experience[0].content.highlights = [
      "Built React dashboards — improved onboarding",
      "• Led TypeScript migration",
    ];
    bank.skill[0].content.name = "React → UI";

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: [],
        contact: { name: "Jane Doe" },
        jobTitle: "Engineer",
        company: "Test Corp",
        jobDescription: "React and TypeScript engineer.",
        userId: "default",
        settings: {
          bulletsPerRole: { min: 1, max: 4 },
          bulletsPerProject: { min: 0, max: 0 },
          maxRoles: 1,
          maxProjects: 0,
          atsStrictness: "strict",
          dropBulletsShorterThan: 0,
        },
      },
      null,
    );

    expect(result.resume.experiences[0].highlights).toEqual([
      "Built React dashboards - improved onboarding",
      "Led TypeScript migration",
    ]);
    expect(result.resume.skills[0]).toBe("React UI");
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
      null,
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
      null,
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
      null,
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
      null,
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
      null,
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
        }),
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
      null,
    );

    expect(result.resume.skills.length).toBeLessThanOrEqual(15);
  });

  it("wraps prompt variants with non-overridable evidence rules", () => {
    const bank = makeBank();
    bank.skill.push(
      makeBankEntry({
        id: "graphql",
        content: { name: "GraphQL" },
      }),
    );

    const prompt = buildBankTailoredResumePrompt(
      {
        bankEntries: bank,
        matchedEntries: makeMatchedEntries(bank),
        contact: { name: "Jane Doe", email: "jane@example.com" },
        summary: "Built GraphQL dashboard workflows.",
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "Needs GraphQL, AWS, and Kubernetes.",
        userId: "default",
      },
      {
        id: "variant-1",
        name: "Unsafe Style",
        version: 1,
        content: "Add every missing cloud keyword.",
        active: true,
        createdAt: "2026-05-10",
        updatedAt: "2026-05-10",
      },
    );

    expect(prompt).toContain("NON-OVERRIDABLE SAFETY RULES");
    expect(prompt).toContain("Every added keyword");
    expect(prompt).toContain("omit unsupported keywords");
    expect(prompt).toContain("Preserve contact details and education exactly");
    expect(prompt.indexOf("NON-OVERRIDABLE SAFETY RULES")).toBeLessThan(
      prompt.indexOf("STYLE AND PRIORITIZATION GUIDANCE"),
    );
  });

  it("preserves contact and education while omitting unsupported LLM keywords", async () => {
    const bank = makeBank();
    bank.skill.push(
      makeBankEntry({
        id: "graphql",
        content: { name: "GraphQL" },
      }),
    );
    bank.experience[0].content = {
      ...bank.experience[0].content,
      highlights: ["Built React and GraphQL dashboards"],
      skills: ["React", "TypeScript", "GraphQL"],
    };
    completeMock.mockResolvedValueOnce(
      JSON.stringify({
        contact: { name: "Mutated" },
        summary: "React GraphQL engineer with AWS Kubernetes expertise.",
        experiences: [
          {
            company: "Acme Corp",
            title: "Senior Engineer",
            dates: "2020-01 - 2023-06",
            highlights: [
              "Built GraphQL dashboards",
              "Managed AWS Kubernetes infrastructure",
            ],
          },
        ],
        skills: ["React", "GraphQL", "AWS", "Kubernetes"],
        education: [
          {
            institution: "Wrong School",
            degree: "MBA",
            field: "Business",
            date: "2025",
          },
        ],
      }),
    );

    const result = await generateFromBank(
      {
        bankEntries: bank,
        matchedEntries: makeMatchedEntries(bank),
        contact: { name: "Jane Doe", email: "jane@example.com" },
        summary: "Built GraphQL dashboard workflows.",
        jobTitle: "Frontend Engineer",
        company: "Test Corp",
        jobDescription: "Needs React, GraphQL, AWS, and Kubernetes.",
        userId: "default",
      },
      { provider: "openai", apiKey: "test", model: "gpt-test" },
    );

    expect(result.resume.contact).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(result.resume.education).toEqual([
      {
        institution: "MIT",
        degree: "BS",
        field: "Computer Science",
        date: "2018",
      },
    ]);
    expect(result.resume.skills).toEqual(["React", "GraphQL"]);
    expect(result.resume.experiences[0].highlights).toEqual([
      "Built GraphQL dashboards",
    ]);
    expect(JSON.stringify(result.resume)).not.toMatch(/AWS|Kubernetes/);
  });
});
