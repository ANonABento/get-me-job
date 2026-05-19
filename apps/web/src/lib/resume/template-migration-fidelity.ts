import type { SourceDocumentIR } from "@/lib/resume/template-migration";
import type {
  DocumentTemplateV2,
  ResumeSlotPath,
  TemplateBlock,
} from "@/lib/resume/template-v2";

export interface TemplateMigrationFidelityCheck {
  id: string;
  label: string;
  score: number;
  passed: boolean;
  detail: string;
}

export interface TemplateMigrationFidelityReport {
  score: number;
  status: "ready" | "review" | "low";
  checks: TemplateMigrationFidelityCheck[];
  metrics: {
    sourceBlocks: number;
    mappedBlocks: number;
    mappedBlockCoverage: number;
    geometryCoverage: number | null;
    semanticSlotCoverage: number;
    tableRows: number;
    preservedTableRows: number;
    styledBlocks: number;
    adoptedStyleTokens: number;
  };
}

export function assessTemplateMigrationFidelity(
  source: SourceDocumentIR,
  template: DocumentTemplateV2,
): TemplateMigrationFidelityReport {
  const sourceBlocks = source.blocks.filter((block) => block.text.trim());
  const sourceBlockIds = new Set(sourceBlocks.map((block) => block.id));
  const linkedBlockIds = new Set(
    template.slots.flatMap((slot) => slot.sourceBlockIds ?? []),
  );
  const mappedBlocks = Array.from(linkedBlockIds).filter((id) =>
    sourceBlockIds.has(id),
  ).length;
  const hintedPaths = new Set(
    sourceBlocks
      .map((block) => block.slotHint)
      .filter((path): path is ResumeSlotPath => Boolean(path)),
  );
  const mappedPaths = new Set(
    template.slots
      .filter((slot) =>
        slot.sourceBlockIds.some((id) => sourceBlockIds.has(id)),
      )
      .map((slot) => slot.path),
  );
  const tableRows = sourceBlocks.filter((block) => block.type === "table-row");
  const tableBlocks = template.regions
    .flatMap((region) => region.blocks)
    .filter((block) => block.columns || block.columnWidthsPt?.length);
  const styledBlocks = sourceBlocks.filter((block) => block.style);
  const adoptedStyleTokens = countAdoptedStyleTokens(template, source);
  const geometryBlocks = sourceBlocks.filter((block) => block.bbox);
  const geometryCoverage =
    source.sourceType === "pdf" && sourceBlocks.length
      ? geometryBlocks.length / sourceBlocks.length
      : null;
  const mappedBlockCoverage = sourceBlocks.length
    ? mappedBlocks / sourceBlocks.length
    : 0;
  const semanticSlotCoverage = hintedPaths.size
    ? Array.from(hintedPaths).filter((path) => mappedPaths.has(path)).length /
      hintedPaths.size
    : 1;
  const preservedTableRows =
    tableRows.length && tableBlocks.length ? tableRows.length : 0;

  const checks: TemplateMigrationFidelityCheck[] = [
    check(
      "page",
      "Page setup",
      pageSetupScore(source, template),
      "Page size and margins were inferred from the source.",
    ),
    check(
      "geometry",
      "Source geometry",
      geometryCoverage === null ? 1 : geometryCoverage,
      geometryCoverage === null
        ? "This source type does not expose PDF-style block boxes."
        : `${geometryBlocks.length} of ${sourceBlocks.length} source blocks have bounding boxes.`,
    ),
    check(
      "slots",
      "Semantic slots",
      semanticSlotCoverage,
      `${mappedPaths.size} of ${hintedPaths.size || mappedPaths.size} inferred slot groups are linked to template slots.`,
    ),
    check(
      "source-links",
      "Source block links",
      sourceBlocks.length ? Math.min(1, mappedBlockCoverage * 2) : 0,
      `${mappedBlocks} of ${sourceBlocks.length} source blocks are linked to reusable slots.`,
    ),
    check(
      "tables",
      "Table structure",
      tableRows.length ? preservedTableRows / tableRows.length : 1,
      tableRows.length
        ? `${preservedTableRows} of ${tableRows.length} table rows are represented by table/grid metadata.`
        : "No source tables were detected.",
    ),
    check(
      "styles",
      "Style hints",
      styledBlocks.length ? Math.min(1, adoptedStyleTokens / 3) : 1,
      styledBlocks.length
        ? `${adoptedStyleTokens} typography token groups adopted source style hints.`
        : "No source style hints were available.",
    ),
    check(
      "layout",
      "Layout flow",
      layoutScore(source, template),
      layoutDetail(source, template),
    ),
  ];
  const score = Math.round(
    (checks.reduce((sum, item) => sum + item.score, 0) / checks.length) * 100,
  );

  return {
    score,
    status: score >= 80 ? "ready" : score >= 55 ? "review" : "low",
    checks,
    metrics: {
      sourceBlocks: sourceBlocks.length,
      mappedBlocks,
      mappedBlockCoverage: roundRatio(mappedBlockCoverage),
      geometryCoverage:
        geometryCoverage === null ? null : roundRatio(geometryCoverage),
      semanticSlotCoverage: roundRatio(semanticSlotCoverage),
      tableRows: tableRows.length,
      preservedTableRows,
      styledBlocks: styledBlocks.length,
      adoptedStyleTokens,
    },
  };
}

