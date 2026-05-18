import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/llm/client", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/llm/client"),
);

vi.mock("@/lib/salary/calculator", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/salary/calculator",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { POST } from "./route";
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

describe("/api/salary/negotiate route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/salary/negotiate",
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
        "http://localhost/api/salary/negotiate",
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
      invalidJsonRequest("http://localhost/api/salary/negotiate", "POST"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns the deterministic script when no provider is configured", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/salary/negotiate",
        {
          company: "Northstar Labs",
          role: "Frontend Engineer",
          currentOffer: 100000,
          targetSalary: 112000,
          marketMedian: 108000,
          marketMax: 125000,
        },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      source: "template",
      usedLLM: false,
      fallbackUsed: true,
      fallbackReason: "provider_not_configured",
    });
  });
});
