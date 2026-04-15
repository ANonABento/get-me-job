import { describe, it, expect, vi, beforeEach } from "vitest";

const mockComplete = vi.fn();

// Mock the LLM client - must use a class-like function for `new`
vi.mock("@/lib/llm/client", () => {
  return {
    LLMClient: class MockLLMClient {
      complete = mockComplete;
    },
    parseJSONFromLLM: vi.fn(),
  };
});

// Mock the knowledge bank
vi.mock("./knowledge-bank", () => ({
  multiQuerySearch: vi.fn(),
  bankEntryToText: vi.fn().mockReturnValue("mock text"),
}));

import { parseJSONFromLLM } from "@/lib/llm/client";
import { multiQuerySearch } from "./knowledge-bank";
import {
  expandQuery,
  retrieveChunks,
  assembleResume,
  runRetrievalPipeline,
} from "./retrieval";
import type { LLMConfig } from "@/types";
import type { RankedChunk } from "./knowledge-bank";

const mockLLMConfig: LLMConfig = {
  provider: "openai",
  apiKey: "test-key",
  model: "gpt-4o-mini",
};

const mockChunks: RankedChunk[] = [
  {
    id: "chunk-1",
    category: "experience",
    content: {
      company: "Google",
      title: "Software Engineer",
      description: "Built React apps",
      highlights: ["Led team"],
      skills: ["React", "TypeScript"],
    },
    score: 0.9,
  },
  {
    id: "chunk-2",
    category: "skill",
    content: { name: "TypeScript", category: "technical" },
    score: 0.8,
  },
  {
    id: "chunk-3",
    category: "education",
    content: {
      institution: "MIT",
      degree: "BS",
      field: "Computer Science",
    },
    score: 0.5,
  },
];

describe("expandQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an array of search queries", async () => {
    const mockQueries = {
      queries: [
        "3 years React experience",
        "TypeScript proficiency",
        "Node.js backend development",
        "Team leadership experience",
        "AWS cloud infrastructure",
      ],
    };

    vi.mocked(parseJSONFromLLM).mockReturnValue(mockQueries);
    mockComplete.mockResolvedValue(JSON.stringify(mockQueries));

    const result = await expandQuery("Senior React Developer at Google", mockLLMConfig);

    expect(result).toHaveLength(5);
    expect(result[0]).toBe("3 years React experience");
    expect(result[4]).toBe("AWS cloud infrastructure");
  });

  it("should limit to 10 queries maximum", async () => {
    const mockQueries = {
      queries: Array.from({ length: 15 }, (_, i) => `Query ${i + 1}`),
    };

    vi.mocked(parseJSONFromLLM).mockReturnValue(mockQueries);
    mockComplete.mockResolvedValue(JSON.stringify(mockQueries));

    const result = await expandQuery("Job description", mockLLMConfig);

    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should throw if LLM returns no queries", async () => {
    vi.mocked(parseJSONFromLLM).mockReturnValue({ queries: [] });
    mockComplete.mockResolvedValue("{}");

    await expect(expandQuery("Job description", mockLLMConfig)).rejects.toThrow(
      "LLM did not return valid queries array"
    );
  });

  it("should throw if queries is not an array", async () => {
    vi.mocked(parseJSONFromLLM).mockReturnValue({ queries: "not-array" });
    mockComplete.mockResolvedValue("{}");

    await expect(expandQuery("Job description", mockLLMConfig)).rejects.toThrow(
      "LLM did not return valid queries array"
    );
  });

  it("should use low temperature for deterministic output", async () => {
    vi.mocked(parseJSONFromLLM).mockReturnValue({ queries: ["query 1"] });
    mockComplete.mockResolvedValue("{}");

    await expandQuery("Job description", mockLLMConfig);

    expect(mockComplete).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.3 })
    );
  });
});

