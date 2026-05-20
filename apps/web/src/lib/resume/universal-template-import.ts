import type { SourceDocumentIR } from "@/lib/resume/template-migration";
import type { TailoredResume } from "@/lib/resume/generator";

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

export interface ResumeSemanticIR {
  version: 1;
  sourceType: SourceDocumentIR["sourceType"];
  filename: string;
  contact: SemanticContact;
  sections: SemanticSection[];
  warnings: string[];
}

export interface SemanticContact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  confidence: number;
  evidenceRefs: string[];
}

export interface SemanticSection {
  id: string;
  type: UniversalResumeSectionType;
  title: string;
  items: SemanticResumeItem[];
  confidence: number;
  evidenceRefs: string[];
}

export interface SemanticResumeItem {
  primary: string;
  secondary?: string;
  location?: string;
  dateRange?: string;
  meta: string[];
  url?: string;
  bullets: string[];
  confidence: number;
  evidenceRefs: string[];
}

export interface ImportedTemplateStyleTokens {
  version: 1;
  sourceType: SourceDocumentIR["sourceType"];
  filename: string;
  page: ImportedPageStyleToken;
  typography: Partial<
    Record<
      "name" | "sectionHeading" | "entryTitle" | "body" | "metadata" | "bullet",
      ImportedTypographyToken
    >
  >;
  color: {
    accent?: ImportedScalarToken<string>;
    body?: ImportedScalarToken<string>;
    muted?: ImportedScalarToken<string>;
    rule?: ImportedScalarToken<string>;
    bullet?: ImportedScalarToken<string>;
    link?: ImportedScalarToken<string>;
  };
  spacing: {
    sectionGapPt?: ImportedScalarToken<number>;
    itemGapPt?: ImportedScalarToken<number>;
    bulletGapPt?: ImportedScalarToken<number>;
    lineHeight?: ImportedScalarToken<string>;
  };
  rules: {
    sectionDivider?: ImportedRuleToken;
    headerDivider?: ImportedRuleToken;
  };
  layout: {
    headerMode?: ImportedScalarToken<
      "single-line" | "split" | "stacked" | "sidebar"
    >;
    dateAlignment?: ImportedScalarToken<
      "right-column" | "inline" | "below" | "unknown"
    >;
    sectionTitlePlacement?: ImportedScalarToken<
      "above" | "left-rail" | "inline"
    >;
    columns?: ImportedScalarToken<number>;
  };
  warnings: string[];
}

export interface ImportedPageStyleToken {
  size: string;
  widthPt: number;
  heightPt: number;
  margins?: SourceDocumentIR["pages"][number]["margins"];
  background?: string;
  confidence: number;
  evidenceRefs: string[];
}

export interface ImportedTypographyToken {
  fontFamily?: string;
  fontSizePt?: number;
  lineHeight?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase";
  alignment?: string;
  confidence: number;
  evidenceRefs: string[];
  candidates?: ImportedTokenCandidate<Partial<ImportedTypographyToken>>[];
}

export interface ImportedScalarToken<T> {
  value: T;
  confidence: number;
  evidenceRefs: string[];
  candidates?: ImportedTokenCandidate<T>[];
}

export interface ImportedTokenCandidate<T> {
  label: string;
  value: T;
  confidence: number;
  evidenceRefs: string[];
}

export interface ImportedRuleToken {
  widthPt: number;
  color: string;
  style: "solid" | "dashed" | "dotted" | "double" | "none";
  confidence: number;
  evidenceRefs: string[];
  candidates?: ImportedTokenCandidate<number>[];
}

