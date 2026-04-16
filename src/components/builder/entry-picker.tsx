"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BANK_CATEGORIES, type BankEntry, type BankCategory } from "@/types";
import { getEntryTitle } from "@/components/bank/chunk-card";
import {
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Shield,
  Check,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_META: Record<BankCategory, { label: string; icon: LucideIcon }> = {
  experience: { label: "Experience", icon: Briefcase },
  education: { label: "Education", icon: GraduationCap },
  skill: { label: "Skills", icon: Wrench },
  project: { label: "Projects", icon: FolderOpen },
  achievement: { label: "Achievements", icon: Award },
  certification: { label: "Certifications", icon: Shield },
};

interface EntryPickerProps {
  entries: BankEntry[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function EntryPicker({
  entries,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: EntryPickerProps) {
  const grouped = useMemo(() => {
    const groups: Partial<Record<BankCategory, BankEntry[]>> = {};
    for (const entry of entries) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category]!.push(entry);
    }
    return groups;
  }, [entries]);

  const allSelected = entries.length > 0 && selectedIds.size === entries.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Select Entries</h3>
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-primary hover:underline"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bank entries found. Upload a resume in Documents first.
          </p>
        )}

        {BANK_CATEGORIES.map((category) => {
          const items = grouped[category];
          if (!items || items.length === 0) return null;
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({items.filter((e) => selectedIds.has(e.id)).length}/{items.length})
                </span>
              </div>
              <div className="space-y-0.5">
                {items.map((entry) => {
                  const selected = selectedIds.has(entry.id);
                  return (
                    <button
                      key={entry.id}
                      onClick={() => onToggle(entry.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{getEntryTitle(entry)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {selectedIds.size} of {entries.length} selected
        </p>
      </div>
    </div>
  );
}
