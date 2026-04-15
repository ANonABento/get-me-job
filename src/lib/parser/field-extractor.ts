/**
 * Deterministic field extractor for resume sections.
 * Extracts structured data from detected sections without LLM.
 */

import type {
  ContactInfo,
  Experience,
  Education,
  Skill,
  Project,
} from "@/types";
import { generateId } from "@/lib/utils";
import type { DetectedSection } from "./section-detector";

// ─── Contact extraction ─────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w{2,}/;
const PHONE_RE = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i;
const GITHUB_RE = /github\.com\/[\w-]+/i;
const WEBSITE_RE = /https?:\/\/(?!.*(?:linkedin|github)\.com)[\w.-]+\.\w{2,}[^\s,]*/i;
const LOCATION_RE =
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s+([A-Z]{2})\b/; // "City, ST"

export function extractContact(text: string): { contact: ContactInfo; confidence: number } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const email = text.match(EMAIL_RE)?.[0];
  const phone = text.match(PHONE_RE)?.[0];
  const linkedin = text.match(LINKEDIN_RE)?.[0];
  const github = text.match(GITHUB_RE)?.[0];
  const website = text.match(WEBSITE_RE)?.[0];
  const locationMatch = text.match(LOCATION_RE);
  const location = locationMatch ? locationMatch[0] : undefined;

  // Name is typically the first non-empty line that isn't an email/phone/URL
  let name = "";
  for (const line of lines) {
    if (EMAIL_RE.test(line) && line.length < 60) continue;
    if (PHONE_RE.test(line) && line.length < 30) continue;
    if (/^https?:\/\//.test(line)) continue;
    // Likely the name if short and contains letters
    if (line.length < 50 && /[a-zA-Z]/.test(line)) {
      name = line.replace(/[|•·,]+$/, "").trim();
      break;
    }
  }

  // Confidence based on how many fields we found
  const fields = [name, email, phone, linkedin, github, location].filter(Boolean);
  const confidence = Math.min(1.0, fields.length / 4);

  return {
    contact: { name, email, phone, location, linkedin, github, website },
    confidence,
  };
}

// ─── Summary extraction ─────────────────────────────────────────────

export function extractSummary(section: DetectedSection): { summary: string; confidence: number } {
  // Remove the heading line, return the rest as summary text
  const lines = section.text.split("\n");
  const body = lines.slice(1).join("\n").trim();
  const confidence = body.length > 20 ? 0.9 : 0.4;
  return { summary: body, confidence };
}

// ─── Experience extraction ──────────────────────────────────────────

const DATE_RE =
  /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\b/i;
const DATE_RANGE_RE =
  /\b((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4})\s*[-–—to]+\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|[Pp]resent|[Cc]urrent)\b/i;

/**
 * Split an experience section into individual job entries.
 * Each entry typically starts with a line containing a date range.
 */
export function extractExperiences(section: DetectedSection): {
  experiences: Experience[];
  confidence: number;
} {
  const lines = section.text.split("\n");
  // Skip the heading line
  const body = lines.slice(1);

  const entries: string[][] = [];
  let current: string[] = [];

  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Blank line might separate entries
      continue;
    }

    // A date range line right after a non-date line belongs to the same entry (title + dates)
    const hasDate = DATE_RANGE_RE.test(trimmed);
    const prevHasDate = current.length > 0 && current.some((l) => DATE_RANGE_RE.test(l));

    // Start new entry if: this line has a date range AND previous entry already has dates
    // (meaning this is a new job entry, not the date line for the current title)
    if (hasDate && prevHasDate && current.length > 0) {
      entries.push([...current]);
      current = [trimmed];
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) entries.push(current);

  const experiences: Experience[] = [];

  for (const entry of entries) {
    const fullText = entry.join("\n");
    const dateMatch = fullText.match(DATE_RANGE_RE);

    // First line is often "Title at Company" or "Company — Title"
    const firstLine = entry[0];
    const { title, company } = parseTitleCompany(firstLine);

    // Highlights are bullet points
    const highlights: string[] = [];
    for (const line of entry.slice(1)) {
      const cleaned = line.replace(/^[-•*▪▸►◦]\s*/, "").trim();
      if (cleaned && !DATE_RANGE_RE.test(cleaned)) {
        highlights.push(cleaned);
      }
    }

    const isCurrent = dateMatch
      ? /present|current/i.test(dateMatch[2])
      : false;

    experiences.push({
      id: generateId(),
      company,
      title,
      startDate: dateMatch?.[1] || "",
      endDate: isCurrent ? undefined : dateMatch?.[2],
      current: isCurrent,
      description: highlights[0] || "",
      highlights,
      skills: [],
    });
  }

  // Confidence: higher if we found date ranges and multiple entries
  const hasEntries = experiences.length > 0;
  const hasDates = experiences.some((e) => e.startDate);
  const confidence = hasEntries ? (hasDates ? 0.8 : 0.5) : 0.2;

  return { experiences, confidence };
}

