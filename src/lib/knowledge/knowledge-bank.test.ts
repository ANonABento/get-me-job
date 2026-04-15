import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BankEntry } from "@/types";

// Mock the profile-bank module
vi.mock("@/lib/db/profile-bank", () => ({
  getBankEntries: vi.fn(),
  getBankEntriesByCategory: vi.fn(),
}));

import { getBankEntries, getBankEntriesByCategory } from "@/lib/db/profile-bank";
import { bankEntryToText, searchKnowledgeBank, multiQuerySearch } from "./knowledge-bank";

const mockEntries: BankEntry[] = [
  {
    id: "entry-1",
    userId: "default",
    category: "experience",
    content: {
      company: "Google",
      title: "Senior Software Engineer",
      description: "Built scalable React applications with TypeScript",
      highlights: ["Led team of 5", "Reduced load time by 40%"],
      skills: ["React", "TypeScript", "Node.js"],
    },
    confidenceScore: 0.9,
    createdAt: "2024-01-01",
  },
  {
    id: "entry-2",
    userId: "default",
    category: "skill",
    content: {
      name: "Python",
      category: "technical",
      proficiency: "advanced",
    },
    confidenceScore: 0.85,
    createdAt: "2024-01-02",
  },
  {
    id: "entry-3",
    userId: "default",
    category: "project",
    content: {
      name: "E-commerce Platform",
      description: "Full stack e-commerce platform with payment processing",
      technologies: ["React", "Node.js", "PostgreSQL"],
      highlights: ["Processed $1M in transactions", "99.9% uptime"],
    },
    confidenceScore: 0.8,
    createdAt: "2024-01-03",
  },
  {
    id: "entry-4",
    userId: "default",
    category: "education",
    content: {
      institution: "MIT",
      degree: "Bachelor of Science",
      field: "Computer Science",
    },
    confidenceScore: 0.95,
    createdAt: "2024-01-04",
  },
  {
    id: "entry-5",
    userId: "default",
    category: "certification",
    content: {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
    },
    confidenceScore: 0.9,
    createdAt: "2024-01-05",
  },
  {
    id: "entry-6",
    userId: "default",
    category: "achievement",
    content: {
      description: "Won company hackathon for building an AI-powered code review tool",
    },
    confidenceScore: 0.75,
    createdAt: "2024-01-06",
  },
];

describe("bankEntryToText", () => {
  it("should extract experience fields", () => {
    const text = bankEntryToText(mockEntries[0]);
    expect(text).toContain("Google");
    expect(text).toContain("Senior Software Engineer");
    expect(text).toContain("React applications");
    expect(text).toContain("Led team of 5");
    expect(text).toContain("React");
  });

  it("should extract skill fields", () => {
    const text = bankEntryToText(mockEntries[1]);
    expect(text).toContain("Python");
    expect(text).toContain("technical");
    expect(text).toContain("advanced");
  });

  it("should extract project fields", () => {
    const text = bankEntryToText(mockEntries[2]);
    expect(text).toContain("E-commerce Platform");
    expect(text).toContain("payment processing");
    expect(text).toContain("React");
    expect(text).toContain("PostgreSQL");
  });

  it("should extract education fields", () => {
    const text = bankEntryToText(mockEntries[3]);
    expect(text).toContain("MIT");
    expect(text).toContain("Bachelor of Science");
    expect(text).toContain("Computer Science");
  });

  it("should extract certification fields", () => {
    const text = bankEntryToText(mockEntries[4]);
    expect(text).toContain("AWS Solutions Architect");
    expect(text).toContain("Amazon Web Services");
  });

  it("should extract achievement fields", () => {
    const text = bankEntryToText(mockEntries[5]);
    expect(text).toContain("hackathon");
    expect(text).toContain("AI-powered");
  });

  it("should fallback to string values for unknown structure", () => {
    const entry: BankEntry = {
      id: "unknown",
      userId: "default",
      category: "experience",
      content: {}, // Empty content, no known fields
      confidenceScore: 0.5,
      createdAt: "2024-01-01",
    };
    const text = bankEntryToText(entry);
    expect(text).toBe("");
  });
});

describe("searchKnowledgeBank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBankEntries).mockReturnValue(mockEntries);
    vi.mocked(getBankEntriesByCategory).mockImplementation((category) =>
      mockEntries.filter((e) => e.category === category)
    );
  });

  it("should return ranked results for a query", () => {
    const results = searchKnowledgeBank("React TypeScript developer");

    expect(results.length).toBeGreaterThan(0);
    // The experience entry with React/TypeScript should rank highly
    expect(results[0].category).toBe("experience");
    expect(results[0].id).toBe("entry-1");
  });

  it("should filter by category when specified", () => {
    const results = searchKnowledgeBank("Python", "default", 20, "skill");

    expect(getBankEntriesByCategory).toHaveBeenCalledWith("skill", "default");
    for (const r of results) {
      expect(r.category).toBe("skill");
    }
  });

  it("should respect limit parameter", () => {
    const results = searchKnowledgeBank("React developer", "default", 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("should return empty for non-matching query", () => {
    const results = searchKnowledgeBank("xyznonexistent gibberish");
    expect(results).toEqual([]);
  });

  it("should include score and content in results", () => {
    const results = searchKnowledgeBank("React");

    for (const r of results) {
      expect(r.score).toBeGreaterThan(0);
      expect(r.content).toBeDefined();
      expect(r.id).toBeDefined();
      expect(r.category).toBeDefined();
    }
  });
});

describe("multiQuerySearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBankEntries).mockReturnValue(mockEntries);
  });

  it("should merge results from multiple queries", () => {
    const results = multiQuerySearch(["React developer", "Python data science"]);

    // Should have results from both queries
    const ids = results.map((r) => r.id);
    expect(ids).toContain("entry-1"); // React experience
    expect(ids).toContain("entry-2"); // Python skill
  });

  it("should deduplicate by chunk ID and keep highest score", () => {
    const results = multiQuerySearch([
      "React TypeScript Node.js",
      "React applications frontend",
    ]);

    // entry-1 should appear only once
    const entry1Count = results.filter((r) => r.id === "entry-1").length;
    expect(entry1Count).toBe(1);
  });

  it("should sort by score descending", () => {
    const results = multiQuerySearch(["React developer", "Python"]);

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("should handle empty queries array", () => {
    const results = multiQuerySearch([]);
    expect(results).toEqual([]);
  });
});
