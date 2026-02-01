import { describe, it, expect } from "vitest";
import { compareResumes, createVersionTimeline } from "./compare";
import type { TailoredResume } from "./generator";

const createResume = (overrides: Partial<TailoredResume> = {}): TailoredResume => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
  },
  summary: "Experienced developer",
  skills: ["JavaScript", "React", "Node.js"],
  experiences: [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      dates: "2020 - 2024",
      highlights: ["Built web applications", "Led team of 3"],
    },
  ],
  education: [
    {
      degree: "B.S.",
      field: "Computer Science",
      institution: "State University",
      date: "2020",
    },
  ],
  ...overrides,
});

describe("compareResumes", () => {
  it("returns correct structure", () => {
    const before = createResume();
    const after = createResume();

    const result = compareResumes(before, after);

    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("diffs");
    expect(result.summary).toHaveProperty("totalChanges");
    expect(result.summary).toHaveProperty("additions");
    expect(result.summary).toHaveProperty("removals");
    expect(result.summary).toHaveProperty("modifications");
  });

  it("detects no changes for identical resumes", () => {
    const resume = createResume();

    const result = compareResumes(resume, resume);

    expect(result.summary.totalChanges).toBe(0);
    expect(result.diffs.length).toBe(0);
  });

  it("detects summary changes", () => {
    const before = createResume({ summary: "Old summary" });
    const after = createResume({ summary: "New summary" });

    const result = compareResumes(before, after);

    const summaryDiff = result.diffs.find((d) => d.path === "summary");
    expect(summaryDiff).toBeDefined();
    expect(summaryDiff?.type).toBe("changed");
    expect(summaryDiff?.oldValue).toBe("Old summary");
    expect(summaryDiff?.newValue).toBe("New summary");
  });

  it("detects added skills", () => {
    const before = createResume({ skills: ["JavaScript"] });
    const after = createResume({ skills: ["JavaScript", "TypeScript"] });

    const result = compareResumes(before, after);

    const addedSkill = result.diffs.find(
      (d) => d.type === "added" && d.path.includes("skills")
    );
    expect(addedSkill).toBeDefined();
    expect(addedSkill?.newValue).toBe("TypeScript");
  });

  it("detects removed skills", () => {
    const before = createResume({ skills: ["JavaScript", "React"] });
    const after = createResume({ skills: ["JavaScript"] });

    const result = compareResumes(before, after);

    const removedSkill = result.diffs.find(
      (d) => d.type === "removed" && d.path.includes("skills")
    );
    expect(removedSkill).toBeDefined();
    expect(removedSkill?.oldValue).toBe("React");
  });

  it("detects added experience", () => {
    const before = createResume({ experiences: [] });
    const after = createResume();

    const result = compareResumes(before, after);

    const addedExp = result.diffs.find(
      (d) => d.type === "added" && d.path.includes("experiences")
    );
    expect(addedExp).toBeDefined();
  });

  it("detects removed experience", () => {
    const before = createResume();
    const after = createResume({ experiences: [] });

    const result = compareResumes(before, after);

    const removedExp = result.diffs.find(
      (d) => d.type === "removed" && d.path.includes("experiences")
    );
    expect(removedExp).toBeDefined();
  });

  it("detects changed experience highlights", () => {
    const before = createResume();
    const after = createResume({
      experiences: [
        {
          title: "Software Engineer",
          company: "Tech Corp",
          dates: "2020 - 2024",
          highlights: ["Built web applications", "New achievement"],
        },
      ],
    });

    const result = compareResumes(before, after);

    const addedHighlight = result.diffs.find(
      (d) => d.type === "added" && d.path.includes("highlights")
    );
    const removedHighlight = result.diffs.find(
      (d) => d.type === "removed" && d.path.includes("highlights")
    );

    expect(addedHighlight || removedHighlight).toBeDefined();
  });

  it("detects education changes", () => {
    const before = createResume();
    const after = createResume({
      education: [
        {
          degree: "M.S.",
          field: "Computer Science",
          institution: "State University",
          date: "2022",
        },
      ],
    });

    const result = compareResumes(before, after);

    const eduDiff = result.diffs.find((d) => d.path.includes("education"));
    expect(eduDiff).toBeDefined();
  });

  it("counts changes correctly", () => {
    const before = createResume({ skills: ["A", "B"], summary: "Old" });
    const after = createResume({ skills: ["A", "C"], summary: "New" });

    const result = compareResumes(before, after);

    expect(result.summary.additions).toBe(1); // C added
    expect(result.summary.removals).toBe(1); // B removed
    expect(result.summary.modifications).toBe(1); // summary changed
  });

  it("includes match score change when provided", () => {
    const before = createResume();
    const after = createResume();

    const result = compareResumes(before, after, 70, 85);

    expect(result.matchScoreChange).toBeDefined();
    expect(result.matchScoreChange?.before).toBe(70);
    expect(result.matchScoreChange?.after).toBe(85);
    expect(result.matchScoreChange?.change).toBe(15);
  });

  it("excludes match score change when not provided", () => {
    const before = createResume();
    const after = createResume();

    const result = compareResumes(before, after);

    expect(result.matchScoreChange).toBeUndefined();
  });

  it("handles empty arrays", () => {
    const before = createResume({ skills: [], experiences: [], education: [] });
    const after = createResume({ skills: [], experiences: [], education: [] });

    const result = compareResumes(before, after);

    expect(result.summary.totalChanges).toBe(0);
  });

  it("diff items have correct structure", () => {
    const before = createResume({ summary: "Old" });
    const after = createResume({ summary: "New" });

    const result = compareResumes(before, after);
    const diff = result.diffs[0];

    expect(diff).toHaveProperty("type");
    expect(diff).toHaveProperty("path");
    expect(diff).toHaveProperty("label");
    expect(["added", "removed", "changed", "unchanged"]).toContain(diff.type);
  });
});

describe("createVersionTimeline", () => {
  it("sorts versions by date descending", () => {
    const versions = [
      { id: "1", createdAt: "2024-01-01" },
      { id: "3", createdAt: "2024-03-01" },
      { id: "2", createdAt: "2024-02-01" },
    ];

    const result = createVersionTimeline(versions);

    expect(result[0].version.id).toBe("3"); // Most recent first
    expect(result[1].version.id).toBe("2");
    expect(result[2].version.id).toBe("1");
  });

  it("assigns correct indices", () => {
    const versions = [
      { id: "1", createdAt: "2024-01-01" },
      { id: "2", createdAt: "2024-02-01" },
    ];

    const result = createVersionTimeline(versions);

    expect(result[0].index).toBe(0);
    expect(result[1].index).toBe(1);
  });

  it("handles empty array", () => {
    const result = createVersionTimeline([]);
    expect(result).toEqual([]);
  });

  it("preserves version info", () => {
    const versions = [
      {
        id: "1",
        createdAt: "2024-01-01",
        matchScore: 85,
        jobTitle: "Engineer",
        jobCompany: "Corp",
      },
    ];

    const result = createVersionTimeline(versions);

    expect(result[0].version.matchScore).toBe(85);
    expect(result[0].version.jobTitle).toBe("Engineer");
    expect(result[0].version.jobCompany).toBe("Corp");
  });
});
