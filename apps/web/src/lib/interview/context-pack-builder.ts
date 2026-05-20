import { getDocument, getProfile, listDocumentsPaginated } from "@/lib/db";
import { getJobs, getJob } from "@/lib/db/jobs";
import {
  getBankEntries,
  insertBankEntry,
  type InsertBankEntry,
} from "@/lib/db/profile-bank";
import { getCompanyResearch } from "@/lib/db/company-research";
import type {
  InterviewContextMode,
  InterviewContextPackSummary,
  InterviewContextSourceRef,
} from "@/types/interview";
import type { BankCategory, BankEntry, JobDescription, Profile } from "@/types";

interface BuildContextPackInput {
  userId: string;
  mode: InterviewContextMode;
  sources: InterviewContextSourceRef[];
  customInput?: string;
  deepDiveEnabled: boolean;
}

interface ResolvedSource {
  ref: InterviewContextSourceRef;
  label: string;
  text: string;
  saveCategory?: BankCategory;
  saveContent?: Record<string, unknown>;
  warning?: string;
}

export interface BuiltInterviewContextPack {
  title: string;
  mode: InterviewContextMode;
  status: "ready" | "partial" | "failed";
  sources: InterviewContextSourceRef[];
  summary: InterviewContextPackSummary;
  rawContextExcerpt?: string;
  deepDiveEnabled: boolean;
}

const STACK_TERMS = [
  "typescript",
  "javascript",
  "python",
  "react",
  "next.js",
  "node",
  "postgres",
  "sqlite",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "graphql",
  "rest",
  "fastapi",
  "django",
  "flask",
  "tailwind",
  "playwright",
  "vitest",
];

const CLAIM_PATTERNS = [
  /\b(built|created|implemented|shipped|launched)\b/i,
  /\b(led|owned|managed|coordinated)\b/i,
  /\b(optimized|improved|reduced|increased|scaled)\b/i,
  /\b(debugged|fixed|resolved|migrated)\b/i,
];

