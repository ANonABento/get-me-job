/**
 * Deterministic resume field extractor — regex/pattern-based, zero LLM calls.
 * Extracts structured data from resume section text.
 */

import type {
  ContactInfo,
  Experience,
  Education,
  Skill,
  Project,
} from "@/types";
import { generateId } from "@/lib/utils";

// ─── Confidence helpers ──────────────────────────────────────────────

export interface FieldConfidence {
  value: unknown;
  confidence: number;
}

export interface ExtractedContact extends ContactInfo {
  confidence: number;
}

export interface ExtractedExperience extends Experience {
  confidence: number;
}

export interface ExtractedEducation extends Education {
  confidence: number;
}

export interface ExtractedSkill extends Skill {
  confidence: number;
}

export interface ExtractedProject extends Project {
  confidence: number;
}

function clampConfidence(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// ─── Shared regex patterns ───────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w{2,}/;
const PHONE_RE = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const WEBSITE_RE =
  /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w]{2,}(?:\.[\w]{2,})?(?:\/[\w./-]*)?/i;
const LOCATION_RE =
  /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),\s*([A-Z]{2})\b/;
const REMOTE_RE = /\bremote\b/i;

// Date patterns
const MONTH_NAMES =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_RANGE_RE = new RegExp(
  `(${MONTH_NAMES}\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})` +
    `\\s*[-–—to]+\\s*` +
    `(${MONTH_NAMES}\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4}|[Pp]resent|[Cc]urrent)`,
  "i"
);

const SINGLE_DATE_RE = new RegExp(
  `(${MONTH_NAMES}\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})`,
  "i"
);

// ─── Title heuristics ────────────────────────────────────────────────

const TITLE_KEYWORDS = [
  "engineer",
  "developer",
  "manager",
  "analyst",
  "designer",
  "architect",
  "director",
  "lead",
  "consultant",
  "specialist",
  "coordinator",
  "administrator",
  "intern",
  "associate",
  "senior",
  "junior",
  "principal",
  "staff",
  "vp",
  "president",
  "officer",
  "scientist",
  "researcher",
  "technician",
  "strategist",
  "recruiter",
  "accountant",
  "advisor",
];

const TITLE_RE = new RegExp(
  `\\b(${TITLE_KEYWORDS.join("|")})\\b`,
  "i"
);

// ─── Degree heuristics ──────────────────────────────────────────────

const DEGREE_PATTERNS = [
  /\b(?:Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?Eng\.?)\b/i,
  /\b(?:Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?Eng\.?|MBA)\b/i,
  /\b(?:Doctor(?:ate)?|Ph\.?D\.?|D\.?Sc\.?)\b/i,
  /\b(?:Associate(?:'s)?|A\.?S\.?|A\.?A\.?)\b/i,
  /\bDiploma\b/i,
];

const GPA_RE = /(?:GPA|gpa)[:\s]*(\d\.\d+)(?:\s*\/\s*(\d\.\d+))?/;
const GPA_SLASH_RE = /(\d\.\d+)\s*\/\s*(4\.0|4\.00)/;

// ─── Skill categories ───────────────────────────────────────────────

const PROGRAMMING_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "c++",
  "c#",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "r",
  "matlab",
  "perl",
  "lua",
  "haskell",
  "elixir",
  "dart",
  "objective-c",
  "sql",
  "html",
  "css",
  "bash",
  "shell",
  "powershell",
]);

const FRAMEWORKS = new Set([
  "react",
  "angular",
  "vue",
  "svelte",
  "next.js",
  "nextjs",
  "nuxt",
  "express",
  "fastapi",
  "django",
  "flask",
  "spring",
  "rails",
  "laravel",
  "tailwind",
  "bootstrap",
  "node.js",
  "nodejs",
  ".net",
  "dotnet",
  "redux",
  "graphql",
  "rest",
  "gatsby",
  "remix",
]);

const TOOLS = new Set([
  "git",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "jenkins",
  "terraform",
  "ansible",
  "ci/cd",
  "jira",
  "figma",
  "webpack",
  "vite",
  "postgres",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "elasticsearch",
  "kafka",
  "rabbitmq",
  "linux",
  "nginx",
  "apache",
  "vercel",
  "heroku",
  "firebase",
  "supabase",
  "prisma",
  "drizzle",
]);

const SOFT_SKILLS = new Set([
  "leadership",
  "communication",
  "teamwork",
  "problem-solving",
  "problem solving",
  "critical thinking",
  "time management",
  "project management",
  "agile",
  "scrum",
  "mentoring",
  "collaboration",
  "presentation",
  "public speaking",
  "negotiation",
  "analytical",
  "creativity",
  "adaptability",
]);

// ─── 1. Contact extraction ──────────────────────────────────────────

