import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import {
  HOSTILE_INPUT_TYPES,
  analyzeStressResult,
  createAllStressFixtures,
  createMinimalPdf,
  createStressFixture,
  createUploadRequest,
  uploadConcurrentFixture,
  uploadFixture,
  type StressResult,
} from "./upload-stress";

describe("upload stress harness", () => {
  it("generates every hostile fixture without committing binary assets", () => {
    const fixtures = createAllStressFixtures();

    expect(fixtures.map((fixture) => fixture.type)).toEqual(HOSTILE_INPUT_TYPES);
    expect(fixtures).toHaveLength(10);
    expect(fixtures.every((fixture) => fixture.bytes.byteLength > 0)).toBe(true);
  });

  it("creates PDF fixtures with PDF magic bytes and requested page count", () => {
    const pdf = createMinimalPdf(["one", "two", "three"]);
    const text = new TextDecoder().decode(pdf);

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("/Count 3");
    expect(text).toContain("(one) Tj");
    expect(text).toContain("(two) Tj");
    expect(text).toContain("(three) Tj");
  });

  it("keeps huge files above the configured upload limit target", () => {
    const huge = createStressFixture("huge file");

    expect(huge.bytes.byteLength).toBeGreaterThan(50 * 1024 * 1024);
    expect(huge.filename).toBe("huge-padded.pdf");
  });

  it("builds a real multipart NextRequest for the upload endpoint", () => {
    const fixture = createStressFixture("wrong file type renamed");
    const request = createUploadRequest(fixture);

    expect(request.method).toBe("POST");
    expect(request.url).toBe("http://localhost/api/upload");
    expect(request.headers.get("content-type")).toContain("multipart/form-data");
    expect(request.body).not.toBeNull();
  });

  it("captures upload response, duration, and before/after DB counts", async () => {
    const fixture = createStressFixture("100-page resume");
    const handler = vi.fn(async () => NextResponse.json({ success: true }));
    let documents = 0;
    const counts = {
      documents: () => documents,
      bankEntries: () => 0,
    };

    const resultPromise = uploadFixture(handler, fixture, counts);
    documents = 1;
    const result = await resultPromise;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      type: "100-page resume",
      status: 200,
      body: { success: true },
      documentsBefore: 0,
      documentsAfter: 1,
      bankEntriesBefore: 0,
      bankEntriesAfter: 0,
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("fires concurrent uploads through the same handler", async () => {
    const fixture = createStressFixture("concurrent uploads");
    const handler = vi.fn(async () => NextResponse.json({ success: true }));
    const counts = {
      documents: () => 0,
      bankEntries: () => 0,
    };

    const results = await uploadConcurrentFixture(handler, fixture, counts, 5);

    expect(results).toHaveLength(5);
    expect(handler).toHaveBeenCalledTimes(5);
  });

  it("classifies malformed PDFs that persist data as medium severity", () => {
    const result: StressResult = {
      type: "corrupt PDF",
      status: 200,
      body: { success: true },
      documentsBefore: 0,
      documentsAfter: 1,
      bankEntriesBefore: 0,
      bankEntriesAfter: 0,
      durationMs: 12,
    };

    expect(analyzeStressResult(result)).toEqual({
      graceful: false,
      integrityPreserved: false,
      severity: "medium",
      summary:
        "Upload returned success and persisted a document after extraction produced no usable text.",
      followUpTitle:
        "Stress fix - corrupt PDF - fail parse errors before saving documents",
    });
  });

  it("classifies size and magic-byte rejections as graceful low severity", () => {
    const result: StressResult = {
      type: "huge file",
      status: 400,
      body: { error: "File too large. Maximum size is 10MB" },
      documentsBefore: 0,
      documentsAfter: 0,
      bankEntriesBefore: 0,
      bankEntriesAfter: 0,
      durationMs: 3,
    };

    expect(analyzeStressResult(result)).toMatchObject({
      graceful: true,
      integrityPreserved: true,
      severity: "low",
      summary: "File too large. Maximum size is 10MB",
    });
  });
});
