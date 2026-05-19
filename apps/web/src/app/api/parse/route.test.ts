import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocuments: vi.fn(),
  updateProfile: vi.fn(),
  getProfile: vi.fn(),
  gateOptionalAiFeature: vi.fn(),
  parseResumeWithLLM: vi.fn(),
  parseResumeBasic: vi.fn(),
  smartParseResume: vi.fn(),
  populateBankFromProfile: vi.fn(),
  mergeParsedProfileForAutoPromote: vi.fn(),
  createBasicDocumentParseRun: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocuments: mocks.getDocuments,
  updateProfile: mocks.updateProfile,
  getProfile: mocks.getProfile,
}));

vi.mock("@/lib/billing/ai-gate", () => ({
  gateOptionalAiFeature: mocks.gateOptionalAiFeature,
  isAiGateResponse: (value: unknown) => value instanceof NextResponse,
}));

vi.mock("@/lib/parser/resume", () => ({
  parseResumeWithLLM: mocks.parseResumeWithLLM,
  parseResumeBasic: mocks.parseResumeBasic,
}));

vi.mock("@/lib/parser/smart-parser", () => ({
  smartParseResume: mocks.smartParseResume,
}));

vi.mock("@/lib/resume/info-bank", () => ({
  populateBankFromProfile: mocks.populateBankFromProfile,
}));

vi.mock("@/lib/profile/auto-promote", () => ({
  mergeParsedProfileForAutoPromote: mocks.mergeParsedProfileForAutoPromote,
}));

vi.mock("@/lib/ingest/document-parse-run", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/ingest/document-parse-run")
  >("@/lib/ingest/document-parse-run");
  return {
    ...actual,
    createBasicDocumentParseRun: mocks.createBasicDocumentParseRun,
  };
});

import { CREDIT_COSTS } from "@/lib/db/credits";
import { DocumentParseRunError } from "@/lib/ingest/document-parse-run";
import { POST } from "./route";

function parseRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/parse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/parse route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getDocuments.mockReturnValue([
      {
        id: "doc-1",
        filename: "resume.pdf",
        extractedText: "Ada Lovelace resume",
      },
    ]);
    mocks.getProfile.mockReturnValue(null);
    mocks.updateProfile.mockReturnValue(undefined);
    mocks.populateBankFromProfile.mockReturnValue({
      inserted: 0,
      updated: 0,
      skipped: 0,
    });
    mocks.mergeParsedProfileForAutoPromote.mockImplementation(
      (existing, parsed) => parsed,
    );
    mocks.parseResumeBasic.mockReturnValue({ contact: { name: "Ada" } });
    mocks.createBasicDocumentParseRun.mockImplementation(() => {
      throw new DocumentParseRunError("Document artifact not found", 404);
    });
    mocks.smartParseResume.mockResolvedValue({
      profile: { contact: { name: "Ada" } },
      confidence: 0.9,
      sectionsDetected: ["contact"],
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    });
    mocks.parseResumeWithLLM.mockReturnValue({ contact: { name: "Ada AI" } });
  });

  it("uses basic parsing by default without AI gate checks", async () => {
    const response = await POST(
      parseRequest({
        documentId: "doc-1",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.gateOptionalAiFeature).not.toHaveBeenCalled();
    expect(mocks.parseResumeWithLLM).not.toHaveBeenCalled();
    expect(mocks.parseResumeBasic).not.toHaveBeenCalled();
    expect(mocks.smartParseResume).toHaveBeenCalledWith(
      "Ada Lovelace resume",
      null,
    );
    expect(mocks.createBasicDocumentParseRun).toHaveBeenCalledWith({
      documentId: "doc-1",
      userId: "user-1",
    });

    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      parsingMode: "basic",
      parsingMethod: "basic",
      llmConfigured: false,
      creditsUsed: 0,
      creditSource: "none",
      llmFallback: false,
      parserV2: {
        status: "unavailable",
        error: "Document artifact not found",
      },
    });
  });

  it("returns parser-v2 parse-run context when a source artifact exists", async () => {
    mocks.createBasicDocumentParseRun.mockReturnValueOnce({
      id: "run-1",
      documentId: "doc-1",
      artifactId: "artifact-1",
      userId: "user-1",
      mode: "basic",
      parserVersion: "resume-v2-basic-v1",
      status: "ready",
      confidence: 0.88,
      warnings: [],
      structured: {},
      createdAt: "2026-05-18T10:00:00.000Z",
    });

    const response = await POST(parseRequest({ documentId: "doc-1" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      parserV2: {
        status: "ready",
        parseRunId: "run-1",
        artifactId: "artifact-1",
        confidence: 0.88,
        mode: "basic",
      },
    });
  });

  it("runs AI parse when mode=ai and reports credit usage from source", async () => {
    const refund = vi.fn();
    const gatePass = {
      allowed: true,
      llmConfig: {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "test-key",
        baseUrl: undefined,
      },
      plan: "pro-monthly",
      source: "credits" as const,
      transaction: null,
      refund,
    };
    mocks.gateOptionalAiFeature.mockReturnValue(gatePass);

    const response = await POST(
      parseRequest({
        documentId: "doc-1",
        mode: "ai",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.gateOptionalAiFeature).toHaveBeenCalledWith(
      "user-1",
      "tailor",
      "parse:doc-1",
    );
    expect(mocks.parseResumeWithLLM).toHaveBeenCalledWith(
      "Ada Lovelace resume",
      gatePass.llmConfig,
    );
    expect(mocks.createBasicDocumentParseRun).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      parsingMode: "ai",
      parsingMethod: "ai",
      llmConfigured: true,
      creditsUsed: CREDIT_COSTS.tailor,
      creditSource: "credits",
      llmFallback: false,
    });
    expect(refund).not.toHaveBeenCalled();
  });

  it("falls back to basic parsing and refunds credits when AI parse fails", async () => {
    const refund = vi.fn();
    const gatePass = {
      allowed: true,
      llmConfig: {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "test-key",
        baseUrl: undefined,
      },
      plan: "pro-weekly",
      source: "credits" as const,
      transaction: null,
      refund,
    };
    mocks.parseResumeWithLLM.mockRejectedValue(new Error("llm unavailable"));
    mocks.gateOptionalAiFeature.mockReturnValue(gatePass);

    const response = await POST(
      parseRequest({
        documentId: "doc-1",
        mode: "ai",
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      parsingMode: "ai",
      parsingMethod: "basic",
      llmConfigured: true,
      llmFallback: true,
      creditsUsed: 0,
      creditSource: "none",
    });
    expect(mocks.smartParseResume).toHaveBeenCalledWith(
      "Ada Lovelace resume",
      null,
    );
    expect(mocks.parseResumeBasic).not.toHaveBeenCalled();
    expect(refund).toHaveBeenCalledTimes(1);
  });
});
