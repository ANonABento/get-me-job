"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CoverLetterWorkspace } from "@/components/builder/cover-letter-workspace";
import { SectionList } from "@/components/builder/section-list";
import { ResumePreview } from "@/components/builder/resume-preview";
import { TEMPLATES } from "@/lib/resume/template-data";
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
  canRedoEditorHistory,
  canUndoEditorHistory,
  createEditorHistory,
  pushEditorHistory,
  redoEditorHistory,
  undoEditorHistory,
} from "@/lib/builder/editor-history";
import {
  createEditableResumeDocument,
  reorderEditableDocumentSections,
  updateEditableEntryBullet,
  updateEditableEntryField,
  updateEditableSectionTitle,
  type EditableEntryField,
  type EditableResumeDocument,
} from "@/lib/builder/editor-document";
import {
  getBuilderModeFromSearchParam,
  getBuilderModeHref,
  type BuilderDocumentMode,
} from "@/lib/builder/document-mode";
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  Download,
  Copy,
  FileText,
  Loader2,
  ChevronDown,
  Check,
  Pencil,
  Eye,
  PenLine,
} from "lucide-react";

interface BuilderEditorState {
  sections: SectionState[];
  selectedIds: string[];
  document: EditableResumeDocument;
}

function buildEditorState(
  entries: BankEntry[],
  sections: SectionState[],
  selectedIds: string[]
): BuilderEditorState {
  const visibleCategoryIds = getVisibleSectionIds(sections);
  const selectedIdSet = new Set(selectedIds);
  const categoryOrder = new Map(
    visibleCategoryIds.map((id, index) => [id, index])
  );
  const orderedEntries = entries
    .filter(
      (entry) =>
        selectedIdSet.has(entry.id) && visibleCategoryIds.includes(entry.category)
    )
    .sort(
      (a, b) =>
        (categoryOrder.get(a.category) ?? 999) -
        (categoryOrder.get(b.category) ?? 999)
    );

  return {
    sections,
    selectedIds,
    document: createEditableResumeDocument(orderedEntries, visibleCategoryIds),
  };
}

