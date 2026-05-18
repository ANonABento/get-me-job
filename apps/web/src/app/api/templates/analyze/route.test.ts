import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/llm/client", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/llm/client"),
);

vi.mock("@/lib/resume/template-analyzer", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/resume/template-analyzer",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { POST } from "./route";
import { analyzeTemplateWithLLM } from "@/lib/resume/template-analyzer";
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

describe("/api/templates/analyze route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/templates/analyze",
        representativeBody(),
        "POST",
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
        "http://localhost/api/templates/analyze",
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
      invalidJsonRequest("http://localhost/api/templates/analyze", "POST"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("uses heuristic analysis when no provider is configured", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/templates/analyze",
        {
          text: "Ada Lovelace\nExperience\n- Built polished TypeScript applications with React and accessibility testing.",
        },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      usedLLM: false,
      fallbackUsed: true,
      fallbackReason: "provider_not_configured",
    });
    expect(analyzeTemplateWithLLM).toHaveBeenCalledWith(
      expect.any(String),
      null,
    );
  });
});