export function extractContact(text: string): ExtractedContact {
  const lines = text.split("\n").map((l) => l.trim());
  let hits = 0;
  const total = 7; // name, email, phone, location, linkedin, github, website

  // Name: first non-empty line that isn't an email/phone/URL
  let name = "";
  for (const line of lines) {
    if (!line) continue;
    if (EMAIL_RE.test(line) && line.indexOf("@") < 5) continue;
    if (/^[\d(+]/.test(line) && PHONE_RE.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    name = line.replace(/[|•·,].*$/, "").trim();
    if (name) {
      hits++;
      break;
    }
  }

  const emailMatch = text.match(EMAIL_RE);
  const email = emailMatch?.[0];
  if (email) hits++;

  const phoneMatch = text.match(PHONE_RE);
  const phone = phoneMatch?.[0]?.trim();
  if (phone) hits++;

  const locationMatch = text.match(LOCATION_RE);
  const remoteMatch = text.match(REMOTE_RE);
  const location = locationMatch
    ? `${locationMatch[1]}, ${locationMatch[2]}`
    : remoteMatch
      ? "Remote"
      : undefined;
  if (location) hits++;

  const linkedinMatch = text.match(LINKEDIN_RE);
  const linkedin = linkedinMatch?.[0];
  if (linkedin) hits++;

  const githubMatch = text.match(GITHUB_RE);
  const github = githubMatch?.[0];
  if (github) hits++;

  // Website: match URLs that aren't linkedin, github, or email domains
  let website: string | undefined;
  const urlMatches = text.match(
    new RegExp(WEBSITE_RE.source, "gi")
  );
  // Collect email domains to exclude
  const emailDomains = new Set<string>();
  const allEmails = text.match(new RegExp(EMAIL_RE.source, "gi"));
  if (allEmails) {
    for (const em of allEmails) {
      const domain = em.split("@")[1];
      if (domain) emailDomains.add(domain.toLowerCase());
    }
  }
  if (urlMatches) {
    for (const url of urlMatches) {
      const lower = url.toLowerCase();
      if (
        !lower.includes("linkedin.com") &&
        !lower.includes("github.com") &&
        !url.includes("@") &&
        !emailDomains.has(lower.replace(/^(?:https?:\/\/)?(?:www\.)?/, "")) &&
        /\.\w{2,}/.test(url)
      ) {
        website = url;
        hits++;
        break;
      }
    }
  }

  return {
    name,
    email,
    phone,
    location,
    linkedin,
    github,
    website,
    confidence: clampConfidence(hits / total),
  };
}

// ─── 2. Experience extraction ───────────────────────────────────────

function splitEntries(text: string): string[] {
  const lines = text.split("\n");
  const entries: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        entries.push(current.join("\n"));
        current = [];
      }
      continue;
    }

    // New entry heuristic: line has a date range and current block already has content
    if (current.length > 0 && DATE_RANGE_RE.test(trimmed) && !isBullet(trimmed)) {
      // Check if previous lines also had a date — if so, this is a new entry
      const prevText = current.join("\n");
      if (DATE_RANGE_RE.test(prevText)) {
        entries.push(prevText);
        current = [trimmed];
        continue;
      }
    }

    current.push(trimmed);
  }

  if (current.length > 0) {
    entries.push(current.join("\n"));
  }

  return entries;
}

function isBullet(line: string): boolean {
  return /^[•\-*▪◦●]\s/.test(line.trim()) || /^\d+[.)]\s/.test(line.trim());
}

function extractBullets(lines: string[]): string[] {
  return lines
    .filter((l) => isBullet(l.trim()))
    .map((l) => l.trim().replace(/^[•\-*▪◦●]\s*/, "").replace(/^\d+[.)]\s*/, ""));
}

