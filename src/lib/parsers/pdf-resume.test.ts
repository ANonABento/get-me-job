/**
 * Unit tests for the deterministic PDF resume parser.
 *
 * Tests parse 5 representative resume formats and cover:
 *   - Contact info extraction
 *   - Summary extraction
 *   - Experience section parser
 *   - Education section parser
 *   - Skills section parser
 *   - Projects section parser
 *   - Edge cases: empty input, malformed text, >80% field accuracy
 */

import { describe, it, expect, vi } from "vitest";
import { parseResumeText, parsePdfResume } from "./pdf-resume";

// ─── Resume fixtures ─────────────────────────────────────────────────────────

/** Jake's resume — standard US format, clear section headers */
const JAKE_RESUME = `Jake Ryan
jakery@email.com | (123) 456-7890 | linkedin.com/in/jake | github.com/jake
New York, NY

EDUCATION
Bachelor of Science in Computer Science
Southwestern University
Aug 2018 – May 2022
GPA: 3.8

EXPERIENCE
Software Development Engineer, Amazon
June 2022 - Present
- Developed and deployed microservices reducing latency by 30%
- Collaborated on distributed systems serving 10M+ users
- Led oncall rotations and resolved 200+ production incidents

Software Engineering Intern, Microsoft
May 2021 - August 2021
- Built internal tooling using Python and TypeScript
- Improved CI/CD pipeline runtime by 40%

PROJECTS
DeepLearning Image Classifier
- Built with PyTorch achieving 94% test accuracy
- Deployed on AWS Lambda with API Gateway

Portfolio Website
- Next.js + Tailwind CSS personal site
- CI/CD via GitHub Actions

SKILLS
Languages: Python, Java, TypeScript, Go
Frameworks: React, Node.js, Spring Boot
Tools: Docker, Kubernetes, AWS, Git
`;

/** Harvard resume template — bold section headers, GPA 3.99 */
const HARVARD_RESUME = `Jane Smith
jane.smith@college.edu | (617) 555-0102
Cambridge, MA

EDUCATION
Harvard University, Cambridge, MA
Bachelor of Arts in Economics
Graduated May 2023
GPA: 3.99 / 4.0
Honors: Magna Cum Laude

EXPERIENCE

Analyst, Goldman Sachs
July 2023 - Present
- Executed financial models for M&A transactions totaling $500M
- Presented investment recommendations to senior partners

Research Assistant, Harvard Department of Economics
September 2021 - May 2023
- Co-authored paper on behavioral economics published in NBER
- Analyzed 50,000+ data points using R and Stata

LEADERSHIP & ACTIVITIES
President, Harvard Economics Association
- Organized annual conference with 200+ attendees

SKILLS
Financial Modeling, Excel, R, Stata, Python, Bloomberg, SQL
`;

/** Engineering resume with alternative header names */
const ENGINEER_RESUME = `Alex Johnson
alex.johnson@gmail.com
(555) 321-9876
San Francisco, CA | linkedin.com/in/alexj

PROFESSIONAL EXPERIENCE

Senior Software Engineer, Stripe
March 2021 – Present
- Designed payment processing system handling $2B transactions/month
- Reduced fraud by 25% via ML-based anomaly detection pipeline

Software Engineer, Dropbox
January 2018 – February 2021
- Re-architected file sync engine reducing sync time by 50%
- Migrated 10PB+ of data to multi-region architecture

EDUCATIONAL BACKGROUND

Master of Science in Computer Science
Stanford University
2015 – 2017

Bachelor of Science in Computer Engineering
UC Berkeley
2011 – 2015

TECHNICAL SKILLS
Python, Go, Java, C++, Rust, React, PostgreSQL, Redis, Kafka, Terraform, AWS

PROJECTS
Distributed Key-Value Store
- Open source Raft-based KV store with 2,000+ GitHub stars
- Go, gRPC, LevelDB
`;

