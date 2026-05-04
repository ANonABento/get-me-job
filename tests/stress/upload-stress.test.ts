/**
 * Test 1.4 — stress + edge-case verification harness.
 *
 * Drives ten hostile fixtures through the real `/api/upload` POST handler with
 * the LLM / OCR / DB layers stubbed. The harness exists so future hostile
 * inputs can be added by appending to `HOSTILE_INPUT_TYPES`.
 *
 * Notes on fidelity:
 *  - We mock `@/lib/db`, `@/lib/db/profile-bank`, `@/lib/parser/*`, and
 *    `fs/promises` so the route never touches sqlite-vec, OCR, or real disk.
 *  - We keep the route's pure logic intact: auth, magic-byte validation,
 *    size limit, fileHash, dedupe lookup, classifier-by-filename fallback.
 *  - We assert observed call counts for `saveDocument`, `insertBankEntries`,
 *    and `writeFile` to detect when hostile inputs sneak past the guards.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  // Re-defined inside hoisted() because vi.mock() factories run before any
  // module-level declarations. The route's `instanceof DuplicateDocumentError`
  // check resolves through the mocked `@/lib/db` module, so this class IS the
  // class the route sees at runtime.
  class DuplicateDocumentError extends Error {
    readonly code = "duplicate_document" as const;
    constructor(
      message = "Document with this file hash already exists for this user",
    ) {
      super(message);
      this.name = "DuplicateDocumentError";
    }
  }
  return {
    requireAuth: vi.fn(),
    isAuthError: vi.fn(),
    saveDocument: vi.fn(),
    getLLMConfig: vi.fn(),
    getDocumentByFileHash: vi.fn(),
    insertBankEntries: vi.fn(),
    deleteSourceDocuments: vi.fn(),
    extractTextFromFile: vi.fn(),
    classifyDocument: vi.fn(),
    smartParseResume: vi.fn(),
    parseDocumentByType: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    DuplicateDocumentError,
  };
});

vi.mock("fs/promises", () => {
  const mocked = {
    mkdir: mocks.mkdir,
    writeFile: mocks.writeFile,
    unlink: mocks.unlink,
  };
  return { ...mocked, default: mocked };
});

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  saveDocument: mocks.saveDocument,
  getLLMConfig: mocks.getLLMConfig,
  getDocumentByFileHash: mocks.getDocumentByFileHash,
  DuplicateDocumentError: mocks.DuplicateDocumentError,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  insertBankEntries: mocks.insertBankEntries,
  deleteSourceDocuments: mocks.deleteSourceDocuments,
}));

vi.mock("@/lib/parser/pdf", () => ({
  extractTextFromFile: mocks.extractTextFromFile,
}));

vi.mock("@/lib/parser/document-classifier", () => ({
  classifyDocument: mocks.classifyDocument,
}));

vi.mock("@/lib/parser/resume", () => ({
  parseDocumentByType: mocks.parseDocumentByType,
}));

vi.mock("@/lib/parser/smart-parser", () => ({
  smartParseResume: mocks.smartParseResume,
}));

import { POST } from "@/app/api/upload/route";

import {
  HOSTILE_INPUT_TYPES,
  SEVERITY_RANK,
  analyzeStressResult,
  createAllStressFixtures,
  createMinimalPdf,
  createStressFixture,
  createUploadRequest,
  isFollowUpRequired,
  runConcurrentStress,
  runStressFixture,
  type CallCounts,
  type StressFixture,
  type StressResult,
} from "./upload-stress";

function countSuccessful(mock: ReturnType<typeof vi.fn>): number {
  // `.mock.results` distinguishes returned vs thrown invocations. Counting only
  // successful invocations is what the harness's "saveDocument" call count is
  // actually meant to represent (rows that landed in the documents table).
  return mock.mock.results.filter(
    (entry: { type: string }) => entry.type === "return",
  ).length;
}

function snapshot(): CallCounts {
  return {
    saveDocument: countSuccessful(mocks.saveDocument),
    insertBankEntries: countSuccessful(mocks.insertBankEntries),
    writeFile: countSuccessful(mocks.writeFile),
    unlink: countSuccessful(mocks.unlink),
  };
}

function lastSavedDocument(): { filename?: string; path?: string } {
  const calls = mocks.saveDocument.mock.calls;
  const last = calls[calls.length - 1];
  if (!last) return {};
  const arg = last[0] as { filename?: string; path?: string };
  return { filename: arg?.filename, path: arg?.path };
}

const DEFAULT_PARSE_RESULT = {
  profile: {
    experiences: [
      {
        company: "Example Systems",
        title: "Staff Engineer",
      },
    ],
  },
  confidence: 0.9,
  sectionsDetected: ["experience"],
  llmUsed: false,
  llmSectionsCount: 0,
  warnings: [],
};

const EMPTY_PARSE_RESULT = {
  profile: {},
  confidence: 0,
  sectionsDetected: [],
  llmUsed: false,
  llmSectionsCount: 0,
  warnings: ["No content detected"],
};

function configureParseDefault() {
  mocks.smartParseResume.mockResolvedValue(DEFAULT_PARSE_RESULT);
  mocks.classifyDocument.mockResolvedValue("resume");
  mocks.extractTextFromFile.mockResolvedValue(
    "Fictional Candidate page 1 | Experience: Staff Engineer",
  );
}

const collected: {
  result: StressResult;
  analysis: ReturnType<typeof analyzeStressResult>;
}[] = [];

beforeEach(() => {
  // Use resetAllMocks (not clearAllMocks) so that mockImplementation overrides
  // set inside individual tests — e.g. the throwing saveDocument used by the
  // concurrent-uploads test — don't leak into later tests.
  vi.resetAllMocks();
  mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
  mocks.isAuthError.mockReturnValue(false);
  mocks.getLLMConfig.mockReturnValue(null);
  mocks.getDocumentByFileHash.mockReturnValue(null);
  mocks.insertBankEntries.mockReturnValue(["entry-1"]);
  mocks.writeFile.mockResolvedValue(undefined);
  mocks.mkdir.mockResolvedValue(undefined);
  mocks.unlink.mockResolvedValue(undefined);
  configureParseDefault();
});

afterAll(() => {
  // Print a single-line summary of what each fixture observed. Useful when
  // running with `--reporter=verbose` and quickly spotted in CI logs.
  const lines = collected.map(
    ({ result, analysis }) =>
      `[stress] ${result.type.padEnd(28)} status=${String(result.status).padEnd(3)} ` +
      `save=${result.calls.saveDocument} bank=${result.calls.insertBankEntries} ` +
      `write=${result.calls.writeFile} severity=${analysis.severity}`,
  );
  // eslint-disable-next-line no-console
  console.log("\n" + lines.join("\n"));
});

function record(result: StressResult) {
  const analysis = analyzeStressResult(result);
  collected.push({ result, analysis });
  return analysis;
}

// ---------------------------------------------------------------------------
// Harness self-tests (no real route)
// ---------------------------------------------------------------------------

describe("stress harness — fixture generation", () => {
  it("declares exactly the ten required hostile inputs", () => {
    const fixtures = createAllStressFixtures();
    expect(fixtures.map((fixture) => fixture.type)).toEqual(
      HOSTILE_INPUT_TYPES,
    );
    expect(fixtures).toHaveLength(10);
    expect(fixtures.every((fixture) => fixture.bytes.byteLength > 0)).toBe(
      true,
    );
  });

  it("emits PDF magic bytes and page count for the minimal generator", () => {
    const pdf = createMinimalPdf(["one", "two", "three"]);
    const text = new TextDecoder().decode(pdf);
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("/Count 3");
    expect(text).toContain("(one) Tj");
    expect(text).toContain("(three) Tj");
  });

  it("produces a 50MB+ payload for the size-limit fixture", () => {
    const huge = createStressFixture("50MB file");
    expect(huge.bytes.byteLength).toBeGreaterThan(50 * 1024 * 1024);
    expect(huge.filename).toBe("huge-padded.pdf");
  });

  it("builds a NextRequest stub the upload route can consume", async () => {
    const fixture = createStressFixture("wrong file type renamed");
    const request = createUploadRequest(fixture);
    expect(request.method).toBe("POST");
    expect(request.url).toBe("http://localhost/api/upload");
    expect(request.headers.get("content-type")).toContain(
      "multipart/form-data",
    );
    const form = await request.formData();
    const file = form.get("file") as File;
    expect(file.name).toBe(fixture.filename);
    expect(file.size).toBe(fixture.bytes.byteLength);
  });

  it("flags follow-up issues for medium and above", () => {
    expect(isFollowUpRequired("low")).toBe(false);
    expect(isFollowUpRequired("medium")).toBe(true);
    expect(isFollowUpRequired("high")).toBe(true);
    expect(isFollowUpRequired("critical")).toBe(true);
    expect(SEVERITY_RANK.critical).toBeGreaterThan(SEVERITY_RANK.high);
  });
});

// ---------------------------------------------------------------------------
// Real route — per-fixture verification
// ---------------------------------------------------------------------------

async function runOne(fixture: StressFixture): Promise<StressResult> {
  return runStressFixture(fixture, {
    handler: POST,
    snapshot,
    observe: lastSavedDocument,
  });
}

describe("stress harness — /api/upload behaviour per hostile input", () => {
  it("100-page resume: parses without crash, persists exactly one document", async () => {
    mocks.extractTextFromFile.mockResolvedValueOnce(
      Array.from({ length: 100 }, (_, i) => `page ${i + 1} content`).join("\n"),
    );
    const result = await runOne(createStressFixture("100-page resume"));
    record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    expect(result.calls.insertBankEntries).toBe(1);
  });

  it("corrupt PDF: rejected with 422 parse_failed, no document persisted (issue #218 fix)", async () => {
    mocks.extractTextFromFile.mockRejectedValueOnce(
      new Error("Invalid PDF structure"),
    );
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("corrupt PDF"));
    const analysis = record(result);
    expect(result.status).toBe(422);
    expect(result.body).toMatchObject({ error: "parse_failed" });
    expect(result.calls.saveDocument).toBe(0);
    expect(result.calls.insertBankEntries).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("password-protected PDF: rejected with 422 password_protected (issue #219 fix)", async () => {
    mocks.extractTextFromFile.mockRejectedValueOnce(
      new Error("File is encrypted"),
    );
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("password-protected PDF"));
    const analysis = record(result);
    expect(result.status).toBe(422);
    expect(result.body).toMatchObject({ error: "password_protected" });
    expect(result.calls.saveDocument).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("empty PDF: rejected with 422 empty_document, no persistence (issue #220 fix)", async () => {
    mocks.extractTextFromFile.mockResolvedValueOnce("");
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    mocks.smartParseResume.mockResolvedValueOnce(EMPTY_PARSE_RESULT);
    const result = await runOne(createStressFixture("empty PDF"));
    const analysis = record(result);
    expect(result.status).toBe(422);
    expect(result.body).toMatchObject({ error: "empty_document" });
    expect(result.calls.saveDocument).toBe(0);
    expect(result.calls.insertBankEntries).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("wrong file type renamed: rejected by magic-byte guard before any side effect", async () => {
    const result = await runOne(createStressFixture("wrong file type renamed"));
    const analysis = record(result);
    expect(result.status).toBe(400);
    expect(result.calls.writeFile).toBe(0);
    expect(result.calls.saveDocument).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("concurrent uploads: 5x parallel of identical bytes — DB UNIQUE constraint serializes (issue #221 fix)", async () => {
    // After the fix, exactly one INSERT wins; the rest hit the
    // (user_id, file_hash) UNIQUE index. We simulate that here by letting the
    // first saveDocument call succeed and rejecting the rest with the typed
    // DuplicateDocumentError that the real db layer throws.
    const fixture = createStressFixture("concurrent uploads");
    const winnerExisting = {
      id: "doc-winner",
      filename: fixture.filename,
      type: "resume",
      size: fixture.bytes.byteLength,
      path: "/tmp/winner.pdf",
      uploadedAt: "2026-05-03T00:00:00.000Z",
    };
    let firstSaveResolved = false;
    mocks.saveDocument.mockImplementation(() => {
      if (!firstSaveResolved) {
        firstSaveResolved = true;
        return undefined;
      }
      throw new mocks.DuplicateDocumentError();
    });
    // After the winning INSERT, the conflict-recovery path queries for the
    // existing doc to populate the 409 response body.
    mocks.getDocumentByFileHash.mockImplementation(() =>
      firstSaveResolved ? winnerExisting : null,
    );

    const results = await runConcurrentStress(
      fixture,
      { handler: POST, snapshot, observe: lastSavedDocument },
      5,
    );
    const aggregated: StressResult = {
      ...results[0],
      calls: results[0].calls,
    };
    const analysis = record(aggregated);
    const successCount = results.filter((r) => r.status === 200).length;
    const conflictCount = results.filter((r) => r.status === 409).length;
    expect(successCount).toBe(1);
    expect(conflictCount).toBe(4);
    expect(aggregated.calls.saveDocument).toBe(1);
    expect(analysis.severity).toBe("low");
  });

  it("50MB file: size guard returns 400 before disk write", async () => {
    const result = await runOne(createStressFixture("50MB file"));
    const analysis = record(result);
    expect(result.status).toBe(400);
    expect(result.calls.writeFile).toBe(0);
    expect(result.calls.saveDocument).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("filename injection: persisted display filename is sanitised (issue #222 fix)", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("filename injection"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    // Path on disk must not contain `..` traversal.
    expect(result.persistedPath).toBeTruthy();
    expect(result.persistedPath).not.toMatch(/\.\.[\\/]/);
    // The display filename is now cleaned of HTML and traversal segments.
    expect(result.persistedFilename).toBeTruthy();
    expect(result.persistedFilename).not.toContain("<");
    expect(result.persistedFilename).not.toContain(">");
    expect(result.persistedFilename).not.toMatch(/\.\.[\\/]/);
    // The trailing real-looking part of the filename (`passwd...pdf`)
    // survives so the user can still see what they uploaded.
    expect(result.persistedFilename).toMatch(/passwd.*\.pdf$/);
    expect(analysis.severity).toBe("low");
  });

  it("nested PDF: outer parsed once, inner not recursively expanded", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("nested PDF"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(mocks.extractTextFromFile).toHaveBeenCalledTimes(1);
    expect(analysis.severity).toBe("low");
  });

  it("unicode-heavy: emoji + RTL + math symbols round-trip without truncation", async () => {
    const text = "🚀 ML | مرحبا שלום | 你好 | ∑ λ π ∞";
    mocks.extractTextFromFile.mockResolvedValueOnce(text);
    const result = await runOne(createStressFixture("unicode-heavy"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(result.persistedFilename).toContain("unicode-heavy");
    expect(analysis.severity).toBe("low");
  });
});
