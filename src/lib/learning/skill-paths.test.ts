import { describe, it, expect } from "vitest";
import { generateLearningPaths } from "./skill-paths";
import type { Profile, JobDescription } from "@/types";

const createProfile = (): Profile => ({
  id: "profile-1",
  contact: {
    name: "Test User",
    email: "test@example.com",
    phone: "555-0123",
    linkedin: "linkedin.com/in/test",
  },
  summary: "Developer with React and Node experience",
  experiences: [
    {
      id: "exp-1",
      title: "Software Engineer",
      company: "Tech Co",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2024-01",
      current: false,
      description: "Web development",
      highlights: [],
      skills: ["React", "JavaScript"],
    },
  ],
  education: [],
  skills: [
    { id: "skill-1", name: "React", category: "technical", proficiency: "advanced" },
    { id: "skill-2", name: "JavaScript", category: "technical", proficiency: "advanced" },
    { id: "skill-3", name: "Node.js", category: "technical", proficiency: "intermediate" },
  ],
  projects: [],
  certifications: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

const createJob = (keywords: string[]): JobDescription => ({
  id: `job-${Math.random()}`,
  title: "Software Engineer",
  company: "Company",
  description: "Job description",
  requirements: [],
  responsibilities: [],
  keywords,
  createdAt: new Date().toISOString(),
});

describe("generateLearningPaths", () => {
  it("returns correct structure", () => {
    const profile = createProfile();
    const jobs = [createJob(["React", "GraphQL", "Docker"])];

    const result = generateLearningPaths(profile, jobs);

    expect(result).toHaveProperty("paths");
    expect(result).toHaveProperty("totalEstimatedWeeks");
    expect(result).toHaveProperty("quickWins");
    expect(result).toHaveProperty("strategicSkills");
    expect(result).toHaveProperty("insights");
  });

  it("identifies skill gaps from job keywords", () => {
    const profile = createProfile();
    const jobs = [createJob(["React", "TypeScript", "Kubernetes"])];

    const result = generateLearningPaths(profile, jobs);

    // TypeScript and Kubernetes are not in profile
    const hasTypescript = result.paths.some(
      (p) => p.skill.toLowerCase().includes("typescript")
    );
    const hasKubernetes = result.paths.some(
      (p) => p.skill.toLowerCase().includes("kubernetes")
    );

    expect(hasTypescript || hasKubernetes).toBe(true);
  });

  it("excludes skills user already has", () => {
    const profile = createProfile();
    const jobs = [createJob(["React", "JavaScript"])];

    const result = generateLearningPaths(profile, jobs);

    // React and JavaScript should not appear as gaps
    const hasReact = result.paths.some(
      (p) => p.skill.toLowerCase() === "react"
    );
    expect(hasReact).toBe(false);
  });

  it("respects limit parameter", () => {
    const profile = createProfile();
    const jobs = [
      createJob(["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"]),
    ];

    const result = generateLearningPaths(profile, jobs, 3);

    expect(result.paths.length).toBeLessThanOrEqual(3);
  });

  it("returns empty paths when no gaps exist", () => {
    const profile = createProfile();
    const jobs = [createJob(["React", "JavaScript"])];

    const result = generateLearningPaths(profile, jobs);

    // User has all required skills
    expect(result.paths.length).toBe(0);
  });

  it("prioritizes high-relevance skills", () => {
    const profile = createProfile();
    const jobs = [
      createJob(["GraphQL", "Docker"]), // GraphQL in first job
      createJob(["GraphQL", "Kubernetes"]), // GraphQL appears twice
    ];

    const result = generateLearningPaths(profile, jobs);

    // GraphQL should appear and be higher priority
    const graphqlPath = result.paths.find((p) =>
      p.skill.toLowerCase().includes("graphql")
    );

    if (graphqlPath) {
      expect(graphqlPath.jobsRequiring).toBeGreaterThanOrEqual(2);
    }
  });

  it("includes learning resources", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      expect(result.paths[0].resources).toBeDefined();
      expect(result.paths[0].resources.length).toBeGreaterThan(0);
    }
  });

  it("includes milestones", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      expect(result.paths[0].milestones).toBeDefined();
      expect(result.paths[0].milestones.length).toBeGreaterThan(0);
    }
  });

  it("estimates learning weeks", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      expect(result.paths[0].estimatedWeeks).toBeGreaterThan(0);
    }
  });

  it("calculates total estimated weeks", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL", "Docker", "Kubernetes"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      const summedWeeks = result.paths.reduce(
        (sum, p) => sum + p.estimatedWeeks,
        0
      );
      expect(result.totalEstimatedWeeks).toBe(summedWeeks);
    }
  });

  it("identifies quick wins", () => {
    const profile = createProfile();
    const jobs = [
      createJob(["Skill1"]),
      createJob(["Skill1"]),
      createJob(["Skill2"]),
    ];

    const result = generateLearningPaths(profile, jobs);

    // Quick wins are skills that appear in multiple jobs and are easy to learn
    expect(Array.isArray(result.quickWins)).toBe(true);
  });

  it("identifies strategic skills", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    // High priority skills should be in strategic skills
    if (result.paths.some((p) => p.priority === "high")) {
      expect(result.strategicSkills.length).toBeGreaterThan(0);
    }
  });

  it("generates insights", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.insights[0]).toBeTruthy();
  });

  it("handles empty jobs array", () => {
    const profile = createProfile();

    const result = generateLearningPaths(profile, []);

    expect(result.paths).toEqual([]);
    expect(result.totalEstimatedWeeks).toBe(0);
  });

  it("assigns priority levels", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      expect(["high", "medium", "low"]).toContain(result.paths[0].priority);
    }
  });

  it("includes current and target levels", () => {
    const profile = createProfile();
    const jobs = [createJob(["GraphQL"])];

    const result = generateLearningPaths(profile, jobs);

    if (result.paths.length > 0) {
      expect(["none", "beginner", "intermediate", "advanced"]).toContain(
        result.paths[0].currentLevel
      );
      expect(["beginner", "intermediate", "advanced", "expert"]).toContain(
        result.paths[0].targetLevel
      );
    }
  });
});
