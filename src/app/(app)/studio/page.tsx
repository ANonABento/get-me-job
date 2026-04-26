"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  getDefaultStudioContent,
  getStudioDocumentTitle,
  shouldShowJobDescription,
  type StudioDocumentMode,
} from "@/lib/studio/document-studio";
import { cn } from "@/lib/utils";
import type { BankCategory, BankEntry } from "@/types";

const DOCUMENT_MODE_OPTIONS: Array<{
  mode: StudioDocumentMode;
  label: string;
  icon: LucideIcon;
}> = [
  { mode: "resume", label: "Resume", icon: FileText },
  { mode: "cover-letter", label: "Cover Letter", icon: PenLine },
  { mode: "tailored", label: "Tailored", icon: Sparkles },
];

export default function StudioPage() {
  const [documentMode, setDocumentMode] =
    useState<StudioDocumentMode>("resume");
  const [jobDescription, setJobDescription] = useState("");
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(createInitialSections);
  const [templateId, setTemplateId] = useState("classic");
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [editorHtml, setEditorHtml] = useState(
    getDefaultStudioContent("resume")
  );

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
        const res = await fetch("/api/bank");
        if (!res.ok) throw new Error("Failed to fetch bank entries");
        const data = await res.json();
        const bankEntries: BankEntry[] = data.entries ?? [];
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
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDocumentModeChange = useCallback(
    (mode: StudioDocumentMode) => {
      setDocumentMode(mode);
      const nextContent = getDefaultStudioContent(mode);
      setEditorHtml(nextContent);
      editor?.commands.setContent(nextContent);
    },
    [editor]
  );

  const handleToggleEntry = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
    </div>
  );
}
