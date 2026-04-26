import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-offer-id",
}));

import db from "./schema";
import { createSalaryOffer } from "./salary";

describe("Salary Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create offers without a job link", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    const offer = createSalaryOffer(
      {
        company: "Acme",
        role: "Engineer",
        baseSalary: 120000,
      },
      "user-1"
    );

    expect(offer.id).toBe("test-offer-id");
    expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-offer-id",
      "user-1",
      null,
      "Acme",
      "Engineer",
      120000,
      null,
      null,
      null,
      null,
      null,
      null,
      expect.any(String),
      expect.any(String)
    );
  });

  it("should reject offers linked to jobs outside the user", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 0 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    expect(() =>
      createSalaryOffer(
        {
          jobId: "job-1",
          company: "Acme",
          role: "Engineer",
          baseSalary: 120000,
        },
        "user-1"
      )
    ).toThrow("Job not found");

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-offer-id",
      "user-1",
      "job-1",
      "Acme",
      "Engineer",
      120000,
      null,
      null,
      null,
      null,
      null,
      null,
      expect.any(String),
      expect.any(String),
      "job-1",
      "user-1"
    );
  });
});
