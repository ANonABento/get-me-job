import type { SourceDocumentIR } from "@/lib/resume/template-migration";
import type {
  DocumentTemplateV2,
  ResumeSlotPath,
  TemplateBlock,
} from "@/lib/resume/template-v2";
import type {
  DocumentTemplateV3,
  TemplateNodeV3,
  TemplateTable,
  TemplateTableCell,
  TemplateTableRow,
} from "@/lib/resume/template-v3";

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

export interface VisualTemplateFidelityReport {
  score: number;
  status: "ready" | "review" | "low";
  checks: TemplateMigrationFidelityCheck[];
  metrics: {
    pageSetup: number;
    tableStructure: number;
    cellGeometry: number;
    styleCoverage: number;
    slotCoverage: number;
    repeatGroupCoverage: number;
    renderCompleteness: number;
    tablesDetected: number;
    sourceTableRows: number;
    rowsPreserved: number;
    sourceCells: number;
    cellsPreserved: number;
    repeatGroups: number;
    slotsMapped: number;
  };
}

export type TemplateMigrationFidelityLike =
  | TemplateMigrationFidelityReport
  | VisualTemplateFidelityReport;

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

export function assessVisualTemplateFidelity(
  source: SourceDocumentIR,
  template: DocumentTemplateV3,
): VisualTemplateFidelityReport {
  const sourceBlocks = source.blocks.filter((block) => block.text.trim());
  const sourceTableRows = source.blocks.filter(
    (block) => block.type === "table-row",
  );
  const sourceCells = countSourceCells(source);
  const tables = collectV3Tables(template);
  const rows = tables.flatMap((table) => table.rows);
  const cells = rows.flatMap((row) => row.cells);
  const slotsMapped = template.slots.filter(
    (slot) => slot.sourceRefs.length || slot.fallback,
  ).length;
  const expectedRepeatGroups = expectedRepeatGroupCollections(source);
  const repeatGroups = template.repeatGroups.filter(
    (group) => group.nodeIds.length || group.sourceRefs.length,
  );
  const pageSetup = visualPageSetupScore(template);
  const tableStructure = sourceTableRows.length
    ? Math.min(1, rows.length / sourceTableRows.length)
    : tables.length
      ? 1
      : 0.75;
  const cellGeometry = sourceCells
    ? Math.min(1, cells.length / sourceCells)
    : cells.length
      ? 1
      : 0.75;
  const styleCoverage = visualStyleCoverage(template, cells);
  const slotCoverage = visualSlotCoverage(source, template);
  const repeatGroupCoverage = expectedRepeatGroups.size
    ? Math.min(1, repeatGroups.length / expectedRepeatGroups.size)
    : 1;
  const renderCompleteness = visualRenderCompleteness(template);

  const checks: TemplateMigrationFidelityCheck[] = [
    check(
      "page_setup_detected",
      "Page setup",
      pageSetup,
      "Page dimensions and margins were captured for the visual template.",
    ),
    check(
      "tables_detected",
      "Table structure",
      tableStructure,
      sourceTableRows.length
        ? `${rows.length} of ${sourceTableRows.length} source table rows are represented in V3 tables.`
        : tables.length
          ? `${tables.length} V3 tables were detected.`
          : "No source tables were detected.",
    ),
    check(
      "cell_geometry_detected",
      "Cell geometry",
      cellGeometry,
      sourceCells
        ? `${cells.length} of ${sourceCells} source cells are preserved as V3 cells.`
        : `${cells.length} V3 cells are available for rendering.`,
    ),
    check(
      "style_coverage_detected",
      "Style coverage",
      styleCoverage,
      "Typography, fills, borders, alignment, and padding were sampled from the visual structure.",
    ),
    check(
      "required_slots_mapped",
      "Required slots",
      slotCoverage,
      "Name plus at least one contact slot should be mapped before saving.",
    ),
    check(
      "repeat_groups_detected",
      "Repeat groups",
      repeatGroupCoverage,
      expectedRepeatGroups.size
        ? `${repeatGroups.length} repeat groups were detected for ${expectedRepeatGroups.size} repeatable source sections.`
        : "No repeatable source sections were required.",
    ),
    check(
      "preview_renderable",
      "Renderable structure",
      renderCompleteness,
      "The template includes regions and renderable nodes.",
    ),
  ];
  const rawScore = Math.round(
    (checks.reduce((sum, item) => sum + item.score, 0) / checks.length) * 100,
  );
  const forcedLow =
    !template.regions.length ||
    renderCompleteness < 0.5 ||
    pageSetup < 0.75 ||
    (sourceTableRows.length > 0 && (tables.length === 0 || cells.length === 0));
  const status = forcedLow
    ? "low"
    : rawScore >= 80
      ? "ready"
      : rawScore >= 55
        ? "review"
        : "low";

  return {
    score: rawScore,
    status,
    checks,
    metrics: {
      pageSetup: roundRatio(pageSetup),
      tableStructure: roundRatio(tableStructure),
      cellGeometry: roundRatio(cellGeometry),
      styleCoverage: roundRatio(styleCoverage),
      slotCoverage: roundRatio(slotCoverage),
      repeatGroupCoverage: roundRatio(repeatGroupCoverage),
      renderCompleteness: roundRatio(renderCompleteness),
      tablesDetected: tables.length,
      sourceTableRows: sourceTableRows.length,
      rowsPreserved: rows.length,
      sourceCells,
      cellsPreserved: cells.length,
      repeatGroups: repeatGroups.length,
      slotsMapped,
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

function collectV3Tables(template: DocumentTemplateV3): TemplateTable[] {
  return template.regions.flatMap((region) =>
    collectTablesFromNodes(region.nodes),
  );
}

function collectTablesFromNodes(nodes: TemplateNodeV3[]): TemplateTable[] {
  return nodes.flatMap((node) => {
    if (node.kind === "table") return [node];
    if (node.kind === "row") return collectTablesFromRows([node]);
    if (node.kind === "cell") return collectTablesFromCells([node]);
    return [];
  });
}

function collectTablesFromRows(rows: TemplateTableRow[]): TemplateTable[] {
  return rows.flatMap((row) => collectTablesFromCells(row.cells));
}

function collectTablesFromCells(cells: TemplateTableCell[]): TemplateTable[] {
  return cells.flatMap((cell) => collectTablesFromNodes(cell.nodes));
}

function countSourceCells(source: SourceDocumentIR): number {
  return source.blocks.reduce((count, block) => {
    if (block.cellMetadata?.length) return count + block.cellMetadata.length;
    return count + (block.cells?.length ?? 0);
  }, 0);
}

function visualPageSetupScore(template: DocumentTemplateV3): number {
  const hasSize = Boolean(template.page.widthPt && template.page.heightPt);
  const hasMargins = Object.values(template.page.margins).every(Boolean);
  return hasSize && hasMargins ? 1 : hasSize ? 0.65 : 0.2;
}

function visualStyleCoverage(
  template: DocumentTemplateV3,
  cells: TemplateTableCell[],
): number {
  const styledCells = cells.filter(
    (cell) =>
      cell.padding ||
      cell.borders ||
      cell.fill ||
      cell.textAlign ||
      cell.verticalAlign,
  ).length;
  const styledRegions = template.regions.filter(
    (region) => region.style?.padding || region.style?.fill,
  ).length;
  const tokenCount = Object.keys(template.tokens).length;
  const styleSignals = styledCells + styledRegions + tokenCount;
  const denominator = Math.max(1, Math.min(8, cells.length || tokenCount || 1));
  return Math.min(1, styleSignals / denominator);
}

function visualSlotCoverage(
  source: SourceDocumentIR,
  template: DocumentTemplateV3,
): number {
  const hasText = source.blocks.some((block) => block.text.trim());
  if (!hasText) return 1;
  const mappedPaths = new Set(
    template.slots
      .filter((slot) => slot.sourceRefs.length || slot.fallback)
      .map((slot) => slot.path),
  );
  const hasName = mappedPaths.has("contact.name");
  const hasContact = [
    "contact.email",
    "contact.phone",
    "contact.location",
    "contact.linkedin",
    "contact.github",
  ].some((path) => mappedPaths.has(path as ResumeSlotPath));
  if (hasName && hasContact) return 1;
  if (hasName || hasContact) return 0.55;
  return mappedPaths.size ? 0.35 : 0;
}

function expectedRepeatGroupCollections(source: SourceDocumentIR): Set<string> {
  const expected = new Set<string>();
  for (const block of source.blocks) {
    const text = block.text.trim().toLowerCase();
    if (
      ["experience", "work experience", "professional experience"].includes(
        text,
      )
    ) {
      expected.add("experiences");
    }
    if (text === "projects" || text === "academic projects") {
      expected.add("projects");
    }
    if (text === "education") {
      expected.add("education");
    }
  }
  return expected;
}

function visualRenderCompleteness(template: DocumentTemplateV3): number {
  if (!template.regions.length) return 0;
  const nodeCount = template.regions.reduce(
    (count, region) => count + region.nodes.length,
    0,
  );
  const hasRenderableNode = template.regions.some((region) =>
    region.nodes.some((node) => {
      if (node.kind === "table") return node.rows.length > 0;
      if (node.kind === "text") return Boolean(node.text.trim());
      if (node.kind === "slot") return Boolean(node.slotId);
      if (node.kind === "list")
        return Boolean(node.items.length || node.slotId);
      if (node.kind === "section") return Boolean(node.title.trim());
      return false;
    }),
  );
  if (!hasRenderableNode) return 0.35;
  return Math.min(1, 0.5 + nodeCount / 8);
}
