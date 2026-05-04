import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { extractTextFromFile } from "@/lib/parser/pdf";
import { smartParseResume } from "@/lib/parser/smart-parser";
import { extractBankEntries } from "@/lib/resume/info-bank";
import type { BankEntry, Experience } from "@/types";

export const DEFAULT_PERSONA_SLUGS = [
  "standard-software-engineer",
  "career-changer",
  "entry-level",
  "executive",
  "contractor",
  "career-gap",
  "non-english",
  "scanned-pdf",
  "academic",
  "designer",
];

const FIXTURE_ROOT = path.join(process.cwd(), "tests", "fixtures", "personas");
const REPORT_PATH = path.join(process.cwd(), "tests", "parsing-results.md");
const FOLLOWUP_TASK_PREFIX = "Parsing fix";

export interface ExpectedExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description?: string;
  highlights?: string[];
  skills?: string[];
}

export interface PersonaExpected {
  slug?: string;
  name?: string;
  expectedExperiences?: ExpectedExperience[];
  experiences?: ExpectedExperience[];
  knownLimitations?: string[];
}

export interface ActualExperience extends ExpectedExperience {
  source?: string;
}

export interface FieldDiff {
  field: keyof ExpectedExperience;
  expected: unknown;
  actual: unknown;
}

export interface MatchedExperience {
  expected: ExpectedExperience;
  actual: ActualExperience;
  fieldDiffs: FieldDiff[];
  correctFields: number;
  totalFields: number;
  ignoredDiffs: FieldDiff[];
}

export interface Failure {
  persona: string;
  type: "missed" | "spurious" | "field" | "process";
  summary: string;
  rca: string;
  severity: "low" | "medium" | "high";
  knownLimitationApplied: boolean;
}

export interface PersonaScore {
  slug: string;
  status: "processed" | "failed-to-process";
  expectedCount: number;
  actualCount: number;
  matchedCount: number;
  recall: number;
  precision: number;
  fieldAccuracy: number;
  composite: number;
  knownLimitationsApplied: string[];
  failures: Failure[];
  notes: string[];
}

export interface VerificationReport {
  generatedAt: string;
  personas: PersonaScore[];
  failureModes: FailureMode[];
  followupTasks: FollowupTask[];
}

export interface FailureMode {
  rca: string;
  count: number;
  severity: "low" | "medium" | "high";
  personas: string[];
  summaries: string[];
}

export interface FollowupTask {
  title: string;
  severity: "medium" | "high";
  status: "pending-mcp";
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\b(incorporated|inc|llc|ltd|corp|corporation|co|company)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMonth(value: unknown): number | null {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();
  if (["present", "current", "now"].includes(raw)) return 9999 * 12;

  const iso = raw.match(/(\d{4})[-/](\d{1,2})/);
  if (iso) return Number(iso[1]) * 12 + Number(iso[2]);

  const year = raw.match(/\b(19|20)\d{2}\b/);
  if (!year) return null;

  const months: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };
  const monthName = raw.match(/[a-z]+/)?.[0];
  return Number(year[0]) * 12 + (monthName ? months[monthName] ?? 1 : 1);
}

export function datesFuzzyEqual(expected?: string, actual?: string): boolean {
  const expectedMonth = parseMonth(expected);
  const actualMonth = parseMonth(actual);
  if (expectedMonth === null && actualMonth === null) return true;
  if (expectedMonth === null || actualMonth === null) return false;
  return Math.abs(expectedMonth - actualMonth) <= 1;
}

export function experienceMatches(
  expected: ExpectedExperience,
  actual: ActualExperience
): boolean {
  return (
    normalizeText(expected.title) === normalizeText(actual.title) &&
    normalizeText(expected.company) === normalizeText(actual.company) &&
    datesFuzzyEqual(expected.startDate, actual.startDate) &&
    datesFuzzyEqual(expected.endDate, actual.endDate)
  );
}

function valuesEqual(field: keyof ExpectedExperience, expected: unknown, actual: unknown): boolean {
  if (field === "company" || field === "title") {
    return normalizeText(expected) === normalizeText(actual);
  }
  if (field === "startDate" || field === "endDate") {
    return datesFuzzyEqual(String(expected ?? ""), String(actual ?? ""));
  }
  if (Array.isArray(expected)) {
    const actualValues = Array.isArray(actual) ? actual : [];
    return expected.every((item) =>
      actualValues.some((actualItem) => normalizeText(actualItem).includes(normalizeText(item)))
    );
  }
  return normalizeText(expected) === normalizeText(actual);
}

