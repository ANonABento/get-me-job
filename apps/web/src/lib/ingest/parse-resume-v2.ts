import { createHash } from "node:crypto";

import {
  extractContact,
  extractDateRange,
  extractSkills,
  hasDateRange,
  parseDegreeAndField,
  splitDateRange,
} from "@/lib/parser/field-extractor";
import type {
  DocumentSourceMap,
  ParsedEducationV2,
  ParsedExperienceV2,
  ParsedProjectV2,
  ParsedResumeV2Result,
  ParsedSkillV2,
  SourceLine,
  SourceQuality,
} from "./types";
import { sourceQualityForSpanIds } from "./source-spans";

type SectionName =
  | "contact"
  | "education"
  | "experience"
  | "projects"
  | "skills";

interface LineParts {
  left: string;
  right: string;
}

const SECTION_PATTERNS: Array<{
  type: Exclude<SectionName, "contact">;
  pattern: RegExp;
}> = [
  { type: "education", pattern: /^education$/i },
  { type: "experience", pattern: /^experience$/i },
  { type: "projects", pattern: /^projects$/i },
  { type: "skills", pattern: /^(technical\s+skills|skills)$/i },
];

function stableId(
  prefix: string,
  sourceSpanIds: string[],
  text: string,
): string {
  const digest = createHash("sha1")
    .update(`${prefix}:${sourceSpanIds.join(",")}:${text}`)
    .digest("hex")
    .slice(0, 12);
  return `${prefix}_${digest}`;
}

function normalizeText(text: string): string {
  return text.replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
}

function textWithoutBullet(text: string): string {
  return text.replace(/^[•●○◦■▪▸→✓\-–—*]\s*/, "").trim();
}

function isBulletLine(line: SourceLine): boolean {
  return /^[•●○◦■▪▸→✓\-–—*]\s*/.test(line.text);
}

function splitPipeText(text: string): string[] {
  return normalizeText(text)
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function lineParts(line: SourceLine, rightColumnX = 400): LineParts {
  const leftTokens = line.tokens.filter(
    (token) => token.bbox.x0 < rightColumnX,
  );
  const rightTokens = line.tokens.filter(
    (token) => token.bbox.x0 >= rightColumnX,
  );
  return {
    left: joinTokenText(leftTokens.map((token) => token.text)),
    right: joinTokenText(rightTokens.map((token) => token.text)),
  };
}

function joinTokenText(tokens: string[]): string {
  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .reduce((text, token, index) => {
      if (index === 0 || !text) return token;
      if (/^[,.;:%)]/.test(token)) return `${text}${token}`;
      return `${text} ${token}`;
    }, "");
}

function sectionTypeForLine(
  line: SourceLine,
): Exclude<SectionName, "contact"> | null {
  const text = normalizeText(line.text);
  return (
    SECTION_PATTERNS.find(({ pattern }) => pattern.test(text))?.type ?? null
  );
}

function sectionLineMap(
  lines: SourceLine[],
): Map<Exclude<SectionName, "contact">, number> {
  const indexes = new Map<Exclude<SectionName, "contact">, number>();
  lines.forEach((line, index) => {
    const type = sectionTypeForLine(line);
    if (type && !indexes.has(type)) indexes.set(type, index);
  });
  return indexes;
}

function sliceSection(
  lines: SourceLine[],
  indexes: Map<Exclude<SectionName, "contact">, number>,
  type: Exclude<SectionName, "contact">,
): SourceLine[] {
  const start = indexes.get(type);
  if (start === undefined) return [];
  const nextStart = [...indexes.values()]
    .filter((index) => index > start)
    .sort((a, b) => a - b)[0];
  return lines.slice(start + 1, nextStart ?? lines.length);
}

