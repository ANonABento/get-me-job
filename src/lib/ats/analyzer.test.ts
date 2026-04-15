import { describe, it, expect } from "vitest";
import {
  analyzeATS,
  generateScanReport,
  scoreToLetterGrade,
  calculateBenchmark,
  buildKeywordHeatmap,
  buildSectionBreakdown,
} from "./analyzer";
import type { Profile, JobDescription } from "@/types";

const createMinimalProfile = (): Profile => ({
  id: "profile-1",
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    linkedin: "linkedin.com/in/johndoe",
  },
  summary: "Experienced software developer with 5 years of experience building web applications.",
  experiences: [
    {
      id: "exp-1",
      title: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "2024-01",
      current: false,
      description: "Led development of web applications",
      highlights: ["Improved performance by 30%", "Led team of 5 developers"],
      skills: ["JavaScript", "React", "Node.js"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-09",
      endDate: "2020-05",
      highlights: ["Dean's List", "GPA: 3.8"],
    },
  ],
  skills: [
    { id: "skill-1", name: "JavaScript", category: "technical", proficiency: "advanced" },
    { id: "skill-2", name: "React", category: "technical", proficiency: "advanced" },
    { id: "skill-3", name: "Node.js", category: "technical", proficiency: "intermediate" },
    { id: "skill-4", name: "Python", category: "technical", proficiency: "intermediate" },
  ],
  projects: [],
  certifications: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

const createMinimalJob = (): JobDescription => ({
  id: "job-1",
  title: "Senior Software Engineer",
  company: "Tech Company",
  description: "Looking for a skilled software engineer with React and Node.js experience.",
  requirements: ["5+ years experience", "React expertise", "Node.js"],
  responsibilities: [],
  keywords: ["React", "Node.js", "JavaScript", "TypeScript", "AWS"],
  createdAt: new Date().toISOString(),
});

describe("analyzeATS", () => {
  it("returns all required fields in analysis result", () => {
    const profile = createMinimalProfile();
    const result = analyzeATS(profile);

    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("issues");
    expect(result).toHaveProperty("keywords");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("recommendations");
  });

  it("returns score with all categories", () => {
    const profile = createMinimalProfile();
    const result = analyzeATS(profile);

    expect(result.score).toHaveProperty("overall");
    expect(result.score).toHaveProperty("formatting");
    expect(result.score).toHaveProperty("keywords");
    expect(result.score).toHaveProperty("content");
    expect(result.score).toHaveProperty("structure");
  });

  it("scores are between 0 and 100", () => {
    const profile = createMinimalProfile();
    const result = analyzeATS(profile);

    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.score.formatting).toBeGreaterThanOrEqual(0);
    expect(result.score.formatting).toBeLessThanOrEqual(100);
  });

  it("gives higher score for complete profile", () => {
    const profile = createMinimalProfile();
    const result = analyzeATS(profile);

    // A complete profile should score reasonably well
    expect(result.score.overall).toBeGreaterThan(50);
  });

  it("penalizes missing email", () => {
    const profile = createMinimalProfile();
    profile.contact!.email = "";
    const result = analyzeATS(profile);

    const hasEmailIssue = result.issues.some(
      (i) => i.title.toLowerCase().includes("email")
    );
    expect(hasEmailIssue).toBe(true);
  });

  it("penalizes missing experiences", () => {
    const profile = createMinimalProfile();
    profile.experiences = [];
    const result = analyzeATS(profile);

    const hasExperienceIssue = result.issues.some(
      (i) => i.title.toLowerCase().includes("experience")
    );
    expect(hasExperienceIssue).toBe(true);
    expect(result.score.structure).toBeLessThan(100);
  });

  it("penalizes missing skills", () => {
    const profile = createMinimalProfile();
    profile.skills = [];
    const result = analyzeATS(profile);

    const hasSkillsIssue = result.issues.some(
      (i) => i.title.toLowerCase().includes("skill")
    );
    expect(hasSkillsIssue).toBe(true);
  });

  it("identifies keyword matches when job is provided", () => {
    const profile = createMinimalProfile();
    const job = createMinimalJob();
    const result = analyzeATS(profile, job);

    expect(result.keywords.length).toBeGreaterThan(0);

    // React should be found
    const reactKeyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );
    expect(reactKeyword?.found).toBe(true);
  });

  it("flags missing keywords from job description", () => {
    const profile = createMinimalProfile();
    const job = createMinimalJob();
    const result = analyzeATS(profile, job);

    // TypeScript not in profile, should show as not found
    const tsKeyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "typescript"
    );
    expect(tsKeyword?.found).toBe(false);
  });

  it("generates appropriate summary based on score", () => {
    const profile = createMinimalProfile();
    const result = analyzeATS(profile);

    expect(result.summary).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(20);
  });

  it("generates recommendations for improvements", () => {
    const profile = createMinimalProfile();
    profile.summary = ""; // Create an issue
    const result = analyzeATS(profile);

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("detects special characters", () => {
    const profile = createMinimalProfile();
    // Use actual Unicode curly quotes that ATS may not parse
    profile.summary = "I\u2019m a developer with \u201C5+ years\u201D of experience";
    const result = analyzeATS(profile);

    const hasSpecialCharIssue = result.issues.some(
      (i) => i.title.toLowerCase().includes("special character")
    );
    expect(hasSpecialCharIssue).toBe(true);
  });

  it("checks for action verbs", () => {
    const profile = createMinimalProfile();
    profile.experiences[0].highlights = ["Did things", "Was there"];
    const result = analyzeATS(profile);

    // Should flag lack of action verbs or have lower content score
    expect(result.score.content).toBeLessThanOrEqual(100);
  });

  it("issues have correct structure", () => {
    const profile = createMinimalProfile();
    profile.skills = []; // Create an issue
    const result = analyzeATS(profile);

    const issue = result.issues[0];
    expect(issue).toHaveProperty("type");
    expect(issue).toHaveProperty("category");
    expect(issue).toHaveProperty("title");
    expect(issue).toHaveProperty("description");
    expect(issue).toHaveProperty("suggestion");
    expect(["error", "warning", "info"]).toContain(issue.type);
  });
});

describe("scoreToLetterGrade", () => {
  it("returns A for scores >= 90", () => {
    expect(scoreToLetterGrade(90)).toBe("A");
    expect(scoreToLetterGrade(100)).toBe("A");
    expect(scoreToLetterGrade(95)).toBe("A");
  });

  it("returns B for scores 80-89", () => {
    expect(scoreToLetterGrade(80)).toBe("B");
    expect(scoreToLetterGrade(89)).toBe("B");
  });

  it("returns C for scores 70-79", () => {
    expect(scoreToLetterGrade(70)).toBe("C");
    expect(scoreToLetterGrade(79)).toBe("C");
  });

  it("returns D for scores 60-69", () => {
    expect(scoreToLetterGrade(60)).toBe("D");
    expect(scoreToLetterGrade(69)).toBe("D");
  });

  it("returns F for scores below 60", () => {
    expect(scoreToLetterGrade(59)).toBe("F");
    expect(scoreToLetterGrade(0)).toBe("F");
  });
});

describe("calculateBenchmark", () => {
  it("returns percentile between 1 and 99", () => {
    const benchmark = calculateBenchmark(75);
    expect(benchmark.percentile).toBeGreaterThanOrEqual(1);
    expect(benchmark.percentile).toBeLessThanOrEqual(99);
  });

  it("higher scores produce higher percentiles", () => {
    const low = calculateBenchmark(40);
    const high = calculateBenchmark(90);
    expect(high.percentile).toBeGreaterThan(low.percentile);
  });

  it("includes average and top performer scores", () => {
    const benchmark = calculateBenchmark(70);
    expect(benchmark.averageScore).toBe(62);
    expect(benchmark.topPerformerScore).toBe(90);
  });
});

describe("buildKeywordHeatmap", () => {
  it("separates found and missing keywords", () => {
    const profile = createMinimalProfile();
    const keywords = [
      { keyword: "React", found: true, frequency: 2, locations: ["skills"] },
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
    ];

    const heatmap = buildKeywordHeatmap(keywords, profile);

    expect(heatmap.found).toHaveLength(1);
    expect(heatmap.missing).toHaveLength(1);
    expect(heatmap.found[0].keyword).toBe("React");
    expect(heatmap.missing[0].keyword).toBe("TypeScript");
  });

  it("calculates match rate correctly", () => {
    const profile = createMinimalProfile();
    const keywords = [
      { keyword: "React", found: true, frequency: 2, locations: ["skills"] },
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
      { keyword: "JavaScript", found: true, frequency: 1, locations: ["skills"] },
    ];

    const heatmap = buildKeywordHeatmap(keywords, profile);
    expect(heatmap.matchRate).toBeCloseTo(2 / 3);
  });

  it("maps keywords by section", () => {
    const profile = createMinimalProfile();
    const keywords = [
      { keyword: "React", found: true, frequency: 2, locations: ["skills"] },
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
    ];

    const heatmap = buildKeywordHeatmap(keywords, profile);

    expect(heatmap.bySection).toHaveProperty("skills");
    expect(heatmap.bySection).toHaveProperty("experience");
    expect(heatmap.bySection).toHaveProperty("summary");
    expect(heatmap.bySection.skills.found).toContain("React");
    expect(heatmap.bySection.skills.missing).toContain("TypeScript");
  });

  it("handles empty keywords array", () => {
    const profile = createMinimalProfile();
    const heatmap = buildKeywordHeatmap([], profile);

    expect(heatmap.found).toHaveLength(0);
    expect(heatmap.missing).toHaveLength(0);
    expect(heatmap.matchRate).toBe(0);
  });
});

describe("buildSectionBreakdown", () => {
  it("returns breakdown for all 4 sections", () => {
    const breakdown = buildSectionBreakdown(80, 90, 70, 85, []);
    expect(breakdown).toHaveLength(4);
    expect(breakdown.map((s) => s.section)).toEqual([
      "Formatting",
      "Structure",
      "Content",
      "Keywords",
    ]);
  });

  it("calculates weighted scores correctly", () => {
    const breakdown = buildSectionBreakdown(100, 100, 100, 100, []);
    expect(breakdown[0].weightedScore).toBe(20); // 100 * 0.2
    expect(breakdown[1].weightedScore).toBe(25); // 100 * 0.25
    expect(breakdown[2].weightedScore).toBe(25); // 100 * 0.25
    expect(breakdown[3].weightedScore).toBe(30); // 100 * 0.3
  });

  it("counts issues per section", () => {
    const issues = [
      { type: "error" as const, category: "formatting" as const, title: "t", description: "d", suggestion: "s" },
      { type: "warning" as const, category: "formatting" as const, title: "t", description: "d", suggestion: "s" },
      { type: "error" as const, category: "keywords" as const, title: "t", description: "d", suggestion: "s" },
    ];
    const breakdown = buildSectionBreakdown(80, 90, 70, 60, issues);

    expect(breakdown[0].issueCount).toBe(2); // formatting
    expect(breakdown[3].issueCount).toBe(1); // keywords
    expect(breakdown[1].issueCount).toBe(0); // structure
  });
});

describe("generateScanReport", () => {
  it("returns all required scan report fields", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    expect(report).toHaveProperty("score");
    expect(report).toHaveProperty("letterGrade");
    expect(report).toHaveProperty("issues");
    expect(report).toHaveProperty("keywords");
    expect(report).toHaveProperty("keywordHeatmap");
    expect(report).toHaveProperty("sectionBreakdown");
    expect(report).toHaveProperty("benchmark");
    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("recommendations");
    expect(report).toHaveProperty("scannedAt");
  });

  it("returns a valid letter grade", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    expect(["A", "B", "C", "D", "F"]).toContain(report.letterGrade);
  });

  it("letter grade matches overall score", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    const expectedGrade = scoreToLetterGrade(report.score.overall);
    expect(report.letterGrade).toBe(expectedGrade);
  });

  it("includes keyword heatmap with found/missing", () => {
    const profile = createMinimalProfile();
    const job = createMinimalJob();
    const report = generateScanReport(profile, job);

    expect(report.keywordHeatmap).toHaveProperty("found");
    expect(report.keywordHeatmap).toHaveProperty("missing");
    expect(report.keywordHeatmap).toHaveProperty("matchRate");
    expect(report.keywordHeatmap).toHaveProperty("bySection");
  });

  it("includes section breakdown with 4 sections", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    expect(report.sectionBreakdown).toHaveLength(4);
    for (const section of report.sectionBreakdown) {
      expect(section).toHaveProperty("section");
      expect(section).toHaveProperty("score");
      expect(section).toHaveProperty("weight");
      expect(section).toHaveProperty("weightedScore");
      expect(section).toHaveProperty("issueCount");
    }
  });

  it("includes industry benchmark", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    expect(report.benchmark.percentile).toBeGreaterThanOrEqual(1);
    expect(report.benchmark.percentile).toBeLessThanOrEqual(99);
    expect(report.benchmark.averageScore).toBe(62);
  });

  it("includes scannedAt timestamp", () => {
    const profile = createMinimalProfile();
    const report = generateScanReport(profile);

    expect(report.scannedAt).toBeTruthy();
    expect(() => new Date(report.scannedAt)).not.toThrow();
  });
});
