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

export interface DocumentAssistantRequestPayload {
  action: DocumentAssistantAction;
  selectedText: string;
  documentContent: string;
  jobDescription?: string;
  opportunityId?: string;
}

export interface LLMStatusResponse {
  configured: boolean;
  provider: string | null;
}

const DOCUMENT_ASSISTANT_INSTRUCTIONS: Record<DocumentAssistantAction, string> =
  {
    rewrite:
      "Rewrite the selected text to be clearer, more specific, and more compelling while preserving the original meaning.",
    "make-concise":
      "Make the selected text more concise. Remove filler and keep the strongest details.",
    "add-metrics":
      "Rewrite the selected text to include credible, quantified impact where the source supports it. Do not invent exact numbers; use measured language when numbers are not provided.",
    "match-jd-keywords":
      "Rewrite the selected text to naturally align with relevant keywords and responsibilities from the job description only when the selected text or full document provides evidence for those keywords.",
  };

export function stripDocumentHtml(content: string): string {
  return content
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLLMStatusResponse(value: unknown): LLMStatusResponse {
  if (!value || typeof value !== "object") {
    return { configured: false, provider: null };
  }

  const status = value as { configured?: unknown; provider?: unknown };
  return {
    configured: status.configured === true,
    provider: typeof status.provider === "string" ? status.provider : null,
  };
}

export function isMissingLLMSetupError(message: string): boolean {
  return /no llm provider configured|llm not configured|api key|set one up/i.test(
    message,
  );
}

export function buildDocumentAssistantRequestPayload({
  action,
  selectedText,
  documentContent,
  jobDescription,
  opportunityId,
}: DocumentAssistantRequestPayload): DocumentAssistantRequestPayload {
  const payload: DocumentAssistantRequestPayload = {
    action,
    selectedText: selectedText.trim(),
    documentContent,
  };

  const trimmedJobDescription = jobDescription?.trim();
  if (trimmedJobDescription) {
    payload.jobDescription = trimmedJobDescription;
  }

  const trimmedOpportunityId = opportunityId?.trim();
  if (trimmedOpportunityId) {
    payload.opportunityId = trimmedOpportunityId;
  }

  return payload;
}

export function isDocumentAssistantAction(
  value: unknown,
): value is DocumentAssistantAction {
  return (
    typeof value === "string" &&
    DOCUMENT_ASSISTANT_ACTIONS.includes(value as DocumentAssistantAction)
  );
}

export function normalizeSelection(
  content: string,
  range: SelectionRange | null,
): NormalizedSelection | null {
  if (!range) return null;
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end)) {
    return null;
  }

  const normalizedStart = Math.min(range.start, range.end);
  const normalizedEnd = Math.max(range.start, range.end);
  const start = Math.max(0, Math.min(normalizedStart, content.length));
  const end = Math.max(0, Math.min(normalizedEnd, content.length));
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
  replacement: string,
): string {
  const selection = normalizeSelection(content, range);
  if (!selection) return content;

  return (
    content.slice(0, selection.start) +
    replacement +
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
  jobDescription: string,
): string[] {
  const content = documentContent.trim();
  if (!content) {
    return ["Generate or paste document content to get assistant suggestions."];
  }

  const suggestions: string[] = [];
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasMetric = /\b\d+([.,]\d+)?\s*(%|x|k|m|million|billion|\+)?\b/i.test(
    content,
  );

  if (wordCount > 350) {
    suggestions.push("Select a long paragraph and make it more concise.");
  } else {
    suggestions.push(
      "Select a key paragraph and rewrite it with stronger verbs.",
    );
  }

  if (!hasMetric) {
    suggestions.push("Select an impact statement and add measurable outcomes.");
  }

  if (jobDescription.trim().length > 0) {
    suggestions.push("Select relevant experience and match JD keywords.");
  }

  if (suggestions.length < 3) {
    suggestions.push(
      "Select the opening paragraph and sharpen the positioning.",
    );
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
  const evidenceRules =
    action === "match-jd-keywords"
      ? `
Evidence and refusal rules:
- The selected text is the only replaceable scope; do not rewrite outside it
- Use the full document only as evidence context, not as text to replace
- Add job-description keywords only when the selected text or full document already supports them
- GraphQL may be added only when the selected text or full document mentions GraphQL or direct GraphQL work
- If AWS, Kubernetes, or any requested keyword is not supported by evidence, return the selected text unchanged followed by a brief parenthetical reason
- Preserve factual details including employers, job titles, dates, education, certifications, tools, metrics, and contact details
- Do not invent metrics, tools, employers, degrees, certifications, dates, responsibilities, or achievements
`
      : `
Evidence rules:
- The selected text is the only replaceable scope; do not rewrite outside it
- Preserve factual details including employers, job titles, dates, education, certifications, tools, metrics, and contact details
- Do not invent metrics, tools, employers, degrees, certifications, dates, responsibilities, or achievements
`;

  return `Task: ${DOCUMENT_ASSISTANT_INSTRUCTIONS[action]}
${evidenceRules}

Selected text:
${selectedText}

Full document context:
${documentContent}

${jobDescription ? `Job description:\n${jobDescription}\n` : ""}
Return only the replacement text for the selected text. Do not include markdown, labels, quotes, or commentary.`;
}
