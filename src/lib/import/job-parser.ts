// Job parser utilities for importing jobs from various sources

export interface ParsedJob {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  type?: "full-time" | "part-time" | "contract" | "internship";
  remote?: boolean;
  salary?: string;
  url?: string;
  source?: string;
}

export type JobBoardType = "linkedin" | "indeed" | "greenhouse" | "lever" | "unknown";

/**
 * Detect job board from URL
 */
export function detectJobBoard(url: string): JobBoardType {
  const lowercaseUrl = url.toLowerCase();

  if (lowercaseUrl.includes("linkedin.com")) return "linkedin";
  if (lowercaseUrl.includes("indeed.com")) return "indeed";
  if (lowercaseUrl.includes("greenhouse.io") || lowercaseUrl.includes("boards.greenhouse")) return "greenhouse";
  if (lowercaseUrl.includes("lever.co") || lowercaseUrl.includes("jobs.lever")) return "lever";

  return "unknown";
}

/**
 * Extract keywords from job description
 */
export function extractKeywords(text: string): string[] {
  const keywords: Set<string> = new Set();

  // Common tech skills patterns
  const techPatterns = [
    /\b(react|angular|vue|svelte|next\.?js|nuxt)\b/gi,
    /\b(node\.?js|express|fastify|nest\.?js)\b/gi,
    /\b(python|django|flask|fastapi)\b/gi,
    /\b(java|spring|kotlin)\b/gi,
    /\b(go|golang|rust|c\+\+|c#|\.net)\b/gi,
    /\b(typescript|javascript|es6)\b/gi,
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch)\b/gi,
    /\b(aws|gcp|azure|docker|kubernetes|k8s)\b/gi,
    /\b(git|ci\/cd|jenkins|github\s*actions)\b/gi,
    /\b(graphql|rest|api|microservices)\b/gi,
    /\b(agile|scrum|kanban)\b/gi,
    /\b(machine\s*learning|ml|ai|data\s*science)\b/gi,
    /\b(figma|sketch|adobe\s*xd)\b/gi,
  ];

  for (const pattern of techPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => keywords.add(m.toLowerCase().trim()));
    }
  }

  // Also look for years of experience
  const expPattern = /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/gi;
  const expMatch = expPattern.exec(text);
  if (expMatch) {
    keywords.add(`${expMatch[1]}+ years experience`);
  }

  return Array.from(keywords);
}

/**
 * Extract requirements/responsibilities from text
 */
export function extractBulletPoints(text: string): string[] {
  const bullets: string[] = [];

  // Split by common bullet patterns
  const lines = text.split(/\n|•|◦|◆|▪|●|-\s|\*\s/);

  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.length > 20 && cleaned.length < 500) {
      // Likely a requirement or responsibility
      if (
        cleaned.match(/^(you|we|the|must|should|will|experience|proficiency|knowledge|ability|strong|excellent)/i) ||
        cleaned.match(/required|preferred|bonus|plus/i)
      ) {
        bullets.push(cleaned);
      }
    }
  }

  return bullets.slice(0, 15); // Limit to 15 items
}

/**
 * Detect job type from text
 */
export function detectJobType(text: string): "full-time" | "part-time" | "contract" | "internship" | undefined {
  const lowercaseText = text.toLowerCase();

  if (lowercaseText.includes("intern") || lowercaseText.includes("internship")) {
    return "internship";
  }
  if (lowercaseText.includes("contract") || lowercaseText.includes("contractor")) {
    return "contract";
  }
  if (lowercaseText.includes("part-time") || lowercaseText.includes("part time")) {
    return "part-time";
  }
  if (lowercaseText.includes("full-time") || lowercaseText.includes("full time")) {
    return "full-time";
  }

  return undefined;
}

/**
 * Detect if job is remote
 */
export function detectRemote(text: string): boolean {
  const lowercaseText = text.toLowerCase();
  return (
    lowercaseText.includes("remote") ||
    lowercaseText.includes("work from home") ||
    lowercaseText.includes("wfh") ||
    lowercaseText.includes("fully distributed")
  );
}

/**
 * Extract salary from text
 */
export function extractSalary(text: string): string | undefined {
  // Match salary patterns like $100,000 - $150,000 or $100k - $150k
  const salaryPattern = /\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?(?:\s*(?:per|\/)\s*(?:year|yr|annum|annual))?/gi;
  const match = salaryPattern.exec(text);
  return match ? match[0] : undefined;
}

/**
 * Parse plain text job posting
 */
export function parseJobText(text: string, url?: string): ParsedJob {
  const lines = text.split("\n").filter((l) => l.trim());

  // Try to extract title (usually first non-empty line or one with common patterns)
  let title = "";
  let company = "";
  let location = "";

  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();

    // Title patterns
    if (!title && (
      trimmed.match(/^(senior|junior|lead|principal|staff|mid-level)?\s*(software|frontend|backend|full.?stack|devops|data|product|ux|ui)/i) ||
      trimmed.match(/engineer|developer|designer|manager|analyst|architect/i)
    )) {
      title = trimmed;
      continue;
    }

    // Company patterns
    if (!company && (
      trimmed.match(/^at\s+/i) ||
      trimmed.match(/company:|employer:/i) ||
      trimmed.match(/^(inc\.|llc|corp\.|ltd\.?|co\.)$/i)
    )) {
      company = trimmed.replace(/^at\s+|company:|employer:/i, "").trim();
      continue;
    }

    // Location patterns
    if (!location && (
      trimmed.match(/,\s*(ca|ny|tx|wa|fl|il|ma|co|ga|nc|pa|az|oh|va|nj|mi)/i) ||
      trimmed.match(/remote|hybrid|on-?site/i) ||
      trimmed.match(/location:/i)
    )) {
      location = trimmed.replace(/location:/i, "").trim();
    }
  }

  // Fallback: use first line as title
  if (!title && lines.length > 0) {
    title = lines[0].slice(0, 100);
  }

  // Fallback: try to extract company from URL
  if (!company && url) {
    const board = detectJobBoard(url);
    if (board === "greenhouse" || board === "lever") {
      const match = url.match(/(?:boards\.greenhouse\.io|jobs\.lever\.co)\/([^\/]+)/);
      if (match) {
        company = match[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }

  // Extract description (main body of text)
  const description = text.slice(0, 3000); // Limit description length

  return {
    title: title || "Untitled Position",
    company: company || "Unknown Company",
    location: location || undefined,
    description,
    requirements: extractBulletPoints(text),
    type: detectJobType(text),
    remote: detectRemote(text),
    salary: extractSalary(text),
    url,
    source: url ? detectJobBoard(url) : undefined,
  };
}

/**
 * Parse JSON structured data (for APIs like greenhouse, lever)
 */
export function parseJobJSON(data: Record<string, unknown>): ParsedJob {
  // Handle common JSON structures
  const title = (data.title || data.name || data.position || data.job_title || "") as string;
  const company = (data.company || data.company_name || data.employer || data.organization || "") as string;
  const location = (data.location || data.job_location || data.office_location || "") as string;
  const description = (data.description || data.content || data.job_description || data.summary || "") as string;

  const reqField = data.requirements || data.qualifications || data.skills || [];
  const requirements = Array.isArray(reqField) ? reqField.map(String) : [];

  return {
    title: title || "Untitled Position",
    company: company || "Unknown Company",
    location: location || undefined,
    description: typeof description === "string" ? description : JSON.stringify(description),
    requirements,
    type: detectJobType(description),
    remote: detectRemote(description) || detectRemote(location),
    salary: extractSalary(description),
  };
}