function parseContact(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
  firstSectionIndex: number,
): ParsedResumeV2Result["profile"]["contact"] {
  const contactLines = lines
    .slice(0, firstSectionIndex)
    .filter((line) => line.text);
  const text = contactLines.map((line) => line.text).join("\n");
  const { contact } = extractContact(text);
  const sourceSpanIds = contactLines.map((line) => line.id);
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone?.trim(),
    location: contact.location,
    linkedin: contact.linkedin,
    github: contact.github,
    website: contact.website,
    confidence: contact.confidence,
    sourceSpanIds,
    sourceQuality: sourceQualityForSpanIds(sourceMap, sourceSpanIds),
  };
}

function parseEducationDegreeAndField(line: string): {
  degree: string;
  field: string;
} {
  const normalized = normalizeText(line);
  const longWithIn = normalized.match(
    /^((?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?|Doctor(?:ate)?)\s+of\s+.+?)\s+in\s+(.+)$/i,
  );
  if (longWithIn) {
    return {
      degree: longWithIn[1].trim(),
      field: longWithIn[2].trim(),
    };
  }

  const shortWithIn = normalized.match(
    /^((?:Associate(?:'s)?|Bachelor(?:'s)?|Master(?:'s)?|Ph\.?D\.?|B\.S\.?|B\.A\.?|M\.S\.?|M\.A\.?|MBA|M\.Eng\.?|B\.Eng\.?))\s+in\s+(.+)$/i,
  );
  if (shortWithIn) {
    return {
      degree: shortWithIn[1].trim(),
      field: shortWithIn[2].trim(),
    };
  }

  return parseDegreeAndField(normalized);
}

const SINGLE_DATE_REGEX =
  /\b(?:Expected\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(?:\d{4}|\d{2}X{2})\b/i;

function extractDateText(text: string): string {
  return extractDateRange(text) || text.match(SINGLE_DATE_REGEX)?.[0] || "";
}

function splitDateText(dateText: string): {
  start: string;
  end: string;
} {
  if (!dateText) return { start: "", end: "" };
  if (hasDateRange(dateText)) return splitDateRange(dateText);
  return { start: "", end: dateText.trim() };
}

function stripDateText(text: string, dateText: string): string {
  return normalizeText(text.replace(dateText, "").replace(/\s*\|\s*$/, ""));
}

function appendContinuation(
  value: {
    text: string;
    sourceSpanIds: string[];
    sourceQuality: SourceQuality;
  },
  line: SourceLine,
  sourceMap: DocumentSourceMap,
) {
  value.text = normalizeText(`${value.text} ${line.text}`);
  value.sourceSpanIds.push(line.id);
  value.sourceQuality = sourceQuality(sourceMap, value.sourceSpanIds);
}

function sourceQuality(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
): SourceQuality {
  return sourceQualityForSpanIds(sourceMap, sourceSpanIds);
}

function parseEducation(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
): ParsedEducationV2[] {
  const education: ParsedEducationV2[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const schoolLine = lines[i];
    const degreeLine = lines[i + 1];
    if (!schoolLine || !degreeLine) continue;

    const schoolParts = lineParts(schoolLine);
    const degreeParts = lineParts(degreeLine);
    const schoolSegments = splitPipeText(schoolLine.text);
    const degreeSegments = splitPipeText(degreeLine.text);
    const dateText =
      extractDateText(degreeParts.right) ||
      extractDateText(degreeLine.text) ||
      extractDateText(schoolParts.right) ||
      extractDateText(schoolLine.text);
    if (!dateText) continue;

    const { start, end } = splitDateText(dateText);
    const degreeText = stripDateText(
      degreeParts.left || degreeSegments[0] || degreeLine.text,
      dateText,
    );
    const { degree, field } = parseEducationDegreeAndField(degreeText);
    const sourceSpanIds = [schoolLine.id, degreeLine.id];
    const institution = stripDateText(
      schoolParts.left || schoolSegments[0] || schoolLine.text,
      dateText,
    );
    const location =
      schoolParts.right && !extractDateText(schoolParts.right)
        ? schoolParts.right
        : degreeParts.right && !extractDateText(degreeParts.right)
          ? degreeParts.right
          : degreeSegments
              .slice(1)
              .find((segment) => !extractDateText(segment));

    education.push({
      id: stableId("edu", sourceSpanIds, `${institution}:${degree}`),
      institution,
      location: location || undefined,
      degree,
      field,
      startDate: start || undefined,
      endDate: end || undefined,
      highlights: [],
      sourceSpanIds,
      sourceQuality: sourceQuality(sourceMap, sourceSpanIds),
    });
    i += 1;
  }
  return education;
}

function parseGroundedBullets(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
  startIndex: number,
): {
  highlights: Array<{
    text: string;
    sourceSpanIds: string[];
    sourceQuality: SourceQuality;
  }>;
  nextIndex: number;
} {
  const highlights: Array<{
    text: string;
    sourceSpanIds: string[];
    sourceQuality: SourceQuality;
  }> = [];
  let index = startIndex;

  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line?.text) continue;
    if (hasDateRange(line.text)) break;

    if (isBulletLine(line)) {
      const bullet = textWithoutBullet(line.text);
      if (bullet) {
        highlights.push({
          text: bullet,
          sourceSpanIds: [line.id],
          sourceQuality: sourceQuality(sourceMap, [line.id]),
        });
      }
      continue;
    }

    const current = highlights[highlights.length - 1];
    if (current) appendContinuation(current, line, sourceMap);
  }

  return { highlights, nextIndex: index };
}

function looksLikeTitle(text: string): boolean {
  return /\b(?:Engineer|Developer|Manager|Director|Analyst|Designer|Lead|Intern|Specialist|Research|Assistant|Scientist|Consultant|Architect|Support)\b/i.test(
    text,
  );
}

function parseExperiences(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
): ParsedExperienceV2[] {
  const experiences: ParsedExperienceV2[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line?.text) continue;

    if (!hasDateRange(line.text)) continue;

    const headerParts = lineParts(line);
    const companyLine = lines[i + 1];
    const companyParts = companyLine
      ? lineParts(companyLine)
      : { left: "", right: "" };
    const dateText = extractDateRange(headerParts.right || line.text);
    const { start, end } = splitDateRange(dateText);
    const sourceSpanIds = companyLine ? [line.id, companyLine.id] : [line.id];
    const headerLeft = normalizeText(
      headerParts.left || line.text.replace(dateText, ""),
    );
    const detailLeft = normalizeText(companyParts.left || "");
    const headerLooksLikeTitle = looksLikeTitle(headerLeft);
    const detailLooksLikeTitle = looksLikeTitle(detailLeft);
    const title =
      !headerLooksLikeTitle && detailLooksLikeTitle ? detailLeft : headerLeft;
    const company =
      !headerLooksLikeTitle && detailLooksLikeTitle ? headerLeft : detailLeft;
    const location = normalizeText(companyParts.right || "");
    const { highlights, nextIndex } = parseGroundedBullets(
      sourceMap,
      lines,
      companyLine && !hasDateRange(companyLine.text) ? i + 2 : i + 1,
    );

    experiences.push({
      id: stableId("exp", sourceSpanIds, `${title}:${company}`),
      company: company || "Unknown",
      title,
      location: location || undefined,
      startDate: start,
      endDate: end,
      current: /present|current/i.test(dateText),
      description: highlights.map((highlight) => highlight.text).join("\n"),
      highlights,
      skills: [],
      sourceSpanIds,
      sourceQuality: sourceQuality(sourceMap, sourceSpanIds),
    });
    i = nextIndex - 1;
  }

  return experiences;
}

function splitTechnologies(value: string): string[] {
  return value
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjects(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
): ParsedProjectV2[] {
  const projects: ParsedProjectV2[] = [];
  let current: ParsedProjectV2 | null = null;

  function pushCurrent() {
    if (!current) return;
    current.description = current.highlights
      .map((highlight) => highlight.text)
      .join(" ");
    projects.push(current);
    current = null;
  }

  for (const line of lines) {
    if (!line.text) continue;
    if (isBulletLine(line)) {
      const bullet = textWithoutBullet(line.text);
      if (current && bullet) {
        current.highlights.push({
          text: bullet,
          sourceSpanIds: [line.id],
          sourceQuality: sourceQuality(sourceMap, [line.id]),
        });
      }
      continue;
    }

    const isProjectHeader = line.text.includes("|") || hasDateRange(line.text);
    if (current?.highlights.length && !isProjectHeader) {
      appendContinuation(
        current.highlights[current.highlights.length - 1],
        line,
        sourceMap,
      );
      continue;
    }

    if (!isProjectHeader) continue;
    pushCurrent();
    const parts = lineParts(line);
    const [namePart, technologiesPart = ""] = parts.left
      .split(/\s*\|\s*/)
      .map((part) => part.trim());
    const dateText = extractDateRange(parts.right || line.text);
    const { start, end } = splitDateText(dateText);
    current = {
      id: stableId("proj", [line.id], namePart),
      name: namePart,
      description: "",
      technologies: splitTechnologies(technologiesPart),
      highlights: [],
      startDate: start || undefined,
      endDate: end || undefined,
      sourceSpanIds: [line.id],
      sourceQuality: sourceQuality(sourceMap, [line.id]),
    };
  }

  pushCurrent();
  return projects;
}

function parseSkills(
  sourceMap: DocumentSourceMap,
  lines: SourceLine[],
): ParsedSkillV2[] {
  const skillText = lines
    .map((line) => {
      const text = normalizeText(line.text);
      return text;
    })
    .join("\n");
  return extractSkills(skillText).map((skill) => {
    const sourceLine = lines.find((line) =>
      normalizeText(line.text).includes(skill.name),
    );
    const sourceSpanIds = sourceLine ? [sourceLine.id] : [];
    return {
      id: stableId("skill", sourceSpanIds, skill.name),
      name: skill.name,
      category: skill.category,
      sourceSpanIds,
      sourceQuality: sourceQuality(sourceMap, sourceSpanIds),
    };
  });
}

function computeConfidence(result: ParsedResumeV2Result["profile"]): number {
  const scores = [
    result.contact.name ? 1 : 0,
    result.experiences.length > 0 ? 1 : 0,
    result.education.length > 0 ? 1 : 0,
    result.skills.length > 0 ? 1 : 0,
  ];
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function parseResumeV2FromSourceMap(
  sourceMap: DocumentSourceMap,
): ParsedResumeV2Result {
  const lines = sourceMap.lines.filter((line) => line.text.trim());
  const indexes = sectionLineMap(lines);
  const firstSectionIndex = Math.min(...indexes.values());
  const contact = parseContact(
    sourceMap,
    lines,
    Number.isFinite(firstSectionIndex) ? firstSectionIndex : lines.length,
  );
  const education = parseEducation(
    sourceMap,
    sliceSection(lines, indexes, "education"),
  );
  const experiences = parseExperiences(
    sourceMap,
    sliceSection(lines, indexes, "experience"),
  );
  const projects = parseProjects(
    sourceMap,
    sliceSection(lines, indexes, "projects"),
  );
  const skills = parseSkills(sourceMap, sliceSection(lines, indexes, "skills"));
  const profile = {
    contact,
    experiences,
    education,
    skills,
    projects,
    rawText: sourceMap.rawText,
  };
  const sectionsDetected = [...indexes.keys()];
  const confidence = computeConfidence(profile);
  const warnings: string[] = [];
  if (education.length === 0) warnings.push("No education detected");
  if (experiences.length === 0) warnings.push("No work experience detected");
  if (!contact.name) warnings.push("Could not detect candidate name");

  return {
    profile,
    sectionsDetected,
    confidence,
    rawText: sourceMap.rawText,
    warnings,
  };
}
