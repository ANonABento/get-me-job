/**
 * Integration tests for the upload → parse → bank pipeline.
 *
 * Tests the full flow: resume text → smart parser → section detection →
 * field extraction → bank entry creation.
 *
 * Only mocks: LLM client and DB layer. All parsing logic runs for real.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LLMConfig } from "@/types";

// ─── Mocks ─────────────────────────────────────────────────────────────

const mockComplete = vi.fn();

vi.mock("@/lib/llm/client", () => ({
  LLMClient: class MockLLMClient {
    complete = mockComplete;
  },
  parseJSONFromLLM: vi.fn((response: string) => JSON.parse(response)),
}));

// Partial mock: keep pure helpers real (getDeduplicationKey), mock DB calls
vi.mock("@/lib/db/profile-bank", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/profile-bank")>();
  return {
    ...actual,
    findDuplicateEntry: vi.fn().mockReturnValue(null),
    updateBankEntry: vi.fn(),
    deleteBankEntriesBySource: vi.fn().mockReturnValue(0),
    insertBankEntries: vi.fn().mockImplementation((entries) =>
      entries.map((_: unknown, i: number) => `bank-id-${i}`)
    ),
  };
});

// Import after mocks
import { smartParseResume } from "../smart-parser";
import { extractBankEntries, populateBankFromProfile } from "@/lib/resume/info-bank";
import {
  findDuplicateEntry,
  updateBankEntry,
  deleteBankEntriesBySource,
  insertBankEntries,
  getDeduplicationKey,
} from "@/lib/db/profile-bank";

// ─── Fixtures: 3+ diverse resume formats ────────────────────────────────

/** Standard US-style resume with clear section headers */
const STANDARD_RESUME = `John Doe
john.doe@email.com | (555) 123-4567
San Francisco, CA
linkedin.com/in/johndoe | github.com/johndoe

EXPERIENCE
Senior Software Engineer at Google
Jan 2021 - Present
- Led migration of payment system to microservices architecture
- Reduced API latency by 40% through caching optimization
- Mentored 3 junior engineers

Software Engineer at Meta
Jun 2018 - Dec 2020
- Built React components used by 100M+ users
- Implemented real-time notification system

EDUCATION
Bachelor of Science in Computer Science
Stanford University
2014 - 2018
GPA: 3.85

SKILLS
JavaScript, TypeScript, Python, Go, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL

PROJECTS
Open Source CLI Tool
- Built a CLI tool for automating deployment pipelines
- Technologies: Go, Docker, GitHub Actions
`;

/** Resume with alternative section headers and different formatting */
const ALTERNATIVE_FORMAT_RESUME = `Jane Smith
jane.smith@gmail.com
(212) 555-0199
New York, NY 10001

PROFESSIONAL EXPERIENCE

Product Manager, Stripe
March 2022 - Present
- Launched 3 new payment features generating $2M ARR
- Led cross-functional team of 8 engineers and 2 designers

Business Analyst, Goldman Sachs
September 2019 - February 2022
- Automated reporting pipeline saving 20 hours/week
- Presented quarterly analytics to C-suite

ACADEMIC BACKGROUND
Master of Business Administration
Harvard Business School
2017 - 2019

Bachelor of Arts in Economics
NYU Stern School of Business
2013 - 2017
GPA: 3.7

CORE COMPETENCIES
Product Strategy, Data Analysis, SQL, Python, Tableau, Agile, Scrum, User Research

CERTIFICATIONS
PMP Certification, PMI, 2023
AWS Cloud Practitioner, Amazon, 2022
`;

/** Minimal / sparse resume with few sections */
const MINIMAL_RESUME = `Alex Johnson
alex@example.com

EXPERIENCE
Web Developer at Startup Inc
2022 - Present
- Full stack development with React and Node.js

SKILLS
HTML, CSS, JavaScript, React, Node.js
`;

/** Resume with ALL CAPS headers and dense formatting */
const ALL_CAPS_RESUME = `MARIA GARCIA
maria.garcia@outlook.com | (415) 555-0178
Los Angeles, CA

WORK EXPERIENCE

Data Scientist at Netflix
Jul 2020 - Present
- Built recommendation engine improving user engagement by 15%
- Deployed ML models serving 200M+ predictions/day
- Published 2 research papers on collaborative filtering

Machine Learning Engineer at Uber
Jan 2018 - Jun 2020
- Developed fraud detection system with 99.2% accuracy
- Optimized model training pipeline reducing costs by 30%

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

/** Poorly formatted text with no clear sections */
const UNSTRUCTURED_RESUME = `worked at various companies doing software development and have a computer science degree from a university`;

/** Resume with duplicate skills across sections */
const RESUME_WITH_OVERLAPPING_SKILLS = `Chris Taylor
chris@dev.com

