/**
 * Deterministic field extractor for resume sections.
 * Extracts structured data from section text using regex/heuristics.
 * No LLM calls — pure pattern matching.
 */

import type { Experience, Education, Skill, Project } from "@/types";
import type { Section as DetectedSection } from "./section-detector";
import { generateId } from "@/lib/utils";

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  confidence: number;
}

export interface ExtractedFields {
  contact: ContactInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

const EMAIL_REGEX = /[\w.+-]+@[\w.-]+\.\w{2,}/;
const PHONE_REGEX = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_REGEX = /linkedin\.com\/in\/[\w-]+/i;
const GITHUB_REGEX = /github\.com\/[\w-]+/i;
const URL_REGEX = /https?:\/\/[\w.-]+\.\w{2,}[\w/.-]*/;

// Month names (abbreviated and full) for building date patterns
const MONTH_NAMES = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const MONTH_ABBR_TICK = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\.?\\s*'\\d{2}";
const SEASON = "(?:Spring|Summer|Fall|Autumn|Winter)\\s+\\d{4}";

// Single date token: "January 2020", "Jan 2020", "Jan. 2020", "01/2020", "2020", "Jan '20", "Summer 2019"
const DATE_TOKEN = `(?:${MONTH_NAMES}\\.?\\s*\\d{4}|${MONTH_ABBR_TICK}|${SEASON}|\\d{1,2}\\/\\d{4}|\\d{4})`;
// End token: same as date token + Present/Current
const END_TOKEN = `(?:${DATE_TOKEN}|[Pp]resent|[Cc]urrent)`;
// Full date range: "Jan 2020 - Present", "2020-2024", etc.
const DATE_RANGE_REGEX = new RegExp(`${DATE_TOKEN}\\s*[-–—]\\s*${END_TOKEN}`, "g");
// Also match " to " as separator: "January 2020 to Present"
const DATE_RANGE_TO_REGEX = new RegExp(`${DATE_TOKEN}\\s+to\\s+${END_TOKEN}`, "gi");

/** Test if a line contains a date range */
export function hasDateRange(line: string): boolean {
  DATE_RANGE_REGEX.lastIndex = 0;
  DATE_RANGE_TO_REGEX.lastIndex = 0;
  return DATE_RANGE_REGEX.test(line) || DATE_RANGE_TO_REGEX.test(line);
}

/** Extract the first date range from a line */
export function extractDateRange(line: string): string {
  DATE_RANGE_REGEX.lastIndex = 0;
  DATE_RANGE_TO_REGEX.lastIndex = 0;
  return line.match(DATE_RANGE_REGEX)?.[0] || line.match(DATE_RANGE_TO_REGEX)?.[0] || "";
}

/** Remove the date range from a line */
function removeDateRange(line: string): string {
  DATE_RANGE_REGEX.lastIndex = 0;
  DATE_RANGE_TO_REGEX.lastIndex = 0;
  return line.replace(DATE_RANGE_REGEX, "").replace(DATE_RANGE_TO_REGEX, "").replace(/[|•·,]/g, " ").trim();
}

/** Split a date range string into [start, end] */
export function splitDateRange(dateStr: string): { start: string; end: string } {
  // Split on dash/em-dash or " to "
  const parts = dateStr.split(/\s*[-–—]\s*|\s+to\s+/i);
  return {
    start: parts[0]?.trim() || "",
    end: parts[1]?.trim() || "",
  };
}

// Job title keywords for detecting titles vs company names
const JOB_TITLE_KEYWORDS = /\b(?:Engineer|Developer|Manager|Director|Analyst|Designer|Lead|Senior|Junior|Intern|Architect|Consultant|Coordinator|Specialist|Administrator|Associate|Assistant|Officer|VP|Vice\s+President|CTO|CEO|CFO|COO|Head\s+of|Principal|Staff|Technician|Supervisor|Representative|Strategist|Scientist|Researcher|Fellow)\b/i;

/** Determine if a string looks like a job title */
export function isJobTitle(text: string): boolean {
  return JOB_TITLE_KEYWORDS.test(text);
}

export function extractContact(text: string): { contact: ContactInfo; remainingText: string } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const email = text.match(EMAIL_REGEX)?.[0];
  const phone = text.match(PHONE_REGEX)?.[0];
  const linkedin = text.match(LINKEDIN_REGEX)?.[0];
  const github = text.match(GITHUB_REGEX)?.[0];
  const website = text.match(URL_REGEX)?.[0];

  const name = lines.find(
    (l) => !EMAIL_REGEX.test(l) && !PHONE_REGEX.test(l) && !URL_REGEX.test(l) && l.length > 1 && l.length < 60
  ) || "";

  const locationMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*[A-Z]{2}(?:\s+\d{5})?/);
  const location = locationMatch?.[0];

  let confidence = 0;
  if (name) confidence += 0.3;
  if (email) confidence += 0.3;
  if (phone) confidence += 0.2;
  if (location) confidence += 0.1;
  if (linkedin || github) confidence += 0.1;

  return {
    contact: { name, email, phone, location, linkedin, github, website, confidence },
    remainingText: text,
  };
}

