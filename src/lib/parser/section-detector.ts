/**
 * Deterministic resume section detector using regex and heuristics.
 * No LLM calls — pure pattern matching.
 */

export type SectionType =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "languages"
  | "references"
  | "unknown";

export interface Section {
  type: SectionType;
  startIndex: number;
  endIndex: number;
  content: string;
}

// Header patterns for each section type (case-insensitive, line-start anchored)
const SECTION_HEADER_PATTERNS: Record<SectionType, RegExp> = {
  contact: /^(?:CONTACT\s*(?:INFO(?:RMATION)?)?|PERSONAL\s*(?:INFO(?:RMATION)?|DETAILS))$/im,
  summary:
    /^(?:SUMMARY|PROFESSIONAL\s+SUMMARY|EXECUTIVE\s+SUMMARY|OBJECTIVE|CAREER\s+OBJECTIVE|PROFILE|ABOUT\s*ME|PERSONAL\s+STATEMENT)$/im,
  experience:
    /^(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|WORK\s+HISTORY|CAREER\s+HISTORY|RELEVANT\s+EXPERIENCE)$/im,
  education:
    /^(?:EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC|EDUCATIONAL\s+BACKGROUND|DEGREES|QUALIFICATIONS)$/im,
  skills:
    /^(?:SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|COMPETENCIES|KEY\s+SKILLS|AREAS?\s+OF\s+EXPERTISE|TECHNOLOGIES|TECH\s+STACK|PROFICIENCIES)$/im,
  projects:
    /^(?:PROJECTS|PERSONAL\s+PROJECTS|SIDE\s+PROJECTS|KEY\s+PROJECTS|SELECTED\s+PROJECTS|NOTABLE\s+PROJECTS)$/im,
  certifications:
    /^(?:CERTIFICATIONS?|LICENSES?\s*(?:&|AND)?\s*CERTIFICATIONS?|CREDENTIALS?|PROFESSIONAL\s+CERTIFICATIONS?|CERTIFICATES?)$/im,
  awards:
    /^(?:AWARDS?|HONORS?\s*(?:&|AND)?\s*AWARDS?|ACHIEVEMENTS?|RECOGNITION|DISTINCTIONS?)$/im,
  languages:
    /^(?:LANGUAGES?|LANGUAGE\s+SKILLS|LANGUAGE\s+PROFICIENCY|SPOKEN\s+LANGUAGES?)$/im,
  references:
    /^(?:REFERENCES?|PROFESSIONAL\s+REFERENCES?)$/im,
  // "unknown" is a synthetic fallback type — never matched by the detector itself
  unknown: /(?!)/,
};

// Order to check section types (most specific first)
const SECTION_TYPE_ORDER: SectionType[] = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "references",
  "summary",
  "contact",
];

// Content heuristic patterns
const DATE_PATTERN =
  /(?:\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b|\b\d{1,2}\/\d{4}\b|\b\d{4}\s*[-–—]\s*(?:\d{4}|[Pp]resent|[Cc]urrent)\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|[Pp]resent|[Cc]urrent)\b)/;

const BULLET_PATTERN = /^\s*[•●○■▪▸\-–—*]\s+/;
const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/;
const PHONE_PATTERN =
  /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const URL_PATTERN =
  /(?:https?:\/\/[\w.-]+|(?:www\.)?(?:linkedin\.com|github\.com)\/[\w-]+)/i;
const DEGREE_PATTERN =
  /\b(?:Bachelor|Master|Ph\.?D|M\.?S\.?|B\.?S\.?|B\.?A\.?|M\.?A\.?|M\.?B\.?A\.?|Associate|Doctorate|Doctor\s+of)\b/i;
const SKILL_LIST_PATTERN =
  /^[\w#+.\-/]+(?:\s*[,|•]\s*[\w#+.\-/]+){2,}/;
const GPA_PATTERN = /\b(?:GPA|Grade)[\s:]*\d\.\d/i;

/**
 * Detect sections in resume text using regex header matching and content heuristics.
 * Returns sections ordered by their position in the document.
 */
export function detectSections(text: string): Section[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Step 1: Try header-based detection
  const headerSections = detectByHeaders(text);

  if (headerSections.length >= 2) {
    return fillGaps(text, headerSections);
  }

  // Step 2: Fall back to content heuristics
  const heuristicSections = detectByContentHeuristics(text);

  if (heuristicSections.length === 0) {
    return [];
  }

  return heuristicSections;
}

interface HeaderMatch {
  type: SectionType;
  lineIndex: number;
  charIndex: number;
  headerLength: number;
}

/**
 * Find section boundaries by matching header lines.
 */
function detectByHeaders(text: string): Section[] {
  const lines = text.split("\n");
  const matches: HeaderMatch[] = [];

  let charOffset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length > 0 && trimmed.length <= 50) {
      // Strip common formatting: underlines, dashes, colons
      const cleaned = trimmed
        .replace(/[:\-–—_=]+$/, "")
        .replace(/^[:\-–—_=]+/, "")
        .trim();

      if (cleaned.length > 0) {
        for (const sectionType of SECTION_TYPE_ORDER) {
          const pattern = SECTION_HEADER_PATTERNS[sectionType];
          if (pattern.test(cleaned)) {
            matches.push({
              type: sectionType,
              lineIndex: i,
              charIndex: charOffset,
              headerLength: line.length,
            });
            break;
          }
        }
      }
    }

    charOffset += line.length + 1; // +1 for newline
  }

  if (matches.length === 0) {
    // Try detecting ALL CAPS lines as headers
    return detectByCapsHeaders(text, lines);
  }

  // Convert matches to sections
  return buildSectionsFromMatches(text, matches);
}

