"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  List,
  Download,
  Italic,
  Loader2,
  Printer,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clampZoomPercent,
  MAX_ZOOM_PERCENT,
  MIN_ZOOM_PERCENT,
} from "@/lib/editor/toolbar";
import type { ResumeTemplate } from "@/lib/resume/template-types";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
  templates: ResumeTemplate[];
  templateId: string;
  zoomPercent: number;
  canExport: boolean;
  isExporting?: boolean;
  onTemplateChange: (templateId: string) => void;
  onZoomChange: (zoomPercent: number) => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
}

export function toolbarButtonClass(isActive = false): string {
  return cn(
    "h-8 w-8 border-border text-foreground hover:bg-muted",
    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
  );
}

export function EditorFormattingControls({
  editor,
}: {
  editor: Editor | null;
}) {
  const controlsDisabled = !editor;

  return (
    <>
      <div className="flex items-center rounded-md border bg-card p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass(editor?.isActive("bold"))}
          aria-label="Bold"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass(editor?.isActive("italic"))}
          aria-label="Italic"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass(editor?.isActive("underline"))}
          aria-label="Underline"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass(
            editor?.isActive("heading", { level: 2 }),
          )}
          aria-label="Heading"
          disabled={controlsDisabled}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass(editor?.isActive("bulletList"))}
          aria-label="Bullet list"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center rounded-md border bg-card p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass()}
          aria-label="Undo"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolbarButtonClass()}
          aria-label="Redo"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export function EditorToolbar({
  editor,
  templates,
  templateId,
  zoomPercent,
  canExport,
  isExporting = false,
  onTemplateChange,
  onZoomChange,
  onDownloadPdf,
  onPrint,
}: EditorToolbarProps) {
  const exportDisabled = !canExport || isExporting;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <EditorFormattingControls editor={editor} />

        <label className="flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm">
          <span className="font-medium">Zoom</span>
          <input
            type="range"
            min={MIN_ZOOM_PERCENT}
            max={MAX_ZOOM_PERCENT}
            step={5}
            value={zoomPercent}
            onChange={(event) =>
              onZoomChange(clampZoomPercent(event.currentTarget.valueAsNumber))
            }
            className="w-28 accent-primary"
            aria-label="Preview zoom"
          />
          <span className="w-10 text-right tabular-nums text-muted-foreground">
            {zoomPercent}%
          </span>
        </label>

        <label className="flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm">
          <span className="font-medium">Template</span>
          <select
            value={templateId}
            onChange={(event) => onTemplateChange(event.currentTarget.value)}
            className="max-w-40 bg-transparent text-sm outline-none"
            aria-label="Resume template"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrint}
          disabled={!canExport}
        >
          <Printer className="h-4 w-4 md:mr-1.5" />
          <span className="hidden md:inline">Print</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onDownloadPdf}
          disabled={exportDisabled}
          className="min-w-[132px]"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" />
          ) : (
            <Download className="h-4 w-4 md:mr-1.5" />
          )}
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
}
