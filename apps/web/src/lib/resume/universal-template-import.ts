import type { SourceDocumentIR } from "@/lib/resume/template-migration";

export type UniversalResumeSectionType =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "awards"
  | "publications"
  | "custom";

export interface UniversalTemplateImportSignal {
  id: string;
  label: string;
  score: number;
  detail: string;
  evidenceRefs: string[];
}

export interface UniversalTemplateSectionSignal {
  type: UniversalResumeSectionType;
  title: string;
  confidence: number;
  evidenceRefs: string[];
}

export interface UniversalTemplateStyleSignal {
  role: "name" | "sectionHeading" | "entryTitle" | "body" | "metadata";
  confidence: number;
  evidenceRefs: string[];
  sample: {
    fontFamily?: string;
    fontSizePt?: number;
    bold?: boolean;
    italic?: boolean;
    color?: string;
    alignment?: string;
  };
}

export interface UniversalTemplateImportAnalysis {
  version: 1;
  sourceType: SourceDocumentIR["sourceType"];
  filename: string;
  readiness: "ready" | "review" | "low";
  scores: {
    sourceEvidence: number;
    semanticCoverage: number;
    styleCoverage: number;
    layoutResilience: number;
  };
  sourceSignals: UniversalTemplateImportSignal[];
  sections: UniversalTemplateSectionSignal[];
  repeatableSections: UniversalResumeSectionType[];
  styleSignals: UniversalTemplateStyleSignal[];
  warnings: string[];
}

const SECTION_ALIASES: Array<{
  type: UniversalResumeSectionType;
  aliases: string[];
}> = [
  {
    type: "summary",
    aliases: ["summary", "professional summary", "profile", "objective"],
  },
  {
    type: "experience",
    aliases: [
      "experience",
      "work experience",
      "professional experience",
      "employment",
      "work history",
      "relevant experience",
    ],
  },
  {
    type: "education",
    aliases: ["education", "academic background"],
  },
  {
    type: "projects",
    aliases: ["projects", "selected projects", "academic projects"],
  },
  {
    type: "skills",
    aliases: ["skills", "technical skills", "core skills", "technologies"],
  },
  {
    type: "certifications",
    aliases: ["certifications", "licenses", "credentials"],
  },
  {
    type: "awards",
    aliases: ["awards", "honors", "achievements"],
  },
  {
    type: "publications",
    aliases: ["publications", "research", "papers"],
  },
];

const REPEATABLE_SECTIONS = new Set<UniversalResumeSectionType>([
  "experience",
  "education",
  "projects",
  "certifications",
  "awards",
  "publications",
]);

export function analyzeUniversalTemplateImport(
  source: SourceDocumentIR,
): UniversalTemplateImportAnalysis {
  const textBlocks = source.blocks.filter((block) => block.text.trim());
  const tableRows = source.blocks.filter((block) => block.type === "table-row");
  const geometryBlocks = textBlocks.filter((block) => block.bbox);
  const styledBlocks = textBlocks.filter((block) => block.style);
  const cellCount = source.blocks.reduce(
    (count, block) => count + (block.cellMetadata?.length ?? 0),
    0,
  );
  const sections = detectSectionSignals(source);
  const repeatableSections = Array.from(
    new Set(
      sections
        .map((section) => section.type)
        .filter((type) => REPEATABLE_SECTIONS.has(type)),
    ),
  );
  const styleSignals = detectStyleSignals(source, sections);
  const sourceSignals = buildSourceSignals({
    source,
    textBlocks: textBlocks.length,
    tableRows: tableRows.length,
    cellCount,
    geometryBlocks: geometryBlocks.length,
    styledBlocks: styledBlocks.length,
    sections: sections.length,
    styleSignals: styleSignals.length,
  });
  const sourceEvidence = average(sourceSignals.map((signal) => signal.score));
  const semanticCoverage = scoreSemanticCoverage(sections, repeatableSections);
  const styleCoverage = scoreStyleCoverage(styleSignals, styledBlocks.length);
  const layoutResilience = scoreLayoutResilience(
    repeatableSections,
    tableRows.length,
    cellCount,
  );
  const readiness = readinessFor([
    sourceEvidence,
    semanticCoverage,
    styleCoverage,
    layoutResilience,
  ]);
  const warnings = [
    ...source.diagnostics,
    ...(semanticCoverage < 0.55
      ? ["Low semantic coverage; review section and item grouping before save."]
      : []),
    ...(styleCoverage < 0.45
      ? ["Low style coverage; reusable render may fall back to generic tokens."]
      : []),
    ...(layoutResilience < 0.45
      ? ["Low layout resilience; stress render should be reviewed before save."]
      : []),
  ];

  return {
    version: 1,
    sourceType: source.sourceType,
    filename: source.filename,
    readiness,
    scores: {
      sourceEvidence: roundRatio(sourceEvidence),
      semanticCoverage: roundRatio(semanticCoverage),
      styleCoverage: roundRatio(styleCoverage),
      layoutResilience: roundRatio(layoutResilience),
    },
    sourceSignals,
    sections,
    repeatableSections,
    styleSignals,
    warnings,
  };
}