function limitationApplies(knownLimitations: string[], summary: string): boolean {
  const normalizedSummary = normalizeText(summary);
  return knownLimitations.some((limitation) => {
    const normalizedLimitation = normalizeText(limitation);
    return (
      normalizedSummary.includes(normalizedLimitation) ||
      normalizedLimitation
        .split(" ")
        .filter((word) => word.length > 3)
        .some((word) => normalizedSummary.includes(word))
    );
  });
}

function analyzeFailure(summary: string): Pick<Failure, "rca" | "severity"> {
  const normalized = normalizeText(summary);
  if (normalized.includes("missing fixture") || normalized.includes("resume pdf")) {
    return { rca: "Fixture dependency missing", severity: "high" };
  }
  if (normalized.includes("0 actual") || normalized.includes("no experience")) {
    return { rca: "Parser limitation", severity: "high" };
  }
  if (normalized.includes("date") || normalized.includes("field")) {
    return { rca: "Schema mismatch", severity: "medium" };
  }
  if (normalized.includes("non english") || normalized.includes("unknown")) {
    return { rca: "AI prompt issue", severity: "medium" };
  }
  return { rca: "Parser limitation", severity: "medium" };
}

export function compareExperiences(
  expected: ExpectedExperience[],
  actual: ActualExperience[],
  knownLimitations: string[] = [],
  persona = "unknown"
): Omit<PersonaScore, "slug" | "status" | "notes"> {
  const unmatchedActual = [...actual];
  const matches: MatchedExperience[] = [];
  const failures: Failure[] = [];
  const appliedKnownLimitations = new Set<string>();

  for (const expectedExperience of expected) {
    const index = unmatchedActual.findIndex((actualExperience) =>
      experienceMatches(expectedExperience, actualExperience)
    );

    if (index === -1) {
      const summary = `Missed expected experience: ${expectedExperience.title} at ${expectedExperience.company}`;
      const knownLimitationApplied = limitationApplies(knownLimitations, summary);
      const rca = analyzeFailure(summary);
      if (!knownLimitationApplied) {
        failures.push({ persona, type: "missed", summary, knownLimitationApplied, ...rca });
      } else {
        knownLimitations
          .filter((limitation) => limitationApplies([limitation], summary))
          .forEach((limitation) => appliedKnownLimitations.add(limitation));
      }
      continue;
    }

    const [actualExperience] = unmatchedActual.splice(index, 1);
    const fieldDiffs: FieldDiff[] = [];
    const ignoredDiffs: FieldDiff[] = [];
    let correctFields = 0;
    let totalFields = 0;

    for (const [field, expectedValue] of Object.entries(expectedExperience) as [
      keyof ExpectedExperience,
      unknown,
    ][]) {
      if (expectedValue === undefined) continue;
      totalFields++;
      const actualValue = actualExperience[field];
      if (valuesEqual(field, expectedValue, actualValue)) {
        correctFields++;
        continue;
      }
      const diff = { field, expected: expectedValue, actual: actualValue };
      const summary = `Field mismatch for ${expectedExperience.title} at ${expectedExperience.company}: ${field}`;
      if (limitationApplies(knownLimitations, summary)) {
        ignoredDiffs.push(diff);
        correctFields++;
        knownLimitations
          .filter((limitation) => limitationApplies([limitation], summary))
          .forEach((limitation) => appliedKnownLimitations.add(limitation));
      } else {
        fieldDiffs.push(diff);
      }
    }

    matches.push({
      expected: expectedExperience,
      actual: actualExperience,
      fieldDiffs,
      correctFields,
      totalFields,
      ignoredDiffs,
    });

    for (const diff of fieldDiffs) {
      const summary = `Field mismatch for ${expectedExperience.title} at ${expectedExperience.company}: ${diff.field}`;
      failures.push({
        persona,
        type: "field",
        summary,
        knownLimitationApplied: false,
        ...analyzeFailure(summary),
      });
    }
  }

  for (const actualExperience of unmatchedActual) {
    const summary = `Spurious experience: ${actualExperience.title} at ${actualExperience.company}`;
    const knownLimitationApplied = limitationApplies(knownLimitations, summary);
    if (!knownLimitationApplied) {
      failures.push({
        persona,
        type: "spurious",
        summary,
        knownLimitationApplied,
        ...analyzeFailure(summary),
      });
    } else {
      knownLimitations
        .filter((limitation) => limitationApplies([limitation], summary))
        .forEach((limitation) => appliedKnownLimitations.add(limitation));
    }
  }

  const correctFields = matches.reduce((sum, match) => sum + match.correctFields, 0);
  const totalFields = matches.reduce((sum, match) => sum + match.totalFields, 0);
  const recall = expected.length === 0 ? 1 : matches.length / expected.length;
  const precision = actual.length === 0 ? (expected.length === 0 ? 1 : 0) : matches.length / actual.length;
  const fieldAccuracy = totalFields === 0 ? (matches.length > 0 ? 1 : 0) : correctFields / totalFields;
  const composite = (recall + precision + fieldAccuracy) / 3;

  return {
    expectedCount: expected.length,
    actualCount: actual.length,
    matchedCount: matches.length,
    recall,
    precision,
    fieldAccuracy,
    composite,
    knownLimitationsApplied: [...appliedKnownLimitations],
    failures,
  };
}

