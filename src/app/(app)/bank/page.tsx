"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar, CATEGORY_LABELS, type SortOption } from "@/components/bank/search-bar";
import { ChunkCard } from "@/components/bank/chunk-card";
import { UploadOverlay } from "@/components/bank/upload-overlay";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";
import { Database, Loader2, Upload, HardDrive } from "lucide-react";
import { DriveFilePicker } from "@/components/google";

export default function BankPage() {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BankCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Upload via button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [driveImporting, setDriveImporting] = useState(false);

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

  // Sort entries
  const sortedEntries = useMemo(() => {
    const sorted = [...entries];
    if (sortBy === "confidence") {
      sorted.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [entries, sortBy]);

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
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const documentId = uploadData.document?.id;
      if (!documentId) throw new Error("No document ID");

      await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      await fetchEntries();
      refreshAllEntries();
    } catch (err) {
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

  function handleOverlayComplete() {
    fetchEntries();
    refreshAllEntries();
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Upload overlay for drag-and-drop */}
      <UploadOverlay onComplete={handleOverlayComplete} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Bank</h1>
          <p className="text-muted-foreground">
            All your career information in one place. Drag files anywhere to upload.
          </p>
        </div>
        <div className="flex gap-2">
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
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={categoryCounts}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load knowledge bank"
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
              : "Your knowledge bank is empty"}
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
