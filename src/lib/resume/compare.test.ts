import { describe, it, expect } from "vitest";
import {
  compareResumes,
  createVersionTimeline,
  calculateSectionScores,
  calculateResumeMetrics,
  calculateVersionStats,
  generateRecommendation,
} from "./compare";
import type { TailoredResume } from "./generator";
import type { ABTrackingEntry } from "./compare";

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

describe("calculateSectionScores", () => {
  it("returns scores for all four sections", () => {
    const resume = createResume();
    const result = calculateSectionScores(resume, resume);

    expect(result).toHaveLength(4);
    const sections = result.map((s) => s.section);
    expect(sections).toContain("summary");
    expect(sections).toContain("skills");
    expect(sections).toContain("experiences");
    expect(sections).toContain("education");
  });

  it("shows no change for identical resumes", () => {
    const resume = createResume();
    const result = calculateSectionScores(resume, resume);

    for (const score of result) {
      expect(score.change).toBe(0);
      expect(score.beforeScore).toBe(score.afterScore);
    }
  });

  it("detects improvement when skills are added", () => {
    const before = createResume({ skills: ["JS"] });
    const after = createResume({
      skills: ["JS", "TS", "React", "Node", "Python", "Go", "Rust", "Docker"],
    });

    const result = calculateSectionScores(before, after);
    const skillsScore = result.find((s) => s.section === "skills")!;

    expect(skillsScore.afterScore).toBeGreaterThan(skillsScore.beforeScore);
    expect(skillsScore.change).toBeGreaterThan(0);
  });

  it("scores empty sections as 0", () => {
    const empty = createResume({ skills: [], experiences: [], education: [], summary: "" });
    const result = calculateSectionScores(empty, empty);

    for (const score of result) {
      expect(score.beforeScore).toBe(0);
    }
  });

  it("scores complete education higher than incomplete", () => {
    const complete = createResume();
    const incomplete = createResume({
      education: [{ degree: "B.S.", field: "", institution: "", date: "" }],
    });

    const result = calculateSectionScores(incomplete, complete);
    const eduScore = result.find((s) => s.section === "education")!;

    expect(eduScore.afterScore).toBeGreaterThan(eduScore.beforeScore);
  });
});

describe("calculateResumeMetrics", () => {
  it("returns character count, word count, and page estimate", () => {
    const resume = createResume();
    const metrics = calculateResumeMetrics(resume);

    expect(metrics.characterCount).toBeGreaterThan(0);
    expect(metrics.wordCount).toBeGreaterThan(0);
    expect(metrics.estimatedPages).toBeGreaterThanOrEqual(1);
  });

  it("estimates at least 1 page for any resume", () => {
    const minimal = createResume({ summary: "Hi", skills: [], experiences: [], education: [] });
    const metrics = calculateResumeMetrics(minimal);

    expect(metrics.estimatedPages).toBe(1);
  });

  it("longer resume has higher character count", () => {
    const short = createResume({ summary: "Short" });
    const long = createResume({
      summary: "A very detailed and comprehensive professional summary that goes on and on with many details about career achievements",
    });

    const shortMetrics = calculateResumeMetrics(short);
    const longMetrics = calculateResumeMetrics(long);

    expect(longMetrics.characterCount).toBeGreaterThan(shortMetrics.characterCount);
  });
});

