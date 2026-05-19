import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  saveDocument: vi.fn(),
  getDocumentByFileHash: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getLLMConfig: vi.fn(),
  saveDocumentArtifact: vi.fn(),
  deleteSourceDocuments: vi.fn(),
  listBankEntriesPaginated: vi.fn(),
  updateBankEntryForUser: vi.fn(),
  updateBankEntryPositions: vi.fn(),
  populateBankFromProfile: vi.fn(),
  populateBankFromParsedDocument: vi.fn(),
  extractTextFromFile: vi.fn(),
  cachePdfBytes: vi.fn(),
  deriveHeaderSearchNeedles: vi.fn(),
  deriveSearchNeedles: vi.fn(),
  extractPdfPositions: vi.fn(),
  findPositionsForText: vi.fn(),
  findSourceLinksForBboxes: vi.fn(),
  classifyDocument: vi.fn(),
  smartParseResume: vi.fn(),
  extractDocumentSourceMap: vi.fn(),
  isLLMConfigured: vi.fn(),
}));

vi.mock("fs/promises", () => {
  const mocked = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };
  return { ...mocked, default: mocked };
});

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  saveDocument: mocks.saveDocument,
  getDocumentByFileHash: mocks.getDocumentByFileHash,
  getProfile: mocks.getProfile,
  updateProfile: mocks.updateProfile,
  getLLMConfig: mocks.getLLMConfig,
  saveDocumentArtifact: mocks.saveDocumentArtifact,
}));

vi.mock("@/lib/llm/is-configured", () => ({
  isLLMConfigured: mocks.isLLMConfigured,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  deleteSourceDocuments: mocks.deleteSourceDocuments,
  listBankEntriesPaginated: mocks.listBankEntriesPaginated,
  updateBankEntryForUser: mocks.updateBankEntryForUser,
  updateBankEntryPositions: mocks.updateBankEntryPositions,
}));

vi.mock("@/lib/parse/pdf-cache", () => ({
  cachePdfBytes: mocks.cachePdfBytes,
}));

vi.mock("@/lib/parse/pdf-positions", () => ({
  deriveHeaderSearchNeedles: mocks.deriveHeaderSearchNeedles,
  deriveSearchNeedles: mocks.deriveSearchNeedles,
  extractPdfPositions: mocks.extractPdfPositions,
  findPositionsForText: mocks.findPositionsForText,
  findSourceLinksForBboxes: mocks.findSourceLinksForBboxes,
}));

vi.mock("@/lib/resume/info-bank", () => ({
  populateBankFromProfile: mocks.populateBankFromProfile,
  populateBankFromParsedDocument: mocks.populateBankFromParsedDocument,
}));

vi.mock("@/lib/parser/pdf", () => ({
  extractTextFromFile: mocks.extractTextFromFile,
}));

vi.mock("@/lib/parser/document-classifier", () => ({
  classifyDocument: mocks.classifyDocument,
}));

vi.mock("@/lib/parser/smart-parser", () => ({
  smartParseResume: mocks.smartParseResume,
}));

vi.mock("@/lib/ingest/extract-document", () => ({
  extractDocumentSourceMap: mocks.extractDocumentSourceMap,
}));

import { POST } from "./route";

