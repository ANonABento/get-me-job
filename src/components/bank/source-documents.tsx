"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2, Trash2 } from "lucide-react";
import type { SourceDocument } from "@/lib/db/profile-bank";
import { useErrorToast } from "@/hooks/use-error-toast";

interface SourceDocumentsProps {
  refreshKey: number;
  onFilterByDocument: (documentId: string | null) => void;
  activeDocumentId: string | null;
  onDelete?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SourceDocuments({
  refreshKey,
  onFilterByDocument,
  activeDocumentId,
  onDelete,
}: SourceDocumentsProps) {
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SourceDocument | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const showErrorToast = useErrorToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/bank/documents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load source files",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  useEffect(() => {
    const documentIds = new Set(documents.map((doc) => doc.id));
    setSelectedDocumentIds((prev) => {
      const next = new Set([...prev].filter((id) => documentIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [documents]);

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedDocumentIds.has(doc.id)),
    [documents, selectedDocumentIds]
  );
  const selectedCount = selectedDocumentIds.size;
  const allSelected = documents.length > 0 && selectedCount === documents.length;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  }

  function toggleAllDocuments() {
    setSelectedDocumentIds(
      allSelected ? new Set() : new Set(documents.map((doc) => doc.id))
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bank/documents/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      if (activeDocumentId === deleteTarget.id) {
        onFilterByDocument(null);
      }
      onDelete?.();
    } catch (err) {
      showErrorToast(err, {
        title: "Could not delete source file",
        fallbackDescription: "Please try deleting the file again.",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedDocumentIds.size === 0) return;
    setDeleting(true);
    const ids = [...selectedDocumentIds];
    const idsToDelete = new Set(ids);
    try {
      const res = await fetch("/api/bank/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: ids }),
      });
      if (!res.ok) throw new Error("Bulk delete failed");
      setDocuments((prev) => prev.filter((doc) => !idsToDelete.has(doc.id)));
      if (activeDocumentId && idsToDelete.has(activeDocumentId)) {
        onFilterByDocument(null);
      }
      setSelectedDocumentIds(new Set());
      onDelete?.();
    } catch (err) {
      showErrorToast(err, {
        title: "Could not delete source files",
        fallbackDescription: "Please try deleting the selected files again.",
      });
    } finally {
      setDeleting(false);
      setBulkDeleteOpen(false);
    }
  }

  if (loading) return null;
  if (documents.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-lg font-semibold">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allSelected}
            onChange={toggleAllDocuments}
            className="h-4 w-4 rounded border-input accent-primary"
            aria-label="Select all source files"
          />
          Source Files
        </label>
        {selectedCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
              activeDocumentId === doc.id
                ? "border-primary bg-accent/30"
                : ""
            }`}
            onClick={() =>
              onFilterByDocument(activeDocumentId === doc.id ? null : doc.id)
            }
          >
            <input
              type="checkbox"
              checked={selectedDocumentIds.has(doc.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleDocument(doc.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 shrink-0 rounded border-input accent-primary"
              aria-label={`Select ${doc.filename}`}
            />
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(doc.size)} &middot; {doc.chunkCount} chunk
                {doc.chunkCount !== 1 ? "s" : ""} &middot;{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(doc);
              }}
              aria-label={`Delete ${doc.filename}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete source document?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.filename}</strong> and all{" "}
              {deleteTarget?.chunkCount} associated chunk
              {deleteTarget?.chunkCount !== 1 ? "s" : ""}. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected source files?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedCount} source file
              {selectedCount !== 1 ? "s" : ""} and all associated chunks. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleting || selectedDocuments.length === 0}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
