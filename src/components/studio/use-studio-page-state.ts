"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TEMPLATES } from "@/lib/resume/template-data";
import {
  DEFAULT_BUILDER_PANEL,
  createInitialSections,
  getVisibleSectionIds,
  reorderSections,
  toggleSectionVisibility,
  type BuilderPanel,
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
import { createDocumentFilename, downloadHtmlAsPdf } from "@/lib/builder/document-export";
import { createPrintableEditorHtml } from "@/lib/editor/document-html";
import { readJsonResponse } from "@/lib/http";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { BankCategory, BankEntry } from "@/types";
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
  isExporting: boolean;
  loading: boolean;
  manualVersionName: string;
  mobileView: BuilderPanel;
  previewVersionId: string | null;
  sections: SectionState[];
  selectedIds: Set<string>;
  setDocumentMode: (mode: DocumentMode) => void;
  setEntryPickerOpen: (open: boolean) => void;
  setManualVersionName: (name: string) => void;
  setMobileView: (panel: BuilderPanel) => void;
  templateId: string;
  versions: BuilderVersion[];
}

function areSelectedIdsEqual(current: Set<string>, next: string[]): boolean {
  if (current.size !== next.length) return false;
  return next.every((id) => current.has(id));
}

function areSectionsEqual(
  current: SectionState[],
  next: SectionState[]
): boolean {
  return (
    current.length === next.length &&
    current.every(
      (section, index) =>
        section.id === next[index]?.id &&
        section.visible === next[index]?.visible
    )
  );
}

