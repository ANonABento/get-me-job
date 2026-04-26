import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-reminder-id",
}));

import db from "./schema";
import {
  createReminder,
  getReminders,
  completeReminder,
  dismissReminder,
  deleteReminder,
  updateReminder,
} from "./reminders";

describe("Reminder Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a reminder for a job owned by the user", () => {
    const mockGet = vi.fn().mockReturnValue({ id: "job-1" });
    const mockRun = vi.fn();
    (db.prepare as Mock)
      .mockReturnValueOnce({ get: mockGet })
      .mockReturnValueOnce({ run: mockRun });

    const result = createReminder(
      {
        jobId: "job-1",
        type: "follow_up",
        title: "Follow up",
        dueDate: "2026-05-01T00:00:00.000Z",
      },
      "user-1"
    );

    expect(mockGet).toHaveBeenCalledWith("job-1", "user-1");
    expect(mockRun).toHaveBeenCalledWith(
      "test-reminder-id",
      "user-1",
      "job-1",
      "follow_up",
      "Follow up",
      null,
      "2026-05-01T00:00:00.000Z",
      expect.any(String)
    );
    expect(result.id).toBe("test-reminder-id");
  });

  it("should reject reminders for jobs outside the provided user", () => {
    (db.prepare as Mock).mockReturnValue({ get: vi.fn().mockReturnValue(undefined) });

    expect(() =>
      createReminder(
        {
          jobId: "job-1",
          type: "follow_up",
          title: "Follow up",
          dueDate: "2026-05-01T00:00:00.000Z",
        },
        "user-1"
      )
    ).toThrow("Job not found");
  });

  it("should list reminders scoped by reminder user_id", () => {
    const mockAll = vi.fn().mockReturnValue([
      {
        id: "reminder-1",
        job_id: "job-1",
        type: "deadline",
        title: "Apply",
        description: null,
        due_date: "2026-05-01T00:00:00.000Z",
        completed: 0,
        dismissed: 0,
        created_at: "2026-04-26T00:00:00.000Z",
        completed_at: null,
        job_title: "Engineer",
        job_company: "Acme",
      },
    ]);
    (db.prepare as Mock).mockReturnValue({ all: mockAll });

    const result = getReminders({ userId: "user-1" });

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE r.user_id = ?"));
    expect(mockAll).toHaveBeenCalledWith("user-1");
    expect(result[0].jobTitle).toBe("Engineer");
  });

  it("should update reminder state only for the provided user", () => {
    const mockRun = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    completeReminder("reminder-1", "user-1");
    dismissReminder("reminder-2", "user-1");
    deleteReminder("reminder-3", "user-1");

    expect(mockRun).toHaveBeenNthCalledWith(1, expect.any(String), "reminder-1", "user-1");
    expect(mockRun).toHaveBeenNthCalledWith(2, "reminder-2", "user-1");
    expect(mockRun).toHaveBeenNthCalledWith(3, "reminder-3", "user-1");
  });

  it("should update reminder fields only for the provided user", () => {
    const mockRun = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    updateReminder("reminder-1", { title: "New title", description: "" }, "user-1");

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("AND user_id = ?"));
    expect(mockRun).toHaveBeenCalledWith("New title", null, "reminder-1", "user-1");
  });
});
