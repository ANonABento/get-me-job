#!/usr/bin/env tsx

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createTemplateMigrationDraft } from "@/lib/resume/template-migration";
import { generateResumeHTMLV3 } from "@/lib/resume/template-v3-renderer";
import {
  buildVisualTemplateStressResume,
  compareVisualTemplateImages,
  verifyReusableTemplateRender,
  verifyVisualTemplateRender,
} from "@/lib/resume/template-visual-verification";
import {
  analyzeUniversalTemplateImport,
  inferImportedTemplateStyleTokens,
  inferResumeSemanticIR,
} from "@/lib/resume/universal-template-import";
import {
  buildReusableResumeTemplateIR,
  renderReusableResumeTemplateHTML,
  renderTailoredResumeWithReusableTemplate,
} from "@/lib/resume/universal-template-renderer";

interface Args {
  source: string;
  reference?: string;
  outDir: string;
  mode: "source" | "stress" | "both";
  strict: boolean;
  strictVisual: boolean;
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
  const universalAnalysis = analyzeUniversalTemplateImport(draft.source);
  const semanticResume = inferResumeSemanticIR(draft.source);
  const styleTokens = inferImportedTemplateStyleTokens(draft.source);
  const reusableTemplate = buildReusableResumeTemplateIR(
    semanticResume,
    styleTokens,
  );
  const reusableHtml = renderReusableResumeTemplateHTML(
    semanticResume,
    reusableTemplate,
  );
  writeJson(
    path.join(args.outDir, "universal-template-analysis.json"),
    universalAnalysis,
  );
  writeJson(path.join(args.outDir, "semantic-resume-ir.json"), semanticResume);
  writeJson(path.join(args.outDir, "style-tokens.json"), styleTokens);
  writeJson(
    path.join(args.outDir, "reusable-template-ir.json"),
    reusableTemplate,
  );
  writeFileSync(path.join(args.outDir, "reusable.html"), reusableHtml);

  const referencePath = resolveReferencePath(sourcePath, args.reference);
  const referenceImagePath = referencePath
    ? rasterizeReference(referencePath, args.outDir)
    : null;

  const modes =
    args.mode === "both" ? (["source", "stress"] as const) : [args.mode];
  const reports = [];
  for (const mode of modes) {
    const html =
      mode === "source"
        ? reusableHtml
        : renderTailoredResumeWithReusableTemplate(
            buildVisualTemplateStressResume(draft.resume),
            reusableTemplate,
          );
    const htmlPath = path.join(args.outDir, `${mode}.html`);
    const screenshotPath = path.join(args.outDir, `${mode}.png`);
    writeFileSync(htmlPath, html);
    const report = await verifyReusableTemplateRender({
      html,
      source: draft.source,
      screenshotPath,
    });
    const imageComparison =
      mode === "source" && referenceImagePath
        ? await compareVisualTemplateImages({
            referencePath: referenceImagePath,
            renderedPath: screenshotPath,
            diffPath: path.join(args.outDir, "source-diff.png"),
          })
        : null;
    writeJson(path.join(args.outDir, `${mode}-report.json`), report);
    if (imageComparison) {
      writeJson(
        path.join(args.outDir, `${mode}-image-comparison.json`),
        imageComparison,
      );
    }
    reports.push({ mode, report, htmlPath, screenshotPath, imageComparison });
  }

  const legacyHtml =
    args.mode === "stress"
      ? null
      : generateResumeHTMLV3(draft.resume, draft.templateV3);
  if (legacyHtml) {
    const legacyHtmlPath = path.join(args.outDir, "legacy-source.html");
    const legacyScreenshotPath = path.join(args.outDir, "legacy-source.png");
    writeFileSync(legacyHtmlPath, legacyHtml);
    const legacyReport = await verifyVisualTemplateRender({
      html: legacyHtml,
      source: draft.source,
      template: draft.templateV3,
      screenshotPath: legacyScreenshotPath,
    });
    writeJson(
      path.join(args.outDir, "legacy-source-report.json"),
      legacyReport,
    );
  }

