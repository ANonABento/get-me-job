import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  gateOptionalAiFeature: vi.fn(),
  isAiGateResponse: vi.fn(),
  createTemplateMigrationDraft: vi.fn(),
  saveTemplateMigrationDraft: vi.fn(),
  getTemplateSourceType: vi.fn(),
  rateLimitStandard: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/billing/ai-gate", () => ({
  gateOptionalAiFeature: mocks.gateOptionalAiFeature,
  isAiGateResponse: mocks.isAiGateResponse,
}));

vi.mock("@/lib/db/template-migrations", () => ({
  saveTemplateMigrationDraft: mocks.saveTemplateMigrationDraft,
}));

vi.mock("@/lib/llm/client", () => ({
  LLMClient: vi.fn(function LLMClient(this: Record<string, unknown>) {
    this.complete = vi.fn();
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIdentifier: vi.fn(() => "user-1"),
  rateLimiters: {
    standard: mocks.rateLimitStandard,
  },
}));

vi.mock("@/lib/resume/template-migration", () => ({
  createTemplateMigrationDraft: mocks.createTemplateMigrationDraft,
}));

vi.mock("@/lib/templates/import", () => ({
  getTemplateSourceType: mocks.getTemplateSourceType,
}));

import { POST } from "./route";

describe("/api/templates/migrate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.gateOptionalAiFeature.mockReturnValue({
      allowed: true,
      llmConfig: null,
      plan: "self-host",
      source: "self-host",
      transaction: null,
      refund: vi.fn(),
    });
    mocks.isAiGateResponse.mockReturnValue(false);
    mocks.rateLimitStandard.mockReturnValue({
      allowed: true,
      resetAt: Date.now() + 1000,
    });
    mocks.getTemplateSourceType.mockReturnValue("tex");
    mocks.createTemplateMigrationDraft.mockResolvedValue(sampleDraft());
    mocks.saveTemplateMigrationDraft.mockImplementation((draft) => draft);
  });

  it("creates and saves a migration draft from an uploaded resume", async () => {
    const response = await POST(
      multipartTemplateRequest(
        "resume.tex",
        "text/x-tex",
        "\\documentclass{article}\\begin{document}Jane\\end{document}",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.createTemplateMigrationDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "resume.tex",
        mimeType: "text/x-tex",
        userId: "user-1",
        llmClient: null,
      }),
    );
    expect(mocks.saveTemplateMigrationDraft).toHaveBeenCalledWith(
      sampleDraft(),
    );
    const body = await response.json();
    expect(body).toMatchObject({
      draft: {
        id: "draft-1",
        sourceFilename: "resume.tex",
      },
      confidence: "medium",
      fallbackUsed: true,
    });
    expect(body.draft.userId).toBeUndefined();
  });
});

function multipartTemplateRequest(name: string, type: string, content: string) {
  const buffer = Buffer.from(content);
  const file = {
    name,
    type,
    size: buffer.length,
    async arrayBuffer() {
      return Uint8Array.from(buffer).buffer;
    },
    slice(start = 0, end = buffer.length) {
      const chunk = buffer.subarray(start, end);
      return {
        async arrayBuffer() {
          return Uint8Array.from(chunk).buffer;
        },
      };
    },
  };

  return {
    url: "http://localhost/api/templates/migrate",
    headers: new Headers(),
    async formData() {
      return {
        get(key: string) {
          return key === "file" ? file : null;
        },
      };
    },
  } as unknown as NextRequest;
}

function sampleDraft() {
  return {
    id: "draft-1",
    userId: "user-1",
    status: "reviewing",
    sourceFilename: "resume.tex",
    sourceType: "tex",
    source: {
      sourceType: "tex",
      filename: "resume.tex",
      pages: [],
      blocks: [],
      rawText: "",
      diagnostics: [],
    },
    resume: {
      contact: { name: "Jane Rivera" },
      summary: "",
      experiences: [],
      skills: [],
      education: [],
    },
    template: {
      schemaVersion: 2,
      id: "template-1",
      name: "Resume",
      page: {
        size: "letter",
        margins: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      },
      tokens: {},
      regions: [],
      slots: [],
      diagnostics: [],
    },
    warnings: ["latex_style_hints_inferred"],
    confidence: "medium",
    createdAt: "2026-05-19T00:00:00.000Z",
    updatedAt: "2026-05-19T00:00:00.000Z",
    committedTemplateId: null,
  };
}
