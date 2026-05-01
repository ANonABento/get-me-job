/**
 * Deterministic PDF resume parser.
 * Extracts structured JSON from a PDF buffer — no LLM required.
 *
 * Pipeline:
 *   PDF buffer → text extraction (pdf-parse) → section detection → field extraction → ParsedResumeResult
 */

import type { Profile } from "@/types";
import { detectSections } from "@/lib/parser/section-detector";
import {
  extractFieldsFromSections,
  extractContact,
  type ExtractedFields,
  type ContactInfo,
} from "@/lib/parser/field-extractor";

export interface ParsedResumeResult {
  /** Structured profile data matching the app schema. */
  profile: Partial<Profile>;
  /** Sections detected by header pattern matching. */
  sectionsDetected: string[];
  /** Confidence score 0–1. */
  confidence: number;
  /** Raw extracted text from the PDF. */
  rawText: string;
  /** Non-fatal warnings encountered during parsing. */
  warnings: string[];
}

/**
 * Parse a resume from a raw PDF buffer.
 * Returns structured data without any LLM calls.
 */
export async function parsePdfResume(buffer: Buffer): Promise<ParsedResumeResult> {
  const rawText = await extractPdfText(buffer);
  return parseResumeText(rawText);
}

/**
 * Parse resume from already-extracted plain text.
 * Useful for testing or when text was extracted by another means.
 */
export function parseResumeText(text: string): ParsedResumeResult {
  if (!text || text.trim().length === 0) {
    return {
      profile: { rawText: text },
      sectionsDetected: [],
      confidence: 0,
      rawText: text,
      warnings: ["Empty or blank text — nothing to parse"],
    };
  }

  const sections = detectSections(text);
  const extracted: ExtractedFields = extractFieldsFromSections(
    sections.map(s => ({ ...s, text: s.content, confidence: 0.7 }))
  );

  // If no contact section was found, try extracting from the document header
  if (!extracted.contact.name) {
    const headerText = text.split("\n").slice(0, 10).join("\n");
    const { contact } = extractContact(headerText);
    if (contact.name) {
      extracted.contact = contact;
    }
  }

  const confidence = computeConfidence(sections.map(s => s.type), extracted);
  const warnings = buildWarnings(extracted, confidence);

  return {
    profile: {
      contact: extracted.contact,
      summary: extracted.summary || undefined,
      experiences: extracted.experiences,
      education: extracted.education,
      skills: extracted.skills,
      projects: extracted.projects,
      rawText: text,
    },
    sectionsDetected: sections.map(s => s.type),
    confidence,
    rawText: text,
    warnings,
  };
}

// ─── PDF text extraction ────────────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim().length > 50) {
      return data.text;
    }
    // Fall back to raw byte extraction when pdf-parse yields insufficient text
    const fallback = extractPdfTextFallback(buffer);
    return fallback.trim().length > data.text.trim().length ? fallback : data.text;
  } catch {
    return extractPdfTextFallback(buffer);
  }
}

/** Regex-based fallback for malformed or non-standard PDFs. */
function extractPdfTextFallback(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const textRuns: string[] = [];

  const literalPattern = /\((?:\\.|[^\\)])*\)/g;
  const textRunPattern = /(\((?:\\.|[^\\)])*\)\s*Tj)/g;
  const textArrayPattern = /\[([\s\S]*?)\]\s*TJ/g;

  let match: RegExpExecArray | null;

  while ((match = textRunPattern.exec(raw)) !== null) {
    const literal = match[0].match(literalPattern)?.[0];
    if (literal) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  while ((match = textArrayPattern.exec(raw)) !== null) {
    const chunk = match[1];
    for (const literal of chunk.match(literalPattern) ?? []) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  return textRuns
    .map(t => t.trim())
    .filter(Boolean)
    .join("\n");
}

function decodePdfLiteralString(value: string): string {
  return value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(parseInt(octal, 8))
    );
}

// ─── Confidence scoring ────────────────────────────────────────────────────

function computeConfidence(sectionTypes: string[], fields: ExtractedFields): number {
  const sectionScore = computeSectionScore(sectionTypes);
  const fieldScore = computeFieldScore(fields);
  return Math.min((sectionScore + fieldScore) / 2, 1.0);
}

function computeSectionScore(types: string[]): number {
  if (types.length === 0) return 0;
  let score = Math.min(types.length * 0.1, 0.3);
  if (types.includes("experience")) score += 0.3;
  if (types.includes("education")) score += 0.2;
  if (types.includes("skills")) score += 0.1;
  if (types.includes("contact")) score += 0.1;
  return Math.min(score, 1.0);
}

function computeFieldScore(fields: ExtractedFields): number {
  const scores: number[] = [];

  const hasName = Boolean(fields.contact.name);
  const hasEmail = Boolean(fields.contact.email);
  scores.push(hasName && hasEmail ? 0.9 : hasName ? 0.6 : 0.2);

  if (fields.experiences.length > 0) {
    const withDates = fields.experiences.filter(e => e.startDate).length;
    scores.push(withDates / fields.experiences.length);
  } else {
    scores.push(0.1);
  }

  if (fields.education.length > 0) scores.push(0.7);
  if (fields.skills.length > 0) scores.push(0.8);

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// ─── Warning generation ────────────────────────────────────────────────────

function buildWarnings(fields: ExtractedFields, confidence: number): string[] {
  const warnings: string[] = [];
  if (confidence < 0.5) {
    warnings.push("Low confidence — resume may be poorly formatted or non-standard");
  }
  if (fields.experiences.length === 0) warnings.push("No work experience detected");
  if (fields.education.length === 0) warnings.push("No education detected");
  if (!fields.contact.name) warnings.push("Could not detect candidate name");
  return warnings;
}

// Re-export helpers so callers can use them without importing from internal paths
export type { ContactInfo, ExtractedFields };
