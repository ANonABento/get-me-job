import type {
  BankEntry,
  GroupedBankEntries,
  LLMConfig,
  ContactInfo,
} from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { formatHackathonHighlights } from "@/lib/resume/hackathon-highlights";
import type { BankMatch } from "./analyze";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { tailoredResumeSchema } from "@/lib/schemas/tailor";
import {
  filterUnsupportedClaims,
  getUnsupportedKeywords,
  stripUnsupportedClaims,
} from "@/lib/resume/generator";
import {
  getActivePromptVariant,
  DEFAULT_PROMPT_CONTENT,
  type PromptVariant,
} from "@/lib/db/prompt-variants";
import { applyAtsStrictnessToResume } from "./ats-strictness";
import { buildTailoredResumePrompt } from "./prompt-builders";
import { DEFAULT_TAILOR_SETTINGS, type TailorSettings } from "./settings";

export interface BankResumeInput {
  bankEntries: GroupedBankEntries;
  matchedEntries: BankMatch[];
  contact: ContactInfo;
  summary?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  userId: string;
  /**
   * Optional pre-existing tailored resume to seed from instead of computing a
   * fresh base from the knowledge bank. Wired up by the extension popup's
   * multi-resume picker (#34). When supplied, the LLM step still re-tailors
   * against the JD; we only swap out the deterministic base.
   */
  seedResume?: TailoredResume;
  /**
   * Per-user tailor knobs (max roles, bullets per role, drop-short-bullets
   * threshold, ATS strictness). Persisted in localStorage on the client and
   * forwarded via the API request body. Falls back to
   * `DEFAULT_TAILOR_SETTINGS` when omitted, which preserves the prior
   * hardcoded behaviour (`maxRoles=5` cap → was `slice(0,3)` minimum,
   * `bulletsPerRole.max=4` → was `slice(0,4)`).
   */
  settings?: TailorSettings;
}

export interface GenerateFromBankResult {
  resume: TailoredResume;
  baseResume: TailoredResume;
  promptVariantId: string | null;
}

/**
 * Generate a tailored resume from knowledge bank entries.
 * Uses LLM when available, falls back to keyword-based selection.
 * Returns the resume and the active prompt variant ID for result tracking.
 */
export async function generateFromBank(
  input: BankResumeInput,
  llmConfig: LLMConfig | null,
): Promise<GenerateFromBankResult> {
  const settings = input.settings ?? DEFAULT_TAILOR_SETTINGS;
  const baseResume = applyAtsStrictnessToResume(
    input.seedResume ?? generateBaseFromBank(input),
    settings.atsStrictness,
  );
  if (llmConfig) {
    const activeVariant = getActivePromptVariant(input.userId);
    const resume = applyAtsStrictnessToResume(
      await generateWithLLM(input, llmConfig, activeVariant),
      settings.atsStrictness,
    );
    return { resume, baseResume, promptVariantId: activeVariant?.id ?? null };
  }
  return { resume: baseResume, baseResume, promptVariantId: null };
}

async function generateWithLLM(
  input: BankResumeInput,
  llmConfig: LLMConfig,
  promptVariant: PromptVariant | null,
): Promise<TailoredResume> {
  const client = new LLMClient(llmConfig);
  const instructions = promptVariant?.content ?? DEFAULT_PROMPT_CONTENT;
  const prompt = buildTailoredResumePrompt(input, instructions);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    maxTokens: 2000,
  });

  const parsed = parseJSONFromLLM<{
    summary?: string;
    experiences?: TailoredResume["experiences"];
    skills?: string[];
    education?: TailoredResume["education"];
  }>(response);
  const safeParsed = tailoredResumeSchema.partial().parse(parsed);
  const sourceEducation = mapBankEducation(input);
  const unsupportedKeywords = getUnsupportedKeywords(
    extractKeywordCandidates(input.jobDescription),
    buildBankEvidenceText(input),
  );

  return {
    contact: input.contact,
    summary: stripUnsupportedClaims(
      safeParsed.summary ||
        input.summary ||
        `Experienced professional seeking ${input.jobTitle} position.`,
      unsupportedKeywords,
    ),
    experiences: sanitizeExperiences(
      safeParsed.experiences || [],
      unsupportedKeywords,
    ),
    skills: filterUnsupportedClaims(
      safeParsed.skills || [],
      unsupportedKeywords,
    ),
    education: sourceEducation,
  };
}

export function buildBankTailoredResumePrompt(
  input: BankResumeInput,
  promptVariant: PromptVariant | null,
): string {
  const instructions = promptVariant?.content ?? DEFAULT_PROMPT_CONTENT;
  return buildTailoredResumePrompt(input, instructions);
}