interface SemanticSourceLine {
  text: string;
  sourceType: SourceDocumentIR["blocks"][number]["type"];
  evidenceRefs: string[];
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

export function inferResumeSemanticIR(
  source: SourceDocumentIR,
): ResumeSemanticIR {
  const lines = sourceLinesForSemanticMapping(source);
  const sectionRuns = groupSemanticLinesBySection(lines);
  const contactLines = lines.slice(
    0,
    sectionRuns[0]?.startIndex ?? Math.min(lines.length, 6),
  );
  const sections = recoverImplicitSkillsSection(
    sectionRuns.map((run, index) => ({
      id: `section-${index + 1}`,
      type: run.type,
      title: run.title,
      items: parseSemanticSectionItems(run.type, run.lines),
      confidence: run.confidence,
      evidenceRefs: run.evidenceRefs,
    })),
  );

  return {
    version: 1,
    sourceType: source.sourceType,
    filename: source.filename,
    contact: inferSemanticContact(contactLines),
    sections,
    warnings: [
      ...source.diagnostics,
      ...(sections.length
        ? []
        : [
            "No resume sections were detected; semantic template review required.",
          ]),
    ],
  };
}

export function semanticIRToTailoredResume(
  semantic: ResumeSemanticIR,
): TailoredResume {
  const section = (type: UniversalResumeSectionType) =>
    semantic.sections.find((candidate) => candidate.type === type);
  const summary = section("summary");
  const skills = section("skills");
  const certifications = section("certifications");
  const awards = section("awards");

  return {
    contact: {
      name: semantic.contact.name,
      email: semantic.contact.email,
      phone: semantic.contact.phone,
      location: semantic.contact.location,
      linkedin: semantic.contact.linkedin,
      github: semantic.contact.github,
    },
    summary:
      summary?.items
        .flatMap((item) => [item.primary, ...item.bullets])
        .filter(Boolean)
        .join(" ") ?? "",
    experiences:
      section("experience")?.items.map((item) => ({
        title: item.primary,
        company: item.secondary ?? "",
        dates: item.dateRange ?? item.meta.join(" - "),
        highlights: item.bullets,
      })) ?? [],
    skills:
      skills?.items.flatMap((item) =>
        [item.primary, item.secondary, ...item.meta, ...item.bullets]
          .filter((value): value is string => Boolean(value))
          .flatMap(splitSkillText),
      ) ?? [],
    education:
      section("education")?.items.map((item) => ({
        institution: item.primary,
        degree: item.secondary ?? "",
        field: item.meta.slice(0, -1).join(" - "),
        date: item.dateRange ?? item.meta.at(-1) ?? "",
      })) ?? [],
    projects:
      section("projects")?.items.map((item) => ({
        name: item.primary,
        description: [item.secondary, ...item.meta].filter(Boolean).join(" - "),
        highlights: item.bullets,
      })) ?? [],
    certifications:
      certifications?.items.flatMap((item) =>
        [item.primary, ...item.bullets].filter(Boolean),
      ) ?? [],
    awards:
      awards?.items.flatMap((item) =>
        [item.primary, ...item.bullets].filter(Boolean),
      ) ?? [],
  };
}

export function inferImportedTemplateStyleTokens(
  source: SourceDocumentIR,
): ImportedTemplateStyleTokens {
  const sections = detectSectionSignals(source);
  const styleSignals = detectStyleSignals(source, sections);
  const typography = Object.fromEntries(
    styleSignals.map((signal) => [
      signal.role,
      typographyTokenFromSignal(signal, source),
    ]),
  ) as ImportedTemplateStyleTokens["typography"];
  if (typography.body) {
    typography.body = {
      ...typography.body,
      candidates: typographyCandidatesForRole(source, "body"),
    };
  }
  if (typography.sectionHeading) {
    typography.sectionHeading = {
      ...typography.sectionHeading,
      candidates: typographyCandidatesForRole(source, "sectionHeading"),
    };
  }
  const page = inferPageStyleToken(source);
  const colors = inferColorTokens(source, typography);
  const spacing = inferSpacingTokens(source);
  const rules = inferRuleTokens(source, colors);
  const layout = inferLayoutTokens(source);
  const warnings = [
    ...(typography.body ? [] : ["No reusable body typography token detected."]),
    ...(typography.sectionHeading
      ? []
      : ["No reusable section heading typography token detected."]),
    ...(colors.accent ? [] : ["No accent color token detected from source."]),
  ];

  return {
    version: 1,
    sourceType: source.sourceType,
    filename: source.filename,
    page,
    typography,
    color: colors,
    spacing,
    rules,
    layout,
    warnings,
  };
}

function inferPageStyleToken(source: SourceDocumentIR): ImportedPageStyleToken {
  const page = source.pages[0];
  const widthPt = page?.widthPt ?? 612;
  const heightPt = page?.heightPt ?? 792;
  return {
    size:
      Math.abs(widthPt - 595) < 8 && Math.abs(heightPt - 842) < 8
        ? "a4"
        : "letter",
    widthPt,
    heightPt,
    margins: page?.margins,
    confidence: page?.widthPt && page.heightPt ? 0.9 : 0.45,
    evidenceRefs: page ? [page.id] : [],
  };
}

function typographyTokenFromSignal(
  signal: UniversalTemplateStyleSignal,
  source: SourceDocumentIR,
): ImportedTypographyToken {
  const block = source.blocks.find((item) =>
    signal.evidenceRefs.includes(item.id),
  );
  const text = block?.text.trim() ?? "";
  return {
    fontFamily: signal.sample.fontFamily,
    fontSizePt: signal.sample.fontSizePt,
    lineHeight: block?.style?.lineHeight,
    color: signal.sample.color,
    fontWeight: signal.sample.bold ? "700" : undefined,
    fontStyle: signal.sample.italic ? "italic" : "normal",
    textTransform:
      text && text === text.toUpperCase() && /[A-Z]/.test(text)
        ? "uppercase"
        : "none",
    alignment: signal.sample.alignment,
    confidence: signal.confidence,
    evidenceRefs: signal.evidenceRefs,
  };
}

function inferColorTokens(
  source: SourceDocumentIR,
  typography: ImportedTemplateStyleTokens["typography"],
): ImportedTemplateStyleTokens["color"] {
  const styleColors = source.blocks
    .map((block) => ({ id: block.id, color: block.style?.color }))
    .filter((item): item is { id: string; color: string } =>
      Boolean(item.color),
    );
  const colorCandidates = colorTokenCandidates(styleColors);
  const bodyColor = typography.body?.color;
  const accentColor =
    typography.sectionHeading?.color ??
    mostCommon(
      styleColors
        .map((item) => item.color)
        .filter((color) => color !== bodyColor),
    );
  const fallbackBody =
    bodyColor ?? mostCommon(styleColors.map((item) => item.color));

  return {
    accent: accentColor
      ? {
          ...scalarToken(
            accentColor,
            typography.sectionHeading?.confidence ?? 0.58,
            evidenceRefsForColor(styleColors, accentColor),
          ),
          candidates: colorCandidates,
        }
      : undefined,
    body: fallbackBody
      ? {
          ...scalarToken(fallbackBody, typography.body?.confidence ?? 0.56, [
            ...(typography.body?.evidenceRefs ?? []),
          ]),
          candidates: colorCandidates,
        }
      : undefined,
    muted: typography.metadata?.color
      ? scalarToken(
          typography.metadata.color,
          typography.metadata.confidence,
          typography.metadata.evidenceRefs,
        )
      : undefined,
    rule: accentColor
      ? scalarToken(
          accentColor,
          0.5,
          evidenceRefsForColor(styleColors, accentColor),
        )
      : undefined,
    bullet: accentColor
      ? scalarToken(
          accentColor,
          0.5,
          evidenceRefsForColor(styleColors, accentColor),
        )
      : undefined,
    link: undefined,
  };
}

function inferSpacingTokens(
  source: SourceDocumentIR,
): ImportedTemplateStyleTokens["spacing"] {
  const boxes = source.blocks
    .map((block) => ({ id: block.id, box: block.bbox, type: block.type }))
    .filter(
      (
        item,
      ): item is {
        id: string;
        box: NonNullable<SourceDocumentIR["blocks"][number]["bbox"]>;
        type: SourceDocumentIR["blocks"][number]["type"];
      } => Boolean(item.box),
    )
    .sort((a, b) => a.box.yPt - b.box.yPt);
  const gaps = boxes
    .slice(1)
    .map(
      (item, index) =>
        item.box.yPt - (boxes[index].box.yPt + boxes[index].box.heightPt),
    )
    .filter((gap) => gap >= 0 && gap < 80);
  const textLineHeights = source.blocks
    .map((block) => block.style?.lineHeight)
    .filter((lineHeight): lineHeight is string => Boolean(lineHeight));
  const medianGap = median(gaps);
  const largerGaps = gaps.filter((gap) => medianGap && gap > medianGap * 1.6);
  const gapCandidates = numericTokenCandidates(
    gaps.map((gap, index) => ({
      value: roundPt(gap),
      evidenceRef: boxes[index + 1]?.id,
    })),
  );

  return {
    sectionGapPt:
      largerGaps.length && median(largerGaps)
        ? {
            ...scalarToken(
              roundPt(median(largerGaps)!),
              0.58,
              boxes.map((box) => box.id).slice(0, 6),
            ),
            candidates: gapCandidates,
          }
        : undefined,
    itemGapPt: medianGap
      ? {
          ...scalarToken(
            roundPt(medianGap),
            0.55,
            boxes.map((box) => box.id).slice(0, 6),
          ),
          candidates: gapCandidates,
        }
      : undefined,
    bulletGapPt: medianGap
      ? {
          ...scalarToken(
            roundPt(Math.max(1, medianGap * 0.5)),
            0.45,
            boxes.map((box) => box.id).slice(0, 6),
          ),
          candidates: gapCandidates,
        }
      : undefined,
    lineHeight: textLineHeights.length
      ? scalarToken(mostCommon(textLineHeights)!, 0.72, [])
      : undefined,
  };
}

function inferRuleTokens(
  source: SourceDocumentIR,
  colors: ImportedTemplateStyleTokens["color"],
): ImportedTemplateStyleTokens["rules"] {
  const borderedBlocks = source.blocks.filter(
    (block) =>
      block.rowMetadata?.borders ||
      block.tableMetadata?.borders ||
      block.cellMetadata?.some((cell) => cell.borders),
  );
  const border = firstBorder(source);
  if (!border) return {};
  return {
    sectionDivider: {
      widthPt: border.widthPt,
      color: border.color || colors.rule?.value || "#000000",
      style: border.style,
      confidence: 0.68,
      evidenceRefs: borderedBlocks.slice(0, 4).map((block) => block.id),
      candidates: ruleWidthCandidates(source),
    },
  };
}

function inferLayoutTokens(
  source: SourceDocumentIR,
): ImportedTemplateStyleTokens["layout"] {
  const page = source.pages[0];
  const boxes = source.blocks
    .map((block) => block.bbox)
    .filter(
      (box): box is NonNullable<SourceDocumentIR["blocks"][number]["bbox"]> =>
        Boolean(box),
    );
  const headerBlocks = source.blocks.slice(0, 5);
  const rightAlignedDates = source.blocks.filter(
    (block) =>
      isDateLike(block.text) &&
      (block.style?.alignment === "right" ||
        block.cellMetadata?.some(
          (cell) => cell.alignment === "right" && isDateLike(cell.text),
        ) ||
        (page?.widthPt &&
          block.bbox &&
          block.bbox.xPt + block.bbox.widthPt > page.widthPt * 0.66)),
  );
  const columns = inferColumnCount(page?.widthPt, boxes);

  return {
    headerMode: scalarToken(
      headerBlocks.some((block) => block.text.includes("|"))
        ? "single-line"
        : "stacked",
      0.55,
      headerBlocks.map((block) => block.id),
    ),
    dateAlignment: scalarToken(
      rightAlignedDates.length ? "right-column" : "unknown",
      rightAlignedDates.length ? 0.72 : 0.35,
      rightAlignedDates.slice(0, 6).map((block) => block.id),
    ),
    sectionTitlePlacement: scalarToken("above", 0.55, []),
    columns: scalarToken(columns, columns > 1 ? 0.7 : 0.55, []),
  };
}

function scalarToken<T>(
  value: T,
  confidence: number,
  evidenceRefs: string[],
): ImportedScalarToken<T> {
  return {
    value,
    confidence: roundRatio(confidence),
    evidenceRefs,
  };
}

function evidenceRefsForColor(
  colors: Array<{ id: string; color: string }>,
  color: string,
): string[] {
  return colors
    .filter((item) => item.color === color)
    .slice(0, 8)
    .map((item) => item.id);
}

function colorTokenCandidates(
  colors: Array<{ id: string; color: string }>,
): ImportedTokenCandidate<string>[] {
  const byColor = new Map<string, string[]>();
  for (const item of colors) {
    const refs = byColor.get(item.color) ?? [];
    refs.push(item.id);
    byColor.set(item.color, refs);
  }
  return Array.from(byColor.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([color, refs]) => ({
      label: `${color} (${refs.length} refs)`,
      value: color,
      confidence: roundRatio(Math.min(0.95, 0.45 + refs.length / 10)),
      evidenceRefs: refs.slice(0, 8),
    }));
}

function typographyCandidatesForRole(
  source: SourceDocumentIR,
  role: "body" | "sectionHeading",
): ImportedTokenCandidate<Partial<ImportedTypographyToken>>[] {
  const byFamily = new Map<string, SourceDocumentIR["blocks"]>();
  for (const block of source.blocks) {
    const family = block.style?.fontFamily;
    if (!family) continue;
    const blocks = byFamily.get(family) ?? [];
    blocks.push(block);
    byFamily.set(family, blocks);
  }
  return Array.from(byFamily.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([fontFamily, blocks]) => {
      const sizes = blocks
        .map((block) => block.style?.fontSizePt)
        .filter((size): size is number => typeof size === "number");
      const fontSizePt = sizes.length
        ? role === "sectionHeading"
          ? Math.max(...sizes)
          : median(sizes)
        : null;
      return {
        label: `${fontFamily} (${blocks.length} refs)`,
        value: {
          fontFamily,
          ...(fontSizePt ? { fontSizePt } : {}),
        },
        confidence: roundRatio(Math.min(0.95, 0.45 + blocks.length / 10)),
        evidenceRefs: blocks.slice(0, 8).map((block) => block.id),
      };
    });
}

function numericTokenCandidates(
  values: Array<{ value: number; evidenceRef?: string }>,
): ImportedTokenCandidate<number>[] {
  const byValue = new Map<number, string[]>();
  for (const item of values) {
    if (!Number.isFinite(item.value)) continue;
    const refs = byValue.get(item.value) ?? [];
    if (item.evidenceRef) refs.push(item.evidenceRef);
    byValue.set(item.value, refs);
  }
  return Array.from(byValue.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0] - b[0])
    .slice(0, 6)
    .map(([value, refs]) => ({
      label: `${value}pt (${refs.length} refs)`,
      value,
      confidence: roundRatio(Math.min(0.95, 0.45 + refs.length / 10)),
      evidenceRefs: refs.slice(0, 8),
    }));
}

