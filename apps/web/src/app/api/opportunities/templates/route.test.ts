import { beforeEach, describe, expect, it, vi } from "vitest";

const templateMigrationMocks = vi.hoisted(() => ({
  listReusableResumeTemplates: vi.fn(),
  listDocumentTemplatesV3: vi.fn(),
}));

vi.mock("@/lib/resume/pdf", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/resume/pdf"),
);

vi.mock("@/lib/db/template-migrations", () => templateMigrationMocks);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { GET } from "./route";
import {
  expectRouteResponseContract,
  getRequest,
  invalidJsonRequest,
  invokeRouteHandler,
  jsonRequest,
  representativeBody,
  resetContractMocks,
  routeContext,
  setAuthFailure,
  setAuthSuccess,
} from "@/test/contract";

describe("/api/opportunities/templates route contract", () => {
  beforeEach(() => {
    resetContractMocks();
    templateMigrationMocks.listReusableResumeTemplates.mockReturnValue([]);
    templateMigrationMocks.listDocumentTemplatesV3.mockReturnValue([]);
  });

  it("invokes the real GET handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/opportunities/templates", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns the shared auth failure contract", async () => {
    setAuthFailure();

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/opportunities/templates", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("lists reusable custom templates by default and hides legacy V3 templates", async () => {
    setAuthSuccess();
    templateMigrationMocks.listReusableResumeTemplates.mockReturnValueOnce([
      reusableTemplateRow("v4-template"),
    ]);
    templateMigrationMocks.listDocumentTemplatesV3.mockReturnValueOnce([
      documentTemplateV3Row("v3-template"),
    ]);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/opportunities/templates", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );
    const body = (await response.json()) as {
      templates: Array<{ id: string }>;
    };

    expect(response.status).toBe(200);
    expect(
      templateMigrationMocks.listDocumentTemplatesV3,
    ).not.toHaveBeenCalled();
    expect(body.templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "v4-template", schemaVersion: 4 }),
      ]),
    );
    expect(
      body.templates.some((template) => template.id === "v3-template"),
    ).toBe(false);
  });

  it("includes legacy V3 custom templates when explicitly requested", async () => {
    setAuthSuccess();
    templateMigrationMocks.listReusableResumeTemplates.mockReturnValueOnce([
      reusableTemplateRow("v4-template"),
    ]);
    templateMigrationMocks.listDocumentTemplatesV3.mockReturnValueOnce([
      documentTemplateV3Row("v3-template"),
    ]);

    const response = await invokeRouteHandler(
      GET,
      getRequest(
        "http://localhost/api/opportunities/templates?includeLegacy=true",
        {
          "x-extension-token": "test-token",
        },
      ),
      routeContext(),
    );
    const body = (await response.json()) as {
      templates: Array<{ id: string; legacy?: boolean }>;
    };

    expect(response.status).toBe(200);
    expect(templateMigrationMocks.listDocumentTemplatesV3).toHaveBeenCalledWith(
      "user-1",
    );
    expect(body.templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "v4-template", schemaVersion: 4 }),
        expect.objectContaining({
          id: "v3-template",
          schemaVersion: 3,
          legacy: true,
        }),
      ]),
    );
  });
});

function reusableTemplateRow(id: string) {
  return {
    id,
    userId: "user-1",
    name: "Reusable Resume",
    description: null,
    sourceFilename: "resume.pdf",
    sourceType: "pdf",
    template: {
      schemaVersion: 4,
      name: "Reusable Resume",
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

function documentTemplateV3Row(id: string) {
  return {
    id,
    userId: "user-1",
    name: "Legacy Visual Resume",
    description: null,
    sourceFilename: "resume.pdf",
    sourceType: "pdf",
    template: {
      schemaVersion: 3,
      name: "Legacy Visual Resume",
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}
