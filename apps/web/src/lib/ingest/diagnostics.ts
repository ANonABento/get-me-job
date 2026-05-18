import type { DocumentSourceMap, ParsedResumeV2Result } from "./types";

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
}

export function createParserV2Diagnostic(
  sourceMap: DocumentSourceMap,
  parsed: ParsedResumeV2Result,
): ParserV2Diagnostic {
  const lineIds = new Set(sourceMap.lines.map((line) => line.id));
  const missingRootSourceSpans: string[] = [];
  const missingBulletSourceSpans: string[] = [];

  for (const root of [
    ...parsed.profile.education,
    ...parsed.profile.experiences,
    ...parsed.profile.projects,
  ]) {
    if (
      root.sourceSpanIds.length === 0 ||
      root.sourceSpanIds.some((id) => !lineIds.has(id))
    ) {
      missingRootSourceSpans.push(root.id);
    }
  }

  for (const root of [
    ...parsed.profile.experiences,
    ...parsed.profile.projects,
  ]) {
    for (const [index, bullet] of root.highlights.entries()) {
      if (
        bullet.sourceSpanIds.length === 0 ||
        bullet.sourceSpanIds.some((id) => !lineIds.has(id))
      ) {
        missingBulletSourceSpans.push(`${root.id}:${index}`);
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
  };
}
