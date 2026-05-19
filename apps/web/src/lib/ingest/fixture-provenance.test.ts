import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

interface ParserV2FixtureManifest {
  fixtures: Array<{
    id: string;
    file: string;
    expectedFile: string;
    kind: string;
    title: string;
    author: string;
    sourcePageUrl: string;
    sourcePdfUrl: string;
    sourceRepositoryUrl?: string;
    license: string;
    verifiedAt: string;
    sha256: string;
    expectedSha256: string;
    notes: string;
  }>;
}

const fixtureDir = path.join(process.cwd(), "tests/fixtures/parser-v2");
const manifestPath = path.join(fixtureDir, "fixtures.manifest.json");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function manifest(): ParserV2FixtureManifest {
  return JSON.parse(
    readFileSync(manifestPath, "utf8"),
  ) as ParserV2FixtureManifest;
}

describe("parser-v2 fixture provenance", () => {
  it("records public source metadata and locks fixture hashes", () => {
    const entries = manifest().fixtures;

    expect(entries.length).toBeGreaterThan(0);
    for (const fixture of entries) {
      expect(fixture.kind).toBe("public-real-world-template");
      expect(fixture.sourcePageUrl).toMatch(/^https:\/\//);
      expect(fixture.sourcePdfUrl).toMatch(/^https:\/\//);
      expect(fixture.license).toBeTruthy();
      expect(fixture.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(fixture.notes).toContain("Downloaded");

      expect(sha256(path.join(fixtureDir, fixture.file))).toBe(fixture.sha256);
      expect(sha256(path.join(fixtureDir, fixture.expectedFile))).toBe(
        fixture.expectedSha256,
      );
    }
  });

  it("documents Jake's Resume as an internet-sourced MIT fixture", () => {
    const jakesResume = manifest().fixtures.find(
      (fixture) => fixture.id === "overleaf-jakes-resume",
    );

    expect(jakesResume).toMatchObject({
      file: "syzfjbzwjncs.pdf",
      title: "Jake's Resume",
      author: "Jake Gutierrez",
      sourcePageUrl:
        "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs",
      sourcePdfUrl:
        "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs.pdf",
      license: "MIT",
    });
  });

  it("documents the SWE Resume Template as an internet-sourced fixture", () => {
    const sweTemplate = manifest().fixtures.find(
      (fixture) => fixture.id === "overleaf-swe-resume-template",
    );

    expect(sweTemplate).toMatchObject({
      file: "bznbzdprjfyy.pdf",
      title: "SWE Resume Template",
      author: "Audric Serador",
      sourcePageUrl:
        "https://www.overleaf.com/latex/templates/swe-resume-template/bznbzdprjfyy",
      sourcePdfUrl:
        "https://www.overleaf.com/latex/templates/swe-resume-template/bznbzdprjfyy.pdf",
      license: "Creative Commons CC BY 4.0",
    });
  });
});
