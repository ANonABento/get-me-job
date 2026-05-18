"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Check, Copy, Download, FileCode, FileText } from "lucide-react";
import { htmlToLatexPreview } from "@/lib/export/html-to-latex";
import { formatAbsolute, nowIso } from "@/lib/format/time";
import { cn } from "@/lib/utils";
import type { TipTapJSONContent } from "@/lib/editor/types";

export type CanvasMode = "wysiwyg" | "latex";

interface StudioCanvasProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  content?: TipTapJSONContent;
  html?: string;
  templateName?: string;
  documentName?: string;
  children: ReactNode;
}

export function StudioCanvas({
  mode,
  onModeChange,
  content,
  html,
  templateName = "Current template",
  documentName = "document",
  children,
}: StudioCanvasProps) {
  const { words, pages } = useMemo(
    () => deriveStats({ content, html }),
    [content, html],
  );
  const formattedWords = useMemo(
    () => new Intl.NumberFormat().format(words),
    [words],
  );

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-3 border-b border-rule px-3 py-1.5"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--rule)",
        }}
      >
        <div
          role="tablist"
          aria-label="Editor view"
          className="flex items-center gap-0.5 rounded-sm border border-rule bg-paper p-0.5"
          style={{
            backgroundColor: "var(--paper)",
            borderColor: "var(--rule)",
          }}
        >
          <CanvasModeTab
            label="Visual"
            active={mode === "wysiwyg"}
            onClick={() => onModeChange("wysiwyg")}
            icon={<FileText className="h-3 w-3" />}
          />
          <CanvasModeTab
            label="LaTeX"
            active={mode === "latex"}
            onClick={() => onModeChange("latex")}
            icon={<FileCode className="h-3 w-3" />}
          />
        </div>
        <span
          className="hidden font-mono text-[10px] uppercase tracking-[0.14em] md:inline-flex items-center gap-1.5"
          style={{ color: "var(--ink-3)" }}
        >
          <span
            aria-hidden
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: "var(--brand)" }}
          />
          {mode === "wysiwyg" ? "WYSIWYG editor" : "LaTeX source"}
        </span>
        <span className="flex-1" />
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {mode === "latex" ? (
          <LatexSourcePanel
            html={html}
            templateName={templateName}
            documentName={documentName}
            onBack={() => onModeChange("wysiwyg")}
          />
        ) : (
          children
        )}
      </div>

      <div
        className="flex items-center justify-between border-t border-rule px-3 py-1.5 text-[11px]"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--rule)",
          color: "var(--ink-3)",
        }}
      >
        <span className="font-mono uppercase tracking-[0.14em]">
          {pages} page{pages === 1 ? "" : "s"} · {formattedWords} word
          {words === 1 ? "" : "s"}
        </span>
        <span className="font-mono uppercase tracking-[0.14em]">
          {mode === "wysiwyg" ? "Visual" : "LaTeX"}
        </span>
      </div>
    </div>
  );
}

function CanvasModeTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm px-2 text-[11.5px] font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function LatexSourcePanel({
  html,
  templateName,
  documentName,
  onBack,
}: {
  html?: string;
  templateName: string;
  documentName: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const preview = useMemo(
    () =>
      htmlToLatexPreview(html || "<p></p>", {
        title: documentName || "Resume",
      }),
    [documentName, html],
  );
  const timestamp = formatAbsolute(nowIso(), { includeTime: true });

  async function copySource() {
    await navigator.clipboard.writeText(preview.tex);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadSource() {
    const blob = new Blob([preview.tex], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFilename(documentName)}.tex`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ backgroundColor: "var(--bg-2)" }}
    >
      <div
        className="flex items-center gap-2 border-b border-rule px-3 py-2"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-sm border border-rule px-2 text-[12px] font-medium"
          onClick={copySource}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy .tex"}
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-sm border border-rule px-2 text-[12px] font-medium"
          onClick={downloadSource}
        >
          <Download className="h-3.5 w-3.5" />
          Download .tex
        </button>
        <button
          type="button"
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-sm border border-rule px-2 text-[12px] font-medium"
          onClick={onBack}
        >
          <FileText className="h-3.5 w-3.5" />
          Switch back to Visual
        </button>
      </div>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-rule px-3 py-2 font-mono text-[10px] uppercase"
        style={{ color: "var(--ink-3)", borderColor: "var(--rule)" }}
      >
        <span>Template: {templateName}</span>
        <span>Generated: {timestamp}</span>
        {preview.warnings.length > 0 && (
          <span className="text-amber-700">
            Warning: {preview.warnings.join(" ")}
          </span>
        )}
      </div>

      <pre
        className="m-0 min-h-0 flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed"
        style={{ color: "var(--ink)", backgroundColor: "var(--bg-2)" }}
      >
        <code>{preview.tex}</code>
      </pre>
    </div>
  );
}

function safeFilename(input: string): string {
  const cleaned = input.replace(/[^a-z0-9-_ ]/gi, "").trim();
  return cleaned || "document";
}

function deriveStats({
  content,
  html,
}: {
  content?: TipTapJSONContent;
  html?: string;
}): { words: number; pages: number } {
  let text = "";
  if (content) {
    text = extractText(content);
  } else if (html) {
    text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }
  const words = (text.match(/\S+/g) ?? []).length;
  // Rough heuristic: a typical resume page fits ~325 words once template
  // chrome is accounted for. The exact page count requires a render-pass
  // measurement we don't have here — this gives a useful approximation
  // for the footer until we wire MutationObserver-based counting.
  const pages = Math.max(1, Math.ceil(words / 325));
  return { words, pages };
}

function extractText(node: TipTapJSONContent): string {
  if (!node) return "";
  let buffer = "";
  if (typeof (node as { text?: unknown }).text === "string") {
    buffer += (node as { text: string }).text + " ";
  }
  const children = (node as { content?: TipTapJSONContent[] }).content;
  if (Array.isArray(children)) {
    for (const child of children) {
      buffer += extractText(child);
    }
  }
  return buffer;
}