export function extractExperiences(text: string): Experience[] {
  const experiences: Experience[] = [];
  const lines = text.split("\n");
  let currentEntry: { title: string; company: string; dates: string; bullets: string[] } | null = null;

  function pushCurrentEntry() {
    if (!currentEntry) return;
    const { start, end } = splitDateRange(currentEntry.dates);
    experiences.push({
      id: generateId(),
      company: currentEntry.company || "Unknown",
      title: currentEntry.title || "Unknown",
      startDate: start,
      endDate: end,
      current: /present|current/i.test(currentEntry.dates),
      description: currentEntry.bullets.join("\n"),
      highlights: currentEntry.bullets,
      skills: [],
    });
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (hasDateRange(trimmed)) {
      pushCurrentEntry();
      const dateStr = extractDateRange(trimmed);
      const titlePart = removeDateRange(trimmed);
      currentEntry = { title: titlePart, company: "", dates: dateStr, bullets: [] };
    } else if (currentEntry) {
      if (/^[•\-*]/.test(trimmed)) {
        currentEntry.bullets.push(trimmed.replace(/^[•\-*]\s*/, ""));
      } else if (trimmed.length < 80) {
        // Use job title keywords to disambiguate title vs company
        if (!currentEntry.title && isJobTitle(trimmed)) {
          currentEntry.title = trimmed;
        } else if (currentEntry.title && isJobTitle(trimmed) && !currentEntry.company) {
          // Current title might actually be company, this is the real title
          currentEntry.company = currentEntry.title;
          currentEntry.title = trimmed;
        } else if (!currentEntry.company) {
          // If title exists but no company, and this line doesn't look like a title
          if (currentEntry.title && !isJobTitle(currentEntry.title) && isJobTitle(trimmed)) {
            currentEntry.company = currentEntry.title;
            currentEntry.title = trimmed;
          } else {
            currentEntry.company = trimmed;
          }
        }
      }
    }
  }

  pushCurrentEntry();
  return experiences;
}

