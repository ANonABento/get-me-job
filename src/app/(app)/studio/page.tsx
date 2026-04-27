"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Editor } from "@tiptap/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CoverLetterWorkspace } from "@/components/builder/cover-letter-workspace";
import { SectionList } from "@/components/builder/section-list";
import { TemplatePicker } from "@/components/builder/template-picker";
import { ResumePreview } from "@/components/studio/resume-preview";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToTipTapDocument } from "@/lib/editor/bank-to-tiptap";
import { createPrintableEditorHtml } from "@/lib/editor/document-html";
import {
  createDocumentFilename,
  downloadHtmlAsPdf,
} from "@/lib/builder/document-export";
import {
  createInitialSections,
  toggleSectionVisibility,
  reorderSections,
  getVisibleSectionIds,
  getMobilePanelClasses,
  DEFAULT_BUILDER_PANEL,
} from "@/lib/builder/section-manager";
import type { SectionState, BuilderPanel } from "@/lib/builder/section-manager";
import {
  createStudioDocument,
  deleteStudioDocument,
  getActiveStudioDocument,
  getDocumentsForType,
  getStudioModeFromSearchParam,
  getStudioModeHref,
  loadStudioDocuments,
  renameStudioDocument,
  saveStudioDocuments,
  updateStudioDocument,
  type StudioDocument,
  type StudioDocumentMode,
} from "@/lib/studio/document-studio";
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  FileText,
  Loader2,
  Pencil,
  Eye,
  PenLine,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const STUDIO_MODE_TABS: Array<{
  mode: StudioDocumentMode;
  label: string;
  Icon: LucideIcon;
}> = [
  { mode: "resume", label: "Resume", Icon: FileText },
  { mode: "cover-letter", label: "Cover Letter", Icon: PenLine },
];

const RESUME_MOBILE_TABS: Array<{
  panel: BuilderPanel;
  label: string;
  Icon: LucideIcon;
}> = [
  { panel: "edit", label: "Edit", Icon: Pencil },
  { panel: "preview", label: "Preview", Icon: Eye },
];

const RESUME_DOCUMENT_ID = "resume";

function formatVersionTimestamp(savedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(savedAt));
}

function StudioLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

interface StudioFilePanelProps {
  documents: StudioDocument[];
  activeDocumentId: string;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function StudioFilePanel({
  documents,
  activeDocumentId,
  onCreate,
  onSelect,
  onRename,
  onDelete,
}: StudioFilePanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startRename = useCallback((document: StudioDocument) => {
    setRenamingId(document.id);
    setDraftName(document.name);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId) {
      onRename(renamingId, draftName);
    }
    setRenamingId(null);
    setDraftName("");
  }, [draftName, onRename, renamingId]);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">Files</h2>
        <Button size="sm" variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4 md:mr-1.5" />
          <span className="hidden md:inline">New</span>
        </Button>
      </div>