function parseTitleCompany(line: string): { title: string; company: string } {
  // Remove date ranges from the line
  const cleaned = line.replace(DATE_RANGE_RE, "").trim();

  // Try "Title at Company" or "Title, Company"
  const atMatch = cleaned.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) return { title: atMatch[1].trim(), company: atMatch[2].trim() };

  // Try "Company — Title" or "Company | Title"
  const dashMatch = cleaned.match(/^(.+?)\s*[—–|]\s*(.+)$/);
  if (dashMatch) return { company: dashMatch[1].trim(), title: dashMatch[2].trim() };

  // Try "Company, Title" (only if no other separator found)
  const commaMatch = cleaned.match(/^(.+?),\s+(.+)$/);
  if (commaMatch) return { company: commaMatch[1].trim(), title: commaMatch[2].trim() };

  // Fallback: entire line is the title
  return { title: cleaned, company: "" };
}

// ─── Education extraction ───────────────────────────────────────────

export function extractEducation(section: DetectedSection): {
  education: Education[];
  confidence: number;
} {
  const lines = section.text.split("\n").slice(1); // skip heading
  const entries: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // New entry when we see a degree keyword or institution after content
    if (
      current.length > 0 &&
      /\b(bachelor|master|ph\.?d|associate|diploma|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|m\.?b\.?a)\b/i.test(
        trimmed
      ) &&
      !current.some((l) =>
        /\b(bachelor|master|ph\.?d|associate|diploma|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|m\.?b\.?a)\b/i.test(l)
      )
    ) {
      entries.push([...current]);
      current = [trimmed];
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) entries.push(current);

  const education: Education[] = [];

  for (const entry of entries) {
    const fullText = entry.join("\n");
    const dateMatch = fullText.match(DATE_RANGE_RE) || fullText.match(DATE_RE);

    const degreeMatch = fullText.match(
      /\b(Bachelor|Master|Ph\.?D|Associate|Diploma|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|M\.?B\.?A)[^,\n]*/i
    );
    const degree = degreeMatch?.[0]?.trim() || entry[0];

    // Try to find "in Field" or "of Field"
    const fieldMatch = fullText.match(/\b(?:in|of)\s+([A-Z][^\n,]+)/i);
    const field = fieldMatch?.[1]?.trim() || "";

    // Institution: look for "University", "College", "Institute", etc.
    const instMatch = fullText.match(
      /\b[\w\s]*(University|College|Institute|School|Academy)[\w\s]*/i
    );
    const institution = instMatch?.[0]?.trim() || "";

    // GPA
    const gpaMatch = fullText.match(/\bGPA[:\s]*(\d+\.\d+)/i);
    const gpa = gpaMatch?.[1];

    education.push({
      id: generateId(),
      institution,
      degree,
      field,
      startDate: dateMatch?.[1],
      endDate: dateMatch?.[2],
      gpa,
      highlights: [],
    });
  }

  const confidence = education.length > 0 ? 0.7 : 0.2;
  return { education, confidence };
}

// ─── Skills extraction ──────────────────────────────────────────────

