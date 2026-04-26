import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock the database module
vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

// Mock utils to control ID generation
vi.mock("@/lib/utils", () => ({
  generateId: () => "test-tracking-id",
}));

import db from "./schema";
import {
  trackResumeSent,
  updateTrackingOutcome,
  getTrackingEntries,
  getTrackingEntriesByResume,
  getTrackedResumeIds,
  deleteTrackingEntry,
} from "./resume-tracking";

describe("Resume A/B Tracking Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("trackResumeSent", () => {
    it("should insert a new tracking entry with applied outcome", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = trackResumeSent("resume-123", "job-456");

      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO resume_ab_tracking")
      );
      expect(mockRun).toHaveBeenCalled();
      expect(result.id).toBe("test-tracking-id");
      expect(result.resumeId).toBe("resume-123");
      expect(result.jobId).toBe("job-456");
      expect(result.outcome).toBe("applied");
    });

    it("should include notes when provided", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = trackResumeSent("resume-123", "job-456", "default", "Tailored for role");

      expect(result.notes).toBe("Tailored for role");
    });

    it("should default to 'default' user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      trackResumeSent("resume-123", "job-456");

      const args = mockRun.mock.calls[0];
      expect(args[3]).toBe("default"); // userId is 4th arg
    });

    it("should reject tracking when the resume or job is outside the user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() => trackResumeSent("resume-123", "job-456", "user-1")).toThrow(
        "Resume or job not found"
      );
      expect(mockRun).toHaveBeenCalledWith(
        "test-tracking-id",
        "resume-123",
        "job-456",
        "user-1",
        expect.any(String),
        expect.any(String),
        null,
        "resume-123",
        "user-1",
        "job-456",
        "user-1"
      );
    });
  });

  describe("updateTrackingOutcome", () => {
    it("should update outcome and return true on success", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = updateTrackingOutcome("entry-1", "interviewing");

      expect(result).toBe(true);
      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE resume_ab_tracking")
      );
    });

    it("should return false when entry not found", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = updateTrackingOutcome("nonexistent", "offered");

      expect(result).toBe(false);
    });
  });

  describe("getTrackingEntries", () => {
    it("should return mapped tracking entries", () => {
      const mockAll = vi.fn().mockReturnValue([
        {
          id: "e1",
          resume_id: "r1",
          job_id: "j1",
          outcome: "applied",
          sent_at: "2024-01-01",
          updated_at: "2024-01-01",
          notes: "test note",
        },
      ]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getTrackingEntries();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "e1",
        resumeId: "r1",
        jobId: "j1",
        outcome: "applied",
        sentAt: "2024-01-01",
        updatedAt: "2024-01-01",
        notes: "test note",
      });
    });

    it("should handle null notes", () => {
      const mockAll = vi.fn().mockReturnValue([
        {
          id: "e1",
          resume_id: "r1",
          job_id: "j1",
          outcome: "applied",
          sent_at: "2024-01-01",
          updated_at: "2024-01-01",
          notes: null,
        },
      ]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getTrackingEntries();

      expect(result[0].notes).toBeUndefined();
    });

    it("should return empty array when no entries", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getTrackingEntries();

      expect(result).toEqual([]);
    });
  });

  describe("getTrackingEntriesByResume", () => {
    it("should filter by resume ID", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getTrackingEntriesByResume("resume-123");

      expect(mockAll).toHaveBeenCalledWith("resume-123", "default");
    });
  });

  describe("getTrackedResumeIds", () => {
    it("should return distinct resume IDs", () => {
      const mockAll = vi.fn().mockReturnValue([
        { resume_id: "r1" },
        { resume_id: "r2" },
      ]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getTrackedResumeIds();

      expect(result).toEqual(["r1", "r2"]);
    });
  });

  describe("deleteTrackingEntry", () => {
    it("should return true when entry deleted", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = deleteTrackingEntry("entry-1");

      expect(result).toBe(true);
    });

    it("should return false when entry not found", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = deleteTrackingEntry("nonexistent");

      expect(result).toBe(false);
    });
  });
});
