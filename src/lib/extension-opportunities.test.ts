import { describe, expect, it } from "vitest";
import {
  buildPendingJobFromExtension,
  parseExtensionOpportunityPayload,
} from "./extension-opportunities";

describe("parseExtensionOpportunityPayload", () => {
  it("accepts a single scraped opportunity", () => {
    const result = parseExtensionOpportunityPayload({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build UI",
      url: "https://example.com/jobs/frontend",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.opportunities).toHaveLength(1);
      expect(result.opportunities[0]).toMatchObject({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
      });
    }
  });

  it("accepts batch jobs from the existing extension shape", () => {
    const result = parseExtensionOpportunityPayload({
      jobs: [
        { title: "Frontend Engineer", company: "Acme" },
        { title: "Backend Engineer", company: "Beta" },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.opportunities.map((job) => job.company)).toEqual(["Acme", "Beta"]);
    }
  });

  it("normalizes scraper whitespace in optional URL and list fields", () => {
    const result = parseExtensionOpportunityPayload({
      title: " Frontend Engineer ",
      company: " Acme ",
      url: "   ",
      requirements: [" React ", "", " TypeScript "],
      responsibilities: [" Build UI "],
      keywords: [" frontend "],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.opportunities[0]).toMatchObject({
        title: "Frontend Engineer",
        company: "Acme",
        url: undefined,
        requirements: ["React", "TypeScript"],
        responsibilities: ["Build UI"],
        keywords: ["frontend"],
      });
    }
  });

  it("reports validation errors for missing required fields", () => {
    const result = parseExtensionOpportunityPayload({ title: "No Company" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "company",
        message: "Invalid input: expected string, received undefined",
      });
    }
  });
});

describe("buildPendingJobFromExtension", () => {
  it("forces scraped opportunities into pending status and keeps source metadata in notes", () => {
    const job = buildPendingJobFromExtension({
      title: "Platform Engineer",
      company: "Beta",
      description: "",
      requirements: ["Kubernetes"],
      responsibilities: [],
      keywords: ["Go"],
      remote: true,
      url: "",
      source: "linkedin",
      sourceJobId: "abc-123",
      postedAt: "2026-04-29",
    });

    expect(job).toMatchObject({
      title: "Platform Engineer",
      company: "Beta",
      description: "No description provided by the extension.",
      requirements: ["Kubernetes"],
      keywords: ["Go"],
      remote: true,
      status: "pending",
      url: undefined,
      notes: "Source: linkedin\nSource job ID: abc-123\nPosted at: 2026-04-29",
    });
  });
});
