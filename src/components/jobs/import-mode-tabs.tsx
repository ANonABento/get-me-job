"use client";

import { FileSpreadsheet, FileText, Link, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportMode } from "./import-job-dialog.types";

interface ImportModeTabsProps {
  value: ImportMode;
  onChange: (mode: ImportMode) => void;
}

export function ImportModeTabs({ value, onChange }: ImportModeTabsProps) {
  const modes: Array<{ value: ImportMode; label: string; icon: LucideIcon }> = [
    { value: "text", label: "Paste", icon: FileText },
    { value: "url", label: "URL", icon: Link },
    { value: "csv", label: "CSV", icon: FileSpreadsheet },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-[var(--radius)]">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors",
              value === mode.value
                ? "bg-background shadow-[var(--shadow-button)] text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
