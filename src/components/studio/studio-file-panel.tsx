"use client";

import { useCallback, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StudioDocument } from "./studio-documents";

interface StudioFilePanelProps {
  documents: StudioDocument[];
  activeDocumentId: string;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function StudioFilePanel({
  documents,
  activeDocumentId,
  onCreate,
  onSelect,
  onRename,
  onDelete,
}: StudioFilePanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startRename = useCallback((document: StudioDocument) => {
    setRenamingId(document.id);
    setDraftName(document.name);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId) {
      onRename(renamingId, draftName);
    }
    setRenamingId(null);
    setDraftName("");
  }, [draftName, onRename, renamingId]);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">Files</h2>
        <Button size="sm" variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4 md:mr-1.5" />
          <span className="hidden md:inline">New</span>
        </Button>
      </div>

      <div className="space-y-1 px-2 pb-3">
        {documents.map((document) => {
          const isActive = document.id === activeDocumentId;
          const isRenaming = document.id === renamingId;

          return (
            <div
              key={document.id}
              className={cn(
                "group flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              {isRenaming ? (
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") finishRename();
                    if (event.key === "Escape") {
                      setRenamingId(null);
                      setDraftName("");
                    }
                  }}
                  className="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-sm text-foreground"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(document.id)}
                  onDoubleClick={() => startRename(document)}
                  className="min-w-0 flex-1 truncate text-left"
                  title={document.name}
                >
                  {document.name}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(document.id)}
                className="rounded p-1 text-muted-foreground opacity-70 transition hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                aria-label={`Delete ${document.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
