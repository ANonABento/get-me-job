import type { TailoredResume } from "@/lib/resume/generator";
import type { GapItem } from "@/lib/tailor/analyze";
import type { TailorAnalysisResponse } from "@/types/api";

export type TailorAction = "analyze" | "generate" | "render";

export type TailoredResumeAnalysisResult = TailorAnalysisResponse["analysis"];

export interface TailoredResumeGenerateResult {
  success: true;
  html: string;
  resume: TailoredResume;
  analysis: TailoredResumeAnalysisResult;
}

export interface TailoredResumeRenderResult {
  success: true;
  html: string;
}

export interface TailoredResumeInput {
  jobDescription: string;
  jobTitle: string;
  company: string;
}

export function isTailorAction(value: unknown): value is TailorAction {
  return value === "analyze" || value === "generate" || value === "render";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isResumeExperience(value: unknown): value is TailoredResume["experiences"][number] {
  return (
    isRecord(value) &&
    typeof value.company === "string" &&
    typeof value.title === "string" &&
    typeof value.dates === "string" &&
    isStringArray(value.highlights)
  );
}

function isResumeEducation(value: unknown): value is TailoredResume["education"][number] {
  return (
    isRecord(value) &&
    typeof value.institution === "string" &&
    typeof value.degree === "string" &&
    typeof value.field === "string" &&
    typeof value.date === "string"
  );
}

export function isTailoredResume(value: unknown): value is TailoredResume {
  return (
    isRecord(value) &&
    isRecord(value.contact) &&
    typeof value.contact.name === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.experiences) &&
    value.experiences.every(isResumeExperience) &&
    isStringArray(value.skills) &&
    Array.isArray(value.education) &&
    value.education.every(isResumeEducation)
  );
}

function isGapItem(value: unknown): value is GapItem {
  return (
    isRecord(value) &&
    typeof value.requirement === "string" &&
    typeof value.suggestion === "string" &&
    (value.category === "skill" ||
      value.category === "experience" ||
      value.category === "education" ||
      value.category === "certification" ||
      value.category === "other")
  );
}

export function isTailoredResumeAnalysisResult(
  value: unknown
): value is TailoredResumeAnalysisResult {
  return (
    isRecord(value) &&
    typeof value.matchScore === "number" &&
    isStringArray(value.keywordsFound) &&
    isStringArray(value.keywordsMissing) &&
    Array.isArray(value.gaps) &&
    value.gaps.every(isGapItem) &&
    typeof value.matchedEntriesCount === "number"
  );
}

export function isTailoredResumeGenerateResult(
  value: unknown
): value is TailoredResumeGenerateResult {
  return (
    isRecord(value) &&
    value.success === true &&
    typeof value.html === "string" &&
    isTailoredResume(value.resume) &&
    isTailoredResumeAnalysisResult(value.analysis)
  );
}

export function isTailoredResumeRenderResult(
  value: unknown
): value is TailoredResumeRenderResult {
  return (
    isRecord(value) && value.success === true && typeof value.html === "string"
  );
}

export async function readUnknownJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
