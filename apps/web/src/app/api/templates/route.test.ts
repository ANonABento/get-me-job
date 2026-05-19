import { beforeEach, describe, expect, it, vi } from "vitest";

const templateMigrationMocks = vi.hoisted(() => ({
  listDocumentTemplatesV2: vi.fn(),
  deleteDocumentTemplateV2: vi.fn(),
  updateDocumentTemplateV2Metadata: vi.fn(),
}));

vi.mock("@/lib/db/custom-templates", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/custom-templates",
  ),
);

vi.mock("@/lib/db/template-migrations", () => templateMigrationMocks);

vi.mock("@/lib/db/queries", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db/queries"),
);

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
  deleteCustomTemplate,
  updateCustomTemplateMetadata,
} from "@/lib/db/custom-templates";
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
    templateMigrationMocks.listDocumentTemplatesV2.mockReturnValue([]);
    templateMigrationMocks.deleteDocumentTemplateV2.mockReturnValue(false);
    templateMigrationMocks.updateDocumentTemplateV2Metadata.mockReturnValue(
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

  it("deletes committed V2 templates when no legacy custom template exists", async () => {
    setAuthSuccess();
    vi.mocked(deleteCustomTemplate).mockReturnValueOnce(false);
    templateMigrationMocks.deleteDocumentTemplateV2.mockReturnValueOnce(true);

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
      templateMigrationMocks.deleteDocumentTemplateV2,
    ).toHaveBeenCalledWith("v2-template", "user-1");
  });

  it("updates committed V2 metadata when no legacy custom template exists", async () => {
    setAuthSuccess();
    vi.mocked(updateCustomTemplateMetadata).mockReturnValueOnce(false);
    templateMigrationMocks.updateDocumentTemplateV2Metadata.mockReturnValueOnce(
      {
        id: "v2-template",
      },
    );

    const response = await invokeRouteHandler(
      PATCH,
      jsonRequest(
        "http://localhost/api/templates",
        { id: "v2-template", name: "Reviewed Template" },
        "PATCH",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    expect(
      templateMigrationMocks.updateDocumentTemplateV2Metadata,
    ).toHaveBeenCalledWith("v2-template", "user-1", {
      name: "Reviewed Template",
      description: undefined,
    });
  });
});
