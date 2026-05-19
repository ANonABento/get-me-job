import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
import type { TailoredResume } from "@/lib/resume/generator";
import type {
  DocumentTemplateV3,
  TemplateNodeV3,
} from "@/lib/resume/template-v3";
import type { SourceDocumentIR } from "@/lib/resume/template-migration";

export interface VisualTemplateSourceMetrics {
  sourceType: SourceDocumentIR["sourceType"];
  pageCount: number;
  page: { widthPt: number; heightPt: number };
  blockCount: number;
  textBlockCount: number;
  positionedBlockCount: number;
  tableRowCount: number;
  tableCellCount: number;
  rawTextCharacters: number;
  sourceLineCount: number;
  templateFlow: string;
  templateNodeCount: number;
  templateSlotCount: number;
  templateRepeatGroupCount: number;
}

export interface VisualTemplateRenderMetrics {
  root: {
    widthPx: number;
    heightPx: number;
    scrollWidthPx: number;
    scrollHeightPx: number;
  };
  estimatedPages: number;
  visibleTextBlockCount: number;
  renderedLineCount: number;
  sourceLineCoverage: number;
  overflow: {
    rightPx: number;
    bottomPx: number;
    elementCount: number;
    elements: Array<{
      nodeId: string;
      sourceId: string;
      text: string;
      rightOverflowPx: number;
      bottomOverflowPx: number;
    }>;
  };
  duplicates: {
    repeatedLineCount: number;
    repeatedLines: Array<{ text: string; count: number }>;
  };
  absoluteDrift: {
    comparedCount: number;
    averageDeltaPx: number;
    maxDeltaPx: number;
    worst: Array<{
      sourceId: string;
      nodeId: string;
      text: string;
      dxPx: number;
      dyPx: number;
      dwPx: number;
      dhPx: number;
      deltaPx: number;
    }>;
  };
}

export interface VisualTemplateVerificationReport {
  source: VisualTemplateSourceMetrics;
  render: VisualTemplateRenderMetrics;
  findings: Array<{
    severity: "info" | "warning" | "error";
    code: string;
    message: string;
  }>;
}

export interface VisualTemplateImageComparison {
  referencePath: string;
  renderedPath: string;
  diffPath?: string;
  widthPx: number;
  heightPx: number;
  meanAbsoluteDiff: number;
  rootMeanSquareDiff: number;
  changedPixelRatio: number;
  similarity: number;
}

export function collectVisualTemplateSourceMetrics(
  source: SourceDocumentIR,
  template: DocumentTemplateV3,
): VisualTemplateSourceMetrics {
  const page = source.pages[0];
  return {
    sourceType: source.sourceType,
    pageCount: source.pages.length,
    page: {
      widthPt: page?.widthPt ?? template.page.widthPt,
      heightPt: page?.heightPt ?? template.page.heightPt,
    },
    blockCount: source.blocks.length,
    textBlockCount: source.blocks.filter((block) => block.text.trim()).length,
    positionedBlockCount: source.blocks.filter((block) => block.bbox).length,
    tableRowCount: source.blocks.filter((block) => block.type === "table-row")
      .length,
    tableCellCount: source.blocks.reduce(
      (sum, block) => sum + (block.cellMetadata?.length ?? 0),
      0,
    ),
    rawTextCharacters: source.rawText.length,
    sourceLineCount: normalizedLines(source.rawText).length,
    templateFlow: template.regions.map((region) => region.flow).join(","),
    templateNodeCount: template.regions.reduce(
      (sum, region) =>
        sum + region.nodes.reduce((n, node) => n + countNode(node), 0),
      0,
    ),
    templateSlotCount: template.slots.length,
    templateRepeatGroupCount: template.repeatGroups.length,
  };
}

export async function verifyVisualTemplateRender({
  html,
  source,
  template,
  screenshotPath,
}: {
  html: string;
  source: SourceDocumentIR;
  template: DocumentTemplateV3;
  screenshotPath?: string;
}): Promise<VisualTemplateVerificationReport> {
  const sourceMetrics = collectVisualTemplateSourceMetrics(source, template);
  const render = await measureRenderedTemplate(html, source, screenshotPath);
  return {
    source: sourceMetrics,
    render,
    findings: findingsFor(sourceMetrics, render),
  };
}

