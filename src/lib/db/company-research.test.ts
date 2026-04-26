import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "research-id",
}));

import db from "./schema";
import {
  deleteCompanyResearch,
  getCompanyResearch,
  saveCompanyResearch,
} from "./company-research";

describe("Company Research DB Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch company research for a specific user", () => {
    const mockGet = vi.fn().mockReturnValue({
      id: "research-id",
      user_id: "user-123",
      company_name: "acme",
      summary: "Summary",
      key_facts_json: '["Fact"]',
      interview_questions_json: '["Question"]',
      culture_notes: null,
      recent_news: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    });
    (db.prepare as Mock).mockReturnValue({ get: mockGet });

    const result = getCompanyResearch(" Acme ", "user-123");

    expect(db.prepare).toHaveBeenCalledWith(
      "SELECT * FROM company_research WHERE user_id = ? AND LOWER(company_name) = ?"
    );
    expect(mockGet).toHaveBeenCalledWith("user-123", "acme");
    expect(result?.id).toBe("research-id");
    expect(result?.keyFacts).toEqual(["Fact"]);
  });

  it("should save company research with user ownership", () => {
    const mockRun = vi.fn();
    const mockGet = vi.fn().mockReturnValue({
      id: "research-id",
      user_id: "user-123",
      company_name: "acme",
      summary: "Summary",
      key_facts_json: "[]",
      interview_questions_json: "[]",
      culture_notes: null,
      recent_news: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    });
    (db.prepare as Mock).mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO company_research")) {
        return { run: mockRun };
      }
      return { get: mockGet };
    });

    saveCompanyResearch(
      {
        companyName: "Acme",
        summary: "Summary",
        keyFacts: [],
        interviewQuestions: [],
      },
      "user-123"
    );

    expect(mockRun.mock.calls[0].slice(0, 3)).toEqual([
      "research-id",
      "user-123",
      "acme",
    ]);
  });

  it("should delete company research by id and user", () => {
    const mockRun = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    deleteCompanyResearch("research-id", "user-123");

    expect(db.prepare).toHaveBeenCalledWith(
      "DELETE FROM company_research WHERE id = ? AND user_id = ?"
    );
    expect(mockRun).toHaveBeenCalledWith("research-id", "user-123");
  });
});
