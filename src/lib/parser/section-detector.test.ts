import { describe, it, expect } from "vitest";
import { detectSections, calculateSectionConfidence } from "./section-detector";

const WELL_FORMATTED_RESUME = `John Doe
john@example.com | (555) 123-4567

EXPERIENCE
Software Engineer at Acme Corp
Jan 2020 - Present
- Built scalable APIs serving 1M+ requests/day
- Led migration from monolith to microservices

Junior Developer at StartupCo
Jun 2018 - Dec 2019
- Developed React frontend components
- Implemented CI/CD pipeline

EDUCATION
Bachelor of Science in Computer Science
MIT, 2014 - 2018
GPA: 3.8

SKILLS
JavaScript, TypeScript, Python, React, Node.js, AWS, Docker, PostgreSQL

PROJECTS
Personal Portfolio
- Built with Next.js and Tailwind CSS
- Deployed on Vercel
`;

describe("detectSections", () => {
  it("detects all major sections in a well-formatted resume", () => {
    const sections = detectSections(WELL_FORMATTED_RESUME);
    const types = sections.map((s) => s.type);

    expect(types).toContain("contact");
    expect(types).toContain("experience");
    expect(types).toContain("education");
    expect(types).toContain("skills");
    expect(types).toContain("projects");
  });

  it("contact section contains header text before first heading", () => {
    const sections = detectSections(WELL_FORMATTED_RESUME);
    const contact = sections.find((s) => s.type === "contact");
    expect(contact).toBeDefined();
    expect(contact!.text).toContain("john@example.com");
    expect(contact!.text).toContain("John Doe");
  });

  it("experience section contains job entries", () => {
    const sections = detectSections(WELL_FORMATTED_RESUME);
    const exp = sections.find((s) => s.type === "experience");
    expect(exp).toBeDefined();
    expect(exp!.text).toContain("Acme Corp");
    expect(exp!.text).toContain("StartupCo");
  });

  it("returns single unknown section for unstructured text", () => {
    const sections = detectSections("some random text without any sections or headings that is just a blob of content");
    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe("unknown");
    expect(sections[0].confidence).toBeLessThan(0.5);
  });

  it("handles title-case headings with colons", () => {
    const text = `Name Here

Work Experience:
Did some things at Company A

Education:
Got a degree`;

    const sections = detectSections(text);
    const types = sections.map((s) => s.type);
    expect(types).toContain("experience");
    expect(types).toContain("education");
  });

  it("handles 'Professional Experience' variant", () => {
    const text = `Header

Professional Experience
Some job details`;

    const sections = detectSections(text);
    expect(sections.some((s) => s.type === "experience")).toBe(true);
  });

  it("handles 'Summary' and 'Profile' headings", () => {
    const text = `Name

Summary
Experienced developer with 5 years...

Profile
Another variant of summary`;

    const sections = detectSections(text);
    const summaries = sections.filter((s) => s.type === "summary");
    expect(summaries.length).toBeGreaterThanOrEqual(1);
  });
});

describe("calculateSectionConfidence", () => {
  it("returns high confidence when key sections are present", () => {
    const sections = detectSections(WELL_FORMATTED_RESUME);
    const confidence = calculateSectionConfidence(sections);
    expect(confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("returns low confidence for unknown-only sections", () => {
    const sections = detectSections("just some random text here");
    const confidence = calculateSectionConfidence(sections);
    expect(confidence).toBeLessThan(0.5);
  });

  it("returns 0 for empty sections array", () => {
    expect(calculateSectionConfidence([])).toBe(0);
  });
});
