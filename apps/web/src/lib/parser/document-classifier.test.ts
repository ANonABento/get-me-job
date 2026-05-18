import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { LLMConfig } from "@/types";

const mockComplete = vi.fn();

vi.mock("@/lib/llm/client", () => ({
  LLMClient: class MockLLMClient {
    complete = mockComplete;
  },
  parseJSONFromLLM: vi.fn(),
}));

import {
  classifyDocumentByContent,
  classifyDocumentByFilename,
  classifyDocumentWithLLM,
  classifyDocument,
} from "./document-classifier";
import { parseJSONFromLLM } from "@/lib/llm/client";

const mockParseJSON = vi.mocked(parseJSONFromLLM);

describe("classifyDocumentByFilename", () => {
  it("detects resume by filename", () => {
    expect(classifyDocumentByFilename("my_resume.pdf")).toBe("resume");
    expect(classifyDocumentByFilename("John_Doe_Resume_2024.pdf")).toBe(
      "resume",
    );
  });

  it("detects CV by filename", () => {
    expect(classifyDocumentByFilename("cv_john.pdf")).toBe("resume");
    expect(classifyDocumentByFilename("My-CV.pdf")).toBe("resume");
  });

  it("detects cover letter by filename", () => {
    expect(classifyDocumentByFilename("cover_letter.pdf")).toBe("cover_letter");
    expect(classifyDocumentByFilename("CoverLetter_Google.pdf")).toBe(
      "cover_letter",
    );
    expect(classifyDocumentByFilename("cover-google.pdf")).toBe("cover_letter");
  });

  it("detects reference letter by filename", () => {
    expect(classifyDocumentByFilename("reference_letter.pdf")).toBe(
      "reference_letter",
    );
    expect(classifyDocumentByFilename("recommendation_john.pdf")).toBe(
      "reference_letter",
    );
  });

  it("detects certificate by filename", () => {
    expect(classifyDocumentByFilename("certificate_aws.pdf")).toBe(
      "certificate",
    );
    expect(classifyDocumentByFilename("cert-gcp.pdf")).toBe("certificate");
  });

  it("detects portfolio by filename", () => {
    expect(classifyDocumentByFilename("portfolio.pdf")).toBe("portfolio");
  });

  it("detects career notes by explicit filename", () => {
    expect(classifyDocumentByFilename("career-notes.txt")).toBe("career_notes");
    expect(classifyDocumentByFilename("brag-doc.md")).toBe("career_notes");
  });

  it("returns other for unrecognized filenames", () => {
    expect(classifyDocumentByFilename("document.pdf")).toBe("other");
    expect(classifyDocumentByFilename("notes.txt")).toBe("other");
  });

  it("is case insensitive", () => {
    expect(classifyDocumentByFilename("MY_RESUME.PDF")).toBe("resume");
    expect(classifyDocumentByFilename("COVER_LETTER.pdf")).toBe("cover_letter");
  });
});

describe("classifyDocumentByContent", () => {
  it("detects a realistic cover-letter upload even when the filename is generic", () => {
    const fixture = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/dogfood/cover-letter-upload-prose.md",
      ),
      "utf8",
    );

    expect(classifyDocumentByContent(fixture)).toBe("cover_letter");
  });

  it("detects a commented tracked-change cover letter that mentions a referral recommendation", () => {
    const fixture = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/dogfood/cover-letter-tracked-comments.md",
      ),
      "utf8",
    );

    expect(classifyDocumentByContent(fixture)).toBe("cover_letter");
  });

  it("detects reference letters from explicit recommender language", () => {
    expect(
      classifyDocumentByContent(
        "Dear Hiring Manager,\n\nI am pleased to recommend Jordan Lee for the Software Engineer position. Jordan is an exceptional teammate.\n\nSincerely,\nAvery Patel",
      ),
    ).toBe("reference_letter");
  });

  it("detects a realistic resume upload from content when the filename is generic", () => {
    const fixture = readFileSync(
      path.join(process.cwd(), "tests/fixtures/dogfood/edge-case-resume.md"),
      "utf8",
    );

    expect(classifyDocumentByContent(fixture)).toBe("resume");
  });

  it("does not force a classification for unstructured notes", () => {
    expect(
      classifyDocumentByContent("Notes from the meetup about hiring trends."),
    ).toBeNull();
  });

  it("detects portfolio content from project links and case-study signals", () => {
    expect(
      classifyDocumentByContent(
        "Selected Work\n\nCase Study: Launch Metrics\nGitHub: https://github.com/ada/launch\nStack: Next.js, PostgreSQL\nDemo: https://launch-metrics.app",
      ),
    ).toBe("portfolio");
  });

  it("detects career notes from loose bullet-heavy material without resume headers", () => {
    expect(
      classifyDocumentByContent(
        "Career notes\n- Improved onboarding completion by 18%\n- Mentored two interns\n- Built Project Atlas for support teams",
      ),
    ).toBe("career_notes");
  });

  it("keeps a strong resume as resume even when it mentions a portfolio", () => {
    expect(
      classifyDocumentByContent(
        "Ada Lovelace\nada@example.com\nhttps://github.com/ada\n\nExperience\nBuilt a portfolio review system.\n\nEducation\nBS Computer Science\n\nSkills\nReact, TypeScript",
      ),
    ).toBe("resume");
  });
});

