#!/usr/bin/env tsx

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createTemplateMigrationDraft } from "@/lib/resume/template-migration";
import { generateResumeHTMLV3 } from "@/lib/resume/template-v3-renderer";
import {
  buildVisualTemplateStressResume,
  verifyVisualTemplateRender,
} from "@/lib/resume/template-visual-verification";

interface Args {
  source: string;
  outDir: string;
  mode: "source" | "stress" | "both";
  strict: boolean;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePath = path.resolve(args.source);
  const sourceBuffer = readFileSync(sourcePath);
  mkdirSync(args.outDir, { recursive: true });

  const draft = await createTemplateMigrationDraft({
    buffer: sourceBuffer,
    filename: path.basename(sourcePath),
    mimeType: mimeTypeFor(sourcePath),
    userId: "visual-dogfood",
    llmClient: null,
    now: new Date().toISOString(),
  });

  writeJson(path.join(args.outDir, "source-ir.json"), draft.source);
  writeJson(path.join(args.outDir, "template-v3.json"), draft.templateV3);
  writeJson(path.join(args.outDir, "source-resume.json"), draft.resume);
  writeJson(path.join(args.outDir, "migration-fidelity.json"), draft.fidelity);

  const modes =
    args.mode === "both" ? (["source", "stress"] as const) : [args.mode];
  const reports = [];
  for (const mode of modes) {
    const resume =
      mode === "source"
        ? draft.resume
        : buildVisualTemplateStressResume(draft.resume);
    const html = generateResumeHTMLV3(resume, draft.templateV3);
    const htmlPath = path.join(args.outDir, `${mode}.html`);
    const screenshotPath = path.join(args.outDir, `${mode}.png`);
    writeFileSync(htmlPath, html);
    const report = await verifyVisualTemplateRender({
      html,
      source: draft.source,
      template: draft.templateV3,
      screenshotPath,
    });
    writeJson(path.join(args.outDir, `${mode}-report.json`), report);
    reports.push({ mode, report, htmlPath, screenshotPath });
  }

  const summary = {
    source: sourcePath,
    outDir: args.outDir,
    sourceType: draft.sourceType,
    templateName: draft.templateV3.name,
    reports: reports.map(({ mode, report, htmlPath, screenshotPath }) => ({
      mode,
      htmlPath,
      screenshotPath,
      estimatedPages: report.render.estimatedPages,
      overflowElements: report.render.overflow.elementCount,
      rightOverflowPx: report.render.overflow.rightPx,
      bottomOverflowPx: report.render.overflow.bottomPx,
      sourceLineCoverage: report.render.sourceLineCoverage,
      repeatedLineCount: report.render.duplicates.repeatedLineCount,
      averageAbsoluteDriftPx: report.render.absoluteDrift.averageDeltaPx,
      findings: report.findings,
    })),
  };
  writeJson(path.join(args.outDir, "summary.json"), summary);

  console.log(`[visual-template] source: ${sourcePath}`);
  console.log(`[visual-template] artifacts: ${args.outDir}`);
  for (const item of summary.reports) {
    const worst = item.findings
      .map((finding) => `${finding.severity}:${finding.code}`)
      .join(", ");
    console.log(
      `[visual-template] ${item.mode}: pages=${item.estimatedPages} overflow=${item.overflowElements} repeated=${item.repeatedLineCount} coverage=${Math.round(
        item.sourceLineCoverage * 100,
      )}% drift=${item.averageAbsoluteDriftPx.toFixed(1)}px findings=${worst}`,
    );
  }

  const hasErrors = reports.some(({ report }) =>
    report.findings.some((finding) => finding.severity === "error"),
  );
  if (args.strict && hasErrors) process.exit(1);
}

function parseArgs(argv: string[]): Args {
  const sourceIndex = argv.findIndex((arg) => arg === "--source");
  const source = sourceIndex >= 0 ? argv[sourceIndex + 1] : argv[0];
  if (!source) {
    console.error(
      "Usage: tsx scripts/verify-visual-template-import.ts --source <pdf|docx|tex> [--out <dir>] [--mode source|stress|both] [--strict]",
    );
    process.exit(2);
  }
  const outIndex = argv.findIndex((arg) => arg === "--out");
  const modeIndex = argv.findIndex((arg) => arg === "--mode");
  const defaultOut = path.join(
    process.cwd(),
    ".dogfood",
    "visual-template",
    `${sanitizeBasename(path.basename(source))}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`,
  );
  const mode = modeIndex >= 0 ? argv[modeIndex + 1] : "both";
  if (mode !== "source" && mode !== "stress" && mode !== "both") {
    throw new Error(`Invalid --mode ${mode}`);
  }
  return {
    source,
    outDir: path.resolve(outIndex >= 0 ? argv[outIndex + 1] : defaultOut),
    mode,
    strict: argv.includes("--strict"),
  };
}

function writeJson(filename: string, value: unknown): void {
  writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function sanitizeBasename(value: string): string {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-|-$/g, "");
}

function mimeTypeFor(filename: string): string | undefined {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".tex") return "text/x-tex";
  return undefined;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
