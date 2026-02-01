import { describe, it, expect } from "vitest";
import {
  calculateFunnel,
  calculateTimeToInterview,
  calculateOfferRate,
  identifyTopResumes,
  generateInsights,
  calculateSuccessMetrics,
} from "./success-metrics";
import type { JobDescription } from "@/types";
import type { GeneratedResume } from "@/lib/db/resumes";

const createJob = (overrides: Partial<JobDescription> = {}): JobDescription => ({
  id: `job-${Math.random()}`,
  title: "Software Engineer",
  company: "Tech Corp",
  description: "Job description",
  requirements: ["Skill 1"],
  responsibilities: [],
  keywords: ["React"],
  status: "saved",
  createdAt: "2024-01-01",
  ...overrides,
});

const createResume = (overrides: Partial<GeneratedResume> = {}): GeneratedResume => ({
  id: `resume-${Math.random()}`,
  jobId: "job-1",
  profileId: "default",
  templateId: "classic",
  contentJson: "{}",
  htmlPath: "/resumes/test.html",
  matchScore: 80,
  createdAt: "2024-01-01",
  ...overrides,
});

describe("calculateFunnel", () => {
  it("returns empty funnel for no jobs", () => {
    const result = calculateFunnel([]);

    expect(result.length).toBe(4);
    expect(result[0].stage).toBe("Applied");
    expect(result[0].count).toBe(0);
  });

  it("calculates funnel stages correctly", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "applied" }),
      createJob({ status: "interviewing" }),
      createJob({ status: "offered" }),
      createJob({ status: "rejected" }),
    ];

    const result = calculateFunnel(jobs);

    expect(result[0].count).toBe(5); // All applied
    expect(result[1].count).toBe(3); // Responded (interviewing + offered + rejected)
    expect(result[2].count).toBe(2); // Interviewed (interviewing + offered)
    expect(result[3].count).toBe(1); // Offered
  });

  it("calculates percentages correctly", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "applied" }),
      createJob({ status: "offered" }),
      createJob({ status: "rejected" }),
    ];

    const result = calculateFunnel(jobs);

    expect(result[0].percentage).toBe(100);
    expect(result[3].percentage).toBe(25); // 1 out of 4
  });

  it("calculates conversion from previous correctly", () => {
    const jobs = [
      createJob({ status: "interviewing" }),
      createJob({ status: "interviewing" }),
      createJob({ status: "offered" }),
    ];

    const result = calculateFunnel(jobs);

    // All responded and all interviewed
    expect(result[2].conversionFromPrevious).toBe(100);
    // 1 offered out of 3 interviewed
    expect(result[3].conversionFromPrevious).toBe(33);
  });
});

describe("calculateTimeToInterview", () => {
  it("returns zeros for no interviews", () => {
    const result = calculateTimeToInterview([]);

    expect(result.overall.count).toBe(0);
    expect(result.overall.averageDays).toBe(0);
  });

  it("calculates time metrics", () => {
    const jobs = [
      createJob({
        status: "interviewing",
        createdAt: "2024-01-01",
        appliedAt: "2024-01-05",
      }),
      createJob({
        status: "offered",
        createdAt: "2024-01-01",
        appliedAt: "2024-01-10",
      }),
    ];

    const result = calculateTimeToInterview(jobs);

    expect(result.overall.count).toBe(2);
    expect(result.overall.minDays).toBeGreaterThanOrEqual(0);
    expect(result.overall.maxDays).toBeGreaterThanOrEqual(result.overall.minDays);
  });

  it("groups by job type", () => {
    const jobs = [
      createJob({
        status: "interviewing",
        type: "full-time",
        createdAt: "2024-01-01",
        appliedAt: "2024-01-05",
      }),
      createJob({
        status: "interviewing",
        type: "contract",
        createdAt: "2024-01-01",
        appliedAt: "2024-01-03",
      }),
    ];

    const result = calculateTimeToInterview(jobs);

    expect(result.byJobType.length).toBe(2);
  });
});

