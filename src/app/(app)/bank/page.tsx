"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SearchBar, CATEGORY_LABELS, type SortOption } from "@/components/bank/search-bar";
import { ChunkCard } from "@/components/bank/chunk-card";
import { UploadOverlay } from "@/components/bank/upload-overlay";
import { BulkActionBar } from "@/components/bank/bulk-action-bar";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";
import { Database, Loader2, Upload, HardDrive } from "lucide-react";
import { DriveFilePicker } from "@/components/google";
import { SourceDocuments } from "@/components/bank/source-documents";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton";
import { AddEntryDialog } from "@/components/bank/add-entry-dialog";

export default function BankPage() {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BankCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Source document filtering
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [sourceRefreshKey, setSourceRefreshKey] = useState(0);

  // Upload via button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [driveImporting, setDriveImporting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(sortedEntriesRef.current.map((e) => e.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Register page-specific keyboard shortcuts
  // We use refs for sortedEntries/highlightedIndex to avoid re-creating shortcuts
  const sortedEntriesRef = useRef<BankEntry[]>([]);
  const highlightedIndexRef = useRef(-1);
  const selectedIdsRef = useRef<Set<string>>(new Set());

  useRegisterShortcuts("bank", useMemo(() => [
    {
      key: "/",
      description: "Focus search",
      category: "actions" as const,
      action: () => searchInputRef.current?.focus(),
    },
    {
      key: "Escape",
      description: "Clear search / deselect",
      category: "actions" as const,
      action: () => {
        if (selectedIdsRef.current.size > 0) {
          setSelectedIds(new Set());
          setHighlightedIndex(-1);
        } else {
          setQuery("");
          searchInputRef.current?.blur();
        }
      },
    },
    {
      key: "u",
      ctrl: true,
      description: "Upload file",
      category: "actions" as const,
      action: () => fileInputRef.current?.click(),
    },
    {
      key: "j",
      description: "Next card",
      category: "navigation" as const,
      action: () => {
        const entries = sortedEntriesRef.current;
        if (entries.length === 0) return;
        setHighlightedIndex((prev) => {
          const next = Math.min(prev + 1, entries.length - 1);
          highlightedIndexRef.current = next;
          // Scroll into view
          const el = document.querySelector(`[data-entry-id="${entries[next]?.id}"]`);
          el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          return next;
        });
      },
    },
    {
      key: "k",
      description: "Previous card",
      category: "navigation" as const,
      action: () => {
        const entries = sortedEntriesRef.current;
        if (entries.length === 0) return;
        setHighlightedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          highlightedIndexRef.current = next;
          const el = document.querySelector(`[data-entry-id="${entries[next]?.id}"]`);
          el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          return next;
        });
      },
    },
    {
      key: " ",
      description: "Toggle select",
      category: "actions" as const,
      action: () => {
        const idx = highlightedIndexRef.current;
        const entries = sortedEntriesRef.current;
        if (idx < 0 || idx >= entries.length) return;
        const id = entries[idx].id;
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          selectedIdsRef.current = next;
          return next;
        });
      },
    },
    {
      key: "Enter",
      description: "Expand/collapse card",
      category: "actions" as const,
      action: () => {
        const idx = highlightedIndexRef.current;
        const entries = sortedEntriesRef.current;
        if (idx < 0 || idx >= entries.length) return;
        const el = document.querySelector(`[data-entry-id="${entries[idx].id}"] button`);
        if (el instanceof HTMLElement) el.click();
      },
    },
    {
      key: "Delete",
      description: "Delete selected",
      category: "actions" as const,
      action: () => {
        if (selectedIdsRef.current.size > 0) {
          setConfirmBulkDelete(true);
        }
      },
    },
    {
      key: "Backspace",
      description: "Delete selected",
      category: "actions" as const,
      action: () => {
        if (selectedIdsRef.current.size > 0) {
          setConfirmBulkDelete(true);
        }
      },
    },
  ], []));

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (activeCategory !== "all") params.set("category", activeCategory);
      const res = await fetch(`/api/bank?${params}`);
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query, activeCategory]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Compute category counts from all entries (not filtered)
  const [allEntries, setAllEntries] = useState<BankEntry[]>([]);

  const refreshAllEntries = useCallback(() => {
    fetch("/api/bank")
      .then((r) => r.json())
      .then((data) => setAllEntries(data.entries || []))
      .catch(() => {});
  }, []);

  // Fetch all entries for counts on mount
  useEffect(() => {
    refreshAllEntries();
  }, [refreshAllEntries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of BANK_CATEGORIES) {
      counts[cat] = allEntries.filter((e) => e.category === cat).length;
    }
    return counts;
  }, [allEntries]);

  // Sort & filter entries
  const sortedEntries = useMemo(() => {
    let filtered = [...entries];
    if (activeDocumentId) {
      filtered = filtered.filter((e) => e.sourceDocumentId === activeDocumentId);
    }
    if (sortBy === "confidence") {
      filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return filtered;
  }, [entries, sortBy, activeDocumentId]);

  // Keep refs in sync for keyboard shortcuts
  sortedEntriesRef.current = sortedEntries;
  highlightedIndexRef.current = highlightedIndex;
  selectedIdsRef.current = selectedIds;

  // Reset highlight when entries change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [sortedEntries]);

  // Clear selection of deleted entries
  useEffect(() => {
    const entryIds = new Set(sortedEntries.map((e) => e.id));
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => entryIds.has(id)));
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [sortedEntries]);

  // Group by category for display
  const groupedEntries = useMemo(() => {
    if (activeCategory !== "all") {
      return [{ category: activeCategory, entries: sortedEntries }];
    }
    const groups: { category: BankCategory; entries: BankEntry[] }[] = [];
    for (const cat of BANK_CATEGORIES) {
      const catEntries = sortedEntries.filter((e) => e.category === cat);
      if (catEntries.length > 0) {
        groups.push({ category: cat, entries: catEntries });
      }
    }
    return groups;
  }, [sortedEntries, activeCategory]);

  async function handleUpdate(id: string, content: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/bank/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content } : e))
      );
      setAllEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content } : e))
      );
    } catch (err) {
      console.error("Update error:", err);
    }
  }

  async function handleCreate(category: BankCategory, content: Record<string, unknown>) {
    try {
      const res = await fetch("/api/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content }),
      });
      if (!res.ok) throw new Error("Create failed");
      handleDataRefresh();
    } catch (err) {
      console.error("Create error:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/bank/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setAllEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || `Upload failed (${uploadRes.status})`);
      }
      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload returned unsuccessful");
      }
      console.log("[bank] Upload complete:", uploadData.document?.id);

      // Upload route handles parse + ingest — just refresh the entries
      handleDataRefresh();
    } catch (err) {
      console.error("[bank] Upload error:", err);
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  async function handleDriveSelect(file: { id: string; name: string; mimeType: string }) {
    setDriveImporting(true);
    try {
      const downloadRes = await fetch(`/api/google/drive/files/${file.id}/download`);
      if (!downloadRes.ok) throw new Error("Failed to download from Drive");
      const blob = await downloadRes.blob();
      const localFile = new File([blob], file.name, { type: file.mimeType });
      await handleFileUpload(localFile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDriveImporting(false);
    }
  }

  function handleDataRefresh() {
    fetchEntries();
    refreshAllEntries();
    setSourceRefreshKey((k) => k + 1);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    setConfirmBulkDelete(false);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/bank/${id}`, { method: "DELETE" }))
      );
      setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
      setAllEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Bulk delete error:", err);
      setError(getErrorMessage(err));
    }
  }

  function handleAddToResume() {
    const ids = Array.from(selectedIds);
    // Store selected entry IDs and navigate to profile/resume builder
    sessionStorage.setItem("bank_selected_entries", JSON.stringify(ids));
    window.location.href = "/profile?from=bank";
  }

  return (
    <ErrorBoundary>
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Upload overlay for drag-and-drop */}
      <UploadOverlay onComplete={handleDataRefresh} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload resumes and career documents. Drag files anywhere or click upload.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
        <div className="flex gap-2">
          <AddEntryDialog onCreate={handleCreate} />
          <DriveFilePicker
            onSelect={handleDriveSelect}
            accept={["application/pdf", "text/plain"]}
            trigger={
              <Button variant="outline" disabled={driveImporting}>
                {driveImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4 mr-2" />
                )}
                {driveImporting ? "Importing..." : "From Drive"}
              </Button>
            }
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Upload file (Ctrl+U)"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <SearchBar
        ref={searchInputRef}
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={categoryCounts}
      />

      {/* Source Files */}
      <SourceDocuments
        refreshKey={sourceRefreshKey}
        onFilterByDocument={setActiveDocumentId}
        activeDocumentId={activeDocumentId}
        onDelete={handleDataRefresh}
      />

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={sortedEntries.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDelete={() => setConfirmBulkDelete(true)}
        onAddToResume={handleAddToResume}
      />

      {/* Bulk delete confirmation */}
      {confirmBulkDelete && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-center gap-3">
          <span className="text-sm">
            Delete {selectedIds.size} selected {selectedIds.size === 1 ? "entry" : "entries"}? This cannot be undone.
          </span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setConfirmBulkDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Delete
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load documents"
          message={error}
          onRetry={fetchEntries}
          variant="card"
        />
      ) : sortedEntries.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {query || activeCategory !== "all"
              ? "No matching entries"
              : "No documents yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {query || activeCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Upload a resume or career document to get started. Drag a file anywhere on this page, or click the Upload button."}
          </p>
          {!query && activeCategory === "all" && (
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEntries.map((group) => (
            <div key={group.category}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {CATEGORY_LABELS[group.category]}
                <span className="text-sm font-normal text-muted-foreground">
                  ({group.entries.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((entry) => (
                  <ChunkCard
                    key={entry.id}
                    entry={entry}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    selected={selectedIds.has(entry.id)}
                    onToggleSelect={toggleSelect}
                    highlighted={sortedEntries[highlightedIndex]?.id === entry.id}
                    anySelected={selectedIds.size > 0}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
    </ErrorBoundary>
  );
}
