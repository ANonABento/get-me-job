"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EntryPicker } from "@/components/builder/entry-picker";
import { TemplatePicker } from "@/components/builder/template-picker";
import { ResumePreview } from "@/components/builder/resume-preview";
import { TEMPLATES } from "@/lib/resume/template-data";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import type { BankEntry } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { Download, Copy, FileText, Loader2 } from "lucide-react";

export default function BuilderPage() {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [templateId, setTemplateId] = useState("classic");
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
        // Select all by default
        setSelectedIds(new Set(bankEntries.map((e) => e.id)));
      } catch {
        // Entries stay empty
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedIds.has(e.id)),
    [entries, selectedIds]
  );

  const resume: TailoredResume = useMemo(
    () => bankEntriesToResume(selectedEntries),
    [selectedEntries]
  );

  // Generate HTML whenever selection or template changes
  useEffect(() => {
    if (selectedEntries.length === 0) {
      setHtml("");
      return;
    }

    const controller = new AbortController();
    setGenerating(true);

    fetch("/api/builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryIds: Array.from(selectedIds),
        templateId,
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
  }, [selectedIds, templateId, selectedEntries.length]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(entries.map((e) => e.id)));
  }, [entries]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
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
      // Trigger print dialog after load
      win.onload = () => win.print();
    }
  }, [html]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Resume Builder</h1>
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
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!html}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Entry picker */}
        <div className="w-72 shrink-0 border-r overflow-hidden">
          <EntryPicker
            entries={entries}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        {/* Center: Live preview */}
        <div className="flex-1 relative overflow-hidden">
          {generating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <ResumePreview resume={resume} templateId={templateId} html={html} />
        </div>

        {/* Right: Template picker & options */}
        <div className="w-64 shrink-0 border-l overflow-y-auto p-4">
          <TemplatePicker
            templates={TEMPLATES}
            selectedId={templateId}
            onSelect={setTemplateId}
          />
        </div>
      </div>
    </div>
  );
}
