/**
 * Deterministic section detector for resume text.
 * Identifies section boundaries (experience, education, skills, etc.)
 * without any LLM calls.
 */

export type SectionType =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "unknown";

export interface DetectedSection {
  type: SectionType;
  heading: string;
  startLine: number;
  endLine: number;
  text: string;
  confidence: number; // 0-1 how confident we are about the section type
}

// Patterns that indicate a section heading. Order matters — first match wins.
const SECTION_PATTERNS: { type: SectionType; patterns: RegExp[] }[] = [
  {
    type: "experience",
    patterns: [
      /^(work\s+)?experience/i,
      /^employment(\s+history)?/i,
      /^professional\s+(experience|background)/i,
      /^work\s+history/i,
      /^career\s+(history|summary)/i,
      /^relevant\s+experience/i,
    ],
  },
  {
    type: "education",
    patterns: [
      /^education(al)?(\s+background)?/i,
      /^academic(\s+background)?/i,
      /^qualifications/i,
      /^degrees?/i,
    ],
  },
  {
    type: "skills",
    patterns: [
      /^(technical\s+)?skills/i,
      /^core\s+competencies/i,
      /^competencies/i,
      /^areas?\s+of\s+expertise/i,
      /^proficiencies/i,
      /^technologies/i,
      /^tech(nical)?\s+stack/i,
      /^tools?\s+(&|and)\s+technologies/i,
    ],
  },
  {
    type: "projects",
    patterns: [
      /^projects?/i,
      /^personal\s+projects?/i,
      /^notable\s+projects?/i,
      /^key\s+projects?/i,
      /^selected\s+projects?/i,
    ],
  },
  {
    type: "certifications",
    patterns: [
      /^certifications?/i,
      /^licenses?\s*(&|and)?\s*certifications?/i,
      /^professional\s+certifications?/i,
      /^credentials?/i,
    ],
  },
  {
    type: "summary",
    patterns: [
      /^(professional\s+)?summary/i,
      /^(career\s+)?objective/i,
      /^profile/i,
      /^about(\s+me)?/i,
      /^overview/i,
    ],
  },
];

/**
 * Check if a line matches a known section pattern.
 * Returns the match if found, null otherwise.
 */
function matchSectionPattern(line: string): { type: SectionType; confidence: number } | null {
  const cleaned = line.trim().replace(/[:|\-_*#]+$/g, "").trim();
  if (!cleaned || cleaned.length > 60) return null;
  // Separator lines are not headings
  if (/^[-=_*]{3,}$/.test(cleaned)) return null;
  // Lines with many commas/periods are content, not headings
  if ((cleaned.match(/[,.]/g) || []).length > 2) return null;
  // Lines starting with bullet points are content
  if (/^[-•*▪▸►◦]/.test(cleaned)) return null;

  for (const { type, patterns } of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return { type, confidence: 1.0 };
      }
    }
  }

  // Only treat as unknown heading if it looks structurally like one
  // ALL CAPS: must be predominantly letters (>50% alpha), not dates/numbers
  const alphaChars = (cleaned.match(/[a-zA-Z]/g) || []).length;
  const isAllCaps = cleaned === cleaned.toUpperCase()
    && /[A-Z]{2,}/.test(cleaned)
    && cleaned.length < 40
    && alphaChars > cleaned.length * 0.5;
  // Ends with colon: the line itself ends with ':'
  const endsWithColon = line.trim().endsWith(":");

  if (isAllCaps || endsWithColon) {
    return { type: "unknown", confidence: 0.3 };
  }

  return null;
}

/**
 * Detect section boundaries in resume text.
 * Returns an array of detected sections with their text content and confidence.
 */
export function detectSections(text: string): DetectedSection[] {
  const lines = text.split("\n");
  const headings: { line: number; heading: string; type: SectionType; confidence: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = matchSectionPattern(lines[i]);
    if (!match) continue;

    headings.push({ line: i, heading: lines[i].trim(), type: match.type, confidence: match.confidence });
  }

  // If no headings found, return entire text as a single unknown section
  if (headings.length === 0) {
    return [
      {
        type: "unknown",
        heading: "",
        startLine: 0,
        endLine: lines.length - 1,
        text: text,
        confidence: 0.1,
      },
    ];
  }

  // Build sections from heading boundaries
  const sections: DetectedSection[] = [];

  // Content before first heading → contact section
  if (headings[0].line > 0) {
    const contactText = lines.slice(0, headings[0].line).join("\n").trim();
    if (contactText) {
      sections.push({
        type: "contact",
        heading: "",
        startLine: 0,
        endLine: headings[0].line - 1,
        text: contactText,
        confidence: 0.8,
      });
    }
  }

  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].line;
    const end = i + 1 < headings.length ? headings[i + 1].line - 1 : lines.length - 1;
    const sectionLines = lines.slice(start, end + 1);
    const sectionText = sectionLines.join("\n").trim();

    if (!sectionText) continue;

    sections.push({
      type: headings[i].type,
      heading: headings[i].heading,
      startLine: start,
      endLine: end,
      text: sectionText,
      confidence: headings[i].confidence,
    });
  }

  return sections;
}

/**
 * Calculate an overall confidence score for detected sections.
 * Higher if more known section types found with high individual confidence.
 */
export function calculateSectionConfidence(sections: DetectedSection[]): number {
  if (sections.length === 0) return 0;

  const knownSections = sections.filter((s) => s.type !== "unknown");

  // Weighted: known sections with high confidence count more
  const weightedSum = sections.reduce((sum, s) => sum + s.confidence, 0);
  const avgConfidence = weightedSum / sections.length;

  // Bonus for having key sections (experience, education, skills)
  const hasExperience = knownSections.some((s) => s.type === "experience");
  const hasEducation = knownSections.some((s) => s.type === "education");
  const hasSkills = knownSections.some((s) => s.type === "skills");
  const keyCount = [hasExperience, hasEducation, hasSkills].filter(Boolean).length;
  const keyBonus = keyCount * 0.1;

  return Math.min(1.0, avgConfidence + keyBonus);
}