export function extractExperiences(text: string): ExtractedExperience[] {
  const entries = splitEntries(text);
  const results: ExtractedExperience[] = [];

  for (const entry of entries) {
    const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let hits = 0;
    const total = 5; // company, title, dates, location, bullets

    // Extract date range
    const dateMatch = entry.match(DATE_RANGE_RE);
    let startDate = "";
    let endDate: string | undefined;
    let current = false;
    if (dateMatch) {
      startDate = dateMatch[1];
      const endRaw = dateMatch[2];
      if (/present|current/i.test(endRaw)) {
        current = true;
        endDate = "Present";
      } else {
        endDate = endRaw;
      }
      hits++;
    }

    // Extract location
    const locMatch = entry.match(LOCATION_RE);
    const remMatch = entry.match(REMOTE_RE);
    const location = locMatch
      ? `${locMatch[1]}, ${locMatch[2]}`
      : remMatch
        ? "Remote"
        : undefined;
    if (location) hits++;

    // Extract bullets
    const bullets = extractBullets(lines);
    if (bullets.length > 0) hits++;

    // Find title and company from non-bullet, non-date lines
    const headerLines = lines.filter(
      (l) => !isBullet(l) && !DATE_RANGE_RE.test(l)
    );

    let title = "";
    let company = "";

    // Strategy: look for lines matching title keywords
    for (const hl of headerLines) {
      // Remove location and date fragments for cleaner matching
      const clean = hl
        .replace(LOCATION_RE, "")
        .replace(REMOTE_RE, "")
        .replace(DATE_RANGE_RE, "")
        .trim();
      if (!clean) continue;

      if (TITLE_RE.test(clean) && !title) {
        title = clean.replace(/[|,]\s*$/, "").trim();
        hits++;
      } else if (!company) {
        company = clean.replace(/[|,]\s*$/, "").trim();
        hits++;
      }
    }

    // If we found a date range line that also contains title/company info, parse it
    if (!title && !company && dateMatch) {
      const dateLine = lines.find((l) => DATE_RANGE_RE.test(l)) || "";
      const beforeDate = dateLine.split(DATE_RANGE_RE)[0].trim();
      if (beforeDate) {
        if (TITLE_RE.test(beforeDate)) {
          title = beforeDate.replace(/[|,–—-]\s*$/, "").trim();
          hits++;
        } else {
          company = beforeDate.replace(/[|,–—-]\s*$/, "").trim();
          hits++;
        }
      }
    }

    // Swap if title looks more like company (no title keywords but company slot has them)
    if (!title && company && TITLE_RE.test(company)) {
      title = company;
      company = "";
    }

    // Skip entries with almost no useful data
    if (!title && !company && bullets.length === 0 && !dateMatch) continue;

    results.push({
      id: generateId(),
      company,
      title,
      location,
      startDate,
      endDate,
      current,
      description: bullets[0] || "",
      highlights: bullets,
      skills: [],
      confidence: clampConfidence(hits / total),
    });
  }

  return results;
}

// ─── 3. Education extraction ────────────────────────────────────────

export function extractEducation(text: string): ExtractedEducation[] {
  const entries = splitEntries(text);
  const results: ExtractedEducation[] = [];

  for (const entry of entries) {
    const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let hits = 0;
    const total = 5; // degree, institution, field, dates, gpa

    // Find degree
    let degree = "";
    let degreeLine = "";
    for (const line of lines) {
      for (const pattern of DEGREE_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          degree = match[0];
          degreeLine = line;
          hits++;
          break;
        }
      }
      if (degree) break;
    }

    // If no degree keyword found, skip this entry
    if (!degree && !DATE_RANGE_RE.test(entry)) continue;

    // Extract field of study from degree line
    let field = "";
    if (degreeLine) {
      // Patterns like "B.S. in Computer Science" or "Bachelor of Science, Computer Science"
      const fieldMatch = degreeLine.match(
        /(?:in|of|,)\s+([A-Z][A-Za-z\s&]+?)(?:\s*[,|(\n]|$)/
      );
      if (fieldMatch) {
        field = fieldMatch[1].trim();
        hits++;
      }
    }

    // Extract dates
    const dateMatch = entry.match(DATE_RANGE_RE);
    let startDate: string | undefined;
    let endDate: string | undefined;
    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = /present|current/i.test(dateMatch[2]) ? "Present" : dateMatch[2];
      hits++;
    } else {
      const singleDate = entry.match(SINGLE_DATE_RE);
      if (singleDate) {
        endDate = singleDate[1];
        hits++;
      }
    }

    // Extract GPA
    let gpa: string | undefined;
    const gpaMatch = entry.match(GPA_RE) || entry.match(GPA_SLASH_RE);
    if (gpaMatch) {
      gpa = gpaMatch[2] ? `${gpaMatch[1]}/${gpaMatch[2]}` : gpaMatch[1];
      hits++;
    }

    // Institution: line that isn't the degree line and isn't a bullet
    let institution = "";
    for (const line of lines) {
      if (line === degreeLine) continue;
      if (isBullet(line)) continue;
      if (DATE_RANGE_RE.test(line) && !line.replace(DATE_RANGE_RE, "").trim()) continue;
      const clean = line
        .replace(DATE_RANGE_RE, "")
        .replace(SINGLE_DATE_RE, "")
        .replace(GPA_RE, "")
        .replace(GPA_SLASH_RE, "")
        .replace(LOCATION_RE, "")
        .trim();
      if (clean && clean.length > 2) {
        institution = clean.replace(/[|,]\s*$/, "").trim();
        hits++;
        break;
      }
    }

    // If degree line contains institution too (e.g., "B.S. Computer Science, MIT")
    if (!institution && degreeLine) {
      // Take the part after removing degree and field
      const remaining = degreeLine
        .replace(DEGREE_PATTERNS.find((p) => p.test(degreeLine)) || "", "")
        .replace(/(?:in|of)\s+[A-Z][A-Za-z\s&]+/, "")
        .replace(/[,|]\s*/, "")
        .trim();
      if (remaining && remaining.length > 2) {
        institution = remaining;
        hits++;
      }
    }

    // Highlights: bullets
    const highlights = extractBullets(lines);

    results.push({
      id: generateId(),
      institution,
      degree,
      field,
      startDate,
      endDate,
      gpa,
      highlights,
      confidence: clampConfidence(hits / total),
    });
  }

  return results;
}

