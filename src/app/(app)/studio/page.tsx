"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { SectionList } from "@/components/builder/section-list";
import { TemplatePicker } from "@/components/builder/template-picker";
import { ResumePreview } from "@/components/studio/resume-preview";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToTipTapDocument } from "@/lib/editor/bank-to-tiptap";
import {
  createInitialSections,
  toggleSectionVisibility,
  reorderSections,
  getVisibleSectionIds,
  getMobilePanelClasses,
  DEFAULT_BUILDER_PANEL,
} from "@/lib/builder/section-manager";
import type { SectionState, BuilderPanel } from "@/lib/builder/section-manager";
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  FileText,
  Loader2,
  Pencil,
  Eye,
  type LucideIcon,
} from "lucide-react";

interface BuilderPreviewResponse {
  html?: string;
}

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
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] =
    useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [loadedResumeDocumentId, setLoadedResumeDocumentId] = useState<
    string | null
  >(null);
  const [html, setHtml] = useState("");
  const [editorContent, setEditorContent] = useState<TipTapJSONContent>(() =>
    bankEntriesToTipTapDocument([])
  );
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
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
  }, [hasLoadedEntries]);

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

  const generatedEditorContent = useMemo(
    () => bankEntriesToTipTapDocument(orderedEntries),
    [orderedEntries]
  );

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  useEffect(() => {
    setEditorContent(generatedEditorContent);
  }, [generatedEditorContent]);

  useEffect(() => {
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

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  if (loading) {
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

          <div className="relative md:ml-4">
            <button
              onClick={() => setTemplateOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: selectedTemplate?.styles.accentColor,
                }}
              />
              <span>{selectedTemplate?.name ?? "Template"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {templateOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setTemplateOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-lg">
                  {TEMPLATES.map((template) => {
                    const isSelected = template.id === templateId;
                    return (
                      <button
                        key={template.id}
                        onClick={() => {
                          setTemplateId(template.id);
                          setTemplateOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <div
                          className="h-3 w-3 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: template.styles.accentColor,
                          }}
                        />
                        <span className="flex-1 text-left">
                          {template.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyHtml}
            disabled={!html}
          >
            <Copy className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">Copy HTML</span>
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} disabled={!html}>
            <Download className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
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
            <SectionList
              sections={sections}
              entries={entries}
              selectedIds={selectedIds}
              onReorder={handleReorder}
              onToggleVisibility={handleToggleVisibility}
              onToggleEntry={handleToggleEntry}
            />
          </div>

          <div
            id="builder-preview-panel"
            role="tabpanel"
            aria-labelledby="builder-preview-tab"
            className={cn(
              "relative w-full flex-1 overflow-auto",
              getMobilePanelClasses(mobileView, "preview")
            )}
          >
            {generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <ResumePreview
              resume={resume}
              templateId={templateId}
              html={html}
            />
          </div>
        </div>
      </div>
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
