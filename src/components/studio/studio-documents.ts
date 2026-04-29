import type { SectionState } from "@/lib/builder/section-manager";

export const RESUME_DOCUMENT_ID = "resume";
export const COVER_LETTER_DOCUMENT_ID = "cover-letter";

export type DocumentMode = "resume" | "cover_letter";

export interface StudioDocument {
  id: string;
  name: string;
  mode: DocumentMode;
  templateId?: string;
  selectedEntryIds?: string[];
  sections?: SectionState[];
}

export const DOCUMENT_MODE_LABELS: Record<DocumentMode, string> = {
  resume: "Resume",
  cover_letter: "Cover Letter",
};

export const DOCUMENT_MODE_OPTIONS: Array<{
  mode: DocumentMode;
  label: string;
}> = [
  { mode: "resume", label: DOCUMENT_MODE_LABELS.resume },
  { mode: "cover_letter", label: DOCUMENT_MODE_LABELS.cover_letter },
];

export function getDefaultDocumentName(mode: DocumentMode, index = 1): string {
  const baseName = DOCUMENT_MODE_LABELS[mode];
  return index <= 1 ? baseName : `${baseName} ${index}`;
}

export function createStudioDocument(
  mode: DocumentMode,
  options: {
    id?: string;
    name?: string;
    index?: number;
  } = {}
): StudioDocument {
  return {
    id: options.id ?? createDocumentId(mode),
    name: options.name ?? getDefaultDocumentName(mode, options.index),
    mode,
  };
}

export function getDocumentsForType(
  documents: StudioDocument[],
  mode: DocumentMode
): StudioDocument[] {
  return documents.filter((document) => document.mode === mode);
}

export function getActiveStudioDocument(
  documents: StudioDocument[],
  mode: DocumentMode,
  activeId: string | undefined
): StudioDocument {
  const modeDocuments = getDocumentsForType(documents, mode);
  return (
    modeDocuments.find((document) => document.id === activeId) ??
    modeDocuments[0] ??
    createStudioDocument(mode, {
      id: mode === "resume" ? RESUME_DOCUMENT_ID : COVER_LETTER_DOCUMENT_ID,
    })
  );
}

export function updateStudioDocument(
  documents: StudioDocument[],
  id: string,
  updates: Partial<StudioDocument>
): StudioDocument[] {
  return documents.map((document) =>
    document.id === id ? { ...document, ...updates } : document
  );
}

export function renameStudioDocument(
  documents: StudioDocument[],
  id: string,
  name: string
): StudioDocument[] {
  const nextName = name.trim();
  if (!nextName) return documents;
  return updateStudioDocument(documents, id, { name: nextName });
}

export function deleteStudioDocument(
  documents: StudioDocument[],
  id: string,
  mode: DocumentMode
): { documents: StudioDocument[]; activeDocumentId: string } {
  const remaining = documents.filter((document) => document.id !== id);
  const remainingForMode = getDocumentsForType(remaining, mode);

  if (remainingForMode.length > 0) {
    return { documents: remaining, activeDocumentId: remainingForMode[0].id };
  }

  const replacement = createStudioDocument(mode, {
    id: mode === "resume" ? RESUME_DOCUMENT_ID : createDocumentId(mode),
  });

  return {
    documents: [...remaining, replacement],
    activeDocumentId: replacement.id,
  };
}

export function formatVersionTimestamp(savedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(savedAt));
}

function createDocumentId(mode: DocumentMode): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${mode}-${Math.random().toString(36).slice(2)}`;
}
