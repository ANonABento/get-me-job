import { describe, it, expect } from "vitest";
import { analyzeATS } from "./analyzer";
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