function ruleWidthCandidates(
  source: SourceDocumentIR,
): ImportedTokenCandidate<number>[] {
  const widths: Array<{ value: number; evidenceRef?: string }> = [];
  for (const block of source.blocks) {
    const borders = [
      block.rowMetadata?.borders?.bottom,
      block.rowMetadata?.borders?.top,
      block.tableMetadata?.borders?.bottom,
      block.tableMetadata?.borders?.top,
      ...(block.cellMetadata ?? []).flatMap((cell) => [
        cell.borders?.bottom,
        cell.borders?.top,
      ]),
    ].filter(Boolean);
    for (const border of borders) {
      if (!border || border.style === "none" || border.widthPt <= 0) continue;
      widths.push({ value: border.widthPt, evidenceRef: block.id });
    }
  }
  return numericTokenCandidates(widths);
}

function firstBorder(source: SourceDocumentIR): ImportedRuleToken | null {
  for (const block of source.blocks) {
    const candidates = [
      block.rowMetadata?.borders?.bottom,
      block.rowMetadata?.borders?.top,
      block.tableMetadata?.borders?.bottom,
      block.tableMetadata?.borders?.top,
      ...(block.cellMetadata ?? []).flatMap((cell) => [
        cell.borders?.bottom,
        cell.borders?.top,
      ]),
    ].filter(Boolean);
    const border = candidates.find(
      (item) => item && item.style !== "none" && item.widthPt > 0,
    );
    if (border) {
      return {
        widthPt: border.widthPt,
        color: border.color,
        style: border.style,
        confidence: 0.68,
        evidenceRefs: [block.id],
      };
    }
  }
  return null;
}

