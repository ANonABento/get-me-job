import type { BankEntry } from "@/types";
import type { FieldDef } from "./chunk-card.types";

export function getEntryTitle(entry: BankEntry): string {
  const c = entry.content;
  switch (entry.category) {
    case "experience":
      return [c.title, c.company].filter(Boolean).join(" at ") || "Experience";
    case "education":
      return [c.degree, c.institution].filter(Boolean).join(" — ") || "Education";
    case "skill":
      return (c.name as string) || "Skill";
    case "project":
      return (c.name as string) || "Project";
    case "hackathon":
      return (c.name as string) || "Hackathon";
    case "certification":
      return [c.name, c.issuer].filter(Boolean).join(" — ") || "Certification";
    case "achievement":
      return (c.description as string)?.slice(0, 80) || "Achievement";
    default:
      return "Entry";
  }
}

export function getDateRange(content: Record<string, unknown>): string {
  const parts: string[] = [];
  if (content.startDate) parts.push(String(content.startDate));
  if (content.endDate) parts.push(String(content.endDate));
  else if (content.current) parts.push("Present");
  return parts.join(" — ");
}

export function getHighlights(content: Record<string, unknown>, max: number): string[] {
  if (!Array.isArray(content.highlights)) return [];
  return content.highlights.slice(0, max).map(String);
}

export function getTechnologies(content: Record<string, unknown>): string[] {
  if (!Array.isArray(content.technologies)) return [];
  return content.technologies.map(String);
}

export function getStringList(
  content: Record<string, unknown>,
  key: string
): string[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function getHackathonTeamSize(content: Record<string, unknown>): string {
  const min = content.teamSizeMin ? String(content.teamSizeMin).trim() : "";
  const max = content.teamSizeMax ? String(content.teamSizeMax).trim() : "";

  if (min && max && min === max) return `${min} person`;
  if (min && max) return `${min}-${max} people`;
  if (min) return `${min}+ people`;
  if (max) return `Up to ${max} people`;
  return "";
}

export function listToText(value: unknown): string {
  if (Array.isArray(value)) return value.join("\n");
  return "";
}

export function textToList(text: string): string[] {
  return text.split("\n");
}

export function cleanContent(
  content: Record<string, unknown>,
  fields: FieldDef[]
): Record<string, unknown> {
  const cleaned = { ...content };
  for (const field of fields) {
    if (field.type === "list" && Array.isArray(cleaned[field.key])) {
      cleaned[field.key] = (cleaned[field.key] as string[])
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (field.type === "text" && typeof cleaned[field.key] === "string") {
      cleaned[field.key] = (cleaned[field.key] as string).trim();
    }
  }
  for (const [key, val] of Object.entries(cleaned)) {
    if (val === "") delete cleaned[key];
  }
  return cleaned;
}
