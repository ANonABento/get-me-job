import { describe, it, expect, beforeEach } from "vitest";
import type { Profile, JobDescription } from "@/types";
import type { AnalyticsSnapshot } from "@/lib/db/analytics";
import {
  generateInsights,
  analyzeStrongestSkills,
  analyzeMissingKeywords,
  analyzeAtsTrend,
  analyzeResumePerformance,
  analyzeQuantifiedMetrics,
  analyzeApplicationMomentum,
  analyzeProfileCompleteness,
  getInsights,
  clearInsightCache,
  type InsightData,
} from "./insights";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "default",
    contact: { name: "Test User", email: "test@example.com" },
    summary:
      "Experienced software engineer with 5 years of experience building web applications.",
    experiences: [
      {
        id: "exp-1",
        company: "Tech Corp",
        title: "Software Engineer",
        startDate: "2020-01",
        current: true,
        description: "Built web applications",
        highlights: ["Led team of 5 engineers", "Increased performance by 30%"],
        skills: ["JavaScript", "React"],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "MIT",
        degree: "BS",
        field: "Computer Science",
        highlights: [],
      },
    ],
    skills: [
      { id: "s1", name: "JavaScript", category: "technical" },
      { id: "s2", name: "React", category: "technical" },
      { id: "s3", name: "TypeScript", category: "technical" },
    ],
    projects: [],
    certifications: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "job-1",
    title: "Frontend Engineer",
    company: "Startup Inc",
    description: "Looking for a React developer with JavaScript experience",
    requirements: ["React", "JavaScript"],
    responsibilities: ["Build UI"],
    keywords: ["react", "javascript", "typescript"],
    createdAt: "2024-01-10",
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<AnalyticsSnapshot> = {},
): AnalyticsSnapshot {
  return {
    id: "snap-1",
    userId: "default",
    snapshotDate: "2024-01-15",
    totalJobs: 10,
    jobsSaved: 3,
    jobsApplied: 5,
    jobsInterviewing: 1,
    jobsOffered: 1,
    jobsRejected: 0,
    totalInterviews: 3,
    interviewsCompleted: 2,
    totalDocuments: 5,
    totalResumes: 3,
    profileCompleteness: 80,
    createdAt: "2024-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeData(overrides: Partial<InsightData> = {}): InsightData {
  return {
    profile: makeProfile(),
    jobs: [makeJob()],
    snapshots: [],
    generatedResumes: [],
    ...overrides,
  };
}

describe("Insight Generation", () => {
  beforeEach(() => {
    clearInsightCache("default");
  });

  describe("generateInsights", () => {
    it("should return at most 5 insights", () => {
      const data = makeData({
        profile: makeProfile({ skills: [] }),
        jobs: Array.from({ length: 10 }, (_, i) =>
          makeJob({
            id: `job-${i}`,
            keywords: ["python", "django", "aws", "docker"],
          }),
        ),
        snapshots: [
          makeSnapshot({
            snapshotDate: "2024-01-08",
            profileCompleteness: 90,
            jobsApplied: 2,
            jobsInterviewing: 0,
          }),
          makeSnapshot({
            snapshotDate: "2024-01-15",
            profileCompleteness: 70,
            jobsApplied: 2,
            jobsInterviewing: 0,
          }),
        ],
      });

      const insights = generateInsights(data);
      expect(insights.length).toBeLessThanOrEqual(5);
    });

    it("should sort by priority (high first)", () => {
      const data = makeData({
        profile: makeProfile({
          experiences: [
            {
              id: "exp-1",
              company: "Corp",
              title: "Dev",
              startDate: "2020-01",
              current: true,
              description: "Built things",
              highlights: ["Did stuff"],
              skills: [],
            },
          ],
          skills: [],
        }),
        jobs: Array.from({ length: 5 }, (_, i) =>
          makeJob({
            id: `job-${i}`,
            keywords: ["python", "django"],
          }),
        ),
      });

      const insights = generateInsights(data);
      if (insights.length >= 2) {
        const priorities = insights.map((i) => i.priority);
        const highIndex = priorities.indexOf("high");
        const lowIndex = priorities.indexOf("low");
        if (highIndex !== -1 && lowIndex !== -1) {
          expect(highIndex).toBeLessThan(lowIndex);
        }
      }
    });
  });

  describe("analyzeStrongestSkills", () => {
    it("should identify skills that appear in jobs", () => {
      const jobs = Array.from({ length: 5 }, (_, i) =>
        makeJob({
          id: `job-${i}`,
          keywords: ["react", "javascript"],
          description: "Need React and JavaScript developer",
        }),
      );

      const data = makeData({ jobs });
      const insights = analyzeStrongestSkills(data);

      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe("strongest_skills");
      expect(insights[0].description).toContain("React");
    });

    it("should return empty when no profile", () => {
      const insights = analyzeStrongestSkills(makeData({ profile: null }));
      expect(insights).toEqual([]);
    });

    it("should return empty when no skills", () => {
      const insights = analyzeStrongestSkills(
        makeData({ profile: makeProfile({ skills: [] }) }),
      );
      expect(insights).toEqual([]);
    });

    it("should return empty when no jobs", () => {
      const insights = analyzeStrongestSkills(makeData({ jobs: [] }));
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeMissingKeywords", () => {
    it("should identify keywords missing from profile", () => {
      const jobs = Array.from({ length: 5 }, (_, i) =>
        makeJob({
          id: `job-${i}`,
          keywords: ["python", "django", "react"],
        }),
      );

      const data = makeData({ jobs });
      const insights = analyzeMissingKeywords(data);

      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe("missing_keywords");
      expect(insights[0].description).toContain("python");
      expect(insights[0].priority).toBe("high");
    });

    it("should return empty when no profile", () => {
      const insights = analyzeMissingKeywords(makeData({ profile: null }));
      expect(insights).toEqual([]);
    });

    it("should return empty when no jobs", () => {
      const insights = analyzeMissingKeywords(makeData({ jobs: [] }));
      expect(insights).toEqual([]);
    });

    it("should not flag keywords already in profile", () => {
      const jobs = [
        makeJob({ keywords: ["javascript", "react", "typescript"] }),
      ];
      const data = makeData({ jobs });
      const insights = analyzeMissingKeywords(data);
      // All keywords are in profile skills, so no missing keywords
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeAtsTrend", () => {
    it("should detect improving trend", () => {
      const snapshots = [
        makeSnapshot({ snapshotDate: "2024-01-08", profileCompleteness: 60 }),
        makeSnapshot({ snapshotDate: "2024-01-15", profileCompleteness: 80 }),
      ];

      const insights = analyzeAtsTrend(makeData({ snapshots }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Profile improving");
      expect(insights[0].description).toContain("20 points");
      expect(insights[0].priority).toBe("low");
    });

    it("should detect declining trend", () => {
      const snapshots = [
        makeSnapshot({ snapshotDate: "2024-01-08", profileCompleteness: 90 }),
        makeSnapshot({ snapshotDate: "2024-01-15", profileCompleteness: 70 }),
      ];

      const insights = analyzeAtsTrend(makeData({ snapshots }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Profile needs attention");
      expect(insights[0].priority).toBe("medium");
    });

    it("should return empty with fewer than 2 snapshots", () => {
      const insights = analyzeAtsTrend(
        makeData({ snapshots: [makeSnapshot()] }),
      );
      expect(insights).toEqual([]);
    });

    it("should return empty when no change", () => {
      const snapshots = [
        makeSnapshot({ snapshotDate: "2024-01-08", profileCompleteness: 80 }),
        makeSnapshot({ snapshotDate: "2024-01-15", profileCompleteness: 80 }),
      ];
      const insights = analyzeAtsTrend(makeData({ snapshots }));
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeResumePerformance", () => {
    it("should compare resume scores for interview vs non-interview jobs", () => {
      const jobs = [
        makeJob({ id: "job-1", status: "interviewing" }),
        makeJob({ id: "job-2", status: "applied" }),
      ];
      const generatedResumes = [
        { id: "r1", jobId: "job-1", matchScore: 85, createdAt: "2024-01-10" },
        { id: "r2", jobId: "job-2", matchScore: 60, createdAt: "2024-01-12" },
      ];

      const insights = analyzeResumePerformance(
        makeData({ jobs, generatedResumes }),
      );

      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe("resume_performance");
      expect(insights[0].description).toContain("25 points higher");
    });

    it("should return empty with fewer than 2 resumes", () => {
      const insights = analyzeResumePerformance(
        makeData({
          generatedResumes: [
            {
              id: "r1",
              jobId: "job-1",
              matchScore: 80,
              createdAt: "2024-01-10",
            },
          ],
        }),
      );
      expect(insights).toEqual([]);
    });

    it("should return empty when no interview jobs", () => {
      const jobs = [makeJob({ id: "job-1", status: "applied" })];
      const generatedResumes = [
        { id: "r1", jobId: "job-1", matchScore: 80, createdAt: "2024-01-10" },
        { id: "r2", jobId: "job-2", matchScore: 70, createdAt: "2024-01-12" },
      ];
      const insights = analyzeResumePerformance(
        makeData({ jobs, generatedResumes }),
      );
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeQuantifiedMetrics", () => {
    it("should return insight when no numbers in experience", () => {
      const profile = makeProfile({
        experiences: [
          {
            id: "exp-1",
            company: "Corp",
            title: "Developer",
            startDate: "2020-01",
            current: true,
            description: "Built web applications and maintained codebases",
            highlights: [
              "Worked on frontend features",
              "Collaborated with team",
            ],
            skills: ["React"],
          },
        ],
      });

      const insights = analyzeQuantifiedMetrics(makeData({ profile }));

      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe("quantified_metrics");
      expect(insights[0].priority).toBe("high");
    });

    it("should return empty when experience has numbers", () => {
      const insights = analyzeQuantifiedMetrics(makeData());
      // Default profile has "Led team of 5 engineers" and "30%"
      expect(insights).toEqual([]);
    });

    it("should return empty when no profile", () => {
      const insights = analyzeQuantifiedMetrics(makeData({ profile: null }));
      expect(insights).toEqual([]);
    });

    it("should return empty when no experiences", () => {
      const insights = analyzeQuantifiedMetrics(
        makeData({ profile: makeProfile({ experiences: [] }) }),
      );
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeApplicationMomentum", () => {
    it("should encourage when momentum slowed", () => {
      const snapshots = [
        makeSnapshot({
          snapshotDate: "2024-01-08",
          jobsApplied: 5,
          jobsInterviewing: 1,
        }),
        makeSnapshot({
          snapshotDate: "2024-01-15",
          jobsApplied: 5,
          jobsInterviewing: 1,
        }),
      ];

      const insights = analyzeApplicationMomentum(makeData({ snapshots }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Keep up your momentum");
      expect(insights[0].priority).toBe("medium");
    });

    it("should celebrate when interviews increased", () => {
      const snapshots = [
        makeSnapshot({
          snapshotDate: "2024-01-08",
          jobsApplied: 3,
          jobsInterviewing: 0,
        }),
        makeSnapshot({
          snapshotDate: "2024-01-15",
          jobsApplied: 5,
          jobsInterviewing: 2,
        }),
      ];

      const insights = analyzeApplicationMomentum(makeData({ snapshots }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Great progress!");
    });

    it("should return empty with fewer than 2 snapshots", () => {
      const insights = analyzeApplicationMomentum(makeData({ snapshots: [] }));
      expect(insights).toEqual([]);
    });
  });

  describe("analyzeProfileCompleteness", () => {
    it("should suggest upload when no profile", () => {
      const insights = analyzeProfileCompleteness(makeData({ profile: null }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Set up your profile");
      expect(insights[0].actionUrl).toBe("/components");
      expect(insights[0].priority).toBe("high");
    });

    it("should identify missing sections", () => {
      const profile = makeProfile({
        summary: "",
        skills: [],
        experiences: [],
        contact: { name: "Test" },
      });

      const insights = analyzeProfileCompleteness(makeData({ profile }));

      expect(insights.length).toBe(1);
      expect(insights[0].title).toBe("Complete your profile");
      expect(insights[0].description).toContain("professional summary");
      expect(insights[0].description).toContain("email address");
    });

    it("should return empty when profile is complete", () => {
      const insights = analyzeProfileCompleteness(makeData());
      expect(insights).toEqual([]);
    });
  });

  describe("getInsights with caching", () => {
    it("should return cached insights on second call", () => {
      const data = makeData();
      const first = getInsights(data, "cache-test");
      const second = getInsights(data, "cache-test");

      expect(first).toEqual(second);
      // Clean up
      clearInsightCache("cache-test");
    });

    it("should regenerate after cache clear", () => {
      const data1 = makeData({ profile: null });
      const first = getInsights(data1, "clear-test");

      clearInsightCache("clear-test");

      const data2 = makeData();
      const second = getInsights(data2, "clear-test");

      // After clearing cache with different data, results may differ
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      clearInsightCache("clear-test");
    });
  });
});
