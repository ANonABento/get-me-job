"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultTemplateIdForDocumentMode,
  getTemplateForDocumentMode,
  TEMPLATES,
} from "@/lib/resume/template-data";
import type { TemplateStyles } from "@/lib/resume/template-data";
import {
  createInitialSections,
  getVisibleSectionIds,
  reorderSections,
  toggleSectionVisibility,
  type SectionState,
} from "@/lib/builder/section-manager";
import {
  addBuilderVersion,
  createBuilderVersion,
  isBuilderStateSaved,
  readBuilderVersions,
  writeBuilderVersions,
  type BuilderDraftState,
  type BuilderVersion,
} from "@/lib/builder/version-history";
import { getCoverLetterTemplate } from "@/lib/builder/cover-letter-document";
import {
  createDocumentFilename,
  downloadHtmlAsPdf,
} from "@/lib/builder/document-export";
import { buildCoverLetterPreviewContent } from "@/lib/builder/cover-letter-preview-fallback";
import { generateResumePreviewFallbackHTML } from "@/lib/builder/resume-preview-fallback";
import { tailoredResumeToTipTapDocument } from "@/lib/editor/bank-to-tiptap";
import {
  coverLetterTextToTipTapDocument,
  createBlankCoverLetterTipTapDocument,
  isBlankCoverLetterTipTapDocument,
} from "@/lib/editor/cover-letter-tiptap";
import {
  createEditorBodyHtml,
  createPrintableCoverLetterEditorHtml,
  createPrintableEditorHtml,
} from "@/lib/editor/document-html";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { readJsonResponse } from "@/lib/http";
import type { TailoredResume } from "@/lib/resume/generator";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { BankCategory, BankEntry } from "@/types";
import type { StudioSaveStatus } from "./save-status";
import {
  COVER_LETTER_DOCUMENT_ID,
  RESUME_DOCUMENT_ID,
  createStudioDocument,
  deleteStudioDocument,
  getActiveStudioDocument,
  getDocumentsForType,
  renameStudioDocument,
  updateStudioDocument,
  type DocumentMode,
  type StudioDocument,
} from "./studio-documents";

interface BuilderPreviewResponse {
  html?: string;
  resume?: TailoredResume;
}

interface StudioPageState {
  activeDocumentId: string;
  currentDocuments: StudioDocument[];
  documentMode: DocumentMode;
  draftIsSaved: boolean;
  entries: BankEntry[];
  entryPickerOpen: boolean;
  generating: boolean;
  handleCopyHtml: () => Promise<void>;
  handleCreateDocument: () => void;
  handleDeleteDocument: (id: string) => void;
  handleDownloadPdf: () => Promise<void>;
  handlePreviewVersion: (id: string) => void;
  handleRenameDocument: (id: string, name: string) => void;
  handleReorder: (fromIndex: number, toIndex: number) => void;
  handleSaveManualVersion: () => void;
  handleSelectDocument: (id: string) => void;
  handleTemplateSelect: (templateId: string) => void;
  handleToggleEntry: (id: string) => void;
  handleToggleVisibility: (categoryId: BankCategory) => void;
  html: string;
  content?: TipTapJSONContent;
  handleContentChange: (content: TipTapJSONContent) => void;
  handleCoverLetterGenerated: (content: string) => void;
  isExporting: boolean;
  loading: boolean;
  manualVersionName: string;
  previewVersionId: string | null;
  sections: SectionState[];
  selectedIds: Set<string>;
  saveStatus: StudioSaveStatus;
  setLinkedOpportunityId: (opportunityId: string) => void;
  setDocumentMode: (mode: DocumentMode) => void;
  setEntryPickerOpen: (open: boolean) => void;
  setManualVersionName: (name: string) => void;
  templateId: string;
  versions: BuilderVersion[];
}

interface LinkStudioVersionOptions {
  documentMode: DocumentMode;
  fetcher?: typeof fetch;
  opportunityId: string;
  versionId: string;
}

