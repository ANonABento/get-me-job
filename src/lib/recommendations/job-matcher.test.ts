import { describe, it, expect } from "vitest";
import { generateRecommendations } from "./job-matcher";
import type { Profile, JobDescription } from "@/types";

const createProfile = (): Profile => ({
  id: "profile-1",
  contact: {
    name: "Jane Developer",
    email: "jane@example.com",
    phone: "555-0123",
    linkedin: "linkedin.com/in/jane",
  },
  summary: "Full stack developer with React and Node.js experience",
  experiences: [
    {
      id: "exp-1",
      title: "Senior Developer",
      company: "Tech Inc",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2024-01",
      current: false,
      description: "Full stack development",
      highlights: ["Built React applications", "Managed Node.js APIs"],
      skills: ["React", "Node.js", "TypeScript"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Tech University",
      degree: "BS",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
      highlights: [],
    },
  ],
  skills: [
    { id: "skill-1", name: "React", category: "technical", proficiency: "advanced" },
    { id: "skill-2", name: "Node.js", category: "technical", proficiency: "advanced" },
    { id: "skill-3", name: "TypeScript", category: "technical", proficiency: "intermediate" },
    { id: "skill-4", name: "JavaScript", category: "technical", proficiency: "advanced" },
    { id: "skill-5", name: "SQL", category: "technical", proficiency: "intermediate" },
  ],
  projects: [],
  certifications: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

const createJob = (overrides: Partial<JobDescription> = {}): JobDescription => ({
  id: "job-1",
  title: "Full Stack Developer",
  company: "Great Company",
  description: "Looking for a full stack developer",
  requirements: ["React experience", "Node.js"],
  responsibilities: [],
  keywords: ["React", "Node.js", "TypeScript", "JavaScript"],
  status: "saved",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("generateRecommendations", () => {
  it("returns correct structure", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    expect(result).toHaveProperty("recommendations");
    expect(result).toHaveProperty("topSkillGaps");
    expect(result).toHaveProperty("growthAreas");
    expect(result).toHaveProperty("insights");
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it("returns recommendations sorted by score", () => {
    const profile = createProfile();
    const jobs = [
      createJob({ id: "1", keywords: ["React", "Node.js"] }),
      createJob({ id: "2", keywords: ["Python", "Django", "Machine Learning"] }),
    ];
    const result = generateRecommendations(profile, jobs);

    // First job should score higher (matching skills)
    if (result.recommendations.length >= 2) {
      expect(result.recommendations[0].score).toBeGreaterThanOrEqual(
        result.recommendations[1].score
      );
    }
  });

  it("calculates score between 0 and 100", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    result.recommendations.forEach((rec) => {
      expect(rec.score).toBeGreaterThanOrEqual(0);
      expect(rec.score).toBeLessThanOrEqual(100);
    });
  });

  it("identifies matched skills", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    const rec = result.recommendations[0];
    expect(rec.skillMatches).toBeDefined();

    const reactMatch = rec.skillMatches.find(
      (m) => m.skill.toLowerCase() === "react"
    );
    expect(reactMatch?.matched).toBe(true);
  });

  it("identifies skill gaps", () => {
    const profile = createProfile();
    const jobs = [
      createJob({ keywords: ["React", "GraphQL", "Kubernetes", "Go"] }),
    ];
    const result = generateRecommendations(profile, jobs);

    const rec = result.recommendations[0];
    // GraphQL, Kubernetes, Go are not in profile
    expect(rec.skillGaps.length).toBeGreaterThan(0);
  });

  it("respects limit parameter", () => {
    const profile = createProfile();
    const jobs = Array(20)
      .fill(null)
      .map((_, i) => createJob({ id: `job-${i}` }));
    const result = generateRecommendations(profile, jobs, 5);

    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });

  it("only recommends saved jobs", () => {
    const profile = createProfile();
    const jobs = [
      createJob({ id: "1", status: "saved" }),
      createJob({ id: "2", status: "applied" }),
      createJob({ id: "3", status: "interviewing" }),
    ];
    const result = generateRecommendations(profile, jobs);

    // Only saved job should be recommended
    expect(result.recommendations.length).toBe(1);
    expect(result.recommendations[0].job.id).toBe("1");
  });

  it("generates match explanation", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    expect(result.recommendations[0].matchExplanation).toBeTruthy();
    expect(result.recommendations[0].matchExplanation.length).toBeGreaterThan(10);
  });

  it("generates reasons", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    expect(result.recommendations[0].reasons).toBeDefined();
    expect(Array.isArray(result.recommendations[0].reasons)).toBe(true);
  });

  it("aggregates top skill gaps", () => {
    const profile = createProfile();
    const jobs = [
      createJob({ id: "1", keywords: ["GraphQL", "AWS"] }),
      createJob({ id: "2", keywords: ["GraphQL", "Docker"] }),
    ];
    const result = generateRecommendations(profile, jobs);

    // GraphQL appears in both jobs
    expect(result.topSkillGaps).toContain("GraphQL");
  });

  it("generates insights", () => {
    const profile = createProfile();
    const jobs = [createJob()];
    const result = generateRecommendations(profile, jobs);

    expect(result.insights.length).toBeGreaterThan(0);
  });

  it("handles empty jobs array", () => {
    const profile = createProfile();
    const result = generateRecommendations(profile, []);

    expect(result.recommendations).toEqual([]);
    expect(result.topSkillGaps).toEqual([]);
    expect(result.growthAreas).toEqual([]);
  });

  it("handles skill variations", () => {
    const profile = createProfile();
    profile.skills.push({ id: "skill-6", name: "NodeJS", category: "technical", proficiency: "advanced" });
    const jobs = [createJob({ keywords: ["Node.js"] })];
    const result = generateRecommendations(profile, jobs);

    // Should recognize NodeJS as matching Node.js
    const nodeMatch = result.recommendations[0].skillMatches.find(
      (m) => m.skill.toLowerCase().includes("node")
    );
    expect(nodeMatch?.matched).toBe(true);
  });

  it("assigns skill relevance levels", () => {
    const profile = createProfile();
    const jobs = [
      createJob({
        title: "React Developer",
        keywords: ["React", "Redux", "CSS"],
      }),
    ];
    const result = generateRecommendations(profile, jobs);

    const reactMatch = result.recommendations[0].skillMatches.find(
      (m) => m.skill.toLowerCase() === "react"
    );
    // React is in title, should be high relevance
    expect(reactMatch?.relevance).toBe("high");
  });
});
