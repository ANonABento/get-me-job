import { describe, it, expect } from "vitest";
import { textToProfile, textToJob } from "./text-to-profile";
import { analyzeATS } from "./analyzer";

const SAMPLE_RESUME = `John Doe
john.doe@example.com
555-123-4567
linkedin.com/in/johndoe

Summary
Experienced software engineer with 5 years building scalable web applications using React, Node.js, and TypeScript. Led team of 5 developers and improved application performance by 40%.

Experience
Senior Software Engineer  Jan 2022 - Present
Acme Corp
- Led development of customer-facing dashboard serving 10,000+ users
- Improved API response times by 40% through caching and query optimization
- Mentored 3 junior developers on React best practices

Software Developer  Jun 2019 - Dec 2021
StartupCo
- Built REST APIs using Node.js and Express
- Developed automated testing suite reducing bugs by 30%

Education
Bachelor of Science in Computer Science  2015 - 2019
State University

Skills
JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, Git, REST APIs`;

const SAMPLE_JOB = `Senior Frontend Engineer

Requirements
- 5+ years of experience with React and TypeScript
- Experience with state management (Redux, Zustand)
- Strong understanding of web performance optimization
- Experience with CI/CD pipelines
- Excellent communication skills

Responsibilities
- Build and maintain customer-facing web applications
- Collaborate with design and backend teams
- Write unit and integration tests`;

describe("textToProfile", () => {
  it("extracts contact info from resume text", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.contact.name).toBe("John Doe");
    expect(profile.contact.email).toBe("john.doe@example.com");
    expect(profile.contact.phone).toBe("555-123-4567");
    expect(profile.contact.linkedin).toBe("linkedin.com/in/johndoe");
  });

  it("extracts summary section", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.summary).toBeTruthy();
    expect(profile.summary).toContain("software engineer");
  });

  it("extracts experience entries", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.experiences.length).toBeGreaterThanOrEqual(1);
    const first = profile.experiences[0];
    expect(first.company).toBeTruthy();
    expect(first.highlights.length).toBeGreaterThan(0);
  });

  it("extracts experience highlights as bullet points", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    const allHighlights = profile.experiences.flatMap((e) => e.highlights);
    expect(allHighlights.some((h) => h.includes("dashboard") || h.includes("API"))).toBe(true);
  });

  it("extracts education entries", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.education.length).toBeGreaterThanOrEqual(1);
  });

  it("extracts skills", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.skills.length).toBeGreaterThan(0);
    const skillNames = profile.skills.map((s) => s.name.toLowerCase());
    expect(skillNames).toContain("javascript");
    expect(skillNames).toContain("react");
  });

  it("assigns unique IDs to all entries", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    const ids = [
      profile.id,
      ...profile.experiences.map((e) => e.id),
      ...profile.education.map((e) => e.id),
      ...profile.skills.map((s) => s.id),
    ];
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("handles empty input gracefully", () => {
    const profile = textToProfile("");
    expect(profile.id).toBe("scanner-anonymous");
    expect(profile.experiences).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.skills).toEqual([]);
  });

  it("handles input with no section headers", () => {
    const profile = textToProfile("Just some random text about a person");
    expect(profile).toBeDefined();
    expect(profile.contact.name).toBeTruthy();
  });

  it("sets rawText on the profile", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    expect(profile.rawText).toBe(SAMPLE_RESUME.trim());
  });

  it("produces a profile compatible with analyzeATS", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    const result = analyzeATS(profile);
    expect(result).toBeDefined();
    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.issues).toBeInstanceOf(Array);
  });
});

describe("textToJob", () => {
  it("extracts job title from first line", () => {
    const job = textToJob(SAMPLE_JOB);
    expect(job.title).toBe("Senior Frontend Engineer");
  });

  it("extracts keywords from job description", () => {
    const job = textToJob(SAMPLE_JOB);
    expect(job.keywords.length).toBeGreaterThan(0);
  });

  it("extracts requirements", () => {
    const job = textToJob(SAMPLE_JOB);
    expect(job.requirements.length).toBeGreaterThan(0);
    expect(job.requirements.some((r) => r.includes("React"))).toBe(true);
  });

  it("preserves full text in description field", () => {
    const job = textToJob(SAMPLE_JOB);
    expect(job.description).toBe(SAMPLE_JOB);
  });

  it("handles minimal job text", () => {
    const job = textToJob("Software Engineer at BigCo");
    expect(job.title).toBe("Software Engineer at BigCo");
    expect(job.keywords.length).toBeGreaterThanOrEqual(0);
  });

  it("produces a job compatible with analyzeATS", () => {
    const profile = textToProfile(SAMPLE_RESUME);
    const job = textToJob(SAMPLE_JOB);
    const result = analyzeATS(profile, job);
    expect(result).toBeDefined();
    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.keywords.length).toBeGreaterThan(0);
  });
});
