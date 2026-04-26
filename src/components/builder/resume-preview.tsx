"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { GripVertical, Plus, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  EditableDocumentEntry,
  EditableEntryField,
  EditableResumeDocument,
} from "@/lib/builder/editor-document";
import type { BankCategory } from "@/types";

interface ResumePreviewProps {
  document: EditableResumeDocument;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddSection: () => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  onSectionTitleChange: (sectionId: BankCategory, value: string) => void;
  onEntryFieldChange: (
    sectionId: BankCategory,
    entryId: string,
    field: EditableEntryField,
    value: string
  ) => void;
  onEntryBulletChange: (
    sectionId: BankCategory,
    entryId: string,
    bulletIndex: number,
    value: string
  ) => void;
}

interface EditableTextProps {
  value: string;
  placeholder: string;
  className?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}

function EditableText({
  value,
  placeholder,
  className,
  multiline = false,
  onChange,
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.activeElement !== ref.current && ref.current) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      role="textbox"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      aria-label={placeholder}
      className={cn(
        "min-h-[1.25rem] rounded-sm outline-none transition-colors focus:bg-primary/5 focus:ring-1 focus:ring-primary/30",
        "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        multiline && "whitespace-pre-wrap",
        className
      )}
      onInput={(event) => onChange(event.currentTarget.textContent ?? "")}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </div>
  );
}

export function ResumePreview({
  document,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddSection,
  onSectionReorder,
  onSectionTitleChange,
  onEntryFieldChange,
  onEntryBulletChange,
}: ResumePreviewProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDragStart(event: DragEvent, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDrop(event: DragEvent, toIndex: number) {
    event.preventDefault();
    const fromIndex = Number.parseInt(
      event.dataTransfer.getData("text/plain"),
      10
    );
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      onSectionReorder(fromIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div
      className="h-full overflow-auto bg-muted/30 p-4"
      onKeyDown={(event) => {
        if (!(event.metaKey || event.ctrlKey)) return;
        if (event.key.toLowerCase() === "z" && event.shiftKey) {
          event.preventDefault();
          onRedo();
        } else if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          onUndo();
        } else if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          onRedo();
        }
      }}
    >
      <div className="mx-auto mb-3 flex max-w-[8.5in] items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <article
        className="mx-auto min-h-[11in] bg-white px-14 py-12 text-slate-950 shadow-lg"
        style={{ maxWidth: "8.5in" }}
      >
        <div className="space-y-5">
          {document.sections.map((section, sectionIndex) => {
            const isDragging = dragIndex === sectionIndex;
            const isDragOver =
              dragOverIndex === sectionIndex && dragIndex !== sectionIndex;

            return (
              <section
                key={section.id}
                onDragOver={(event) => handleDragOver(event, sectionIndex)}
                onDrop={(event) => handleDrop(event, sectionIndex)}
                className={cn(
                  "group rounded-sm border border-transparent p-2 transition-colors",
                  isDragging && "opacity-50",
                  isDragOver && "border-primary bg-primary/5"
                )}
              >
                <div className="mb-2 flex items-center gap-2 border-b border-slate-300 pb-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, sectionIndex)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 active:cursor-grabbing"
                    title="Drag section"
                    aria-label={`Drag ${section.title || "section"}`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <EditableText
                    value={section.title}
                    placeholder="Section header"
                    className="flex-1 text-sm font-bold uppercase tracking-wide text-slate-900"
                    onChange={(value) =>
                      onSectionTitleChange(section.id, value)
                    }
                  />
                </div>

                {section.entries.length > 0 ? (
                  <div className="space-y-3">
                    {section.entries.map((entry) => (
                      <EditableEntry
                        key={entry.id}
                        sectionId={section.id}
                        entry={entry}
                        onEntryFieldChange={onEntryFieldChange}
                        onEntryBulletChange={onEntryBulletChange}
                      />
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onAddSection}
                    className="block w-full rounded border border-dashed border-slate-300 px-3 py-4 text-left text-sm text-slate-400 transition-colors hover:border-primary hover:text-primary"
                  >
                    Click to add content
                  </button>
                )}
              </section>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onAddSection}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </button>
      </article>
    </div>
  );
}

interface EditableEntryProps {
  sectionId: BankCategory;
  entry: EditableDocumentEntry;
  onEntryFieldChange: ResumePreviewProps["onEntryFieldChange"];
  onEntryBulletChange: ResumePreviewProps["onEntryBulletChange"];
}

function EditableEntry({
  sectionId,
  entry,
  onEntryFieldChange,
  onEntryBulletChange,
}: EditableEntryProps) {
  return (
    <div className="space-y-1 text-sm leading-snug">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <EditableText
          value={entry.heading}
          placeholder="Click to add content"
          className="min-w-[10rem] flex-1 font-semibold text-slate-950"
          onChange={(value) =>
            onEntryFieldChange(sectionId, entry.id, "heading", value)
          }
        />
        <EditableText
          value={entry.meta}
          placeholder="Dates"
          className="min-w-[6rem] text-right text-xs text-slate-600"
          onChange={(value) =>
            onEntryFieldChange(sectionId, entry.id, "meta", value)
          }
        />
      </div>

      <EditableText
        value={entry.subtitle}
        placeholder="Click to add content"
        className="text-sm text-slate-700"
        onChange={(value) =>
          onEntryFieldChange(sectionId, entry.id, "subtitle", value)
        }
      />

      {(entry.body || entry.bullets.length === 0) && (
        <EditableText
          value={entry.body}
          placeholder="Click to add content"
          className="text-sm text-slate-700"
          multiline
          onChange={(value) =>
            onEntryFieldChange(sectionId, entry.id, "body", value)
          }
        />
      )}

      {entry.bullets.length > 0 && (
        <ul className="ml-5 list-disc space-y-0.5">
          {entry.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex} className="pl-1">
              <EditableText
                value={bullet}
                placeholder="Click to add content"
                className="text-sm text-slate-700"
                multiline
                onChange={(value) =>
                  onEntryBulletChange(
                    sectionId,
                    entry.id,
                    bulletIndex,
                    value
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