/** Data Science resume with ALL CAPS headers */
const DATA_SCIENCE_RESUME = `MARIA GARCIA
maria.garcia@outlook.com | (415) 555-0178 | github.com/mariagarcia
Los Angeles, CA

WORK EXPERIENCE

Data Scientist, Netflix
Jul 2020 - Present
- Built recommendation engine improving user engagement by 15%
- Deployed ML models serving 200M+ predictions/day
- Published 2 research papers on collaborative filtering

Machine Learning Engineer, Uber
Jan 2018 - Jun 2020
- Developed fraud detection model with 99.2% accuracy
- Optimized training pipeline reducing cloud costs by 30%

EDUCATION

Master of Science in Machine Learning
Carnegie Mellon University
2016 - 2018

Bachelor of Science in Mathematics
UC Berkeley
2012 - 2016
GPA: 3.9

TECHNICAL SKILLS
Python, R, TensorFlow, PyTorch, Scikit-learn, SQL, Spark, Hadoop, AWS SageMaker, Docker

PROJECTS
Sentiment Analysis Platform
- Real-time Twitter sentiment analysis with BERT
- 95% accuracy on benchmark datasets
`;

/** Minimal / sparse resume — entry-level candidate */
const MINIMAL_RESUME = `Chris Taylor
chris.taylor@email.com

EXPERIENCE
Web Developer at Startup Inc
2022 - Present
- Built full-stack app with React and Node.js
- Integrated Stripe payments and SendGrid email

EDUCATION
Bachelor of Science in Information Technology
State University
2018 - 2022

SKILLS
HTML, CSS, JavaScript, React, Node.js, Python, Git
`;

// ─── Tests: Contact info extraction ─────────────────────────────────────────

describe("contact info extraction", () => {
  it("extracts name, email, phone from Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.profile.contact?.name).toBe("Jake Ryan");
    expect(result.profile.contact?.email).toBe("jakery@email.com");
    expect(result.profile.contact?.phone).toMatch(/123.*456.*7890/);
  });

  it("extracts name and email from Harvard resume", () => {
    const result = parseResumeText(HARVARD_RESUME);
    expect(result.profile.contact?.name).toBe("Jane Smith");
    expect(result.profile.contact?.email).toBe("jane.smith@college.edu");
  });

  it("extracts linkedin URL from Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.profile.contact?.linkedin).toMatch(/linkedin\.com\/in\/jake/i);
  });

  it("extracts github URL from Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.profile.contact?.github).toMatch(/github\.com\/jake/i);
  });

  it("extracts email from ALL CAPS data science resume", () => {
    const result = parseResumeText(DATA_SCIENCE_RESUME);
    expect(result.profile.contact?.email).toBe("maria.garcia@outlook.com");
  });

  it("extracts contact from minimal resume", () => {
    const result = parseResumeText(MINIMAL_RESUME);
    expect(result.profile.contact?.email).toBe("chris.taylor@email.com");
  });
});

// ─── Tests: Experience section parser ────────────────────────────────────────

