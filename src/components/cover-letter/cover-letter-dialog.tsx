"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  History,
  ChevronDown,
} from "lucide-react";

interface CoverLetterVersion {
  id: string;
  content: string;
  highlights: string[];
  version: number;
  createdAt: string;
}

interface CoverLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  company: string;
}

export function CoverLetterDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  company,
}: CoverLetterDialogProps) {
  const [content, setContent] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<CoverLetterVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/cover-letter/history`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
        if (data.versions?.length > 0 && !content) {
          const latest = data.versions[0];
          setContent(latest.content);
          setHighlights(latest.highlights || []);
          setSelectedVersion(latest.id);
        }
      }
    } catch {
      // Ignore errors - versions are optional
    }
  }, [jobId, content]);

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, fetchVersions]);

  const generateCoverLetter = useCallback(async () => {
    setLoading(true);
    setError(null);
    setContent("");
    setHighlights([]);
    setSelectedVersion(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/cover-letter/stream`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate cover letter");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.content) {
                fullContent += data.content;
                setContent(fullContent);
                if (contentRef.current) {
                  contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const saveCoverLetter = useCallback(async () => {
    if (!content) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/cover-letter/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, highlights }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      setVersions((prev) => [data.coverLetter, ...prev]);
      setSelectedVersion(data.coverLetter.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [jobId, content, highlights]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const downloadAsText = useCallback(() => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, company]);

  const selectVersion = useCallback((version: CoverLetterVersion) => {
    setContent(version.content);
    setHighlights(version.highlights || []);
    setSelectedVersion(version.id);
    setShowVersions(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Cover Letter
          </DialogTitle>
          <DialogDescription>
            {jobTitle} at {company}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Version selector */}
          {versions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  {selectedVersion
                    ? `Version ${versions.find((v) => v.id === selectedVersion)?.version || ""}`
                    : "Select version"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    showVersions ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showVersions && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVersion(v)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        selectedVersion === v.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="font-medium">Version {v.version}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content area */}
          <div
            ref={contentRef}
            className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto rounded-lg border bg-muted/30 p-4"
            aria-live="polite"
            aria-label="Cover letter content"
          >
            {loading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating cover letter...
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                </p>
              </div>
            ) : content ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateCoverLetter} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Generate a tailored cover letter for this position
                </p>
                <Button onClick={generateCoverLetter}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
              </div>
            )}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Highlights</h4>
              <ul className="space-y-1">
                {highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {content && !loading && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAsText}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateCoverLetter}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              {!selectedVersion && (
                <Button size="sm" onClick={saveCoverLetter} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
