import { describe, expect, it } from "vitest";
import {
  buildJobFromExtension,
  buildPendingJobFromExtension,
  parseExtensionOpportunitiesPerRow,
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
      expect(result.opportunities.map((job) => job.company)).toEqual([
        "Acme",
        "Beta",
      ]);
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

describe("parseExtensionOpportunitiesPerRow", () => {
  it("keeps good rows when one row fails validation", () => {
    const result = parseExtensionOpportunitiesPerRow({
      jobs: [
        { title: "Frontend Engineer", company: "Acme" },
        { title: "", company: "Beta" }, // invalid — empty title
        { title: "Backend Engineer", company: "Gamma" },
      ],
    });

    expect(result.valid).toHaveLength(2);
    expect(result.valid.map((j) => j.company)).toEqual(["Acme", "Gamma"]);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0]).toMatchObject({
      index: 1,
      company: "Beta",
    });
    expect(result.invalid[0].errors[0].field).toBe("title");
  });

  it("captures identity fields from the raw row when validation fails", () => {
    const result = parseExtensionOpportunitiesPerRow({
      opportunities: [
        {
          title: "x".repeat(600), // exceeds 500 cap
          company: "Acme",
          sourceJobId: "471268",
        },
      ],
    });

    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0]).toMatchObject({
      index: 0,
      company: "Acme",
      sourceJobId: "471268",
    });
    // Title is sliced to 200 chars for display purposes — full string
    // is in the raw payload, but the identity slice keeps it readable.
    expect(result.invalid[0].title?.length).toBeLessThanOrEqual(200);
  });

  it("accepts a single-opportunity payload without a wrapper", () => {
    const result = parseExtensionOpportunitiesPerRow({
      title: "Frontend Engineer",
      company: "Acme",
    });
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(0);
  });

  it("returns empty valid + a single invalid for a malformed wrapper", () => {
    const result = parseExtensionOpportunitiesPerRow({ jobs: "not-an-array" });
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });
});

describe("buildJobFromExtension", () => {
  it("preserves applied status and fills appliedAt", () => {
    const job = buildJobFromExtension({
      title: "Platform Engineer",
      company: "Beta",
      description: "Build infra",
      requirements: [],
      responsibilities: [],
      keywords: [],
      status: "applied",
      appliedAt: "2026-05-10T12:00:00.000Z",
    });

    expect(job).toMatchObject({
      status: "applied",
      appliedAt: "2026-05-10T12:00:00.000Z",
    });
  });
});
