#!/usr/bin/env tsx

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

interface SuiteCase {
  name: string;
  source: string;
  reference?: string;
}

const defaultCases: SuiteCase[] = [
  {
    name: "kevin-resume-pdf",
    source: "/home/anonabento/Downloads/KevinJiang_Resume.pdf",
  },
  {
    name: "kevin-software-pdf",
    source: "/home/anonabento/Downloads/KevinJiang_Software.pdf",
  },
  {
    name: "master-resume-docx",
    source: "/home/anonabento/Downloads/Master Resume.docx",
    reference: "/home/anonabento/Downloads/Master Resume.pdf",
  },
  {
    name: "master-resume-pdf",
    source: "/home/anonabento/Downloads/Master Resume.pdf",
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.outDir, { recursive: true });
  const cases: SuiteCase[] = args.sources.length
    ? args.sources.map((source) => ({
        name: sanitizeBasename(path.basename(source)),
        source,
      }))
    : defaultCases.filter((item) => existsSync(item.source));

  const summaries = [];
  for (const item of cases) {
    const caseOutDir = path.join(args.outDir, item.name);
    const command = [
      "dogfood:template",
      "--",
      "--source",
      item.source,
      "--out",
      caseOutDir,
    ];
    const reference = args.referenceBySource.get(item.source) ?? item.reference;
    if (reference) command.push("--reference", reference);
    if (args.strict) command.push("--strict");
    if (args.strictVisual) command.push("--strict-visual");
    execFileSync("pnpm", command, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    summaries.push(
      JSON.parse(readFileSync(path.join(caseOutDir, "summary.json"), "utf8")),
    );
  }

  const suiteSummary = {
    createdAt: new Date().toISOString(),
    outDir: args.outDir,
    caseCount: summaries.length,
    cases: summaries,
  };
  writeFileSync(
    path.join(args.outDir, "suite-summary.json"),
    `${JSON.stringify(suiteSummary, null, 2)}\n`,
  );
  console.log(
    `[visual-template-suite] wrote ${path.join(args.outDir, "suite-summary.json")}`,
  );
}

function parseArgs(argv: string[]) {
  const sources: string[] = [];
  const referenceBySource = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--source" && argv[index + 1]) {
      sources.push(path.resolve(argv[index + 1]));
      index += 1;
      continue;
    }
    if (
      argv[index] === "--reference" &&
      sources[sources.length - 1] &&
      argv[index + 1]
    ) {
      referenceBySource.set(
        sources[sources.length - 1],
        path.resolve(argv[index + 1]),
      );
      index += 1;
    }
  }
  const outIndex = argv.findIndex((arg) => arg === "--out");
  const defaultOut = path.join(
    process.cwd(),
    ".dogfood",
    "visual-template-suite",
    new Date().toISOString().replace(/[:.]/g, "-"),
  );
  return {
    sources,
    referenceBySource,
    outDir: path.resolve(outIndex >= 0 ? argv[outIndex + 1] : defaultOut),
    strict: argv.includes("--strict"),
    strictVisual: argv.includes("--strict-visual"),
  };
}

function sanitizeBasename(value: string): string {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-|-$/g, "");
}

main();