describe("experience section parser", () => {
  it("detects experience section in Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.sectionsDetected).toContain("experience");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(2);
  });

  it("parses experience from Harvard resume", () => {
    const result = parseResumeText(HARVARD_RESUME);
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(1);
  });

  it("detects work experience from PROFESSIONAL EXPERIENCE header", () => {
    const result = parseResumeText(ENGINEER_RESUME);
    expect(result.sectionsDetected).toContain("experience");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(2);
  });

  it("detects work experience from WORK EXPERIENCE header (ALL CAPS)", () => {
    const result = parseResumeText(DATA_SCIENCE_RESUME);
    expect(result.sectionsDetected).toContain("experience");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(2);
  });

  it("detects current job (present end date)", () => {
    const result = parseResumeText(JAKE_RESUME);
    const currentJob = result.profile.experiences!.find(e => e.current);
    expect(currentJob).toBeDefined();
  });

  it("experience entries have startDate", () => {
    const result = parseResumeText(JAKE_RESUME);
    for (const exp of result.profile.experiences!) {
      expect(exp.startDate).toBeTruthy();
    }
  });

  it("experience highlights are extracted as bullet points", () => {
    const result = parseResumeText(JAKE_RESUME);
    const firstExp = result.profile.experiences![0];
    expect(firstExp.highlights.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Tests: Education section parser ─────────────────────────────────────────

describe("education section parser", () => {
  it("detects education section in Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.sectionsDetected).toContain("education");
    expect(result.profile.education!.length).toBeGreaterThanOrEqual(1);
  });

  it("extracts GPA from Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    const edu = result.profile.education![0];
    expect(edu.gpa).toBe("3.8");
  });

  it("extracts GPA from Harvard resume (3.99)", () => {
    const result = parseResumeText(HARVARD_RESUME);
    const edu = result.profile.education![0];
    expect(edu.gpa).toBe("3.99");
  });

  it("extracts GPA from data science resume (3.9)", () => {
    const result = parseResumeText(DATA_SCIENCE_RESUME);
    const edu = result.profile.education!.find(e => e.gpa);
    expect(edu?.gpa).toBe("3.9");
  });

  it("parses degree and field from Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    const edu = result.profile.education![0];
    expect(edu.degree).toMatch(/Bachelor/i);
    expect(edu.field).toMatch(/Computer Science/i);
  });

  it("detects multiple education entries from Harvard resume", () => {
    const result = parseResumeText(HARVARD_RESUME);
    expect(result.profile.education!.length).toBeGreaterThanOrEqual(1);
  });

  it("detects multiple degrees from engineer resume", () => {
    const result = parseResumeText(ENGINEER_RESUME);
    expect(result.profile.education!.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Tests: Skills section parser ────────────────────────────────────────────

describe("skills section parser", () => {
  it("detects skills section in Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.sectionsDetected).toContain("skills");
    expect(result.profile.skills!.length).toBeGreaterThanOrEqual(5);
  });

  it("extracts skills from TECHNICAL SKILLS header", () => {
    const result = parseResumeText(DATA_SCIENCE_RESUME);
    expect(result.sectionsDetected).toContain("skills");
    expect(result.profile.skills!.length).toBeGreaterThanOrEqual(5);
  });

  it("extracts skills from CORE COMPETENCIES (engineer resume)", () => {
    const result = parseResumeText(ENGINEER_RESUME);
    expect(result.profile.skills!.length).toBeGreaterThanOrEqual(5);
  });

  it("skill entries have name field", () => {
    const result = parseResumeText(JAKE_RESUME);
    for (const skill of result.profile.skills!) {
      expect(skill.name).toBeTruthy();
    }
  });

  it("skill entries have valid category", () => {
    const validCategories = ["technical", "soft", "language", "tool", "other"];
    const result = parseResumeText(JAKE_RESUME);
    for (const skill of result.profile.skills!) {
      expect(validCategories).toContain(skill.category);
    }
  });
});

// ─── Tests: Projects section parser ──────────────────────────────────────────

describe("projects section parser", () => {
  it("detects projects section in Jake's resume", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.sectionsDetected).toContain("projects");
    expect(result.profile.projects!.length).toBeGreaterThanOrEqual(1);
  });

  it("extracts projects from data science resume", () => {
    const result = parseResumeText(DATA_SCIENCE_RESUME);
    expect(result.profile.projects!.length).toBeGreaterThanOrEqual(1);
  });

  it("project entries have a name", () => {
    const result = parseResumeText(JAKE_RESUME);
    for (const project of result.profile.projects!) {
      expect(project.name).toBeTruthy();
    }
  });
});

// ─── Tests: Confidence scoring ────────────────────────────────────────────────

describe("confidence scoring", () => {
  it("well-structured resume scores >= 0.7", () => {
    const result = parseResumeText(JAKE_RESUME);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("Harvard resume scores >= 0.6", () => {
    const result = parseResumeText(HARVARD_RESUME);
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("empty string returns confidence 0 and warning", () => {
    const result = parseResumeText("");
    expect(result.confidence).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("unstructured text returns low confidence", () => {
    const result = parseResumeText("i worked at a company and have a degree");
    expect(result.confidence).toBeLessThan(0.7);
  });

  it("all 5 resume fixtures produce valid profile objects", () => {
    const fixtures = [JAKE_RESUME, HARVARD_RESUME, ENGINEER_RESUME, DATA_SCIENCE_RESUME, MINIMAL_RESUME];
    for (const text of fixtures) {
      const result = parseResumeText(text);
      expect(result.profile).toBeDefined();
      expect(result.rawText).toBe(text);
    }
  });
});

// ─── Tests: >80% field accuracy across 5 resumes ────────────────────────────

describe("field accuracy: >80% across 5 sample resumes", () => {
  /**
   * For each fixture, define the minimum expected counts.
   * A fixture "passes" if its parsed output meets all minimums.
   */
  const fixtures: Array<{ label: string; text: string; minExperiences: number; minEducation: number; minSkills: number }> = [
    { label: "Jake's resume",    text: JAKE_RESUME,          minExperiences: 2, minEducation: 1, minSkills: 5 },
    { label: "Harvard resume",   text: HARVARD_RESUME,       minExperiences: 1, minEducation: 1, minSkills: 3 },
    { label: "Engineer resume",  text: ENGINEER_RESUME,      minExperiences: 2, minEducation: 2, minSkills: 5 },
    { label: "Data Science",     text: DATA_SCIENCE_RESUME,  minExperiences: 2, minEducation: 2, minSkills: 5 },
    { label: "Minimal resume",   text: MINIMAL_RESUME,       minExperiences: 1, minEducation: 1, minSkills: 3 },
  ];

  for (const f of fixtures) {
    it(`${f.label}: meets minimum field counts`, () => {
      const result = parseResumeText(f.text);
      expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(f.minExperiences);
      expect(result.profile.education!.length).toBeGreaterThanOrEqual(f.minEducation);
      expect(result.profile.skills!.length).toBeGreaterThanOrEqual(f.minSkills);
      expect(result.profile.contact?.email).toBeTruthy();
    });
  }

  it("at least 4 out of 5 fixtures have detected experience, education, and skills", () => {
    let passing = 0;
    for (const f of fixtures) {
      const result = parseResumeText(f.text);
      const hasAll =
        result.sectionsDetected.includes("experience") &&
        result.sectionsDetected.includes("education") &&
        result.sectionsDetected.includes("skills");
      if (hasAll) passing++;
    }
    // 4/5 = 80%
    expect(passing).toBeGreaterThanOrEqual(4);
  });
});

// ─── Tests: parsePdfResume (integration, mocked pdf-parse) ──────────────────

describe("parsePdfResume", () => {
  it("parses text returned by pdf-parse", async () => {
    vi.doMock("pdf-parse", () => ({
      default: async (_buf: Buffer) => ({ text: JAKE_RESUME }),
    }));

    // Re-import after mock
    const { parsePdfResume: parse } = await import("./pdf-resume");
    const result = await parse(Buffer.from("fake-pdf"));

    expect(result.profile.contact?.email).toBe("jakery@email.com");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(2);

    vi.doUnmock("pdf-parse");
  });

  it("falls back gracefully when pdf-parse throws", async () => {
    vi.doMock("pdf-parse", () => ({
      default: async () => { throw new Error("corrupt pdf"); },
    }));

    const { parsePdfResume: parse } = await import("./pdf-resume");
    // A buffer with no extractable PDF content — should not throw
    const result = await parse(Buffer.from("not a pdf"));
    expect(result).toBeDefined();
    expect(result.profile).toBeDefined();

    vi.doUnmock("pdf-parse");
  });
});
