import { describe, it, expect } from "vitest";
import type { BankEntry } from "@/types";
import type { SectionState } from "@/lib/builder/section-manager";
import { assembleManualTailor, selectAndOrderEntries } from "./manual-tailor";

function makeEntry(overrides: Partial<BankEntry>): BankEntry {
  return {
    id: "entry-1",
    userId: "default",
    category: "skill",
    content: { name: "React" },
    confidenceScore: 1,
    createdAt: "2024-01-01",
    ...overrides,
  };
}

const sampleExperience = (id: string, company: string): BankEntry =>
  makeEntry({
    id,
    category: "experience",
    content: {
      company,
      title: "Engineer",
      startDate: "2020",
      endDate: "2024",
      highlights: [`Worked at ${company}`],
    },
  });

const sampleSkill = (id: string, name: string): BankEntry =>
  makeEntry({ id, category: "skill", content: { name } });

const sampleEducation = (id: string, institution: string): BankEntry =>
  makeEntry({
    id,
    category: "education",
    content: {
      institution,
      degree: "BS",
      field: "Computer Science",
      endDate: "2018",
    },
  });

const allSectionsVisible: SectionState[] = [
  { id: "experience", visible: true },
  { id: "education", visible: true },
  { id: "skill", visible: true },
  { id: "project", visible: true },
  { id: "hackathon", visible: true },
  { id: "bullet", visible: true },
  { id: "achievement", visible: true },
  { id: "certification", visible: true },
];

describe("selectAndOrderEntries", () => {
  it("returns empty when nothing is selected", () => {
    const entries = [sampleExperience("e1", "Acme")];
    const result = selectAndOrderEntries(
      entries,
      new Set(),
      allSectionsVisible,
    );
    expect(result).toEqual([]);
  });

  it("orders selected entries by section order, not entry-array order", () => {
    const entries = [
      sampleSkill("s1", "TypeScript"),
      sampleExperience("e1", "Acme"),
      sampleEducation("d1", "MIT"),
    ];
    // Order: experience → education → skill (default-ish, but reordered)
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "education", visible: true },
      { id: "skill", visible: true },
    ];

    const result = selectAndOrderEntries(
      entries,
      new Set(["s1", "e1", "d1"]),
      sections,
    );

    expect(result.map((e) => e.id)).toEqual(["e1", "d1", "s1"]);
  });

  it("excludes entries whose section is hidden", () => {
    const entries = [
      sampleSkill("s1", "TypeScript"),
      sampleExperience("e1", "Acme"),
    ];
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "skill", visible: false },
    ];

    const result = selectAndOrderEntries(
      entries,
      new Set(["s1", "e1"]),
      sections,
    );

    expect(result.map((e) => e.id)).toEqual(["e1"]);
  });

  it("excludes selected entries whose category is not in the section list at all", () => {
    const entries = [sampleEducation("d1", "MIT")];
    const sections: SectionState[] = [{ id: "experience", visible: true }];
    const result = selectAndOrderEntries(entries, new Set(["d1"]), sections);
    expect(result).toEqual([]);
  });
});

