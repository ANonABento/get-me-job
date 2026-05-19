import type { DocumentParseRun } from "@/lib/db/document-parse-runs";
import type { InsertBankEntry } from "@/lib/db/profile-bank";
import type { BankEntry, SourceBbox } from "@/types";
import type {
  DocumentSourceMap,
  ParsedResumeV2Result,
  SourceGroundedText,
  SourceQuality,
} from "./types";
import { isParsedResumeV2Result } from "./diagnostics";
import { resolveSourceSpanIds } from "./source-spans";

export interface BuildParseRunBankEntriesInput {
  parseRun: DocumentParseRun;
  sourceMap: DocumentSourceMap;
  acceptedComponentIds?: string[];
  edits?: Record<string, unknown>;
}

function sourceBboxTuple(span: {
  page: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}): SourceBbox {
  return [span.page, span.bbox.x0, span.bbox.y0, span.bbox.x1, span.bbox.y1];
}

function sourceMetadata(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
  sourceQuality: SourceQuality,
): Pick<
  InsertBankEntry,
  "sourcePage" | "sourceBbox" | "sourceSpanIds" | "sourceQuality"
> {
  const resolved = resolveSourceSpanIds(sourceMap, sourceSpanIds);
  const sourceBbox = resolved.spans.map(sourceBboxTuple);
  return {
    sourcePage: sourceBbox[0]?.[0],
    sourceBbox: sourceBbox.length > 0 ? sourceBbox : undefined,
    sourceSpanIds,
    sourceQuality,
  };
}

function sourceRefContent(input: {
  documentId: string;
  artifactId: string;
  parseRunId: string;
  sourceSpanIds: string[];
  sourceQuality: SourceQuality;
}): Record<string, unknown> {
  return {
    sourceRef: {
      documentId: input.documentId,
      artifactId: input.artifactId,
      parseRunId: input.parseRunId,
      sourceSpanIds: input.sourceSpanIds,
      sourceQuality: input.sourceQuality,
    },
  };
}

function editedContent(
  componentId: string,
  content: Record<string, unknown>,
  edits: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const edit = edits?.[componentId];
  if (edit && typeof edit === "object" && !Array.isArray(edit)) {
    return { ...content, ...(edit as Record<string, unknown>) };
  }
  if (typeof edit === "string") {
    return { ...content, description: edit, text: edit };
  }
  return content;
}

function shouldInclude(
  accepted: Set<string> | null,
  componentId: string,
  parentId?: string,
): boolean {
  if (!accepted) return true;
  return (
    accepted.has(componentId) || (parentId ? accepted.has(parentId) : false)
  );
}

function entryWithSource(
  input: {
    category: InsertBankEntry["category"];
    id?: string;
    content: Record<string, unknown>;
    sourceSection: string;
    sourceOrder: number;
    sourceSpanIds: string[];
    sourceQuality: SourceQuality;
    confidenceScore: number;
    parentId?: string;
    componentType?: string;
    componentOrder?: number;
  },
  context: {
    parseRun: DocumentParseRun;
    sourceMap: DocumentSourceMap;
    edits?: Record<string, unknown>;
  },
): InsertBankEntry {
  const metadata = sourceMetadata(
    context.sourceMap,
    input.sourceSpanIds,
    input.sourceQuality,
  );
  const content = editedContent(input.id ?? "", input.content, context.edits);
  return {
    id: input.id,
    category: input.category,
    content: {
      ...content,
      ...sourceRefContent({
        documentId: context.parseRun.documentId,
        artifactId: context.parseRun.artifactId,
        parseRunId: context.parseRun.id,
        sourceSpanIds: input.sourceSpanIds,
        sourceQuality: input.sourceQuality,
      }),
    },
    sourceDocumentId: context.parseRun.documentId,
    sourceArtifactId: context.parseRun.artifactId,
    sourceParseRunId: context.parseRun.id,
    sourceSection: input.sourceSection,
    sourceOrder: input.sourceOrder,
    parentId: input.parentId,
    componentType: input.componentType,
    componentOrder: input.componentOrder,
    matchMethod: "parser-v2",
    confidenceScore: input.confidenceScore,
    ...metadata,
  };
}

function groundedTextId(parentId: string, type: string, index: number): string {
  return `${parentId}:${type}:${index}`;
}

function textEntryContent(text: SourceGroundedText): Record<string, unknown> {
  return {
    description: text.text,
    text: text.text,
  };
}