const SAVE_STATUS_MIN_VISIBLE_MS = 150;

async function readLinkError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "Failed to link saved document to opportunity";
  } catch {
    return "Failed to link saved document to opportunity";
  }
}

export async function linkStudioVersionToOpportunity({
  documentMode,
  fetcher = fetch,
  opportunityId,
  versionId,
}: LinkStudioVersionOptions): Promise<void> {
  const trimmedOpportunityId = opportunityId.trim();
  const trimmedVersionId = versionId.trim();
  if (!trimmedOpportunityId || !trimmedVersionId) return;

  const response = await fetcher(
    `/api/opportunities/${encodeURIComponent(trimmedOpportunityId)}/link`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        documentMode === "cover_letter"
          ? { coverLetterId: trimmedVersionId }
          : { resumeId: trimmedVersionId },
      ),
    },
  );

  if (!response.ok) {
    throw new Error(await readLinkError(response));
  }
}

function areSelectedIdsEqual(current: Set<string>, next: string[]): boolean {
  if (current.size !== next.length) return false;
  return next.every((id) => current.has(id));
}

function areSectionsEqual(
  current: SectionState[],
  next: SectionState[],
): boolean {
  return (
    current.length === next.length &&
    current.every(
      (section, index) =>
        section.id === next[index]?.id &&
        section.visible === next[index]?.visible,
    )
  );
}

function createEntrySelectionKey(entries: BankEntry[]): string {
  return entries.map((entry) => entry.id).join("|");
}

export function isDraftSavedForDocument(
  dirtyDocumentIds: Set<string>,
  documentId: string,
  versions: BuilderVersion[],
  currentDraftState: BuilderDraftState,
): boolean {
  return (
    !dirtyDocumentIds.has(documentId) ||
    isBuilderStateSaved(versions, currentDraftState)
  );
}