function buildSourceSignals({
  source,
  textBlocks,
  tableRows,
  cellCount,
  geometryBlocks,
  styledBlocks,
  sections,
  styleSignals,
}: {
  source: SourceDocumentIR;
  textBlocks: number;
  tableRows: number;
  cellCount: number;
  geometryBlocks: number;
  styledBlocks: number;
  sections: number;
  styleSignals: number;
}): UniversalTemplateImportSignal[] {
  return [
    {
      id: "text-evidence",
      label: "Text evidence",
      score: textBlocks ? 1 : 0,
      detail: `${textBlocks} source text blocks are available.`,
      evidenceRefs: source.blocks
        .filter((block) => block.text.trim())
        .slice(0, 8)
        .map((block) => block.id),
    },
    {
      id: "structure-evidence",
      label: "Structure evidence",
      score:
        tableRows || cellCount
          ? 1
          : source.sourceType === "tex" && sections
            ? 0.85
            : 0.45,
      detail:
        tableRows || cellCount
          ? `${tableRows} table rows and ${cellCount} cells are available.`
          : "No table/cell structure was detected; importer will rely on text rhythm.",
      evidenceRefs: source.blocks
        .filter((block) => block.type === "table-row")
        .slice(0, 8)
        .map((block) => block.id),
    },
    {
      id: "geometry-evidence",
      label: "Geometry evidence",
      score:
        source.sourceType === "pdf"
          ? textBlocks
            ? geometryBlocks / textBlocks
            : 0
          : 0.75,
      detail:
        source.sourceType === "pdf"
          ? `${geometryBlocks} of ${textBlocks} source blocks have page geometry.`
          : "This source type exposes structure without requiring PDF geometry.",
      evidenceRefs: source.blocks
        .filter((block) => block.bbox)
        .slice(0, 8)
        .map((block) => block.id),
    },
    {
      id: "style-evidence",
      label: "Style evidence",
      score: textBlocks
        ? Math.min(1, styledBlocks / Math.max(1, textBlocks))
        : 0,
      detail: `${styledBlocks} of ${textBlocks} source blocks include style hints.`,
      evidenceRefs: source.blocks
        .filter((block) => block.style)
        .slice(0, 8)
        .map((block) => block.id),
    },
    {
      id: "semantic-evidence",
      label: "Semantic evidence",
      score: sections ? Math.min(1, sections / 4) : 0,
      detail: `${sections} resume section headings were detected.`,
      evidenceRefs: [],
    },
    {
      id: "token-evidence",
      label: "Token evidence",
      score: styleSignals ? Math.min(1, styleSignals / 4) : 0,
      detail: `${styleSignals} reusable style token candidates were detected.`,
      evidenceRefs: [],
    },
  ].map((signal) => ({ ...signal, score: roundRatio(signal.score) }));
}

