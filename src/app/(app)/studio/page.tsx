"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Editor } from "@tiptap/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CoverLetterWorkspace } from "@/components/builder/cover-letter-workspace";
import { SectionList } from "@/components/builder/section-list";
import { EditorToolbar } from "@/components/studio/editor-toolbar";
import { ResumePreview } from "@/components/studio/resume-preview";
import { TailorWorkspace } from "@/components/studio/tailor-workspace";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
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
  getStudioModeFromSearchParam,
  getStudioModeHref,
  type StudioDocumentMode,
} from "@/lib/studio/document-mode";
import {
  AUTO_SAVE_INTERVAL_MS,
  addBuilderVersion,
  createBuilderVersion,
  isBuilderStateSaved,
  readBuilderVersions,
  writeBuilderVersions,
  type BuilderDraftState,
  type BuilderVersion,
} from "@/lib/builder/version-history";
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  FileText,
  Loader2,
  Pencil,
  Eye,
  PenLine,
  Sparkles,
  Save,
  History,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

const STUDIO_MODE_TABS: Array<{
  mode: StudioDocumentMode;
  label: string;
  Icon: LucideIcon;
}> = [
  { mode: "resume", label: "Resume", Icon: FileText },
  { mode: "tailored", label: "Tailored", Icon: Sparkles },
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

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocumentMode = getStudioModeFromSearchParam(
    searchParams.get("mode")
  );
  const [documentMode, setDocumentMode] =
    useState<StudioDocumentMode>(initialDocumentMode);
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] =
    useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [loading, setLoading] = useState(initialDocumentMode === "resume");
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [, setEditorVersion] = useState(0);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [manualVersionName, setManualVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    setDocumentMode(getStudioModeFromSearchParam(searchParams.get("mode")));
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVersions = readBuilderVersions(
      window.localStorage,
      RESUME_DOCUMENT_ID
    );
    versionsRef.current = storedVersions;
    setVersions(storedVersions);
  }, []);

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
        setSelectedIds(new Set(bankEntries.map((e) => e.id)));
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

  const currentDraft: BuilderDraftState = useMemo(
    () => ({
      documentMode: "resume",
      selectedIds: Array.from(selectedIds),
      sections,
      templateId,
      html,
    }),
    [html, sections, selectedIds, templateId]
  );

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
    if (!editor) return;

    const refreshToolbarState = () => setEditorVersion((version) => version + 1);
    editor.on("selectionUpdate", refreshToolbarState);
    editor.on("transaction", refreshToolbarState);

    return () => {
      editor.off("selectionUpdate", refreshToolbarState);
      editor.off("transaction", refreshToolbarState);
    };
  }, [editor]);

  const handleToggleEntry = useCallback((id: string) => {
    setPreviewVersionId(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPreviewVersionId(null);
      setSections((prev) => reorderSections(prev, fromIndex, toIndex));
    },
    []
  );

  const handleToggleVisibility = useCallback((categoryId: BankCategory) => {
    setPreviewVersionId(null);
    setSections((prev) => toggleSectionVisibility(prev, categoryId));
  }, []);

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

                <section className="border-t bg-background p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Version History</h2>
                  </div>

                  <form onSubmit={handleManualSave} className="mb-3 space-y-2">
                    <input
                      value={manualVersionName}
                      onChange={(event) =>
                        setManualVersionName(event.target.value)
                      }
                      placeholder="Version name (optional)"
                      aria-label="Version name"
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Save className="mr-1.5 h-4 w-4" />
                      Save Version
                    </Button>
                  </form>

                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {versions.length === 0 ? (
                      <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                        No versions saved yet.
                      </p>
                    ) : (
                      versions.map((version) => (
                        <div
                          key={version.id}
                          className={cn(
                            "rounded-md border p-2",
                            previewVersionId === version.id &&
                              "border-primary bg-primary/5"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewVersionId(version.id)}
                            aria-label={`Preview ${version.name}`}
                            className="w-full text-left"
                          >
                            <span className="block truncate text-sm font-medium">
                              {version.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatVersionTimestamp(version.savedAt)}
                            </span>
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mt-2 h-7 w-full justify-start px-2 text-xs"
                            onClick={() => handleRestoreVersion(version)}
                            aria-label={`Restore ${version.name}`}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Restore
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
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
                resume={resume}
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

      {documentMode === "tailored" && (
        <div
          id="document-mode-tailored-panel"
          role="tabpanel"
          aria-labelledby="document-mode-tailored-tab"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <TailorWorkspace />
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

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioPageContent />
    </Suspense>
  );
}
