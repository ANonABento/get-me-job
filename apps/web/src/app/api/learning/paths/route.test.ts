import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/db/jobs", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db/jobs"),
);

vi.mock("@/lib/learning/skill-paths", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/learning/skill-paths",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

import { GET } from "./route";
import {
  enhanceLearningPathsWithLLM,
  generateLearningPaths,
} from "@/lib/learning/skill-paths";
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

describe("/api/learning/paths route contract", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  it("invokes the real GET handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/learning/paths", {
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
      getRequest("http://localhost/api/learning/paths", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns base paths when enhancement is requested without a provider", async () => {
    setAuthSuccess();
    vi.mocked(generateLearningPaths).mockReturnValueOnce({
      paths: [
        {
          skill: "TypeScript",
          priority: "high",
          currentLevel: "beginner",
          targetLevel: "advanced",
          estimatedWeeks: 6,
          jobsRequiring: 2,
          resources: [],
          milestones: [],
        },
      ],
      totalEstimatedWeeks: 6,
      quickWins: [],
      strategicSkills: ["TypeScript"],
      insights: [],
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/learning/paths?enhance=true", {
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
    expect(enhanceLearningPathsWithLLM).not.toHaveBeenCalled();
  });
});