function inferColumnCount(
  pageWidthPt: number | undefined,
  boxes: Array<NonNullable<SourceDocumentIR["blocks"][number]["bbox"]>>,
): number {
  if (!pageWidthPt || boxes.length < 8) return 1;
  const centers = boxes
    .filter((box) => box.widthPt > 12 && box.heightPt > 4)
    .map((box) => box.xPt + box.widthPt / 2)
    .sort((a, b) => a - b);
  if (centers.length < 8) return 1;
  let largestGap = 0;
  for (let index = 1; index < centers.length; index += 1) {
    largestGap = Math.max(largestGap, centers[index] - centers[index - 1]);
  }
  return largestGap > pageWidthPt * 0.12 ? 2 : 1;
}

function sourceLinesForSemanticMapping(
  source: SourceDocumentIR,
): SemanticSourceLine[] {
  return source.blocks.flatMap((block) => {
    if (block.type !== "table-row" || !block.cellMetadata?.length) {
      const text = block.text.trim();
      return text
        ? [
            {
              text: block.type === "list-item" ? `- ${text}` : text,
              sourceType: block.type,
              evidenceRefs: [block.id],
            },
          ]
        : [];
    }

    const cellLines = block.cellMetadata.map((cell, cellIndex) =>
      (cell.blocks ?? [])
        .filter((cellBlock) => cellBlock.text.trim())
        .map((cellBlock) => ({
          text:
            cellBlock.type === "list-item"
              ? `- ${cellBlock.text.trim()}`
              : cellBlock.text.trim(),
          sourceType: cellBlock.type,
          evidenceRefs: [`${block.id}:cell-${cellIndex + 1}:${cellBlock.id}`],
        })),
    );
    const populatedCells = cellLines.filter((lines) => lines.length);
    if (
      populatedCells.length > 1 &&
      populatedCells.every((lines) => lines.length === 1)
    ) {
      return [
        {
          text: populatedCells.map((lines) => lines[0].text).join(" | "),
          sourceType: "table-row" as const,
          evidenceRefs: [block.id],
        },
      ];
    }

    const expanded = cellLines.flat();
    if (expanded.length) return expanded;
    const fallback = block.cells?.length ? block.cells.join(" | ") : block.text;
    return fallback.trim()
      ? [
          {
            text: fallback.trim(),
            sourceType: "table-row" as const,
            evidenceRefs: [block.id],
          },
        ]
      : [];
  });
}