export function buildVisualTemplateStressResume(
  base: TailoredResume,
): TailoredResume {
  return {
    contact: {
      ...base.contact,
      name: base.contact.name || "Your Name",
      email: base.contact.email || "candidate@example.com",
      location: base.contact.location || "Waterloo, ON",
    },
    summary:
      base.summary ||
      "Systems engineer focused on robotics, applied AI, and production software.",
    experiences: [
      {
        title: "Software Engineer",
        company: "Hamming AI",
        dates: "Dec 2025 - Apr 2026",
        highlights: [
          "Shipped evaluation workflows with long but realistic resume text to expose overflow in fixed-position imported templates.",
          "Built transaction-safe ingestion, rendering diagnostics, and UI guardrails across production workflows.",
          "Improved reliability by tracing failures through source IDs, rendered DOM nodes, screenshots, and exported documents.",
        ],
      },
      {
        title: "Robotics Engineer",
        company: "Reazon Human Interaction Lab",
        dates: "Jun 2025 - Aug 2025",
        highlights: [
          "Integrated speech, servo control, calibration, and realtime telemetry for interactive hardware demos.",
          "Designed compact control surfaces and debugging dashboards for repeated operator use.",
        ],
      },
      ...(base.experiences ?? []).slice(0, 1),
    ],
    skills: base.skills.length
      ? base.skills
      : ["TypeScript", "React", "Python", "ROS 2", "Computer Vision"],
    education: base.education.length
      ? base.education
      : [
          {
            institution: "University of Waterloo",
            degree: "BASc",
            field: "Computer Engineering",
            date: "Sept 2024 - Present",
          },
        ],
    projects: [
      {
        name: "Slothing",
        description: "AI job platform and semantic resume profile bank",
        highlights: [
          "Built a semantic profile bank, vector search, and template-aware resume rendering pipeline.",
          "Added dogfood verification artifacts so import regressions are visible before manual testing.",
        ],
      },
      {
        name: "One Handed Keyboard",
        description: "Accessible hardware input system",
        highlights: [
          "Designed and tested a compact keyboard interaction model.",
        ],
      },
      ...(base.projects ?? []).slice(0, 1),
    ],
    certifications: base.certifications ?? [],
    awards: base.awards ?? [],
  };
}

