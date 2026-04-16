"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/bank/documents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      console.error("Failed to fetch source documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

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
      console.error("Delete source document error:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return null;
  if (documents.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Source Files</h2>
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
    </div>
  );
}
