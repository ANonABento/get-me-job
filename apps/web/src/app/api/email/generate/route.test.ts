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

vi.mock("@/lib/email/templates", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/email/templates",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { POST } from "./route";
import { EMAIL_TEMPLATE_INFO, generateEmail } from "@/lib/email/templates";
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

describe("/api/email/generate route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/email/generate",
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
        "http://localhost/api/email/generate",
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
      invalidJsonRequest("http://localhost/api/email/generate", "POST"),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("falls back to template generation when LLM is requested without a provider", async () => {
    setAuthSuccess();
    (EMAIL_TEMPLATE_INFO as Record<string, unknown>).follow_up = {
      title: "Follow-up",
      description: "Follow up",
      icon: "Mail",
    };
    vi.mocked(generateEmail).mockReturnValueOnce({
      subject: "Checking in",
      body: "Hello",
      placeholders: [],
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/email/generate",
        { type: "follow_up", jobId: "job-1", useLLM: true },
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
