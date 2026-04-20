"use client";

import { Button } from "@/components/ui/button";
import { Trash2, FileText, CheckSquare, XSquare, Download } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onAddToResume: () => void;
  onExport: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onAddToResume,
  onExport,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border bg-card p-3 shadow-md">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={allSelected ? onDeselectAll : onSelectAll}
      >
        {allSelected ? (
          <>
            <XSquare className="h-4 w-4 mr-1" />
            Deselect All
          </>
        ) : (
          <>
            <CheckSquare className="h-4 w-4 mr-1" />
            Select All
          </>
        )}
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>
      <Button variant="ghost" size="sm" onClick={onAddToResume}>
        <FileText className="h-4 w-4 mr-1" />
        Add to Resume
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