function check(
  id: string,
  label: string,
  score: number,
  detail: string,
): TemplateMigrationFidelityCheck {
  const bounded = Math.max(0, Math.min(1, score));
  return {
    id,
    label,
    score: roundRatio(bounded),
    passed: bounded >= 0.75,
    detail,
  };
}

function pageSetupScore(
  source: SourceDocumentIR,
  template: DocumentTemplateV2,
): number {
  const page = source.pages[0];
  const hasSourceSize = Boolean(page?.widthPt && page.heightPt);
  const hasTemplateMargins = Object.values(template.page.margins).every(
    Boolean,
  );
  return hasSourceSize && template.page.size && hasTemplateMargins ? 1 : 0.4;
}

function layoutScore(
  source: SourceDocumentIR,
  template: DocumentTemplateV2,
): number {
  if (sourceHasTwoColumns(source)) {
    return template.regions.some((region) => region.role === "sidebar")
      ? 1
      : 0.35;
  }
  return template.regions.some((region) => region.role === "main") ? 1 : 0.5;
}

function layoutDetail(
  source: SourceDocumentIR,
  template: DocumentTemplateV2,
): string {
  if (sourceHasTwoColumns(source)) {
    return template.regions.some((region) => region.role === "sidebar")
      ? "Source column geometry was represented with sidebar and main regions."
      : "Source appears multi-column, but the template has no sidebar region.";
  }
  return "Source flow is represented with the template main region.";
}

function sourceHasTwoColumns(source: SourceDocumentIR): boolean {
  const page = source.pages[0];
  const boxes = source.blocks
    .map((block) => block.bbox)
    .filter((box): box is NonNullable<(typeof source.blocks)[number]["bbox"]> =>
      Boolean(box),
    );
  if (!page?.widthPt || boxes.length < 8) return false;
  const centers = boxes
    .filter((box) => box.widthPt > 12 && box.heightPt > 4)
    .map((box) => box.xPt + box.widthPt / 2)
    .sort((a, b) => a - b);
  if (centers.length < 8) return false;
  let largestGap = 0;
  let split = 0;
  for (let i = 1; i < centers.length; i += 1) {
    const gap = centers[i] - centers[i - 1];
    if (gap > largestGap) {
      largestGap = gap;
      split = (centers[i] + centers[i - 1]) / 2;
    }
  }
  const leftCount = centers.filter((center) => center < split).length;
  const rightCount = centers.length - leftCount;
  return (
    largestGap > page.widthPt * 0.08 &&
    split > page.widthPt * 0.2 &&
    split < page.widthPt * 0.55 &&
    leftCount >= 3 &&
    rightCount >= 3
  );
}

function countAdoptedStyleTokens(
  template: DocumentTemplateV2,
  source: SourceDocumentIR,
): number {
  const sourceFamilies = new Set(
    source.blocks
      .map((block) => block.style?.fontFamily)
      .filter((family): family is string => Boolean(family)),
  );
  const sourceSizes = new Set(
    source.blocks
      .map((block) => block.style?.fontSizePt)
      .filter((size): size is number => Boolean(size))
      .map((size) => `${size}pt`),
  );
  const tokens = Object.values(template.tokens);
  return tokens.filter(
    (token) =>
      sourceFamilies.has(token.fontFamily) || sourceSizes.has(token.fontSize),
  ).length;
}

function roundRatio(value: number): number {
  return Math.round(value * 100) / 100;
}