describe("classifyDocumentWithLLM", () => {
  const mockConfig: LLMConfig = {
    provider: "openai",
    apiKey: "test-key",
    model: "gpt-4",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns classified type from LLM response", async () => {
    mockComplete.mockResolvedValue('{"type": "resume"}');
    mockParseJSON.mockReturnValue({ type: "resume" });

    const result = await classifyDocumentWithLLM(
      "John Doe\nSoftware Engineer",
      mockConfig,
    );
    expect(result).toBe("resume");
  });

  it("returns cover_letter for cover letter classification", async () => {
    mockComplete.mockResolvedValue('{"type": "cover_letter"}');
    mockParseJSON.mockReturnValue({ type: "cover_letter" });

    const result = await classifyDocumentWithLLM(
      "Dear Hiring Manager",
      mockConfig,
    );
    expect(result).toBe("cover_letter");
  });

  it("returns career_notes for career notes classification", async () => {
    mockComplete.mockResolvedValue('{"type": "career_notes"}');
    mockParseJSON.mockReturnValue({ type: "career_notes" });

    const result = await classifyDocumentWithLLM(
      "- wins\n- skills\n- projects",
      mockConfig,
    );
    expect(result).toBe("career_notes");
  });

  it("returns other for invalid LLM response type", async () => {
    mockComplete.mockResolvedValue('{"type": "invalid_type"}');
    mockParseJSON.mockReturnValue({ type: "invalid_type" });

    const result = await classifyDocumentWithLLM("random text", mockConfig);
    expect(result).toBe("other");
  });

  it("returns other when LLM returns empty type", async () => {
    mockComplete.mockResolvedValue('{"type": ""}');
    mockParseJSON.mockReturnValue({ type: "" });

    const result = await classifyDocumentWithLLM("random text", mockConfig);
    expect(result).toBe("other");
  });

  it("only sends first 500 chars to LLM", async () => {
    mockComplete.mockResolvedValue('{"type": "resume"}');
    mockParseJSON.mockReturnValue({ type: "resume" });

    const longText = "a".repeat(1000);
    await classifyDocumentWithLLM(longText, mockConfig);

    const calledContent = mockComplete.mock.calls[0][0].messages[0].content;
    // The prompt + snippet should not contain the full 1000 chars
    expect(calledContent).not.toContain("a".repeat(1000));
  });
});

describe("classifyDocument", () => {
  const mockConfig: LLMConfig = {
    provider: "openai",
    apiKey: "test-key",
    model: "gpt-4",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to filename when no LLM config", async () => {
    const result = await classifyDocument("some text", "my_resume.pdf", null);
    expect(result).toBe("resume");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("uses content heuristics before filename fallback when no LLM config", async () => {
    const fixture = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/dogfood/cover-letter-upload-prose.md",
      ),
      "utf8",
    );

    const result = await classifyDocument(fixture, "letter-to-team.txt", null);

    expect(result).toBe("cover_letter");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("does not let referral wording turn a cover-letter upload into a reference letter", async () => {
    const fixture = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/dogfood/cover-letter-tracked-comments.md",
      ),
      "utf8",
    );

    const result = await classifyDocument(
      fixture,
      "application-draft.txt",
      null,
    );

    expect(result).toBe("cover_letter");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("falls back to filename when no text", async () => {
    const result = await classifyDocument(
      undefined,
      "cover_letter.pdf",
      mockConfig,
    );
    expect(result).toBe("cover_letter");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("falls back to filename when text is empty", async () => {
    const result = await classifyDocument(
      "",
      "certificate_aws.pdf",
      mockConfig,
    );
    expect(result).toBe("certificate");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("uses LLM when text and config are available", async () => {
    mockComplete.mockResolvedValue('{"type": "reference_letter"}');
    mockParseJSON.mockReturnValue({ type: "reference_letter" });

    const result = await classifyDocument(
      "To whom it may concern",
      "document.pdf",
      mockConfig,
    );
    expect(result).toBe("reference_letter");
    expect(mockComplete).toHaveBeenCalled();
  });

  it("falls back to filename when LLM throws", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockComplete.mockRejectedValue(new Error("API error"));

    const result = await classifyDocument(
      "some text",
      "my_resume.pdf",
      mockConfig,
    );
    expect(result).toBe("resume");
    expect(consoleError).toHaveBeenCalledWith(
      "LLM classification failed, falling back to filename:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
