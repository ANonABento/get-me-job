"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/utils";
import type { Document } from "@/types";
import { Loader2, FileText, Trash2, Upload, Eye } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
      setDocuments(documents.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            View and manage your uploaded documents
          </p>
        </div>
        <Button onClick={() => (window.location.href = "/upload")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your resume, cover letters, or other documents to get started
            </p>
            <Button onClick={() => (window.location.href = "/upload")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Documents list */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">
              {documents.length} document(s)
            </h2>
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className={`cursor-pointer transition-colors ${
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
                          <Badge variant="secondary">{doc.type}</Badge>
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
            ))}
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
      )}
    </div>
  );
}
