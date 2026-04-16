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
import { detectSections, type Section, type SectionType } from "./section-detector";

/** Helper: get section types from result */
function sectionTypes(sections: Section[]): SectionType[] {
  return sections.map((s) => s.type);
}

/** Helper: get section by type */
function findSection(sections: Section[], type: SectionType): Section | undefined {
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
          sections[i - 1].startIndex
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
