import type { TailoredResume } from "@/lib/resume/generator";
import type { AtsStrictness } from "./settings";

const DECORATIVE_MARKS = /[•◦·→]/g;
const DASHES = /[–—]/g;

export function getAtsStrictnessGuidance(strictness: AtsStrictness): string {
  if (strictness === "loose") {
    return "ATS strictness: loose. Keep expressive but professional wording while preserving source-backed facts.";
  }

  if (strictness === "strict") {
    return [
      "ATS strictness: strict.",
      "Prefer plain, keyword-forward phrasing.",
      "Avoid decorative punctuation, icons, tables, columns, and unsupported stylistic flourishes.",
      "Keep skills as simple keyword labels and keep highlights concise.",
    ].join(" ");
  }

  return [
    "ATS strictness: balanced.",
    "Use readable, recruiter-friendly phrasing with standard resume formatting.",
    "Avoid decorative punctuation and keep unsupported claims out.",
  ].join(" ");
}

export function applyAtsStrictnessToResume(
  resume: TailoredResume,
  strictness: AtsStrictness,
): TailoredResume {
  if (strictness === "loose") return resume;

  const strict = strictness === "strict";
  const normalize = (value: string) => normalizeAtsText(value, strict);

  return {
    ...resume,
    summary: normalize(resume.summary),
    experiences: resume.experiences.map((experience) => ({
      ...experience,
      highlights: experience.highlights
        .map(normalize)
        .filter(Boolean)
        .slice(0, strict ? 4 : experience.highlights.length),
    })),
    skills: resume.skills
      .map(normalize)
      .filter(Boolean)
      .slice(0, strict ? 18 : 25),
  };
}

function normalizeAtsText(value: string, strict: boolean): string {
  const normalized = value
    .replace(DASHES, "-")
    .replace(DECORATIVE_MARKS, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!strict) return normalized;

  return normalized.replace(/[^\x20-\x7E]/g, "");
}
