import { describe, expect, it } from "vitest";
import { getExportMetadata, getProviderModels } from "@/features/settings/utils";

describe("getExportMetadata", () => {
  it("builds dated profile export metadata", () => {
    expect(getExportMetadata("profile", new Date("2026-04-09T12:00:00.000Z"))).toEqual({
      filename: "get-me-job-profile-2026-04-09.json",
      url: "/api/export/profile?format=json",
    });
  });

  it("builds csv jobs export metadata", () => {
    expect(getExportMetadata("jobs-csv", new Date("2026-04-09T12:00:00.000Z"))).toEqual({
      filename: "get-me-job-jobs-2026-04-09.csv",
      url: "/api/export/jobs?format=csv",
    });
  });
});

describe("getProviderModels", () => {
  it("prefers fetched ollama models when available", () => {
    expect(getProviderModels("ollama", ["llama3.2", "mistral"])).toEqual([
      "llama3.2",
      "mistral",
    ]);
  });

  it("falls back to default models for cloud providers", () => {
    expect(getProviderModels("openai", [])).toContain("gpt-4o-mini");
  });
});

