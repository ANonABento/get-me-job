import {
  BUILDER_VERSION_STORAGE_PREFIX,
  parseBuilderVersion,
  type BuilderVersion,
} from "./version-history";
import type { BankCategory } from "@/types";

export type BuilderSectionDiffType = "added" | "removed" | "changed";

export interface BuilderSectionDiff {
  id: BankCategory;
  label: string;
  type: BuilderSectionDiffType;
}

export interface BuilderVersionPair {
  before: BuilderVersion | null;
  after: BuilderVersion | null;
  documentId: string | null;
}

interface VersionStorage {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

const BANK_CATEGORY_LABELS: Record<BankCategory, string> = {
  experience: "Experience",
  skill: "Skills",
  project: "Projects",
  education: "Education",
  achievement: "Achievements",
  certification: "Certifications",
  hackathon: "Hackathons",
};

function getDocumentIdFromVersionStorageKey(key: string): string | null {
  const prefix = `${BUILDER_VERSION_STORAGE_PREFIX}:`;
  if (!key.startsWith(prefix)) return null;
  return key.slice(prefix.length) || null;
}

function getVisibleSectionIds(version: BuilderVersion): BankCategory[] {
  return version.state.sections
    .filter((section) => section.visible)
    .map((section) => section.id);
}

export function readAllBuilderVersions(
  storage: VersionStorage,
): Array<{ documentId: string; version: BuilderVersion }> {
  const versions: Array<{ documentId: string; version: BuilderVersion }> = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;

    const documentId = getDocumentIdFromVersionStorageKey(key);
    if (!documentId) continue;

    try {
      const parsed = JSON.parse(storage.getItem(key) ?? "[]");
      if (!Array.isArray(parsed)) continue;

      parsed.forEach((value) => {
        const version = parseBuilderVersion(value);
        if (version) versions.push({ documentId, version });
      });
    } catch {
      continue;
    }
  }

  return versions;
}

export function findBuilderVersionPair(
  storage: VersionStorage,
  beforeId: string,
  afterId: string,
): BuilderVersionPair {
  const trimmedBeforeId = beforeId.trim();
  const trimmedAfterId = afterId.trim();
  let before: BuilderVersion | null = null;
  let after: BuilderVersion | null = null;
  let documentId: string | null = null;

  for (const item of readAllBuilderVersions(storage)) {
    if (item.version.id === trimmedBeforeId) {
      before = item.version;
      documentId ??= item.documentId;
    }

    if (item.version.id === trimmedAfterId) {
      after = item.version;
      documentId ??= item.documentId;
    }

    if (before && after) break;
  }

  return { before, after, documentId };
}

export function compareBuilderVersionSections(
  before: BuilderVersion,
  after: BuilderVersion,
): BuilderSectionDiff[] {
  const beforeSections = getVisibleSectionIds(before);
  const afterSections = getVisibleSectionIds(after);
  const beforeSet = new Set(beforeSections);
  const afterSet = new Set(afterSections);
  const diffs: BuilderSectionDiff[] = [];

  afterSections.forEach((id, index) => {
    if (!beforeSet.has(id)) {
      diffs.push({ id, label: BANK_CATEGORY_LABELS[id], type: "added" });
      return;
    }

    if (beforeSections[index] !== id) {
      diffs.push({ id, label: BANK_CATEGORY_LABELS[id], type: "changed" });
    }
  });

  beforeSections.forEach((id) => {
    if (!afterSet.has(id)) {
      diffs.push({ id, label: BANK_CATEGORY_LABELS[id], type: "removed" });
    }
  });

  return diffs;
}

export function hasBuilderVersionContentChange(
  before: BuilderVersion,
  after: BuilderVersion,
): boolean {
  return before.state.html !== after.state.html;
}
