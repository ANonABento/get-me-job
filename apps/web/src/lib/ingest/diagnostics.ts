import type { DocumentSourceMap, ParsedResumeV2Result } from "./types";
import { resolveSourceSpanIds } from "./source-spans";

export interface ParserV2SourceRef {
  componentId: string;
  category:
    | "contact"
    | "paragraph"
    | "education"
    | "experience"
    | "project"
    | "skill"
    | "bullet";
  sourceSpanIds: string[];
  sourceQuality: "exact" | "partial" | "missing";
  parentId?: string;
  sourceText: string[];
}

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

export function isParsedResumeV2Result(
  value: unknown,
): value is ParsedResumeV2Result {
  return (
    typeof value === "object" &&
    value !== null &&
    "profile" in value &&
    typeof (value as ParsedResumeV2Result).profile === "object"
  );
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

function sourceTextForIds(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
): string[] {
  return resolveSourceSpanIds(sourceMap, sourceSpanIds).spans.map(
    (span) => span.text,
  );
}

export function createParserV2SourceRefs(
  sourceMap: DocumentSourceMap,
  parsed: ParsedResumeV2Result,
): ParserV2SourceRef[] {
  const refs: ParserV2SourceRef[] = [];
  const pushRef = (
    input: Omit<ParserV2SourceRef, "sourceText">,
  ): void => {
    refs.push({
      ...input,
      sourceText: sourceTextForIds(sourceMap, input.sourceSpanIds),
    });
  };

  pushRef({
    componentId: "contact",
    category: "contact",
    sourceSpanIds: parsed.profile.contact.sourceSpanIds,
    sourceQuality: parsed.profile.contact.sourceQuality,
  });

  if (parsed.profile.summary) {
    pushRef({
      componentId: "summary",
      category: "paragraph",
      sourceSpanIds: parsed.profile.summary.sourceSpanIds,
      sourceQuality: parsed.profile.summary.sourceQuality,
    });
  }

  for (const education of parsed.profile.education) {
    pushRef({
      componentId: education.id,
      category: "education",
      sourceSpanIds: education.sourceSpanIds,
      sourceQuality: education.sourceQuality,
    });
  }

  for (const skill of parsed.profile.skills) {
    pushRef({
      componentId: skill.id,
      category: "skill",
      sourceSpanIds: skill.sourceSpanIds,
      sourceQuality: skill.sourceQuality,
    });
  }

  for (const experience of parsed.profile.experiences) {
    pushRef({
      componentId: experience.id,
      category: "experience",
      sourceSpanIds: experience.sourceSpanIds,
      sourceQuality: experience.sourceQuality,
    });
    experience.highlights.forEach((highlight, index) => {
      pushRef({
        componentId: `${experience.id}:highlight:${index}`,
        category: "bullet",
        parentId: experience.id,
        sourceSpanIds: highlight.sourceSpanIds,
        sourceQuality: highlight.sourceQuality,
      });
    });
  }

  for (const project of parsed.profile.projects) {
    pushRef({
      componentId: project.id,
      category: "project",
      sourceSpanIds: project.sourceSpanIds,
      sourceQuality: project.sourceQuality,
    });
    project.highlights.forEach((highlight, index) => {
      pushRef({
        componentId: `${project.id}:highlight:${index}`,
        category: "bullet",
        parentId: project.id,
        sourceSpanIds: highlight.sourceSpanIds,
        sourceQuality: highlight.sourceQuality,
      });
    });
  }

  return refs;
}