// Degree patterns for education parsing
const DEGREE_PATTERNS = /(?:Bachelor(?:'s)?|Master(?:'s)?|PhD|Ph\.D\.?|Doctorate|Associate(?:'s)?|B\.S\.?|B\.A\.?|M\.S\.?|M\.A\.?|MBA|M\.Eng\.?|B\.Eng\.?|J\.D\.?|M\.D\.?|Doctor\s+of)/i;

// Pattern for "B.S. in Computer Science" or "Master of Business Administration"
const DEGREE_FIELD_REGEX = /(?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?|Doctor(?:ate)?)\s+(?:of(?:\s+\w+)*?\s+)?(?:in\s+)?(.+?)(?:\s*[,|]|\s*$)/i;
const SHORT_DEGREE_FIELD_REGEX = /(?:B\.S\.?|B\.A\.?|M\.S\.?|M\.A\.?|MBA|M\.Eng\.?|B\.Eng\.?|J\.D\.?|M\.D\.?|Ph\.D\.?)\s+(?:in\s+)?(.+?)(?:\s*[,|]|\s*$)/i;

// GPA patterns
const GPA_NUMERIC_REGEX = /(?:GPA[:\s]*)?(\d\.\d+)\s*(?:\/\s*4\.0)?/i;
const GPA_LABEL_REGEX = /GPA[:\s]*(\d\.\d+)/i;

// Latin honors to approximate GPA
const HONORS_GPA: Record<string, string> = {
  "summa cum laude": "3.9",
  "magna cum laude": "3.7",
  "cum laude": "3.5",
};

/** Extract degree name and field of study from a line */
export function parseDegreeAndField(line: string): { degree: string; field: string } {
  // Try "Bachelor of Science in Mechanical Engineering" — with explicit "in" separator
  const longWithIn = line.match(/((?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?|Doctor(?:ate)?)\s+of\s+\w+(?:\s+\w+)*?)\s+in\s+(.+?)(?:\s*[,|]|\s*$)/i);
  if (longWithIn) {
    return { degree: longWithIn[1].trim(), field: longWithIn[2].trim() };
  }

  // Try "Master of Business Administration" — no "in", field is what comes after "of"
  const longMatch = line.match(/((?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?|Doctor(?:ate)?)\s+of)\s+(.+?)(?:\s*[,|]|\s*$)/i);
  if (longMatch) {
    return { degree: longMatch[0].trim(), field: longMatch[2].trim() };
  }

  // Try "B.S. in Computer Science" pattern
  const shortMatch = line.match(SHORT_DEGREE_FIELD_REGEX);
  if (shortMatch) {
    const degreeAbbr = line.match(/(?:B\.S\.?|B\.A\.?|M\.S\.?|M\.A\.?|MBA|M\.Eng\.?|B\.Eng\.?|J\.D\.?|M\.D\.?|Ph\.D\.?)/i)?.[0] || "";
    return { degree: degreeAbbr.trim(), field: shortMatch[1]?.trim() || "" };
  }

  // Try "Master's in X" pattern
  const mastersIn = line.match(/(?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?)\s+in\s+(.+?)(?:\s*[,|]|\s*$)/i);
  if (mastersIn) {
    const degreeType = line.match(/(?:Bachelor(?:'s)?|Master(?:'s)?|Associate(?:'s)?)/i)?.[0] || "";
    return { degree: degreeType.trim(), field: mastersIn[1]?.trim() || "" };
  }

  // Fallback: whole line is degree, no field extracted
  return { degree: line.trim(), field: "" };
}

/** Extract GPA from text, including Latin honors */
export function extractGpa(text: string): string | undefined {
  // Check for explicit GPA label
  const labelMatch = text.match(GPA_LABEL_REGEX);
  if (labelMatch) return labelMatch[1];

  // Check for numeric GPA pattern (e.g., "3.8/4.0")
  const numericMatch = text.match(/(\d\.\d+)\s*\/\s*4\.0/);
  if (numericMatch) return numericMatch[1];

  // Check for Latin honors
  const lowerText = text.toLowerCase();
  for (const [honor, gpa] of Object.entries(HONORS_GPA)) {
    if (lowerText.includes(honor)) return gpa;
  }

  return undefined;
}

export function extractEducation(text: string): Education[] {
  const education: Education[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (DEGREE_PATTERNS.test(line)) {
      // Parse degree and field
      const { degree, field } = parseDegreeAndField(line);

      // Extract GPA from current line and nearby lines
      const contextLines = [line, lines[i + 1] || "", lines[i + 2] || ""].join(" ");
      const gpa = extractGpa(contextLines);

      // Extract dates from line or nearby lines
      let startDate = "";
      let endDate = "";
      const dateContext = [line, lines[i + 1] || "", lines[i - 1] || ""].join(" ");
      if (hasDateRange(dateContext)) {
        const dateStr = extractDateRange(dateContext);
        const parts = splitDateRange(dateStr);
        startDate = parts.start;
        endDate = parts.end;
      }

      // Institution: look at adjacent lines for non-degree, non-date text
      let institution = "Unknown";
      for (const offset of [1, -1]) {
        const adjacentLine = lines[i + offset]?.trim();
        if (adjacentLine && !DEGREE_PATTERNS.test(adjacentLine) && !hasDateRange(adjacentLine) && adjacentLine.length > 2 && adjacentLine.length < 100) {
          // Skip lines that look like GPA or honors
          if (/^(?:GPA|cum laude|\d\.\d)/i.test(adjacentLine)) continue;
          institution = adjacentLine;
          break;
        }
      }

      education.push({
        id: generateId(),
        institution,
        degree,
        field,
        startDate,
        endDate,
        gpa,
        highlights: [],
      });
    }
  }

  return education;
}

function extractSkills(text: string): Skill[] {
  const items = text.split(/[,|•·\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 50);
  return items.map((name) => ({
    id: generateId(),
    name,
    category: "technical" as const,
    proficiency: "intermediate" as const,
  }));
}

function extractProjects(text: string): Project[] {
  const projects: Project[] = [];
  const lines = text.split("\n");
  let current: { name: string; description: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[A-Z]/.test(trimmed) && trimmed.length < 80 && !/^[•\-*]/.test(trimmed)) {
      if (current) {
        projects.push({ id: generateId(), name: current.name, description: current.description.trim(), url: undefined, technologies: [], highlights: [] });
      }
      current = { name: trimmed, description: "" };
    } else if (current) {
      current.description += " " + trimmed;
    }
  }
  if (current) {
    projects.push({ id: generateId(), name: current.name, description: current.description.trim(), url: undefined, technologies: [], highlights: [] });
  }

  return projects;
}

export function extractFieldsFromSections(sections: DetectedSection[]): ExtractedFields {
  const contactSection = sections.find((s) => s.type === "contact");
  const summarySection = sections.find((s) => s.type === "summary");
  const experienceSection = sections.find((s) => s.type === "experience");
  const educationSection = sections.find((s) => s.type === "education");
  const skillsSection = sections.find((s) => s.type === "skills");
  const projectsSection = sections.find((s) => s.type === "projects");

  const { contact } = contactSection ? extractContact(contactSection.content) : { contact: { name: "", confidence: 0 } as ContactInfo };

  return {
    contact,
    summary: summarySection?.content || "",
    experiences: experienceSection ? extractExperiences(experienceSection.content) : [],
    education: educationSection ? extractEducation(educationSection.content) : [],
    skills: skillsSection ? extractSkills(skillsSection.content) : [],
    projects: projectsSection ? extractProjects(projectsSection.content) : [],
  };
}