function groupSemanticLinesBySection(lines: SemanticSourceLine[]) {
  const runs: Array<{
    type: UniversalResumeSectionType;
    title: string;
    confidence: number;
    evidenceRefs: string[];
    startIndex: number;
    lines: SemanticSourceLine[];
  }> = [];
  let current: (typeof runs)[number] | null = null;

  lines.forEach((line, index) => {
    const title = cleanSectionTitle(line.text);
    const type = sectionTypeForTitle(title);
    if (type) {
      current = {
        type,
        title,
        confidence: line.sourceType === "heading" ? 0.92 : 0.78,
        evidenceRefs: line.evidenceRefs,
        startIndex: index,
        lines: [],
      };
      runs.push(current);
      return;
    }
    current?.lines.push(line);
  });

  return runs;
}

function inferSemanticContact(lines: SemanticSourceLine[]): SemanticContact {
  const text = lines.map((line) => line.text).join(" ");
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone =
    text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] ??
    "";
  const linkedin =
    text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0] ?? "";
  const github =
    text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+/i)?.[0] ?? "";
  const name =
    lines
      .map((line) => line.text.split("|")[0]?.trim() ?? "")
      .find(
        (line) =>
          line &&
          !line.includes("@") &&
          !/\d{3}/.test(line) &&
          !/linkedin|github|portfolio|http/i.test(line),
      ) ?? "";

  return {
    name,
    email,
    phone,
    location: "",
    linkedin,
    github,
    confidence: roundRatio(
      Number(Boolean(name)) * 0.45 +
        Number(Boolean(email || phone || linkedin || github)) * 0.45 +
        0.1,
    ),
    evidenceRefs: lines.flatMap((line) => line.evidenceRefs),
  };
}