export function buildParseRunBankEntries({
  parseRun,
  sourceMap,
  acceptedComponentIds,
  edits,
}: BuildParseRunBankEntriesInput): InsertBankEntry[] {
  if (!isParsedResumeV2Result(parseRun.structured)) return [];

  const accepted =
    acceptedComponentIds === undefined ? null : new Set(acceptedComponentIds);
  const entries: InsertBankEntry[] = [];
  let sourceOrder = 0;
  const nextSourceOrder = () => sourceOrder++;
  const context = { parseRun, sourceMap, edits };
  const profile = parseRun.structured.profile;

  if (profile.summary && shouldInclude(accepted, "summary")) {
    entries.push(
      entryWithSource(
        {
          id: "summary",
          category: "paragraph",
          content: textEntryContent(profile.summary),
          sourceSection: "summary",
          sourceOrder: nextSourceOrder(),
          sourceSpanIds: profile.summary.sourceSpanIds,
          sourceQuality: profile.summary.sourceQuality,
          confidenceScore: parseRun.confidence,
        },
        context,
      ),
    );
  }

  for (const exp of profile.experiences) {
    const includeRoot = shouldInclude(accepted, exp.id);
    if (includeRoot) {
      entries.push(
        entryWithSource(
          {
            id: exp.id,
            category: "experience",
            content: {
              company: exp.company,
              title: exp.title,
              location: exp.location,
              startDate: exp.startDate,
              endDate: exp.endDate,
              current: exp.current,
              description: exp.description,
              highlights: [],
              childCount: exp.highlights.length,
              skills: exp.skills,
            },
            sourceSection: "experience",
            sourceOrder: nextSourceOrder(),
            sourceSpanIds: exp.sourceSpanIds,
            sourceQuality: exp.sourceQuality,
            confidenceScore: 0.9,
          },
          context,
        ),
      );
    }

    exp.highlights.forEach((highlight, index) => {
      const id = groundedTextId(exp.id, "highlight", index);
      if (!shouldInclude(accepted, id, exp.id)) return;
      entries.push(
        entryWithSource(
          {
            id,
            category: "bullet",
            content: {
              ...textEntryContent(highlight),
              context: `${exp.title} at ${exp.company}`,
              company: exp.company,
              role: exp.title,
              parentType: "experience",
              parentId: exp.id,
              parentLabel: `${exp.title} at ${exp.company}`,
              order: index,
            },
            sourceSection: "experience",
            sourceOrder: nextSourceOrder(),
            sourceSpanIds: highlight.sourceSpanIds,
            sourceQuality: highlight.sourceQuality,
            confidenceScore: 0.85,
            parentId: exp.id,
            componentType: "experience",
            componentOrder: index,
          },
          context,
        ),
      );
    });
  }

  for (const edu of profile.education) {
    if (!shouldInclude(accepted, edu.id)) continue;
    entries.push(
      entryWithSource(
        {
          id: edu.id,
          category: "education",
          content: {
            institution: edu.institution,
            location: edu.location,
            degree: edu.degree,
            field: edu.field,
            startDate: edu.startDate,
            endDate: edu.endDate,
            gpa: edu.gpa,
            highlights: edu.highlights,
          },
          sourceSection: "education",
          sourceOrder: nextSourceOrder(),
          sourceSpanIds: edu.sourceSpanIds,
          sourceQuality: edu.sourceQuality,
          confidenceScore: 0.95,
        },
        context,
      ),
    );
  }

  for (const skill of profile.skills) {
    if (!shouldInclude(accepted, skill.id)) continue;
    entries.push(
      entryWithSource(
        {
          id: skill.id,
          category: "skill",
          content: {
            name: skill.name,
            category: skill.category,
          },
          sourceSection: "skills",
          sourceOrder: nextSourceOrder(),
          sourceSpanIds: skill.sourceSpanIds,
          sourceQuality: skill.sourceQuality,
          confidenceScore: 0.85,
        },
        context,
      ),
    );
  }

  for (const project of profile.projects) {
    const includeRoot = shouldInclude(accepted, project.id);
    if (includeRoot) {
      entries.push(
        entryWithSource(
          {
            id: project.id,
            category: "project",
            content: {
              name: project.name,
              description: project.description,
              url: project.url,
              technologies: project.technologies,
              highlights: [],
              startDate: project.startDate,
              endDate: project.endDate,
              childCount: project.highlights.length,
            },
            sourceSection: "projects",
            sourceOrder: nextSourceOrder(),
            sourceSpanIds: project.sourceSpanIds,
            sourceQuality: project.sourceQuality,
            confidenceScore: 0.9,
          },
          context,
        ),
      );
    }

    project.highlights.forEach((highlight, index) => {
      const id = groundedTextId(project.id, "highlight", index);
      if (!shouldInclude(accepted, id, project.id)) return;
      entries.push(
        entryWithSource(
          {
            id,
            category: "bullet",
            content: {
              ...textEntryContent(highlight),
              context: project.name,
              project: project.name,
              technologies: project.technologies,
              parentType: "project",
              parentId: project.id,
              parentLabel: project.name,
              order: index,
            },
            sourceSection: "projects",
            sourceOrder: nextSourceOrder(),
            sourceSpanIds: highlight.sourceSpanIds,
            sourceQuality: highlight.sourceQuality,
            confidenceScore: 0.85,
            parentId: project.id,
            componentType: "project",
            componentOrder: index,
          },
          context,
        ),
      );
    });
  }

  return entries;
}

export function buildParseRunReviewEntries(
  input: BuildParseRunBankEntriesInput,
): BankEntry[] {
  const entries = buildParseRunBankEntries(input);
  return entries.map((entry, index) => ({
    id: entry.id ?? `${input.parseRun.id}:entry:${index}`,
    userId: input.parseRun.userId,
    category: entry.category,
    content: entry.content,
    sourceDocumentId: entry.sourceDocumentId,
    sourcePage: entry.sourcePage,
    sourceBbox: entry.sourceBbox,
    sourceOrder: entry.sourceOrder,
    sourceHeaderBbox: entry.sourceHeaderBbox,
    sourceLinks: entry.sourceLinks,
    sourceArtifactId: entry.sourceArtifactId,
    sourceParseRunId: entry.sourceParseRunId,
    sourceSpanIds: entry.sourceSpanIds,
    sourceQuality: entry.sourceQuality,
    matchMethod: entry.matchMethod,
    confidenceScore: entry.confidenceScore ?? input.parseRun.confidence,
    createdAt: input.parseRun.createdAt,
  }));
}
