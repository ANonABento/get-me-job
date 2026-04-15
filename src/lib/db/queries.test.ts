import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock the database module
vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
    transaction: vi.fn((fn) => fn),
  };
  return { default: mockDb };
});

// Mock utils to control ID generation
vi.mock("@/lib/utils", () => ({
  generateId: () => "test-id",
}));

// Mock profile-versions to prevent snapshot side effects in updateProfile tests
vi.mock("./profile-versions", () => ({
  createProfileSnapshot: vi.fn(),
}));

import db from "./schema";
import {
  getSetting,
  setSetting,
  getLLMConfig,
  setLLMConfig,
  saveDocument,
  getDocuments,
  getProfile,
  updateProfile,
  clearProfile,
} from "./queries";

describe("Settings Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSetting", () => {
    it("should return setting value", () => {
      const mockGet = vi.fn().mockReturnValue({ value: "test-value" });
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getSetting("test-key");

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT value FROM settings WHERE key = ?"
      );
      expect(mockGet).toHaveBeenCalledWith("test-key");
      expect(result).toBe("test-value");
    });

    it("should return null for non-existent setting", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      });

      const result = getSetting("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("setSetting", () => {
    it("should insert or replace setting", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      setSetting("my-key", "my-value");

      expect(db.prepare).toHaveBeenCalledWith(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
      );
      expect(mockRun).toHaveBeenCalledWith("my-key", "my-value");
    });
  });

  describe("getLLMConfig", () => {
    it("should return parsed LLM config", () => {
      const config = { provider: "openai", model: "gpt-4", apiKey: "sk-xxx" };
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: JSON.stringify(config) }),
      });

      const result = getLLMConfig();

      expect(result).toEqual(config);
    });

    it("should return null when no config exists", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      });

      const result = getLLMConfig();

      expect(result).toBeNull();
    });
  });

  describe("setLLMConfig", () => {
    it("should stringify and save LLM config", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const config = { provider: "anthropic" as const, model: "claude-3", apiKey: "sk-ant-xxx" };
      setLLMConfig(config);

      expect(mockRun).toHaveBeenCalledWith("llm_config", JSON.stringify(config));
    });
  });
});

describe("Document Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveDocument", () => {
    it("should save a document", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      saveDocument({
        id: "doc-1",
        filename: "resume.pdf",
        type: "resume",
        mimeType: "application/pdf",
        size: 1024,
        path: "/uploads/resume.pdf",
        extractedText: "John Doe, Software Engineer",
      });

      expect(mockRun).toHaveBeenCalledWith(
        "doc-1",
        "resume.pdf",
        "resume",
        "application/pdf",
        1024,
        "/uploads/resume.pdf",
        "John Doe, Software Engineer",
        "default"
      );
    });
  });

  describe("getDocuments", () => {
    it("should return all documents", () => {
      const mockRows = [
        {
          id: "doc-1",
          filename: "resume.pdf",
          type: "resume",
          mime_type: "application/pdf",
          size: 1024,
          path: "/uploads/resume.pdf",
          extracted_text: "Text content",
          uploaded_at: "2024-01-15T10:00:00.000Z",
        },
      ];

      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getDocuments();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC"
      );
      expect(result).toEqual([
        {
          id: "doc-1",
          filename: "resume.pdf",
          type: "resume",
          mimeType: "application/pdf",
          size: 1024,
          path: "/uploads/resume.pdf",
          extractedText: "Text content",
          uploadedAt: "2024-01-15T10:00:00.000Z",
        },
      ]);
    });

    it("should return empty array when no documents", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getDocuments();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC"
      );
      expect(result).toEqual([]);
    });
  });
});

