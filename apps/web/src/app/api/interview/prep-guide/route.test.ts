import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/jobs", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db/jobs"),
);

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/db/company-research", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/company-research",
  ),
);

vi.mock("@/lib/interview/prep-guide", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/interview/prep-guide",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { GET } from "./route";
import { generatePrepGuide } from "@/lib/interview/prep-guide";
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

describe("/api/interview/prep-guide route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real GET handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/interview/prep-guide", {
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
      getRequest("http://localhost/api/interview/prep-guide", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns the basic prep guide when no provider is configured", async () => {
    setAuthSuccess();
    vi.mocked(generatePrepGuide).mockResolvedValueOnce({
      jobTitle: "Frontend Engineer",
      company: "Northstar Labs",
      summary: "Prepare examples.",
      checklist: [],
      questions: [],
      keyTopics: [],
      yourStrengths: [],
      potentialGaps: [],
      talkingPoints: [],
      createdAt: "2026-05-18T00:00:00.000Z",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/interview/prep-guide?jobId=job-1", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      usedLLM: false,
      fallbackUsed: true,
      fallbackReason: "provider_not_configured",
    });
    expect(generatePrepGuide).toHaveBeenCalledWith(
      expect.any(Object),
      expect.anything(),
      expect.anything(),
      null,
    );
  });
});