  const summary = {
    source: sourcePath,
    outDir: args.outDir,
    sourceType: draft.sourceType,
    templateName: draft.templateV3.name,
    reference: referencePath,
    referenceImagePath,
    sourceIr: draft.source,
    universalAnalysis,
    semanticResume,
    styleTokens,
    reusableTemplate,
    reusableHtmlPath: path.join(args.outDir, "reusable.html"),
    reports: reports.map(
      ({ mode, report, htmlPath, screenshotPath, imageComparison }) => ({
        mode,
        htmlPath,
        screenshotPath,
        sourcePageCount: report.source.pageCount,
        estimatedPages: report.render.estimatedPages,
        overflowElements: report.render.overflow.elementCount,
        rightOverflowPx: report.render.overflow.rightPx,
        bottomOverflowPx: report.render.overflow.bottomPx,
        sourceLineCoverage: report.render.sourceLineCoverage,
        repeatedLineCount: report.render.duplicates.repeatedLineCount,
        averageAbsoluteDriftPx: report.render.absoluteDrift.averageDeltaPx,
        imageComparison: imageComparison
          ? {
              diffPath: imageComparison.diffPath,
              meanAbsoluteDiff: imageComparison.meanAbsoluteDiff,
              rootMeanSquareDiff: imageComparison.rootMeanSquareDiff,
              changedPixelRatio: imageComparison.changedPixelRatio,
              similarity: imageComparison.similarity,
            }
          : null,
        findings: report.findings,
      }),
    ),
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
      )}% drift=${item.averageAbsoluteDriftPx.toFixed(1)}px${item.imageComparison ? ` imageDiff=${item.imageComparison.meanAbsoluteDiff.toFixed(1)} changed=${Math.round(item.imageComparison.changedPixelRatio * 100)}%` : ""} findings=${worst}`,
    );
  }

  const hasErrors = reports.some(({ report }) =>
    report.findings.some((finding) => finding.severity === "error"),
  );
  const hasVisualErrors = reports.some(
    ({ imageComparison }) =>
      imageComparison &&
      (imageComparison.meanAbsoluteDiff > 32 ||
        imageComparison.changedPixelRatio > 0.42),
  );
  if ((args.strict && hasErrors) || (args.strictVisual && hasVisualErrors)) {
    process.exit(1);
  }
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
  const referenceIndex = argv.findIndex((arg) => arg === "--reference");
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
    reference: referenceIndex >= 0 ? argv[referenceIndex + 1] : undefined,
    outDir: path.resolve(outIndex >= 0 ? argv[outIndex + 1] : defaultOut),
    mode,
    strict: argv.includes("--strict"),
    strictVisual: argv.includes("--strict-visual"),
  };
}

function resolveReferencePath(
  sourcePath: string,
  referenceArg: string | undefined,
): string | null {
  if (referenceArg) return path.resolve(referenceArg);
  if (path.extname(sourcePath).toLowerCase() === ".pdf") return sourcePath;
  const siblingPdf = sourcePath.replace(/\.[^.]+$/, ".pdf");
  return existsSync(siblingPdf) ? siblingPdf : null;
}

function rasterizeReference(referencePath: string, outDir: string): string {
  const ext = path.extname(referencePath).toLowerCase();
  if (ext === ".png") return referencePath;
  if (ext !== ".pdf") {
    throw new Error(`Unsupported visual reference type: ${referencePath}`);
  }
  const outputPrefix = path.join(outDir, "source-reference");
  execFileSync("pdftoppm", [
    "-png",
    "-singlefile",
    "-f",
    "1",
    "-l",
    "1",
    "-r",
    "96",
    referencePath,
    outputPrefix,
  ]);
  return `${outputPrefix}.png`;
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
