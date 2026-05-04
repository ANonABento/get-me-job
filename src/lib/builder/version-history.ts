import { BANK_CATEGORIES, type BankCategory } from "@/types";
import {
  DEFAULT_SECTION_ORDER,
  type SectionState,
} from "@/lib/builder/section-manager";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { getDefaultTemplateIdForDocumentMode } from "@/lib/resume/template-data";
import type { CoverLetterCritique } from "@/lib/ai/critique-prompts";

export const AUTO_SAVE_INTERVAL_MS = 30_000;
export const MAX_BUILDER_VERSIONS = 20;
export const BUILDER_VERSION_STORAGE_PREFIX = "taida:builder:versions";

export type BuilderVersionKind = "auto" | "manual";
export type BuilderDocumentMode = "resume" | "cover_letter";

export interface BuilderDraftState {
  documentMode: BuilderDocumentMode;
  selectedIds: string[];
  sections: SectionState[];
  templateId: string;
  html: string;
  content?: TipTapJSONContent;
  coverLetterCritique?: CoverLetterCritique;
}

export interface BuilderVersion {
  id: string;
  kind: BuilderVersionKind;
  name: string;
  savedAt: string;
  state: BuilderDraftState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBankCategory(value: unknown): value is BankCategory {
  return (
    typeof value === "string" && BANK_CATEGORIES.includes(value as BankCategory)
  );
}

function isBuilderDocumentMode(value: unknown): value is BuilderDocumentMode {
  return value === "resume" || value === "cover_letter";
}

function getVersionTimestamp(version: Pick<BuilderVersion, "savedAt">): number {
  const timestamp = Date.parse(version.savedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeSections(value: unknown): SectionState[] | null {
  if (!Array.isArray(value)) return null;

  const sections: SectionState[] = [];
  const seen = new Set<BankCategory>();

  for (const section of value) {
    if (!isRecord(section) || !isBankCategory(section.id)) continue;
    if (seen.has(section.id)) continue;

    seen.add(section.id);
    sections.push({
      id: section.id,
      visible: typeof section.visible === "boolean" ? section.visible : true,
    });
  }

  if (sections.length === 0) return null;

  for (const id of DEFAULT_SECTION_ORDER) {
    if (!seen.has(id)) sections.push({ id, visible: true });
  }

  return sections;
}

function normalizeTipTapContent(value: unknown): TipTapJSONContent | undefined {
  if (!isRecord(value) || typeof value.type !== "string") return undefined;
  return value as TipTapJSONContent;
}

function isScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10
  );
}

function normalizeCoverLetterCritique(
  value: unknown,
): CoverLetterCritique | undefined {
  if (!isRecord(value) || !isRecord(value.scores)) return undefined;
  if (
    !isRecord(value.rationale_per_axis) ||
    !Array.isArray(value.suggested_rewrites)
  ) {
    return undefined;
  }

  const scores = value.scores;
  const rationale = value.rationale_per_axis;
  if (
    !isScore(scores.fit) ||
    !isScore(scores.specificity) ||
    !isScore(scores.hook) ||
    !isScore(scores.ask) ||
    !isScore(value.overall)
  ) {
    return undefined;
  }

  if (
    typeof rationale.fit !== "string" ||
    typeof rationale.specificity !== "string" ||
    typeof rationale.hook !== "string" ||
    typeof rationale.ask !== "string"
  ) {
    return undefined;
  }

  const suggested_rewrites = value.suggested_rewrites
    .filter(isRecord)
    .map((suggestion) => ({
      range_in_letter:
        typeof suggestion.range_in_letter === "string"
          ? suggestion.range_in_letter
          : "",
      suggestion:
        typeof suggestion.suggestion === "string" ? suggestion.suggestion : "",
      why: typeof suggestion.why === "string" ? suggestion.why : "",
    }))
    .filter(
      (suggestion) =>
        suggestion.range_in_letter.trim() &&
        suggestion.suggestion.trim() &&
        suggestion.why.trim(),
    );

  if (suggested_rewrites.length < 2) return undefined;

  return {
    scores: {
      fit: scores.fit,
      specificity: scores.specificity,
      hook: scores.hook,
      ask: scores.ask,
    },
    overall: value.overall,
    rationale_per_axis: {
      fit: rationale.fit,
      specificity: rationale.specificity,
      hook: rationale.hook,
      ask: rationale.ask,
    },
    suggested_rewrites,
  };
}

export function getBuilderVersionStorageKey(documentId: string): string {
  return `${BUILDER_VERSION_STORAGE_PREFIX}:${documentId}`;
}

export function normalizeBuilderState(
  state: BuilderDraftState,
): BuilderDraftState {
  return {
    documentMode: state.documentMode,
    selectedIds: Array.from(new Set(state.selectedIds)).sort(),
    sections: state.sections.map((section) => ({
      id: section.id,
      visible: section.visible,
    })),
    templateId: state.templateId,
    html: state.html,
    content: normalizeTipTapContent(state.content),
    coverLetterCritique: normalizeCoverLetterCritique(
      state.coverLetterCritique,
    ),
  };
}

export function parseBuilderDraftState(
  value: unknown,
): BuilderDraftState | null {
  if (!isRecord(value)) return null;
  if (!isBuilderDocumentMode(value.documentMode)) return null;

  const sections = normalizeSections(value.sections);
  if (!sections) return null;

  return normalizeBuilderState({
    documentMode: value.documentMode,
    selectedIds: Array.isArray(value.selectedIds)
      ? value.selectedIds.filter((id): id is string => typeof id === "string")
      : [],
    sections,
    templateId:
      typeof value.templateId === "string"
        ? value.templateId
        : getDefaultTemplateIdForDocumentMode(value.documentMode),
    html: typeof value.html === "string" ? value.html : "",
    content: normalizeTipTapContent(value.content),
    coverLetterCritique: normalizeCoverLetterCritique(
      value.coverLetterCritique,
    ),
  });
}

export function createBuilderVersion(
  state: BuilderDraftState,
  options: {
    kind: BuilderVersionKind;
    name: string;
    savedAt?: string;
    id?: string;
  },
): BuilderVersion {
  const savedAt = options.savedAt ?? new Date().toISOString();

  return {
    id:
      options.id ??
      `${options.kind}-${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    kind: options.kind,
    name:
      options.name.trim() ||
      (options.kind === "auto" ? "Auto-save" : "Saved version"),
    savedAt,
    state: normalizeBuilderState(state),
  };
}

export function parseBuilderVersion(value: unknown): BuilderVersion | null {
  if (!isRecord(value)) return null;
  if (value.kind !== "auto" && value.kind !== "manual") return null;
  if (typeof value.id !== "string" || typeof value.savedAt !== "string") {
    return null;
  }
  if (!Number.isFinite(Date.parse(value.savedAt))) return null;

  const state = parseBuilderDraftState(value.state);
  if (!state) return null;

  return {
    id: value.id,
    kind: value.kind,
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name
        : value.kind === "auto"
          ? "Auto-save"
          : "Saved version",
    savedAt: value.savedAt,
    state,
  };
}

export function addBuilderVersion(
  versions: BuilderVersion[],
  version: BuilderVersion,
  maxVersions = MAX_BUILDER_VERSIONS,
): BuilderVersion[] {
  return [version, ...versions.filter((existing) => existing.id !== version.id)]
    .sort((a, b) => getVersionTimestamp(b) - getVersionTimestamp(a))
    .slice(0, maxVersions);
}

export function getLatestBuilderVersion(
  versions: BuilderVersion[],
): BuilderVersion | null {
  return versions[0] ?? null;
}

export function isBuilderStateSaved(
  versions: BuilderVersion[],
  state: BuilderDraftState,
): boolean {
  return versions.some((version) =>
    areBuilderStatesEqual(version.state, state),
  );
}

export function areBuilderStatesEqual(
  first: BuilderDraftState,
  second: BuilderDraftState,
): boolean {
  return (
    JSON.stringify(normalizeBuilderState(first)) ===
    JSON.stringify(normalizeBuilderState(second))
  );
}

export function readBuilderVersions(
  storage: Pick<Storage, "getItem">,
  documentId: string,
): BuilderVersion[] {
  try {
    const raw = storage.getItem(getBuilderVersionStorageKey(documentId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseBuilderVersion)
      .filter((version): version is BuilderVersion => version !== null)
      .sort((a, b) => getVersionTimestamp(b) - getVersionTimestamp(a))
      .slice(0, MAX_BUILDER_VERSIONS);
  } catch {
    return [];
  }
}

export function writeBuilderVersions(
  storage: Pick<Storage, "setItem">,
  documentId: string,
  versions: BuilderVersion[],
): boolean {
  try {
    storage.setItem(
      getBuilderVersionStorageKey(documentId),
      JSON.stringify(versions.slice(0, MAX_BUILDER_VERSIONS)),
    );
    return true;
  } catch {
    return false;
  }
}
