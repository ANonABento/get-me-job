import type { Profile, JobDescription } from "@/types";

/**
 * Converts raw resume text into a minimal Profile object
 * suitable for ATS analysis. Extracts what it can from plain text
 * using heuristic pattern matching.
 */
export function textToProfile(resumeText: string): Profile {
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
  const fullText = resumeText.trim();

  return {
    id: "scanner-anonymous",
    contact: extractContact(lines),
    summary: extractSummary(lines),
    experiences: extractExperiences(lines),
    education: extractEducation(lines),
    skills: extractSkills(lines),
    projects: [],
    certifications: [],
    rawText: fullText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Converts raw job description text into a minimal JobDescription object.
 */
export function textToJob(jobText: string): JobDescription {
  const lines = jobText.split("\n").map((l) => l.trim()).filter(Boolean);
  const keywords = extractJobKeywords(jobText);

  return {
    id: "scanner-job",
    title: lines[0]?.slice(0, 100) || "Job Position",
    company: "Target Company",
    description: jobText,
    requirements: extractRequirements(lines),
    responsibilities: [],
    keywords,
    createdAt: new Date().toISOString(),
  };
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i;

function extractContact(lines: string[]): Profile["contact"] {
  const first10 = lines.slice(0, 10).join(" ");
  const emailMatch = first10.match(EMAIL_RE);
  const phoneMatch = first10.match(PHONE_RE);
  const linkedinMatch = first10.match(LINKEDIN_RE);

  // First non-email, non-phone line is likely the name
  const nameLine = lines.find(
    (l) => l.length > 1 && l.length < 60 && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !/^https?:/.test(l)
  );

  return {
    name: nameLine || "",
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
  };
}

const SECTION_HEADERS_RE = /^(summary|objective|profile|about me|professional summary|experience|work experience|work history|employment|education|academic|skills|technical skills|core competencies|projects|certifications|awards|achievements|publications|references|volunteer)/i;

function isSectionHeader(line: string): boolean {
  return SECTION_HEADERS_RE.test(line) && line.length < 50;
}

function extractSummary(lines: string[]): string {
  const summaryHeaders = /^(summary|objective|profile|about me|professional summary)/i;
  const idx = lines.findIndex((l) => summaryHeaders.test(l));

  if (idx !== -1) {
    const summaryLines: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      if (isSectionHeader(lines[i])) break;
      summaryLines.push(lines[i]);
      if (summaryLines.length >= 5) break;
    }
    return summaryLines.join(" ");
  }

  // Fallback: look for a paragraph near the top (after contact info)
  for (let i = 2; i < Math.min(lines.length, 8); i++) {
    if (lines[i].length > 80 && !isSectionHeader(lines[i])) {
      return lines[i];
    }
  }

  return "";
}

const EXPERIENCE_HEADERS = /^(experience|work experience|work history|employment|professional experience)/i;
const DATE_RE = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}\s*[-–]\s*(?:\d{4}|present|current))|present|current/i;

function extractExperiences(lines: string[]): Profile["experiences"] {
  const expStart = lines.findIndex((l) => EXPERIENCE_HEADERS.test(l));
  if (expStart === -1) return [];

  const experiences: Profile["experiences"] = [];
  let current: {
    title: string;
    company: string;
    startDate: string;
    highlights: string[];
    description: string;
  } | null = null;

  let expIdCounter = 1;

  for (let i = expStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isSectionHeader(line) && !EXPERIENCE_HEADERS.test(line)) break;

    const hasDate = DATE_RE.test(line);

    // A line with a date likely starts a new experience entry
    if (hasDate && line.length < 120) {
      if (current) {
        experiences.push(buildExperience(current, expIdCounter++));
      }
      current = {
        title: line.replace(DATE_RE, "").replace(/[|,–-]+$/, "").trim(),
        company: "",
        startDate: extractDateString(line),
        highlights: [],
        description: "",
      };
    } else if (current) {
      // If we just started and don't have a company yet, this might be the company
      if (!current.company && current.highlights.length === 0 && line.length < 80) {
        current.company = line;
      } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*") || line.startsWith("–")) {
        current.highlights.push(line.replace(/^[-•*–]\s*/, ""));
      } else if (line.length > 20) {
        current.description += (current.description ? " " : "") + line;
      }
    }
  }

  if (current) {
    experiences.push(buildExperience(current, expIdCounter));
  }

  return experiences;
}

