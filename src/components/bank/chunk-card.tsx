"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ChunkCardProps } from "./chunk-card.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CATEGORY_CONFIG, CATEGORY_FIELDS } from "./chunk-card-config";
import { cleanContent, getEntryTitle } from "./chunk-card-utils";
import { ChunkContentPreview } from "./chunk-content-preview";
import { ChunkEditForm } from "./chunk-edit-form";
import { ChunkExpandedContent } from "./chunk-expanded-content";

export type { ChunkCardProps, FieldDef, FieldEditorProps } from "./chunk-card.types";
export { CATEGORY_CONFIG, CATEGORY_FIELDS, SKILL_CATEGORY_COLORS } from "./chunk-card-config";
export {
  cleanContent,
  getDateRange,
  getEntryTitle,
  getHackathonTeamSize,
  getHighlights,
  getStringList,
  getTechnologies,
  listToText,
  textToList,
} from "./chunk-card-utils";
export { FieldEditor } from "./field-editor";

export function ChunkCard({
  entry,
  onUpdate,
  onDelete,
  selected,
  onToggleSelect,
  highlighted,
  anySelected,
}: ChunkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, unknown>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const config = CATEGORY_CONFIG[entry.category];
  const Icon = config.icon;
  const title = getEntryTitle(entry);
  const fields = CATEGORY_FIELDS[entry.category];

  function handleEdit() {
    setEditContent({ ...entry.content });
    setEditing(true);
    setExpanded(true);
  }

  function handleFieldChange(key: string, value: unknown) {
    setEditContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const cleaned = cleanContent(editContent, fields);
    onUpdate(entry.id, cleaned);
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditContent({});
  }

  function handleConfirmDelete() {
    onDelete(entry.id);
    setConfirmDelete(false);
  }

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card transition-all hover:border-primary/30 hover:shadow-md",
        entry.category === "hackathon" &&
          "border-warning/40 bg-warning/5 hover:border-warning/60",
        highlighted && "ring-2 ring-primary",
        selected && "border-primary bg-primary/5"
      )}
      data-entry-id={entry.id}
    >
      <div className="flex w-full items-start gap-3 p-4 text-left">
        {onToggleSelect && (
          <div
            className={cn(
              "shrink-0 pt-1 transition-opacity",
              anySelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 [div:hover>&]:opacity-100"
            )}
          >
            <input
              type="checkbox"
              checked={!!selected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(entry.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
              aria-label={`Select ${getEntryTitle(entry)}`}
            />
          </div>
        )}
        <button
          onClick={() => !editing && setExpanded(!expanded)}
          className="flex flex-1 items-start gap-3 text-left min-w-0"
        >
          <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{title}</span>
              <Badge variant="secondary" className="text-2xs">
                {config.label}
              </Badge>
              {entry.confidenceScore >= 0.9 && (
                <Badge variant="success" className="text-2xs">
                  High confidence
                </Badge>
              )}
            </div>
            {!expanded && <ChunkContentPreview entry={entry} />}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(entry.createdAt)}
              </span>
              {entry.sourceDocumentId && (
                <span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">
                  from {entry.sourceDocumentId}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3">
          {editing ? (
            <ChunkEditForm
              fields={fields}
              editContent={editContent}
              onFieldChange={handleFieldChange}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
          ) : (
            <ChunkExpandedContent
              fields={fields}
              content={entry.content}
              confirmDelete={confirmDelete}
              onEdit={handleEdit}
              onDeleteClick={() => setConfirmDelete(true)}
              onCancelDelete={() => setConfirmDelete(false)}
              onConfirmDelete={handleConfirmDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
