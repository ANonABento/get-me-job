import { beforeEach, describe, expect, it, vi } from "vitest";

const templateMigrationMocks = vi.hoisted(() => ({
  listReusableResumeTemplates: vi.fn(),
  listDocumentTemplatesV3: vi.fn(),
  deleteReusableResumeTemplate: vi.fn(),
  deleteDocumentTemplateV3: vi.fn(),
  updateReusableResumeTemplateMetadata: vi.fn(),
  updateDocumentTemplateV3Metadata: vi.fn(),
}));

vi.mock("@/lib/db/template-migrations", () => templateMigrationMocks);

vi.mock("@/lib/resume/templates", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/resume/templates",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

vi.mock("@/lib/resume/template-analyzer", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/resume/template-analyzer",
  ),
);

import { GET, POST, DELETE, PATCH } from "./route";
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

describe("/api/templates route contract", () => {
  beforeEach(() => {
    resetContractMocks();
    templateMigrationMocks.listReusableResumeTemplates.mockReturnValue([]);
    templateMigrationMocks.listDocumentTemplatesV3.mockReturnValue([]);
    templateMigrationMocks.deleteReusableResumeTemplate.mockReturnValue(false);
    templateMigrationMocks.deleteDocumentTemplateV3.mockReturnValue(false);
    templateMigrationMocks.updateReusableResumeTemplateMetadata.mockReturnValue(
      null,
    );
    templateMigrationMocks.updateDocumentTemplateV3Metadata.mockReturnValue(
      null,
    );
  });

  it("invokes the real GET handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/templates", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/templates",
        representativeBody(),
        "POST",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("invokes the real DELETE handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      DELETE,
      jsonRequest(
        "http://localhost/api/templates",
        representativeBody(),
        "DELETE",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("invokes the real PATCH handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      PATCH,
      jsonRequest(
        "http://localhost/api/templates",
        representativeBody(),
        "PATCH",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns the shared auth failure contract", async () => {
    setAuthFailure();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/templates",
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
      invalidJsonRequest("http://localhost/api/templates", "POST"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
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
      getRequest("http://localhost/api/templates", {
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
    expect(
      body.templates.some((template) => template.id === "v4-template"),
    ).toBe(true);
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
      getRequest("http://localhost/api/templates?includeLegacy=true", {
        "x-extension-token": "test-token",
      }),
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

  it("deletes committed V3 templates", async () => {
    setAuthSuccess();
    templateMigrationMocks.deleteDocumentTemplateV3.mockReturnValueOnce(true);

    const response = await invokeRouteHandler(
      DELETE,
      jsonRequest(
        "http://localhost/api/templates?id=v2-template",
        {},
        "DELETE",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    expect(
      templateMigrationMocks.deleteDocumentTemplateV3,
    ).toHaveBeenCalledWith("v2-template", "user-1");
  });

  it("updates committed V3 metadata", async () => {
    setAuthSuccess();
    templateMigrationMocks.updateDocumentTemplateV3Metadata.mockReturnValueOnce(
      {
        id: "v3-template",
      },
    );

    const response = await invokeRouteHandler(
      PATCH,
      jsonRequest(
        "http://localhost/api/templates",
        { id: "v3-template", name: "Reviewed Template" },
        "PATCH",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    expect(
      templateMigrationMocks.updateDocumentTemplateV3Metadata,
    ).toHaveBeenCalledWith("v3-template", "user-1", {
      name: "Reviewed Template",
      description: undefined,
    });
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
