import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-scan-id",
}));

import db from "./schema";
import { saveScanResult } from "./ats-scans";

const report = {
  score: {
    overall: 80,
    formatting: 90,
    structure: 85,
    content: 75,
    keywords: 70,
  },
  letterGrade: "B",
  issues: [],
  keywords: [],
  scannedAt: "2026-04-26T00:00:00.000Z",
} as any;

describe("ATS Scan Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save scans without a job link", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    const id = saveScanResult("user-1", report, []);

    expect(id).toBe("test-scan-id");
    expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-scan-id",
      "user-1",
      null,
      80,
      "B",
      90,
      85,
      75,
      70,
      0,
      0,
      expect.any(String),
      "2026-04-26T00:00:00.000Z"
    );
  });

  it("should reject scans linked to jobs outside the user", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 0 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    expect(() => saveScanResult("user-1", report, [], "job-1")).toThrow("Job not found");
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-scan-id",
      "user-1",
      "job-1",
      80,
      "B",
      90,
      85,
      75,
      70,
      0,
      0,
      expect.any(String),
      "2026-04-26T00:00:00.000Z",
      "job-1",
      "user-1"
    );
  });
});