export function useStudioPageState(): StudioPageState {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [loading, setLoading] = useState(true);
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(DEFAULT_BUILDER_PANEL);
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [manualVersionName, setManualVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [draftIsSaved, setDraftIsSaved] = useState(true);
  const [documents, setDocuments] = useState<StudioDocument[]>([
    createStudioDocument("resume", { id: RESUME_DOCUMENT_ID }),
    createStudioDocument("cover_letter", { id: COVER_LETTER_DOCUMENT_ID }),
  ]);
  const [documentMode, setDocumentMode] = useState<DocumentMode>("resume");
  const [activeDocumentIds, setActiveDocumentIds] = useState<
    Record<DocumentMode, string>
  >({ resume: RESUME_DOCUMENT_ID, cover_letter: COVER_LETTER_DOCUMENT_ID });
  const [isExporting, setIsExporting] = useState(false);
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");
  const lastActiveDocumentIdRef = useRef<string | null>(null);

  const activeDocument = useMemo(
    () =>
      getActiveStudioDocument(
        documents,
        documentMode,
        activeDocumentIds[documentMode]
      ),
    [activeDocumentIds, documentMode, documents]
  );

  const currentDocuments = useMemo(
    () => getDocumentsForType(documents, documentMode),
    [documentMode, documents]
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
    const nextTemplateId = activeDocument.templateId ?? "classic";

    setSelectedIds((current) =>
      areSelectedIdsEqual(current, nextSelectedEntryIds)
        ? current
        : new Set(nextSelectedEntryIds)
    );
    setSections((current) =>
      areSectionsEqual(current, nextSections) ? current : nextSections
    );
    setTemplateId((current) =>
      current === nextTemplateId ? current : nextTemplateId
    );

    if (lastActiveDocumentIdRef.current !== activeDocument.id) {
      setPreviewVersionId(null);
      lastActiveDocumentIdRef.current = activeDocument.id;
    }

    if (typeof window !== "undefined") {
      setVersions(readBuilderVersions(window.localStorage, activeDocument.id));
    }
  }, [
    activeDocument.id,
    activeDocument.sections,
    activeDocument.selectedEntryIds,
    activeDocument.templateId,
  ]);

  const visibleCategoryIds = useMemo(
    () => getVisibleSectionIds(sections),
    [sections]
  );

  const orderedEntries = useMemo(() => {
    const categoryOrder = new Map(visibleCategoryIds.map((id, i) => [id, i]));
    return entries
      .filter((entry) => selectedIds.has(entry.id) && visibleCategoryIds.includes(entry.category))
      .sort(
        (a, b) =>
          (categoryOrder.get(a.category) ?? 999) -
          (categoryOrder.get(b.category) ?? 999)
      );
  }, [entries, selectedIds, visibleCategoryIds]);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId),
    [templateId]
  );

  const currentDraftState = useMemo<BuilderDraftState>(
    () => ({
      documentMode: "resume",
      selectedIds: Array.from(selectedIds),
      sections,
      templateId,
      html,
    }),
    [html, sections, selectedIds, templateId]
  );

  useEffect(() => {
    setDraftIsSaved(isBuilderStateSaved(versions, currentDraftState));
  }, [currentDraftState, versions]);

  useEffect(() => {
    if (previewVersionId) setGenerating(false);
  }, [previewVersionId]);

  useEffect(() => {
    if (previewVersionId) return;

    if (orderedEntries.length === 0) {
      setHtml("");
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
          "Failed to update preview"
        );

        if (!cancelled) {
          lastPreviewErrorToastRef.current = "";
          setHtml(data.html ?? "");
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === "AbortError";
        if (!cancelled && !isAbortError) {
          const message = err instanceof Error ? err.message : "preview";
          if (lastPreviewErrorToastRef.current !== message) {
            lastPreviewErrorToastRef.current = message;
            showErrorToast(err, {
              title: "Could not update preview",
              fallbackDescription: "Please try changing the resume content again.",
            });
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
    orderedEntries,
    previewVersionId,
    showErrorToast,
    templateId,
    visibleCategoryIds,
  ]);

  const updateActiveDocument = useCallback(
    (updates: Partial<StudioDocument>) => {
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, updates)
      );
    },
    [activeDocument.id]
  );

  const handleToggleEntry = useCallback(
    (id: string) => {
      setPreviewVersionId(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        updateActiveDocument({ selectedEntryIds: Array.from(next) });
        return next;
      });
    },
    [updateActiveDocument]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = reorderSections(prev, fromIndex, toIndex);
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [updateActiveDocument]
  );

  const handleToggleVisibility = useCallback(
    (categoryId: BankCategory) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = toggleSectionVisibility(prev, categoryId);
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [updateActiveDocument]
  );

  const handleTemplateSelect = useCallback(
    (nextTemplateId: string) => {
      setPreviewVersionId(null);
      setTemplateId(nextTemplateId);
      updateActiveDocument({ templateId: nextTemplateId });
    },
    [updateActiveDocument]
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
    [documentMode]
  );

  const handleRenameDocument = useCallback((id: string, name: string) => {
    setDocuments((prev) => renameStudioDocument(prev, id, name));
  }, []);

  const handleDeleteDocument = useCallback(
    (id: string) => {
      const result = deleteStudioDocument(documents, id, documentMode);
      setDocuments(result.documents);
      setActiveDocumentIds((prev) => ({
        ...prev,
        [documentMode]: result.activeDocumentId,
      }));
    },
    [documentMode, documents]
  );

  const saveManualVersion = useCallback(
    (name: string) => {
      const version = createBuilderVersion(currentDraftState, {
        kind: "manual",
        name,
      });
      setVersions((prev) => {
        const next = addBuilderVersion(prev, version);
        if (typeof window !== "undefined") {
          writeBuilderVersions(window.localStorage, activeDocument.id, next);
        }
        return next;
      });
      setManualVersionName("");
      setPreviewVersionId(version.id);
      setDraftIsSaved(true);
    },
    [activeDocument.id, currentDraftState]
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
      updateActiveDocument({
        selectedEntryIds: version.state.selectedIds,
        sections: version.state.sections,
        templateId: version.state.templateId,
      });
    },
    [updateActiveDocument, versions]
  );

  const getPrintableHtml = useCallback(() => {
    if (!html || !selectedTemplate) return "";
    return createPrintableEditorHtml(
      html,
      selectedTemplate.styles,
      `${selectedTemplate.name} Resume`
    );
  }, [html, selectedTemplate]);

  const handleDownloadPdf = useCallback(async () => {
    const printableHtml = getPrintableHtml();
    if (!printableHtml) return;

    setIsExporting(true);
    try {
      await downloadHtmlAsPdf(
        printableHtml,
        createDocumentFilename("resume", selectedTemplate?.name)
      );
    } catch (err) {
      showErrorToast(err, {
        title: "Could not download PDF",
        fallbackDescription: "Please try exporting the resume again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [getPrintableHtml, selectedTemplate?.name, showErrorToast]);

  const handleCopyHtml = useCallback(async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
  }, [html]);

  return {
    activeDocumentId: activeDocumentIds[documentMode],
    currentDocuments,
    documentMode,
    draftIsSaved,
    entries,
    entryPickerOpen,
    generating,
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
    mobileView,
    previewVersionId,
    sections,
    selectedIds,
    setDocumentMode,
    setEntryPickerOpen,
    setManualVersionName,
    setMobileView,
    templateId,
    versions,
  };
}
