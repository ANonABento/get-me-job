import { beforeEach, describe, expect, it, vi } from "vitest";

const templateMigrationMocks = vi.hoisted(() => ({
  listDocumentTemplatesV3: vi.fn(),
  deleteDocumentTemplateV3: vi.fn(),
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
    templateMigrationMocks.listDocumentTemplatesV3.mockReturnValue([]);
    templateMigrationMocks.deleteDocumentTemplateV3.mockReturnValue(false);
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