function toggleSelectedId(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

function BuilderLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function BuilderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocumentMode = getBuilderModeFromSearchParam(
    searchParams.get("mode")
  );
  const initialSections = useMemo(() => createInitialSections(), []);
  const [documentMode, setDocumentMode] =
    useState<BuilderDocumentMode>(initialDocumentMode);
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [editorHistory, setEditorHistory] = useState(() =>
    createEditorHistory(buildEditorState([], initialSections, []))
  );
  const [templateId, setTemplateId] = useState("classic");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [loading, setLoading] = useState(initialDocumentMode === "resume");
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");
  const editorState = editorHistory.present;
  const sections = editorState.sections;
  const selectedIds = useMemo(
    () => new Set(editorState.selectedIds),
    [editorState.selectedIds]
  );

  useEffect(() => {
    setDocumentMode(getBuilderModeFromSearchParam(searchParams.get("mode")));
  }, [searchParams]);

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
        const nextSections = createInitialSections();
        setEntries(bankEntries);
        setEditorHistory(
          createEditorHistory(
            buildEditorState(
              bankEntries,
              nextSections,
              bankEntries.map((e) => e.id)
            )
          )
        );
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

  useEffect(() => {
    if (documentMode !== "resume") return;

    if (orderedEntries.length === 0) {
      setHtml("");
      return;
    }

    const controller = new AbortController();
    setGenerating(true);

    const entryIds = orderedEntries.map((e) => e.id);

    fetch("/api/builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryIds,
        templateId,
        sectionOrder: visibleCategoryIds,
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.html) {
          lastPreviewErrorToastRef.current = "";
          setHtml(data.html);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          const message = err instanceof Error ? err.message : "preview";
          if (lastPreviewErrorToastRef.current !== message) {
            lastPreviewErrorToastRef.current = message;
            showErrorToast(err, {
              title: "Could not update preview",
              fallbackDescription: "Please try changing the resume content again.",
            });
          }
        }
      })
      .finally(() => setGenerating(false));

    return () => controller.abort();
  }, [
    documentMode,
    orderedEntries,
    showErrorToast,
    templateId,
    visibleCategoryIds,
  ]);

  const commitEditorState = useCallback(
    (updater: (state: BuilderEditorState) => BuilderEditorState) => {
      setEditorHistory((prev) => {
        const next = updater(prev.present);
        return pushEditorHistory(prev, next);
      });
    },
    []
  );

  const handleToggleEntry = useCallback(
    (id: string) => {
      commitEditorState((prev) =>
        buildEditorState(
          entries,
          prev.sections,
          toggleSelectedId(prev.selectedIds, id)
        )
      );
    },
    [commitEditorState, entries]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      commitEditorState((prev) => {
        const sections = reorderSections(prev.sections, fromIndex, toIndex);
        const document = reorderEditableDocumentSections(
          prev.document,
          fromIndex,
          toIndex
        );
        if (sections === prev.sections && document === prev.document) {
          return prev;
        }
        return { ...prev, sections, document };
      });
    },
    [commitEditorState]
  );

  const handleToggleVisibility = useCallback(
    (categoryId: BankCategory) => {
      commitEditorState((prev) =>
        buildEditorState(
          entries,
          toggleSectionVisibility(prev.sections, categoryId),
          prev.selectedIds
        )
      );
    },
    [commitEditorState, entries]
  );

  const handleSectionTitleChange = useCallback(
    (sectionId: BankCategory, value: string) => {
      commitEditorState((prev) => ({
        ...prev,
        document: updateEditableSectionTitle(prev.document, sectionId, value),
      }));
    },
    [commitEditorState]
  );

  const handleEntryFieldChange = useCallback(
    (
      sectionId: BankCategory,
      entryId: string,
      field: EditableEntryField,
      value: string
    ) => {
      commitEditorState((prev) => ({
        ...prev,
        document: updateEditableEntryField(
          prev.document,
          sectionId,
          entryId,
          field,
          value
        ),
      }));
    },
    [commitEditorState]
  );

  const handleEntryBulletChange = useCallback(
    (
      sectionId: BankCategory,
      entryId: string,
      bulletIndex: number,
      value: string
    ) => {
      commitEditorState((prev) => ({
        ...prev,
        document: updateEditableEntryBullet(
          prev.document,
          sectionId,
          entryId,
          bulletIndex,
          value
        ),
      }));
    },
    [commitEditorState]
  );

  const handleCopyHtml = useCallback(async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
  }, [html]);

  const handleDownloadPdf = useCallback(() => {
    if (!html) return;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    }
  }, [html]);

  const handleDocumentModeChange = useCallback(
    (mode: BuilderDocumentMode) => {
      setDocumentMode(mode);
      router.replace(getBuilderModeHref(mode), { scroll: false });
    },
    [router]
  );

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  if (loading && documentMode === "resume") {
    return <BuilderLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Document Builder</h1>

          <div
            role="tablist"
            aria-label="Document type"
            className="flex rounded-md border bg-muted/30 p-0.5"
          >
            <button
              id="document-mode-resume-tab"
              role="tab"
              aria-selected={documentMode === "resume"}
              aria-controls="document-mode-resume-panel"
              onClick={() => handleDocumentModeChange("resume")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors",
                documentMode === "resume"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Resume
            </button>
            <button
              id="document-mode-cover-letter-tab"
              role="tab"
              aria-selected={documentMode === "cover-letter"}
              aria-controls="document-mode-cover-letter-panel"
              onClick={() => handleDocumentModeChange("cover-letter")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors",
                documentMode === "cover-letter"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PenLine className="h-4 w-4" />
              Cover Letter
            </button>
          </div>

          {documentMode === "resume" && (
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
          )}
        </div>

        {documentMode === "resume" && (
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
        )}
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
            <button
              id="builder-edit-tab"
              role="tab"
              aria-selected={mobileView === "edit"}
              aria-controls="builder-edit-panel"
              onClick={() => setMobileView("edit")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                mobileView === "edit"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              id="builder-preview-tab"
              role="tab"
              aria-selected={mobileView === "preview"}
              aria-controls="builder-preview-panel"
              onClick={() => setMobileView("preview")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                mobileView === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
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
                pickerOpen={entryPickerOpen}
                onPickerOpenChange={setEntryPickerOpen}
              />
            </div>

            <div
              id="builder-preview-panel"
              role="tabpanel"
              aria-labelledby="builder-preview-tab"
              className={cn(
                "relative w-full flex-1 overflow-hidden",
                getMobilePanelClasses(mobileView, "preview")
              )}
            >
              {generating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              <ResumePreview
                document={editorState.document}
                canUndo={canUndoEditorHistory(editorHistory)}
                canRedo={canRedoEditorHistory(editorHistory)}
                onUndo={() => setEditorHistory(undoEditorHistory)}
                onRedo={() => setEditorHistory(redoEditorHistory)}
                onAddSection={() => {
                  setEntryPickerOpen(true);
                  setMobileView("edit");
                }}
                onSectionReorder={handleReorder}
                onSectionTitleChange={handleSectionTitleChange}
                onEntryFieldChange={handleEntryFieldChange}
                onEntryBulletChange={handleEntryBulletChange}
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
          className="min-h-0 flex-1 overflow-hidden"
        >
          <CoverLetterWorkspace />
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderPageContent />
    </Suspense>
  );
}
