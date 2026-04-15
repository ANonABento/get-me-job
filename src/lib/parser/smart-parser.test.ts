import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LLMConfig } from "@/types";

const mockComplete = vi.fn();

vi.mock("@/lib/llm/client", () => ({
  LLMClient: class MockLLMClient {
    complete = mockComplete;
  },
  parseJSONFromLLM: vi.fn((response: string) => JSON.parse(response)),
}));

// Must import after mock setup
import { smartParseResume } from "./smart-parser";

const WELL_FORMATTED_RESUME = `John Doe
john@example.com | (555) 123-4567
San Francisco, CA

EXPERIENCE
Software Engineer at Acme Corp
Jan 2020 - Present
- Built scalable APIs serving 1M+ requests/day
- Led migration from monolith to microservices

Junior Developer at StartupCo
Jun 2018 - Dec 2019
- Developed React frontend components

EDUCATION
Bachelor of Science in Computer Science
Stanford University
2014 - 2018
GPA: 3.8

SKILLS
JavaScript, TypeScript, Python, React, Node.js, AWS, Docker, PostgreSQL

PROJECTS
Personal Portfolio
- Built with Next.js and Tailwind CSS
`;

const POORLY_FORMATTED_RESUME = `some text about my career I worked at a company doing things and have a degree`;

const llmConfig: LLMConfig = {
  provider: "openai",
  apiKey: "test-key",
  model: "gpt-4",
};

describe("smartParseResume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses well-formatted resume without LLM", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);

    expect(result.llmUsed).toBe(false);
    expect(result.llmSectionsCount).toBe(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.profile.contact?.name).toBe("John Doe");
    expect(result.profile.contact?.email).toBe("john@example.com");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(1);
    expect(result.profile.skills!.length).toBeGreaterThanOrEqual(4);
    expect(result.sectionsDetected).toContain("experience");
    expect(result.sectionsDetected).toContain("education");
    expect(result.sectionsDetected).toContain("skills");
    expect(result.warnings).toHaveLength(0);
    // LLM should NOT have been called
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("parses well-formatted resume without LLM even when config provided", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME, llmConfig);

    expect(result.llmUsed).toBe(false);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("returns low confidence with warnings for poorly formatted resume (no LLM)", async () => {
    const result = await smartParseResume(POORLY_FORMATTED_RESUME);

    expect(result.confidence).toBeLessThan(0.7);
    expect(result.llmUsed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    // Should still have a profile (just lower quality)
    expect(result.profile).toBeDefined();
    expect(result.profile.rawText).toBe(POORLY_FORMATTED_RESUME);
  });

  it("uses targeted LLM for low-confidence sections", async () => {
    // LLM returns parsed data for ambiguous sections
    mockComplete.mockResolvedValueOnce(
      JSON.stringify({
        experience: [
          {
            company: "Some Corp",
            title: "Developer",
            startDate: "2020",
            endDate: "Present",
            current: true,
            description: "Did work",
            highlights: ["Built things"],
          },
        ],
      })
    );

    const result = await smartParseResume(POORLY_FORMATTED_RESUME, llmConfig);

    // LLM should have been called (for ambiguous sections)
    expect(mockComplete).toHaveBeenCalled();
    expect(result.profile).toBeDefined();
  });

  it("handles LLM failure gracefully", async () => {
    mockComplete.mockRejectedValueOnce(new Error("API rate limit"));

    const result = await smartParseResume(POORLY_FORMATTED_RESUME, llmConfig);

    expect(result.profile).toBeDefined();
    expect(result.warnings.some((w) => w.includes("LLM enhancement failed"))).toBe(true);
  });

  it("returns correct metadata shape", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);

    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("sectionsDetected");
    expect(result).toHaveProperty("llmUsed");
    expect(result).toHaveProperty("llmSectionsCount");
    expect(result).toHaveProperty("warnings");
    expect(typeof result.confidence).toBe("number");
    expect(typeof result.llmUsed).toBe("boolean");
    expect(typeof result.llmSectionsCount).toBe("number");
    expect(Array.isArray(result.sectionsDetected)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("works with null llmConfig (same as no config)", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME, null);

    expect(result.llmUsed).toBe(false);
    expect(result.profile.contact?.name).toBe("John Doe");
  });

  it("includes rawText in profile", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);
    expect(result.profile.rawText).toBe(WELL_FORMATTED_RESUME);
  });

  it("extracts contact info even without dedicated contact section", async () => {
    const resumeNoContactSection = `Jane Smith
jane@test.com

EXPERIENCE
Engineer at Corp
2020 - Present`;

    const result = await smartParseResume(resumeNoContactSection);
    expect(result.profile.contact?.name).toBe("Jane Smith");
    expect(result.profile.contact?.email).toBe("jane@test.com");
  });
});
