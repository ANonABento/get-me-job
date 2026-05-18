import { describe, it, expect } from "vitest";
import {
  detectSections,
  type Section,
  type SectionType,
} from "./section-detector";

/** Helper: get section types from result */
function sectionTypes(sections: Section[]): SectionType[] {
  return sections.map((s) => s.type);
}

/** Helper: get section by type */
function findSection(
  sections: Section[],
  type: SectionType,
): Section | undefined {
  return sections.find((s) => s.type === type);
}

describe("detectSections", () => {
  describe("empty / non-resume input", () => {
    it("returns empty array for empty string", () => {
      expect(detectSections("")).toEqual([]);
    });

    it("returns empty array for whitespace-only", () => {
      expect(detectSections("   \n\n  ")).toEqual([]);
    });

    it("returns empty array for non-resume text", () => {
      const text = `
The quick brown fox jumps over the lazy dog.
This is a random paragraph about nothing in particular.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      `.trim();
      expect(detectSections(text)).toEqual([]);
    });
  });

  describe("standard formatted resume with clear headers", () => {
    const standardResume = `John Smith
john.smith@email.com | (555) 123-4567
San Francisco, CA | linkedin.com/in/johnsmith

SUMMARY
Experienced software engineer with 8+ years building scalable web applications.

EXPERIENCE
Senior Software Engineer, Google
Jan 2020 - Present
- Led team of 5 engineers building microservices
- Improved API latency by 40%

Software Engineer, Meta
Jun 2016 - Dec 2019
- Built React components used by 1M+ users
- Mentored 3 junior developers

EDUCATION
B.S. Computer Science, Stanford University
2012 - 2016
GPA: 3.9

SKILLS
JavaScript, TypeScript, React, Node.js, Python, Go, AWS, Docker, Kubernetes

PROJECTS
Open Source CLI Tool
- Built a developer productivity tool with 500+ GitHub stars
- Technologies: Rust, WebAssembly`;

    it("detects all major sections", () => {
      const sections = detectSections(standardResume);
      const types = sectionTypes(sections);

      expect(types).toContain("contact");
      expect(types).toContain("summary");
      expect(types).toContain("experience");
      expect(types).toContain("education");
      expect(types).toContain("skills");
      expect(types).toContain("projects");
    });

    it("returns sections ordered by position", () => {
      const sections = detectSections(standardResume);
      for (let i = 1; i < sections.length; i++) {
        expect(sections[i].startIndex).toBeGreaterThanOrEqual(
          sections[i - 1].startIndex,
        );
      }
    });

    it("contact section contains email and phone", () => {
      const sections = detectSections(standardResume);
      const contact = findSection(sections, "contact");
      expect(contact).toBeDefined();
      expect(contact!.content).toContain("john.smith@email.com");
      expect(contact!.content).toContain("555");
    });

    it("experience section contains job details", () => {
      const sections = detectSections(standardResume);
      const experience = findSection(sections, "experience");
      expect(experience).toBeDefined();
      expect(experience!.content).toContain("Google");
      expect(experience!.content).toContain("Meta");
    });

    it("skills section contains technologies", () => {
      const sections = detectSections(standardResume);
      const skills = findSection(sections, "skills");
      expect(skills).toBeDefined();
      expect(skills!.content).toContain("JavaScript");
      expect(skills!.content).toContain("TypeScript");
    });

    it("detects a projects header even when PDF link annotations attach to it", () => {
      const text = `Kevin Jiang
k69jiang@uwaterloo.ca

EXPERIENCE
Robotics Engineer — Reazon Human Interaction Lab | Jun 2025 — Aug 2025
• Built an interactive Three.js web interface

PROJECTS 🔗 https://docs.google.com/document/u/0/d/example/edit
One Handed Keyboard | C | STM32 | GPIO | UART | FSM | 3D-Printing | OnShape 🔗 https://github.com/ANonABento/SeqKeyTransmitter
• Engineered a low-cost, wrist-mounted texting device

EDUCATION
University of Waterloo — BASc in Computer Engineering | Sept 2024 - Present`;

      const sections = detectSections(text);
      const types = sectionTypes(sections);

      expect(types).toEqual(
        expect.arrayContaining(["experience", "projects", "education"]),
      );
      expect(findSection(sections, "experience")!.content).not.toContain(
        "One Handed Keyboard",
      );
      expect(findSection(sections, "projects")!.content).toContain(
        "One Handed Keyboard",
      );
    });

    it("keeps repeated section headers as separate boundaries", () => {
      const text = `Alex Lee
alex@example.com

EXPERIENCE
Engineer | Acme | Jan 2020 - Present
- Built x

EDUCATION
B.S. in Computer Science
State University
2020 - 2024

ADDITIONAL EXPERIENCE
Volunteer | Community Lab | Jan 2021 - Jan 2022
- Helped y`;

      const sections = detectSections(text);
      const experienceSections = sections.filter(
        (section) => section.type === "experience",
      );

      expect(experienceSections).toHaveLength(2);
      expect(findSection(sections, "education")!.content).not.toContain(
        "ADDITIONAL EXPERIENCE",
      );
    });

    it("recognizes portfolio as a projects section instead of folding it into skills", () => {
      const text = `Alex Lee
alex@example.com

SKILLS
TypeScript, React, SQL

PORTFOLIO
Launch Tracker | Next.js | https://launch.example.dev
- Built a dashboard`;

      const sections = detectSections(text);

      expect(sectionTypes(sections)).toContain("projects");
      expect(findSection(sections, "skills")!.content).not.toContain(
        "Launch Tracker",
      );
      expect(findSection(sections, "projects")!.content).toContain(
        "Launch Tracker",
      );
    });
  });

  describe("resume with alternative headers", () => {
    const alternativeResume = `Jane Doe
jane@example.com

PROFESSIONAL EXPERIENCE
Product Manager, Amazon
Mar 2021 - Present
- Launched 3 products generating $10M ARR

ACADEMIC BACKGROUND
M.B.A., Harvard Business School
2019 - 2021

CORE COMPETENCIES
Strategy, Product Management, Data Analysis, SQL, Agile, Scrum

CERTIFICATIONS
PMP Certification, PMI, 2022
AWS Solutions Architect, Amazon, 2021

AWARDS
Employee of the Year, Amazon, 2023`;

    it("recognizes alternative section headers", () => {
      const sections = detectSections(alternativeResume);
      const types = sectionTypes(sections);

      expect(types).toContain("experience");
      expect(types).toContain("education");
      expect(types).toContain("skills");
      expect(types).toContain("certifications");
      expect(types).toContain("awards");
    });

    it("certifications section has certification content", () => {
      const sections = detectSections(alternativeResume);
      const certs = findSection(sections, "certifications");
      expect(certs).toBeDefined();
      expect(certs!.content).toContain("PMP");
    });
  });

  describe("resume with mixed case and formatting", () => {
    const mixedCaseResume = `MARIA GARCIA
maria.garcia@gmail.com | 415-555-9876

Summary
Full-stack developer with 5 years of experience in React and Node.js.

Work Experience
Lead Developer, Startup Inc
January 2022 - Present
- Architected microservices platform
- Reduced deployment time by 60%

Education
Bachelor of Science in Computer Science
MIT, 2017

Skills
React, Vue.js, Angular, Node.js, Express, PostgreSQL, MongoDB

Languages
English (Native), Spanish (Fluent), French (Intermediate)`;

    it("handles mixed case headers", () => {
      const sections = detectSections(mixedCaseResume);
      const types = sectionTypes(sections);

      expect(types).toContain("summary");
      expect(types).toContain("experience");
      expect(types).toContain("education");
      expect(types).toContain("skills");
      expect(types).toContain("languages");
    });

    it("languages section has language content", () => {
      const sections = detectSections(mixedCaseResume);
      const languages = findSection(sections, "languages");
      expect(languages).toBeDefined();
      expect(languages!.content).toContain("English");
      expect(languages!.content).toContain("Spanish");
    });
  });

  describe("resume with no clear headers (content heuristics)", () => {
    const noHeaderResume = `Alex Johnson
alex.j@company.com
(212) 555-0100
github.com/alexj

Software Engineer at Netflix
June 2021 - Present
- Built recommendation engine serving 200M users
- Implemented A/B testing framework

Backend Developer at Uber
March 2018 - May 2021
- Designed REST APIs handling 100K req/s
- Led database migration project

B.S. Computer Science, UC Berkeley
2014 - 2018
GPA: 3.7

Python, Java, Go, Kubernetes, Terraform, Redis, PostgreSQL`;

    it("detects contact info at the top", () => {
      const sections = detectSections(noHeaderResume);
      const contact = findSection(sections, "contact");
      expect(contact).toBeDefined();
      expect(contact!.content).toContain("alex.j@company.com");
    });

    it("detects experience from date patterns + bullets", () => {
      const sections = detectSections(noHeaderResume);
      const experience = findSection(sections, "experience");
      expect(experience).toBeDefined();
      expect(experience!.content).toContain("Netflix");
    });

    it("detects education from degree keywords", () => {
      const sections = detectSections(noHeaderResume);
      const education = findSection(sections, "education");
      expect(education).toBeDefined();
      expect(education!.content).toContain("UC Berkeley");
    });

    it("detects skills from comma-separated list", () => {
      const sections = detectSections(noHeaderResume);
      const skills = findSection(sections, "skills");
      expect(skills).toBeDefined();
      expect(skills!.content).toContain("Python");
    });
  });

  describe("resume with references section", () => {
    const referencesResume = `Pat Lee
pat@email.com

EXPERIENCE
Manager, Corp Inc
2020 - Present
- Led operations team

REFERENCES
Available upon request`;

    it("detects references section", () => {
      const sections = detectSections(referencesResume);
      const refs = findSection(sections, "references");
      expect(refs).toBeDefined();
      expect(refs!.content).toContain("Available upon request");
    });
  });

  describe("section content integrity", () => {
    const resume = `Name Here
email@test.com

EXPERIENCE
Job 1 at Company A
2020 - Present
- Did things

EDUCATION
B.S. CS, Some University
2016 - 2020`;

    it("each section has non-empty content", () => {
      const sections = detectSections(resume);
      for (const section of sections) {
        expect(section.content.trim().length).toBeGreaterThan(0);
      }
    });

    it("sections have valid startIndex and endIndex", () => {
      const sections = detectSections(resume);
      for (const section of sections) {
        expect(section.startIndex).toBeGreaterThanOrEqual(0);
        expect(section.endIndex).toBeGreaterThan(section.startIndex);
        expect(section.endIndex).toBeLessThanOrEqual(resume.length);
      }
    });

    it("sections don't have duplicate types", () => {
      const sections = detectSections(resume);
      const types = sectionTypes(sections);
      expect(new Set(types).size).toBe(types.length);
    });
  });

  describe("edge cases", () => {
    it("handles single-line resume-like text", () => {
      const sections = detectSections("John Doe john@email.com");
      // Should not crash; may or may not detect contact
      expect(Array.isArray(sections)).toBe(true);
    });

    it("handles resume with trailing colons on headers", () => {
      const resume = `Tom Brown
tom@email.com

Experience:
Developer at Corp
2021 - Present
- Built things

Education:
B.S. CS, University
2017 - 2021`;

      const sections = detectSections(resume);
      const types = sectionTypes(sections);
      expect(types).toContain("experience");
      expect(types).toContain("education");
    });

    it("handles resume with dashed underlines after headers", () => {
      const resume = `Sam Wilson
sam@email.com

SKILLS
------
JavaScript, Python, Go, Rust, C++

EXPERIENCE
----------
Engineer at BigCo
2020 - Present
- Built stuff`;

      const sections = detectSections(resume);
      const types = sectionTypes(sections);
      expect(types).toContain("skills");
      expect(types).toContain("experience");
    });
  });
});
