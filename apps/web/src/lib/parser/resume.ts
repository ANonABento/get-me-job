import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type {
  Profile,
  Experience,
  Education,
  Skill,
  Project,
  LLMConfig,
  DocumentType,
  CoverLetterData,
  PortfolioData,
  PortfolioProjectData,
  CareerNotesData,
  CareerNotesProjectData,
  ReferenceLetterData,
  CertificateData,
} from "@/types";
import { generateId, extractJSON } from "@/lib/utils";

const RESUME_PARSE_PROMPT = `You are a resume parser. Extract structured information from the following resume text.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "website": "example.com"
  },
  "summary": "Professional summary or objective statement",
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "description": "Brief description of role",
      "highlights": ["Achievement 1", "Achievement 2"],
      "skills": ["Skill 1", "Skill 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2016",
      "endDate": "2020",
      "gpa": "3.8",
      "highlights": ["Honor 1", "Award 1"]
    }
  ],
  "skills": [
    {
      "name": "Python",
      "category": "technical",
      "proficiency": "expert"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What the project does",
      "url": "github.com/user/project",
      "technologies": ["React", "Node.js"],
      "highlights": ["Key achievement"]
    }
  ]
}

Rules:
- Extract only information that is clearly present in the resume
- Use null for missing optional fields
- Categories for skills: technical, soft, language, tool, other
- Proficiency levels: beginner, intermediate, advanced, expert
- For dates, use the format shown (e.g., "Jan 2020" or just "2020")
- current should be true only if the role is ongoing
- Return ONLY the JSON object, no explanation or markdown

Resume text:
`;

async function callLLMParser<T>(
  text: string,
  prompt: string,
  llmConfig: LLMConfig,
  maxTokens: number,
): Promise<T> {
  const client = new LLMClient(llmConfig);
  const response = await client.complete({
    messages: [{ role: "user", content: prompt + text }],
    temperature: 0.1,
    maxTokens,
  });
  return parseJSONFromLLM<T>(response);
}

export async function parseResumeWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<Partial<Profile>> {
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: RESUME_PARSE_PROMPT + text,
      },
    ],
    temperature: 0.1,
    maxTokens: 4096,
  });

  const parsed = extractJSON(response);

  // Add IDs and coerce each field with safe defaults to guard against partial LLM responses
  const rawExperiences = (parsed.experiences ?? []) as Record<
    string,
    unknown
  >[];
  const rawEducation = (parsed.education ?? []) as Record<string, unknown>[];
  const rawSkills = (parsed.skills ?? []) as Record<string, unknown>[];
  const rawProjects = (parsed.projects ?? []) as Record<string, unknown>[];

  return {
    contact: (parsed.contact as Profile["contact"]) || { name: "" },
    summary: parsed.summary as string | undefined,
    experiences: rawExperiences.map(
      (e): Experience => ({
        id: generateId(),
        company: (e.company as string) || "",
        title: (e.title as string) || "",
        location: e.location as string | undefined,
        startDate: (e.startDate as string) || "",
        endDate: e.endDate as string | undefined,
        current: (e.current as boolean) || false,
        description: (e.description as string) || "",
        highlights: (e.highlights as string[]) || [],
        skills: (e.skills as string[]) || [],
      }),
    ),
    education: rawEducation.map(
      (e): Education => ({
        id: generateId(),
        institution: (e.institution as string) || "",
        degree: (e.degree as string) || "",
        field: (e.field as string) || "",
        startDate: e.startDate as string | undefined,
        endDate: e.endDate as string | undefined,
        gpa: e.gpa as string | undefined,
        highlights: (e.highlights as string[]) || [],
      }),
    ),
    skills: rawSkills.map(
      (s): Skill => ({
        id: generateId(),
        name: (s.name as string) || "",
        category: (s.category as Skill["category"]) || "other",
        proficiency: s.proficiency as Skill["proficiency"],
      }),
    ),
    projects: rawProjects.map(
      (p): Project => ({
        id: generateId(),
        name: (p.name as string) || "",
        description: (p.description as string) || "",
        url: p.url as string | undefined,
        technologies: (p.technologies as string[]) || [],
        highlights: (p.highlights as string[]) || [],
      }),
    ),
    rawText: text,
  };
}

