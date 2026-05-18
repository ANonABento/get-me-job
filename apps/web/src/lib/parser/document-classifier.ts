import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type { LLMConfig, DocumentType } from "@/types";

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "resume",
  "cover_letter",
  "reference_letter",
  "certificate",
  "portfolio",
  "career_notes",
  "other",
];

const CLASSIFICATION_PROMPT = `You are a document classifier. Based on the text below, classify this document into exactly one of these categories:
- resume: A CV or resume listing work experience, education, and skills
- cover_letter: A letter addressed to an employer expressing interest in a position
- reference_letter: A letter from a referee endorsing or recommending someone
- certificate: A certification, diploma, or credential document
- portfolio: A portfolio or collection of work samples
- career_notes: Loose career notes, work logs, brag documents, or bullet-heavy source material that is not a resume
- other: None of the above

Return ONLY a JSON object with this structure (no markdown):
{"type": "resume"}

Document text:
`;

/**
 * Classify a document using LLM analysis of its content.
 * Returns the detected DocumentType.
 */
export async function classifyDocumentWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<DocumentType> {
  const snippet = text.slice(0, 500);
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: CLASSIFICATION_PROMPT + snippet,
      },
    ],
    temperature: 0,
    maxTokens: 50,
  });

  const parsed = parseJSONFromLLM<{ type: string }>(response);
  const detected = parsed.type?.toLowerCase().trim();

  if (VALID_DOCUMENT_TYPES.includes(detected as DocumentType)) {
    return detected as DocumentType;
  }

  return "other";
}

/**
 * Classify a document based on filename heuristics.
 * Used as a fallback when LLM is unavailable.
 */
export function classifyDocumentByFilename(filename: string): DocumentType {
  const lower = filename.toLowerCase();

  if (lower.includes("resume") || lower.includes("cv")) {
    return "resume";
  }
  if (lower.includes("cover")) {
    return "cover_letter";
  }
  if (lower.includes("reference") || lower.includes("recommendation")) {
    return "reference_letter";
  }
  if (lower.includes("certificate") || lower.includes("cert")) {
    return "certificate";
  }
  if (lower.includes("portfolio")) {
    return "portfolio";
  }
  if (
    lower.includes("career-notes") ||
    lower.includes("career_notes") ||
    lower.includes("career notes") ||
    lower.includes("brag-doc") ||
    lower.includes("brag_doc") ||
    lower.includes("brag document")
  ) {
    return "career_notes";
  }

  return "other";
}

/**
 * Classify obvious document types from content without calling an LLM.
 * This keeps uploads useful in local/self-hosted setups where provider keys are
 * intentionally absent.
 */
export function classifyDocumentByContent(text: string): DocumentType | null {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s@.+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const hasLetterGreeting =
    /\bdear\s+(hiring\s+manager|recruiting\s+team|recruiter|selection\s+committee|team|[\p{L}\s]+),?/u.test(
      normalized,
    ) || normalized.startsWith("to whom it may concern");
  const hasLetterClosing =
    /\b(sincerely|regards|best regards|thank you|respectfully)\b/.test(
      normalized,
    );
  const hasApplicationIntent =
    /\b(apply|application|candidate|position|role|opportunity|interview)\b/.test(
      normalized,
    );
  const hasReferenceIntent =
    /\b(letter of recommendation|reference for|i am pleased to recommend|i am writing to recommend|i recommend|strongly recommend|endorse)\b/.test(
      normalized,
    );
  const hasPersonalApplicationIntent =
    /\b(i am applying|i m applying|my application|considering my application|my candidacy|i would welcome|i can help|i would bring)\b/.test(
      normalized,
    );

  if (hasLetterGreeting && hasLetterClosing && hasReferenceIntent) {
    return "reference_letter";
  }

  if (
    hasLetterGreeting &&
    hasLetterClosing &&
    (hasPersonalApplicationIntent || hasApplicationIntent)
  ) {
    return "cover_letter";
  }

  // Check resume signals BEFORE the certificate heuristic — a resume
  // that mentions "certification" in a bullet (e.g., "Earned CPR/AED
  // certification") was previously misclassified as a certificate and
  // skipped the parse pipeline entirely. Resume signals (contact +
  // multiple section headers) are a stronger indicator than the word
  // "certification" appearing anywhere in the body.
  const hasResumeContact =
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) ||
    /\b(?:linkedin\.com\/in|github\.com\/)\b/i.test(text);
  const resumeSectionHits = [
    /\bexperience\b/,
    /\beducation\b/,
    /\bskills\b/,
    /\bprojects?\b/,
    /\bsummary\b/,
  ].filter((pattern) => pattern.test(normalized)).length;
  if (hasResumeContact && resumeSectionHits >= 2) {
    return "resume";
  }

  const hasPortfolioLanguage =
    /\b(portfolio|case stud(?:y|ies)|selected work|work samples?|project gallery|live demo|github\.com\/|demo url|source code)\b/.test(
      normalized,
    );
  const projectUrlHits = (
    text.match(
      /\b(?:https?:\/\/)?(?:github\.com|gitlab\.com|devpost\.com|[a-z0-9-]+\.(?:dev|app|io|com)\/[^\s)]+)/gi,
    ) ?? []
  ).length;
  const hasRepeatedProjectSignals =
    (normalized.match(
      /\b(project|case study|demo|github|stack|technologies)\b/g,
    )?.length ?? 0) >= 3;
  if (
    (hasPortfolioLanguage &&
      (projectUrlHits >= 1 || hasRepeatedProjectSignals)) ||
    projectUrlHits >= 2
  ) {
    return "portfolio";
  }

  if (
    /\b(certificate of|certifies that|credential id)\b/.test(normalized) ||
    /^\s*certificate\s+of\b/im.test(text)
  ) {
    return "certificate";
  }

  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = rawLines.filter((line) =>
    /^(?:[-*•]|\d+[.)])\s+/.test(line),
  );
  const careerNoteSignals = [
    /\bachievements?\b/,
    /\bbrag\b/,
    /\bwork log\b/,
    /\bwins?\b/,
    /\bnotes?\b/,
    /\bprojects?\b/,
    /\bskills?\b/,
    /\bimpact\b/,
  ].filter((pattern) => pattern.test(normalized)).length;
  if (
    bulletLines.length >= 3 &&
    resumeSectionHits < 2 &&
    !hasLetterGreeting &&
    (careerNoteSignals >= 1 || bulletLines.length / rawLines.length >= 0.6)
  ) {
    return "career_notes";
  }

  return null;
}

/**
 * Classify a document using LLM with filename fallback.
 * Tries LLM first, falls back to filename heuristics on failure.
 */
export async function classifyDocument(
  text: string | undefined,
  filename: string,
  llmConfig: LLMConfig | null,
): Promise<DocumentType> {
  // Try LLM classification if text and config are available
  if (text && llmConfig) {
    try {
      return await classifyDocumentWithLLM(text, llmConfig);
    } catch (error) {
      console.error(
        "LLM classification failed, falling back to filename:",
        error,
      );
    }
  }

  if (text) {
    const contentType = classifyDocumentByContent(text);
    if (contentType) return contentType;
  }

  return classifyDocumentByFilename(filename);
}
