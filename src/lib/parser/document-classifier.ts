import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type { LLMConfig, DocumentType } from "@/types";

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "resume",
  "cover_letter",
  "reference_letter",
  "certificate",
  "portfolio",
  "other",
];

const CLASSIFICATION_PROMPT = `You are a document classifier. Based on the text below, classify this document into exactly one of these categories:
- resume: A CV or resume listing work experience, education, and skills
- cover_letter: A letter addressed to an employer expressing interest in a position
- reference_letter: A letter from a referee endorsing or recommending someone
- certificate: A certification, diploma, or credential document
- portfolio: A portfolio or collection of work samples
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
  llmConfig: LLMConfig
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

  return "other";
}

/**
 * Classify a document using LLM with filename fallback.
 * Tries LLM first, falls back to filename heuristics on failure.
 */
export async function classifyDocument(
  text: string | undefined,
  filename: string,
  llmConfig: LLMConfig | null
): Promise<DocumentType> {
  // Try LLM classification if text and config are available
  if (text && llmConfig) {
    try {
      return await classifyDocumentWithLLM(text, llmConfig);
    } catch (error) {
      console.error("LLM classification failed, falling back to filename:", error);
    }
  }

  return classifyDocumentByFilename(filename);
}
