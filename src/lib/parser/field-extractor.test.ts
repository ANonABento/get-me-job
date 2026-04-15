import { describe, it, expect } from "vitest";
import {
  extractContact,
  extractSummary,
  extractExperiences,
  extractEducation,
  extractSkills,
  extractProjects,
  extractFieldsFromSections,
} from "./field-extractor";
import type { DetectedSection } from "./section-detector";

describe("extractContact", () => {
  it("extracts email, phone, name from header text", () => {
    const text = `John Doe
john.doe@example.com | (555) 123-4567
San Francisco, CA`;

    const { contact, confidence } = extractContact(text);
    expect(contact.name).toBe("John Doe");
    expect(contact.email).toBe("john.doe@example.com");
    expect(contact.phone?.trim()).toBe("(555) 123-4567");
    expect(contact.location).toContain("San Francisco");
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("extracts LinkedIn and GitHub URLs", () => {
    const text = `Jane Smith
linkedin.com/in/janesmith | github.com/janesmith`;

    const { contact } = extractContact(text);
    expect(contact.linkedin).toBe("linkedin.com/in/janesmith");
    expect(contact.github).toBe("github.com/janesmith");
  });

  it("returns low confidence when no fields found", () => {
    const { confidence } = extractContact("");
    expect(confidence).toBeLessThanOrEqual(0.25);
  });
});

describe("extractSummary", () => {
  it("extracts summary text from section", () => {
    const section: DetectedSection = {
      type: "summary",
      heading: "SUMMARY",
      startLine: 5,
      endLine: 8,
      text: "SUMMARY\nExperienced full-stack developer with 5 years of experience building scalable web applications.",
      confidence: 1.0,
    };

    const { summary, confidence } = extractSummary(section);
    expect(summary).toContain("Experienced full-stack developer");
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("returns low confidence for very short summary", () => {
    const section: DetectedSection = {
      type: "summary",
      heading: "SUMMARY",
      startLine: 0,
      endLine: 1,
      text: "SUMMARY\nShort",
      confidence: 1.0,
    };

    const { confidence } = extractSummary(section);
    expect(confidence).toBeLessThanOrEqual(0.4);
  });
});

describe("extractExperiences", () => {
  it("extracts job entries with dates and highlights", () => {
    const section: DetectedSection = {
      type: "experience",
      heading: "EXPERIENCE",
      startLine: 0,
      endLine: 10,
      text: `EXPERIENCE
Software Engineer at Acme Corp
Jan 2020 - Present
- Built scalable APIs
- Led team of 5

Junior Dev at StartupCo
Jun 2018 - Dec 2019
- Developed React components`,
      confidence: 1.0,
    };

    const { experiences, confidence } = extractExperiences(section);
    expect(experiences.length).toBeGreaterThanOrEqual(1);
    expect(experiences[0].title).toBeTruthy();
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("parses 'Title at Company' format", () => {
    const section: DetectedSection = {
      type: "experience",
      heading: "EXPERIENCE",
      startLine: 0,
      endLine: 5,
      text: `EXPERIENCE
Software Engineer at Google
Jan 2020 - Present
- Built things`,
      confidence: 1.0,
    };

    const { experiences } = extractExperiences(section);
    expect(experiences.length).toBeGreaterThanOrEqual(1);
    expect(experiences[0].title).toBe("Software Engineer");
    expect(experiences[0].company).toBe("Google");
  });

  it("detects 'Present' as current role", () => {
    const section: DetectedSection = {
      type: "experience",
      heading: "EXPERIENCE",
      startLine: 0,
      endLine: 3,
      text: `EXPERIENCE
Developer at Corp
Jan 2022 - Present`,
      confidence: 1.0,
    };

    const { experiences } = extractExperiences(section);
    expect(experiences[0].current).toBe(true);
  });

  it("returns low confidence when no entries found", () => {
    const section: DetectedSection = {
      type: "experience",
      heading: "EXPERIENCE",
      startLine: 0,
      endLine: 0,
      text: "EXPERIENCE",
      confidence: 1.0,
    };

    const { experiences, confidence } = extractExperiences(section);
    expect(experiences).toHaveLength(0);
    expect(confidence).toBeLessThan(0.5);
  });
});

describe("extractEducation", () => {
  it("extracts education entries", () => {
    const section: DetectedSection = {
      type: "education",
      heading: "EDUCATION",
      startLine: 0,
      endLine: 5,
      text: `EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology
2014 - 2018
GPA: 3.8`,
      confidence: 1.0,
    };

    const { education, confidence } = extractEducation(section);
    expect(education.length).toBeGreaterThanOrEqual(1);
    expect(education[0].degree).toContain("Bachelor");
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("extracts GPA", () => {
    const section: DetectedSection = {
      type: "education",
      heading: "EDUCATION",
      startLine: 0,
      endLine: 3,
      text: `EDUCATION
BS Computer Science, State University
GPA: 3.5`,
      confidence: 1.0,
    };

    const { education } = extractEducation(section);
    expect(education[0].gpa).toBe("3.5");
  });
});

describe("extractSkills", () => {
  it("extracts comma-separated skills", () => {
    const section: DetectedSection = {
      type: "skills",
      heading: "SKILLS",
      startLine: 0,
      endLine: 2,
      text: "SKILLS\nJavaScript, TypeScript, Python, React, Node.js, Docker",
      confidence: 1.0,
    };

    const { skills, confidence } = extractSkills(section);
    expect(skills.length).toBeGreaterThanOrEqual(4);
    expect(skills.some((s) => s.name === "JavaScript")).toBe(true);
    expect(skills.some((s) => s.name === "Python")).toBe(true);
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("categorizes skills correctly", () => {
    const section: DetectedSection = {
      type: "skills",
      heading: "SKILLS",
      startLine: 0,
      endLine: 2,
      text: "SKILLS\nJavaScript, Leadership, Jira, Spanish",
      confidence: 1.0,
    };

    const { skills } = extractSkills(section);
    const js = skills.find((s) => s.name === "JavaScript");
    const leadership = skills.find((s) => s.name === "Leadership");
    const jira = skills.find((s) => s.name === "Jira");
    const spanish = skills.find((s) => s.name === "Spanish");

    expect(js?.category).toBe("technical");
    expect(leadership?.category).toBe("soft");
    expect(jira?.category).toBe("tool");
    expect(spanish?.category).toBe("language");
  });

  it("handles 'Category: skill1, skill2' format", () => {
    const section: DetectedSection = {
      type: "skills",
      heading: "SKILLS",
      startLine: 0,
      endLine: 3,
      text: `SKILLS
Languages: JavaScript, Python, Go
Tools: Docker, Kubernetes`,
      confidence: 1.0,
    };

    const { skills } = extractSkills(section);
    expect(skills.length).toBeGreaterThanOrEqual(4);
  });

  it("deduplicates skills", () => {
    const section: DetectedSection = {
      type: "skills",
      heading: "SKILLS",
      startLine: 0,
      endLine: 2,
      text: "SKILLS\nJavaScript, React, JavaScript, React",
      confidence: 1.0,
    };

    const { skills } = extractSkills(section);
    const jsCount = skills.filter((s) => s.name === "JavaScript").length;
    expect(jsCount).toBe(1);
  });
});

describe("extractProjects", () => {
  it("extracts projects with highlights", () => {
    const section: DetectedSection = {
      type: "projects",
      heading: "PROJECTS",
      startLine: 0,
      endLine: 6,
      text: `PROJECTS
Portfolio Website
- Built with Next.js and Tailwind CSS
- Deployed on Vercel with CI/CD

CLI Tool
- Node.js command-line utility for parsing logs`,
      confidence: 1.0,
    };

    const { projects, confidence } = extractProjects(section);
    expect(projects.length).toBeGreaterThanOrEqual(1);
    expect(projects[0].name).toBe("Portfolio Website");
    expect(projects[0].highlights.length).toBeGreaterThan(0);
    expect(confidence).toBeGreaterThan(0.5);
  });
});

describe("extractFieldsFromSections", () => {
  it("extracts all fields from a complete set of sections", () => {
    const sections: DetectedSection[] = [
      {
        type: "contact",
        heading: "",
        startLine: 0,
        endLine: 2,
        text: "John Doe\njohn@example.com",
        confidence: 0.8,
      },
      {
        type: "experience",
        heading: "EXPERIENCE",
        startLine: 3,
        endLine: 7,
        text: "EXPERIENCE\nDev at Corp\nJan 2020 - Present\n- Did stuff",
        confidence: 1.0,
      },
      {
        type: "skills",
        heading: "SKILLS",
        startLine: 8,
        endLine: 9,
        text: "SKILLS\nJavaScript, Python",
        confidence: 1.0,
      },
    ];

    const result = extractFieldsFromSections(sections);
    expect(result.contact.name).toBe("John Doe");
    expect(result.contact.email).toBe("john@example.com");
    expect(result.experiences.length).toBeGreaterThanOrEqual(1);
    expect(result.skills.length).toBeGreaterThanOrEqual(1);
    expect(result.sectionConfidences).toHaveProperty("contact");
    expect(result.sectionConfidences).toHaveProperty("experience");
    expect(result.sectionConfidences).toHaveProperty("skills");
  });
});
