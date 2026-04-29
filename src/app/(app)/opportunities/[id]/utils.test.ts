import { describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";
import {
  OPPORTUNITY_FIELD_SECTIONS,
  buildAppliedOpportunityPatch,
  buildOpportunityPatch,
  formatOpportunityFieldPreview,
  formatOpportunityFieldValue,
  getOpportunityFieldConfig,
  parseOpportunityListValue,
} from "./utils";

const opportunity: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  location: "Remote",
  type: "full-time",
  remote: true,
  salary: "$120k",
  description: "Build product UI",
  requirements: ["React", "TypeScript"],
  responsibilities: ["Ship features"],
  keywords: ["frontend", "accessibility"],
  url: "https://example.com/job",
  status: "saved",
  appliedAt: undefined,
  deadline: "2026-05-10",
  notes: "Promising team",
  createdAt: "2026-04-29T12:00:00.000Z",
};

describe("opportunity detail utils", () => {
  it("defines the requested detail sections", () => {
    expect(OPPORTUNITY_FIELD_SECTIONS.map((section) => section.title)).toEqual([
      "Core",
      "Location",
      "Details",
      "Compensation",
      "Application",
      "Meta",
    ]);
  });

  it("formats list and checkbox fields for inline display", () => {
    expect(
      formatOpportunityFieldValue(
        opportunity,
        getOpportunityFieldConfig("requirements")
      )
    ).toBe("React\nTypeScript");

    expect(
      formatOpportunityFieldPreview(opportunity, getOpportunityFieldConfig("remote"))
    ).toBe("Yes");
  });

  it("uses option labels for select previews", () => {
    expect(
      formatOpportunityFieldPreview(opportunity, getOpportunityFieldConfig("type"))
    ).toBe("Full-time");
  });

  it("parses newline and comma separated list edits", () => {
    expect(parseOpportunityListValue("React\n TypeScript, CSS\n\n")).toEqual([
      "React",
      "TypeScript",
      "CSS",
    ]);
  });

  it("builds typed patches for editable fields", () => {
    expect(
      buildOpportunityPatch(getOpportunityFieldConfig("requirements"), "React\nNode")
    ).toEqual({ requirements: ["React", "Node"] });
    expect(buildOpportunityPatch(getOpportunityFieldConfig("remote"), false)).toEqual({
      remote: false,
    });
    expect(buildOpportunityPatch(getOpportunityFieldConfig("salary"), "  ")).toEqual({
      salary: undefined,
    });
  });

  it("builds an applied patch with an ISO timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29T12:34:56.000Z"));

    expect(buildAppliedOpportunityPatch()).toEqual({
      status: "applied",
      appliedAt: "2026-04-29T12:34:56.000Z",
    });

    vi.useRealTimers();
  });
});
