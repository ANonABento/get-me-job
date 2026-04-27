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
<<<<<<< HEAD
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bot,
  FileText,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  PenLine,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { EntryPicker } from "@/components/builder/entry-picker";
import { SectionList } from "@/components/builder/section-list";
import { TemplatePicker } from "@/components/builder/template-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  createInitialSections,
  getVisibleSectionIds,
  reorderSections,
  toggleSectionVisibility,
} from "@/lib/builder/section-manager";
import type { SectionState } from "@/lib/builder/section-manager";
import { TEMPLATES } from "@/lib/resume/template-data";
import {
  getStudioModeFromSearchParam,
  getStudioModeHref,
  getDefaultStudioContent,
  getStudioDocumentTitle,
  shouldShowJobDescription,
  STUDIO_MODE_SEARCH_PARAM,
  type StudioDocumentMode,
} from "@/lib/studio/document-studio";
import { cn } from "@/lib/utils";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";

const BANK_ENTRIES_ENDPOINT = "/api/bank";

const DOCUMENT_MODE_OPTIONS: Array<{
  mode: StudioDocumentMode;
  label: string;
  icon: LucideIcon;
}> = [
  { mode: "resume", label: "Resume", icon: FileText },
  { mode: "cover-letter", label: "Cover Letter", icon: PenLine },
  { mode: "tailored", label: "Tailored", icon: Sparkles },
];

function isBankCategory(value: unknown): value is BankCategory {
  return (
    typeof value === "string" &&
    BANK_CATEGORIES.includes(value as BankCategory)
  );
}

function isBankEntry(value: unknown): value is BankEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as { id?: unknown; category?: unknown };
  return typeof entry.id === "string" && isBankCategory(entry.category);
}

function getBankEntriesFromResponse(data: unknown): BankEntry[] {
  if (!data || typeof data !== "object") return [];

  const entries = (data as { entries?: unknown }).entries;
  return Array.isArray(entries) ? entries.filter(isBankEntry) : [];
}
=======
import { Button } from "@/components/ui/button";
import { CoverLetterWorkspace } from "@/components/builder/cover-letter-workspace";
import { SectionList } from "@/components/builder/section-list";
import { ResumePreview } from "@/components/studio/resume-preview";
import { TailorWorkspace } from "@/components/studio/tailor-workspace";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
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
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
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
  Sparkles,
} from "lucide-react";
>>>>>>> 0e974c5 (Consolidate document routes into studio)

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
<<<<<<< HEAD
  const [jobDescription, setJobDescription] = useState("");