export async function compareVisualTemplateImages({
  referencePath,
  renderedPath,
  diffPath,
}: {
  referencePath: string;
  renderedPath: string;
  diffPath?: string;
}): Promise<VisualTemplateImageComparison> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
  });
  try {
    await page.evaluate("globalThis.__name = (fn) => fn");
    const result = await page.evaluate(
      async ({
        referenceUrl,
        renderedUrl,
      }: {
        referenceUrl: string;
        renderedUrl: string;
      }) => {
        async function loadImage(src: string): Promise<HTMLImageElement> {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          await img.decode();
          return img;
        }

        const [reference, rendered] = await Promise.all([
          loadImage(referenceUrl),
          loadImage(renderedUrl),
        ]);
        const width = reference.naturalWidth;
        const height = reference.naturalHeight;
        const referenceCanvas = document.createElement("canvas");
        const renderedCanvas = document.createElement("canvas");
        const diffCanvas = document.createElement("canvas");
        referenceCanvas.width = width;
        renderedCanvas.width = width;
        diffCanvas.width = width;
        referenceCanvas.height = height;
        renderedCanvas.height = height;
        diffCanvas.height = height;
        const referenceContext = referenceCanvas.getContext("2d");
        const renderedContext = renderedCanvas.getContext("2d");
        const diffContext = diffCanvas.getContext("2d");
        if (!referenceContext || !renderedContext || !diffContext) {
          throw new Error("Canvas is unavailable for image comparison");
        }

        for (const context of [referenceContext, renderedContext]) {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
        }
        referenceContext.drawImage(reference, 0, 0, width, height);
        renderedContext.drawImage(rendered, 0, 0, width, height);

        const referencePixels = referenceContext.getImageData(
          0,
          0,
          width,
          height,
        );
        const renderedPixels = renderedContext.getImageData(
          0,
          0,
          width,
          height,
        );
        const diffPixels = diffContext.createImageData(width, height);
        let absoluteDiff = 0;
        let squaredDiff = 0;
        let changed = 0;
        const channelCount = width * height * 3;
        for (let index = 0; index < referencePixels.data.length; index += 4) {
          const red = Math.abs(
            referencePixels.data[index] - renderedPixels.data[index],
          );
          const green = Math.abs(
            referencePixels.data[index + 1] - renderedPixels.data[index + 1],
          );
          const blue = Math.abs(
            referencePixels.data[index + 2] - renderedPixels.data[index + 2],
          );
          const average = (red + green + blue) / 3;
          absoluteDiff += red + green + blue;
          squaredDiff += red * red + green * green + blue * blue;
          if (average > 35) changed += 1;
          diffPixels.data[index] = Math.min(255, red * 4);
          diffPixels.data[index + 1] = Math.min(255, green * 4);
          diffPixels.data[index + 2] = Math.min(255, blue * 4);
          diffPixels.data[index + 3] = 255;
        }
        diffContext.putImageData(diffPixels, 0, 0);
        const meanAbsoluteDiff = absoluteDiff / channelCount;
        return {
          widthPx: width,
          heightPx: height,
          meanAbsoluteDiff,
          rootMeanSquareDiff: Math.sqrt(squaredDiff / channelCount),
          changedPixelRatio: changed / (width * height),
          similarity: 1 - meanAbsoluteDiff / 255,
          diffDataUrl: diffCanvas.toDataURL("image/png"),
        };
      },
      {
        referenceUrl: pngDataUrl(referencePath),
        renderedUrl: pngDataUrl(renderedPath),
      },
    );

    if (diffPath) {
      writeFileSync(
        diffPath,
        Buffer.from(
          result.diffDataUrl.replace(/^data:image\/png;base64,/, ""),
          "base64",
        ),
      );
    }

    return {
      referencePath,
      renderedPath,
      diffPath,
      widthPx: result.widthPx,
      heightPx: result.heightPx,
      meanAbsoluteDiff: result.meanAbsoluteDiff,
      rootMeanSquareDiff: result.rootMeanSquareDiff,
      changedPixelRatio: result.changedPixelRatio,
      similarity: result.similarity,
    };
  } finally {
    await page.close();
    await browser.close();
  }
}

function pngDataUrl(filename: string): string {
  return `data:image/png;base64,${readFileSync(filename).toString("base64")}`;
}

