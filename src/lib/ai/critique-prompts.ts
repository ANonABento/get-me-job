import { z } from "zod";
import { parseJSONFromLLM } from "@/lib/llm/client";

export const COVER_LETTER_CRITIQUE_AXES = [
  { key: "fit", label: "Company fit" },
  { key: "specificity", label: "Specificity" },
  { key: "hook", label: "Hook" },
  { key: "ask", label: "Ask / close" },
] as const satisfies ReadonlyArray<{ key: string; label: string }>;

export type CoverLetterCritiqueAxis =
  (typeof COVER_LETTER_CRITIQUE_AXES)[number]["key"];

export const coverLetterCritiqueSuggestionSchema = z.object({
  range_in_letter: z.string().min(1),
  suggestion: z.string().min(1),
  why: z.string().min(1),
});

export const coverLetterCritiqueSchema = z.object({
  scores: z.object({
    fit: z.number().min(0).max(10),
    specificity: z.number().min(0).max(10),
    hook: z.number().min(0).max(10),
    ask: z.number().min(0).max(10),
  }),
  overall: z.number().min(0).max(10),
  rationale_per_axis: z.object({
    fit: z.string().min(1),
    specificity: z.string().min(1),
    hook: z.string().min(1),
    ask: z.string().min(1),
  }),
  suggested_rewrites: z.array(coverLetterCritiqueSuggestionSchema).min(2),
});

export type CoverLetterCritique = z.infer<typeof coverLetterCritiqueSchema>;

export interface CoverLetterCritiqueInput {
  letter: string;
  jd: string;
  company?: string;
  role?: string;
}

export function buildCoverLetterCritiqueSystemPrompt(): string {
  return `You are an exacting cover-letter editor for job applications.

Score the draft on four axes from 0 to 10:
- Company fit: specific knowledge of this company, not generic praise.
- Specificity: concrete examples, metrics, named systems, and clear scope instead of vague claims.
- Hook: the opening is compelling within the first two sentences.
- Ask / close: the final paragraph has a clear next step or call to action.

Return only valid JSON with this shape:
{
  "scores": { "fit": number, "specificity": number, "hook": number, "ask": number },
  "overall": number,
  "rationale_per_axis": { "fit": string, "specificity": string, "hook": string, "ask": string },
  "suggested_rewrites": [
    { "range_in_letter": string, "suggestion": string, "why": string }
  ]
}

Rules:
- Include at least two suggested_rewrites.
- range_in_letter must be an exact contiguous excerpt copied from the draft.
- suggestion must be replacement text for that exact excerpt.
- Do not invent candidate achievements or company facts.
- Do not include markdown or commentary outside the JSON.`;
}

export function buildCoverLetterCritiqueUserPrompt({
  letter,
  jd,
  company,
  role,
}: CoverLetterCritiqueInput): string {
  return `Company: ${company?.trim() || "Not specified"}
Role: ${role?.trim() || "Not specified"}

Job description:
${jd.trim()}

Cover letter draft:
${letter.trim()}`;
}

export function buildCoverLetterCritiqueMessages(
  input: CoverLetterCritiqueInput,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    { role: "system", content: buildCoverLetterCritiqueSystemPrompt() },
    { role: "user", content: buildCoverLetterCritiqueUserPrompt(input) },
  ];
}

export function parseCoverLetterCritiqueResponse(
  response: string,
): CoverLetterCritique {
  return coverLetterCritiqueSchema.parse(parseJSONFromLLM<unknown>(response));
}
