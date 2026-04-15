import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Profile } from "@/types";

// Mock only the DB functions; keep pure helpers like getDeduplicationKey real
vi.mock("@/lib/db/profile-bank", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/profile-bank")>();
  return {
    ...actual,
    findDuplicateEntry: vi.fn(),
    updateBankEntry: vi.fn(),
    insertBankEntries: vi.fn().mockReturnValue([]),
  };
});

import { findDuplicateEntry, updateBankEntry, insertBankEntries, getDeduplicationKey } from "@/lib/db/profile-bank";
import { extractBankEntries, populateBankFromProfile } from "./info-bank";

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

      // 1 experience + 1 achievement + 2 skills = 4
      expect(entries).toHaveLength(4);

      const expEntry = entries.find((e) => e.category === "experience");
      expect(expEntry?.content).toEqual({
        company: "Acme Corp",
        title: "Senior Engineer",
        location: "NYC",
        startDate: "2020-01-01",
        endDate: "2023-06-01",
        current: false,
        description: "Built web apps",
        highlights: ["Led team of 5"],
        skills: ["React", "Node.js"],
      });
      expect(expEntry?.sourceDocumentId).toBe("doc-1");
      expect(expEntry?.confidenceScore).toBe(0.9);

      const achievementEntries = entries.filter((e) => e.category === "achievement");
      expect(achievementEntries).toHaveLength(1);
      expect(achievementEntries[0].content).toEqual({
        description: "Led team of 5",
        context: "Senior Engineer at Acme Corp",
        company: "Acme Corp",
      });

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
          { id: "s1", name: "JavaScript", category: "technical", proficiency: "expert" },
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

      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe("project");
      expect(entries[0].content).toEqual({
        name: "Portfolio",
        description: "My site",
        url: "https://example.com",
        technologies: ["React", "Next.js"],
        highlights: ["1000 visitors/day"],
      });
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

      const achievements = entries.filter((e) => e.category === "achievement");
      expect(achievements).toHaveLength(1);
      expect(achievements[0].content.description).toBe("Real achievement");

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
      const key = getDeduplicationKey("experience", { company: "Acme", title: "Engineer" });
      expect(key).toBe("acme|engineer");
    });

    it("should generate key for skill", () => {
      const key = getDeduplicationKey("skill", { name: "React" });
      expect(key).toBe("react");
    });

    it("should generate key for education", () => {
      const key = getDeduplicationKey("education", { institution: "MIT", degree: "BS" });
      expect(key).toBe("mit|bs");
    });

    it("should generate key for project", () => {
      const key = getDeduplicationKey("project", { name: "Portfolio" });
      expect(key).toBe("portfolio");
    });

    it("should generate key for certification", () => {
      const key = getDeduplicationKey("certification", { name: "AWS SA", issuer: "Amazon" });
      expect(key).toBe("aws sa|amazon");
    });

    it("should generate key for achievement", () => {
      const key = getDeduplicationKey("achievement", { description: "Led team of 5 engineers" });
      expect(key).toBe("led team of 5 engineers");
    });
  });

  describe("populateBankFromProfile", () => {
    it("should insert new entries when no duplicates exist", () => {
      (findDuplicateEntry as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (insertBankEntries as ReturnType<typeof vi.fn>).mockReturnValue(["id1", "id2"]);

      const profile: Partial<Profile> = {
        skills: [
          { id: "s1", name: "React", category: "technical" },
          { id: "s2", name: "Node.js", category: "technical" },
        ],
      };

      const result = populateBankFromProfile(profile, "doc-1");

      expect(result.inserted).toBe(2);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(insertBankEntries).toHaveBeenCalled();
    });

    it("should update when new entry has higher confidence", () => {
      (findDuplicateEntry as ReturnType<typeof vi.fn>).mockReturnValue({
        id: "existing-1",
        userId: "default",
        category: "skill",
        content: { name: "React" },
        confidenceScore: 0.7,
        createdAt: "2024-01-01",
      });

      const profile: Partial<Profile> = {
        skills: [{ id: "s1", name: "React", category: "technical", proficiency: "expert" }],
      };

      const result = populateBankFromProfile(profile, "doc-2");

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);
      expect(updateBankEntry).toHaveBeenCalledWith(
        "existing-1",
        { name: "React", category: "technical", proficiency: "expert" },
        0.85
      );
    });

    it("should skip when existing entry has higher or equal confidence", () => {
      (findDuplicateEntry as ReturnType<typeof vi.fn>).mockReturnValue({
        id: "existing-1",
        userId: "default",
        category: "skill",
        content: { name: "React" },
        confidenceScore: 0.95,
        createdAt: "2024-01-01",
      });

      const profile: Partial<Profile> = {
        skills: [{ id: "s1", name: "React", category: "technical" }],
      };

      const result = populateBankFromProfile(profile, "doc-2");

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(updateBankEntry).not.toHaveBeenCalled();
    });

    it("should handle empty profile", () => {
      const result = populateBankFromProfile({}, undefined);

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(insertBankEntries).not.toHaveBeenCalled();
    });
  });
});
