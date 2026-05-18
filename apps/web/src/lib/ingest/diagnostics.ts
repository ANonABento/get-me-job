import type { DocumentSourceMap, ParsedResumeV2Result } from "./types";
import { resolveSourceSpanIds } from "./source-spans";

export interface ParserV2Diagnostic {
  lineCount: number;
  parsedRoots: {
    education: number;
    experiences: number;
    projects: number;
    skills: number;
  };
  missingRootSourceSpans: string[];
  missingBulletSourceSpans: string[];
  partialRootSourceSpans: string[];
  partialBulletSourceSpans: string[];
}

export function createParserV2Diagnostic(
  sourceMap: DocumentSourceMap,
  parsed: ParsedResumeV2Result,
): ParserV2Diagnostic {
  const missingRootSourceSpans: string[] = [];
  const missingBulletSourceSpans: string[] = [];
  const partialRootSourceSpans: string[] = [];
  const partialBulletSourceSpans: string[] = [];

  for (const root of [
    ...parsed.profile.education,
    ...parsed.profile.experiences,
    ...parsed.profile.projects,
  ]) {
    const resolved = resolveSourceSpanIds(sourceMap, root.sourceSpanIds);
    if (resolved.sourceQuality === "missing") {
      missingRootSourceSpans.push(root.id);
    } else if (resolved.sourceQuality === "partial") {
      partialRootSourceSpans.push(root.id);
    }
  }

  for (const root of [
    ...parsed.profile.experiences,
    ...parsed.profile.projects,
  ]) {
    for (const [index, bullet] of root.highlights.entries()) {
      const resolved = resolveSourceSpanIds(sourceMap, bullet.sourceSpanIds);
      if (resolved.sourceQuality === "missing") {
        missingBulletSourceSpans.push(`${root.id}:${index}`);
      } else if (resolved.sourceQuality === "partial") {
        partialBulletSourceSpans.push(`${root.id}:${index}`);
      }
    }
  }

  return {
    lineCount: sourceMap.lines.length,
    parsedRoots: {
      education: parsed.profile.education.length,
      experiences: parsed.profile.experiences.length,
      projects: parsed.profile.projects.length,
      skills: parsed.profile.skills.length,
    },
    missingRootSourceSpans,
    missingBulletSourceSpans,
    partialRootSourceSpans,
    partialBulletSourceSpans,
  };
}
