"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { BankEntry, BankCategory } from "@/types";
import type { SectionState } from "@/lib/builder/section-manager";
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

const SECTION_META: Record<BankCategory, { label: string; icon: LucideIcon }> = {
  experience: { label: "Experience", icon: Briefcase },
  education: { label: "Education", icon: GraduationCap },
  skill: { label: "Skills", icon: Wrench },
  project: { label: "Projects", icon: FolderOpen },
  achievement: { label: "Achievements", icon: Award },
  certification: { label: "Certifications", icon: Shield },
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
}: SectionListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<BankCategory>>(
    new Set()
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

  return (
    <div className="flex flex-col h-full">
      <Dialog open={pickerOpen} onOpenChange={onPickerOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bank Entry Picker</DialogTitle>
            <DialogDescription>
              Select entries to add them to the document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sections.map((section) => {
              const meta = SECTION_META[section.id];
              const Icon = meta.icon;
              const sectionEntries = entriesByCategory.get(section.id) || [];
              if (sectionEntries.length === 0) return null;

              return (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {meta.label}
                  </div>
                  <div className="space-y-1">
                    {sectionEntries.map((entry) => {
                      const selected = selectedIds.has(entry.id);
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onToggleEntry(entry.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            )}
                          >
                            {selected && (
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="min-w-0 flex-1 truncate">
                            {getEntryTitle(entry)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Sections</h3>
        <span className="text-xs text-muted-foreground">Drag to reorder</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.map((section, index) => {
          const meta = SECTION_META[section.id];
          const Icon = meta.icon;
          const sectionEntries = entriesByCategory.get(section.id) || [];
          const selectedCount = sectionEntries.filter((e) =>
            selectedIds.has(e.id)
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
                !section.visible && "opacity-60"
              )}
            >
              {/* Section header */}
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
                  {meta.label}
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

              {/* Expanded entries */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-0.5">
                  {sectionEntries.map((entry) => {
                    const selected = selectedIds.has(entry.id);
                    return (
                      <button
                        key={entry.id}
                        onClick={() => onToggleEntry(entry.id)}
                        className={cn(
                          "w-full flex items-center gap-2 rounded px-3 py-1.5 text-left text-xs transition-colors",
                          selected
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors",
                            selected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border"
                          )}
                        >
                          {selected && (
                            <svg
                              className="h-2.5 w-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{getEntryTitle(entry)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {selectedIds.size} of {entries.length} entries selected
        </p>
      </div>
    </div>
  );
}
