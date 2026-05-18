"use client";

import { type ReactNode, useMemo } from "react";
import { FileCode, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipTapJSONContent } from "@/lib/editor/types";

export type CanvasMode = "wysiwyg" | "latex";

interface StudioCanvasProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  content?: TipTapJSONContent;
  html?: string;
  children: ReactNode;
}

export function StudioCanvas({
  mode,
  onModeChange,
  content,
  html,
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
        {mode === "latex" ? <LatexStub /> : children}
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

function LatexStub() {
  return (
    <div
      className="flex h-full items-center justify-center px-8 py-12"
      style={{ backgroundColor: "var(--bg-2)" }}
    >
      <div
        className="max-w-md rounded-md border border-rule bg-paper p-6 text-center shadow-paper-card"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <FileCode
          className="mx-auto mb-3 h-8 w-8"
          style={{ color: "var(--brand)" }}
          aria-hidden
        />
        <h2 className="font-display text-base font-semibold tracking-tight">
          LaTeX source view
        </h2>
        <p
          className="mt-2 text-[13px] leading-relaxed"
          style={{ color: "var(--ink-3)" }}
        >
          Raw <code className="font-mono text-[12px]">.tex</code> source for
          Overleaf is on the roadmap. Switch back to{" "}
          <strong style={{ color: "var(--ink-2)" }}>Visual</strong> to keep
          editing.
        </p>
      </div>
    </div>
  );
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