describe("calculateOfferRate", () => {
  it("returns 0 for no applied jobs", () => {
    const jobs = [createJob({ status: "saved" })];
    const result = calculateOfferRate(jobs);

    expect(result.overall).toBe(0);
  });

  it("calculates overall offer rate", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "applied" }),
      createJob({ status: "offered" }),
      createJob({ status: "rejected" }),
    ];

    const result = calculateOfferRate(jobs);

    // 1 offered out of 4 applied/responded
    expect(result.overall).toBe(25);
  });

  it("groups by job type", () => {
    const jobs = [
      createJob({ status: "applied", type: "full-time" }),
      createJob({ status: "offered", type: "full-time" }),
      createJob({ status: "applied", type: "contract" }),
    ];

    const result = calculateOfferRate(jobs);

    expect(result.byJobType.length).toBe(2);
    const fullTime = result.byJobType.find((t) => t.type === "full-time");
    expect(fullTime?.rate).toBe(50); // 1 out of 2
  });
});

describe("identifyTopResumes", () => {
  it("returns empty array for no resumes", () => {
    const result = identifyTopResumes([], []);
    expect(result).toEqual([]);
  });

  it("sorts successful resumes first", () => {
    const jobs = [
      createJob({ id: "job-1", status: "offered" }),
      createJob({ id: "job-2", status: "saved" }),
    ];

    const resumes = [
      createResume({ id: "r1", jobId: "job-2", matchScore: 90 }),
      createResume({ id: "r2", jobId: "job-1", matchScore: 70 }),
    ];

    const result = identifyTopResumes(resumes, jobs);

    expect(result[0].id).toBe("r2"); // Successful one first despite lower score
    expect(result[0].successful).toBe(true);
  });

  it("limits to 10 resumes", () => {
    const jobs = Array(15)
      .fill(null)
      .map((_, i) => createJob({ id: `job-${i}` }));
    const resumes = Array(15)
      .fill(null)
      .map((_, i) => createResume({ id: `r-${i}`, jobId: `job-${i}` }));

    const result = identifyTopResumes(resumes, jobs);

    expect(result.length).toBe(10);
  });

  it("includes job info in performance", () => {
    const jobs = [createJob({ id: "job-1", title: "Engineer", company: "Corp" })];
    const resumes = [createResume({ jobId: "job-1" })];

    const result = identifyTopResumes(resumes, jobs);

    expect(result[0].jobTitle).toBe("Engineer");
    expect(result[0].company).toBe("Corp");
  });
});

describe("generateInsights", () => {
  it("generates at least one insight", () => {
    const jobs: JobDescription[] = [];
    const funnel = calculateFunnel(jobs);
    const timeToInterview = calculateTimeToInterview(jobs);
    const offerRate = calculateOfferRate(jobs);

    const result = generateInsights(jobs, funnel, timeToInterview, offerRate);

    expect(result.length).toBeGreaterThan(0);
  });

  it("suggests more applications when volume is low", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "applied" }),
    ];
    const funnel = calculateFunnel(jobs);
    const timeToInterview = calculateTimeToInterview(jobs);
    const offerRate = calculateOfferRate(jobs);

    const result = generateInsights(jobs, funnel, timeToInterview, offerRate);

    const hasVolumeInsight = result.some(
      (i) => i.toLowerCase().includes("apply") || i.toLowerCase().includes("position")
    );
    expect(hasVolumeInsight).toBe(true);
  });
});

describe("calculateSuccessMetrics", () => {
  it("returns complete metrics structure", () => {
    const jobs = [createJob({ status: "offered" })];
    const resumes = [createResume({ jobId: jobs[0].id })];

    const result = calculateSuccessMetrics(jobs, resumes);

    expect(result).toHaveProperty("funnel");
    expect(result).toHaveProperty("timeToInterview");
    expect(result).toHaveProperty("offerRate");
    expect(result).toHaveProperty("topResumes");
    expect(result).toHaveProperty("insights");
  });

  it("calculates all components correctly", () => {
    const jobs = [
      createJob({ id: "j1", status: "offered" }),
      createJob({ id: "j2", status: "interviewing" }),
      createJob({ id: "j3", status: "applied" }),
    ];
    const resumes = [createResume({ jobId: "j1" })];

    const result = calculateSuccessMetrics(jobs, resumes);

    expect(result.funnel.length).toBe(4);
    expect(result.offerRate.overall).toBeGreaterThan(0);
    expect(result.insights.length).toBeGreaterThan(0);
  });
});
