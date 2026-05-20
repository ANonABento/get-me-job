import { beforeEach, describe, expect, it, vi } from "vitest";

const templateRenderMocks = vi.hoisted(() => ({
  getReusableResumeTemplate: vi.fn(),
  getDocumentTemplateV3: vi.fn(),
  renderTailoredResumeWithReusableTemplate: vi.fn(),
  generateResumeHTMLV3: vi.fn(),
}));

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/db/prompt-variants", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/prompt-variants",
  ),
);

vi.mock("@/lib/db/profile-bank", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/profile-bank",
  ),
);

vi.mock("@/lib/db/jobs-async", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/jobs-async",
  ),
);

vi.mock("@/lib/opportunities", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/opportunities",
  ),
);

vi.mock("@/lib/tailor/analyze", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/tailor/analyze",
  ),
);

vi.mock("@/lib/tailor/generate", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/tailor/generate",
  ),
);

vi.mock("@/lib/resume/pdf", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/resume/pdf"),
);

vi.mock("@/lib/resume/templates", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/resume/templates",
  ),
);

vi.mock("@/lib/db/template-migrations", () => ({
  getReusableResumeTemplate: templateRenderMocks.getReusableResumeTemplate,
  getDocumentTemplateV3: templateRenderMocks.getDocumentTemplateV3,
}));

vi.mock("@/lib/resume/universal-template-renderer", () => ({
  renderTailoredResumeWithReusableTemplate:
    templateRenderMocks.renderTailoredResumeWithReusableTemplate,
}));

vi.mock("@/lib/resume/template-v3-renderer", () => ({
  generateResumeHTMLV3: templateRenderMocks.generateResumeHTMLV3,
}));

vi.mock("@/lib/builder/tailored-resume-api", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/builder/tailored-resume-api",
  ),
);

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

vi.mock("@/lib/plan/quota", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/plan/quota"),
);

vi.mock("@/lib/streak/track", () => ({
  safeTrackActivity: vi.fn(async () => ({ unlocked: [] })),
}));

vi.mock("@/lib/db/product-analytics", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock(
    "@/lib/db/product-analytics",
  ),
);

import { GET, POST } from "./route";
import { checkTailorQuota } from "@/lib/plan/quota";
import { saveGeneratedResume } from "@/lib/db";
import { createJob } from "@/lib/db/jobs-async";
import { getGroupedBankEntries } from "@/lib/db/profile-bank";
import { analyzeJobFit } from "@/lib/tailor/analyze";
import { generateFromBank } from "@/lib/tailor/generate";
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

