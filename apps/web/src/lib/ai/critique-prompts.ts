import { z } from "zod";
import { parseJSONFromLLM } from "@/lib/llm/json";
import { detectGenericPhrases, genericPhrasePenalty } from "./prompt-quality";

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
- Each rationale_per_axis value must cite at least one exact excerpt from the draft when explaining a weakness or score.
- For low-specificity, generic-language, or weak-hook issues, cite the exact draft excerpt that caused the concern; do not paraphrase it.
- suggested_rewrites must target exact excerpts from the draft and explain why the replacement preserves evidence.
- Generic phrase-heavy drafts using phrases like "passionate about", "excited about this opportunity", "perfect fit", "contribute effectively", "fast-paced environment", "dynamic team", or "strong background" should receive lower specificity and hook scores.
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

export function applyGenericPhrasePenaltyToCritique(
  critique: CoverLetterCritique,
  letter: string,
): CoverLetterCritique {
  const penalty = genericPhrasePenalty(letter);
  const genericPhrases = detectGenericPhrases(letter);
  if (penalty === 0 || genericPhrases.length === 0) {
    return critique;
  }

  const phraseList = genericPhrases.map((phrase) => `"${phrase}"`).join(", ");
  const note = ` Generic phrase check found exact draft phrase(s): ${phraseList}.`;
  const scores = {
    ...critique.scores,
    specificity: Math.max(0, critique.scores.specificity - penalty),
    hook: Math.max(0, critique.scores.hook - penalty),
  };

  return {
    ...critique,
    scores,
    overall: Number(
      (
        (scores.fit + scores.specificity + scores.hook + scores.ask) /
        4
      ).toFixed(1),
    ),
    rationale_per_axis: {
      ...critique.rationale_per_axis,
      specificity: `${critique.rationale_per_axis.specificity}${note}`,
      hook: `${critique.rationale_per_axis.hook}${note}`,
    },
  };
}
