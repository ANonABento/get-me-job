import type { DocumentSourceMap, SourceQuality } from "./types";
import { resolveSourceSpanIds } from "./source-spans";

export interface AiSourceCitedPromptOptions {
  maxLines?: number;
}

export interface AiMissingSourceIds {
  path: string;
  sourceSpanIds: string[];
}

export interface AiUnsupportedValue {
  path: string;
  value: string;
  sourceSpanIds: string[];
  citedText: string;
}

export interface AiCitationValidationResult {
  missingSourceIds: AiMissingSourceIds[];
  unsupportedValues: AiUnsupportedValue[];
  fieldSourceQualities: Record<string, SourceQuality>;
  warnings: Array<{
    code: "missing_source_id" | "unsupported_value";
    path: string;
    message: string;
    sourceSpanIds: string[];
  }>;
}

const METADATA_KEYS = new Set([
  "id",
  "sourceSpanIds",
  "sourceQuality",
  "confidence",
  "current",
  "category",
]);

const TOKEN_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function annotatedSourceLines(sourceMap: DocumentSourceMap, maxLines: number) {
  return sourceMap.lines
    .slice(0, maxLines)
    .map((line) => `[${line.id}] ${line.text}`)
    .join("\n");
}

export function buildAiSourceCitedResumePrompt(
  sourceMap: DocumentSourceMap,
  options: AiSourceCitedPromptOptions = {},
): string {
  const maxLines = options.maxLines ?? 240;
  return `You are a source-cited resume parser. Parse only facts present in the annotated source lines.

Return raw JSON only. Every extracted object and every extracted text field must include sourceSpanIds containing the exact source line IDs that support it.

Required top-level shape:
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "website": "", "sourceSpanIds": [] },
  "summary": { "text": "", "sourceSpanIds": [] },
  "experiences": [{ "company": "", "title": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "", "highlights": [{ "text": "", "sourceSpanIds": [] }], "skills": [], "sourceSpanIds": [] }],
  "education": [{ "institution": "", "location": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "highlights": [{ "text": "", "sourceSpanIds": [] }], "sourceSpanIds": [] }],
  "skills": [{ "name": "", "category": "technical|soft|language|tool|other", "sourceSpanIds": [] }],
  "projects": [{ "name": "", "description": "", "url": "", "technologies": [], "highlights": [{ "text": "", "sourceSpanIds": [] }], "startDate": "", "endDate": "", "sourceSpanIds": [] }]
}

Rules:
- Use only the line IDs shown below.
- Do not invent values.
- If a value is uncertain or not present, omit it.
- If a field combines facts from multiple lines, include all supporting line IDs.
- Return JSON only, no markdown.

Annotated source lines:
${annotatedSourceLines(sourceMap, maxLines)}`;
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;
}

function tokens(value: string): string[] {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/['']/g, "")
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 1 && !TOKEN_STOP_WORDS.has(token)) ??
    []
  );
}

function isValueSupported(value: string, citedText: string): boolean {
  const valueTokens = tokens(value);
  if (valueTokens.length === 0) return true;

  const normalizedValue = valueTokens.join(" ");
  const citedTokens = new Set(tokens(citedText));
  const normalizedCited = tokens(citedText).join(" ");

  return (
    normalizedCited.includes(normalizedValue) ||
    valueTokens.every((token) => citedTokens.has(token))
  );
}

function pathFor(parentPath: string, key: string | number): string {
  return parentPath ? `${parentPath}.${key}` : String(key);
}

function valuesToCheck(node: Record<string, unknown>) {
  const values: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(node)) {
    if (METADATA_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim()) {
      values.push({ key, value });
      continue;
    }
    const asStrings = stringArray(value);
    if (asStrings) {
      asStrings
        .filter((item) => item.trim())
        .forEach((item, index) =>
          values.push({ key: `${key}.${index}`, value: item }),
        );
    }
  }
  return values;
}

function visitNode(
  node: unknown,
  path: string,
  sourceMap: DocumentSourceMap,
  result: AiCitationValidationResult,
) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      visitNode(item, pathFor(path, index), sourceMap, result),
    );
    return;
  }

  const objectNode = node as Record<string, unknown>;
  const sourceSpanIds = stringArray(objectNode.sourceSpanIds);
  if (sourceSpanIds) {
    const resolved = resolveSourceSpanIds(sourceMap, sourceSpanIds);
    result.fieldSourceQualities[path] = resolved.sourceQuality;

    if (resolved.missingIds.length > 0) {
      result.missingSourceIds.push({
        path,
        sourceSpanIds: resolved.missingIds,
      });
      result.warnings.push({
        code: "missing_source_id",
        path,
        message: `Missing source IDs: ${resolved.missingIds.join(", ")}`,
        sourceSpanIds: resolved.missingIds,
      });
    }

    const citedText = resolved.spans.map((span) => span.text).join("\n");
    for (const { key, value } of valuesToCheck(objectNode)) {
      if (!isValueSupported(value, citedText)) {
        const valuePath = pathFor(path, key);
        result.unsupportedValues.push({
          path: valuePath,
          value,
          sourceSpanIds,
          citedText,
        });
        result.warnings.push({
          code: "unsupported_value",
          path: valuePath,
          message: `Value is not supported by cited source lines: ${value}`,
          sourceSpanIds,
        });
      }
    }
  }

  for (const [key, value] of Object.entries(objectNode)) {
    if (key === "sourceSpanIds") continue;
    visitNode(value, pathFor(path, key), sourceMap, result);
  }
}

export function validateAiSourceCitations(
  sourceMap: DocumentSourceMap,
  parsed: unknown,
): AiCitationValidationResult {
  const result: AiCitationValidationResult = {
    missingSourceIds: [],
    unsupportedValues: [],
    fieldSourceQualities: {},
    warnings: [],
  };
  visitNode(parsed, "", sourceMap, result);
  return result;
}