/**
 * Detect sections when headers are ALL CAPS lines without matching known patterns.
 * These might be custom section names.
 */
function detectByCapsHeaders(text: string, lines: string[]): Section[] {
  const matches: HeaderMatch[] = [];
  let charOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ALL CAPS line that's short enough to be a header
    if (
      trimmed.length >= 3 &&
      trimmed.length <= 40 &&
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed) &&
      !/^\d/.test(trimmed) &&
      // Exclude lines that are just punctuation or phone numbers
      /[A-Z]{3,}/.test(trimmed)
    ) {
      const sectionType = inferSectionTypeFromContent(lines, i);
      if (sectionType) {
        matches.push({
          type: sectionType,
          lineIndex: i,
          charIndex: charOffset,
          headerLength: line.length,
        });
      }
    }

    charOffset += line.length + 1;
  }

  return buildSectionsFromMatches(text, matches);
}

function buildSectionsFromMatches(
  text: string,
  matches: HeaderMatch[]
): Section[] {
  if (matches.length === 0) return [];

  // Sort by position
  matches.sort((a, b) => a.charIndex - b.charIndex);

  // Deduplicate: keep first occurrence of each type
  const seen = new Set<SectionType>();
  const deduped = matches.filter((m) => {
    if (seen.has(m.type)) return false;
    seen.add(m.type);
    return true;
  });

  const sections: Section[] = [];

  for (let i = 0; i < deduped.length; i++) {
    const match = deduped[i];
    // Content starts after the header line
    const contentStart = match.charIndex + match.headerLength + 1;
    const contentEnd =
      i + 1 < deduped.length ? deduped[i + 1].charIndex : text.length;

    const content = text.slice(contentStart, contentEnd).trim();
    if (content.length > 0) {
      sections.push({
        type: match.type,
        startIndex: match.charIndex,
        endIndex: contentEnd,
        content,
      });
    }
  }

  return sections;
}

/**
 * Infer section type by looking at the content below a potential header.
 */
function inferSectionTypeFromContent(
  lines: string[],
  headerLineIndex: number
): SectionType | null {
  // Look at next 5-10 lines for content clues
  const contentLines = lines.slice(headerLineIndex + 1, headerLineIndex + 10);
  const contentBlock = contentLines.join("\n");

  if (contentBlock.trim().length === 0) return null;

  // Check for date ranges → experience or education
  const hasDateRanges = DATE_PATTERN.test(contentBlock);
  const hasBullets = contentLines.some((l) => BULLET_PATTERN.test(l));
  const hasDegrees = DEGREE_PATTERN.test(contentBlock);
  const hasGPA = GPA_PATTERN.test(contentBlock);
  const hasSkillList = contentLines.some((l) => SKILL_LIST_PATTERN.test(l.trim()));

  if (hasDegrees || hasGPA) return "education";
  if (hasDateRanges && hasBullets) return "experience";
  if (hasSkillList) return "skills";
  if (hasDateRanges && !hasBullets) return "education";

  return null;
}

/**
 * Fill in implicit sections (like contact info at top) that don't have headers.
 */
function fillGaps(text: string, sections: Section[]): Section[] {
  if (sections.length === 0) return sections;

  const result = [...sections];

  // If the first section doesn't start near the top, there's probably contact info before it
  const firstSectionStart = sections[0].startIndex;
  if (firstSectionStart > 10) {
    const preContent = text.slice(0, firstSectionStart).trim();
    if (preContent.length > 0 && looksLikeContact(preContent)) {
      result.unshift({
        type: "contact",
        startIndex: 0,
        endIndex: firstSectionStart,
        content: preContent,
      });
    }
  }

  return result.sort((a, b) => a.startIndex - b.startIndex);
}

function looksLikeContact(text: string): boolean {
  const hasEmail = EMAIL_PATTERN.test(text);
  const hasPhone = PHONE_PATTERN.test(text);
  const hasUrl = URL_PATTERN.test(text);
  // At least one contact-ish item and short text
  return (hasEmail || hasPhone || hasUrl) && text.split("\n").length <= 10;
}