describe("calculateVersionStats", () => {
  const createEntry = (overrides: Partial<ABTrackingEntry> = {}): ABTrackingEntry => ({
    id: "entry-1",
    resumeId: "resume-a",
    jobId: "job-1",
    outcome: "applied",
    sentAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
  });

  it("calculates stats for a single resume version", () => {
    const entries: ABTrackingEntry[] = [
      createEntry({ id: "1", outcome: "applied" }),
      createEntry({ id: "2", outcome: "interviewing" }),
      createEntry({ id: "3", outcome: "offered" }),
    ];

    const stats = calculateVersionStats("resume-a", entries);

    expect(stats.resumeId).toBe("resume-a");
    expect(stats.totalSent).toBe(3);
    expect(stats.outcomes.applied).toBe(1);
    expect(stats.outcomes.interviewing).toBe(1);
    expect(stats.outcomes.offered).toBe(1);
  });

  it("calculates interview rate correctly", () => {
    const entries: ABTrackingEntry[] = [
      createEntry({ id: "1", outcome: "applied" }),
      createEntry({ id: "2", outcome: "interviewing" }),
      createEntry({ id: "3", outcome: "rejected" }),
      createEntry({ id: "4", outcome: "offered" }),
    ];

    const stats = calculateVersionStats("resume-a", entries);

    // interviewRate = (interviewing + offered) / total * 100 = (1+1)/4 * 100 = 50
    expect(stats.interviewRate).toBe(50);
    // offerRate = offered / total * 100 = 1/4 * 100 = 25
    expect(stats.offerRate).toBe(25);
  });

  it("returns zero rates for no entries", () => {
    const stats = calculateVersionStats("resume-x", []);

    expect(stats.totalSent).toBe(0);
    expect(stats.interviewRate).toBe(0);
    expect(stats.offerRate).toBe(0);
  });

  it("only counts entries for the specified resume", () => {
    const entries: ABTrackingEntry[] = [
      createEntry({ id: "1", resumeId: "resume-a", outcome: "offered" }),
      createEntry({ id: "2", resumeId: "resume-b", outcome: "rejected" }),
    ];

    const statsA = calculateVersionStats("resume-a", entries);
    const statsB = calculateVersionStats("resume-b", entries);

    expect(statsA.totalSent).toBe(1);
    expect(statsA.offerRate).toBe(100);
    expect(statsB.totalSent).toBe(1);
    expect(statsB.offerRate).toBe(0);
  });
});

describe("generateRecommendation", () => {
  const createEntry = (overrides: Partial<ABTrackingEntry> = {}): ABTrackingEntry => ({
    id: "entry-1",
    resumeId: "resume-a",
    jobId: "job-1",
    outcome: "applied",
    sentAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
  });

  it("returns null when fewer than 2 resume IDs", () => {
    const result = generateRecommendation([], ["resume-a"]);
    expect(result).toBeNull();
  });

  it("returns null when fewer than 2 versions have data", () => {
    const entries = [createEntry({ resumeId: "resume-a" })];
    const result = generateRecommendation(entries, ["resume-a", "resume-b"]);
    expect(result).toBeNull();
  });

  it("recommends the version with higher interview rate", () => {
    const entries: ABTrackingEntry[] = [
      // resume-a: 1 interview out of 2 = 50%
      createEntry({ id: "1", resumeId: "resume-a", outcome: "interviewing" }),
      createEntry({ id: "2", resumeId: "resume-a", outcome: "rejected" }),
      // resume-b: 0 interviews out of 2 = 0%
      createEntry({ id: "3", resumeId: "resume-b", outcome: "rejected" }),
      createEntry({ id: "4", resumeId: "resume-b", outcome: "applied" }),
    ];

    const result = generateRecommendation(entries, ["resume-a", "resume-b"]);

    expect(result).not.toBeNull();
    expect(result!.recommendedResumeId).toBe("resume-a");
  });

  it("sets confidence based on total data points", () => {
    // Low confidence: < 3 entries
    const fewEntries: ABTrackingEntry[] = [
      createEntry({ id: "1", resumeId: "resume-a", outcome: "interviewing" }),
      createEntry({ id: "2", resumeId: "resume-b", outcome: "rejected" }),
    ];

    const lowResult = generateRecommendation(fewEntries, ["resume-a", "resume-b"]);
    expect(lowResult!.confidence).toBe("low");

    // Medium confidence: >= 3 entries
    const moreEntries: ABTrackingEntry[] = [
      createEntry({ id: "1", resumeId: "resume-a", outcome: "interviewing" }),
      createEntry({ id: "2", resumeId: "resume-a", outcome: "offered" }),
      createEntry({ id: "3", resumeId: "resume-b", outcome: "rejected" }),
    ];

    const medResult = generateRecommendation(moreEntries, ["resume-a", "resume-b"]);
    expect(medResult!.confidence).toBe("medium");
  });

  it("includes stats for all versions in the result", () => {
    const entries: ABTrackingEntry[] = [
      createEntry({ id: "1", resumeId: "resume-a", outcome: "offered" }),
      createEntry({ id: "2", resumeId: "resume-b", outcome: "rejected" }),
    ];

    const result = generateRecommendation(entries, ["resume-a", "resume-b"]);
    expect(result!.stats).toHaveLength(2);
  });
});
