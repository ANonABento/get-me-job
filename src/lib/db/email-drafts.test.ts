import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-draft-id",
}));

import db from "./schema";
import { createEmailDraft } from "./email-drafts";

describe("Email Draft Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create drafts without a job link", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    const draft = createEmailDraft(
      {
        type: "follow_up",
        subject: "Hello",
        body: "Checking in",
      },
      "user-1"
    );

    expect(draft.id).toBe("test-draft-id");
    expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-draft-id",
      "user-1",
      "follow_up",
      null,
      "Hello",
      "Checking in",
      null,
      expect.any(String),
      expect.any(String)
    );
  });

  it("should reject drafts linked to jobs outside the user", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 0 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    expect(() =>
      createEmailDraft(
        {
          type: "follow_up",
          jobId: "job-1",
          subject: "Hello",
          body: "Checking in",
        },
        "user-1"
      )
    ).toThrow("Job not found");

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-draft-id",
      "user-1",
      "follow_up",
      "job-1",
      "Hello",
      "Checking in",
      null,
      expect.any(String),
      expect.any(String),
      "job-1",
      "user-1"
    );
  });
});
