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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CoverLetterWorkspace } from "@/components/builder/cover-letter-workspace";
import { SectionList } from "@/components/builder/section-list";
import { ResumePreview } from "@/components/builder/resume-preview";
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
  getBuilderModeFromSearchParam,
  getBuilderModeHref,
  type BuilderDocumentMode,
} from "@/lib/builder/document-mode";
import {
  AUTO_SAVE_INTERVAL_MS,
  addBuilderVersion,
  areBuilderStatesEqual,
  createBuilderVersion,
  getLatestBuilderVersion,
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
  Download,
  Copy,
  FileText,
  Loader2,
  ChevronDown,
  Check,
  Pencil,
  Eye,
  PenLine,
  History,
  Save,
  RotateCcw,
  Clock3,
} from "lucide-react";

const RESUME_BUILDER_DOCUMENT_ID = "resume";

function getOrderedVisibleEntries(
  entries: BankEntry[],
  selectedIds: ReadonlySet<string>,
  sections: SectionState[]
): BankEntry[] {
  const visibleCategoryIds = getVisibleSectionIds(sections);
  const categoryOrder = new Map(
    visibleCategoryIds.map((id, index) => [id, index])
  );

  return entries
    .filter(
      (entry) =>
        selectedIds.has(entry.id) && visibleCategoryIds.includes(entry.category)
    )
    .sort(
      (a, b) =>
        (categoryOrder.get(a.category) ?? 999) -
        (categoryOrder.get(b.category) ?? 999)
    );
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
  const [documentMode, setDocumentMode] =
    useState<BuilderDocumentMode>(initialDocumentMode);
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(initialDocumentMode === "resume");
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [versionName, setVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const showErrorToast = useErrorToast();
  const lastPreviewErrorToastRef = useRef("");
  const restoredDraftRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const versionsRef = useRef<BuilderVersion[]>([]);
  const lastSavedStateRef = useRef<BuilderDraftState | null>(null);

  const currentBuilderState = useMemo<BuilderDraftState>(
    () => ({
      documentMode: "resume",
      selectedIds: Array.from(selectedIds),
      sections,
      templateId,
      html,
    }),
    [html, sections, selectedIds, templateId]
  );
  const currentBuilderStateRef = useRef(currentBuilderState);

  useEffect(() => {
    currentBuilderStateRef.current = currentBuilderState;

    const lastSavedState = lastSavedStateRef.current;
    if (!lastSavedState) return;

    setHasUnsavedChanges(
      !areBuilderStatesEqual(currentBuilderState, lastSavedState)
    );
  }, [currentBuilderState]);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const markResumeDirty = useCallback(() => {
    setPreviewVersionId(null);
    setHasUnsavedChanges(true);
  }, []);

  const applyBuilderState = useCallback((state: BuilderDraftState) => {
    setSelectedIds(new Set(state.selectedIds));
    setSections(state.sections);
    setTemplateId(state.templateId);
    setHtml(state.html);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVersions = readBuilderVersions(
      window.localStorage,
      RESUME_BUILDER_DOCUMENT_ID
    );
    versionsRef.current = storedVersions;
    setVersions(storedVersions);

    const latestVersion = getLatestBuilderVersion(storedVersions);
    if (latestVersion) {
      restoredDraftRef.current = true;
      lastSavedStateRef.current = latestVersion.state;
      applyBuilderState(latestVersion.state);
      setHasUnsavedChanges(false);
    }
  }, [applyBuilderState]);

  const persistBuilderVersion = useCallback(
    (
      kind: BuilderVersion["kind"],
      name: string,
      state = currentBuilderStateRef.current
    ) => {
      if (typeof window === "undefined") return false;

      const version = createBuilderVersion(state, { kind, name });
      const nextVersions = addBuilderVersion(versionsRef.current, version);
      const didWrite = writeBuilderVersions(
        window.localStorage,
        RESUME_BUILDER_DOCUMENT_ID,
        nextVersions
      );

      if (!didWrite) return false;

      versionsRef.current = nextVersions;
      lastSavedStateRef.current = version.state;
      setVersions(nextVersions);
      setHasUnsavedChanges(
        !areBuilderStatesEqual(currentBuilderStateRef.current, version.state)
      );
      return true;
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      if (!hasUnsavedChangesRef.current) return;
      persistBuilderVersion(
        "auto",
        "Auto-save",
        currentBuilderStateRef.current
      );
    }, AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [persistBuilderVersion]);

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
        setEntries(bankEntries);
        if (!restoredDraftRef.current) {
          setSelectedIds(new Set(bankEntries.map((e) => e.id)));
        }
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

  const orderedEntries = useMemo(
    () => getOrderedVisibleEntries(entries, selectedIds, sections),
    [entries, sections, selectedIds]
  );

  const resume: TailoredResume = useMemo(
    () => bankEntriesToResume(orderedEntries),
    [orderedEntries]
  );

  const previewVersion = useMemo(
    () => versions.find((version) => version.id === previewVersionId) ?? null,
    [previewVersionId, versions]
  );
  const previewSelectedIds = useMemo(
    () => new Set(previewVersion?.state.selectedIds ?? []),
    [previewVersion]
  );
  const previewOrderedEntries = useMemo(
    () =>
      previewVersion
        ? getOrderedVisibleEntries(
            entries,
            previewSelectedIds,
            previewVersion.state.sections
          )
        : [],
    [entries, previewSelectedIds, previewVersion]
  );
  const displayResume: TailoredResume = useMemo(
    () =>
      previewVersion
        ? bankEntriesToResume(previewOrderedEntries)
        : resume,
    [previewOrderedEntries, previewVersion, resume]
  );
  const displayTemplateId = previewVersion?.state.templateId ?? templateId;
  const displayHtml = previewVersion?.state.html ?? html;

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
        sectionOrder: getVisibleSectionIds(sections),
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
    sections,
    showErrorToast,
    templateId,
  ]);

  const handleToggleEntry = useCallback((id: string) => {
    markResumeDirty();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [markResumeDirty]);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      markResumeDirty();
      setSections((prev) => reorderSections(prev, fromIndex, toIndex));
    },
    [markResumeDirty]
  );

  const handleToggleVisibility = useCallback((categoryId: BankCategory) => {
    markResumeDirty();
    setSections((prev) => toggleSectionVisibility(prev, categoryId));
  }, [markResumeDirty]);

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
  const manualVersionName =
    versionName.trim() ||
    `v${versions.filter((version) => version.kind === "manual").length + 1}`;
  const saveButtonLabel =
    manualVersionName.length > 8 ? "Save" : `Save as ${manualVersionName}`;

  const handleNamedSave = useCallback(() => {
    persistBuilderVersion("manual", manualVersionName);
    setVersionName("");
  }, [manualVersionName, persistBuilderVersion]);

  const handleRestoreVersion = useCallback(
    (version: BuilderVersion) => {
      persistBuilderVersion(
        "manual",
        `Restored ${version.name}`,
        version.state
      );
      applyBuilderState(version.state);
      setPreviewVersionId(null);
    },
    [applyBuilderState, persistBuilderVersion]
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
                            markResumeDirty();
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

          {documentMode === "resume" && (
            <Badge
              variant={hasUnsavedChanges ? "warning" : "success"}
              className="rounded-md"
            >
              {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </Badge>
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
            <button
              id="builder-history-tab"
              role="tab"
              aria-selected={mobileView === "history"}
              aria-controls="builder-history-panel"
              onClick={() => setMobileView("history")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                mobileView === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="h-4 w-4" />
              History
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
              {previewVersion && (
                <div className="absolute left-4 top-4 z-20 rounded-md border bg-background px-3 py-1 text-xs font-medium shadow-sm">
                  Previewing {previewVersion.name}
                </div>
              )}
              <ResumePreview
                resume={displayResume}
                templateId={displayTemplateId}
                html={displayHtml}
              />
            </div>

            <aside
              id="builder-history-panel"
              role="tabpanel"
              aria-labelledby="builder-history-tab"
              className={cn(
                "w-full border-l bg-background md:w-80 md:flex-none md:shrink-0",
                getMobilePanelClasses(mobileView, "history")
              )}
            >
              <div className="flex h-full flex-col">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Version History</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {versions.length}/20
                    </span>
                  </div>
                </div>

                <div className="border-b p-3">
                  <div className="flex gap-2">
                    <Input
                      value={versionName}
                      onChange={(event) => setVersionName(event.target.value)}
                      placeholder="v1"
                      className="h-9"
                      aria-label="Version name"
                    />
                    <Button
                      size="sm"
                      onClick={handleNamedSave}
                      className="shrink-0"
                    >
                      <Save className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">
                        {saveButtonLabel}
                      </span>
                    </Button>
                  </div>
                </div>

                {previewVersion && (
                  <div className="border-b bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {previewVersion.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(previewVersion.savedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          previewVersion.kind === "auto" ? "secondary" : "info"
                        }
                      >
                        {previewVersion.kind === "auto" ? "Auto" : "Named"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRestoreVersion(previewVersion)}
                      >
                        <RotateCcw className="h-4 w-4 md:mr-1.5" />
                        <span className="hidden md:inline">Restore</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewVersionId(null)}
                      >
                        Current
                      </Button>
                    </div>
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {versions.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      No saved versions yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {versions.map((version) => {
                        const isPreviewing = version.id === previewVersionId;

                        return (
                          <button
                            key={version.id}
                            onClick={() => setPreviewVersionId(version.id)}
                            className={cn(
                              "w-full rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted",
                              isPreviewing && "border-primary bg-primary/5"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium">
                                {version.name}
                              </span>
                              {version.kind === "auto" && (
                                <Clock3 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(version.savedAt).toLocaleString()}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>
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