function compactText(value: string, max = 8000): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function stringifyContent(content: Record<string, unknown>): string {
  return Object.entries(content)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
      if (typeof value === "string" && value.trim()) return `${key}: ${value}`;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function jobText(job: JobDescription): string {
  return [
    `${job.title} at ${job.company}`,
    job.description,
    `Keywords: ${(job.keywords ?? []).join(", ")}`,
    `Requirements: ${(job.requirements ?? []).join(", ")}`,
    `Responsibilities: ${(job.responsibilities ?? []).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function profileExperienceText(
  profile: Profile,
  id?: string,
): ResolvedSource[] {
  return profile.experiences
    .filter((experience) => !id || experience.id === id)
    .map((experience) => ({
      ref: {
        type: "profile-experience" as const,
        id: experience.id,
        label: `${experience.title} at ${experience.company}`,
      },
      label: `${experience.title} at ${experience.company}`,
      text: compactText(
        [
          experience.description,
          ...(experience.highlights ?? []),
          ...(experience.skills ?? []),
        ].join("\n"),
      ),
      saveCategory: "experience" as const,
      saveContent: experience as unknown as Record<string, unknown>,
    }));
}

function profileProjectText(profile: Profile, id?: string): ResolvedSource[] {
  return profile.projects
    .filter((project) => !id || project.id === id)
    .map((project) => ({
      ref: {
        type: "profile-project" as const,
        id: project.id,
        label: project.name,
      },
      label: project.name,
      text: compactText(
        [
          project.name,
          project.description,
          `Technologies: ${(project.technologies ?? []).join(", ")}`,
          ...(project.highlights ?? []),
        ].join("\n"),
      ),
      saveCategory: "project" as const,
      saveContent: project as unknown as Record<string, unknown>,
    }));
}

function profileSkillText(profile: Profile, id?: string): ResolvedSource[] {
  return profile.skills
    .filter((skill) => !id || skill.id === id)
    .map((skill) => ({
      ref: {
        type: "profile-skill" as const,
        id: skill.id,
        label: skill.name,
      },
      label: skill.name,
      text: compactText(
        `${skill.name}\nCategory: ${skill.category}\nProficiency: ${skill.proficiency ?? "unspecified"}`,
      ),
      saveCategory: "skill" as const,
      saveContent: skill as unknown as Record<string, unknown>,
    }));
}

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Slothing Interview Prep" },
  });
  if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
  return response.text();
}

async function fetchGithubContext(
  url: string,
  deepDive: boolean,
): Promise<string> {
  const repo = parseGithubUrl(url);
  if (!repo) return "";

  const base = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD`;
  const parts: string[] = [];
  for (const file of [
    "README.md",
    ...(deepDive
      ? [
          "package.json",
          "pyproject.toml",
          "requirements.txt",
          "go.mod",
          "Cargo.toml",
          "docker-compose.yml",
        ]
      : []),
  ]) {
    try {
      const text = await fetchText(`${base}/${file}`);
      parts.push(`FILE: ${file}\n${text.slice(0, 5000)}`);
    } catch {
      // Public repos often omit one or more manifests.
    }
  }

  return parts.join("\n\n");
}

async function fetchUrlContext(
  url: string,
  deepDive: boolean,
): Promise<string> {
  const github = parseGithubUrl(url);
  if (github) return fetchGithubContext(url, deepDive);
  const html = await fetchText(url);
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

async function resolveSource(
  userId: string,
  source: InterviewContextSourceRef,
  deepDiveEnabled: boolean,
): Promise<ResolvedSource | null> {
  if (source.type === "custom-text") {
    const text = source.text || "";
    return {
      ref: source,
      label: source.label || "Custom notes",
      text: compactText(text),
      saveCategory: source.category || "paragraph",
      saveContent: { title: source.label || "Interview notes", body: text },
    };
  }

  if (source.type === "custom-url" && source.url) {
    try {
      const text = await fetchUrlContext(source.url, deepDiveEnabled);
      return {
        ref: source,
        label: source.label || source.url,
        text: compactText(text),
        saveCategory: source.category || "project",
        saveContent: {
          name: source.label || source.url,
          url: source.url,
          description: compactText(text, 600),
          technologies: detectStack(text),
          highlights: extractClaims(text).slice(0, 5),
        },
      };
    } catch (error) {
      return {
        ref: source,
        label: source.label || source.url,
        text: "",
        warning: `Could not read ${source.url}: ${(error as Error).message}`,
      };
    }
  }

  if (source.type === "opportunity" && source.id) {
    const job = getJob(source.id, userId);
    if (!job) return null;
    return {
      ref: source,
      label: `${job.title} at ${job.company}`,
      text: jobText(job),
    };
  }

  if (source.type === "document" && source.id) {
    const document = getDocument(source.id, userId);
    if (!document) return null;
    return {
      ref: source,
      label: document.filename,
      text: compactText(
        document.extractedText || JSON.stringify(document.parsedData || {}),
      ),
      warning: document.extractedText
        ? undefined
        : "Document has no extracted text yet.",
    };
  }

  if (source.type === "bank" && source.id) {
    const entry = getBankEntries(userId).find(
      (candidate) => candidate.id === source.id,
    );
    if (!entry) return null;
    return {
      ref: { ...source, category: entry.category },
      label: bankEntryLabel(entry),
      text: compactText(stringifyContent(entry.content)),
      saveCategory: entry.category,
      saveContent: entry.content,
    };
  }

  if (source.type === "company-research" && source.label) {
    const research = getCompanyResearch(source.label, userId);
    if (!research) return null;
    return {
      ref: source,
      label: `${research.companyName} research`,
      text: compactText(
        [
          research.summary,
          ...(research.keyFacts ?? []),
          research.cultureNotes,
          research.recentNews,
          ...(research.interviewQuestions ?? []),
        ].join("\n"),
      ),
    };
  }

  const profile = getProfile(userId);
  if (!profile) return null;
  if (source.type === "profile-experience") {
    return profileExperienceText(profile, source.id)[0] ?? null;
  }
  if (source.type === "profile-project") {
    return profileProjectText(profile, source.id)[0] ?? null;
  }
  if (source.type === "profile-skill") {
    return profileSkillText(profile, source.id)[0] ?? null;
  }
  return null;
}

function detectStack(text: string): string[] {
  const lower = text.toLowerCase();
  return STACK_TERMS.filter((term) => lower.includes(term)).slice(0, 12);
}

function extractClaims(text: string): string[] {
  return text
    .split(/[.\n]/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 20 &&
        CLAIM_PATTERNS.some((pattern) => pattern.test(line)),
    )
    .slice(0, 12);
}

function extractSkills(text: string): string[] {
  return Array.from(
    new Set(
      [
        ...detectStack(text),
        ...(text.match(/\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g) ?? []),
      ]
        .map((skill) => skill.trim())
        .filter((skill) => skill.length <= 28),
    ),
  ).slice(0, 16);
}

function weakSpotsFor(text: string, mode: InterviewContextMode): string[] {
  const weakSpots: string[] = [];
  if (
    !/\d+%|\$\d+|\b\d+[xX]\b|\b\d+\s+(users|people|ms|seconds|hours|days|weeks)/.test(
      text,
    )
  ) {
    weakSpots.push("No measurable outcome found");
  }
  if (
    mode === "project-defense" &&
    !/trade-?off|architecture|design|constraint/i.test(text)
  ) {
    weakSpots.push("Few architecture or trade-off details");
  }
  if (mode === "skill-grill" && text.length < 300) {
    weakSpots.push("Skill context is light; expect fundamentals first");
  }
  if (!/I |my |owned|led|built|implemented/i.test(text)) {
    weakSpots.push("Ownership is not explicit");
  }
  return weakSpots.slice(0, 6);
}

function questionAnglesFor(
  mode: InterviewContextMode,
  stack: string[],
  claims: string[],
): string[] {
  const base: Record<InterviewContextMode, string[]> = {
    role: ["role fit", "company motivation", "requirement match"],
    "project-defense": [
      "architecture choices",
      "hardest bug",
      "scaling limit",
      "trade-offs",
    ],
    "skill-grill": [
      "fundamentals",
      "debugging",
      "pitfalls",
      "practical examples",
    ],
    "experience-deep-dive": ["scope", "stakeholders", "impact", "conflict"],
    "resume-claim": ["metrics", "ownership", "before-and-after", "evidence"],
    "document-based": ["claims in document", "project details", "skill proof"],
    "mixed-context": [
      "role match",
      "project proof",
      "skill depth",
      "weak claims",
    ],
  };
  return Array.from(
    new Set([...base[mode], ...stack.slice(0, 4), ...claims.slice(0, 3)]),
  ).slice(0, 10);
}

function bankEntryLabel(entry: BankEntry): string {
  const content = entry.content;
  return (
    String(
      content.name ||
        content.title ||
        content.company ||
        content.institution ||
        "",
    ).trim() || `${entry.category} entry`
  );
}

function titleFor(mode: InterviewContextMode, labels: string[]): string {
  const modeLabel = mode.replace(/-/g, " ");
  return `${modeLabel}: ${labels.slice(0, 2).join(" + ") || "custom context"}`;
}

export async function buildInterviewContextPack({
  userId,
  mode,
  sources,
  customInput,
  deepDiveEnabled,
}: BuildContextPackInput): Promise<BuiltInterviewContextPack> {
  const customSources = customInput?.trim()
    ? [
        {
          type: "custom-text" as const,
          label: "Custom interview notes",
          text: customInput.trim(),
        },
      ]
    : [];
  const resolved = (
    await Promise.all(
      [...sources, ...customSources].map((source) =>
        resolveSource(userId, source, deepDiveEnabled),
      ),
    )
  ).filter((source): source is ResolvedSource => Boolean(source));

  const combinedText = resolved
    .map((source) => source.text)
    .filter(Boolean)
    .join("\n\n");
  const labels = resolved.map((source) => source.label);
  const warnings = resolved
    .map((source) => source.warning)
    .filter((warning): warning is string => Boolean(warning));
  if (!combinedText.trim()) warnings.push("No usable source text was found.");

  const detectedStack = detectStack(combinedText);
  const claims = extractClaims(combinedText);
  const summary: InterviewContextPackSummary = {
    detectedStack,
    skills: extractSkills(combinedText),
    claims,
    weakSpots: weakSpotsFor(combinedText, mode),
    questionAngles: questionAnglesFor(mode, detectedStack, claims),
    warnings,
    sourceLabels: labels,
  };

  return {
    title: titleFor(mode, labels),
    mode,
    status: combinedText.trim() && warnings.length === 0 ? "ready" : "partial",
    sources: resolved.map((source) => source.ref),
    summary,
    rawContextExcerpt: compactText(combinedText, 12000),
    deepDiveEnabled,
  };
}

export function listInterviewSourceOptions(userId: string) {
  const profile = getProfile(userId);
  const jobs = getJobs(userId);
  const bankEntries = getBankEntries(userId).filter((entry) =>
    ["experience", "project", "skill", "achievement", "bullet"].includes(
      entry.category,
    ),
  );
  const documents = listDocumentsPaginated({ userId, limit: 100 });

  return {
    opportunities: jobs.map((job) => ({
      id: job.id,
      type: "opportunity",
      label: `${job.title} at ${job.company}`,
      detail: job.company,
    })),
    profile: {
      experiences:
        profile?.experiences.map((experience) => ({
          id: experience.id,
          type: "profile-experience",
          label: `${experience.title} at ${experience.company}`,
          detail: experience.skills?.join(", ") || experience.description,
        })) ?? [],
      projects:
        profile?.projects.map((project) => ({
          id: project.id,
          type: "profile-project",
          label: project.name,
          detail: project.technologies?.join(", ") || project.description,
        })) ?? [],
      skills:
        profile?.skills.map((skill) => ({
          id: skill.id,
          type: "profile-skill",
          label: skill.name,
          detail: [skill.category, skill.proficiency]
            .filter(Boolean)
            .join(" / "),
        })) ?? [],
    },
    bank: bankEntries.map((entry) => ({
      id: entry.id,
      type: "bank",
      category: entry.category,
      label: bankEntryLabel(entry),
      detail: compactText(stringifyContent(entry.content), 160),
    })),
    documents: documents.map((document) => ({
      id: document.id,
      type: "document",
      label: document.filename,
      detail: document.extractedText
        ? compactText(document.extractedText, 160)
        : "Extract text before using this document for grounded questions.",
      disabled: !document.extractedText,
      disabledReason: document.extractedText ? undefined : "No extracted text",
    })),
  };
}

export function buildPromotionEntry(pack: {
  mode: InterviewContextMode;
  title: string;
  sources: InterviewContextSourceRef[];
  summary: InterviewContextPackSummary;
  rawContextExcerpt?: string;
}): InsertBankEntry | null {
  const custom = pack.sources.find(
    (source) => source.type === "custom-url" || source.type === "custom-text",
  );
  if (!custom) return null;
  const category: BankCategory =
    custom.category ||
    (pack.mode === "skill-grill"
      ? "skill"
      : pack.mode === "project-defense"
        ? "project"
        : "paragraph");
  const content: Record<string, unknown> =
    category === "skill"
      ? {
          name: custom.label || pack.summary.skills[0] || pack.title,
          category: "technical",
          proficiency: "intermediate",
        }
      : category === "project"
        ? {
            name: custom.label || pack.title,
            url: custom.url,
            description: pack.rawContextExcerpt?.slice(0, 800),
            technologies: pack.summary.detectedStack,
            highlights: pack.summary.claims.slice(0, 5),
          }
        : {
            title: custom.label || pack.title,
            body: pack.rawContextExcerpt,
            skills: pack.summary.skills,
          };

  return { category, content, confidenceScore: 0.85 };
}

export function saveContextPackToBank(
  pack: {
    mode: InterviewContextMode;
    title: string;
    sources: InterviewContextSourceRef[];
    summary: InterviewContextPackSummary;
    rawContextExcerpt?: string;
  },
  userId: string,
): string | null {
  const entry = buildPromotionEntry(pack);
  if (!entry) return null;
  return insertBankEntry(entry, userId);
}
