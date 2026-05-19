import {
  getDocumentArtifact,
  getLatestDocumentArtifact,
  saveDocumentParseRun,
  type DocumentArtifact,
  type DocumentParseRun,
  type ParseWarning,
} from "@/lib/db";
import type { LLMConfig } from "@/types";
import { parseResumeWithAiSourceCitations } from "./ai-source-cited-parser";
import type {
  DocumentSourceMap,
  ParsedResumeV2Result,
  ParsedSkillV2,
  SourceGroundedText,
  SourceQuality,
} from "./types";
import { parseResumeV2FromSourceMap } from "@/lib/ingest/parse-resume-v2";
import { resolveSourceSpanIds } from "./source-spans";

export class DocumentParseRunError extends Error {
  readonly status: number;
  readonly publicMessage: string;

  constructor(publicMessage: string, status = 500, cause?: unknown) {
    super(publicMessage);
    this.name = "DocumentParseRunError";
    this.status = status;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}

export interface CreateBasicDocumentParseRunInput {
  documentId: string;
  userId: string;
  artifactId?: string;
}

export interface CreateAiDocumentParseRunInput extends CreateBasicDocumentParseRunInput {
  llmConfig: LLMConfig;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord).filter(Boolean) : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown): string | undefined {
  const string = stringValue(value);
  return string || undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function slugPart(value: string, fallback: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || fallback
  );
}

function sourceQualityFor(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
): SourceQuality {
  return resolveSourceSpanIds(sourceMap, sourceSpanIds).sourceQuality;
}

function skillCategory(value: unknown): ParsedSkillV2["category"] {
  const category = stringValue(value);
  return category === "technical" ||
    category === "soft" ||
    category === "language" ||
    category === "tool"
    ? category
    : "other";
}

function groundedTextFromAi(
  sourceMap: DocumentSourceMap,
  value: unknown,
): SourceGroundedText | null {
  const node = asRecord(value);
  const text = stringValue(node.text);
  if (!text) return null;
  const sourceSpanIds = stringArray(node.sourceSpanIds);
  return {
    text,
    sourceSpanIds,
    sourceQuality: sourceQualityFor(sourceMap, sourceSpanIds),
  };
}

function normalizeAiRawToParserV2Result(
  raw: Record<string, unknown>,
  sourceMap: DocumentSourceMap,
  confidence: number,
  warnings: string[],
): ParsedResumeV2Result {
  const contact = asRecord(raw.contact);
  const contactSourceSpanIds = stringArray(contact.sourceSpanIds);
  const summary = groundedTextFromAi(sourceMap, raw.summary);

  const experiences = asRecordArray(raw.experiences).map(
    (experience, index) => {
      const sourceSpanIds = stringArray(experience.sourceSpanIds);
      const company = stringValue(experience.company);
      const title = stringValue(experience.title);
      return {
        id: `ai-exp-${index + 1}-${slugPart(`${title}-${company}`, "role")}`,
        company,
        title,
        url: optionalString(experience.url),
        location: optionalString(experience.location),
        startDate: stringValue(experience.startDate),
        endDate: optionalString(experience.endDate),
        current: Boolean(experience.current),
        description: stringValue(experience.description),
        highlights: asRecordArray(experience.highlights)
          .map((highlight) => groundedTextFromAi(sourceMap, highlight))
          .filter((highlight): highlight is SourceGroundedText => !!highlight),
        skills: stringArray(experience.skills),
        sourceSpanIds,
        sourceQuality: sourceQualityFor(sourceMap, sourceSpanIds),
      };
    },
  );

  const education = asRecordArray(raw.education).map((item, index) => {
    const sourceSpanIds = stringArray(item.sourceSpanIds);
    const institution = stringValue(item.institution);
    return {
      id: `ai-edu-${index + 1}-${slugPart(institution, "school")}`,
      institution,
      location: optionalString(item.location),
      degree: stringValue(item.degree),
      field: stringValue(item.field),
      startDate: optionalString(item.startDate),
      endDate: optionalString(item.endDate),
      gpa: optionalString(item.gpa),
      highlights: asRecordArray(item.highlights)
        .map((highlight) => groundedTextFromAi(sourceMap, highlight))
        .filter((highlight): highlight is SourceGroundedText => !!highlight),
      sourceSpanIds,
      sourceQuality: sourceQualityFor(sourceMap, sourceSpanIds),
    };
  });

  const skills = asRecordArray(raw.skills).map((skill, index) => {
    const sourceSpanIds = stringArray(skill.sourceSpanIds);
    return {
      id: `ai-skill-${index + 1}-${slugPart(stringValue(skill.name), "skill")}`,
      name: stringValue(skill.name),
      category: skillCategory(skill.category),
      sourceSpanIds,
      sourceQuality: sourceQualityFor(sourceMap, sourceSpanIds),
    };
  });

  const projects = asRecordArray(raw.projects).map((project, index) => {
    const sourceSpanIds = stringArray(project.sourceSpanIds);
    const name = stringValue(project.name);
    return {
      id: `ai-project-${index + 1}-${slugPart(name, "project")}`,
      name,
      description: stringValue(project.description),
      url: optionalString(project.url),
      technologies: stringArray(project.technologies),
      highlights: asRecordArray(project.highlights)
        .map((highlight) => groundedTextFromAi(sourceMap, highlight))
        .filter((highlight): highlight is SourceGroundedText => !!highlight),
      startDate: optionalString(project.startDate),
      endDate: optionalString(project.endDate),
      sourceSpanIds,
      sourceQuality: sourceQualityFor(sourceMap, sourceSpanIds),
    };
  });

  return {
    profile: {
      contact: {
        name: stringValue(contact.name),
        email: optionalString(contact.email),
        phone: optionalString(contact.phone),
        location: optionalString(contact.location),
        linkedin: optionalString(contact.linkedin),
        github: optionalString(contact.github),
        website: optionalString(contact.website),
        confidence,
        sourceSpanIds: contactSourceSpanIds,
        sourceQuality: sourceQualityFor(sourceMap, contactSourceSpanIds),
      },
      summary: summary ?? undefined,
      experiences,
      education,
      skills,
      projects,
      rawText: sourceMap.rawText,
    },
    sectionsDetected: [
      contactSourceSpanIds.length > 0 ? "contact" : "",
      summary ? "summary" : "",
      experiences.length > 0 ? "experience" : "",
      education.length > 0 ? "education" : "",
      skills.length > 0 ? "skills" : "",
      projects.length > 0 ? "projects" : "",
    ].filter(Boolean),
    confidence,
    rawText: sourceMap.rawText,
    warnings,
  };
}

