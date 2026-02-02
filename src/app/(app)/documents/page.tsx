"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/utils";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import type { Document } from "@/types";
import {
  Loader2,
  FileText,
  Trash2,
  Upload,
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";

type DocumentType = "all" | "resume" | "cover_letter" | "portfolio" | "certificate" | "other";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "size-asc" | "size-desc";

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "resume", label: "Resume" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "size-asc", label: "Size (Small)" },
  { value: "size-desc", label: "Size (Large)" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete document");
      }
      setDocuments(documents.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doc) =>
        doc.filename.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((doc) => doc.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name-asc":
          return a.filename.localeCompare(b.filename);
        case "name-desc":
          return b.filename.localeCompare(a.filename);
        case "size-asc":
          return a.size - b.size;
        case "size-desc":
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [documents, searchQuery, typeFilter, sortOption]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "resume":
        return "bg-blue-500";
      case "cover_letter":
        return "bg-green-500";
      case "portfolio":
        return "bg-purple-500";
      case "certificate":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortOption("newest");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || sortOption !== "newest";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load documents"
          message={error}
          onRetry={fetchDocuments}
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            View and manage your uploaded documents
          </p>
        </div>
        <Button onClick={() => router.push("/upload")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div className="mb-4">
          <ErrorState
            title="Delete failed"
            message={deleteError}
            onDismiss={() => setDeleteError(null)}
            variant="inline"
          />
        </div>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your resume, cover letters, or other documents to get started
            </p>
            <Button onClick={() => router.push("/upload")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as DocumentType)}
                    className="block w-40 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sort by</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="block w-40 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Documents list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                  {filteredDocuments.length} of {documents.length} document(s)
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSortOption((prev) =>
                      prev === "newest" ? "oldest" : "newest"
                    )
                  }
                >
                  {sortOption.includes("asc") || sortOption === "oldest" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {filteredDocuments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No documents match your filters
                  </CardContent>
                </Card>
              ) : (
                filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${
                      selectedDoc?.id === doc.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${getTypeColor(doc.type)} text-white`}
                          >
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{doc.type.replace("_", " ")}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatFileSize(doc.size)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Document preview */}
            <div>
              {selectedDoc ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedDoc.filename}</CardTitle>
                    <CardDescription>Extracted text content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg max-h-[600px] overflow-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {selectedDoc.extractedText || "No text extracted"}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Select a document to preview its contents
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
