import { describe, expect, it } from "vitest";
import { extractKeywordsBasic } from "./keywords";

describe("extractKeywordsBasic", () => {
  it("returns known tech keywords found in the description", () => {
    const description = "We use TypeScript, React, PostgreSQL, and GitHub Actions.";

    expect(extractKeywordsBasic(description)).toEqual([
      "typescript",
      "react",
      "postgresql",
      "github actions",
    ]);
  });

  it("keeps shorter keywords when they appear outside a longer match", () => {
    const description = "GitHub Actions handles CI while Git is used locally.";

    expect(extractKeywordsBasic(description)).toEqual([
      "git",
      "github actions",
    ]);
  });

  it("returns an empty array when no keywords match", () => {
    expect(extractKeywordsBasic("Strong communication and leadership skills.")).toEqual([]);
  });
});
