import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/db/custom-templates", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/custom-templates",
  ),
);

vi.mock("@/lib/llm/client", () => ({
  LLMClient: vi.fn(function LLMClient(this: Record<string, unknown>) {
    this.complete = vi.fn();
  }),
}));

vi.mock("@/lib/billing/ai-gate", () => ({
  gateAiFeature: vi.fn(() => ({
    allowed: true,
    llmConfig: { provider: "openai", apiKey: "test-key", model: "test-model" },
    plan: "pro-monthly",
    source: "byok",
    transaction: null,
    refund: vi.fn(),
  })),
  isAiGateResponse: vi.fn(() => false),
}));

vi.mock("@/lib/rate-limit", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/rate-limit"),
);

vi.mock("@/lib/templates/import", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/templates/import",
  ),
);

import { POST } from "./route";
import { saveCustomTemplate } from "@/lib/db/custom-templates";
import {
  extractTemplateFromFile,
  getTemplateSourceType,
} from "@/lib/templates/import";
import {
  expectRouteResponseContract,
  invokeRouteHandler,
  jsonRequest,
  representativeBody,
  resetContractMocks,
  routeContext,
  setAuthFailure,
  setAuthSuccess,
} from "@/test/contract";

describe("/api/templates/import route contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetContractMocks();
    vi.mocked(getTemplateSourceType).mockImplementation((filename: string) => {
      if (filename.endsWith(".pdf")) return "pdf";
      if (filename.endsWith(".docx")) return "docx";
      if (filename.endsWith(".tex")) return "tex";
      return null;
    });
    vi.mocked(extractTemplateFromFile).mockResolvedValue({
      template: {
        schemaVersion: 1,
        styles: {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: "11pt",
          headerSize: "20pt",
          sectionHeaderSize: "12pt",
          lineHeight: "1.4",
          accentColor: "#333333",
          layout: "single-column",
          headerStyle: "left",
          bulletStyle: "disc",
          sectionDivider: "line",
        },
        charsPerLine: 80,
        margins: {
          top: "0.5in",
          bottom: "0.5in",
          left: "0.75in",
          right: "0.75in",
        },
        sectionGap: "16px",
        pageSize: "letter",
        source: { filename: "resume.tex", type: "tex" },
      },
      warnings: ["Used defaults for accent color."],
      confidence: "medium",
      sectionsFound: ["experience"],
    });
    vi.mocked(saveCustomTemplate).mockImplementation(
      (name, analyzedStyles, _sourceDocumentId, userId, source) => ({
        id: "custom-template-1",
        userId,
        name,
        description: null,
        sourceDocumentId: null,
        sourceFilename: source?.filename ?? null,
        sourceType: source?.type ?? null,
        analyzedStyles,
        createdAt: "2026-05-18T00:00:00.000Z",
        updatedAt: "2026-05-18T00:00:00.000Z",
      }),
    );
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      missingFileRequest(),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns the shared auth failure contract", async () => {
    setAuthFailure();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/templates/import",
        representativeBody(),
        "POST",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns an HTTP error response for malformed mutation input", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      multipartTemplateRequest("resume.txt", "text/plain", "plain text"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("rejects unsupported template files before extraction", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      multipartTemplateRequest(
        "resume.html",
        "text/html",
        "<main>Resume</main>",
      ),
      routeContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "unsupported_file_type",
    });
    expect(extractTemplateFromFile).not.toHaveBeenCalled();
  });

  it("rejects oversized template files before extraction", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      multipartTemplateRequest(
        "resume.tex",
        "text/x-tex",
        "x",
        10 * 1024 * 1024 + 1,
      ),
      routeContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "file_too_large",
    });
    expect(extractTemplateFromFile).not.toHaveBeenCalled();
  });

  it("returns extracted templates without saving when persistence is disabled", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      multipartTemplateRequest(
        "resume.tex",
        "text/x-tex",
        "\\documentclass{article}",
        undefined,
        {
          persist: "false",
        },
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      template: expect.any(Object),
      warnings: expect.any(Array),
      confidence: "medium",
      sectionsFound: ["experience"],
    });
    expect(saveCustomTemplate).not.toHaveBeenCalled();
  });

  it.each([
    ["resume.pdf", "application/pdf", "%PDF-1.4\n"],
    [
      "resume.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "PK\u0003\u0004",
    ],
    ["resume.tex", "text/x-tex", "\\documentclass{article}\\begin{document}"],
  ])(
    "saves imported %s templates into custom templates",
    async (name, type, content) => {
      setAuthSuccess();
      const request = multipartTemplateRequest(name, type, content);

      const response = await invokeRouteHandler(POST, request, routeContext());

      expect(
        response.status,
        JSON.stringify(await response.clone().json()),
      ).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        template: {
          id: "custom-template-1",
          sourceFilename: name,
          sourceType: name.endsWith(".tex")
            ? "tex"
            : name.endsWith(".docx")
              ? "docx"
              : "pdf",
        },
        warnings: expect.arrayContaining([expect.stringMatching(/default/i)]),
        confidence: "medium",
        sectionsFound: ["experience"],
      });
      expect(saveCustomTemplate).toHaveBeenCalledWith(
        name.replace(/\.[^.]+$/, ""),
        expect.any(Object),
        undefined,
        "user-1",
        {
          filename: name,
          type: name.endsWith(".tex")
            ? "tex"
            : name.endsWith(".docx")
              ? "docx"
              : "pdf",
        },
      );
    },
  );
});

function multipartTemplateRequest(
  name: string,
  type: string,
  content: string,
  size = Buffer.byteLength(content),
  fields: Record<string, string> = {},
) {
  const buffer = Buffer.from(content);
  const file = {
    name,
    type,
    size,
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
    url: "http://localhost/api/templates/import",
    headers: new Headers(),
    async formData() {
      return {
        get(key: string) {
          if (key in fields) return fields[key];
          return key === "file" ? file : null;
        },
      };
    },
  } as unknown as Request;
}

function missingFileRequest() {
  return {
    url: "http://localhost/api/templates/import",
    headers: new Headers(),
    async formData() {
      return {
        get() {
          return null;
        },
      };
    },
  } as unknown as Request;
}
