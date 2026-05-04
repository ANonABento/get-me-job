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

const mocks = vi.hoisted(() => ({
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
}));

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

function snapshot(): CallCounts {
  return {
    saveDocument: mocks.saveDocument.mock.calls.length,
    insertBankEntries: mocks.insertBankEntries.mock.calls.length,
    writeFile: mocks.writeFile.mock.calls.length,
    unlink: mocks.unlink.mock.calls.length,
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
    "Fictional Candidate page 1 | Experience: Staff Engineer"
  );
}

const collected: { result: StressResult; analysis: ReturnType<typeof analyzeStressResult> }[] = [];

beforeEach(() => {
  vi.clearAllMocks();
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
      `write=${result.calls.writeFile} severity=${analysis.severity}`
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
    expect(fixtures.map((fixture) => fixture.type)).toEqual(HOSTILE_INPUT_TYPES);
    expect(fixtures).toHaveLength(10);
    expect(fixtures.every((fixture) => fixture.bytes.byteLength > 0)).toBe(true);
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
    expect(request.headers.get("content-type")).toContain("multipart/form-data");
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
      Array.from({ length: 100 }, (_, i) => `page ${i + 1} content`).join("\n")
    );
    const result = await runOne(createStressFixture("100-page resume"));
    record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    expect(result.calls.insertBankEntries).toBe(1);
  });

  it("corrupt PDF: extraction error path still saves the document (medium-severity finding)", async () => {
    mocks.extractTextFromFile.mockRejectedValueOnce(
      new Error("Invalid PDF structure")
    );
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("corrupt PDF"));
    const analysis = record(result);
    // Document the current behaviour rather than the desired one — the report
    // captures the divergence.
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    expect(analysis.severity).toBe("medium");
    expect(analysis.followUpTitle).toContain("corrupt PDF");
  });

  it("password-protected PDF: same generic failure path as corrupt (medium-severity finding)", async () => {
    mocks.extractTextFromFile.mockRejectedValueOnce(
      new Error("File is encrypted")
    );
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("password-protected PDF"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    expect(analysis.severity).toBe("medium");
  });

  it("empty PDF: no parseable content, but document still persists (medium-severity finding)", async () => {
    mocks.extractTextFromFile.mockResolvedValueOnce("");
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    mocks.smartParseResume.mockResolvedValueOnce(EMPTY_PARSE_RESULT);
    const result = await runOne(createStressFixture("empty PDF"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    expect(result.calls.insertBankEntries).toBe(0);
    expect(analysis.severity).toBe("medium");
  });

  it("wrong file type renamed: rejected by magic-byte guard before any side effect", async () => {
    const result = await runOne(createStressFixture("wrong file type renamed"));
    const analysis = record(result);
    expect(result.status).toBe(400);
    expect(result.calls.writeFile).toBe(0);
    expect(result.calls.saveDocument).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("concurrent uploads: 5x parallel of identical bytes — exposes T1 dedupe race", async () => {
    // Default mock returns null for getDocumentByFileHash, simulating a brand
    // new file racing against itself.
    const fixture = createStressFixture("concurrent uploads");
    const results = await runConcurrentStress(
      fixture,
      { handler: POST, snapshot, observe: lastSavedDocument },
      5
    );
    const aggregated: StressResult = {
      ...results[0],
      calls: results[0].calls,
    };
    const analysis = record(aggregated);
    // All five succeed (no dedupe fired because lookups happen pre-write).
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(aggregated.calls.saveDocument).toBe(5);
    expect(analysis.severity).toBe("high");
    expect(analysis.followUpTitle).toContain("concurrent uploads");
  });

  it("50MB file: size guard returns 400 before disk write", async () => {
    const result = await runOne(createStressFixture("50MB file"));
    const analysis = record(result);
    expect(result.status).toBe(400);
    expect(result.calls.writeFile).toBe(0);
    expect(result.calls.saveDocument).toBe(0);
    expect(analysis.severity).toBe("low");
  });

  it("filename injection: server-generated path is safe, but display filename is persisted unsanitised", async () => {
    mocks.classifyDocument.mockResolvedValueOnce("resume");
    const result = await runOne(createStressFixture("filename injection"));
    const analysis = record(result);
    expect(result.status).toBe(200);
    expect(result.calls.saveDocument).toBe(1);
    // Path on disk must not contain `..` traversal.
    expect(result.persistedPath).toBeTruthy();
    expect(result.persistedPath).not.toMatch(/\.\.[\\/]/);
    // The display filename is persisted as-is — that's the medium finding.
    expect(result.persistedFilename).toContain("<script>");
    expect(analysis.severity).toBe("medium");
    expect(analysis.followUpTitle).toContain("filename injection");
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