export function extractSkills(section: DetectedSection): {
  skills: Skill[];
  confidence: number;
} {
  const lines = section.text.split("\n").slice(1); // skip heading
  const body = lines.join("\n");

  // Skills are often comma-separated, bullet-separated, or one per line
  const skillNames: string[] = [];

  // First, try line-by-line parsing (handles "Category: skill1, skill2" format)
  let hasCategories = false;
  for (const line of lines) {
    const cleaned = line.replace(/^[-•*▪▸►◦]\s*/, "").trim();
    if (!cleaned || cleaned.length >= 50) continue;

    const colonSplit = cleaned.match(/^[^:]+:\s*(.+)$/);
    if (colonSplit) {
      hasCategories = true;
      const items = colonSplit[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      skillNames.push(...items);
    }
  }

  // If no "Category: items" lines found, try comma/semicolon/bullet split of full body
  if (!hasCategories) {
    const commaGroups = body.split(/[,;•|▪▸►◦]/).map((s) => s.trim()).filter(Boolean);
    if (commaGroups.length > 2) {
      for (const g of commaGroups) {
        const cleaned = g.replace(/^[-*]\s*/, "").trim();
        if (cleaned && cleaned.length < 40 && !cleaned.includes("\n")) {
          skillNames.push(cleaned);
        }
      }
    }
  }

  // Fallback: one skill per line
  if (skillNames.length === 0) {
    for (const line of lines) {
      const cleaned = line.replace(/^[-•*▪▸►◦]\s*/, "").trim();
      if (cleaned && cleaned.length < 50) {
        skillNames.push(cleaned);
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const skills: Skill[] = [];
  for (const name of skillNames) {
    const lower = name.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    skills.push({
      id: generateId(),
      name,
      category: categorizeSkill(name),
    });
  }

  const confidence = skills.length > 0 ? 0.8 : 0.2;
  return { skills, confidence };
}

function categorizeSkill(name: string): Skill["category"] {
  const lower = name.toLowerCase();
  const techKeywords = [
    "javascript", "typescript", "python", "java", "c++", "c#", "rust", "go",
    "react", "angular", "vue", "node", "express", "django", "flask", "spring",
    "sql", "nosql", "mongodb", "postgres", "mysql", "redis", "aws", "azure",
    "gcp", "docker", "kubernetes", "terraform", "git", "ci/cd", "graphql",
    "rest", "api", "html", "css", "sass", "tailwind", "webpack", "vite",
    "linux", "bash", "shell", "swift", "kotlin", "ruby", "php", "scala",
    "machine learning", "deep learning", "data science", "ai",
  ];
  const toolKeywords = [
    "jira", "confluence", "figma", "sketch", "photoshop", "illustrator",
    "slack", "notion", "trello", "asana", "github", "gitlab", "bitbucket",
    "jenkins", "circleci", "datadog", "splunk", "tableau", "excel",
    "vs code", "vscode", "intellij", "xcode",
  ];
  const softKeywords = [
    "leadership", "communication", "teamwork", "problem solving",
    "time management", "collaboration", "mentoring", "agile", "scrum",
    "project management", "strategic", "analytical", "creative",
  ];
  const langKeywords = [
    "english", "spanish", "french", "german", "mandarin", "chinese",
    "japanese", "korean", "portuguese", "arabic", "hindi", "italian",
    "russian", "dutch",
  ];

  if (techKeywords.some((k) => lower.includes(k))) return "technical";
  if (toolKeywords.some((k) => lower.includes(k))) return "tool";
  if (softKeywords.some((k) => lower.includes(k))) return "soft";
  if (langKeywords.some((k) => lower.includes(k))) return "language";
  return "other";
}

// ─── Projects extraction ────────────────────────────────────────────

export function extractProjects(section: DetectedSection): {
  projects: Project[];
  confidence: number;
} {
  const lines = section.text.split("\n").slice(1); // skip heading
  const entries: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        entries.push([...current]);
        current = [];
      }
      continue;
    }
    // New entry if line doesn't start with a bullet and we have content
    if (current.length > 0 && !/^[-•*▪▸►◦]/.test(trimmed) && !trimmed.startsWith(" ")) {
      entries.push([...current]);
      current = [trimmed];
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) entries.push(current);

  const projects: Project[] = [];
  for (const entry of entries) {
    const name = entry[0].replace(/^[-•*]\s*/, "").trim();
    const highlights: string[] = [];
    const technologies: string[] = [];

    for (const line of entry.slice(1)) {
      const cleaned = line.replace(/^[-•*▪▸►◦]\s*/, "").trim();
      // Look for tech stack line
      const techMatch = cleaned.match(/^(?:tech(?:nolog(?:y|ies))?|stack|built\s+with|tools?)[:\s]+(.+)$/i);
      if (techMatch) {
        technologies.push(
          ...techMatch[1].split(/[,;]/).map((t) => t.trim()).filter(Boolean)
        );
      } else if (cleaned) {
        highlights.push(cleaned);
      }
    }

    // Try to extract URL from name or highlights
    const urlMatch = entry.join(" ").match(/https?:\/\/[^\s)]+/);

    projects.push({
      id: generateId(),
      name,
      description: highlights[0] || "",
      url: urlMatch?.[0],
      technologies,
      highlights,
    });
  }

  const confidence = projects.length > 0 ? 0.7 : 0.2;
  return { projects, confidence };
}

// ─── Main extractor ─────────────────────────────────────────────────

export interface ExtractedFields {
  contact: ContactInfo;
  summary?: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  sectionConfidences: Record<string, number>;
}

/**
 * Extract structured fields from detected sections.
 * Returns extracted data and per-section confidence scores.
 */
export function extractFieldsFromSections(sections: DetectedSection[]): ExtractedFields {
  let contact: ContactInfo = { name: "" };
  let summary: string | undefined;
  const experiences: Experience[] = [];
  const education: Education[] = [];
  const skills: Skill[] = [];
  const projects: Project[] = [];
  const sectionConfidences: Record<string, number> = {};

  for (const section of sections) {
    switch (section.type) {
      case "contact": {
        const result = extractContact(section.text);
        contact = result.contact;
        sectionConfidences["contact"] = result.confidence;
        break;
      }
      case "summary": {
        const result = extractSummary(section);
        summary = result.summary;
        sectionConfidences["summary"] = result.confidence;
        break;
      }
      case "experience": {
        const result = extractExperiences(section);
        experiences.push(...result.experiences);
        sectionConfidences["experience"] = result.confidence;
        break;
      }
      case "education": {
        const result = extractEducation(section);
        education.push(...result.education);
        sectionConfidences["education"] = result.confidence;
        break;
      }
      case "skills": {
        const result = extractSkills(section);
        skills.push(...result.skills);
        sectionConfidences["skills"] = result.confidence;
        break;
      }
      case "projects": {
        const result = extractProjects(section);
        projects.push(...result.projects);
        sectionConfidences["projects"] = result.confidence;
        break;
      }
      default:
        // unknown sections get their detected confidence
        sectionConfidences[`unknown_${section.startLine}`] = section.confidence;
        break;
    }
  }

  return { contact, summary, experiences, education, skills, projects, sectionConfidences };
}