describe("Profile Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return full profile with related data", () => {
      const mockProfileRow = {
        id: "default",
        contact_json: '{"name": "John Doe", "email": "john@example.com"}',
        summary: "Experienced developer",
        raw_text: "Resume text",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-15T00:00:00.000Z",
      };

      const mockExperiences = [
        {
          id: "exp-1",
          company: "Tech Corp",
          title: "Senior Dev",
          location: "NYC",
          start_date: "2020-01-01",
          end_date: null,
          current: 1,
          description: "Building stuff",
          highlights_json: '["Led team", "Shipped features"]',
          skills_json: '["JavaScript", "React"]',
        },
      ];

      const mockEducation = [
        {
          id: "edu-1",
          institution: "MIT",
          degree: "BS",
          field: "Computer Science",
          start_date: "2016-09-01",
          end_date: "2020-05-01",
          gpa: "3.8",
          highlights_json: '["Deans List"]',
        },
      ];

      const mockSkills = [
        {
          id: "skill-1",
          name: "JavaScript",
          category: "technical",
          proficiency: "expert",
        },
      ];

      const mockProjects = [
        {
          id: "proj-1",
          name: "Portfolio",
          description: "My portfolio site",
          url: "https://portfolio.com",
          technologies_json: '["React", "Next.js"]',
          highlights_json: '["1000 visitors"]',
        },
      ];

      const mockCertifications = [
        {
          id: "cert-1",
          name: "AWS Solutions Architect",
          issuer: "Amazon",
          issue_date: "2023-06-01",
          url: "https://aws.com/cert",
        },
      ];

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("FROM profile")) {
          return { get: vi.fn().mockReturnValue(mockProfileRow) };
        }
        if (sql.includes("FROM experiences")) {
          return { all: vi.fn().mockReturnValue(mockExperiences) };
        }
        if (sql.includes("FROM education")) {
          return { all: vi.fn().mockReturnValue(mockEducation) };
        }
        if (sql.includes("FROM skills")) {
          return { all: vi.fn().mockReturnValue(mockSkills) };
        }
        if (sql.includes("FROM projects")) {
          return { all: vi.fn().mockReturnValue(mockProjects) };
        }
        if (sql.includes("FROM certifications")) {
          return { all: vi.fn().mockReturnValue(mockCertifications) };
        }
        return { get: vi.fn(), all: vi.fn() };
      });

      const result = getProfile();

      expect(result).toEqual({
        id: "default",
        contact: { name: "John Doe", email: "john@example.com" },
        summary: "Experienced developer",
        rawText: "Resume text",
        experiences: [
          {
            id: "exp-1",
            company: "Tech Corp",
            title: "Senior Dev",
            location: "NYC",
            startDate: "2020-01-01",
            endDate: null,
            current: true,
            description: "Building stuff",
            highlights: ["Led team", "Shipped features"],
            skills: ["JavaScript", "React"],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "MIT",
            degree: "BS",
            field: "Computer Science",
            startDate: "2016-09-01",
            endDate: "2020-05-01",
            gpa: "3.8",
            highlights: ["Deans List"],
          },
        ],
        skills: [
          {
            id: "skill-1",
            name: "JavaScript",
            category: "technical",
            proficiency: "expert",
          },
        ],
        projects: [
          {
            id: "proj-1",
            name: "Portfolio",
            description: "My portfolio site",
            url: "https://portfolio.com",
            technologies: ["React", "Next.js"],
            highlights: ["1000 visitors"],
          },
        ],
        certifications: [
          {
            id: "cert-1",
            name: "AWS Solutions Architect",
            issuer: "Amazon",
            date: "2023-06-01",
            url: "https://aws.com/cert",
          },
        ],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-15T00:00:00.000Z",
      });
    });

    it("should return null when no profile exists", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
        all: vi.fn().mockReturnValue([]),
      });

      const result = getProfile();

      expect(result).toBeNull();
    });

    it("should handle null JSON fields", () => {
      const mockProfileRow = {
        id: "default",
        contact_json: null,
        summary: null,
        raw_text: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("FROM profile")) {
          return { get: vi.fn().mockReturnValue(mockProfileRow) };
        }
        return { all: vi.fn().mockReturnValue([]) };
      });

      const result = getProfile();

      expect(result?.contact).toEqual({ name: "" });
      expect(result?.summary).toBeNull();
    });
  });

  describe("updateProfile", () => {
    // Helper to set up mocks that handle both getProfile queries (for snapshotting) and update queries
    function setupUpdateMocks() {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("SELECT id FROM profile")) {
          return { get: vi.fn().mockReturnValue({ id: "default" }) };
        }
        // getProfile queries called during snapshotting
        if (sql.includes("FROM profile")) {
          return { get: vi.fn().mockReturnValue(null) };
        }
        return { run: mockRun, get: vi.fn(), all: vi.fn().mockReturnValue([]) };
      });
      (db.transaction as Mock).mockImplementation((fn) => fn);
      return mockRun;
    }

    it("should update profile contact info", () => {
      const mockRun = setupUpdateMocks();

      updateProfile({
        contact: { name: "Jane Doe", email: "jane@example.com" },
      });

      expect(mockRun).toHaveBeenCalled();
    });

    it("should update experiences", () => {
      const mockRun = setupUpdateMocks();

      updateProfile({
        experiences: [
          {
            id: "exp-1",
            company: "New Corp",
            title: "Lead",
            location: "SF",
            startDate: "2021-01-01",
            current: true,
            description: "Leading",
            highlights: ["Achievement"],
            skills: ["TypeScript"],
          },
        ],
      });

      // Should delete existing and insert new
      expect(mockRun).toHaveBeenCalled();
    });

    it("should handle empty update gracefully", () => {
      setupUpdateMocks();

      // Empty update - transaction should still work
      updateProfile({});

      // Transaction is still called, but nothing happens
      expect(db.transaction).toHaveBeenCalled();
    });
  });

  describe("clearProfile", () => {
    it("should clear all profile data", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      clearProfile();

      // Should call delete for experiences, education, skills, projects, certifications
      // and update profile to clear contact, summary, raw_text
      expect(mockRun).toHaveBeenCalled();
    });
  });
});
