"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import {
  Download,
  Copy,
  FileText,
  Loader2,
  ChevronDown,
  Check,
  Pencil,
  Eye,
} from "lucide-react";

export default function BuilderPage() {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL
  );

  // Fetch bank entries
  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch("/api/bank");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const bankEntries: BankEntry[] = data.entries || [];
        setEntries(bankEntries);
        setSelectedIds(new Set(bankEntries.map((e) => e.id)));
      } catch {
        // Entries stay empty
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

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

  // Order entries by section order
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

  // Generate HTML whenever selection, visibility, order, or template changes
  useEffect(() => {
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
        if (data.html) setHtml(data.html);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to generate preview:", err);
        }
      })
      .finally(() => setGenerating(false));

    return () => controller.abort();
  }, [orderedEntries, templateId, visibleCategoryIds]);

  const handleToggleEntry = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header with template switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Resume Builder</h1>

          {/* Inline template switcher */}
          <div className="relative md:ml-4">
            <button
              onClick={() => setTemplateOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: selectedTemplate?.styles.accentColor }}
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

      {/* Mobile tab switcher (hidden on desktop) */}
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

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section list with drag-and-drop */}
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

        {/* Right: Live preview */}
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
          <ResumePreview resume={resume} templateId={templateId} html={html} />
        </div>
      </div>
    </div>
  );
}