function detectSectionSignals(
  source: SourceDocumentIR,
): UniversalTemplateSectionSignal[] {
  const seen = new Set<string>();
  const sections: UniversalTemplateSectionSignal[] = [];
  for (const block of source.blocks) {
    const title = cleanSectionTitle(block.text);
    if (!title) continue;
    const match = sectionTypeForTitle(title);
    if (!match) continue;
    const key = `${match}:${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const styleBoost =
      block.type === "heading" ||
      block.style?.bold ||
      block.text === block.text.toUpperCase()
        ? 0.2
        : 0;
    sections.push({
      type: match,
      title,
      confidence: roundRatio(Math.min(1, 0.72 + styleBoost)),
      evidenceRefs: [block.id],
    });
  }
  return sections;
}

function detectStyleSignals(
  source: SourceDocumentIR,
  sections: UniversalTemplateSectionSignal[],
): UniversalTemplateStyleSignal[] {
  const blocks = source.blocks.filter((block) => block.text.trim());
  const signals: UniversalTemplateStyleSignal[] = [];
  const firstStyled = blocks.find((block) => block.style);
  const largest = blocks
    .filter((block) => block.style?.fontSizePt)
    .sort((a, b) => (b.style?.fontSizePt ?? 0) - (a.style?.fontSizePt ?? 0))[0];
  if (largest) {
    signals.push(styleSignal("name", largest, 0.7));
  } else if (firstStyled) {
    signals.push(styleSignal("body", firstStyled, 0.45));
  }

  const sectionRefs = new Set(
    sections.flatMap((section) => section.evidenceRefs),
  );
  const sectionBlock = blocks.find((block) => sectionRefs.has(block.id));
  if (sectionBlock?.style) {
    signals.push(styleSignal("sectionHeading", sectionBlock, 0.85));
  }

  const body = representativeStyledBlock(
    blocks.filter((block) => !sectionRefs.has(block.id)),
  );
  if (body) signals.push(styleSignal("body", body, 0.8));

  const metadata = blocks.find(
    (block) =>
      block.style?.alignment === "right" ||
      /\b(?:present|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(
        block.text,
      ),
  );
  if (metadata) signals.push(styleSignal("metadata", metadata, 0.62));

  return dedupeStyleSignals(signals);
}

function styleSignal(
  role: UniversalTemplateStyleSignal["role"],
  block: SourceDocumentIR["blocks"][number],
  confidence: number,
): UniversalTemplateStyleSignal {
  return {
    role,
    confidence,
    evidenceRefs: [block.id],
    sample: {
      fontFamily: block.style?.fontFamily,
      fontSizePt: block.style?.fontSizePt,
      bold: block.style?.bold,
      italic: block.style?.italic,
      color: block.style?.color,
      alignment: block.style?.alignment,
    },
  };
}

function dedupeStyleSignals(
  signals: UniversalTemplateStyleSignal[],
): UniversalTemplateStyleSignal[] {
  const byRole = new Map<
    UniversalTemplateStyleSignal["role"],
    UniversalTemplateStyleSignal
  >();
  for (const signal of signals) {
    const existing = byRole.get(signal.role);
    if (!existing || signal.confidence > existing.confidence) {
      byRole.set(signal.role, signal);
    }
  }
  return Array.from(byRole.values()).map((signal) => ({
    ...signal,
    confidence: roundRatio(signal.confidence),
  }));
}

function representativeStyledBlock(
  blocks: SourceDocumentIR["blocks"],
): SourceDocumentIR["blocks"][number] | undefined {
  const styled = blocks.filter((block) => block.style?.fontSizePt);
  if (!styled.length) return blocks.find((block) => block.style);
  return styled.sort(
    (a, b) => (a.style?.fontSizePt ?? 0) - (b.style?.fontSizePt ?? 0),
  )[Math.floor(styled.length / 2)];
}

function scoreSemanticCoverage(
  sections: UniversalTemplateSectionSignal[],
  repeatableSections: UniversalResumeSectionType[],
): number {
  const hasContactAdjacentSection = sections.length > 0 ? 0.2 : 0;
  const coreSections = new Set(sections.map((section) => section.type));
  const coreScore =
    Number(coreSections.has("experience")) * 0.3 +
    Number(coreSections.has("education")) * 0.2 +
    Number(coreSections.has("skills") || coreSections.has("projects")) * 0.2;
  const repeatScore = Math.min(0.3, repeatableSections.length * 0.1);
  return Math.min(1, hasContactAdjacentSection + coreScore + repeatScore);
}

function scoreStyleCoverage(
  styleSignals: UniversalTemplateStyleSignal[],
  styledBlockCount: number,
): number {
  if (!styledBlockCount) return 0;
  const roles = new Set(styleSignals.map((signal) => signal.role));
  return Math.min(
    1,
    Number(roles.has("body")) * 0.3 +
      Number(roles.has("sectionHeading")) * 0.3 +
      Number(roles.has("name")) * 0.2 +
      Number(roles.has("metadata")) * 0.2,
  );
}

function scoreLayoutResilience(
  repeatableSections: UniversalResumeSectionType[],
  tableRows: number,
  cellCount: number,
): number {
  const repeatScore = Math.min(0.55, repeatableSections.length * 0.18);
  const structureScore = tableRows || cellCount ? 0.3 : 0.12;
  return Math.min(1, repeatScore + structureScore + 0.15);
}

function readinessFor(
  scores: number[],
): UniversalTemplateImportAnalysis["readiness"] {
  const averageScore = average(scores);
  if (averageScore >= 0.75 && scores.every((score) => score >= 0.55)) {
    return "ready";
  }
  if (averageScore >= 0.45 && scores.some((score) => score >= 0.55)) {
    return "review";
  }
  return "low";
}

function sectionTypeForTitle(title: string): UniversalResumeSectionType | null {
  const normalized = title.toLowerCase();
  for (const section of SECTION_ALIASES) {
    if (section.aliases.includes(normalized)) return section.type;
  }
  return null;
}

function cleanSectionTitle(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[:|]+$/g, "")
    .trim();
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundRatio(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
}