// Type-specific parsing prompts

const COVER_LETTER_PARSE_PROMPT = `You are a cover letter parser. Extract structured information from the following cover letter text.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "targetCompany": "Company Name or null",
  "targetPosition": "Position Title or null",
  "reusableParagraphs": ["Paragraph 1", "Paragraph 2"],
  "keySellingPoints": ["Point 1", "Point 2"],
  "tone": "professional/casual/enthusiastic/formal"
}

Rules:
- Extract only information clearly present in the text
- Use null for missing fields
- reusableParagraphs should include polished body paragraphs that can be reused later
- keySellingPoints should capture the main arguments the candidate makes
- Return ONLY the JSON object, no explanation or markdown

Cover letter text:
`;

const REFERENCE_LETTER_PARSE_PROMPT = `You are a reference letter parser. Extract structured information from the following reference/recommendation letter.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "refereeName": "Name of person writing the reference or null",
  "relationship": "e.g. Former Manager, Professor, Colleague or null",
  "keyEndorsements": ["Endorsement 1", "Endorsement 2"]
}

Rules:
- Extract only information clearly present in the text
- Use null for missing fields
- keyEndorsements should capture the main positive qualities or achievements mentioned
- Return ONLY the JSON object, no explanation or markdown

Reference letter text:
`;

const CERTIFICATE_PARSE_PROMPT = `You are a certificate/credential parser. Extract structured information from the following certificate or credential document.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "certName": "Certificate or Credential Name or null",
  "issuer": "Issuing Organization or null",
  "date": "Date Issued or null",
  "credentialId": "Credential ID or Verification Number or null"
}

Rules:
- Extract only information clearly present in the text
- Use null for missing fields
- Return ONLY the JSON object, no explanation or markdown

Certificate text:
`;

const PORTFOLIO_PARSE_PROMPT = `You are a portfolio parser. Extract reusable career components from the following portfolio text.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "projects": [
    {
      "name": "Project Name",
      "description": "Short project overview or null",
      "url": "https://example.com or null",
      "technologies": ["React", "Node.js"],
      "proofPoints": ["500 users", "Reduced latency 40%"],
      "bullets": ["Built the thing", "Shipped the result"]
    }
  ],
  "links": ["https://example.com"],
  "caseStudies": ["Case study title"],
  "technologies": ["React"],
  "proofPoints": ["500 users"]
}

Rules:
- Extract only information clearly present in the text
- Create project entries for portfolio projects even when they have no bullets
- technologies should only include explicit stack/tool signals
- Return ONLY the JSON object, no explanation or markdown

Portfolio text:
`;

const CAREER_NOTES_PARSE_PROMPT = `You are a career notes parser. Extract reusable career components from loose notes.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "paragraphs": ["Reusable prose paragraph"],
  "bullets": ["Loose reusable bullet"],
  "achievements": ["Achievement with impact"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Short project note or null",
      "bullets": ["Project bullet"],
      "technologies": ["React"]
    }
  ],
  "skills": ["React"]
}

Rules:
- Treat extraction as lower confidence loose notes; do not invent resume structure
- skills should only include explicit skills/stack/tool signals
- Return ONLY the JSON object, no explanation or markdown

Career notes text:
`;

export async function parseCoverLetterWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<CoverLetterData> {
  const parsed = await callLLMParser<CoverLetterData>(
    text,
    COVER_LETTER_PARSE_PROMPT,
    llmConfig,
    1024,
  );
  return {
    targetCompany: parsed.targetCompany || undefined,
    targetPosition: parsed.targetPosition || undefined,
    reusableParagraphs: parsed.reusableParagraphs || [],
    keySellingPoints: parsed.keySellingPoints || [],
    tone: parsed.tone || undefined,
  };
}