function buildExperience(
  data: { title: string; company: string; startDate: string; highlights: string[]; description: string },
  id: number
): Profile["experiences"][0] {
  return {
    id: `exp-scan-${id}`,
    title: data.title || "Position",
    company: data.company || "Company",
    startDate: data.startDate,
    current: false,
    description: data.description,
    highlights: data.highlights,
    skills: [],
  };
}

function extractDateString(line: string): string {
  const match = line.match(DATE_RE);
  return match?.[0] || "";
}

const EDUCATION_HEADERS = /^(education|academic|academic background)/i;

function extractEducation(lines: string[]): Profile["education"] {
  const eduStart = lines.findIndex((l) => EDUCATION_HEADERS.test(l));
  if (eduStart === -1) return [];

  const education: Profile["education"] = [];
  let currentLines: string[] = [];
  let eduId = 1;

  for (let i = eduStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isSectionHeader(line) && !EDUCATION_HEADERS.test(line)) break;

    if (DATE_RE.test(line) && currentLines.length > 0) {
      currentLines.push(line);
      education.push(buildEducation(currentLines, eduId++));
      currentLines = [];
    } else if (line.length > 2) {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    education.push(buildEducation(currentLines, eduId));
  }

  return education;
}

function buildEducation(lines: string[], id: number): Profile["education"][0] {
  const degreeRe = /bachelor|master|ph\.?d|associate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|m\.?b\.?a/i;
  const degreeLine = lines.find((l) => degreeRe.test(l)) || lines[0] || "";
  const institution = lines.find((l) => l !== degreeLine && l.length > 3) || "";

  return {
    id: `edu-scan-${id}`,
    institution: institution || degreeLine,
    degree: degreeLine,
    field: "",
    highlights: [],
  };
}

const SKILLS_HEADERS = /^(skills|technical skills|core competencies|technologies|tools|tech stack)/i;

function extractSkills(lines: string[]): Profile["skills"] {
  const skillStart = lines.findIndex((l) => SKILLS_HEADERS.test(l));
  const skills: Profile["skills"] = [];
  const seen = new Set<string>();
  let skillId = 1;

  if (skillStart !== -1) {
    for (let i = skillStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (isSectionHeader(line) && !SKILLS_HEADERS.test(line)) break;

      // Split by common delimiters
      const tokens = line
        .replace(/^[-•*–]\s*/, "")
        .split(/[,;|/·]/)
        .map((t) => t.replace(/^\s*[-•*]\s*/, "").trim())
        .filter((t) => t.length > 1 && t.length < 40);

      for (const token of tokens) {
        const lower = token.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          skills.push({
            id: `skill-scan-${skillId++}`,
            name: token,
            category: "technical",
          });
        }
      }
    }
  }

  return skills;
}

function extractJobKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  const words = normalized.split(/\s+/);
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "we", "you", "they", "our", "your",
    "this", "that", "these", "those", "about", "into", "through", "during",
    "before", "after", "above", "below", "between", "than", "very", "just",
    "also", "not", "all", "any", "can", "who", "what", "which", "when",
    "where", "how", "work", "working", "able", "using", "including",
    "experience", "years", "team", "company", "role", "position",
  ]);

  const freq: Record<string, number> = {};
  for (const word of words) {
    const clean = word.replace(/[^a-z0-9+#.]/g, "");
    if (clean.length > 2 && !stopWords.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function extractRequirements(lines: string[]): string[] {
  const reqHeaders = /^(requirements|qualifications|what we.+looking|must have|minimum|preferred)/i;
  const reqStart = lines.findIndex((l) => reqHeaders.test(l));
  if (reqStart === -1) return [];

  const reqs: string[] = [];
  for (let i = reqStart + 1; i < lines.length && reqs.length < 15; i++) {
    const line = lines[i];
    if (isSectionHeader(line) && !reqHeaders.test(line)) break;
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      reqs.push(line.replace(/^[-•*]\s*/, ""));
    } else if (line.length > 10) {
      reqs.push(line);
    }
  }

  return reqs;
}