async function measureRenderedTemplate(
  html: string,
  source: SourceDocumentIR,
  screenshotPath?: string,
): Promise<VisualTemplateRenderMetrics> {
  const pageInfo = source.pages[0];
  const width = Math.ceil(((pageInfo?.widthPt ?? 612) * 4) / 3) + 260;
  const height = Math.ceil(((pageInfo?.heightPt ?? 792) * 4) / 3) + 260;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.setContent(html, { waitUntil: "load" });
    const sourceBoxes = source.blocks.reduce<
      Record<
        string,
        {
          text: string;
          xPt: number;
          yPt: number;
          widthPt: number;
          heightPt: number;
        }
      >
    >((boxes, block) => {
      if (!block.bbox) return boxes;
      boxes[block.id] = { text: block.text, ...block.bbox };
      return boxes;
    }, {});
    const sourceLines = normalizedLines(source.rawText);
    await page.evaluate("globalThis.__name = (fn) => fn");
    const metrics = (await page.locator(".resume-v3").evaluate(
      (
        root,
        input: {
          sourceBoxes: Record<
            string,
            {
              text: string;
              xPt: number;
              yPt: number;
              widthPt: number;
              heightPt: number;
            }
          >;
          sourceLines: string[];
        },
      ) => {
        const ptToPx = 4 / 3;
        const overflowTolerancePx = 2.5;
        const { sourceBoxes, sourceLines } = input;
        const normalizeBrowserLines = (text: string) =>
          text
            .split(/\r?\n/)
            .map((line) => line.replace(/\s+/g, " ").trim().toLowerCase())
            .filter(Boolean);
        const rootRect = root.getBoundingClientRect();
        const rootElement = root as HTMLElement;
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>(
            "[data-v3-node-id], .v3-text, .v3-section-title, .v3-cell, .v3-table",
          ),
        );
        const visibleTextBlocks = candidates.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && element.innerText.trim();
        });
        const overflowElements = candidates
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              nodeId: element.dataset.v3NodeId ?? "",
              sourceId: element.dataset.sourceId ?? "",
              text: element.innerText.replace(/\s+/g, " ").trim().slice(0, 140),
              rightOverflowPx: Math.max(0, rect.right - rootRect.right),
              bottomOverflowPx: Math.max(0, rect.bottom - rootRect.bottom),
            };
          })
          .filter(
            (item) =>
              item.rightOverflowPx > overflowTolerancePx ||
              item.bottomOverflowPx > overflowTolerancePx,
          )
          .sort(
            (a, b) =>
              b.rightOverflowPx +
              b.bottomOverflowPx -
              (a.rightOverflowPx + a.bottomOverflowPx),
          );
        const renderedLines = normalizeBrowserLines(document.body.innerText);
        const renderedLineSet = new Set(renderedLines);
        const coveredLines = sourceLines.filter((line) =>
          renderedLineSet.has(line),
        ).length;
        const lineCounts = new Map<string, number>();
        for (const line of renderedLines) {
          if (line.length < 24) continue;
          lineCounts.set(line, (lineCounts.get(line) ?? 0) + 1);
        }
        const repeatedLines = Array.from(lineCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([text, count]) => ({ text, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12);
        const drifts = candidates
          .map((element) => {
            const sourceId = element.dataset.sourceId ?? "";
            const box = sourceBoxes[sourceId];
            if (!box) return null;
            const rect = element.getBoundingClientRect();
            const expectedLeft = rootRect.left + box.xPt * ptToPx;
            const expectedTop = rootRect.top + box.yPt * ptToPx;
            const expectedWidth = box.widthPt * ptToPx;
            const expectedHeight = box.heightPt * ptToPx;
            const dxPx = Math.abs(rect.left - expectedLeft);
            const dyPx = Math.abs(rect.top - expectedTop);
            const dwPx = Math.abs(rect.width - expectedWidth);
            const dhPx = Math.abs(rect.height - expectedHeight);
            return {
              sourceId,
              nodeId: element.dataset.v3NodeId ?? "",
              text: (element.innerText || box.text)
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 140),
              dxPx,
              dyPx,
              dwPx,
              dhPx,
              deltaPx: dxPx + dyPx + dwPx + dhPx,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .sort((a, b) => b.deltaPx - a.deltaPx);
        const averageDeltaPx =
          drifts.length === 0
            ? 0
            : drifts.reduce((sum, item) => sum + item.deltaPx, 0) /
              drifts.length;
        const rightOverflowPx = Math.max(
          rootElement.scrollWidth - Math.ceil(rootRect.width),
          ...overflowElements.map((item) => item.rightOverflowPx),
          0,
        );
        const bottomOverflowPx = Math.max(
          rootElement.scrollHeight - Math.ceil(rootRect.height),
          ...overflowElements.map((item) => item.bottomOverflowPx),
          0,
        );
        return {
          root: {
            widthPx: rootRect.width,
            heightPx: rootRect.height,
            scrollWidthPx: rootElement.scrollWidth,
            scrollHeightPx: rootElement.scrollHeight,
          },
          estimatedPages: Math.max(
            1,
            Math.ceil(rootElement.scrollHeight / Math.max(1, rootRect.height)),
          ),
          visibleTextBlockCount: visibleTextBlocks.length,
          renderedLineCount: renderedLines.length,
          sourceLineCoverage: sourceLines.length
            ? coveredLines / sourceLines.length
            : 1,
          overflow: {
            rightPx:
              rightOverflowPx > overflowTolerancePx ? rightOverflowPx : 0,
            bottomPx:
              bottomOverflowPx > overflowTolerancePx ? bottomOverflowPx : 0,
            elementCount: overflowElements.length,
            elements: overflowElements.slice(0, 20),
          },
          duplicates: {
            repeatedLineCount: repeatedLines.length,
            repeatedLines,
          },
          absoluteDrift: {
            comparedCount: drifts.length,
            averageDeltaPx,
            maxDeltaPx: drifts[0]?.deltaPx ?? 0,
            worst: drifts.slice(0, 20),
          },
        };
      },
      { sourceBoxes, sourceLines },
    )) as VisualTemplateRenderMetrics;
    if (screenshotPath) {
      await page.locator(".resume-v3").screenshot({ path: screenshotPath });
    }
    return metrics;
  } finally {
    await page.close();
    await browser.close();
  }
}

