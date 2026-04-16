/**
 * Smart resume parser pipeline.
 * Deterministic first, LLM fallback only for low-confidence sections.
 */

import type {
  Profile,
  Experience,
  Education,
  Skill,
  Project,
  LLMConfig,
} from "@/types";
import { generateId } from "@/lib/utils";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { detectSections, type Section } from "./section-detector";
import {
  extractFieldsFromSections,
  extractContact,
  type ExtractedFields,
} from "./field-extractor";

type DetectedSection = Section & { text: string; confidence: number };

function calculateSectionConfidence(sections: Section[]): number {
  if (sections.length === 0) return 0;
  const hasExperience = sections.some(s => s.type === "experience");
  const hasEducation = sections.some(s => s.type === "education");
  const hasSkills = sections.some(s => s.type === "skills");
  const hasContact = sections.some(s => s.type === "contact");
  let score = sections.length * 0.1;
  if (hasExperience) score += 0.3;
  if (hasEducation) score += 0.2;
  if (hasSkills) score += 0.1;
  if (hasContact) score += 0.1;
  return Math.min(score, 1.0);
}

const CONFIDENCE_THRESHOLD = 0.7;

export interface SmartParseResult {
  profile: Partial<Profile>;
  confidence: number;
  sectionsDetected: string[];
  llmUsed: boolean;
  llmSectionsCount: number;
  warnings: string[];
}

/**
 * Smart resume parser: deterministic first, LLM fallback for ambiguous sections.
 *
 * Pipeline:
 * 1. Detect sections (deterministic)
 * 2. Extract fields from each section (deterministic)
 * 3. Calculate overall confidence
 * 4. If confidence >= 0.7 → return deterministic result (zero LLM cost)
 * 5. If confidence < 0.7 AND llmConfig → send only low-confidence sections to LLM
 * 6. If confidence < 0.7 AND no llmConfig → return deterministic result with warnings
 */
