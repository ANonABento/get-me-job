"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { SearchBar, CATEGORY_LABELS, type SortOption } from "@/components/bank/search-bar";
import { ChunkCard } from "@/components/bank/chunk-card";
import { UploadOverlay } from "@/components/bank/upload-overlay";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";
import { Database, Loader2, Upload, HardDrive } from "lucide-react";
import { SourceDocuments } from "@/components/bank/source-documents";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard, SkeletonButton } from "@/components/ui/skeleton";
import { AddEntryDialog } from "@/components/bank/add-entry-dialog";
import { useToast } from "@/components/ui/toast";
import { uploadSuccessMessage } from "./utils";

const DriveFilePicker = dynamic(
  () => import("@/components/google").then((m) => m.DriveFilePicker),
  { loading: () => <SkeletonButton className="w-40" />, ssr: false }
);

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
  const entriesListRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [driveImporting, setDriveImporting] = useState(false);
  const { addToast } = useToast();

  // Register page-specific keyboard shortcuts
  useRegisterShortcuts("bank", useMemo(() => [
    {
      key: "/",
      description: "Focus search",
      category: "actions" as const,
      action: () => searchInputRef.current?.focus(),
    },
    {
      key: "Escape",
      description: "Clear search",
      category: "actions" as const,
      action: () => {
        setQuery("");
        searchInputRef.current?.blur();
      },
    },
    {
      key: "u",
      ctrl: true,
      description: "Upload file",
      category: "actions" as const,
      action: () => fileInputRef.current?.click(),
    },
  ], []));

  const fetchEntries = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
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
      if (!options?.silent) setLoading(false);
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

      await handleDataRefresh({ silent: true });

      const count = uploadData.entriesCreated ?? 0;
      addToast({
        type: "success",
        title: uploadSuccessMessage(count, file.name),
      });

      requestAnimationFrame(() => {
        entriesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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

  async function handleDataRefresh(options?: { silent?: boolean }) {
    await fetchEntries(options);
    refreshAllEntries();
    setSourceRefreshKey((k) => k + 1);
  }

  return (
    <ErrorBoundary>
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Upload overlay for drag-and-drop */}
      <UploadOverlay onComplete={() => handleDataRefresh()} />

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

      {/* Search & Filters - sticky below header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border/50">
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
      </div>

      {/* Source Files */}
      <SourceDocuments
        refreshKey={sourceRefreshKey}
        onFilterByDocument={setActiveDocumentId}
        activeDocumentId={activeDocumentId}
        onDelete={handleDataRefresh}
      />

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
        <div ref={entriesListRef} className="space-y-8 animate-in fade-in duration-200">
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
