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
  generateId: () => "test-version-id",
}));

import db from "./schema";
import {
  createProfileSnapshot,
  listProfileVersions,
  getProfileVersion,
  pruneVersions,
} from "./profile-versions";

const mockProfile = {
  id: "default",
  contact: { name: "John Doe", email: "john@example.com" },
  summary: "Experienced developer",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

describe("Profile Versions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProfileSnapshot", () => {
    it("should create a snapshot with auto-incremented version", () => {
      const mockRun = vi.fn();

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("MAX(version)")) {
          return { get: vi.fn().mockReturnValue({ max_version: 2 }) };
        }
        if (sql.includes("INSERT INTO profile_versions")) {
          return { run: mockRun };
        }
        if (sql.includes("COUNT(*)")) {
          return { get: vi.fn().mockReturnValue({ count: 3 }) };
        }
        return { run: vi.fn(), get: vi.fn(), all: vi.fn() };
      });

      const snapshotJson = JSON.stringify(mockProfile);
      const result = createProfileSnapshot("default", snapshotJson);

      expect(result.version).toBe(3);
      expect(result.profileId).toBe("default");
      expect(result.id).toBe("test-version-id");
      expect(result.snapshotJson).toBe(snapshotJson);
      expect(mockRun).toHaveBeenCalledWith(
        "test-version-id",
        "default",
        "default",
        3,
        snapshotJson
      );
    });

    it("should start at version 1 when no versions exist", () => {
      const mockRun = vi.fn();

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("MAX(version)")) {
          return { get: vi.fn().mockReturnValue({ max_version: null }) };
        }
        if (sql.includes("INSERT INTO profile_versions")) {
          return { run: mockRun };
        }
        if (sql.includes("COUNT(*)")) {
          return { get: vi.fn().mockReturnValue({ count: 1 }) };
        }
        return { run: vi.fn(), get: vi.fn(), all: vi.fn() };
      });

      const result = createProfileSnapshot("default", JSON.stringify(mockProfile));

      expect(result.version).toBe(1);
    });
  });

  describe("listProfileVersions", () => {
    it("should return all versions sorted by version desc", () => {
      const mockRows = [
        { id: "v2", version: 2, created_at: "2024-01-15T00:00:00.000Z" },
        { id: "v1", version: 1, created_at: "2024-01-01T00:00:00.000Z" },
      ];

      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = listProfileVersions("default");

      expect(result).toEqual([
        { id: "v2", version: 2, createdAt: "2024-01-15T00:00:00.000Z" },
        { id: "v1", version: 1, createdAt: "2024-01-01T00:00:00.000Z" },
      ]);
    });

    it("should return empty array when no versions exist", () => {
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      });

      const result = listProfileVersions("default");

      expect(result).toEqual([]);
    });
  });

  describe("getProfileVersion", () => {
    it("should return a specific version by ID", () => {
      const mockRow = {
        id: "v1",
        profile_id: "default",
        version: 1,
        snapshot_json: JSON.stringify(mockProfile),
        created_at: "2024-01-01T00:00:00.000Z",
      };

      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(mockRow),
      });

      const result = getProfileVersion("v1", "default");

      expect(result).toEqual({
        id: "v1",
        profileId: "default",
        version: 1,
        snapshotJson: JSON.stringify(mockProfile),
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should return null for non-existent version", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      });

      const result = getProfileVersion("nonexistent", "default");

      expect(result).toBeNull();
    });

    it("should require the user id when fetching by version id", () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      getProfileVersion("v1", "user-123");

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM profile_versions WHERE id = ? AND user_id = ?"
      );
      expect(mockGet).toHaveBeenCalledWith("v1", "user-123");
    });
  });

  describe("pruneVersions", () => {
    it("should not prune when under the limit", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue({ count: 15 }),
      });

      const result = pruneVersions("default");

      expect(result).toBe(0);
    });

    it("should prune excess versions beyond 20", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 3 });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("COUNT(*)")) {
          return { get: vi.fn().mockReturnValue({ count: 23 }) };
        }
        if (sql.includes("DELETE")) {
          return { run: mockRun };
        }
        return { run: vi.fn(), get: vi.fn() };
      });

      const result = pruneVersions("default");

      expect(result).toBe(3);
      expect(mockRun).toHaveBeenCalledWith("default", 3);
    });

    it("should not prune when exactly at the limit", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue({ count: 20 }),
      });

      const result = pruneVersions("default");

      expect(result).toBe(0);
    });
  });
});
