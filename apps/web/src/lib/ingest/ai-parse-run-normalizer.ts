import { createHash } from "node:crypto";
import type {
  AiCitationValidationResult,
  ParseResumeWithAiSourceCitationsResult,
} from "./ai-source-cited-parser";
import { sourceQualityForSpanIds } from "./source-spans";
import type {
  DocumentSourceMap,
  ParsedEducationV2,
  ParsedExperienceV2,
  ParsedProjectV2,
  ParsedResumeV2Result,
  ParsedSkillV2,
  SourceGroundedText,
  SourceQuality,
} from "./types";

type AiParsedResumeV2Result = ParsedResumeV2Result & {
  ai: {
    parser: "ai-source-cited-v1";
    raw: Record<string, unknown>;
    validation: AiCitationValidationResult;
  };
};

const SKILL_CATEGORIES = new Set<ParsedSkillV2["category"]>([
  "technical",
  "soft",
  "language",
  "tool",
  "other",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function requiredString(value: unknown): string {
  return optionalString(value) ?? "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function bool(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function skillCategory(value: unknown): ParsedSkillV2["category"] {
  return typeof value === "string" &&
    SKILL_CATEGORIES.has(value as ParsedSkillV2["category"])
    ? (value as ParsedSkillV2["category"])
    : "other";
}

function stableId(
  prefix: string,
  sourceSpanIds: string[],
  fallbackText: string,
): string {
  const digest = createHash("sha1")
    .update(`${prefix}:${sourceSpanIds.join(",")}:${fallbackText}`)
    .digest("hex")
    .slice(0, 12);
  return `${prefix}_${digest}`;
}

function sourceSpanIds(node: Record<string, unknown>): string[] {
  return stringArray(node.sourceSpanIds);
}

function sourceQuality(input: {
  sourceMap: DocumentSourceMap;
  validation: AiCitationValidationResult;
  path: string;
  sourceSpanIds: string[];
}): SourceQuality {
  return (
    input.validation.fieldSourceQualities[input.path] ??
    sourceQualityForSpanIds(input.sourceMap, input.sourceSpanIds)
  );
}

function groundedText(
  node: unknown,
  path: string,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): SourceGroundedText | null {
  if (!isRecord(node)) return null;
  const text = optionalString(node.text);
  if (!text) return null;
  const ids = sourceSpanIds(node);
  return {
    text,
    sourceSpanIds: ids,
    sourceQuality: sourceQuality({
      sourceMap,
      validation,
      path,
      sourceSpanIds: ids,
    }),
  };
}

function groundedTexts(
  value: unknown,
  path: string,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): SourceGroundedText[] {
  return records(value).flatMap((node, index) => {
    const text = groundedText(node, `${path}.${index}`, sourceMap, validation);
    return text ? [text] : [];
  });
}

function normalizeExperiences(
  raw: Record<string, unknown>,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): ParsedExperienceV2[] {
  return records(raw.experiences).flatMap((node, index) => {
    const path = `experiences.${index}`;
    const ids = sourceSpanIds(node);
    const company = requiredString(node.company);
    const title = requiredString(node.title);
    const highlights = groundedTexts(
      node.highlights,
      `${path}.highlights`,
      sourceMap,
      validation,
    );

    if (!company && !title && highlights.length === 0) return [];

    return [
      {
        id: stableId("exp", ids, `${title}:${company}:${index}`),
        company,
        title,
        location: optionalString(node.location),
        startDate: requiredString(node.startDate),
        endDate: optionalString(node.endDate),
        current: bool(node.current),
        description: requiredString(node.description),
        highlights,
        skills: stringArray(node.skills),
        sourceSpanIds: ids,
        sourceQuality: sourceQuality({
          sourceMap,
          validation,
          path,
          sourceSpanIds: ids,
        }),
      },
    ];
  });
}

function normalizeEducation(
  raw: Record<string, unknown>,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): ParsedEducationV2[] {
  return records(raw.education).flatMap((node, index) => {
    const path = `education.${index}`;
    const ids = sourceSpanIds(node);
    const institution = requiredString(node.institution);
    const degree = requiredString(node.degree);
    const highlights = groundedTexts(
      node.highlights,
      `${path}.highlights`,
      sourceMap,
      validation,
    );

    if (!institution && !degree && highlights.length === 0) return [];

    return [
      {
        id: stableId("edu", ids, `${institution}:${degree}:${index}`),
        institution,
        location: optionalString(node.location),
        degree,
        field: requiredString(node.field),
        startDate: optionalString(node.startDate),
        endDate: optionalString(node.endDate),
        gpa: optionalString(node.gpa),
        highlights,
        sourceSpanIds: ids,
        sourceQuality: sourceQuality({
          sourceMap,
          validation,
          path,
          sourceSpanIds: ids,
        }),
      },
    ];
  });
}

function normalizeSkills(
  raw: Record<string, unknown>,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): ParsedSkillV2[] {
  return records(raw.skills).flatMap((node, index) => {
    const name = optionalString(node.name);
    if (!name) return [];
    const path = `skills.${index}`;
    const ids = sourceSpanIds(node);
    return [
      {
        id: stableId("skill", ids, `${name}:${index}`),
        name,
        category: skillCategory(node.category),
        sourceSpanIds: ids,
        sourceQuality: sourceQuality({
          sourceMap,
          validation,
          path,
          sourceSpanIds: ids,
        }),
      },
    ];
  });
}

function normalizeProjects(
  raw: Record<string, unknown>,
  sourceMap: DocumentSourceMap,
  validation: AiCitationValidationResult,
): ParsedProjectV2[] {
  return records(raw.projects).flatMap((node, index) => {
    const path = `projects.${index}`;
    const ids = sourceSpanIds(node);
    const name = requiredString(node.name);
    const highlights = groundedTexts(
      node.highlights,
      `${path}.highlights`,
      sourceMap,
      validation,
    );

    if (!name && highlights.length === 0) return [];

    return [
      {
        id: stableId("proj", ids, `${name}:${index}`),
        name,
        description: requiredString(node.description),
        url: optionalString(node.url),
        technologies: stringArray(node.technologies),
        highlights,
        startDate: optionalString(node.startDate),
        endDate: optionalString(node.endDate),
        sourceSpanIds: ids,
        sourceQuality: sourceQuality({
          sourceMap,
          validation,
          path,
          sourceSpanIds: ids,
        }),
      },
    ];
  });
}

function normalizedWarnings(
  validation: AiCitationValidationResult,
  warnings: string[] = [],
): string[] {
  const validationWarnings = validation.warnings.map((warning) =>
    warning.path
      ? `${warning.path}: ${warning.message}`
      : warning.message,
  );
  return [...warnings, ...validationWarnings];
}

export function normalizeAiSourceCitedParseResult(
  result: ParseResumeWithAiSourceCitationsResult,
  sourceMap: DocumentSourceMap,
): AiParsedResumeV2Result {
  const raw = isRecord(result.raw) ? result.raw : {};
  const contact = isRecord(raw.contact) ? raw.contact : {};
  const contactSpanIds = sourceSpanIds(contact);
  const summary = groundedText(
    raw.summary,
    "summary",
    sourceMap,
    result.validation,
  );

  return {
    confidence: result.validation.warnings.length > 0 ? 0.5 : 0.8,
    rawText: sourceMap.rawText,
    sectionsDetected: [
      ...(raw.summary ? ["summary"] : []),
      ...(raw.experiences ? ["experience"] : []),
      ...(raw.education ? ["education"] : []),
      ...(raw.skills ? ["skills"] : []),
      ...(raw.projects ? ["projects"] : []),
    ],
    warnings: normalizedWarnings(result.validation),
    profile: {
      contact: {
        name: requiredString(contact.name),
        email: optionalString(contact.email),
        phone: optionalString(contact.phone),
        location: optionalString(contact.location),
        linkedin: optionalString(contact.linkedin),
        github: optionalString(contact.github),
        website: optionalString(contact.website),
        confidence: 0.8,
        sourceSpanIds: contactSpanIds,
        sourceQuality: sourceQuality({
          sourceMap,
          validation: result.validation,
          path: "contact",
          sourceSpanIds: contactSpanIds,
        }),
      },
      summary: summary ?? undefined,
      experiences: normalizeExperiences(raw, sourceMap, result.validation),
      education: normalizeEducation(raw, sourceMap, result.validation),
      skills: normalizeSkills(raw, sourceMap, result.validation),
      projects: normalizeProjects(raw, sourceMap, result.validation),
      rawText: sourceMap.rawText,
    },
    ai: {
      parser: "ai-source-cited-v1",
      raw,
      validation: result.validation,
    },
  };
}