function profileExperiencesToActual(profileExperiences: Experience[] | undefined): ActualExperience[] {
  return (profileExperiences ?? []).map((experience) => ({
    company: experience.company,
    title: experience.title,
    location: experience.location,
    startDate: experience.startDate,
    endDate: experience.endDate,
    current: experience.current,
    description: experience.description,
    highlights: experience.highlights,
    skills: experience.skills,
    source: "smart-parser",
  }));
}

function bankEntriesToActual(entries: BankEntry[]): ActualExperience[] {
  return entries
    .filter((entry) => entry.category === "experience")
    .map((entry) => ({
      company: String(entry.content.company ?? ""),
      title: String(entry.content.title ?? ""),
      location: entry.content.location ? String(entry.content.location) : undefined,
      startDate: entry.content.startDate ? String(entry.content.startDate) : undefined,
      endDate: entry.content.endDate ? String(entry.content.endDate) : undefined,
      current: Boolean(entry.content.current),
      description: String(entry.content.description ?? ""),
      highlights: Array.isArray(entry.content.highlights)
        ? entry.content.highlights.map(String)
        : [],
      skills: Array.isArray(entry.content.skills) ? entry.content.skills.map(String) : [],
      source: "profile-bank-extraction",
    }));
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readExpected(filePath: string): Promise<PersonaExpected> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as PersonaExpected;
}