export function useStudioPageState(): StudioPageState {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(
    createInitialSections,
  );
  const [templateId, setTemplateId] = useState(
    getDefaultTemplateIdForDocumentMode("resume"),
  );
  const [loading, setLoading] = useState(true);
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [content, setContent] = useState<TipTapJSONContent | undefined>();
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [manualVersionName, setManualVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [dirtyDocumentIds, setDirtyDocumentIds] = useState<Set<string>>(
    new Set(),
  );
  const [lastSavedAtByDocumentId, setLastSavedAtByDocumentId] = useState<
    Record<string, number>
  >({});
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StudioDocument[]>([
    createStudioDocument("resume", { id: RESUME_DOCUMENT_ID }),
    createStudioDocument("cover_letter", { id: COVER_LETTER_DOCUMENT_ID }),
  ]);
  const [linkedOpportunityId, setLinkedOpportunityId] = useState("");
  const [documentMode, setDocumentMode] = useState<DocumentMode>("resume");
  const [activeDocumentIds, setActiveDocumentIds] = useState<
    Record<DocumentMode, string>
  >({ resume: RESUME_DOCUMENT_ID, cover_letter: COVER_LETTER_DOCUMENT_ID });
  const [isExporting, setIsExporting] = useState(false);
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");
  const lastActiveDocumentIdRef = useRef<string | null>(null);
  const lastCoverLetterEntryKeyRef = useRef<string | null>(null);
  const contentRef = useRef<TipTapJSONContent | undefined>(undefined);

  const activeDocument = useMemo(
    () =>
      getActiveStudioDocument(
        documents,
        documentMode,
        activeDocumentIds[documentMode],
      ),
    [activeDocumentIds, documentMode, documents],
  );

  const currentDocuments = useMemo(
    () => getDocumentsForType(documents, documentMode),
    [documentMode, documents],
  );

  useEffect(() => {
    if (hasLoadedEntries) return;

    let cancelled = false;

    async function fetchEntries() {
      setLoading(true);
      try {
        const response = await fetch("/api/bank");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (!cancelled) setEntries(data.entries || []);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) {
          setHasLoadedEntries(true);
          setLoading(false);
        }
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [hasLoadedEntries]);

  useEffect(() => {
    const nextSelectedEntryIds = activeDocument.selectedEntryIds ?? [];
    const nextSections = activeDocument.sections ?? createInitialSections();
    const nextTemplateId =
      activeDocument.templateId ??
      getDefaultTemplateIdForDocumentMode(activeDocument.mode);

    setSelectedIds((current) =>
      areSelectedIdsEqual(current, nextSelectedEntryIds)
        ? current
        : new Set(nextSelectedEntryIds),
    );
    setSections((current) =>
      areSectionsEqual(current, nextSections) ? current : nextSections,
    );
    setTemplateId((current) =>
      current === nextTemplateId ? current : nextTemplateId,
    );

    if (lastActiveDocumentIdRef.current !== activeDocument.id) {
      setPreviewVersionId(null);
      lastActiveDocumentIdRef.current = activeDocument.id;
      lastCoverLetterEntryKeyRef.current = null;
      contentRef.current = activeDocument.content;
      setHtml(activeDocument.html ?? "");
      setContent(activeDocument.content);
    }

    if (typeof window !== "undefined") {
      setVersions(readBuilderVersions(window.localStorage, activeDocument.id));
    }
  }, [
    activeDocument.id,
    activeDocument.content,
    activeDocument.html,
    activeDocument.mode,
    activeDocument.sections,
    activeDocument.selectedEntryIds,
    activeDocument.templateId,
  ]);

  const visibleCategoryIds = useMemo(
    () => getVisibleSectionIds(sections),
    [sections],
  );

  const orderedEntries = useMemo(() => {
    const categoryOrder = new Map(visibleCategoryIds.map((id, i) => [id, i]));
    return entries
      .filter(
        (entry) =>
          selectedIds.has(entry.id) &&
          visibleCategoryIds.includes(entry.category),
      )
      .sort(
        (a, b) =>
          (categoryOrder.get(a.category) ?? 999) -
          (categoryOrder.get(b.category) ?? 999),
      );
  }, [entries, selectedIds, visibleCategoryIds]);

  const selectedTemplate = useMemo(
    () =>
      documentMode === "cover_letter"
        ? getCoverLetterTemplate(templateId)
        : TEMPLATES.find((template) => template.id === templateId),
    [documentMode, templateId],
  );

  const currentDraftState = useMemo<BuilderDraftState>(
    () => ({
      documentMode,
      selectedIds: Array.from(selectedIds),
      sections,
      templateId,
      html,
      content,
    }),
    [content, documentMode, html, sections, selectedIds, templateId],
  );

  const draftIsSaved = useMemo(
    () =>
      isDraftSavedForDocument(
        dirtyDocumentIds,
        activeDocument.id,
        versions,
        currentDraftState,
      ),
    [activeDocument.id, currentDraftState, dirtyDocumentIds, versions],
  );

  const saveStatus = useMemo<StudioSaveStatus>(() => {
    if (isSavingVersion) return { state: "saving" };
    if (saveError) return { state: "error", error: saveError };
    if (!draftIsSaved) return { state: "unsaved" };

    return {
      state: "saved",
      lastSavedAt: lastSavedAtByDocumentId[activeDocument.id] ?? Date.now(),
    };
  }, [
    activeDocument.id,
    draftIsSaved,
    isSavingVersion,
    lastSavedAtByDocumentId,
    saveError,
  ]);

  useEffect(() => {
    if (previewVersionId) setGenerating(false);
  }, [previewVersionId]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (previewVersionId) return;

    if (documentMode === "cover_letter") {
      const entryKey = createEntrySelectionKey(orderedEntries);
      const currentContent = contentRef.current;
      const shouldCreateDraft =
        !currentContent ||
        (isBlankCoverLetterTipTapDocument(currentContent) &&
          lastCoverLetterEntryKeyRef.current !== entryKey);
      if (shouldCreateDraft) {
        const nextContent =
          orderedEntries.length > 0
            ? coverLetterTextToTipTapDocument(
                buildCoverLetterPreviewContent(orderedEntries),
              )
            : createBlankCoverLetterTipTapDocument();
        const nextHtml = createEditorBodyHtml(nextContent);
        contentRef.current = nextContent;
        setContent(nextContent);
        setHtml(nextHtml);
        setDocuments((current) =>
          updateStudioDocument(current, activeDocument.id, {
            content: nextContent,
            html: nextHtml,
          }),
        );
        lastCoverLetterEntryKeyRef.current = entryKey;
      }
      setGenerating(false);
      return;
    }

    if (orderedEntries.length === 0) {
      setHtml("");
      contentRef.current = undefined;
      setContent(undefined);
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, {
          content: undefined,
          html: "",
        }),
      );
      setGenerating(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setGenerating(true);

    async function updatePreview() {
      try {
        const data = await readJsonResponse<BuilderPreviewResponse>(
          await fetch("/api/builder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entryIds: orderedEntries.map((entry) => entry.id),
              templateId,
              sectionOrder: visibleCategoryIds,
            }),
            signal: controller.signal,
          }),
          "Failed to update preview",
        );

        if (!cancelled) {
          lastPreviewErrorToastRef.current = "";
          if (data.html) {
            const nextContent = data.resume
              ? tailoredResumeToTipTapDocument(data.resume)
              : undefined;
            contentRef.current = nextContent;
            setHtml(data.html);
            setContent(nextContent);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: nextContent,
                html: data.html,
              }),
            );
          } else {
            // API returned empty — use client-side fallback
            const fallbackHtml = generateResumePreviewFallbackHTML(
              orderedEntries,
              templateId,
            );
            contentRef.current = undefined;
            setHtml(fallbackHtml);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: undefined,
                html: fallbackHtml,
              }),
            );
          }
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === "AbortError";
        if (!cancelled && !isAbortError) {
          try {
            const fallbackHtml = generateResumePreviewFallbackHTML(
              orderedEntries,
              templateId,
            );
            lastPreviewErrorToastRef.current = "";
            contentRef.current = undefined;
            setHtml(fallbackHtml);
            setContent(undefined);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: undefined,
                html: fallbackHtml,
              }),
            );
          } catch (fallbackErr) {
            const message =
              fallbackErr instanceof Error ? fallbackErr.message : "preview";
            if (lastPreviewErrorToastRef.current !== message) {
              lastPreviewErrorToastRef.current = message;
              showErrorToast(fallbackErr, {
                title: "Could not update preview",
                fallbackDescription:
                  "Please try changing the resume content again.",
              });
            }
          }
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    }

    updatePreview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    documentMode,
    activeDocument.id,
    orderedEntries,
    previewVersionId,
    showErrorToast,
    templateId,
    visibleCategoryIds,
  ]);

  const updateActiveDocument = useCallback(
    (updates: Partial<StudioDocument>) => {
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, updates),
      );
    },
    [activeDocument.id],
  );

  const markActiveDocumentDirty = useCallback(() => {
    setSaveError(null);
    setDirtyDocumentIds((current) => {
      if (current.has(activeDocument.id)) return current;
      const next = new Set(current);
      next.add(activeDocument.id);
      return next;
    });
  }, [activeDocument.id]);

  const markActiveDocumentSaved = useCallback(() => {
    const documentId = activeDocument.id;
    setDirtyDocumentIds((current) => {
      if (!current.has(documentId)) return current;
      const next = new Set(current);
      next.delete(documentId);
      return next;
    });
    setLastSavedAtByDocumentId((current) => ({
      ...current,
      [documentId]: Date.now(),
    }));
  }, [activeDocument.id]);

  const handleContentChange = useCallback(
    (nextContent: TipTapJSONContent) => {
      const nextHtml = createEditorBodyHtml(nextContent);
      contentRef.current = nextContent;
      markActiveDocumentDirty();
      setContent(nextContent);
      setHtml(nextHtml);
      updateActiveDocument({ content: nextContent, html: nextHtml });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleCoverLetterGenerated = useCallback(
    (generatedContent: string) => {
      const nextContent = coverLetterTextToTipTapDocument(generatedContent);
      const nextHtml = createEditorBodyHtml(nextContent);
      contentRef.current = nextContent;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setContent(nextContent);
      setHtml(nextHtml);
      updateActiveDocument({ content: nextContent, html: nextHtml });
      lastCoverLetterEntryKeyRef.current =
        createEntrySelectionKey(orderedEntries);
    },
    [markActiveDocumentDirty, orderedEntries, updateActiveDocument],
  );

  const handleToggleEntry = useCallback(
    (id: string) => {
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        updateActiveDocument({ selectedEntryIds: Array.from(next) });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = reorderSections(prev, fromIndex, toIndex);
        if (next !== prev) markActiveDocumentDirty();
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleToggleVisibility = useCallback(
    (categoryId: BankCategory) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = toggleSectionVisibility(prev, categoryId);
        if (!areSectionsEqual(prev, next)) markActiveDocumentDirty();
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleTemplateSelect = useCallback(
    (nextTemplateId: string) => {
      if (nextTemplateId === templateId) return;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setTemplateId(nextTemplateId);
      updateActiveDocument({ templateId: nextTemplateId });
    },
    [markActiveDocumentDirty, templateId, updateActiveDocument],
  );

  const handleCreateDocument = useCallback(() => {
    const document = createStudioDocument(documentMode, {
      index: currentDocuments.length + 1,
    });
    setDocuments((prev) => [...prev, document]);
    setActiveDocumentIds((prev) => ({ ...prev, [documentMode]: document.id }));
  }, [currentDocuments.length, documentMode]);

  const handleSelectDocument = useCallback(
    (id: string) => {
      setActiveDocumentIds((prev) => ({ ...prev, [documentMode]: id }));
    },
    [documentMode],
  );

  const handleRenameDocument = useCallback((id: string, name: string) => {
    setDocuments((prev) => renameStudioDocument(prev, id, name));
  }, []);

  const handleDeleteDocument = useCallback(
    (id: string) => {
      const result = deleteStudioDocument(documents, id, documentMode);
      setDocuments(result.documents);
      setDirtyDocumentIds((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setActiveDocumentIds((prev) => ({
        ...prev,
        [documentMode]: result.activeDocumentId,
      }));
    },
    [documentMode, documents],
  );

  const saveManualVersion = useCallback(
    (name: string) => {
      const version = createBuilderVersion(currentDraftState, {
        kind: "manual",
        name,
      });
      const nextVersions = addBuilderVersion(versions, version);

      setIsSavingVersion(true);
      setSaveError(null);

      window.setTimeout(() => {
        try {
          const saved = writeBuilderVersions(
            window.localStorage,
            activeDocument.id,
            nextVersions,
          );
          if (!saved) throw new Error("Browser storage rejected the save");

          setVersions(nextVersions);
          markActiveDocumentSaved();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Could not save version";
          setSaveError(message);
          showErrorToast(err, {
            title: "Could not save version",
            fallbackDescription:
              "Your draft is still open, but the saved version could not be written.",
          });
          return;
        } finally {
          setIsSavingVersion(false);
        }

        setManualVersionName("");
        setPreviewVersionId(version.id);

        if (linkedOpportunityId) {
          void linkStudioVersionToOpportunity({
            documentMode,
            opportunityId: linkedOpportunityId,
            versionId: version.id,
          }).catch((err) => {
            showErrorToast(err, {
              title: "Could not link opportunity",
              fallbackDescription:
                "The document was saved, but it was not attached to the selected opportunity.",
            });
          });
        }
      }, SAVE_STATUS_MIN_VISIBLE_MS);
    },
    [
      activeDocument.id,
      currentDraftState,
      documentMode,
      linkedOpportunityId,
      markActiveDocumentSaved,
      showErrorToast,
      versions,
    ],
  );

  const handleSaveManualVersion = useCallback(() => {
    saveManualVersion(manualVersionName);
  }, [manualVersionName, saveManualVersion]);

  const handlePreviewVersion = useCallback(
    (id: string) => {
      const version = versions.find((item) => item.id === id);
      if (!version) return;

      setPreviewVersionId(id);
      setSelectedIds(new Set(version.state.selectedIds));
      setSections(version.state.sections);
      setTemplateId(version.state.templateId);
      setHtml(version.state.html);
      markActiveDocumentSaved();
      contentRef.current = version.state.content;
      setContent(version.state.content);
      updateActiveDocument({
        selectedEntryIds: version.state.selectedIds,
        sections: version.state.sections,
        templateId: version.state.templateId,
        content: version.state.content,
        html: version.state.html,
      });
    },
    [markActiveDocumentSaved, updateActiveDocument, versions],
  );

  const getPrintableHtml = useCallback(() => {
    const bodyHtml = content ? createEditorBodyHtml(content) : html;
    if (!bodyHtml) return "";

    if (documentMode === "cover_letter") {
      if (!selectedTemplate || selectedTemplate.styles.layout !== "letter") {
        return bodyHtml;
      }

      return createPrintableCoverLetterEditorHtml(
        bodyHtml,
        selectedTemplate.styles,
        `${selectedTemplate.name} Cover Letter`,
      );
    }

    if (!selectedTemplate || !("layout" in selectedTemplate.styles))
      return bodyHtml;

    return createPrintableEditorHtml(
      bodyHtml,
      selectedTemplate.styles as TemplateStyles,
      `${selectedTemplate.name} Resume`,
    );
  }, [content, documentMode, html, selectedTemplate]);

  const handleDownloadPdf = useCallback(async () => {
    const printableHtml = getPrintableHtml();
    if (!printableHtml) return;

    setIsExporting(true);
    try {
      await downloadHtmlAsPdf(
        printableHtml,
        createDocumentFilename(
          documentMode === "cover_letter" ? "cover-letter" : "resume",
          selectedTemplate?.name,
        ),
      );
    } catch (err) {
      showErrorToast(err, {
        title: "Could not download PDF",
        fallbackDescription:
          documentMode === "cover_letter"
            ? "Please try exporting the cover letter again."
            : "Please try exporting the resume again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [documentMode, getPrintableHtml, selectedTemplate?.name, showErrorToast]);

  const handleCopyHtml = useCallback(async () => {
    const currentHtml = getPrintableHtml() || html;
    if (!currentHtml) return;
    await navigator.clipboard.writeText(currentHtml);
  }, [getPrintableHtml, html]);

  return {
    activeDocumentId: activeDocumentIds[documentMode],
    currentDocuments,
    documentMode,
    draftIsSaved,
    entries,
    entryPickerOpen,
    generating,
    content,
    handleContentChange,
    handleCoverLetterGenerated,
    handleCopyHtml,
    handleCreateDocument,
    handleDeleteDocument,
    handleDownloadPdf,
    handlePreviewVersion,
    handleRenameDocument,
    handleReorder,
    handleSaveManualVersion,
    handleSelectDocument,
    handleTemplateSelect,
    handleToggleEntry,
    handleToggleVisibility,
    html,
    isExporting,
    loading,
    manualVersionName,
    previewVersionId,
    sections,
    selectedIds,
    saveStatus,
    setLinkedOpportunityId,
    setDocumentMode,
    setEntryPickerOpen,
    setManualVersionName,
    templateId,
    versions,
  };
}