export function generateBaseFromBank(input: BankResumeInput): TailoredResume {
  const settings = input.settings ?? DEFAULT_TAILOR_SETTINGS;
  const maxRoles = Math.max(0, settings.maxRoles);
  const bulletsPerRoleMax = Math.max(0, settings.bulletsPerRole.max);
  const dropShorterThan = Math.max(0, settings.dropBulletsShorterThan);

  // Use matched entries sorted by relevance
  const usedEntryIds = new Set<string>();
  const topExperiences = input.matchedEntries
    .filter(
      (m) =>
        m.entry.category === "experience" || m.entry.category === "hackathon",
    )
    .slice(0, maxRoles)
    .map((m) => {
      usedEntryIds.add(m.entry.id);
      return entryToResumeExperience(m.entry, {
        bulletsPerRoleMax,
        dropShorterThan,
      });
    });

  // If not enough matched experiences, fill from bank
  if (topExperiences.length < Math.min(2, maxRoles)) {
    for (const entry of [
      ...input.bankEntries.experience,
      ...input.bankEntries.hackathon,
    ]) {
      if (topExperiences.length >= maxRoles) break;
      if (!usedEntryIds.has(entry.id)) {
        topExperiences.push(
          entryToResumeExperience(entry, {
            bulletsPerRoleMax,
            dropShorterThan,
          }),
        );
        usedEntryIds.add(entry.id);
      }
    }
  }

  // Collect skills - prioritize matched ones
  const matchedSkillNames = new Set<string>();
  for (const m of input.matchedEntries) {
    if (m.entry.category === "skill") {
      matchedSkillNames.add(String(m.entry.content.name || ""));
    }
  }
  const bankSkillNames = input.bankEntries.skill
    .map((e) => String(e.content.name || ""))
    .filter(Boolean);
  const allSkills = [
    ...Array.from(matchedSkillNames),
    ...bankSkillNames.filter((s) => !matchedSkillNames.has(s)),
  ].slice(0, 15);

  // Education
  const education = input.bankEntries.education.map((e) => {
    const c = e.content;
    return {
      institution: String(c.institution || ""),
      degree: String(c.degree || ""),
      field: String(c.field || ""),
      date: String(c.endDate || ""),
    };
  });

  return {
    contact: input.contact,
    summary:
      input.summary ||
      `Experienced professional seeking ${input.jobTitle} position at ${input.company}.`,
    experiences: topExperiences,
    skills: allSkills,
    education,
  };
}

function mapBankEducation(input: BankResumeInput): TailoredResume["education"] {
  return input.bankEntries.education.map((e) => {
    const c = e.content;
    return {
      institution: String(c.institution || ""),
      degree: String(c.degree || ""),
      field: String(c.field || ""),
      date: String(c.endDate || ""),
    };
  });
}

function buildBankEvidenceText(input: BankResumeInput): string {
  return JSON.stringify({
    summary: input.summary,
    bankEntries: input.bankEntries,
  }).toLowerCase();
}

function extractKeywordCandidates(jobDescription: string): string[] {
  const knownKeywords = jobDescription.match(
    /\b(?:AWS|Kubernetes|GraphQL|React|TypeScript|Python|Node\.js|Node|SQL)\b/g,
  );
  return Array.from(new Set(knownKeywords || []));
}

function sanitizeExperiences(
  experiences: TailoredResume["experiences"],
  unsupportedKeywords: string[],
): TailoredResume["experiences"] {
  return experiences.map((experience) => ({
    ...experience,
    highlights: filterUnsupportedClaims(
      experience.highlights,
      unsupportedKeywords,
    ),
  }));
}

interface EntryHighlightOpts {
  /** Cap on highlights per experience block (was hardcoded 4). */
  bulletsPerRoleMax: number;
  /** Drop highlights shorter than this many chars (was hardcoded 0 — no filter). */
  dropShorterThan: number;
}

function applyHighlightFilters(
  highlights: string[],
  opts: EntryHighlightOpts,
): string[] {
  return highlights
    .filter((h) => h.trim().length >= opts.dropShorterThan)
    .slice(0, opts.bulletsPerRoleMax);
}

function entryToResumeExperience(
  entry: BankEntry,
  opts: EntryHighlightOpts = {
    bulletsPerRoleMax: DEFAULT_TAILOR_SETTINGS.bulletsPerRole.max,
    dropShorterThan: DEFAULT_TAILOR_SETTINGS.dropBulletsShorterThan,
  },
): TailoredResume["experiences"][number] {
  const c = entry.content;
  if (entry.category === "hackathon") {
    return {
      company: String(c.organizer || "Hackathon"),
      title: String(c.name || ""),
      dates: formatDateRange(c),
      highlights: applyHighlightFilters(formatHackathonHighlights(c), opts),
    };
  }

  const rawHighlights = Array.isArray(c.highlights)
    ? c.highlights.map(String)
    : [];
  return {
    company: String(c.company || ""),
    title: String(c.title || ""),
    dates: formatDateRange(c),
    highlights: applyHighlightFilters(rawHighlights, opts),
  };
}

function formatDateRange(content: Record<string, unknown>): string {
  const start = content.startDate ? String(content.startDate) : "";
  const end = content.endDate ? String(content.endDate) : "";
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - Present`;
  return end;
}
