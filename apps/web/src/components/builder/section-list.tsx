"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
import type { BankEntry, BankCategory } from "@/types";
import {
  SECTION_LABELS,
  type SectionState,
} from "@/lib/builder/section-manager";
import { getEntryTitle } from "@/components/bank/chunk-card";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Shield,
  Sparkles,
  Check,
  Trophy,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SECTION_ICONS: Record<BankCategory, LucideIcon> = {
  experience: Briefcase,
  education: GraduationCap,
  skill: Wrench,
  project: FolderOpen,
  hackathon: Trophy,
  bullet: ListChecks,
  achievement: Award,
  certification: Shield,
};

interface SectionListProps {
  sections: SectionState[];
  entries: BankEntry[];
  selectedIds: Set<string>;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (categoryId: BankCategory) => void;
  onToggleEntry: (entryId: string) => void;
  onAiRewrite?: (categoryId: BankCategory) => void;
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  showSections?: boolean;
  emptySelectionHint?: string;
}

export function SectionList({
  sections,
  entries,
  selectedIds,
  onReorder,
  onToggleVisibility,
  onToggleEntry,
  onAiRewrite,
  pickerOpen = false,
  onPickerOpenChange,
  showSections = true,
  emptySelectionHint,
}: SectionListProps) {
  const t = useTranslations("dialogs.builder.sectionList");
  const [expandedSections, setExpandedSections] = useState<Set<BankCategory>>(
    new Set(),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounterRef = useRef(0);

  const toggleExpanded = useCallback((categoryId: BankCategory) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const entriesByCategory = useMemo(() => {
    const map = new Map<BankCategory, BankEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.category) || [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [entries]);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current++;
  }

  function handleDragLeave() {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragOverIndex(null);
    }
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    dragCounterRef.current = 0;
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounterRef.current = 0;
  }

  function renderEntryToggle(entry: BankEntry, compact = false) {
    const selected = selectedIds.has(entry.id);
    const sizeClasses = compact
      ? "flex items-center gap-2 rounded px-3 py-1.5 text-xs"
      : "flex items-center gap-2 rounded-md border px-3 py-2 text-sm";
    const selectedClasses = compact
      ? "bg-primary/10 text-foreground"
      : "border-primary bg-primary/10 text-foreground";
    const unselectedClasses = compact
      ? "text-muted-foreground hover:bg-muted"
      : "border-border text-muted-foreground hover:bg-muted";

    return (
      <button
        key={entry.id}
        type="button"
        onClick={() => onToggleEntry(entry.id)}
        className={cn(
          "w-full text-left transition-colors",
          sizeClasses,
          selected ? selectedClasses : unselectedClasses,
        )}
      >
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded border",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border",
          )}
        >
          {selected && (
            <Check className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate">{getEntryTitle(entry)}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Dialog open={pickerOpen} onOpenChange={onPickerOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("pickerTitle")}</DialogTitle>
            <DialogDescription>{t("pickerDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sections.every(
              (section) =>
                (entriesByCategory.get(section.id) || []).length === 0,
            ) ? (
              <div className="rounded-[var(--radius)] border-[length:var(--border-width)] bg-muted/40 p-6 text-center">
                <p className="font-medium text-foreground">
                  {t("pickerEmptyTitle")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("pickerEmptyDescription")}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <a href="/components">{t("pickerEmptyCta")}</a>
                </Button>
              </div>
            ) : (
              sections.map((section) => {
                const Icon = SECTION_ICONS[section.id];
                const sectionEntries = entriesByCategory.get(section.id) || [];
                if (sectionEntries.length === 0) return null;

                return (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {SECTION_LABELS[section.id]}
                    </div>
                    <div className="space-y-1">
                      {sectionEntries.map((entry) => renderEntryToggle(entry))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showSections && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Sections
            </h3>
            <span className="text-xs text-muted-foreground">
              Drag to reorder
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sections.map((section, index) => {
              const Icon = SECTION_ICONS[section.id];
              const sectionEntries = entriesByCategory.get(section.id) || [];
              const selectedCount = sectionEntries.filter((e) =>
                selectedIds.has(e.id),
              ).length;
              const isExpanded = expandedSections.has(section.id);
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index && dragIndex !== index;

              if (sectionEntries.length === 0) return null;

              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "rounded-lg border transition-all",
                    isDragging && "opacity-50",
                    isDragOver && "border-primary ring-1 ring-primary",
                    !section.visible && "opacity-60",
                  )}
                >
                  <div className="flex items-center gap-1 px-2 py-2">
                    <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <button
                      onClick={() => toggleExpanded(section.id)}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />

                    <button
                      onClick={() => toggleExpanded(section.id)}
                      className="flex-1 text-left text-sm font-medium truncate"
                    >
                      {SECTION_LABELS[section.id]}
                    </button>

                    <span className="text-xs text-muted-foreground mr-1">
                      {selectedCount}/{sectionEntries.length}
                    </span>

                    {onAiRewrite && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onAiRewrite(section.id)}
                        title="AI Rewrite"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <button
                      onClick={() => onToggleVisibility(section.id)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title={section.visible ? "Hide section" : "Show section"}
                    >
                      {section.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-0.5">
                      {sectionEntries.map((entry) =>
                        renderEntryToggle(entry, true),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t px-4 py-2">
            <p className="text-xs text-muted-foreground">
              {selectedIds.size === 0 && emptySelectionHint
                ? emptySelectionHint
                : `${selectedIds.size} of ${pluralize(
                    entries.length,
                    "entry",
                    "entries",
                  )} selected`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