describe("retrieveChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate to multiQuerySearch", () => {
    vi.mocked(multiQuerySearch).mockReturnValue(mockChunks);

    const result = retrieveChunks("user-1", ["React dev", "TypeScript"]);

    expect(multiQuerySearch).toHaveBeenCalledWith(
      ["React dev", "TypeScript"],
      "user-1",
      20
    );
    expect(result).toEqual(mockChunks);
  });

  it("should pass custom limit", () => {
    vi.mocked(multiQuerySearch).mockReturnValue([]);

    retrieveChunks("user-1", ["query"], 10);

    expect(multiQuerySearch).toHaveBeenCalledWith(["query"], "user-1", 10);
  });
});

describe("assembleResume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a structured resume and gaps", async () => {
    const mockResponse = {
      resume: {
        contact: { name: "John Doe", email: "john@example.com" },
        summary: "Experienced developer...",
        experiences: [
          {
            company: "Google",
            title: "Software Engineer",
            dates: "2020 - Present",
            highlights: ["Led team of 5"],
          },
        ],
        skills: ["React", "TypeScript"],
        education: [
          {
            institution: "MIT",
            degree: "BS",
            field: "Computer Science",
            date: "2020",
          },
        ],
      },
      gaps: ["No AWS certification", "No management experience"],
    };

    vi.mocked(parseJSONFromLLM).mockReturnValue(mockResponse);
    mockComplete.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await assembleResume(mockChunks, "Job description", mockLLMConfig);

    expect(result.resume.contact.name).toBe("John Doe");
    expect(result.resume.summary).toBe("Experienced developer...");
    expect(result.resume.experiences).toHaveLength(1);
    expect(result.resume.skills).toContain("React");
    expect(result.gaps).toHaveLength(2);
    expect(result.gaps[0]).toBe("No AWS certification");
  });

  it("should handle missing gaps array gracefully", async () => {
    vi.mocked(parseJSONFromLLM).mockReturnValue({
      resume: {
        contact: { name: "Test" },
        summary: "Summary",
        experiences: [],
        skills: [],
        education: [],
      },
    });
    mockComplete.mockResolvedValue("{}");

    const result = await assembleResume([], "Job", mockLLMConfig);

    expect(result.gaps).toEqual([]);
  });

  it("should handle missing resume fields gracefully", async () => {
    vi.mocked(parseJSONFromLLM).mockReturnValue({
      resume: {},
      gaps: [],
    });
    mockComplete.mockResolvedValue("{}");

    const result = await assembleResume([], "Job", mockLLMConfig);

    expect(result.resume.contact).toEqual({ name: "" });
    expect(result.resume.summary).toBe("");
    expect(result.resume.experiences).toEqual([]);
    expect(result.resume.skills).toEqual([]);
    expect(result.resume.education).toEqual([]);
  });
});

describe("runRetrievalPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should run the full pipeline and return RetrievalResult", async () => {
    // Mock expandQuery (first LLM call)
    const expandResponse = { queries: ["React experience", "TypeScript skills"] };
    // Mock assembleResume (second LLM call)
    const assembleResponse = {
      resume: {
        contact: { name: "Jane" },
        summary: "Experienced engineer",
        experiences: [],
        skills: ["React"],
        education: [],
      },
      gaps: ["No cloud experience"],
    };

    mockComplete
      .mockResolvedValueOnce(JSON.stringify(expandResponse))
      .mockResolvedValueOnce(JSON.stringify(assembleResponse));

    vi.mocked(parseJSONFromLLM)
      .mockReturnValueOnce(expandResponse)
      .mockReturnValueOnce(assembleResponse);

    vi.mocked(multiQuerySearch).mockReturnValue(mockChunks);

    const result = await runRetrievalPipeline(
      "Looking for a React developer",
      "default",
      mockLLMConfig
    );

    expect(result.queryCount).toBe(2);
    expect(result.chunks).toEqual(mockChunks);
    expect(result.resume.skills).toContain("React");
    expect(result.gaps).toEqual(["No cloud experience"]);
  });
});