async function listPersonaSlugs(fixtureRoot: string): Promise<string[]> {
  if (!(await pathExists(fixtureRoot))) return DEFAULT_PERSONA_SLUGS;
  const entries = await fs.readdir(fixtureRoot, { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  return slugs.length > 0 ? slugs : DEFAULT_PERSONA_SLUGS;
}

export async function verifyPersona(
  slug: string,
  fixtureRoot = FIXTURE_ROOT
): Promise<PersonaScore> {
  const personaDir = path.join(fixtureRoot, slug);
  const resumePath = path.join(personaDir, "resume.pdf");
  const expectedPath = path.join(personaDir, "expected.json");
  const notes = [
    "Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.",
  ];

  if (!(await pathExists(resumePath)) || !(await pathExists(expectedPath))) {
    const summary = `Missing fixture dependency for ${slug}: expected resume.pdf and expected.json`;
    return {
      slug,
      status: "failed-to-process",
      expectedCount: 0,
      actualCount: 0,
      matchedCount: 0,
      recall: 0,
      precision: 0,
      fieldAccuracy: 0,
      composite: 0,
      knownLimitationsApplied: [],
      failures: [
        {
          persona: slug,
          type: "process",
          summary,
          knownLimitationApplied: false,
          ...analyzeFailure(summary),
        },
      ],
      notes,
    };
  }

  try {
    const expectedData = await readExpected(expectedPath);
    const expectedExperiences = expectedData.expectedExperiences ?? expectedData.experiences ?? [];
    const text = await extractTextFromFile(resumePath);
    const parsed = await smartParseResume(text, null);
    const bankEntries = extractBankEntries(parsed.profile, slug).map((entry, index) => ({
      id: `${slug}-${index}`,
      userId: "verification",
      category: entry.category,
      content: entry.content,
      sourceDocumentId: entry.sourceDocumentId,
      confidenceScore: entry.confidenceScore ?? 0.8,
      createdAt: new Date(0).toISOString(),
    }));
    const actual = bankEntriesToActual(bankEntries);
    const parsedActual = profileExperiencesToActual(parsed.profile.experiences);
    const comparison = compareExperiences(
      expectedExperiences,
      actual.length > 0 ? actual : parsedActual,
      expectedData.knownLimitations ?? [],
      slug
    );

    return {
      slug,
      status: "processed",
      notes: parsed.warnings.length > 0 ? [...notes, ...parsed.warnings] : notes,
      ...comparison,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const summary = `Failed to process ${slug}: ${message}`;
    return {
      slug,
      status: "failed-to-process",
      expectedCount: 0,
      actualCount: 0,
      matchedCount: 0,
      recall: 0,
      precision: 0,
      fieldAccuracy: 0,
      composite: 0,
      knownLimitationsApplied: [],
      failures: [
        {
          persona: slug,
          type: "process",
          summary,
          knownLimitationApplied: false,
          ...analyzeFailure(summary),
        },
      ],
      notes,
    };
  }
}

export function summarizeFailureModes(personas: PersonaScore[]): FailureMode[] {
  const modes = new Map<string, FailureMode>();

  for (const failure of personas.flatMap((persona) => persona.failures)) {
    const existing = modes.get(failure.rca) ?? {
      rca: failure.rca,
      count: 0,
      severity: failure.severity,
      personas: [],
      summaries: [],
    };
    existing.count++;
    existing.severity =
      existing.severity === "high" || failure.severity === "high"
        ? "high"
        : existing.severity === "medium" || failure.severity === "medium"
          ? "medium"
          : "low";
    if (!existing.personas.includes(failure.persona)) {
      existing.personas.push(failure.persona);
    }
    if (!existing.summaries.includes(failure.summary)) {
      existing.summaries.push(failure.summary);
    }
    modes.set(failure.rca, existing);
  }

  return [...modes.values()].sort((a, b) => b.count - a.count).slice(0, 5);
}

export function buildFollowupTasks(failureModes: FailureMode[]): FollowupTask[] {
  return failureModes
    .filter((mode): mode is FailureMode & { severity: "medium" | "high" } =>
      mode.severity === "medium" || mode.severity === "high"
    )
    .map((mode) => ({
      title: `${FOLLOWUP_TASK_PREFIX} — ${mode.rca} — ${mode.summaries[0] ?? "investigate resume parsing failure"}`,
      severity: mode.severity,
      status: "pending-mcp",
    }));
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function renderReport(report: VerificationReport): string {
  const lines: string[] = [
    "# Resume Parsing Verification Results",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Score Table",
    "",
    "| Persona | Status | Recall | Precision | Field accuracy | Composite | Known limitations applied |",
    "| --- | --- | ---: | ---: | ---: | ---: | --- |",
  ];

  for (const persona of report.personas) {
    lines.push(
      `| ${persona.slug} | ${persona.status} | ${pct(persona.recall)} | ${pct(persona.precision)} | ${pct(persona.fieldAccuracy)} | ${pct(persona.composite)} | ${persona.knownLimitationsApplied.join("; ") || "None"} |`
    );
  }

  lines.push("", "## Top 5 Failure Modes by Frequency", "");
  if (report.failureModes.length === 0) {
    lines.push("No failure modes detected.");
  } else {
    for (const mode of report.failureModes) {
      lines.push(
        `- **${mode.rca}** (${mode.count}, ${mode.severity}): ${mode.summaries[0]} Personas: ${mode.personas.join(", ")}.`
      );
    }
  }

  lines.push("", "## Per-Persona Narrative", "");
  for (const persona of report.personas) {
    const worked =
      persona.status === "processed"
        ? `${persona.matchedCount}/${persona.expectedCount} expected experience entries matched.`
        : "Could not run parser for this persona.";
    const failed =
      persona.failures.length > 0
        ? persona.failures.map((failure) => failure.summary).join(" ")
        : "No unexpected failures.";
    lines.push(`### ${persona.slug}`);
    lines.push("");
    lines.push(`What worked: ${worked}`);
    lines.push("");
    lines.push(`What did not: ${failed}`);
    lines.push("");
    lines.push(`Surprising findings: ${persona.notes.join(" ")}`);
    lines.push("");
  }

  lines.push("## Followup Tasks", "");
  if (report.followupTasks.length === 0) {
    lines.push("No medium+ severity follow-up tasks required.");
  } else {
    lines.push(
      "Bento task creation MCP was unavailable in this session, so these task titles are queued for creation:"
    );
    lines.push("");
    for (const task of report.followupTasks) {
      lines.push(`- [${task.status}] ${task.title} (${task.severity})`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

export async function runVerification(
  fixtureRoot = FIXTURE_ROOT,
  reportPath = REPORT_PATH
): Promise<VerificationReport> {
  const slugs = await listPersonaSlugs(fixtureRoot);
  const personas = await Promise.all(slugs.map((slug) => verifyPersona(slug, fixtureRoot)));
  const failureModes = summarizeFailureModes(personas);
  const followupTasks = buildFollowupTasks(failureModes);
  const report = {
    generatedAt: new Date().toISOString(),
    personas,
    failureModes,
    followupTasks,
  };
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, renderReport(report), "utf-8");
  return report;
}

async function main(): Promise<void> {
  await runVerification();
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