export function resolveReadyDocumentArtifact({
  documentId,
  userId,
  artifactId,
}: CreateBasicDocumentParseRunInput): DocumentArtifact {
  const artifact = artifactId
    ? getDocumentArtifact(artifactId, userId)
    : getLatestDocumentArtifact(documentId, userId);

  if (!artifact || artifact.documentId !== documentId) {
    throw new DocumentParseRunError("Document artifact not found", 404);
  }
  if (artifact.status === "failed") {
    throw new DocumentParseRunError("Document artifact is not ready", 409);
  }
  return artifact;
}

export function createBasicDocumentParseRun({
  documentId,
  userId,
  artifactId,
}: CreateBasicDocumentParseRunInput): DocumentParseRun {
  try {
    const artifact = resolveReadyDocumentArtifact({
      documentId,
      userId,
      artifactId,
    });

    const structured = parseResumeV2FromSourceMap(artifact.sourceMap);
    const warnings: ParseWarning[] = structured.warnings.map((message) => ({
      code: "parser_warning",
      message,
      severity: "warning",
    }));

    return saveDocumentParseRun({
      documentId,
      artifactId: artifact.id,
      userId,
      mode: "basic",
      status: "ready",
      confidence: structured.confidence,
      warnings,
      structured,
    });
  } catch (error) {
    if (error instanceof DocumentParseRunError) throw error;
    throw new DocumentParseRunError(
      "Failed to create document parse run",
      500,
      error,
    );
  }
}

export async function createAiDocumentParseRun({
  documentId,
  userId,
  artifactId,
  llmConfig,
}: CreateAiDocumentParseRunInput): Promise<DocumentParseRun> {
  try {
    const artifact = resolveReadyDocumentArtifact({
      documentId,
      userId,
      artifactId,
    });
    const result = await parseResumeWithAiSourceCitations({
      sourceMap: artifact.sourceMap,
      llmConfig,
    });
    const warnings: ParseWarning[] = result.validation.warnings.map(
      (warning) => ({
        code: warning.code,
        message: warning.message,
        sourceSpanIds: warning.sourceSpanIds,
        severity: "warning",
      }),
    );
    const confidence = warnings.length > 0 ? 0.5 : 0.8;
    const structured = normalizeAiRawToParserV2Result(
      result.raw,
      artifact.sourceMap,
      confidence,
      warnings.map((warning) => warning.message),
    );

    return saveDocumentParseRun({
      documentId,
      artifactId: artifact.id,
      userId,
      mode: "ai",
      status: "ready",
      confidence,
      warnings,
      structured,
    });
  } catch (error) {
    if (error instanceof DocumentParseRunError) throw error;
    throw new DocumentParseRunError(
      "Failed to create AI document parse run",
      500,
      error,
    );
  }
}