      <div className="space-y-1 px-2 pb-3">
        {documents.map((document) => {
          const isActive = document.id === activeDocumentId;
          const isRenaming = document.id === renamingId;

          return (
            <div
              key={document.id}
              className={cn(
                "group flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              {isRenaming ? (
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") finishRename();
                    if (event.key === "Escape") {
                      setRenamingId(null);
                      setDraftName("");
                    }
                  }}
                  className="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-sm text-foreground"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(document.id)}
                  onDoubleClick={() => startRename(document)}
                  className="min-w-0 flex-1 truncate text-left"
                  title={document.name}
                >
                  {document.name}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(document.id)}
                className="rounded p-1 text-muted-foreground opacity-70 transition hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                aria-label={`Delete ${document.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocumentMode = getStudioModeFromSearchParam(
    searchParams.get("mode")
  );
  const [documentMode, setDocumentMode] =
    useState<StudioDocumentMode>(initialDocumentMode);
  const [documents, setDocuments] = useState<StudioDocument[]>(() =>
    loadStudioDocuments(
      typeof window === "undefined" ? undefined : window.localStorage
    )
  );
  const [activeDocumentIds, setActiveDocumentIds] = useState<
    Record<StudioDocumentMode, string>
  >({
    resume: "",
    "cover-letter": "",
  });
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] =
    useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [loading, setLoading] = useState(initialDocumentMode === "resume");
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [loadedResumeDocumentId, setLoadedResumeDocumentId] = useState<
    string | null
  >(null);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [manualVersionName, setManualVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");
  const lastLoadedDocumentIdRef = useRef<string | null>(null);

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
    setDocumentMode(getStudioModeFromSearchParam(searchParams.get("mode")));
  }, [searchParams]);

  useEffect(() => {
    saveStudioDocuments(
      typeof window === "undefined" ? undefined : window.localStorage,
      documents
    );
  }, [documents]);

  useEffect(() => {
    setActiveDocumentIds((prev) =>
      prev[documentMode] === activeDocument.id
        ? prev
        : { ...prev, [documentMode]: activeDocument.id }
    );
  }, [activeDocument.id, documentMode]);

  useEffect(() => {
    if (lastLoadedDocumentIdRef.current === activeDocument.id) return;
    lastLoadedDocumentIdRef.current = activeDocument.id;

    if (activeDocument.type === "resume") {
      setTemplateId(activeDocument.templateId || "classic");
      setSections(
        activeDocument.sections.length
          ? activeDocument.sections
          : createInitialSections()
      );
      setSelectedIds(new Set(activeDocument.selectedEntryIds));
      setHtml(activeDocument.content);
      setLoadedResumeDocumentId(activeDocument.id);
    } else {
      setLoadedResumeDocumentId(null);
    }
  }, [activeDocument]);

  useEffect(() => {
    if (documentMode !== "resume") {
      setLoading(false);
      return;
    }

    if (hasLoadedEntries) return;

    let cancelled = false;

    async function fetchEntries() {
      setLoading(true);
      try {
        const res = await fetch("/api/bank");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const bankEntries: BankEntry[] = data.entries || [];
        if (cancelled) return;
        setEntries(bankEntries);
      } catch {
        if (cancelled) return;
        // Entries stay empty
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
  }, [documentMode, hasLoadedEntries]);

  const visibleCategoryIds = useMemo(
    () => getVisibleSectionIds(sections),
    [sections]
  );

  const selectedEntries = useMemo(
    () =>
      entries.filter(
        (e) =>
          selectedIds.has(e.id) && visibleCategoryIds.includes(e.category)
      ),
    [entries, selectedIds, visibleCategoryIds]
  );

  const orderedEntries = useMemo(() => {
    const categoryOrder = new Map(
      visibleCategoryIds.map((id, i) => [id, i])
    );
    return [...selectedEntries].sort(
      (a, b) =>
        (categoryOrder.get(a.category) ?? 999) -
        (categoryOrder.get(b.category) ?? 999)
    );
  }, [selectedEntries, visibleCategoryIds]);

  const editorDocument = useMemo(
    () =>
      orderedEntries.length > 0
        ? bankEntriesToTipTapDocument(orderedEntries)
        : null,
    [orderedEntries]
  );

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  useEffect(() => {
    if (documentMode !== "resume") return;
    if (loadedResumeDocumentId !== activeDocument.id) return;
    if (!hasLoadedEntries) return;

    if (orderedEntries.length === 0) {
      setHtml("");
      setDocuments((prev) =>
        updateStudioDocument(prev, activeDocument.id, { content: "" })
      );
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

        if (!cancelled && data.html) {
          lastPreviewErrorToastRef.current = "";
          setHtml(data.html);
          setDocuments((prev) =>
            updateStudioDocument(prev, activeDocument.id, { content: data.html })
          );
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
        if (!cancelled) {
          setGenerating(false);
        }
      }
    }

    updatePreview();

    return () => {
      editor.off("selectionUpdate", handleEditorStateChange);
      editor.off("transaction", handleEditorStateChange);
    };
  }, [
    documentMode,
    activeDocument.id,
    hasLoadedEntries,
    loadedResumeDocumentId,
    orderedEntries,
    showErrorToast,
    templateId,
    visibleCategoryIds,
  ]);

  const handleToggleEntry = useCallback((id: string) => {
    setPreviewVersionId(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setDocuments((documents) =>
        updateStudioDocument(documents, activeDocument.id, {
          selectedEntryIds: Array.from(next),
        })
      );
      return next;
    });
  }, [activeDocument.id]);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setSections((prev) => {
        const next = reorderSections(prev, fromIndex, toIndex);
        setDocuments((documents) =>
          updateStudioDocument(documents, activeDocument.id, { sections: next })
        );
        return next;
      });
    },
    [activeDocument.id]
  );

  const handleToggleVisibility = useCallback((categoryId: BankCategory) => {
    setSections((prev) => {
      const next = toggleSectionVisibility(prev, categoryId);
      setDocuments((documents) =>
        updateStudioDocument(documents, activeDocument.id, { sections: next })
      );
      return next;
    });
  }, [activeDocument.id]);

  const handleTemplateSelect = useCallback(
    (nextTemplateId: string) => {
      setTemplateId(nextTemplateId);
      setDocuments((documents) =>
        updateStudioDocument(documents, activeDocument.id, {
          templateId: nextTemplateId,
        })
      );
    },
    [activeDocument.id]
  );

  const getPrintableHtml = useCallback(() => {
    if (!editor || !selectedTemplate) return "";
    return createPrintableEditorHtml(
      editor.getHTML(),
      selectedTemplate.styles,
      `${selectedTemplate.name} Resume`
    );
  }, [editor, selectedTemplate]);

  const handlePrint = useCallback(() => {
    const printableHtml = getPrintableHtml();
    if (!printableHtml) return;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printableHtml);
      win.document.close();
      win.onload = () => win.print();
    }
  }, [getPrintableHtml]);

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

  const handleDocumentModeChange = useCallback(
    (mode: StudioDocumentMode) => {
      setPreviewVersionId(null);
      setDocumentMode(mode);
      router.replace(getStudioModeHref(mode), { scroll: false });
    },
    [router]
  );

  const handleCreateDocument = useCallback(() => {
    setDocuments((prev) => {
      const documentCount = getDocumentsForType(prev, documentMode).length;
      const document = createStudioDocument(documentMode, {
        name:
          documentMode === "cover-letter"
            ? `Cover Letter ${documentCount + 1}`
            : `Resume ${documentCount + 1}`,
      });
      setActiveDocumentIds((activeIds) => ({
        ...activeIds,
        [documentMode]: document.id,
      }));
      return [...prev, document];
    });
  }, [documentMode]);

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
      const document = documents.find((candidate) => candidate.id === id);
      if (!document) return;

      if (
        typeof window !== "undefined" &&
        !window.confirm(`Delete "${document.name}"?`)
      ) {
        return;
      }

      setDocuments((prev) => {
        const result = deleteStudioDocument(prev, id);
        setActiveDocumentIds((activeIds) => ({
          ...activeIds,
          [document.type]: result.activeDocument.id,
        }));
        return result.documents;
      });
    },
    [documents]
  );

  const handleCoverLetterContentChange = useCallback(
    (content: string) => {
      setDocuments((prev) =>
        updateStudioDocument(prev, activeDocument.id, { content })
      );
    },
    [activeDocument.id]
  );

  if (loading && documentMode === "resume") {
    return <StudioLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Document Studio</h1>
          {documentMode === "resume" && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                draftIsSaved
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}
            >
              {draftIsSaved ? "Saved" : "Unsaved"}
            </span>
          )}

          <div
            role="tablist"
            aria-label="Document type"
            className="flex rounded-md border bg-muted/30 p-0.5"
          >
            {STUDIO_MODE_TABS.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                id={`document-mode-${mode}-tab`}
                role="tab"
                aria-selected={documentMode === mode}
                aria-controls={`document-mode-${mode}-panel`}
                onClick={() => handleDocumentModeChange(mode)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors",
                  documentMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {documentMode === "resume" && (
        <div
          id="document-mode-resume-panel"
          role="tabpanel"
          aria-labelledby="document-mode-resume-tab"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            role="tablist"
            aria-label="Builder view"
            className="flex border-b md:hidden"
          >
            {RESUME_MOBILE_TABS.map(({ panel, label, Icon }) => (
              <button
                key={panel}
                id={`builder-${panel}-tab`}
                role="tab"
                aria-selected={mobileView === panel}
                aria-controls={`builder-${panel}-panel`}
                onClick={() => setMobileView(panel)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  mobileView === panel
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div
              id="builder-edit-panel"
              role="tabpanel"
              aria-labelledby="builder-edit-tab"
              className={cn(
                "w-full flex-1 overflow-hidden md:w-80 md:flex-none md:shrink-0 md:border-r",
                getMobilePanelClasses(mobileView, "edit")
              )}
            >
              <div className="flex h-full flex-col">
                <StudioFilePanel
                  documents={currentDocuments}
                  activeDocumentId={activeDocument.id}
                  onCreate={handleCreateDocument}
                  onSelect={handleSelectDocument}
                  onRename={handleRenameDocument}
                  onDelete={handleDeleteDocument}
                />
                <div className="border-b p-4">
                  <TemplatePicker
                    templates={TEMPLATES}
                    selectedId={templateId}
                    onSelect={handleTemplateSelect}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <SectionList
                    sections={sections}
                    entries={entries}
                    selectedIds={selectedIds}
                    onReorder={handleReorder}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleEntry={handleToggleEntry}
                  />
                </div>
              </div>
            </div>

            <div
              id="builder-preview-panel"
              role="tabpanel"
              aria-labelledby="builder-preview-tab"
              className={cn(
                "relative flex w-full flex-1 flex-col overflow-hidden",
                getMobilePanelClasses(mobileView, "preview")
              )}
            >
              <EditorToolbar
                editor={editor}
                templates={TEMPLATES}
                templateId={templateId}
                zoomPercent={zoomPercent}
                canExport={Boolean(editor && editorDocument)}
                isExporting={isExporting}
                onTemplateChange={setTemplateId}
                onZoomChange={setZoomPercent}
                onDownloadPdf={handleDownloadPdf}
                onPrint={handlePrint}
              />
              <ResumePreview
                templateId={templateId}
                document={editorDocument}
                editable
                zoomPercent={zoomPercent}
                onEditorReady={setEditor}
              />
            </div>
          </div>
        </div>
      )}

      {documentMode === "cover-letter" && (
        <div
          id="document-mode-cover-letter-panel"
          role="tabpanel"
          aria-labelledby="document-mode-cover-letter-tab"
          className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row"
        >
          <aside className="w-full shrink-0 border-b md:w-80 md:border-b-0 md:border-r">
            <StudioFilePanel
              documents={currentDocuments}
              activeDocumentId={activeDocument.id}
              onCreate={handleCreateDocument}
              onSelect={handleSelectDocument}
              onRename={handleRenameDocument}
              onDelete={handleDeleteDocument}
            />
          </aside>
          <div className="min-w-0 flex-1">
            <CoverLetterWorkspace
              documentName={activeDocument.name}
              documentContent={activeDocument.content}
              onDocumentContentChange={handleCoverLetterContentChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioPageContent />
    </Suspense>
  );
}