export async function parsePortfolioWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<PortfolioData> {
  const parsed = await callLLMParser<PortfolioData>(
    text,
    PORTFOLIO_PARSE_PROMPT,
    llmConfig,
    2048,
  );
  return {
    projects: (parsed.projects || []).map((project) => ({
      name: project.name || "Untitled Project",
      description: project.description || undefined,
      url: project.url || undefined,
      technologies: project.technologies || [],
      proofPoints: project.proofPoints || [],
      bullets: project.bullets || [],
    })),
    links: parsed.links || [],
    caseStudies: parsed.caseStudies || [],
    technologies: parsed.technologies || [],
    proofPoints: parsed.proofPoints || [],
  };
}

export async function parseCareerNotesWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<CareerNotesData> {
  const parsed = await callLLMParser<CareerNotesData>(
    text,
    CAREER_NOTES_PARSE_PROMPT,
    llmConfig,
    2048,
  );
  return {
    paragraphs: parsed.paragraphs || [],
    bullets: parsed.bullets || [],
    achievements: parsed.achievements || [],
    projects: (parsed.projects || []).map((project) => ({
      name: project.name || "Untitled Project",
      description: project.description || undefined,
      bullets: project.bullets || [],
      technologies: project.technologies || [],
    })),
    skills: parsed.skills || [],
  };
}

export async function parseReferenceLetterWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<ReferenceLetterData> {
  const parsed = await callLLMParser<ReferenceLetterData>(
    text,
    REFERENCE_LETTER_PARSE_PROMPT,
    llmConfig,
    1024,
  );
  return {
    refereeName: parsed.refereeName || undefined,
    relationship: parsed.relationship || undefined,
    keyEndorsements: parsed.keyEndorsements || [],
  };
}

export async function parseCertificateWithLLM(
  text: string,
  llmConfig: LLMConfig,
): Promise<CertificateData> {
  const parsed = await callLLMParser<CertificateData>(
    text,
    CERTIFICATE_PARSE_PROMPT,
    llmConfig,
    512,
  );
  return {
    certName: parsed.certName || undefined,
    issuer: parsed.issuer || undefined,
    date: parsed.date || undefined,
    credentialId: parsed.credentialId || undefined,
  };
}

/**
 * Parse a document using the appropriate type-specific prompt.
 * Returns structured data based on the document type.
 */
export async function parseDocumentByType(
  text: string,
  docType: DocumentType,
  llmConfig: LLMConfig,
): Promise<{
  parsedProfile?: Partial<Profile>;
  coverLetter?: CoverLetterData;
  portfolio?: PortfolioData;
  careerNotes?: CareerNotesData;
  referenceLetter?: ReferenceLetterData;
  certificate?: CertificateData;
}> {
  switch (docType) {
    case "resume":
      return { parsedProfile: await parseResumeWithLLM(text, llmConfig) };
    case "cover_letter":
      return { coverLetter: await parseCoverLetterWithLLM(text, llmConfig) };
    case "portfolio":
      return { portfolio: await parsePortfolioWithLLM(text, llmConfig) };
    case "career_notes":
      return { careerNotes: await parseCareerNotesWithLLM(text, llmConfig) };
    case "reference_letter":
      return {
        referenceLetter: await parseReferenceLetterWithLLM(text, llmConfig),
      };
    case "certificate":
      return { certificate: await parseCertificateWithLLM(text, llmConfig) };
    default:
      return {};
  }
}

// Fallback parser using regex patterns (no LLM required)
export function parseResumeBasic(text: string): Partial<Profile> {
  const lines = text.split("\n").filter((line) => line.trim());

  // Try to extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch?.[0];

  // Try to extract phone
  const phoneMatch = text.match(
    /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  const phone = phoneMatch?.[0];

  // Try to extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const linkedin = linkedinMatch?.[0];

  // Try to extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  const github = githubMatch?.[0];

  // First line is often the name
  const name = lines[0] || "";

  return {
    contact: {
      name,
      email,
      phone,
      linkedin,
      github,
    },
    rawText: text,
    experiences: [],
    education: [],
    skills: [],
    projects: [],
  };
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanListValues(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const cleaned = normalizeWhitespace(
      value.replace(BULLET_PREFIX_PATTERN, ""),
    );
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map((paragraph) => normalizeWhitespace(paragraph))
    .filter((paragraph) => paragraph.length >= 40);
}

function splitSentences(text: string): string[] {
  return cleanListValues(
    text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => sentence.trim().length >= 25),
  );
}

function extractUrls(text: string): string[] {
  return cleanListValues(
    text.match(
      /\bhttps?:\/\/[^\s)>\]]+|\b(?:github|gitlab)\.com\/[^\s)>\]]+/gi,
    ) ?? [],
  );
}

