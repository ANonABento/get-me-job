"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getResponseErrorMessage,
  showErrorToast,
} from "@/components/ui/error-toast";
import { useToast } from "@/components/ui/toast";
import { SectionList } from "@/components/builder/section-list";
import { ResumePreview } from "@/components/builder/resume-preview";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import {
  createInitialSections,
  toggleSectionVisibility,
  reorderSections,
  getVisibleSectionIds,
} from "@/lib/builder/section-manager";
import type { SectionState } from "@/lib/builder/section-manager";
import type { BankEntry, BankCategory } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import {
  Download,
  Copy,
  FileText,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

export default function BuilderPage() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);

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
      } catch (error) {
        showErrorToast(addToast, {
          title: "Couldn't load bank entries",
          error,
          fallbackDescription: "Please refresh and try again.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [addToast]);

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
      setGenerating(false);
      return;
    }

    const controller = new AbortController();
    const entryIds = orderedEntries.map((e) => e.id);
    let active = true;

    async function generatePreview() {
      setGenerating(true);

      try {
        const res = await fetch("/api/builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryIds,
            templateId,
            sectionOrder: visibleCategoryIds,
          }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            getResponseErrorMessage(data, "Failed to generate preview")
          );
        }

        if (active && data?.html) {
          setHtml(data.html);
        }
      } catch (error) {
        if (
          !active ||
          controller.signal.aborted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }

        showErrorToast(addToast, {
          title: "Couldn't update preview",
          error,
          fallbackDescription: "Please try changing your selection again.",
        });
      } finally {
        if (active && !controller.signal.aborted) {
          setGenerating(false);
        }
      }
    }

    generatePreview();

    return () => {
      active = false;
      controller.abort();
    };
  }, [addToast, orderedEntries, templateId, visibleCategoryIds]);

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
    try {
      await navigator.clipboard.writeText(html);
    } catch (error) {
      showErrorToast(addToast, {
        title: "Couldn't copy HTML",
        error,
        fallbackDescription: "Please try copying again.",
      });
    }
  }, [addToast, html]);

  const handleDownloadPdf = useCallback(() => {
    if (!html) return;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
      return;
    }
    showErrorToast(addToast, {
      title: "Couldn't open print preview",
      fallbackDescription: "Please allow pop-ups and try again.",
    });
  }, [addToast, html]);

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
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Resume Builder</h1>

          {/* Inline template switcher */}
          <div className="relative ml-4">
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
            <Copy className="h-4 w-4 mr-1.5" />
            Copy HTML
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} disabled={!html}>
            <Download className="h-4 w-4 mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section list with drag-and-drop */}
        <div className="w-80 shrink-0 border-r overflow-hidden">
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
        <div className="flex-1 relative overflow-hidden">
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
