import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LLMConfig } from "@/types";

const mockComplete = vi.fn();

vi.mock("@/lib/llm/client", () => ({
  LLMClient: class MockLLMClient {
    complete = mockComplete;
  },
  parseJSONFromLLM: vi.fn(),
}));

import {
  classifyDocumentByFilename,
  classifyDocumentWithLLM,
  classifyDocument,
} from "./document-classifier";
import { parseJSONFromLLM } from "@/lib/llm/client";

const mockParseJSON = vi.mocked(parseJSONFromLLM);

describe("classifyDocumentByFilename", () => {
  it("detects resume by filename", () => {
    expect(classifyDocumentByFilename("my_resume.pdf")).toBe("resume");
    expect(classifyDocumentByFilename("John_Doe_Resume_2024.pdf")).toBe("resume");
  });

  it("detects CV by filename", () => {
    expect(classifyDocumentByFilename("cv_john.pdf")).toBe("resume");
    expect(classifyDocumentByFilename("My-CV.pdf")).toBe("resume");
  });

  it("detects cover letter by filename", () => {
    expect(classifyDocumentByFilename("cover_letter.pdf")).toBe("cover_letter");
    expect(classifyDocumentByFilename("CoverLetter_Google.pdf")).toBe("cover_letter");
    expect(classifyDocumentByFilename("cover-google.pdf")).toBe("cover_letter");
  });

  it("detects reference letter by filename", () => {
    expect(classifyDocumentByFilename("reference_letter.pdf")).toBe("reference_letter");
    expect(classifyDocumentByFilename("recommendation_john.pdf")).toBe("reference_letter");
  });

  it("detects certificate by filename", () => {
    expect(classifyDocumentByFilename("certificate_aws.pdf")).toBe("certificate");
    expect(classifyDocumentByFilename("cert-gcp.pdf")).toBe("certificate");
  });

  it("detects portfolio by filename", () => {
    expect(classifyDocumentByFilename("portfolio.pdf")).toBe("portfolio");
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

    const result = await classifyDocumentWithLLM("John Doe\nSoftware Engineer", mockConfig);
    expect(result).toBe("resume");
  });

  it("returns cover_letter for cover letter classification", async () => {
    mockComplete.mockResolvedValue('{"type": "cover_letter"}');
    mockParseJSON.mockReturnValue({ type: "cover_letter" });

    const result = await classifyDocumentWithLLM("Dear Hiring Manager", mockConfig);
    expect(result).toBe("cover_letter");
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

  it("falls back to filename when no text", async () => {
    const result = await classifyDocument(undefined, "cover_letter.pdf", mockConfig);
    expect(result).toBe("cover_letter");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("falls back to filename when text is empty", async () => {
    const result = await classifyDocument("", "certificate_aws.pdf", mockConfig);
    expect(result).toBe("certificate");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("uses LLM when text and config are available", async () => {
    mockComplete.mockResolvedValue('{"type": "reference_letter"}');
    mockParseJSON.mockReturnValue({ type: "reference_letter" });

    const result = await classifyDocument("To whom it may concern", "document.pdf", mockConfig);
    expect(result).toBe("reference_letter");
    expect(mockComplete).toHaveBeenCalled();
  });

  it("falls back to filename when LLM throws", async () => {
    mockComplete.mockRejectedValue(new Error("API error"));

    const result = await classifyDocument("some text", "my_resume.pdf", mockConfig);
    expect(result).toBe("resume");
  });
});
