import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Profile } from "@/types";

// Mock only the DB functions; keep pure helpers like getDeduplicationKey real
vi.mock("@/lib/db/profile-bank", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/profile-bank")>();
  return {
    ...actual,
    deleteBankEntriesBySource: vi.fn().mockReturnValue(0),
    insertBankEntries: vi.fn().mockReturnValue([]),
  };
});

import {
  deleteBankEntriesBySource,
  insertBankEntries,
  getDeduplicationKey,
} from "@/lib/db/profile-bank";
import {
  extractBankEntries,
  extractBankEntriesFromParsedDocument,
  populateBankFromParsedDocument,
  populateBankFromProfile,
} from "./info-bank";

const TEST_USER_ID = "test-user";

describe("Info Bank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractBankEntries", () => {
    it("should extract experience entries", () => {
      const profile: Partial<Profile> = {
        experiences: [
          {
            id: "exp-1",
            company: "Acme Corp",
            title: "Senior Engineer",
            location: "NYC",
            startDate: "2020-01-01",
            endDate: "2023-06-01",
            current: false,
            description: "Built web apps",
            highlights: ["Led team of 5"],
            skills: ["React", "Node.js"],
          },
        ],
      };

      const entries = extractBankEntries(profile, "doc-1");

      // 1 experience + 1 bullet + 2 skills = 4
      expect(entries).toHaveLength(4);
      expect(entries.map((entry) => entry.sourceOrder)).toEqual([0, 1, 2, 3]);

      const expEntry = entries.find((e) => e.category === "experience");
      expect(expEntry?.content).toEqual({
        company: "Acme Corp",
        title: "Senior Engineer",
        location: "NYC",
        startDate: "2020-01-01",
        endDate: "2023-06-01",
        current: false,
        description: "Built web apps",
        highlights: [],
        childCount: 1,
        skills: ["React", "Node.js"],
      });
      expect(expEntry?.id).toEqual(expect.any(String));
      expect(expEntry?.sourceDocumentId).toBe("doc-1");
      expect(expEntry?.confidenceScore).toBe(0.9);

      const bulletEntries = entries.filter((e) => e.category === "bullet");
      expect(bulletEntries).toHaveLength(1);
      expect(bulletEntries[0].content).toMatchObject({
        description: "Led team of 5",
        context: "Senior Engineer at Acme Corp",
        company: "Acme Corp",
        role: "Senior Engineer",
        parentType: "experience",
        parentId: expEntry?.id,
        parentLabel: "Senior Engineer at Acme Corp",
        order: 0,
      });
      expect(entries.filter((e) => e.category === "achievement")).toHaveLength(
        0,
      );

      const skillEntries = entries.filter((e) => e.category === "skill");
      expect(skillEntries).toHaveLength(2);
      expect(skillEntries[0].content).toEqual({
        name: "React",
        context: "Used as Senior Engineer at Acme Corp",
        company: "Acme Corp",
        role: "Senior Engineer",
      });
    });

    it("should extract education entries", () => {
      const profile: Partial<Profile> = {
        education: [
          {
            id: "edu-1",
            institution: "MIT",
            degree: "BS",
            field: "Computer Science",
            startDate: "2016-09-01",
            endDate: "2020-05-01",
            gpa: "3.8",
            highlights: ["Dean's List"],
          },
        ],
      };

      const entries = extractBankEntries(profile);

      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe("education");
      expect(entries[0].confidenceScore).toBe(0.95);
    });

    it("should extract skill entries from profile skills", () => {
      const profile: Partial<Profile> = {
        skills: [
          {
            id: "s1",
            name: "JavaScript",
            category: "technical",
            proficiency: "expert",
          },
          { id: "s2", name: "Communication", category: "soft" },
        ],
      };

      const entries = extractBankEntries(profile);

      expect(entries).toHaveLength(2);
      expect(entries[0].content).toEqual({
        name: "JavaScript",
        category: "technical",
        proficiency: "expert",
      });
      expect(entries[1].content).toEqual({
        name: "Communication",
        category: "soft",
        proficiency: undefined,
      });
    });

    it("should extract project entries", () => {
      const profile: Partial<Profile> = {
        projects: [
          {
            id: "p1",
            name: "Portfolio",
            description: "My site",
            url: "https://example.com",
            technologies: ["React", "Next.js"],
            highlights: ["1000 visitors/day"],
          },
        ],
      };

      const entries = extractBankEntries(profile);

      expect(entries).toHaveLength(2);
      const projectEntry = entries.find(
        (entry) => entry.category === "project",
      );
      const bulletEntry = entries.find((entry) => entry.category === "bullet");
      expect(projectEntry?.content).toEqual({
        name: "Portfolio",
        description: "My site",
        url: "https://example.com",
        technologies: ["React", "Next.js"],
        highlights: [],
        childCount: 1,
      });
      expect(bulletEntry?.content).toMatchObject({
        description: "1000 visitors/day",
        context: "Portfolio",
        project: "Portfolio",
        parentType: "project",
        parentId: projectEntry?.id,
        parentLabel: "Portfolio",
        order: 0,
      });
      expect(
        entries.filter((entry) => entry.category === "achievement"),
      ).toHaveLength(0);
    });

    it("does not duplicate bullet-only descriptions on parent entries", () => {
      const profile: Partial<Profile> = {
        experiences: [
          {
            id: "exp-1",
            company: "Reazon Human Interaction Lab",
            title: "Robotics Engineer",
            startDate: "Jun 2025",
            endDate: "Aug 2025",
            current: false,
            description:
              "Designed a lightweight controller\nDeveloped a custom tracker",
            highlights: [
              "Designed a lightweight controller",
              "Developed a custom tracker",
            ],
            skills: [],
          },
        ],
      };

      const entries = extractBankEntries(profile, "doc-resume");
      const parent = entries.find((entry) => entry.category === "experience");
      const children = entries.filter((entry) => entry.category === "bullet");

      expect(parent?.content.description).toBe("");
      expect(parent?.content.childCount).toBe(2);
      expect(children).toHaveLength(2);
      expect(children.map((entry) => entry.content.parentId)).toEqual([
        parent?.id,
        parent?.id,
      ]);
    });

    it("should extract certification entries", () => {
      const profile: Partial<Profile> = {
        certifications: [
          {
            id: "c1",
            name: "AWS Solutions Architect",
            issuer: "Amazon",
            date: "2023-06-01",
            url: "https://aws.com/cert",
          },
        ],
      };

      const entries = extractBankEntries(profile);

      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe("certification");
      expect(entries[0].confidenceScore).toBe(0.95);
    });

    it("should skip empty highlights and skills", () => {
      const profile: Partial<Profile> = {
        experiences: [
          {
            id: "exp-1",
            company: "Acme",
            title: "Dev",
            startDate: "2020-01-01",
            current: true,
            description: "Coding",
            highlights: ["", "  ", "Real achievement"],
            skills: ["", "React"],
          },
        ],
      };

      const entries = extractBankEntries(profile);

      const bullets = entries.filter((e) => e.category === "bullet");
      expect(bullets).toHaveLength(1);
      expect(bullets[0].content.description).toBe("Real achievement");
      expect(entries.filter((e) => e.category === "achievement")).toHaveLength(
        0,
      );

      const skills = entries.filter((e) => e.category === "skill");
      expect(skills).toHaveLength(1);
      expect(skills[0].content.name).toBe("React");
    });

    it("should return empty array for empty profile", () => {
      const entries = extractBankEntries({});
      expect(entries).toHaveLength(0);
    });
  });

  describe("getDeduplicationKey", () => {
    it("should generate key for experience", () => {
      const key = getDeduplicationKey("experience", {
        company: "Acme",
        title: "Engineer",
      });
      expect(key).toBe("acme|engineer");
    });

    it("should generate key for skill", () => {
      const key = getDeduplicationKey("skill", { name: "React" });
      expect(key).toBe("react");
    });

    it("should generate key for education", () => {
      const key = getDeduplicationKey("education", {
        institution: "MIT",
        degree: "BS",
      });
      expect(key).toBe("mit|bs");
    });

    it("should generate key for project", () => {
      const key = getDeduplicationKey("project", { name: "Portfolio" });
      expect(key).toBe("portfolio");
    });

    it("should generate key for certification", () => {
      const key = getDeduplicationKey("certification", {
        name: "AWS SA",
        issuer: "Amazon",
      });
      expect(key).toBe("aws sa|amazon");
    });

    it("should generate key for achievement", () => {
      const key = getDeduplicationKey("achievement", {
        description: "Led team of 5 engineers",
      });
      expect(key).toBe("led team of 5 engineers");
    });

    it("should generate key for paragraph text", () => {
      const key = getDeduplicationKey("paragraph", {
        text: "I build reliable onboarding systems.",
      });
      expect(key).toBe("i build reliable onboarding systems.");
    });
  });

  describe("extractBankEntriesFromParsedDocument", () => {
    it("creates paragraph and selling-point entries from cover letters", () => {
      const entries = extractBankEntriesFromParsedDocument(
        {
          docType: "cover_letter",
          data: {
            targetCompany: "Acme",
            targetPosition: "Product Engineer",
            reusableParagraphs: [
              "I build onboarding systems that improve activation.",
            ],
            keySellingPoints: ["Improved activation by 22%"],
            tone: "professional",
          },
        },
        "doc-cover",
      );

      expect(entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "paragraph",
            sourceDocumentId: "doc-cover",
            sourceSection: "cover_letter",
            content: expect.objectContaining({
              text: "I build onboarding systems that improve activation.",
              targetCompany: "Acme",
              targetPosition: "Product Engineer",
              tone: "professional",
              relatedSellingPoints: ["Improved activation by 22%"],
            }),
          }),
          expect.objectContaining({
            category: "bullet",
            content: expect.objectContaining({
              description: "Improved activation by 22%",
            }),
          }),
        ]),
      );
    });

    it("creates project parents, bullet children, and explicit stack skills from portfolios", () => {
      const entries = extractBankEntriesFromParsedDocument(
        {
          docType: "portfolio",
          data: {
            projects: [
              {
                name: "Launch Metrics",
                description: "Analytics portfolio project",
                url: "https://github.com/ada/launch-metrics",
                technologies: ["Next.js", "PostgreSQL"],
                proofPoints: ["Reduced reporting latency by 45%"],
                bullets: ["Built dashboards for 12,000 users"],
              },
            ],
            links: ["https://github.com/ada/launch-metrics"],
            caseStudies: ["Launch Metrics"],
            technologies: [],
            proofPoints: [],
          },
        },
        "doc-portfolio",
      );

      const project = entries.find((entry) => entry.category === "project");
      const bulletChildren = entries.filter(
        (entry) => entry.category === "bullet",
      );

      expect(project?.content).toMatchObject({
        name: "Launch Metrics",
        url: "https://github.com/ada/launch-metrics",
        technologies: ["Next.js", "PostgreSQL"],
        childCount: 2,
      });
      expect(bulletChildren).toHaveLength(2);
      expect(bulletChildren[0].content).toMatchObject({
        parentType: "project",
        parentId: project?.id,
        parentLabel: "Launch Metrics",
      });
      expect(entries.filter((entry) => entry.category === "skill")).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.objectContaining({ name: "Next.js" }),
          }),
          expect.objectContaining({
            content: expect.objectContaining({ name: "PostgreSQL" }),
          }),
        ]),
      );
    });

    it("creates lower-confidence components from career notes", () => {
      const entries = extractBankEntriesFromParsedDocument(
        {
          docType: "career_notes",
          data: {
            paragraphs: ["Reusable paragraph from a work log."],
            bullets: ["Improved onboarding completion by 18%"],
            achievements: ["Improved onboarding completion by 18%"],
            projects: [],
            skills: ["React"],
          },
        },
        "doc-notes",
      );

      expect(entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "paragraph",
            confidenceScore: 0.62,
          }),
          expect.objectContaining({
            category: "bullet",
            confidenceScore: 0.58,
          }),
          expect.objectContaining({
            category: "achievement",
            confidenceScore: 0.6,
          }),
        ]),
      );
      expect(
        entries.every(
          (entry) =>
            typeof entry.confidenceScore === "number" &&
            entry.confidenceScore < 0.9,
        ),
      ).toBe(true);
    });
  });

  describe("populateBankFromProfile", () => {
    it("replaces entries from the same source document before inserting parsed entries", () => {
      (insertBankEntries as ReturnType<typeof vi.fn>).mockReturnValue([
        "id1",
        "id2",
      ]);

      const profile: Partial<Profile> = {
        skills: [
          { id: "s1", name: "React", category: "technical" },
          { id: "s2", name: "Node.js", category: "technical" },
        ],
      };

      const result = populateBankFromProfile(profile, "doc-1", TEST_USER_ID);

      expect(result.inserted).toBe(2);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(deleteBankEntriesBySource).toHaveBeenCalledWith(
        "doc-1",
        TEST_USER_ID,
      );
      expect(insertBankEntries).toHaveBeenCalled();
    });

    it("does not dedupe entries by content", () => {
      (insertBankEntries as ReturnType<typeof vi.fn>).mockReturnValue(["id1"]);

      const profile: Partial<Profile> = {
        skills: [
          {
            id: "s1",
            name: "React",
            category: "technical",
            proficiency: "expert",
          },
        ],
      };

      const result = populateBankFromProfile(profile, "doc-2", TEST_USER_ID);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(insertBankEntries).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            category: "skill",
            content: {
              name: "React",
              category: "technical",
              proficiency: "expert",
            },
          }),
        ]),
        TEST_USER_ID,
      );
    });

    it("should handle empty profile", () => {
      const result = populateBankFromProfile({}, undefined, TEST_USER_ID);

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(insertBankEntries).not.toHaveBeenCalled();
    });

    it("replaces entries from the same source document before inserting parsed career-document entries", () => {
      const result = populateBankFromParsedDocument(
        {
          docType: "cover_letter",
          data: {
            reusableParagraphs: ["A reusable paragraph."],
            keySellingPoints: [],
          },
        },
        "doc-cover",
        TEST_USER_ID,
      );

      expect(result.inserted).toBe(1);
      expect(deleteBankEntriesBySource).toHaveBeenCalledWith(
        "doc-cover",
        TEST_USER_ID,
      );
      expect(insertBankEntries).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ category: "paragraph" }),
        ]),
        TEST_USER_ID,
      );
    });
  });
});