=======
>>>>>>> 0e974c5 (Consolidate document routes into studio)
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
<<<<<<< HEAD
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [editorHtml, setEditorHtml] = useState(
    getDefaultStudioContent(initialDocumentMode)
  );
  const modeParam = searchParams.get(STUDIO_MODE_SEARCH_PARAM);
  const previousModeParamRef = useRef(modeParam);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0],
    [templateId]
  );

  const visibleSectionIds = useMemo(
    () => getVisibleSectionIds(sections),
    [sections]
  );

  const selectedEntryCount = useMemo(
    () =>
      entries.filter(
        (entry) =>
          selectedIds.has(entry.id) && visibleSectionIds.includes(entry.category)
      ).length,
    [entries, selectedIds, visibleSectionIds]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: editorHtml,
    editorProps: {
      attributes: {
        "aria-label": "Document editor",
        class:
          "min-h-[10in] outline-none text-sm leading-6 text-neutral-900 selection:bg-primary/20",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => setEditorHtml(editor.getHTML()),
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchEntries() {
      setLoadingEntries(true);
      try {
        const res = await fetch(BANK_ENTRIES_ENDPOINT);
        if (!res.ok) throw new Error("Failed to fetch bank entries");
        const data = await res.json();
        const bankEntries = getBankEntriesFromResponse(data);
        if (cancelled) return;
        setEntries(bankEntries);
        setSelectedIds(new Set(bankEntries.map((entry) => entry.id)));
      } catch {
        if (!cancelled) {
          setEntries([]);
          setSelectedIds(new Set());
        }
      } finally {
        if (!cancelled) setLoadingEntries(false);
=======
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(initialDocumentMode === "resume");
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");

  useEffect(() => {
    setDocumentMode(getStudioModeFromSearchParam(searchParams.get("mode")));
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
>>>>>>> 0e974c5 (Consolidate document routes into studio)
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
<<<<<<< HEAD
  }, []);

  const applyDocumentMode = useCallback(
    (mode: StudioDocumentMode) => {
      setDocumentMode(mode);
      const nextContent = getDefaultStudioContent(mode);
      setEditorHtml(nextContent);
      editor?.commands.setContent(nextContent);
    },
    [editor]
  );

  useEffect(() => {
    if (previousModeParamRef.current === modeParam) return;
    previousModeParamRef.current = modeParam;

    const nextMode = getStudioModeFromSearchParam(modeParam);
    applyDocumentMode(nextMode);
  }, [applyDocumentMode, modeParam]);

  const handleDocumentModeChange = useCallback(
    (mode: StudioDocumentMode) => {
      if (mode === documentMode) return;
      applyDocumentMode(mode);
      router.replace(getStudioModeHref(mode), { scroll: false });
    },
    [applyDocumentMode, documentMode, router]
  );
=======
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

  const resume: TailoredResume = useMemo(
    () => bankEntriesToResume(orderedEntries),
    [orderedEntries]
  );

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
>>>>>>> 0e974c5 (Consolidate document routes into studio)

  const handleToggleEntry = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

<<<<<<< HEAD
  const handleSelectAllEntries = useCallback(() => {
    setSelectedIds(new Set(entries.map((entry) => entry.id)));
  }, [entries]);

  const handleDeselectAllEntries = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleReorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSections((prev) => reorderSections(prev, fromIndex, toIndex));
  }, []);

  const handleToggleSectionVisibility = useCallback((categoryId: BankCategory) => {
    setSections((prev) => toggleSectionVisibility(prev, categoryId));
  }, []);

  const documentTitle = getStudioDocumentTitle(documentMode);
  const showJobDescription = shouldShowJobDescription(documentMode);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <h1 className="truncate text-base font-semibold">Document Studio</h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAssistantOpen((open) => !open)}
          title={assistantOpen ? "Collapse assistant" : "Open assistant"}
          aria-label={assistantOpen ? "Collapse assistant" : "Open assistant"}
        >
          {assistantOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)_auto]">
        <aside className="flex min-h-0 flex-col border-r bg-background lg:w-80">
          <div className="space-y-5 overflow-y-auto p-4">
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">Document Type</h2>
              <div
                role="tablist"
                aria-label="Document type"
                className="grid grid-cols-3 rounded-md border bg-muted/30 p-0.5"
              >
                {DOCUMENT_MODE_OPTIONS.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    role="tab"
                    type="button"
                    aria-selected={documentMode === mode}
                    onClick={() => handleDocumentModeChange(mode)}
                    className={cn(
                      "inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded px-2 text-xs font-medium transition-colors",
                      documentMode === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {showJobDescription && (
              <section className="space-y-2">
                <label
                  htmlFor="studio-job-description"
                  className="text-sm font-semibold"
                >
                  Job Description
                </label>
                <Textarea
                  id="studio-job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the role description here."
                  className="min-h-36 resize-none"
                />
              </section>
            )}

            <section className="overflow-hidden rounded-md border">
              {loadingEntries ? (
                <div className="flex h-44 items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <div className="h-[22rem]">
                  <SectionList
                    sections={sections}
                    entries={entries}
                    selectedIds={selectedIds}
                    onReorder={handleReorderSections}
                    onToggleVisibility={handleToggleSectionVisibility}
                    onToggleEntry={handleToggleEntry}
                  />
                </div>
              )}
            </section>

            <TemplatePicker
              templates={TEMPLATES}
              selectedId={templateId}
              onSelect={setTemplateId}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEntryPickerOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add from bank
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col bg-muted/40">
          <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{documentTitle}</h2>
              <p className="text-xs text-muted-foreground">
                {selectedEntryCount} selected entries
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: selectedTemplate.styles.accentColor }}
              />
              <span>{selectedTemplate.name}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
            <div
              data-testid="studio-page-frame"
              className="mx-auto min-h-[11in] w-[8.5in] max-w-full bg-white p-10 text-neutral-900 shadow-xl"
              style={{
                borderTop: `5px solid ${selectedTemplate.styles.accentColor}`,
                fontFamily: selectedTemplate.styles.fontFamily,
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>

        <aside
          className={cn(
            "min-h-0 border-l bg-background transition-[width] duration-200",
            assistantOpen ? "w-full lg:w-[360px]" : "hidden lg:block lg:w-0"
          )}
        >
          {assistantOpen && (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Bot className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">AI Assistant</h2>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Suggestions for {documentTitle.toLowerCase()} edits will appear
                  here.
                </div>
                {showJobDescription && jobDescription.length > 0 && (
                  <div className="rounded-md border p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Job Description
                    </p>
                    <p className="mt-2 line-clamp-6 text-sm">
                      {jobDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={entryPickerOpen} onOpenChange={setEntryPickerOpen}>
        <DialogContent className="flex h-[min(720px,90vh)] max-w-3xl flex-col p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Add from bank</DialogTitle>
            <DialogDescription>
              Choose the profile entries available to this document.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <EntryPicker
              entries={entries}
              selectedIds={selectedIds}
              onToggle={handleToggleEntry}
              onSelectAll={handleSelectAllEntries}
              onDeselectAll={handleDeselectAllEntries}
            />
          </div>
        </DialogContent>
      </Dialog>
=======
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setSections((prev) => reorderSections(prev, fromIndex, toIndex));
    },
    []
  );

  const handleToggleVisibility = useCallback((categoryId: BankCategory) => {
    setSections((prev) => toggleSectionVisibility(prev, categoryId));
  }, []);

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
    (mode: StudioDocumentMode) => {
      setDocumentMode(mode);
      router.replace(getStudioModeHref(mode), { scroll: false });
    },
    [router]
  );

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
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
              id="document-mode-tailored-tab"
              role="tab"
              aria-selected={documentMode === "tailored"}
              aria-controls="document-mode-tailored-panel"
              onClick={() => handleDocumentModeChange("tailored")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors",
                documentMode === "tailored"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Tailored
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
                resume={resume}
                templateId={templateId}
                html={html}
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
>>>>>>> 0e974c5 (Consolidate document routes into studio)
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