function inferTone(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/[!]/.test(text) || /\b(excited|thrilled|passionate)\b/.test(lower)) {
    return "enthusiastic";
  }
  if (/\b(respectfully|esteemed|formal)\b/.test(lower)) return "formal";
  if (/\b(hi|hello)\b/.test(lower)) return "casual";
  return "professional";
}

function extractTargetPosition(text: string): string | undefined {
  const patterns = [
    /\b(?:applying|apply|application)\s+(?:for|to)\s+(?:the\s+)?([^.\n,]+?)\s+(?:role|position|opportunity|opening)\b/i,
    /\b(?:applying|apply|application)\s+(?:for|to)\s+(?:the\s+)?([^.\n,]+?)(?:\s+(?:at|with)\b|[.,\n])/i,
    /\b(?:for|in)\s+the\s+([^.\n,]+?)\s+(?:role|position|opportunity|opening)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1] ? normalizeWhitespace(match[1]) : "";
    if (value && value.length <= 80) return value;
  }
  return undefined;
}

function extractTargetCompany(text: string): string | undefined {
  const patterns = [
    /\b(?:at|with|join)\s+([A-Z][A-Za-z0-9& .-]{2,60})(?:[,.]|\s+(?:as|because|to|for)\b)/,
    /\bDear\s+([A-Z][A-Za-z0-9& .-]{2,60})\s+(?:team|hiring team|recruiting team),?/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1] ? normalizeWhitespace(match[1]) : "";
    if (value && !/hiring manager|recruiter|team/i.test(value)) return value;
  }
  return undefined;
}

export function parseCoverLetterBasic(text: string): CoverLetterData {
  const paragraphs = splitParagraphs(text).filter(
    (paragraph) =>
      !/^(dear|to whom it may concern)\b/i.test(paragraph) &&
      !/\b(sincerely|best regards|respectfully)\b/i.test(paragraph),
  );
  const sentences = splitSentences(text);
  const keySellingPoints = sentences.filter((sentence) =>
    /\b(?:built|led|managed|shipped|improved|increased|reduced|created|designed|experience|skilled|background|impact|help)\b/i.test(
      sentence,
    ),
  );

  return {
    targetCompany: extractTargetCompany(text),
    targetPosition: extractTargetPosition(text),
    reusableParagraphs: paragraphs,
    keySellingPoints: cleanListValues(keySellingPoints).slice(0, 8),
    tone: inferTone(text),
  };
}

