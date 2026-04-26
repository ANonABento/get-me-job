import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "status-id",
}));

import db from "./schema";
import { getJobStatusHistory, recordJobStatusChange } from "./analytics";

describe("Analytics DB Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordJobStatusChange", () => {
    it("should record status changes only for the provided user job", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = recordJobStatusChange(
        "job-1",
        "saved",
        "applied",
        "Submitted",
        "user-123"
      );

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
      expect(mockRun).toHaveBeenCalledWith(
        "status-id",
        "user-123",
        "job-1",
        "saved",
        "applied",
        expect.any(String),
        "Submitted",
        "job-1",
        "user-123"
      );
      expect(result.userId).toBe("user-123");
    });
  });

  describe("getJobStatusHistory", () => {
    it("should scope status history by job and user", () => {
      const mockAll = vi.fn().mockReturnValue([
        {
          id: "status-id",
          user_id: "user-123",
          job_id: "job-1",
          from_status: "saved",
          to_status: "applied",
          changed_at: "2024-01-01T00:00:00.000Z",
          notes: null,
        },
      ]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getJobStatusHistory("job-1", "user-123");

      expect(mockAll).toHaveBeenCalledWith("job-1", "user-123");
      expect(result).toEqual([
        {
          id: "status-id",
          userId: "user-123",
          jobId: "job-1",
          fromStatus: "saved",
          toStatus: "applied",
          changedAt: "2024-01-01T00:00:00.000Z",
          notes: undefined,
        },
      ]);
    });
  });
});