/**
 * Fall back to content heuristics when no headers are found.
 * Tries to identify sections purely by their content patterns.
 */
function detectByContentHeuristics(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];

  let charOffset = 0;
  let currentType: SectionType | null = null;
  let sectionStart = 0;
  let sectionContent: string[] = [];

  const flushSection = () => {
    if (currentType && sectionContent.length > 0) {
      const content = sectionContent.join("\n").trim();
      if (content.length > 0) {
        sections.push({
          type: currentType,
          startIndex: sectionStart,
          endIndex: sectionStart + content.length,
          content,
        });
      }
    }
  };

  // Phase 1: Identify contact block at top
  const contactEnd = findContactBlockEnd(lines);
  if (contactEnd > 0) {
    const contactContent = lines.slice(0, contactEnd).join("\n").trim();
    if (contactContent.length > 0) {
      sections.push({
        type: "contact",
        startIndex: 0,
        endIndex: contactContent.length,
        content: contactContent,
      });
    }
  }

  // Phase 2: Scan remaining lines for content patterns
  const startLine = contactEnd > 0 ? contactEnd : 0;
  charOffset = lines.slice(0, startLine).reduce((sum, l) => sum + l.length + 1, 0);

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const detectedType = classifyLineContent(trimmed, lines, i);

    if (detectedType && detectedType !== currentType) {
      flushSection();
      currentType = detectedType;
      sectionStart = charOffset;
      sectionContent = [line];
    } else if (currentType) {
      sectionContent.push(line);
    }

    charOffset += line.length + 1;
  }

  flushSection();

  // Deduplicate: merge consecutive sections of the same type
  return mergeSections(sections);
}

function findContactBlockEnd(lines: string[]): number {
  // Contact info is usually in the first few lines
  let lastContactLine = -1;
  const maxScan = Math.min(lines.length, 8);

  // First pass: find any contact indicators in the top block
  let hasAnyContactIndicator = false;
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i].trim();
    if (EMAIL_PATTERN.test(line) || PHONE_PATTERN.test(line) || URL_PATTERN.test(line)) {
      hasAnyContactIndicator = true;
      break;
    }
  }

  if (!hasAnyContactIndicator) return 0;

  for (let i = 0; i < maxScan; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    const hasEmail = EMAIL_PATTERN.test(line);
    const hasPhone = PHONE_PATTERN.test(line);
    const hasUrl = URL_PATTERN.test(line);

    if (hasEmail || hasPhone || hasUrl) {
      lastContactLine = i;
    } else if (i === 0) {
      // First line is likely the name when contact info follows
      lastContactLine = 0;
    } else if (lastContactLine >= 0 && i - lastContactLine > 2) {
      break;
    }
  }

  return lastContactLine >= 0 ? lastContactLine + 1 : 0;
}

function classifyLineContent(
  line: string,
  lines: string[],
  lineIndex: number
): SectionType | null {
  if (line.length === 0) return null;

  // Check for degree keywords → education
  if (DEGREE_PATTERN.test(line)) return "education";

  // Check for skill-like comma lists
  if (SKILL_LIST_PATTERN.test(line)) return "skills";

  // Check if next line has a date range → this line is the start of an experience/education entry
  if (lineIndex + 1 < lines.length) {
    const nextLine = lines[lineIndex + 1].trim();
    if (DATE_PATTERN.test(nextLine) && !DATE_PATTERN.test(line)) {
      // Look ahead for bullets to distinguish experience vs education
      const nearbyBullets = lines
        .slice(lineIndex + 2, lineIndex + 6)
        .some((l) => BULLET_PATTERN.test(l));
      const nearbyText = lines.slice(lineIndex, lineIndex + 4).join(" ");
      if (DEGREE_PATTERN.test(nearbyText) || GPA_PATTERN.test(nearbyText)) {
        return "education";
      }
      return "experience";
    }
  }

  // Check for date ranges with bullets nearby → experience
  if (DATE_PATTERN.test(line)) {
    const nearbyBullets = lines
      .slice(lineIndex + 1, lineIndex + 5)
      .some((l) => BULLET_PATTERN.test(l));
    if (nearbyBullets) return "experience";
    // Date with no bullets could be either; check for degree-like words nearby
    const nearbyText = lines.slice(lineIndex, lineIndex + 3).join(" ");
    if (DEGREE_PATTERN.test(nearbyText) || GPA_PATTERN.test(nearbyText)) {
      return "education";
    }
    return "experience";
  }

  return null;
}

function mergeSections(sections: Section[]): Section[] {
  if (sections.length <= 1) return sections;

  const merged: Section[] = [sections[0]];

  for (let i = 1; i < sections.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sections[i];

    if (prev.type === curr.type) {
      // Merge into previous
      prev.endIndex = curr.endIndex;
      prev.content = prev.content + "\n" + curr.content;
    } else {
      merged.push(curr);
    }
  }

  return merged;
}
