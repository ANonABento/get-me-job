import { describe, it, expect } from "vitest";
import { generateResumeHTML } from "./pdf";
import type { TailoredResume } from "./generator";

const mockResume: TailoredResume = {
  contact: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-1234",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
  },
  summary: "Experienced software engineer with 8 years of experience.",
  experiences: [
    {
      company: "Acme Corp",
      title: "Senior Engineer",
      dates: "2020 - Present",
      highlights: ["Led team of 5", "Shipped v2 platform"],
    },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  education: [
    {
      institution: "MIT",
      degree: "BS",
      field: "Computer Science",
      date: "2016",
    },
  ],
};

describe("generateResumeHTML", () => {
  it("generates single-column HTML for classic template", () => {
    const html = generateResumeHTML(mockResume, "classic");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("Senior Engineer");
    expect(html).not.toContain("two-col-container");
  });

  it("generates two-column HTML for two-column template", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("two-col-container");
    expect(html).toContain("two-col-left");
    expect(html).toContain("two-col-right");
  });

  it("puts skills in the left column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    // Extract content between the left and right column div markers
    const leftColMatch = html.match(/<div class="two-col-left">([\s\S]*?)<\/div>\s*<div class="two-col-right">/);
    expect(leftColMatch).toBeTruthy();
    const leftCol = leftColMatch![1];
    expect(leftCol).toContain("Skills");
    expect(leftCol).toContain("TypeScript");
    expect(leftCol).toContain("React");
  });

  it("puts experience in the right column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const rightColMatch = html.match(/<div class="two-col-right">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/);
    expect(rightColMatch).toBeTruthy();
    const rightCol = rightColMatch![1];
    expect(rightCol).toContain("Experience");
    expect(rightCol).toContain("Senior Engineer");
    expect(rightCol).toContain("Acme Corp");
  });

  it("puts education in the left column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const leftColMatch = html.match(/<div class="two-col-left">([\s\S]*?)<\/div>\s*<div class="two-col-right">/);
    expect(leftColMatch).toBeTruthy();
    const leftCol = leftColMatch![1];
    expect(leftCol).toContain("Education");
    expect(leftCol).toContain("MIT");
  });

  it("puts summary in the right column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const rightColMatch = html.match(/<div class="two-col-right">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/);
    expect(rightColMatch).toBeTruthy();
    const rightCol = rightColMatch![1];
    expect(rightCol).toContain("Summary");
    expect(rightCol).toContain("Experienced software engineer");
  });

  it("includes print styles for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("@media print");
    expect(html).toContain("print-color-adjust: exact");
  });

  it("handles resume with no education in two-column layout", () => {
    const noEdu = { ...mockResume, education: [] };
    const html = generateResumeHTML(noEdu, "two-column");
    expect(html).toContain("two-col-container");
    expect(html).not.toContain("Education");
  });

  it("all existing templates still produce valid HTML", () => {
    const templateIds = [
      "classic",
      "modern",
      "minimal",
      "executive",
      "tech",
      "creative",
      "compact",
      "professional",
    ];
    for (const id of templateIds) {
      const html = generateResumeHTML(mockResume, id);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Jane Doe");
    }
  });
});
