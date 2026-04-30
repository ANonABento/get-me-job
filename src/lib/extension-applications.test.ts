import { describe, expect, it } from "vitest";
import {
  buildAppliedJobFromExtension,
  parseExtensionApplicationPayload,
} from "./extension-applications";

describe("parseExtensionApplicationPayload", () => {
  it("accepts an extension application submission", () => {
    const result = parseExtensionApplicationPayload({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build UI",
      url: "https://example.com/jobs/frontend",
      submittedAt: "2026-04-30T12:00:00.000Z",
      detectionMethod: "greenhouse-url",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.application).toMatchObject({
        title: "Frontend Engineer",
        company: "Acme",
        submittedAt: "2026-04-30T12:00:00.000Z",
        detectionMethod: "greenhouse-url",
      });
    }
  });

  it("reports validation errors for missing job identity", () => {
    const result = parseExtensionApplicationPayload({
      title: "Frontend Engineer",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "company",
        message: "Invalid input: expected string, received undefined",
      });
    }
  });
});

describe("buildAppliedJobFromExtension", () => {
  it("builds an applied job with source and detection metadata", () => {
    const job = buildAppliedJobFromExtension(
      {
        title: "Platform Engineer",
        company: "Beta",
        description: "",
        requirements: ["Kubernetes"],
        responsibilities: [],
        keywords: ["Go"],
        url: "",
        source: "greenhouse",
        sourceJobId: "abc-123",
        submissionUrl: "https://boards.greenhouse.io/beta/jobs/123/confirmation",
        detectionMethod: "greenhouse-url",
        submittedAt: "2026-04-30T12:00:00.000Z",
      },
      "2026-04-30T12:05:00.000Z"
    );

    expect(job).toMatchObject({
      title: "Platform Engineer",
      company: "Beta",
      description: "Application submitted via the extension.",
      requirements: ["Kubernetes"],
      keywords: ["Go"],
      url: "https://boards.greenhouse.io/beta/jobs/123/confirmation",
      status: "applied",
      appliedAt: "2026-04-30T12:00:00.000Z",
      notes:
        "Application submitted via extension.\nSource: greenhouse\nSource job ID: abc-123\nSubmission URL: https://boards.greenhouse.io/beta/jobs/123/confirmation\nDetected by: greenhouse-url",
    });
  });
});
