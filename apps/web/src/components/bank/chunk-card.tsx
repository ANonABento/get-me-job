"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ChunkCardProps } from "./chunk-card.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TimeAgo } from "@/components/format/time-ago";
import { useDevMode } from "@/hooks/use-dev-mode";
import { cn } from "@/lib/utils";
import { THEME_INTERACTIVE_SURFACE_CLASSES } from "@/lib/theme/component-classes";
import { CATEGORY_CONFIG, CATEGORY_FIELDS } from "./chunk-card-config";
import { cleanContent, getEntryTitle } from "./chunk-card-utils";
import { ChunkContentPreview } from "./chunk-content-preview";
import { ChunkEditForm } from "./chunk-edit-form";
import { ChunkExpandedContent } from "./chunk-expanded-content";

export type {
  ChunkCardProps,
  FieldDef,
  FieldEditorProps,
} from "./chunk-card.types";
export {
  CATEGORY_CONFIG,
  CATEGORY_FIELDS,
  SKILL_CATEGORY_COLORS,
} from "./chunk-card-config";
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
  onCreateChild,
  onReorderChild,
  selected,
  onToggleSelect,
  highlighted,
  anySelected,
  childEntries = [],
  forceExpanded = false,
  onSelect,
  sourceFilenames,
}: ChunkCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [creatingChild, setCreatingChild] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, unknown>>({});
  const [childEditContent, setChildEditContent] = useState<
    Record<string, unknown>
  >({});
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const config = CATEGORY_CONFIG[entry.category];
  const Icon = config.icon;
  const title = getEntryTitle(entry);
  const fields = CATEGORY_FIELDS[entry.category];
  const showDebugIds = useDevMode();
  // When `onSelect` is provided, the card never expands inline — clicks route
  // to the side drawer instead. This is the grid-view behavior.
  const drawerMode = Boolean(onSelect) && !forceExpanded;
  const expanded = forceExpanded || (!drawerMode && localExpanded);

  function handleEdit() {
    setEditContent({ ...entry.content });
    setEditing(true);
    setLocalExpanded(true);
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

  function handleChildEdit(child: typeof entry) {
    setEditingChildId(child.id);
    setChildEditContent({ ...child.content });
  }

  function handleChildFieldChange(key: string, value: unknown) {
    setChildEditContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleChildSave() {
    if (creatingChild) {
      const description =
        typeof childEditContent.description === "string"
          ? childEditContent.description.trim()
          : "";
      if (description) onCreateChild?.(entry, description);
      setCreatingChild(false);
      setChildEditContent({});
      return;
    }

    if (!editingChildId) return;
    const cleaned = cleanContent(childEditContent, CATEGORY_FIELDS.bullet);
    onUpdate(editingChildId, cleaned);
    setEditingChildId(null);
    setChildEditContent({});
  }

  function handleChildCancelEdit() {
    setEditingChildId(null);
    setCreatingChild(false);
    setChildEditContent({});
  }

  function handleChildCreate() {
    setCreatingChild(true);
    setEditingChildId(null);
    setChildEditContent({ description: "" });
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete this profile bank entry?",
      description:
        "This permanently removes the saved profile bank entry. This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (confirmed) {
      onDelete(entry.id);
    }
  }

  return (
    <div
      className={cn(
        "group relative",
        THEME_INTERACTIVE_SURFACE_CLASSES,
        entry.category === "hackathon" &&
          "border-warning/40 bg-warning/5 hover:border-warning/60",
        highlighted && "ring-2 ring-primary",
        selected && "border-primary bg-primary/5",
      )}
      data-entry-id={entry.id}
    >
      {/* Hide the card's header when forceExpanded — the surrounding
          table row (in components-tab) already shows title + category
          + confidence + timestamp, so duplicating them here read as
          a layout bug. In standalone card mode (forceExpanded=false)
          the header stays as the row's only visible affordance. */}
      {!forceExpanded ? (
        <div className="flex w-full items-start gap-3 p-4 text-left">
          {onToggleSelect && (
            <label
              className={cn(
                "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border bg-background/95 shadow-[var(--shadow-button)] transition-opacity",
                anySelected
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 [div:hover>&]:opacity-100",
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
            </label>
          )}
          <button
            onClick={() => {
              if (editing) return;
              if (drawerMode && onSelect) {
                onSelect();
                return;
              }
              setLocalExpanded(!expanded);
            }}
            className="flex flex-1 items-start gap-3 text-left min-w-0"
          >
            <div className={cn("p-2 rounded-md shrink-0", config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-medium line-clamp-2 leading-snug"
                  title={title}
                >
                  {title}
                </span>
                <Badge variant="secondary" className="text-2xs">
                  {config.label}
                </Badge>
                {/*
                  Confidence chip is informational, not decorative — only
                  surface it when something is worth flagging. High-confidence
                  rows (>= 0.9) carry no chip; medium (0.7–0.9) and low (< 0.7)
                  show a warning- or destructive-tinted chip so the badge
                  actually means "review this." (P1.4)
                */}
                {entry.confidenceScore < 0.7 ? (
                  <Badge variant="destructive" className="text-2xs">
                    Low confidence
                  </Badge>
                ) : entry.confidenceScore < 0.9 ? (
                  <Badge variant="warning" className="text-2xs">
                    Medium confidence
                  </Badge>
                ) : null}
              </div>
              {!expanded && <ChunkContentPreview entry={entry} />}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  <TimeAgo date={entry.createdAt} />
                </span>
                {entry.sourceDocumentId ? (
                  <span
                    className="text-xs text-muted-foreground/80 truncate max-w-[260px]"
                    data-source-id={
                      showDebugIds ? entry.sourceDocumentId : undefined
                    }
                  >
                    from{" "}
                    {sourceFilenames?.get(entry.sourceDocumentId) ??
                      "imported file"}
                  </span>
                ) : null}
              </div>
            </div>
            {drawerMode ? null : (
              <div className="shrink-0 text-muted-foreground">
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            )}
          </button>
        </div>
      ) : null}

      {expanded && (
        // No border-top + no extra padding-y when forceExpanded — the
        // table-row container already provides the visual divider.
        <div
          className={cn(
            "space-y-3",
            forceExpanded ? "px-4 py-1" : "border-t px-4 py-3",
          )}
        >
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
              childEntries={childEntries}
              onChildEdit={handleChildEdit}
              onChildDelete={onDelete}
              onChildCreate={
                onCreateChild &&
                (entry.category === "experience" ||
                  entry.category === "project")
                  ? handleChildCreate
                  : undefined
              }
              onChildReorder={
                onReorderChild
                  ? (childId, direction) =>
                      onReorderChild(entry, childId, direction)
                  : undefined
              }
              onEdit={handleEdit}
              onDeleteClick={() => void handleDelete()}
            />
          )}
          {editingChildId || creatingChild ? (
            <div className="rounded-md border border-border/70 bg-background/60 p-3">
              <div className="mb-3 text-xs font-medium text-muted-foreground">
                {creatingChild
                  ? "Add bullet component"
                  : "Edit bullet component"}
              </div>
              <ChunkEditForm
                fields={CATEGORY_FIELDS.bullet}
                editContent={childEditContent}
                onFieldChange={handleChildFieldChange}
                onCancel={handleChildCancelEdit}
                onSave={handleChildSave}
              />
            </div>
          ) : null}
        </div>
      )}
      {confirmDialog}
    </div>
  );
}