describe("assembleManualTailor — resume mode", () => {
  it("returns an empty-shaped resume when nothing is selected", () => {
    const entries = [sampleExperience("e1", "Acme"), sampleSkill("s1", "Go")];
    const { resume, orderedEntries } = assembleManualTailor({
      entries,
      selectedIds: new Set(),
      sections: allSectionsVisible,
      documentMode: "resume",
    });
    expect(orderedEntries).toEqual([]);
    expect(resume.experiences).toEqual([]);
    expect(resume.skills).toEqual([]);
    expect(resume.education).toEqual([]);
    expect(resume.summary).toBe("");
    expect(resume.contact.name).toBe("Your Name");
  });

  it("assembles a mixed-category selection", () => {
    const entries = [
      sampleExperience("e1", "Acme"),
      sampleExperience("e2", "Globex"),
      sampleSkill("s1", "TypeScript"),
      sampleSkill("s2", "Go"),
      sampleEducation("d1", "MIT"),
    ];

    const { resume, orderedEntries } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "e2", "s1", "d1"]),
      sections: allSectionsVisible,
      documentMode: "resume",
    });

    expect(orderedEntries.map((e) => e.id)).toEqual(["e1", "e2", "d1", "s1"]);
    expect(resume.experiences.map((x) => x.company)).toEqual([
      "Acme",
      "Globex",
    ]);
    expect(resume.skills).toContain("TypeScript");
    expect(resume.skills).not.toContain("Go"); // not selected
    expect(resume.education.map((x) => x.institution)).toEqual(["MIT"]);
  });

  it("honors hidden sections — entries in hidden sections are dropped", () => {
    const entries = [
      sampleExperience("e1", "Acme"),
      sampleSkill("s1", "TypeScript"),
    ];
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "skill", visible: false },
      { id: "education", visible: true },
    ];

    const { resume } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "s1"]),
      sections,
      documentMode: "resume",
    });

    expect(resume.experiences).toHaveLength(1);
    expect(resume.skills).toEqual([]);
  });

  it("respects section reorder — skill before experience produces a skill-first ordering", () => {
    // The TailoredResume shape buckets entries into typed arrays so the
    // important assertion is that the *bucketing* is correct and the
    // ordered-entry list reflects the section order. The template renderer
    // then walks sections in order when emitting HTML.
    const entries = [
      sampleExperience("e1", "Acme"),
      sampleSkill("s1", "TypeScript"),
    ];
    const sections: SectionState[] = [
      { id: "skill", visible: true },
      { id: "experience", visible: true },
    ];

    const { orderedEntries } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "s1"]),
      sections,
      documentMode: "resume",
    });

    expect(orderedEntries.map((e) => e.id)).toEqual(["s1", "e1"]);
  });

  it("uses provided contact + summary overrides", () => {
    const entries = [sampleExperience("e1", "Acme")];
    const { resume } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1"]),
      sections: allSectionsVisible,
      documentMode: "resume",
      contact: {
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
      summary: "Custom summary",
    });
    expect(resume.contact.name).toBe("Ada Lovelace");
    expect(resume.summary).toBe("Custom summary");
  });

  it("applies strict ATS formatting when settings request it", () => {
    const entries = [
      makeEntry({
        id: "e1",
        category: "experience",
        content: {
          company: "Acme",
          title: "Engineer",
          startDate: "2020",
          endDate: "2024",
          highlights: ["• Built dashboards — improved matching"],
        },
      }),
      sampleSkill("s1", "React → UI"),
    ];

    const { resume } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "s1"]),
      sections: allSectionsVisible,
      documentMode: "resume",
      settings: {
        bulletsPerRole: { min: 1, max: 4 },
        bulletsPerProject: { min: 0, max: 0 },
        maxRoles: 5,
        maxProjects: 0,
        atsStrictness: "strict",
        dropBulletsShorterThan: 0,
      },
    });

    expect(resume.experiences[0].highlights).toEqual([
      "Built dashboards - improved matching",
    ]);
    expect(resume.skills).toContain("React UI");
  });
});

describe("assembleManualTailor — cover_letter mode", () => {
  it("returns an empty body when nothing is selected", () => {
    const { resume, orderedEntries } = assembleManualTailor({
      entries: [],
      selectedIds: new Set(),
      sections: allSectionsVisible,
      documentMode: "cover_letter",
    });
    expect(orderedEntries).toEqual([]);
    expect(resume.summary).toBe("");
    expect(resume.experiences).toEqual([]);
    expect(resume.skills).toEqual([]);
    expect(resume.education).toEqual([]);
  });

  it("produces a non-empty letter body from selected entries", () => {
    const entries = [
      sampleExperience("e1", "Acme"),
      sampleSkill("s1", "TypeScript"),
    ];
    const { resume } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "s1"]),
      sections: allSectionsVisible,
      documentMode: "cover_letter",
    });
    expect(resume.summary.length).toBeGreaterThan(0);
    expect(resume.summary).toContain("Dear Hiring Team,");
    // Experiences/skills are not duplicated into the structured resume fields
    // when in cover-letter mode — body lives in `summary`.
    expect(resume.experiences).toEqual([]);
    expect(resume.skills).toEqual([]);
  });

  it("excludes entries from hidden sections in cover-letter mode", () => {
    const entries = [
      sampleExperience("e1", "Acme"),
      sampleSkill("s1", "TypeScript"),
    ];
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "skill", visible: false },
    ];

    const { orderedEntries } = assembleManualTailor({
      entries,
      selectedIds: new Set(["e1", "s1"]),
      sections,
      documentMode: "cover_letter",
    });

    expect(orderedEntries.map((e) => e.id)).toEqual(["e1"]);
  });
});
