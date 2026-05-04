import { mkdtemp, rm, writeFile, mkdir, readFile } from "fs/promises";
import os from "os";
import path from "path";

import { describe, expect, it } from "vitest";

import {
  compareExperiences,
  datesFuzzyEqual,
  experienceMatches,
  renderReport,
  runVerification,
  summarizeFailureModes,
} from "./verify";

describe("parsing verification harness", () => {
  it("matches experiences with company normalization and one-month date tolerance", () => {
    expect(
      experienceMatches(
        {
          title: "Senior Software Engineer",
          company: "Acme Inc.",
          startDate: "2021-01",
          endDate: "2023-05",
        },
        {
          title: "Senior Software Engineer",
          company: "Acme Inc",
          startDate: "December 2020",
          endDate: "June 2023",
        },
      ),
    ).toBe(true);
    expect(datesFuzzyEqual("2021-01", "2021-03")).toBe(false);
  });

  it("scores recall, precision, field accuracy, spurious, and missed entries", () => {
    const result = compareExperiences(
      [
        {
          title: "Engineer",
          company: "Acme Inc.",
          startDate: "2020-01",
          endDate: "2022-01",
          description: "Built billing systems",
        },
        {
          title: "Manager",
          company: "Beta",
          startDate: "2022-02",
          endDate: "2024-01",
        },
      ],
      [
        {
          title: "Engineer",
          company: "Acme Incorporated",
          startDate: "2020-01",
          endDate: "2022-01",
          description: "Built billing systems",
        },
        {
          title: "Consultant",
          company: "Gamma",
          startDate: "2019-01",
          endDate: "2019-06",
        },
      ],
      [],
      "sample",
    );

    expect(result.matchedCount).toBe(1);
    expect(result.recall).toBe(0.5);
    expect(result.precision).toBe(0.5);
    expect(result.fieldAccuracy).toBe(1);
    expect(result.failures.map((failure) => failure.type).sort()).toEqual([
      "missed",
      "spurious",
    ]);
  });

  it("maps fixture summaries to descriptions and ignores schema-only category fields", () => {
    const result = compareExperiences(
      [
        {
          title: "Engineer",
          company: "Acme",
          startDate: "2020-01",
          endDate: "Present",
          summary: "Built billing systems",
          category: "experience",
        },
      ],
      [
        {
          title: "Engineer",
          company: "Acme",
          startDate: "2020-01",
          endDate: "Present",
          current: true,
          description: "Built billing systems",
        },
      ],
      [],
      "fixture-schema",
    );

    expect(result.failures).toEqual([]);
    expect(result.fieldAccuracy).toBe(1);
  });

  it("does not count known limitation misses as score failures", () => {
    const result = compareExperiences(
      [
        {
          title: "Engineer",
          company: "Acme",
          startDate: "2020-01",
        },
      ],
      [],
      ["Missed expected experience"],
      "known",
    );

    expect(result.matchedCount).toBe(0);
    expect(result.failures).toEqual([]);
    expect(result.recall).toBe(1);
    expect(result.precision).toBe(1);
    expect(result.fieldAccuracy).toBe(1);
    expect(result.composite).toBe(1);
    expect(result.knownLimitationsApplied).toEqual([
      "Missed expected experience",
    ]);
  });

  it("does not suppress unrelated misses just because a limitation mentions experience", () => {
    const result = compareExperiences(
      [
        {
          title: "Engineer",
          company: "Acme",
          startDate: "2020-01",
        },
      ],
      [],
      [
        "Prior mechanical role may be categorized as experience rather than adjacent domain history.",
      ],
      "known",
    );

    expect(result.failures).toHaveLength(1);
    expect(result.knownLimitationsApplied).toEqual([]);
  });

  it("groups failure modes and renders followup context", () => {
    const failureModes = summarizeFailureModes([
      {
        slug: "a",
        status: "failed-to-process",
        expectedCount: 0,
        actualCount: 0,
        matchedCount: 0,
        recall: 0,
        precision: 0,
        fieldAccuracy: 0,
        composite: 0,
        knownLimitationsApplied: [],
        notes: [],
        failures: [
          {
            persona: "a",
            type: "process",
            summary: "Missing fixture dependency for a",
            rca: "Fixture dependency missing",
            severity: "high",
            knownLimitationApplied: false,
          },
        ],
      },
    ]);

    expect(failureModes).toEqual([
      {
        rca: "Fixture dependency missing",
        count: 1,
        severity: "high",
        personas: ["a"],
        summaries: ["Missing fixture dependency for a"],
      },
    ]);

    expect(
      renderReport({
        generatedAt: "2026-05-04T00:00:00.000Z",
        failureModes,
        followupTasks: [
          {
            title:
              "Parsing fix — Fixture dependency missing — Missing fixture dependency for a",
            severity: "high",
            status: "pending-mcp",
          },
        ],
        personas: [
          {
            slug: "a",
            status: "failed-to-process",
            expectedCount: 0,
            actualCount: 0,
            matchedCount: 0,
            recall: 0,
            precision: 0,
            fieldAccuracy: 0,
            composite: 0,
            knownLimitationsApplied: [],
            notes: ["note"],
            failures: [],
          },
        ],
      }),
    ).toContain("Bento task creation MCP was unavailable");
  });

  it("documents all default personas as failed-to-process when fixture root is missing", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "parsing-verify-"));
    const fixtureRoot = path.join(tempDir, "missing-personas");
    const reportPath = path.join(tempDir, "parsing-results.md");

    try {
      const report = await runVerification(fixtureRoot, reportPath);
      const reportText = await readFile(reportPath, "utf-8");

      expect(report.personas).toHaveLength(10);
      expect(
        report.personas.every(
          (persona) => persona.status === "failed-to-process",
        ),
      ).toBe(true);
      expect(reportText).toContain("standard-software-engineer");
      expect(reportText).toContain("Fixture dependency missing");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("uses actual fixture slugs when directories exist", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "parsing-verify-"));
    const fixtureRoot = path.join(tempDir, "personas");
    const personaDir = path.join(fixtureRoot, "empty-fixture");
    const reportPath = path.join(tempDir, "parsing-results.md");

    try {
      await mkdir(personaDir, { recursive: true });
      await writeFile(
        path.join(personaDir, "expected.json"),
        '{"expectedExperiences":[]}',
      );

      const report = await runVerification(fixtureRoot, reportPath);

      expect(report.personas.map((persona) => persona.slug)).toEqual([
        "empty-fixture",
      ]);
      expect(report.personas[0].status).toBe("failed-to-process");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