function parseSemanticSectionItems(
  type: UniversalResumeSectionType,
  lines: SemanticSourceLine[],
): SemanticResumeItem[] {
  if (type === "skills") return parseSkillItems(lines);
  if (type === "summary") return parseSummaryItems(lines);
  if (type === "education") return parseStructuredItems(lines, "education");
  if (type === "experience") return parseStructuredItems(lines, "experience");
  if (type === "projects") return parseStructuredItems(lines, "projects");
  return parsePlainSemanticItems(lines);
}

function recoverImplicitSkillsSection(
  sections: SemanticSection[],
): SemanticSection[] {
  if (sections.some((section) => section.type === "skills")) return sections;
  const recoveredItems: SemanticResumeItem[] = [];
  const nextSections = sections.map((section) => ({
    ...section,
    items: section.items
      .map((item) => {
        const retainedBullets: string[] = [];
        for (const bullet of item.bullets) {
          const skills = implicitSkillsFromText(bullet);
          if (skills.length) {
            recoveredItems.push(...skillsToSemanticItems(skills, item));
          } else {
            retainedBullets.push(bullet);
          }
        }
        const primarySkills =
          section.type !== "summary"
            ? implicitSkillsFromText(item.primary)
            : [];
        if (primarySkills.length && !item.secondary && !item.dateRange) {
          recoveredItems.push(...skillsToSemanticItems(primarySkills, item));
          return { ...item, primary: "", bullets: retainedBullets };
        }
        return { ...item, bullets: retainedBullets };
      })
      .filter((item) => item.primary || item.bullets.length),
  }));
  const uniqueRecovered = dedupeSemanticSkillItems(recoveredItems);
  if (!uniqueRecovered.length) return sections;
  return [
    ...nextSections,
    {
      id: "section-implicit-skills",
      type: "skills",
      title: "Skills",
      items: uniqueRecovered,
      confidence: 0.64,
      evidenceRefs: uniqueRecovered.flatMap((item) => item.evidenceRefs),
    },
  ];
}

function implicitSkillsFromText(text: string): string[] {
  const skills = splitSkillText(text);
  if (skills.length < 3 || skills.length > 12) return [];
  if (
    /\b(?:built|led|managed|created|developed|designed|reduced|improved|owned)\b/i.test(
      text,
    )
  ) {
    return [];
  }
  const skillLikeCount = skills.filter(isSkillLikePhrase).length;
  return skillLikeCount >= Math.max(2, Math.ceil(skills.length * 0.5))
    ? skills
    : [];
}

