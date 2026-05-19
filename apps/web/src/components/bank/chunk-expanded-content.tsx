"use client";

import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BankEntry } from "@/types";
import type { FieldDef } from "./chunk-card.types";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface ChunkExpandedContentProps {
  fields: FieldDef[];
  content: Record<string, unknown>;
  childEntries?: BankEntry[];
  onChildEdit?: (entry: BankEntry) => void;
  onChildDelete?: (id: string) => void;
  onChildCreate?: () => void;
  onChildReorder?: (childId: string, direction: "up" | "down") => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}

export function ChunkExpandedContent({
  fields,
  content,
  childEntries = [],
  onChildEdit,
  onChildDelete,
  onChildCreate,
  onChildReorder,
  onEdit,
  onDeleteClick,
}: ChunkExpandedContentProps) {
  const a11yT = useA11yTranslations();

  const visibleFields = fields.filter((field) => {
    if (childEntries.length === 0) return true;
    return field.key !== "highlights";
  });

  return (
    <>
      <div className="space-y-2 text-sm">
        {visibleFields.map((field) => {
          const val = content[field.key];
          if (val === undefined || val === null || val === "") return null;
          if (field.type === "list" && Array.isArray(val) && val.length === 0) {
            return null;
          }
          if (field.type === "checkbox") {
            if (!val) return null;
            return (
              <div key={field.key} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-success" />
                <span className="text-muted-foreground">{field.label}</span>
              </div>
            );
          }
          if (field.type === "list" && Array.isArray(val)) {
            if (val.length === 0) return null;
            return (
              <div key={field.key}>
                <span className="text-xs text-muted-foreground font-medium">
                  {field.label}
                </span>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {val.map((item, i) => (
                    <li key={i}>{String(item)}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <div key={field.key}>
              <span className="text-xs text-muted-foreground font-medium">
                {field.label}:{" "}
              </span>
              <span>{String(val)}</span>
            </div>
          );
        })}
      </div>
      {childEntries.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Bullet components
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {childEntries.length}
              </span>
              {onChildCreate ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onChildCreate}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            {childEntries.map((child, index) => (
              <div
                key={child.id}
                className="flex items-start gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2 text-sm"
              >
                <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 leading-relaxed">
                  {String(child.content.description ?? "")}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  {onChildReorder ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={a11yT("moveBulletUp")}
                        disabled={index === 0}
                        onClick={() => onChildReorder(child.id, "up")}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={a11yT("moveBulletDown")}
                        disabled={index === childEntries.length - 1}
                        onClick={() => onChildReorder(child.id, "down")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={a11yT("editBullet")}
                    onClick={() => onChildEdit?.(child)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title={a11yT("deleteBullet")}
                    onClick={() => onChildDelete?.(child.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : onChildCreate ? (
        <div className="rounded-md border border-dashed border-border/70 bg-background/30 p-3">
          <Button variant="ghost" size="sm" onClick={onChildCreate}>
            <Plus className="h-3 w-3 mr-1" />
            Add bullet component
          </Button>
        </div>
      ) : null}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onDeleteClick}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </>
  );
}