function uploadRequest(file: File | null, url = "http://localhost/api/upload") {
  const formData = {
    get: vi.fn().mockReturnValue(file),
  };
  return {
    nextUrl: new URL(url),
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest;
}

function pdfFile(name = "test-resume.pdf") {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    name,
    type: "application/pdf",
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

function fileWithBytes(name: string, type: string, bytes: Uint8Array): File {
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

function exeMasqueradingAsPdf() {
  // PE/MZ header — Windows executable bytes claiming application/pdf MIME and
  // a .pdf filename. Magic-byte validation must reject this.
  const peHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00]);
  return fileWithBytes("malicious.pdf", "application/pdf", peHeader);
}

describe("upload route dedupe flow", () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getProfile.mockReturnValue(null);
    mocks.getLLMConfig.mockReturnValue(null);
    mocks.isLLMConfigured.mockReturnValue(false);
    mocks.extractTextFromFile.mockResolvedValue("resume text");
    mocks.extractDocumentSourceMap.mockResolvedValue({
      sourceMap: {
        pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001"] }],
        lines: [
          {
            id: "p1-l001",
            page: 1,
            text: "resume text",
            tokenIds: [],
            tokens: [],
            bbox: { page: 1, x0: 0, y0: 0, x1: 100, y1: 14 },
          },
        ],
        rawText: "resume text",
      },
      extractorVersion: "pdf-source-map-v1",
      links: [],
      ocrUsed: false,
    });
    mocks.saveDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "doc-generated",
      sourceMap: { lines: [{ id: "p1-l001" }] },
    });
    mocks.classifyDocument.mockResolvedValue("resume");
    mocks.smartParseResume.mockResolvedValue({
      profile: {
        experiences: [
          {
            company: "Acme Corp",
            title: "Senior Developer",
          },
        ],
      },
      confidence: 0.9,
      sectionsDetected: ["experience"],
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    });
    mocks.populateBankFromProfile.mockReturnValue({
      inserted: 1,
      updated: 0,
      skipped: 0,
    });
    mocks.populateBankFromParsedDocument.mockReturnValue({
      inserted: 1,
      updated: 0,
      skipped: 0,
    });
    mocks.listBankEntriesPaginated.mockReturnValue([
      {
        id: "entry-root",
        userId: "user-1",
        category: "project",
        content: { name: "Portfolio" },
        sourceOrder: 0,
        confidenceScore: 0.9,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mocks.extractPdfPositions.mockResolvedValue({
      items: [],
      links: [],
      pageDimensions: [],
    });
    mocks.deriveHeaderSearchNeedles.mockReturnValue(["Portfolio"]);
    mocks.deriveSearchNeedles.mockReturnValue(["Portfolio"]);
    mocks.findPositionsForText.mockReturnValue([[1, 72, 100, 160, 112]]);
    mocks.findSourceLinksForBboxes.mockReturnValue([]);
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it("rejects an .exe masquerading as a .pdf via magic-byte validation", async () => {
    const response = await POST(uploadRequest(exeMasqueradingAsPdf()));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("does not match"),
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
    expect(mocks.extractTextFromFile).not.toHaveBeenCalled();
  });

  it("rejects a disallowed MIME type", async () => {
    const html = new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e]);
    const response = await POST(
      uploadRequest(fileWithBytes("payload.html", "text/html", html)),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("Invalid file type"),
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("rejects requests without a file", async () => {
    const response = await POST(uploadRequest(null));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "No file provided",
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
    expect(mocks.extractTextFromFile).not.toHaveBeenCalled();
  });

  it("rejects invalid force query values", async () => {
    const response = await POST(
      uploadRequest(pdfFile(), "http://localhost/api/upload?force=maybe"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
      errors: [{ field: "force" }],
    });
    expect(mocks.extractTextFromFile).not.toHaveBeenCalled();
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("does not write per-request filenames, sizes, or hashes to debug logs", async () => {
    const rawFilename =
      "Jane_Doe_Private_Resume_2026_With_Confidential_Client_List.pdf";
    const expectedFileHash =
      "39d0e488b426fbbabef21b84b1f8195e16a1e55e39c25b2508d2576489c84214";
    const file = pdfFile(rawFilename);

    const response = await POST(uploadRequest(file));

    expect(response.status).toBe(200);
    const debugOutput = debugSpy.mock.calls
      .map((args: unknown[]) =>
        args
          .map((arg: unknown) =>
            typeof arg === "string" ? arg : JSON.stringify(arg),
          )
          .join(" "),
      )
      .join("\n");
    const debugFields = debugSpy.mock.calls.flatMap((args: unknown[]) =>
      args.filter(
        (arg): arg is Record<string, unknown> =>
          typeof arg === "object" && arg !== null && !Array.isArray(arg),
      ),
    );

    expect(debugOutput).not.toContain(rawFilename);
    expect(debugOutput).not.toContain(expectedFileHash);
    expect(debugFields).not.toContainEqual(
      expect.objectContaining({ filenameHash: expect.any(String) }),
    );
    expect(debugFields).not.toContainEqual(
      expect.objectContaining({ size: file.size }),
    );
    expect(debugFields).not.toContainEqual(
      expect.objectContaining({ fileHash: expectedFileHash }),
    );
  });

  it("returns 409 with existing document metadata when the file hash already exists", async () => {
    mocks.getDocumentByFileHash.mockReturnValueOnce({
      id: "doc-existing",
      filename: "test-resume.pdf",
      type: "resume",
      size: 5,
      path: "/tmp/test-resume.pdf",
      uploadedAt: "2024-01-01T09:00:00.000Z",
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Duplicate file upload",
      existing: {
        id: "doc-existing",
        filename: "test-resume.pdf",
        uploaded_at: "2024-01-01T09:00:00.000Z",
      },
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("deletes the previous source document and accepts the upload when forced", async () => {
    mocks.getDocumentByFileHash.mockReturnValueOnce({
      id: "doc-existing",
      filename: "test-resume.pdf",
      type: "resume",
      size: 5,
      path: "/tmp/test-resume.pdf",
      uploadedAt: "2024-01-01T09:00:00.000Z",
    });

    const response = await POST(
      uploadRequest(pdfFile(), "http://localhost/api/upload?force=true"),
    );

    expect(response.status).toBe(200);
    expect(mocks.deleteSourceDocuments).toHaveBeenCalledWith(
      ["doc-existing"],
      "user-1",
    );
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "test-resume.pdf",
        fileHash: expect.any(String),
      }),
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 1,
      document: {
        id: expect.any(String),
        filename: "test-resume.pdf",
      },
    });
    expect(mocks.populateBankFromProfile).toHaveBeenCalledWith(
      expect.objectContaining({ experiences: expect.any(Array) }),
      expect.any(String),
      "user-1",
    );
  });

  it("parses resume upload with deterministic parser only (no AI config)", async () => {
    await POST(uploadRequest(pdfFile()));

    expect(mocks.smartParseResume).toHaveBeenCalledWith("resume text", null);
    expect(mocks.classifyDocument).toHaveBeenCalledWith(
      "resume text",
      "test-resume.pdf",
      null,
    );
  });

  it("persists a parser-v2 source artifact after saving the legacy document row", async () => {
    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.extractDocumentSourceMap).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      filename: "test-resume.pdf",
      mimeType: "application/pdf",
    });
    expect(mocks.saveDocumentArtifact).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: expect.any(String),
        userId: "user-1",
        extractorVersion: "pdf-source-map-v1",
        status: "ready",
        links: [],
        ocrUsed: false,
      }),
    );
  });

  it("keeps legacy upload successful when parser-v2 artifact extraction fails", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mocks.extractDocumentSourceMap.mockRejectedValueOnce(
      new Error("source map unavailable"),
    );

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 1,
    });
    expect(mocks.saveDocument).toHaveBeenCalled();
    expect(mocks.populateBankFromProfile).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("routes the classifier through the user's configured LLM provider", async () => {
    // Regression: previously the classifier received `null` even when the user
    // had configured OpenAI in /settings/llm, leaving the upstream code to
    // call Ollama via the default fallback. The classifier must now see the
    // exact provider/model the user selected.
    const userConfig = {
      provider: "openai" as const,
      model: "gpt-4o-mini",
      apiKey: "sk-user-key",
    };
    mocks.getLLMConfig.mockReturnValueOnce(userConfig);
    mocks.isLLMConfigured.mockReturnValueOnce(true);

    await POST(uploadRequest(pdfFile()));

    expect(mocks.getLLMConfig).toHaveBeenCalledWith("user-1");
    expect(mocks.isLLMConfigured).toHaveBeenCalledWith(userConfig);
    expect(mocks.classifyDocument).toHaveBeenCalledWith(
      "resume text",
      "test-resume.pdf",
      userConfig,
    );
    // Smart parser stays gated behind /api/parse — upload itself remains
    // deterministic regardless of provider config.
    expect(mocks.smartParseResume).toHaveBeenCalledWith("resume text", null);
  });

  it("passes null to the classifier when the user's LLM config is incomplete", async () => {
    // E.g. provider chosen but no apiKey + no env fallback. `isLLMConfigured`
    // returns false; the classifier must not see a half-baked config (which
    // would surface as a confusing 401/connection error from the provider).
    const incompleteConfig = {
      provider: "openai" as const,
      model: "gpt-4o-mini",
    };
    mocks.getLLMConfig.mockReturnValueOnce(incompleteConfig);
    mocks.isLLMConfigured.mockReturnValueOnce(false);

    await POST(uploadRequest(pdfFile()));

    expect(mocks.classifyDocument).toHaveBeenCalledWith(
      "resume text",
      "test-resume.pdf",
      null,
    );
  });

  it("skips smart resume parsing for non-resume documents", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("cover_letter");
    mocks.populateBankFromParsedDocument.mockReturnValueOnce({
      inserted: 0,
      updated: 0,
      skipped: 0,
    });

    const response = await POST(uploadRequest(pdfFile("cover-letter.pdf")));

    expect(response.status).toBe(200);
    expect(mocks.smartParseResume).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 0,
    });
  });

  it("parses cover letter uploads into reviewable career-document entries", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("cover_letter");
    mocks.extractTextFromFile.mockResolvedValueOnce(
      "Dear Hiring Manager,\n\nI am applying for the Product Engineer role at Acme Corp because I have built onboarding systems that improved activation by 22%.\n\nAt Beta, I led a cross-functional launch for 12,000 users and shipped reusable analytics dashboards.\n\nSincerely,\nAda",
    );

    const response = await POST(
      uploadRequest(
        fileWithBytes(
          "cover-letter.txt",
          "text/plain",
          new TextEncoder().encode("cover letter"),
        ),
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.smartParseResume).not.toHaveBeenCalled();
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cover_letter",
        parsedData: expect.objectContaining({
          docType: "cover_letter",
          data: expect.objectContaining({
            reusableParagraphs: expect.arrayContaining([
              expect.stringContaining("Product Engineer"),
            ]),
            keySellingPoints: expect.arrayContaining([
              expect.stringContaining("improved activation"),
            ]),
          }),
        }),
      }),
      "user-1",
    );
    expect(mocks.populateBankFromParsedDocument).toHaveBeenCalledWith(
      expect.objectContaining({ docType: "cover_letter" }),
      expect.any(String),
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 1,
    });
  });

  it("parses portfolio uploads without routing through resume parsing", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("portfolio");
    mocks.extractTextFromFile.mockResolvedValueOnce(
      "Portfolio\n\nProject: Launch Metrics\nhttps://github.com/ada/launch-metrics\nStack: Next.js, PostgreSQL\n- Built dashboards for 12,000 users\n- Reduced reporting latency by 45%",
    );

    const response = await POST(
      uploadRequest(
        fileWithBytes(
          "portfolio.txt",
          "text/plain",
          new TextEncoder().encode("portfolio"),
        ),
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.smartParseResume).not.toHaveBeenCalled();
    expect(mocks.populateBankFromParsedDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        docType: "portfolio",
        data: expect.objectContaining({
          projects: expect.arrayContaining([
            expect.objectContaining({
              name: "Launch Metrics",
              url: "https://github.com/ada/launch-metrics",
              technologies: ["Next.js", "PostgreSQL"],
            }),
          ]),
        }),
      }),
      expect.any(String),
      "user-1",
    );
  });

  it("parses career notes uploads into low-confidence component data", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("career_notes");
    mocks.extractTextFromFile.mockResolvedValueOnce(
      "Career notes\nSkills: React, facilitation\n- Improved onboarding completion by 18% after rewriting setup flow\n- Built Project Atlas for support teams\n- Mentored two interns on testing habits",
    );

    const response = await POST(
      uploadRequest(
        fileWithBytes(
          "career-notes.txt",
          "text/plain",
          new TextEncoder().encode("career notes"),
        ),
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.smartParseResume).not.toHaveBeenCalled();
    expect(mocks.populateBankFromParsedDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        docType: "career_notes",
        data: expect.objectContaining({
          bullets: expect.arrayContaining([
            expect.stringContaining("Improved onboarding"),
          ]),
          achievements: expect.arrayContaining([
            expect.stringContaining("18%"),
          ]),
          skills: ["React", "facilitation"],
        }),
      }),
      expect.any(String),
      "user-1",
    );
  });

  it("auto-promotes parsed resume data into all structured profile sections", async () => {
    const parsedProfile = {
      contact: {
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
      summary: "Analytical computing pioneer",
      experiences: [
        {
          id: "exp-1",
          company: "Analytical Engines",
          title: "Programmer",
          startDate: "1842",
          current: false,
          description: "Wrote notes",
          highlights: ["Wrote notes"],
          skills: ["Math"],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "Self-directed",
          degree: "Mathematics",
          field: "Computing",
          highlights: [],
        },
      ],
      skills: [
        {
          id: "skill-1",
          name: "Mathematics",
          category: "technical",
        },
      ],
      projects: [
        {
          id: "project-1",
          name: "Algorithm",
          description: "First published algorithm",
          technologies: ["Analytical Engine"],
          highlights: [],
        },
      ],
    };
    mocks.smartParseResume.mockResolvedValueOnce({
      profile: parsedProfile,
      confidence: 0.95,
      sectionsDetected: ["experience", "education", "skills", "projects"],
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.populateBankFromProfile).toHaveBeenCalledWith(
      parsedProfile,
      expect.any(String),
      "user-1",
    );
    expect(mocks.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        contact: parsedProfile.contact,
        summary: parsedProfile.summary,
        experiences: parsedProfile.experiences,
        education: parsedProfile.education,
        skills: parsedProfile.skills,
        projects: parsedProfile.projects,
      }),
      "user-1",
    );
  });

  it("preserves manually edited contact fields during auto-promotion", async () => {
    mocks.getProfile.mockReturnValueOnce({
      id: "user-1",
      contact: {
        name: "Manual Name",
      },
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    });
    mocks.smartParseResume.mockResolvedValueOnce({
      profile: {
        contact: {
          name: "Parsed Name",
          email: "parsed@example.com",
        },
      },
      confidence: 0.95,
      sectionsDetected: ["contact"],
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        contact: {
          name: "Manual Name",
          email: "parsed@example.com",
        },
      }),
      "user-1",
    );
  });

  it("keeps upload successful when profile auto-promotion fails", async () => {
    mocks.updateProfile.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 1,
    });
    expect(mocks.saveDocument).toHaveBeenCalled();
    expect(mocks.populateBankFromProfile).toHaveBeenCalled();
  });

  it("stores header bboxes, bullet bboxes, source order, and PDF links during upload matching", async () => {
    mocks.listBankEntriesPaginated.mockReturnValueOnce([
      {
        id: "project-1",
        userId: "user-1",
        category: "project",
        content: { name: "Portfolio" },
        sourceOrder: 3,
        confidenceScore: 0.9,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "bullet-1",
        userId: "user-1",
        category: "bullet",
        content: {
          description: "Built dashboards",
          parentId: "project-1",
          order: 0,
        },
        sourceOrder: 4,
        confidenceScore: 0.85,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mocks.findPositionsForText
      .mockReturnValueOnce([[1, 72, 100, 160, 112]])
      .mockReturnValueOnce([[1, 72, 100, 300, 112]])
      .mockReturnValueOnce([[1, 84, 116, 320, 128]]);
    mocks.findSourceLinksForBboxes.mockReturnValueOnce([
      {
        url: "https://example.com/portfolio",
        text: "Portfolio",
        page: 1,
        bbox: [1, 160, 100, 180, 112],
      },
    ]);

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.updateBankEntryForUser).toHaveBeenCalledWith(
      "project-1",
      "user-1",
      expect.objectContaining({
        name: "Portfolio",
        url: "https://example.com/portfolio",
      }),
      0.9,
    );
    expect(mocks.updateBankEntryPositions).toHaveBeenCalledWith(
      "project-1",
      "user-1",
      expect.objectContaining({
        page: 1,
        bboxes: [[1, 72, 100, 300, 112]],
        headerBboxes: [[1, 72, 100, 160, 112]],
        sourceLinks: [
          {
            url: "https://example.com/portfolio",
            text: "Portfolio",
            page: 1,
            bbox: [1, 160, 100, 180, 112],
          },
        ],
      }),
    );
    expect(mocks.updateBankEntryPositions).toHaveBeenCalledWith(
      "bullet-1",
      "user-1",
      expect.objectContaining({
        page: 1,
        bboxes: [[1, 84, 116, 320, 128]],
      }),
    );
    expect(mocks.findPositionsForText).toHaveBeenLastCalledWith(
      "Portfolio",
      [],
      expect.objectContaining({
        category: "bullet",
        anchorBbox: expect.objectContaining({ page: 1, y0: 100 }),
      }),
    );
  });

  it("promotes PDF links into generic component URLs without overwriting explicit URLs", async () => {
    mocks.listBankEntriesPaginated.mockReturnValueOnce([
      {
        id: "experience-1",
        userId: "user-1",
        category: "experience",
        content: { title: "Engineer", company: "Acme" },
        sourceOrder: 1,
        confidenceScore: 0.9,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "cert-1",
        userId: "user-1",
        category: "certification",
        content: {
          name: "AWS Cert",
          issuer: "AWS",
          url: "https://explicit.example/cert",
        },
        sourceOrder: 2,
        confidenceScore: 0.95,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mocks.findPositionsForText
      .mockReturnValueOnce([[1, 72, 100, 160, 112]])
      .mockReturnValueOnce([[1, 72, 100, 300, 112]])
      .mockReturnValueOnce([[1, 72, 140, 160, 152]])
      .mockReturnValueOnce([[1, 72, 140, 300, 152]]);
    mocks.findSourceLinksForBboxes
      .mockReturnValueOnce([
        {
          url: "https://acme.example",
          text: "Engineer Acme",
          page: 1,
          bbox: [1, 160, 100, 180, 112],
        },
      ])
      .mockReturnValueOnce([
        {
          url: "https://annotation.example/cert",
          text: "AWS Cert",
          page: 1,
          bbox: [1, 160, 140, 180, 152],
        },
      ]);

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.updateBankEntryForUser).toHaveBeenCalledTimes(1);
    expect(mocks.updateBankEntryForUser).toHaveBeenCalledWith(
      "experience-1",
      "user-1",
      expect.objectContaining({
        title: "Engineer",
        company: "Acme",
        url: "https://acme.example",
      }),
      0.9,
    );
  });
});