describe("/api/tailor route contract", () => {
  beforeEach(() => {
    resetContractMocks();
    templateRenderMocks.getReusableResumeTemplate.mockReturnValue(null);
    templateRenderMocks.getDocumentTemplateV3.mockReturnValue(null);
    templateRenderMocks.renderTailoredResumeWithReusableTemplate.mockReturnValue(
      "<article>Reusable Tailor Resume</article>",
    );
    templateRenderMocks.generateResumeHTMLV3.mockReturnValue(
      "<article>V3 Tailor Resume</article>",
    );
  });

  it("invokes the real GET handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/tailor", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("invokes the real POST handler and returns an HTTP response contract", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/tailor", representativeBody(), "POST", {
        "x-extension-token": "test-token",
      }),
      routeContext(),
    );

    await expectRouteResponseContract(response);
  });

  it("returns the shared auth failure contract", async () => {
    setAuthFailure();

    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/tailor", representativeBody(), "POST", {
        "x-extension-token": "test-token",
      }),
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
      invalidJsonRequest("http://localhost/api/tailor", "POST"),
      routeContext(),
    );

    expect(response.status).toBe(400);
    await expectRouteResponseContract(response);
  });

  it("returns validation errors for missing job description", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/tailor", { action: "analyze" }, "POST"),
      routeContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
      errors: [{ field: "jobDescription" }],
    });
  });

  it("returns validation errors for wrong field types", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/tailor",
        { action: "analyze", jobDescription: 123 },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
      errors: [{ field: "jobDescription" }],
    });
  });

  it("returns a structured 429 when the free tailor quota is exhausted", async () => {
    setAuthSuccess();
    vi.mocked(checkTailorQuota).mockResolvedValueOnce({
      allowed: false,
      tier: "free",
      used: 5,
      limit: 5,
      resetAt: "2026-06-01T00:00:00.000Z",
    });
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/tailor",
        representativeBody({
          action: "generate",
          jobDescription:
            "We need a frontend engineer who can build polished TypeScript applications.",
        }),
        "POST",
        {
          "x-extension-token": "test-token",
        },
      ),
      routeContext(),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      code: "free_tier_quota_exceeded",
      limit: 5,
      used: 5,
      resetAt: "2026-06-01T00:00:00.000Z",
      upgradeUrl: "/pricing",
    });
  });

  it("renders a generated resume through a saved reusable template", async () => {
    setAuthSuccess();
    const resume = {
      contact: { name: "Riley Chen" },
      summary: "Product engineer",
      experiences: [],
      skills: ["TypeScript"],
      education: [],
    };
    templateRenderMocks.getReusableResumeTemplate.mockReturnValueOnce({
      id: "v4-template",
      template: { schemaVersion: 4, id: "v4-template", name: "V4" },
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/tailor",
        {
          action: "render",
          templateId: "v4-template",
          resume,
        },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    expect(templateRenderMocks.getReusableResumeTemplate).toHaveBeenCalledWith(
      "v4-template",
      expect.any(String),
    );
    expect(
      templateRenderMocks.renderTailoredResumeWithReusableTemplate,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Product engineer" }),
      expect.objectContaining({ id: "v4-template" }),
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      html: "<article>Reusable Tailor Resume</article>",
    });
  });

  it("generates from the deterministic bank path without a provider", async () => {
    setAuthSuccess();
    vi.mocked(checkTailorQuota).mockResolvedValueOnce({
      allowed: true,
      tier: "free",
      used: 1,
      limit: 5,
      resetAt: "2026-06-01T00:00:00.000Z",
    });
    const resume = {
      contact: { name: "Ada Lovelace", email: "ada@example.com" },
      summary: "Frontend engineer",
      experiences: [],
      skills: ["TypeScript"],
      education: [],
    };
    vi.mocked(getGroupedBankEntries).mockReturnValueOnce({
      experience: [
        {
          id: "entry-1",
          userId: "user-1",
          category: "experience",
          content: {},
          confidenceScore: 1,
          createdAt: "2026-05-18T00:00:00.000Z",
        },
      ],
      project: [],
      education: [],
      skill: [],
      paragraph: [],
      bullet: [],
      achievement: [],
      certification: [],
      hackathon: [],
    });
    vi.mocked(analyzeJobFit).mockReturnValueOnce({
      matchScore: 80,
      keywordsFound: ["TypeScript"],
      keywordsMissing: [],
      gaps: [],
      matchedEntries: [],
      quality: {
        status: "ready_to_apply",
        label: "Ready",
        rationale: "Strong match.",
        nextActions: [],
        reasons: ["strong_jd_match"],
      },
    });
    vi.mocked(generateFromBank).mockResolvedValueOnce({
      resume,
      baseResume: resume,
      promptVariantId: null,
    });
    vi.mocked(createJob).mockResolvedValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Northstar Labs",
      description: "Build TypeScript apps.",
      requirements: [],
      responsibilities: [],
      keywords: ["TypeScript"],
      status: "saved",
      createdAt: "2026-05-18T00:00:00.000Z",
    });
    vi.mocked(saveGeneratedResume).mockReturnValueOnce({
      id: "resume-1",
      jobId: "job-1",
      profileId: "user-1",
      templateId: "modern",
      contentJson: JSON.stringify(resume),
      htmlPath: "/resumes/test.html",
      matchScore: 80,
      createdAt: "2026-05-18T00:00:00.000Z",
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/tailor",
        {
          action: "generate",
          jobDescription: "Build TypeScript apps.",
          jobTitle: "Frontend Engineer",
          company: "Northstar Labs",
        },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(200);
    expect(generateFromBank).toHaveBeenCalledWith(expect.any(Object), null);
    await expect(response.json()).resolves.toMatchObject({
      usedLLM: false,
      fallbackUsed: true,
      fallbackReason: "provider_not_configured",
    });
  });

  it("does not leak raw error messages on 500", async () => {
    const probe = "INTERNAL_LEAK_PROBE_TAILOR_4A30A145";
    setAuthSuccess();
    vi.mocked(getGroupedBankEntries).mockImplementationOnce(() => {
      throw new Error(probe);
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/tailor",
        {
          jobDescription:
            "We need a frontend engineer who can improve reliability across customer-facing systems.",
          action: "analyze",
        },
        "POST",
        { "x-extension-token": "test-token" },
      ),
      routeContext(),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain(probe);
    expect(body).not.toHaveProperty("details");
    expect(body.error).toBe("Failed to tailor resume");
  });
});