// ─── 4. Skills extraction ───────────────────────────────────────────

function categorizeSkill(
  name: string
): Skill["category"] {
  const lower = name.toLowerCase().trim();
  if (PROGRAMMING_LANGUAGES.has(lower)) return "technical";
  if (FRAMEWORKS.has(lower)) return "technical";
  if (TOOLS.has(lower)) return "tool";
  if (SOFT_SKILLS.has(lower)) return "soft";
  // Check partial matches for multi-word entries
  const softArr = Array.from(SOFT_SKILLS);
  for (const s of softArr) {
    if (lower.includes(s) || s.includes(lower)) return "soft";
  }
  return "other";
}

export function extractSkills(text: string): ExtractedSkill[] {
  const skills: ExtractedSkill[] = [];
  const seen = new Set<string>();

  // Split by common delimiters: comma, pipe, bullet, newline
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Remove category headers like "Languages:", "Frameworks:", "Tools:"
    const withoutHeader = trimmed.replace(
      /^(?:Languages|Frameworks|Libraries|Tools|Technologies|Technical Skills|Soft Skills|Programming|Databases|Cloud|DevOps|Other)[:\s-]*/i,
      ""
    );

    // Split by comma, pipe, bullet, semicolon
    const items = withoutHeader
      .split(/[,|;•·▪◦●]|\s{2,}/)
      .map((s) => s.replace(/^[-*]\s*/, "").trim())
      .filter((s) => s.length > 0 && s.length < 50);

    for (const item of items) {
      const normalized = item.toLowerCase().trim();
      if (seen.has(normalized)) continue;
      if (normalized.length < 1) continue;
      seen.add(normalized);

      const category = categorizeSkill(item);
      // Confidence: known categories get higher confidence
      const confidence = category !== "other" ? 0.9 : 0.6;

      skills.push({
        id: generateId(),
        name: item,
        category,
        confidence,
      });
    }
  }

  return skills;
}

// ─── 5. Projects extraction ─────────────────────────────────────────

const URL_RE = /(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[\w]{2,}(?:\/[\w./?=&#-]*)?/gi;

export function extractProjects(text: string): ExtractedProject[] {
  const entries = splitEntries(text);
  const results: ExtractedProject[] = [];

  for (const entry of entries) {
    const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let hits = 0;
    const total = 4; // name, description, technologies, url

    // Name: first non-bullet line
    let name = "";
    for (const line of lines) {
      if (!isBullet(line)) {
        name = line
          .replace(DATE_RANGE_RE, "")
          .replace(URL_RE, "")
          .replace(/[|–—-]\s*$/, "")
          .trim();
        if (name) {
          hits++;
          break;
        }
      }
    }

    // URL
    const urlMatches = entry.match(URL_RE);
    let url: string | undefined;
    if (urlMatches) {
      // Prefer github links
      url =
        urlMatches.find((u) => /github\.com/i.test(u)) || urlMatches[0];
      hits++;
    }

    // Bullets as highlights
    const highlights = extractBullets(lines);
    const description = highlights[0] || "";
    if (description) hits++;

    // Technologies: look for "Technologies:", "Tech Stack:", "Built with:" or bracketed lists
    let technologies: string[] = [];
    for (const line of lines) {
      const techMatch = line.match(
        /(?:Technologies|Tech Stack|Built with|Tools used|Stack)\s*[:\-–]\s*(.*)/i
      );
      if (techMatch) {
        technologies = techMatch[1]
          .split(/[,|;]/)
          .map((s) => s.trim())
          .filter(Boolean);
        hits++;
        break;
      }
      // Bracketed: [React, Node.js, PostgreSQL]
      const bracketMatch = line.match(/\[([^\]]+)\]/);
      if (bracketMatch) {
        technologies = bracketMatch[1]
          .split(/[,|;]/)
          .map((s) => s.trim())
          .filter(Boolean);
        hits++;
        break;
      }
    }

    if (!name && highlights.length === 0) continue;

    results.push({
      id: generateId(),
      name,
      description,
      url,
      technologies,
      highlights,
      confidence: clampConfidence(hits / total),
    });
  }

  return results;
}