function extractExplicitList(text: string, labels: string[]): string[] {
  const escaped = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:${escaped.join("|")})\\s*:\\s*([^\\n]+)`,
    "gi",
  );
  const values: string[] = [];
  for (const match of text.matchAll(pattern)) {
    values.push(
      ...String(match[1])
        .split(/[,;|]/)
        .map((item) => item.trim()),
    );
  }
  return cleanListValues(values);
}

function isLikelyMetricOrProof(line: string): boolean {
  return /\b(?:\d+%?|\$[\d,.]+|users?|customers?|stars?|revenue|latency|conversion|retention|award|winner|launched|shipped|reduced|increased|improved)\b/i.test(
    line,
  );
}

const BULLET_PREFIX_PATTERN = /^(?:[-*•●]|\d+[.)])[\s\u200b-\u200d\ufeff]+/;

const PORTFOLIO_TECH_HINTS = new Set(
  [
    "aiml",
    "altium designer",
    "android studio",
    "arduino",
    "aws",
    "blender",
    "c",
    "c#",
    "c++",
    "cuda",
    "docker",
    "eclipse",
    "esp32",
    "flask",
    "freeRTOS",
    "fsm",
    "fusion360",
    "gpio",
    "java",
    "javascript",
    "jetson nano",
    "linux",
    "llama.cpp",
    "motor control",
    "node.js",
    "onshape",
    "opencv",
    "python",
    "pytorch",
    "react",
    "ros2",
    "stm32",
    "three.js",
    "tts",
    "unity 2d/3d",
    "visual studio",
    "vs code",
    "whisper",
  ].map((value) => value.toLowerCase()),
);

function isPortfolioBoilerplateLine(line: string): boolean {
  const normalized = normalizeWhitespace(line).toLowerCase();
  if (!normalized) return true;
  if (/^(portfolio|selected work|projects?)$/.test(normalized)) return true;
  if (normalized === "kevin jiang resume") return true;
  if (/linkedin\.com\/in\//i.test(line)) {
    return true;
  }
  if (/^github\.com\/[A-Za-z0-9_-]+$/i.test(normalized)) {
    return true;
  }
  return false;
}

function splitPortfolioStack(stack: string): string[] {
  return cleanListValues(
    stack.split(/[|,;]/).map((item) => item.replace(/\s+/g, " ").trim()),
  );
}

function hasPortfolioTechSignal(tokens: string[]): boolean {
  return tokens.some((token) => {
    const normalized = token.toLowerCase();
    if (PORTFOLIO_TECH_HINTS.has(normalized)) return true;
    return /\b(?:api|cad|cli|css|gpu|html|ide|sdk|sql|ui|ux|vr|web|3d|3d-printing)\b/i.test(
      token,
    );
  });
}

function parseVisualPortfolioHeading(
  line: string,
): { name: string; technologies: string[] } | null {
  const match = normalizeWhitespace(line).match(/^(.{2,80}?)\s+[—–-]\s+(.+)$/);
  if (!match) return null;

  const name = normalizeWhitespace(match[1]);
  const technologies = splitPortfolioStack(match[2]);
  if (!name || isPortfolioBoilerplateLine(name)) return null;
  if (technologies.length < 2 && !hasPortfolioTechSignal(technologies)) {
    return null;
  }
  if (!hasPortfolioTechSignal(technologies) && technologies.length < 3) {
    return null;
  }
  return { name, technologies };
}

function isPortfolioBullet(line: string): boolean {
  return BULLET_PREFIX_PATTERN.test(line);
}

function isExplicitPortfolioListLine(line: string): boolean {
  return /^(stack|technologies|tools|built with)\s*:/i.test(line);
}

function isPortfolioUrlLine(line: string): boolean {
  return /^https?:\/\//i.test(line) || /^(?:github|gitlab)\.com\//i.test(line);
}

function isLikelyPortfolioDescription(line: string): boolean {
  const normalized = normalizeWhitespace(line);
  if (normalized.length < 60) return false;
  if (
    isPortfolioBullet(normalized) ||
    isPortfolioUrlLine(normalized) ||
    isExplicitPortfolioListLine(normalized) ||
    isPortfolioBoilerplateLine(normalized)
  ) {
    return false;
  }
  if (
    /^(?:cad|real life|partial view|system|wiring|testing|printed|routed)\b/i.test(
      normalized,
    )
  ) {
    return false;
  }
  return true;
}

function parsePortfolioProjectBlock(
  name: string,
  block: string[],
  headingTechnologies: string[] = [],
): PortfolioProjectData {
  const contentLines = block.filter(
    (line) => !isPortfolioBoilerplateLine(line),
  );
  const joined = contentLines.join("\n");
  const urls = extractUrls(joined);
  const technologies = cleanListValues([
    ...headingTechnologies,
    ...extractExplicitList(joined, [
      "stack",
      "technologies",
      "tools",
      "built with",
    ]),
  ]);
  const bullets = cleanListValues(
    contentLines.filter((line) => isPortfolioBullet(line)),
  );
  const proofPoints = cleanListValues(
    [...bullets, ...contentLines]
      .map((line) => normalizeWhitespace(line))
      .filter(isLikelyMetricOrProof),
  );
  const description = contentLines
    .map((line) => normalizeWhitespace(line))
    .find(isLikelyPortfolioDescription);

  return {
    name: normalizeWhitespace(name) || "Untitled Project",
    description,
    url: urls[0],
    technologies,
    proofPoints,
    bullets,
  };
}

export function parsePortfolioBasic(text: string): PortfolioData {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const projects: PortfolioProjectData[] = [];
  let currentName = "";
  let currentHeadingTechnologies: string[] = [];
  let currentBlock: string[] = [];

  const flush = () => {
    if (!currentName) return;
    projects.push(
      parsePortfolioProjectBlock(
        currentName,
        currentBlock,
        currentHeadingTechnologies,
      ),
    );
    currentName = "";
    currentHeadingTechnologies = [];
    currentBlock = [];
  };

  for (const line of lines) {
    if (isPortfolioBoilerplateLine(line)) {
      continue;
    }

    const visualHeading = parseVisualPortfolioHeading(line);
    if (visualHeading) {
      flush();
      currentName = visualHeading.name;
      currentHeadingTechnologies = visualHeading.technologies;
      continue;
    }

    const heading = line.match(
      /^(?:#{1,4}\s*)?(?:project|case study|selected work)\s*[:\-]\s*(.+)$/i,
    );
    const markdownHeading = line.match(/^#{2,4}\s+(.+)$/);
    if (heading || markdownHeading) {
      flush();
      currentName = normalizeWhitespace(
        (heading?.[1] ?? markdownHeading?.[1]) || "",
      );
      continue;
    }
    if (!currentName && /(?:github\.com|https?:\/\/)/i.test(line)) {
      currentName = "Portfolio Project";
    }
    if (currentName) currentBlock.push(line);
  }
  flush();

  if (projects.length === 0) {
    const paragraphs = splitParagraphs(text);
    const fallbackName =
      lines.find(
        (line) => /^[-*•]/.test(line) === false && line.length <= 80,
      ) || "Portfolio Project";
    if (paragraphs.length > 0 || extractUrls(text).length > 0) {
      projects.push(parsePortfolioProjectBlock(fallbackName, lines.slice(1)));
    }
  }

  return {
    projects,
    links: extractUrls(text),
    caseStudies: cleanListValues(
      lines
        .filter((line) => /\bcase study\b/i.test(line))
        .map((line) => line.replace(/^#+\s*/, "")),
    ),
    technologies: extractExplicitList(text, [
      "stack",
      "technologies",
      "tools",
      "skills",
    ]),
    proofPoints: cleanListValues(lines.filter(isLikelyMetricOrProof)),
  };
}

function inferProjectName(line: string): string | null {
  const match = line.match(
    /\b(?:project|built|shipped|launched)\s*[:\-]?\s*([A-Z][A-Za-z0-9 &.-]{2,60})/i,
  );
  if (!match?.[1]) return null;
  return normalizeWhitespace(match[1].replace(/^project\s+/i, ""));
}

export function parseCareerNotesBasic(text: string): CareerNotesData {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = cleanListValues(
    lines.filter((line) => /^(?:[-*•]|\d+[.)])\s+/.test(line)),
  );
  const paragraphs = splitParagraphs(text).filter(
    (paragraph) =>
      !/(?:^|\s)(?:[-*•]|\d+[.)])\s+/.test(paragraph) &&
      !/^(?:career notes?|notes?|skills|stack|tools)\b/i.test(paragraph),
  );
  const skills = extractExplicitList(text, ["skills", "stack", "tools"]);
  const achievements = cleanListValues(
    bulletLines.filter((line) => isLikelyMetricOrProof(line)),
  );
  const projectMap = new Map<string, CareerNotesProjectData>();
  for (const line of bulletLines) {
    const projectName = inferProjectName(line);
    if (!projectName) continue;
    const existing = projectMap.get(projectName) ?? {
      name: projectName,
      bullets: [],
      technologies: [],
    };
    existing.bullets.push(line);
    projectMap.set(projectName, existing);
  }

  return {
    paragraphs,
    bullets: bulletLines,
    achievements,
    projects: Array.from(projectMap.values()),
    skills,
  };
}
