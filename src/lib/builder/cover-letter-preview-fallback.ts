import type { BankEntry } from "@/types";
import { generateCoverLetterHTML } from "@/lib/resume/pdf";

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function getEntryLabel(entry: BankEntry): string {
  const content = entry.content;
  const title = stringifyValue(content.title);
  const company = stringifyValue(content.company);
  const name = stringifyValue(content.name);
  const degree = stringifyValue(content.degree);
  const institution = stringifyValue(content.institution);
  const description = stringifyValue(content.description);

  if (title && company) return `${title} at ${company}`;
  if (title) return title;
  if (name) return name;
  if (degree && institution) return `${degree} at ${institution}`;
  if (institution) return institution;
  if (description) return description;

  return entry.category;
}

function getEntryHighlights(entry: BankEntry): string[] {
  const highlights = entry.content.highlights;
  if (!Array.isArray(highlights)) return [];

  return highlights
    .map(stringifyValue)
    .filter(Boolean)
    .slice(0, 2);
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildCoverLetterPreviewContent(entries: BankEntry[]): string {
  const labels = entries.map(getEntryLabel).filter(Boolean).slice(0, 4);
  const highlights = entries.flatMap(getEntryHighlights).slice(0, 4);
  const focus = formatList(labels);
  const proof = formatList(highlights);

  return [
    "Dear Hiring Team,",
    focus
      ? `I am excited to apply for this role and bring experience across ${focus}.`
      : "I am excited to apply for this role and share the experience I have built across my work.",
    proof
      ? `A few strengths I would bring include ${proof}.`
      : "I would bring a practical mix of execution, communication, and follow-through to the team.",
    "Thank you for your consideration. I would welcome the opportunity to discuss how my background can support your hiring goals.",
    "Sincerely,\nYour Name",
  ].join("\n\n");
}

export function generateCoverLetterPreviewFallbackHTML(
  entries: BankEntry[],
  templateId: string
): string {
  if (entries.length === 0) return "";

  return generateCoverLetterHTML({
    content: buildCoverLetterPreviewContent(entries),
    templateId,
    candidateName: "Your Name",
  });
}
