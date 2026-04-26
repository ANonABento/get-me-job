import { LLMClient } from "@/lib/llm/client";
import type { LLMConfig } from "@/types";

export const DOCUMENT_ASSISTANT_ACTIONS = [
  "rewrite",
  "make-concise",
  "add-metrics",
  "match-jd-keywords",
] as const;

export type DocumentAssistantAction =
  (typeof DOCUMENT_ASSISTANT_ACTIONS)[number];

export interface SelectionRange {
  start: number;
  end: number;
}

export interface NormalizedSelection extends SelectionRange {
  text: string;
}

export interface DiffLine {
  type: "removed" | "added" | "unchanged";
  value: string;
}

export const DOCUMENT_ASSISTANT_ACTION_LABELS: Record<
  DocumentAssistantAction,
  string
> = {
  rewrite: "Rewrite",
  "make-concise": "Make concise",
  "add-metrics": "Add metrics",
  "match-jd-keywords": "Match JD keywords",
};

const DOCUMENT_ASSISTANT_INSTRUCTIONS: Record<DocumentAssistantAction, string> =
  {
    rewrite:
      "Rewrite the selected text to be clearer, more specific, and more compelling while preserving the original meaning.",
    "make-concise":
      "Make the selected text more concise. Remove filler and keep the strongest details.",
    "add-metrics":
      "Rewrite the selected text to include credible, quantified impact where the source supports it. Do not invent exact numbers; use measured language when numbers are not provided.",
    "match-jd-keywords":
      "Rewrite the selected text to naturally align with relevant keywords and responsibilities from the job description.",
  };

export function isDocumentAssistantAction(
  value: unknown
): value is DocumentAssistantAction {
  return (
    typeof value === "string" &&
    DOCUMENT_ASSISTANT_ACTIONS.includes(value as DocumentAssistantAction)
  );
}

export function normalizeSelection(
  content: string,
  range: SelectionRange | null
): NormalizedSelection | null {
  if (!range) return null;

  const start = Math.max(0, Math.min(range.start, content.length));
  const end = Math.max(0, Math.min(range.end, content.length));
  if (end <= start) return null;

  return {
    start,
    end,
    text: content.slice(start, end),
  };
}

export function applySelectionRewrite(
  content: string,
  range: SelectionRange,
  replacement: string
): string {
  const selection = normalizeSelection(content, range);
  if (!selection) return content;

  return (
    content.slice(0, selection.start) +
    replacement.trim() +
    content.slice(selection.end)
  );
}

export function buildSimpleDiff(before: string, after: string): DiffLine[] {
  if (before === after) return [{ type: "unchanged", value: before }];

  return [
    { type: "removed", value: before },
    { type: "added", value: after },
  ];
}

export function getDocumentSuggestions(
  documentContent: string,
  jobDescription: string
): string[] {
  const content = documentContent.trim();
  if (!content) {
    return ["Generate or paste document content to get assistant suggestions."];
  }

  const suggestions: string[] = [];
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasMetric = /\b\d+([.,]\d+)?\s*(%|x|k|m|million|billion|\+)?\b/i.test(
    content
  );

  if (wordCount > 350) {
    suggestions.push("Select a long paragraph and make it more concise.");
  } else {
    suggestions.push("Select a key paragraph and rewrite it with stronger verbs.");
  }

  if (!hasMetric) {
    suggestions.push("Select an impact statement and add measurable outcomes.");
  }

  if (jobDescription.trim().length > 0) {
    suggestions.push("Select relevant experience and match JD keywords.");
  }

  if (suggestions.length < 3) {
    suggestions.push("Select the opening paragraph and sharpen the positioning.");
  }

  return suggestions.slice(0, 3);
}

export function buildDocumentRewritePrompt({
  action,
  selectedText,
  documentContent,
  jobDescription,
}: {
  action: DocumentAssistantAction;
  selectedText: string;
  documentContent: string;
  jobDescription?: string;
}): string {
  return `Task: ${DOCUMENT_ASSISTANT_INSTRUCTIONS[action]}

Selected text:
${selectedText}

Full document context:
${documentContent}

${jobDescription ? `Job description:\n${jobDescription}\n` : ""}
Return only the replacement text for the selected text. Do not include markdown, labels, quotes, or commentary.`;
}

export async function rewriteDocumentSelection(
  options: {
    action: DocumentAssistantAction;
    selectedText: string;
    documentContent: string;
    jobDescription?: string;
  },
  llmConfig: LLMConfig
): Promise<string> {
  const client = new LLMClient(llmConfig);
  const result = await client.complete({
    messages: [
      {
        role: "system",
        content:
          "You are an expert job-search writing assistant. Rewrite only the selected document text and preserve the candidate's facts.",
      },
      {
        role: "user",
        content: buildDocumentRewritePrompt(options),
      },
    ],
    temperature: 0.4,
    maxTokens: 700,
  });

  return result.trim();
}