export async function smartParseResume(
  text: string,
  llmConfig?: LLMConfig | null
): Promise<SmartParseResult> {
  // Step 1: Detect sections
  const rawSections = detectSections(text);
  const sectionConfidence = calculateSectionConfidence(rawSections);
  // Assign per-section confidence based on overall quality so low-confidence
  // resumes have sections that fall below the LLM-fallback threshold.
  const perSectionConf = sectionConfidence < CONFIDENCE_THRESHOLD ? sectionConfidence : 0.8;
  const sections: DetectedSection[] = rawSections.map(s => ({ ...s, text: s.content, confidence: perSectionConf }));
  const sections: DetectedSection[] = rawSections.map(s => ({ ...s, text: s.content, confidence: 0.5 }));
  const sectionConfidence = calculateSectionConfidence(rawSections);
  const sections: DetectedSection[] = rawSections.map(s => ({ ...s, text: s.content, confidence: sectionConfidence }));

  // Step 2: Extract fields deterministically
  const extracted = extractFieldsFromSections(sections);

  // If no contact was found from a dedicated contact section, try extracting from full text header
  if (!extracted.contact.name) {
    const headerText = text.split("\n").slice(0, 10).join("\n");
    const { contact } = extractContact(headerText);
    if (contact.name) {
      extracted.contact = contact;
    }
  }

  // Step 3: Calculate overall confidence
  const fieldConfidence = calculateFieldConfidence(extracted);
  const overallConfidence = (sectionConfidence + fieldConfidence) / 2;

  const sectionsDetected = sections.map((s) => s.type);

  // Step 4: High confidence → return deterministic result
  if (overallConfidence >= CONFIDENCE_THRESHOLD) {
    return {
      profile: buildProfile(extracted, text),
      confidence: overallConfidence,
      sectionsDetected,
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    };
  }

  // Step 5: Low confidence + LLM available → targeted LLM for ambiguous sections
  if (llmConfig) {
    // If no sections were detected, create a fallback section from the full text
    const sectionsForLLM: DetectedSection[] =
      sections.length > 0
        ? sections
        : [{ type: "experience", startIndex: 0, endIndex: text.length, content: text, text, confidence: 0 }];

    const { enhanced, llmSectionCount, warnings } = await enhanceWithLLM(
      sectionsForLLM,
    // If no sections were detected, treat full text as one unstructured low-confidence section
    const sectionsForEnhance: DetectedSection[] =
      sections.length > 0
        ? sections
        : [
            {
              type: "experience",
              startIndex: 0,
              endIndex: text.length,
              content: text,
              text,
              confidence: 0,
            },
          ];

    const { enhanced, llmSectionCount, warnings } = await enhanceWithLLM(
      sectionsForEnhance,
      extracted,
      llmConfig,
      text
    );

    const enhancedFieldConf = calculateFieldConfidence(enhanced);
    const enhancedOverall = Math.max(
      overallConfidence,
      (sectionConfidence + enhancedFieldConf) / 2
    );

    return {
      profile: buildProfile(enhanced, text),
      confidence: enhancedOverall,
      sectionsDetected,
      llmUsed: llmSectionCount > 0,
      llmSectionsCount: llmSectionCount,
      warnings,
    };
  }

  // Step 6: Low confidence + no LLM → return with warnings
  const warnings: string[] = [];
  if (overallConfidence < 0.5) {
    warnings.push("Low confidence parse — resume may be poorly formatted or non-standard");
  }
  if (extracted.experiences.length === 0) {
    warnings.push("No work experience detected");
  }
  if (extracted.education.length === 0) {
    warnings.push("No education detected");
  }
  if (!extracted.contact.name) {
    warnings.push("Could not detect name");
  }

  return {
    profile: buildProfile(extracted, text),
    confidence: overallConfidence,
    sectionsDetected,
    llmUsed: false,
    llmSectionsCount: 0,
    warnings,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function calculateFieldConfidence(fields: ExtractedFields): number {
  const scores: number[] = [];

  // Contact confidence
  const hasName = Boolean(fields.contact.name);
  const hasEmail = Boolean(fields.contact.email);
  scores.push(hasName && hasEmail ? 0.9 : hasName ? 0.6 : 0.2);

  // Experience confidence
  if (fields.experiences.length > 0) {
    const withDates = fields.experiences.filter((e) => e.startDate).length;
    scores.push(withDates / fields.experiences.length);
  } else {
    scores.push(0.1);
  }

  // Education confidence
  if (fields.education.length > 0) {
    scores.push(0.7);
  }

  // Skills confidence
  if (fields.skills.length > 0) {
    scores.push(0.8);
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function buildProfile(fields: ExtractedFields, rawText: string): Partial<Profile> {
  return {
    contact: fields.contact,
    summary: fields.summary,
    experiences: fields.experiences,
    education: fields.education,
    skills: fields.skills,
    projects: fields.projects,
    rawText,
  };
}

// ─── Targeted LLM enhancement ───────────────────────────────────────

function buildBatchPrompt(sectionPrompts: string[]): string {
  return `You are a resume parser. Parse the following resume sections and return structured JSON.
interface LLMEnhanceResult {
  enhanced: ExtractedFields;
  llmSectionCount: number;
  warnings: string[];
}

/**
 * Send low-confidence sections (or full text if no sections) to LLM.
 * Send only low-confidence sections to LLM in a single batched call.
 * Much cheaper than sending the entire resume.
 * Falls back to sending the full text when no sections were detected.
 * Falls back to full text when no sections were detected.
 * Much cheaper than sending the entire resume (except for the fallback case).
 */
async function enhanceWithLLM(
  sections: DetectedSection[],
  extracted: ExtractedFields,
  llmConfig: LLMConfig,
  rawText: string
  rawText?: string
  fullText?: string
): Promise<LLMEnhanceResult> {
  let lowConfSections = sections.filter(
    (s) => s.confidence < CONFIDENCE_THRESHOLD && s.type !== "contact"
  rawText: string
  fullText: string
  fullText?: string
): Promise<LLMEnhanceResult> {
  // When we reach this function, overall confidence is already below threshold.
  // Send all non-contact sections to LLM. When no sections were detected,
  // fall back to sending the full text as a single block.
  const nonContactSections = sections.filter((s) => s.type !== "contact");

  let sectionPrompts: string[];
  if (nonContactSections.length > 0) {
    sectionPrompts = nonContactSections.map((s, i) => {
      return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
    });
  } else if (fullText) {
    sectionPrompts = [`--- Full Resume ---\n${fullText}`];
  } else {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  const sectionsToCount = nonContactSections.length > 0 ? nonContactSections.length : 1;
  const lowConfSections = sections.filter(
    (s) => s.confidence <= CONFIDENCE_THRESHOLD && s.type !== "contact"
  );

  // If no low-confidence sections but overall confidence is low (e.g. no sections detected),
  // fall back to parsing the full resume text with LLM
  // When no sections were detected at all, fall back to parsing the full text
  const useFullText = lowConfSections.length === 0 && sections.length === 0;

  if (lowConfSections.length === 0 && !useFullText) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text as fallback)
  const sectionPrompts = useFullText
    ? [`--- Full Resume Text ---\n${rawText}`]
    : lowConfSections.map((s, i) => {
        return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
      });
  // If no individually low-confidence sections, but we're here because overall
  // confidence was low, fall back to sending the full text as one unstructured section.
  const sectionsToSend: Array<{ type: string; text: string }> =
    lowConfSections.length > 0
      ? lowConfSections
      : [{ type: "unstructured", text: rawText }];
  // If no low-confidence sections found but we have raw text (e.g. no headers detected),
  // fall back to sending the full text to LLM
  const sectionsToSend = lowConfSections.length > 0 ? lowConfSections : (rawText ? [] : []);
  const useFullText = lowConfSections.length === 0 && !!rawText;

  if (!useFullText && sectionsToSend.length === 0) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text as fallback)
  const sectionPrompts = useFullText
    ? [`--- Full Resume Text ---\n${rawText}`]
    : sectionsToSend.map((s, i) => {
        return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
      });
  // If no sections were detected at all, fall back to parsing the full text
  const sectionsToSend =
    lowConfSections.length > 0
      ? lowConfSections
      : sections.length > 0
        ? sections.filter((s) => s.type !== "contact")
        : [{ type: "experience" as const, text: rawText, confidence: 0, content: rawText, startIndex: 0, endIndex: rawText.length }];

  if (sectionsToSend.length === 0) {
  // If no structured sections were detected, treat the full text as a single section to parse
  const sectionsToProcess: Array<{ type: string; text: string }> =
    lowConfSections.length > 0
      ? lowConfSections
      : [{ type: "unstructured", text: fullText }];

  if (sectionsToProcess.length === 0) {
  // If no sections at all, fall back to full-text LLM parse
  rawText?: string
  fullText?: string
  fullText: string
): Promise<LLMEnhanceResult> {
  // All non-contact sections are sent to LLM — this function is only called
  // when overall confidence is already below threshold.
  const nonContactSections = sections.filter((s) => s.type !== "contact");

  // If no low-confidence sections but we're here (overall confidence is low),
  // fall back to sending full text as a single section
  const sectionsToProcess =
    lowConfSections.length > 0
      ? lowConfSections
      : fullText
        ? [{ type: "full_resume", text: fullText, confidence: 0 } as DetectedSection]
        : [];

  if (sectionsToProcess.length === 0) {
  // If no low-confidence sections but we're called (overall confidence is low),
  // fall back to sending the full text to LLM
  // If no low-confidence sections detected, fall back to sending the full text
  if (lowConfSections.length === 0) {
    if (!fullText) {
      return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
    }
    // Use full text as a single section
    const fullTextSection: DetectedSection = {
      type: "experience",
    // No structured sections found — send full text as a single ambiguous section
    lowConfSections = [
      { type: "unknown", content: fullText, text: fullText, confidence: 0, startIndex: 0, endIndex: fullText.length },
    ];
  }

  // Build a batched prompt with all ambiguous sections
  const sectionPrompts = lowConfSections.map((s, i) =>
    `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`
  );
    // Use full text as the single "section" to parse
    const sectionPrompts = [
      `--- Full resume text ---\n${fullText}`,
    ];
    return runLLMBatch(sectionPrompts, 1, extracted, llmConfig);
    // Use full text as a single unidentified section
    lowConfSections.push({
      type: "summary" as DetectedSection["type"],
      content: fullText,
      text: fullText,
      confidence: 0,
      startIndex: 0,
      endIndex: fullText.length,
    };
    return enhanceWithLLM([fullTextSection], extracted, llmConfig);
  }

  // Build a batched prompt with all ambiguous sections
  const sectionPrompts = lowConfSections.map((s, i) => {
    return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
    } as DetectedSection);
    // Treat the entire resume as one unparsed block
    lowConfSections.push({
      type: "experience",
      startIndex: 0,
      endIndex: fullText.length,
      content: fullText,
      text: fullText,
      confidence: 0,
    });
  // When no sections were detected at all, fall back to sending full text to LLM
  const useFullTextFallback = lowConfSections.length === 0 && sections.length === 0 && fullText;
  if (lowConfSections.length === 0 && !useFullTextFallback) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text fallback)
  const sectionPrompts = useFullTextFallback
    ? [`--- Full resume (no sections detected) ---\n${fullText}`]
    : lowConfSections.map((s, i) => {
        return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
      });
  // If no low-confidence sections but we have raw text (e.g. no sections detected at all),
  // use the full text as a fallback
  const useFullTextFallback = lowConfSections.length === 0 && rawText;
  if (lowConfSections.length === 0 && !rawText) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text)
  const sectionPrompts = useFullTextFallback
    ? [`--- Full Resume ---\n${rawText}`]
    : lowConfSections.map((s, i) => {
        return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
      });
  // If no low-confidence sections (e.g. no sections detected at all), fall back to full text
  const hasContent = lowConfSections.length > 0 || (sections.length === 0 && rawText);
  if (!hasContent) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text if no sections)
  const sectionPrompts = lowConfSections.length > 0
    ? lowConfSections.map((s, i) => `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`)
    : [`--- Full resume text ---\n${rawText}`];
  // If no low-confidence sections exist but raw text is available, use it as a
  // single unstructured section (handles resumes with no detectable headers).
  if (lowConfSections.length === 0) {
    if (!rawText) {
      return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
    }
    // Treat full text as an unstructured section for LLM enhancement
    const syntheticSection: DetectedSection = {
      type: "experience",
      startIndex: 0,
      endIndex: rawText.length,
      content: rawText,
      text: rawText,
      confidence: 0,
    };
    lowConfSections.push(syntheticSection);
  }

  // Build a batched prompt with all ambiguous sections
  const sectionPrompts = sectionsToProcess.map((s, i) => {
    return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
  const sectionPrompts = lowConfSections.map((s, i) => {
    return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
  // If no sections were detected, fall back to parsing the full raw text
  const sectionsToProcess = nonContactSections.length > 0
    ? nonContactSections
    : rawText
    ? [{ type: "summary" as const, text: rawText, content: rawText, startIndex: 0, endIndex: rawText.length, confidence: 0 }]
    : [];
  // If no low-confidence sections were detected, fall back to full text (no section headers found)
  const hasFullTextFallback = lowConfSections.length === 0 && fullText;
  if (lowConfSections.length === 0 && !fullText) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections (or full text as fallback)
  const sectionPrompts = hasFullTextFallback
    ? [`--- Full Resume Text ---\n${fullText}`]
    : lowConfSections.map((s, i) => {
        return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
      });
  // If no sections were detected at all, fall back to sending the full text to LLM
  const sectionsToProcess =
    lowConfSections.length > 0
      ? lowConfSections
      : sections.length === 0
        ? [{ type: "experience" as const, text: fullText, content: fullText, startIndex: 0, endIndex: fullText.length, confidence: 0 }]
        : [];

  if (sectionsToProcess.length === 0) {
    return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
  }

  // Build a batched prompt with all ambiguous sections
  const sectionPrompts = sectionsToSend.map((s, i) => {
    return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
  const sectionPrompts = sectionsToProcess.map((s, i) => {
    const typeHint = s.type !== "summary" ? s.type : "unidentified section";
  const sectionPrompts = lowConfSections.map((s, i) =>
    `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`
  );
  const sectionPrompts = sectionsToProcess.map((s, i) => {
    const typeHint = s.type;
    return `--- Section ${i + 1} (detected as: ${typeHint}) ---\n${s.text}`;
  });

  return runLLMBatch(sectionPrompts, lowConfSections.length, extracted, llmConfig);
}

async function runLLMBatch(
  sectionPrompts: string[],
  sectionCount: number,
  extracted: ExtractedFields,
  llmConfig: LLMConfig
): Promise<LLMEnhanceResult> {
  const batchPrompt = `You are a resume parser. Parse the following resume sections and return structured JSON.

For each section, extract the relevant data. Return a JSON object with these keys (include only sections present):

{
  "experience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "current": false, "description": "", "highlights": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "highlights": [] }],
  "skills": [{ "name": "", "category": "technical|soft|language|tool|other" }],
  "projects": [{ "name": "", "description": "", "technologies": [], "highlights": [] }],
  "summary": "text"
}

Rules:
- Only include data clearly present in the text
- Return ONLY the JSON object, no explanation or markdown
- Omit empty arrays/null fields

Sections to parse:

${sectionPrompts.join("\n\n")}`;
}

interface LLMEnhanceResult {
  enhanced: ExtractedFields;
  llmSectionCount: number;
  warnings: string[];
}

/**
 * Send only low-confidence sections to LLM in a single batched call.
 * Much cheaper than sending the entire resume.
 */
async function enhanceWithLLM(
  sections: DetectedSection[],
  extracted: ExtractedFields,
  llmConfig: LLMConfig,
  fullText?: string
): Promise<LLMEnhanceResult> {
  const lowConfSections = sections.filter(
    (s) => s.confidence < CONFIDENCE_THRESHOLD && s.type !== "contact"
  );

  // If no targeted low-confidence sections, fall back to full text if available
  if (lowConfSections.length === 0) {
    if (!fullText) {
      return { enhanced: extracted, llmSectionCount: 0, warnings: [] };
    }
    // Use full text as a single unstructured block for LLM to parse
    const sectionPrompts = [`--- Full Resume Text ---\n${fullText}`];
    const batchPrompt = buildBatchPrompt(sectionPrompts);
    try {
      const client = new LLMClient(llmConfig);
      const response = await client.complete({
        messages: [{ role: "user", content: batchPrompt }],
        temperature: 0.1,
        maxTokens: 2048,
      });
      const parsed = parseJSONFromLLM<Record<string, unknown>>(response);
      const enhanced = mergeWithLLMResult(extracted, parsed);
      return { enhanced, llmSectionCount: 1, warnings: [] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return {
        enhanced: extracted,
        llmSectionCount: 0,
        warnings: [`LLM enhancement failed: ${msg}. Using deterministic results only.`],
      };
    }
  }

  // Build a batched prompt with all ambiguous sections
  const sectionPrompts = lowConfSections.map((s, i) => {
    return `--- Section ${i + 1} (detected as: ${s.type}) ---\n${s.text}`;
  });

  const batchPrompt = buildBatchPrompt(sectionPrompts);

  try {
    const client = new LLMClient(llmConfig);
    const response = await client.complete({
      messages: [{ role: "user", content: batchPrompt }],
      temperature: 0.1,
      maxTokens: 2048,
    });

    const parsed = parseJSONFromLLM<Record<string, unknown>>(response);
    const enhanced = mergeWithLLMResult(extracted, parsed);

    return {
      enhanced,
      llmSectionCount: useFullText ? 1 : lowConfSections.length,
      llmSectionCount: sectionsToSend.length,
      llmSectionCount: useFullText ? 1 : sectionsToSend.length,
      llmSectionCount: sectionsToSend.length,
      llmSectionCount: sectionsToCount,
      llmSectionCount: sectionCount,
      llmSectionCount: useFullTextFallback ? 1 : lowConfSections.length,
      llmSectionCount: lowConfSections.length > 0 ? lowConfSections.length : 1,
      llmSectionCount: hasFullTextFallback ? 1 : lowConfSections.length,
      llmSectionCount: sectionsToProcess.length,
      warnings: [],
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      enhanced: extracted,
      llmSectionCount: 0,
      warnings: [`LLM enhancement failed: ${msg}. Using deterministic results only.`],
    };
  }
}

/**
 * Merge LLM results into existing extracted fields.
 * LLM results replace deterministic results only for sections that were sent to LLM.
 */
function mergeWithLLMResult(
  existing: ExtractedFields,
  llmResult: Record<string, unknown>
): ExtractedFields {
  const merged = { ...existing };

  // Merge experiences
  const rawExperiences = llmResult.experience as Record<string, unknown>[] | undefined;
  if (rawExperiences?.length) {
    merged.experiences = rawExperiences.map(
      (e): Experience => ({
        id: generateId(),
        company: (e.company as string) || "",
        title: (e.title as string) || "",
        location: e.location as string | undefined,
        startDate: (e.startDate as string) || "",
        endDate: e.endDate as string | undefined,
        current: (e.current as boolean) || false,
        description: (e.description as string) || "",
        highlights: (e.highlights as string[]) || [],
        skills: (e.skills as string[]) || [],
      })
    );
  }

  // Merge education
  const rawEducation = llmResult.education as Record<string, unknown>[] | undefined;
  if (rawEducation?.length) {
    merged.education = rawEducation.map(
      (e): Education => ({
        id: generateId(),
        institution: (e.institution as string) || "",
        degree: (e.degree as string) || "",
        field: (e.field as string) || "",
        startDate: e.startDate as string | undefined,
        endDate: e.endDate as string | undefined,
        gpa: e.gpa as string | undefined,
        highlights: (e.highlights as string[]) || [],
      })
    );
  }

  // Merge skills
  const rawSkills = llmResult.skills as Record<string, unknown>[] | undefined;
  if (rawSkills?.length) {
    merged.skills = rawSkills.map(
      (s): Skill => ({
        id: generateId(),
        name: (s.name as string) || "",
        category: (s.category as Skill["category"]) || "other",
        proficiency: s.proficiency as Skill["proficiency"],
      })
    );
  }

  // Merge projects
  const rawProjects = llmResult.projects as Record<string, unknown>[] | undefined;
  if (rawProjects?.length) {
    merged.projects = rawProjects.map(
      (p): Project => ({
        id: generateId(),
        name: (p.name as string) || "",
        description: (p.description as string) || "",
        url: p.url as string | undefined,
        technologies: (p.technologies as string[]) || [],
        highlights: (p.highlights as string[]) || [],
      })
    );
  }

  // Merge summary
  if (typeof llmResult.summary === "string" && llmResult.summary) {
    merged.summary = llmResult.summary;
  }

  return merged;
}