function findingsFor(
  source: VisualTemplateSourceMetrics,
  render: VisualTemplateRenderMetrics,
): VisualTemplateVerificationReport["findings"] {
  const findings: VisualTemplateVerificationReport["findings"] = [];
  if (render.estimatedPages > source.pageCount) {
    findings.push({
      severity: "error",
      code: "page-overflow",
      message: `Rendered output estimates ${render.estimatedPages} pages from a ${source.pageCount}-page source.`,
    });
  }
  if (render.overflow.elementCount > 0 || render.overflow.rightPx > 2) {
    findings.push({
      severity: "error",
      code: "element-overflow",
      message: `${render.overflow.elementCount} rendered elements overflow the imported page box.`,
    });
  }
  if (
    source.positionedBlockCount > 0 &&
    render.absoluteDrift.comparedCount === 0
  ) {
    findings.push({
      severity: "error",
      code: "missing-source-node-links",
      message:
        "Source had positioned blocks, but rendered HTML did not expose comparable source IDs.",
    });
  }
  if (
    source.positionedBlockCount > 0 &&
    render.absoluteDrift.comparedCount > 0 &&
    render.absoluteDrift.averageDeltaPx > 12
  ) {
    findings.push({
      severity: "warning",
      code: "absolute-geometry-drift",
      message: `Average source-to-rendered box drift is ${render.absoluteDrift.averageDeltaPx.toFixed(1)}px.`,
    });
  }
  if (render.duplicates.repeatedLineCount > 4) {
    findings.push({
      severity: "warning",
      code: "duplicate-lines",
      message: `${render.duplicates.repeatedLineCount} long rendered lines repeat.`,
    });
  }
  if (render.sourceLineCoverage < 0.55) {
    findings.push({
      severity: "warning",
      code: "low-source-text-coverage",
      message: `Rendered text covers ${(render.sourceLineCoverage * 100).toFixed(0)}% of normalized source lines.`,
    });
  }
  if (!findings.length) {
    findings.push({
      severity: "info",
      code: "visual-check-pass",
      message:
        "No overflow, duplication, or source geometry issues were detected.",
    });
  }
  return findings;
}

function countNode(node: TemplateNodeV3): number {
  if (node.kind === "table") {
    return (
      1 +
      node.rows.reduce(
        (sum, row) =>
          sum +
          1 +
          row.cells.reduce(
            (cellSum, cell) =>
              cellSum +
              1 +
              cell.nodes.reduce(
                (nodeSum, child) => nodeSum + countNode(child),
                0,
              ),
            0,
          ),
        0,
      )
    );
  }
  if (node.kind === "row") {
    return (
      1 +
      node.cells.reduce(
        (sum, cell) =>
          sum +
          1 +
          cell.nodes.reduce((nodeSum, child) => nodeSum + countNode(child), 0),
        0,
      )
    );
  }
  if (node.kind === "cell") {
    return 1 + node.nodes.reduce((sum, child) => sum + countNode(child), 0);
  }
  return 1;
}

function normalizedLines(text: string): string[] {
  return text.split(/\r?\n/).map(normalizeLine).filter(Boolean);
}

function normalizeLines(text: string): string[] {
  return normalizedLines(text);
}

function normalizeLine(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}
