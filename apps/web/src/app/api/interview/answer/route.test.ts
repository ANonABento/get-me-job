import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/jobs", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db/jobs"),
);

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/llm/client", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/llm/client"),
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

describe("/api/interview/answer route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/interview/answer",
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
        "http://localhost/api/interview/answer",
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
      invalidJsonRequest("http://localhost/api/interview/answer", "POST"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns basic feedback when no provider is configured", async () => {
    setAuthSuccess();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/interview/answer",
        {
          jobId: "job-1",
          questionIndex: 0,
          answer: "I built a small React app.",
          category: "behavioral",
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
  });
});