EXPERIENCE
Full Stack Developer at TechCo
2021 - Present
- Built REST APIs with Node.js and TypeScript
- Frontend development using React and TypeScript

SKILLS
TypeScript, React, Node.js, Python, Docker
`;

const llmConfig: LLMConfig = {
  provider: "openai",
  apiKey: "test-key",
  model: "gpt-4",
};

// ─── Tests ──────────────────────────────────────────────────────────────

describe("Pipeline Integration: upload → parse → bank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (findDuplicateEntry as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  // ── Full pipeline tests ─────────────────────────────────────────────

  describe("full pipeline: parse → extract → bank entries", () => {
    it("standard resume: parses all sections and creates correct bank entries", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);

      // High confidence, no LLM needed
      expect(parseResult.confidence).toBeGreaterThanOrEqual(0.7);
      expect(parseResult.llmUsed).toBe(false);

      // Verify sections detected
      expect(parseResult.sectionsDetected).toContain("experience");
      expect(parseResult.sectionsDetected).toContain("education");
      expect(parseResult.sectionsDetected).toContain("skills");

      // Extract bank entries from parsed profile
      const entries = extractBankEntries(parseResult.profile, "doc-standard");

      // Should have: experiences + achievements + skills + education + projects
      expect(entries.length).toBeGreaterThanOrEqual(5);

      // Verify experience entries exist
      const expEntries = entries.filter((e) => e.category === "experience");
      expect(expEntries.length).toBeGreaterThanOrEqual(1);
      expect(expEntries[0].sourceDocumentId).toBe("doc-standard");

      // Verify education entries
      const eduEntries = entries.filter((e) => e.category === "education");
      expect(eduEntries.length).toBeGreaterThanOrEqual(1);

      // Verify skill entries
      const skillEntries = entries.filter((e) => e.category === "skill");
      expect(skillEntries.length).toBeGreaterThanOrEqual(4);

      // Verify all entries have sourceDocumentId
      for (const entry of entries) {
        expect(entry.sourceDocumentId).toBe("doc-standard");
      }
    });

    it("alternative format resume: handles different header names", async () => {
      const parseResult = await smartParseResume(ALTERNATIVE_FORMAT_RESUME);

      expect(parseResult.sectionsDetected).toContain("experience");
      expect(parseResult.profile.experiences!.length).toBeGreaterThanOrEqual(1);

      const entries = extractBankEntries(parseResult.profile, "doc-alt");

      // Certifications may or may not be parsed deterministically from this format
      // but other entries must be present
      const expEntries = entries.filter((e) => e.category === "experience");
      expect(expEntries.length).toBeGreaterThanOrEqual(1);

      const eduEntries = entries.filter((e) => e.category === "education");
      expect(eduEntries.length).toBeGreaterThanOrEqual(1);
    });

    it("ALL CAPS resume: detects sections with uppercase headers", async () => {
      const parseResult = await smartParseResume(ALL_CAPS_RESUME);

      expect(parseResult.sectionsDetected).toContain("experience");
      expect(parseResult.sectionsDetected).toContain("education");
      expect(parseResult.sectionsDetected).toContain("skills");

      const entries = extractBankEntries(parseResult.profile, "doc-caps");
      const expEntries = entries.filter((e) => e.category === "experience");
      expect(expEntries.length).toBeGreaterThanOrEqual(1);

      // Check an experience entry has correct structure
      const firstExp = expEntries[0];
      expect(firstExp.content).toHaveProperty("company");
      expect(firstExp.content).toHaveProperty("title");
      expect(firstExp.confidenceScore).toBe(0.9);
    });

    it("minimal resume: extracts what it can from sparse input", async () => {
      const parseResult = await smartParseResume(MINIMAL_RESUME);

      expect(parseResult.profile.contact?.name).toBe("Alex Johnson");
      expect(parseResult.profile.contact?.email).toBe("alex@example.com");

      const entries = extractBankEntries(parseResult.profile, "doc-minimal");

      // At least experience + skills
      const expEntries = entries.filter((e) => e.category === "experience");
      expect(expEntries.length).toBeGreaterThanOrEqual(1);

      const skillEntries = entries.filter((e) => e.category === "skill");
      expect(skillEntries.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── Fallback behavior ───────────────────────────────────────────────

  describe("fallback: unstructured text → raw entry", () => {
    it("unstructured text: returns low confidence and warnings", async () => {
      const parseResult = await smartParseResume(UNSTRUCTURED_RESUME);

      expect(parseResult.confidence).toBeLessThan(0.7);
      expect(parseResult.warnings.length).toBeGreaterThan(0);
      expect(parseResult.llmUsed).toBe(false);

      // Profile still created, just sparse
      expect(parseResult.profile).toBeDefined();
      expect(parseResult.profile.rawText).toBe(UNSTRUCTURED_RESUME);
    });

    it("unstructured text with LLM: attempts LLM or returns low confidence", async () => {
      mockComplete.mockResolvedValueOnce(
        JSON.stringify({
          experience: [
            {
              company: "Various Companies",
              title: "Software Developer",
              startDate: "unknown",
              description: "software development",
              highlights: [],
            },
          ],
        })
      );

      const parseResult = await smartParseResume(UNSTRUCTURED_RESUME, llmConfig);

      // With unstructured text, parser either:
      // 1. Calls LLM for low-confidence sections, OR
      // 2. Returns low confidence with no LLM-eligible sections
      expect(parseResult.profile).toBeDefined();
      expect(parseResult.confidence).toBeLessThan(0.7);
      expect(parseResult.profile.rawText).toBe(UNSTRUCTURED_RESUME);
    });

    it("empty text: produces empty bank entries", async () => {
      const parseResult = await smartParseResume("");

      const entries = extractBankEntries(parseResult.profile);
      expect(entries).toHaveLength(0);
    });
  });

  // ── Source Replacement ──────────────────────────────────────────────

  describe("source replacement: duplicate content is allowed across uploads", () => {
    it("inserts duplicate content from a different source document", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);

      const result1 = populateBankFromProfile(parseResult.profile, "doc-1");
      expect(result1.inserted).toBeGreaterThan(0);
      expect(result1.skipped).toBe(0);

      (findDuplicateEntry as ReturnType<typeof vi.fn>).mockImplementation(
        (category, contentKey) => ({
          id: `existing-${contentKey}`,
          userId: "default",
          category,
          content: {},
          confidenceScore: 0.95,
          createdAt: "2024-01-01",
        })
      );

      const result2 = populateBankFromProfile(parseResult.profile, "doc-2");
      expect(result2.inserted).toBeGreaterThan(0);
      expect(result2.skipped).toBe(0);
      expect(updateBankEntry).not.toHaveBeenCalled();
      expect(insertBankEntries).toHaveBeenCalled();
    });

    it("replaces entries from the same source document before inserting fresh parse output", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);

      (findDuplicateEntry as ReturnType<typeof vi.fn>).mockImplementation(
        (category, contentKey) => ({
          id: `existing-${contentKey}`,
          userId: "default",
          category,
          content: {},
          confidenceScore: 0.5, // Lower than all new entries
          createdAt: "2024-01-01",
        })
      );

      const result = populateBankFromProfile(parseResult.profile, "doc-new");
      expect(result.updated).toBe(0);
      expect(result.inserted).toBeGreaterThan(0);
      expect(deleteBankEntriesBySource).toHaveBeenCalledWith("doc-new", "default");
      expect(updateBankEntry).not.toHaveBeenCalled();
    });

    it("dedup keys are consistent for same content", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      // Generate dedup keys twice — should be identical
      for (const entry of entries) {
        const key1 = getDeduplicationKey(entry.category, entry.content);
        const key2 = getDeduplicationKey(entry.category, entry.content);
        expect(key1).toBe(key2);
        expect(key1.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Category assignment ─────────────────────────────────────────────

  describe("category assignment: entries have correct categories", () => {
    it("experience entries have category 'experience'", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      const expEntries = entries.filter((e) => e.category === "experience");
      for (const entry of expEntries) {
        expect(entry.content).toHaveProperty("company");
        expect(entry.content).toHaveProperty("title");
        expect(entry.confidenceScore).toBe(0.9);
      }
    });

    it("achievement entries extracted from experience highlights", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      const achievementEntries = entries.filter((e) => e.category === "achievement");
      for (const entry of achievementEntries) {
        expect(entry.content).toHaveProperty("description");
        expect(entry.content).toHaveProperty("context");
        expect(entry.confidenceScore).toBe(0.85);
      }
    });

    it("skill entries from experience have usage context", async () => {
      const parseResult = await smartParseResume(RESUME_WITH_OVERLAPPING_SKILLS);
      const entries = extractBankEntries(parseResult.profile);

      // Skills from experience section should have context
      const contextualSkills = entries.filter(
        (e) => e.category === "skill" && e.content.context
      );
      for (const skill of contextualSkills) {
        expect(skill.content).toHaveProperty("company");
        expect(skill.content).toHaveProperty("role");
      }
    });

    it("standalone skill entries have name and category", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      // Skills from the SKILLS section (not from experience)
      const standaloneSkills = entries.filter(
        (e) => e.category === "skill" && !e.content.context
      );
      for (const skill of standaloneSkills) {
        expect(skill.content).toHaveProperty("name");
        expect(typeof skill.content.name).toBe("string");
      }
    });

    it("education entries have correct confidence score", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      const eduEntries = entries.filter((e) => e.category === "education");
      for (const entry of eduEntries) {
        expect(entry.confidenceScore).toBe(0.95);
        expect(entry.content).toHaveProperty("institution");
        expect(entry.content).toHaveProperty("degree");
      }
    });

    it("all entries have valid categories from BANK_CATEGORIES", async () => {
      const validCategories = [
        "experience",
        "skill",
        "project",
        "education",
        "achievement",
        "certification",
      ];

      const parseResult = await smartParseResume(ALL_CAPS_RESUME);
      const entries = extractBankEntries(parseResult.profile, "doc-test");

      for (const entry of entries) {
        expect(validCategories).toContain(entry.category);
      }
    });
  });

  // ── sourceDocumentId tracking ───────────────────────────────────────

  describe("sourceDocumentId: entries link back to source", () => {
    it("all bank entries reference the source document", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const docId = "doc-upload-123";
      const entries = extractBankEntries(parseResult.profile, docId);

      for (const entry of entries) {
        expect(entry.sourceDocumentId).toBe(docId);
      }
    });

    it("entries without sourceDocumentId have undefined", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);
      const entries = extractBankEntries(parseResult.profile);

      for (const entry of entries) {
        expect(entry.sourceDocumentId).toBeUndefined();
      }
    });
  });

  // ── Contact extraction across formats ───────────────────────────────

  describe("contact extraction: works across diverse formats", () => {
    it("extracts email and phone from standard format", async () => {
      const result = await smartParseResume(STANDARD_RESUME);
      expect(result.profile.contact?.email).toBe("john.doe@email.com");
      expect(result.profile.contact?.phone).toMatch(/555.*123.*4567/);
    });

    it("extracts contact from alternative format", async () => {
      const result = await smartParseResume(ALTERNATIVE_FORMAT_RESUME);
      expect(result.profile.contact?.email).toBe("jane.smith@gmail.com");
      expect(result.profile.contact?.name).toBe("Jane Smith");
    });

    it("extracts contact from ALL CAPS resume", async () => {
      const result = await smartParseResume(ALL_CAPS_RESUME);
      expect(result.profile.contact?.email).toBe("maria.garcia@outlook.com");
    });
  });

  // ── End-to-end with populateBankFromProfile ────────────────────────

  describe("end-to-end: parse → populate bank with dedup", () => {
    it("populates bank from a full parse result", async () => {
      const parseResult = await smartParseResume(STANDARD_RESUME);

      const result = populateBankFromProfile(
        parseResult.profile,
        "doc-e2e-1"
      );

      expect(result.inserted).toBeGreaterThan(0);
      expect(insertBankEntries).toHaveBeenCalled();

      // Verify the entries passed to insertBankEntries have correct shape
      const insertCall = (insertBankEntries as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const insertedEntries = insertCall[0];
      for (const entry of insertedEntries) {
        expect(entry).toHaveProperty("category");
        expect(entry).toHaveProperty("content");
        expect(entry).toHaveProperty("confidenceScore");
        expect(entry.sourceDocumentId).toBe("doc-e2e-1");
      }
    });

    it("handles two different resumes without false dedup", async () => {
      // Parse two different resumes
      const result1 = await smartParseResume(STANDARD_RESUME);
      const result2 = await smartParseResume(ALL_CAPS_RESUME);

      // First upload
      const bank1 = populateBankFromProfile(result1.profile, "doc-1");
      expect(bank1.inserted).toBeGreaterThan(0);

      // Second upload — no duplicates since different people
      const bank2 = populateBankFromProfile(result2.profile, "doc-2");
      expect(bank2.inserted).toBeGreaterThan(0);
      // Should not have skipped anything (different content)
      expect(bank2.skipped).toBe(0);
    });
  });
});