function isSkillLikePhrase(value: string): boolean {
  const text = value.trim();
  if (!text || text.length > 36) return false;
  if (/\d{4}/.test(text)) return false;
  if (
    /\b(?:react|typescript|javascript|python|node|next\.?js|sql|postgres|graphql|tailwind|css|html|figma|design systems?|performance|accessibility|a11y|ros|docker|kubernetes|aws|gcp|azure|latex|pdf)\b/i.test(
      text,
    )
  ) {
    return true;
  }
  if (/^[A-Z0-9+#.]{2,}(?:\s+[A-Z0-9+#.]{2,})?$/.test(text)) return true;
  return /^[A-Z][A-Za-z0-9+#.]+(?:\s+[A-Z][A-Za-z0-9+#.]+){0,3}$/.test(text);
}

function skillsToSemanticItems(
  skills: string[],
  evidence: Pick<SemanticResumeItem, "evidenceRefs">,
): SemanticResumeItem[] {
  return skills.map((skill) => ({
    primary: skill,
    meta: [],
    bullets: [],
    confidence: 0.66,
    evidenceRefs: evidence.evidenceRefs,
  }));
}

function dedupeSemanticSkillItems(
  items: SemanticResumeItem[],
): SemanticResumeItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.primary.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseStructuredItems(
  lines: SemanticSourceLine[],
  sectionType: "education" | "experience" | "projects",
): SemanticResumeItem[] {
  const items: SemanticResumeItem[] = [];
  let current: SemanticResumeItem | null = null;
  for (const line of lines) {
    if (isColumnHeaderLine(line.text)) continue;
    if (current && !current.dateRange && isDateOnlyLine(line.text)) {
      current.dateRange = line.text.trim();
      current.evidenceRefs.push(...line.evidenceRefs);
      continue;
    }
    const isBullet = isBulletLine(line.text);
    const header = !isBullet ? parseHeaderLine(line.text, sectionType) : null;
    if (header) {
      if (current) items.push(current);
      current = {
        ...header,
        bullets: [],
        confidence: header.confidence,
        evidenceRefs: line.evidenceRefs,
      };
      continue;
    }
    if (!current) {
      current = {
        primary: stripBulletMarker(line.text),
        meta: [],
        bullets: [],
        confidence: 0.42,
        evidenceRefs: line.evidenceRefs,
      };
      continue;
    }
    const content = stripBulletMarker(line.text);
    if (current.bullets.length && !hasBulletMarker(line.text)) {
      current.bullets[current.bullets.length - 1] =
        `${current.bullets[current.bullets.length - 1]} ${content}`.trim();
    } else {
      current.bullets.push(content);
    }
    current.evidenceRefs.push(...line.evidenceRefs);
  }
  if (current) items.push(current);
  return items.filter((item) => item.primary || item.bullets.length);
}

function parseHeaderLine(
  text: string,
  sectionType: "education" | "experience" | "projects",
): Omit<SemanticResumeItem, "bullets" | "evidenceRefs"> | null {
  const parts = splitHeaderParts(text);
  const hasDate = parts.some(isDateLike);
  const hasStructure = parts.length > 1;
  if (!hasStructure && !hasDate && text.length > 100) return null;
  if (!hasStructure && sectionType !== "projects") return null;

  const dateIndex = parts.findIndex(isDateLike);
  const dateRange = dateIndex >= 0 ? parts[dateIndex] : undefined;
  const remaining = parts.filter((_part, index) => index !== dateIndex);
  const [primary = text.trim(), secondary, ...meta] = remaining;

  return {
    primary,
    secondary,
    dateRange,
    meta,
    confidence: roundRatio(
      0.55 + Number(hasStructure) * 0.2 + Number(hasDate) * 0.2,
    ),
  };
}

function parseSkillItems(lines: SemanticSourceLine[]): SemanticResumeItem[] {
  return lines
    .flatMap((line) =>
      splitSkillText(line.text).map((skill) => ({
        primary: skill,
        meta: [],
        bullets: [],
        confidence: 0.72,
        evidenceRefs: line.evidenceRefs,
      })),
    )
    .filter((item) => item.primary);
}

function parseSummaryItems(lines: SemanticSourceLine[]): SemanticResumeItem[] {
  const text = lines
    .map((line) => stripBulletMarker(line.text))
    .join(" ")
    .trim();
  return text
    ? [
        {
          primary: text,
          meta: [],
          bullets: [],
          confidence: 0.74,
          evidenceRefs: lines.flatMap((line) => line.evidenceRefs),
        },
      ]
    : [];
}

function parsePlainSemanticItems(
  lines: SemanticSourceLine[],
): SemanticResumeItem[] {
  return lines
    .map((line) => ({
      primary: stripBulletMarker(line.text),
      meta: [],
      bullets: [],
      confidence: isBulletLine(line.text) ? 0.65 : 0.58,
      evidenceRefs: line.evidenceRefs,
    }))
    .filter((item) => item.primary);
}

function splitHeaderParts(text: string): string[] {
  if (text.includes("|")) {
    return text
      .split(/\s+\|\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  const protectedDateRanges = text.replace(
    /\b(\d{4})\s+([—-])\s+((?:present)|(?:\d{4}))/gi,
    (_match, start: string, marker: string, end: string) =>
      `${start}__DATE_DASH_${marker === "—" ? "EM" : "HY"}__${end}`,
  );
  return protectedDateRanges
    .split(/\s*—\s*|\s+-\s+/)
    .map((part) =>
      part
        .replace(/__DATE_DASH_EM__/g, " — ")
        .replace(/__DATE_DASH_HY__/g, " - "),
    )
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitSkillText(text: string): string[] {
  return text
    .split(/[,;|]/)
    .map(stripBulletMarker)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isBulletLine(text: string): boolean {
  return hasBulletMarker(text) || text.length > 110;
}

function stripBulletMarker(text: string): string {
  return text.replace(/^(?:-|\u2022|•|●|◦|▪|→|✓)\s*/, "").trim();
}

function hasBulletMarker(text: string): boolean {
  return /^(?:-|\u2022|•|●|◦|▪|→|✓)\s*/.test(text);
}

function isDateLike(text: string): boolean {
  return /\b(?:present|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i.test(
    text,
  );
}

function isDateOnlyLine(text: string): boolean {
  return text.length <= 50 && isDateLike(text) && !/[|]/.test(text);
}

function isColumnHeaderLine(text: string): boolean {
  const parts = splitHeaderParts(text).map((part) => part.toLowerCase());
  if (parts.length < 2) return false;
  const headerWords = new Set([
    "role",
    "title",
    "position",
    "organization",
    "company",
    "employer",
    "date",
    "dates",
    "period",
    "location",
    "project",
    "technologies",
    "technology",
    "tech stack",
    "school",
    "degree",
    "institution",
  ]);
  return parts.every((part) => headerWords.has(part));
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

  if (source.sourceType === "tex") {
    signals.push(...latexFallbackStyleSignals(blocks, sections));
  }

  return dedupeStyleSignals(signals);
}

function latexFallbackStyleSignals(
  blocks: SourceDocumentIR["blocks"],
  sections: UniversalTemplateSectionSignal[],
): UniversalTemplateStyleSignal[] {
  if (!blocks.length || !sections.length) return [];
  const sectionRefs = new Set(
    sections.flatMap((section) => section.evidenceRefs),
  );
  const nameBlock = blocks[0];
  const sectionBlock =
    blocks.find((block) => sectionRefs.has(block.id)) ?? blocks[0];
  const bodyBlock =
    blocks.find(
      (block) => !sectionRefs.has(block.id) && block.id !== nameBlock.id,
    ) ?? blocks[0];
  const metadataBlock = blocks.find((block) => isDateLike(block.text));
  return [
    fallbackStyleSignal("name", nameBlock, 0.58, {
      fontSizePt: 16,
      bold: true,
      color: "#111111",
    }),
    fallbackStyleSignal("sectionHeading", sectionBlock, 0.62, {
      fontSizePt: 10.5,
      bold: true,
      color: "#111111",
    }),
    fallbackStyleSignal("body", bodyBlock, 0.58, {
      fontSizePt: 10,
      color: "#111111",
    }),
    ...(metadataBlock
      ? [
          fallbackStyleSignal("metadata", metadataBlock, 0.52, {
            fontSizePt: 9,
            color: "#111111",
          }),
        ]
      : []),
  ];
}

function fallbackStyleSignal(
  role: UniversalTemplateStyleSignal["role"],
  block: SourceDocumentIR["blocks"][number],
  confidence: number,
  sample: UniversalTemplateStyleSignal["sample"],
): UniversalTemplateStyleSignal {
  return {
    role,
    confidence,
    evidenceRefs: [block.id],
    sample: {
      fontFamily: "Latin Modern Roman, Computer Modern, Times New Roman, serif",
      ...sample,
    },
  };
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
  const roles = new Set(styleSignals.map((signal) => signal.role));
  if (!styledBlockCount && !roles.size) return 0;
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

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

function mostCommon<T>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function roundPt(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundRatio(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
}
