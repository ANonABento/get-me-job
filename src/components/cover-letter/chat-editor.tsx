"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { readCoverLetterApiResult } from "@/lib/cover-letter/api-response";
import {
  DOCUMENT_ASSISTANT_ACTIONS,
  DOCUMENT_ASSISTANT_ACTION_LABELS,
  applySelectionRewrite,
  buildSimpleDiff,
  getDocumentSuggestions,
  normalizeSelection,
  type DocumentAssistantAction,
  type SelectionRange,
} from "@/lib/document-assistant";
import { cn } from "@/lib/utils";
import {
  Send,
  Copy,
  Download,
  RotateCcw,
  Loader2,
  Check,
  CheckCircle2,
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scissors,
  BarChart3,
  Target,
  X,
} from "lucide-react";

interface Version {
  content: string;
  instruction: string;
  createdAt: string;
}

interface ChatEditorProps {
  jobDescription: string;
  jobTitle: string;
  company: string;
  initialContent: string;
}

const QUICK_ACTION_ICONS: Record<DocumentAssistantAction, typeof Sparkles> = {
  rewrite: Sparkles,
  "make-concise": Scissors,
  "add-metrics": BarChart3,
  "match-jd-keywords": Target,
};

export function ChatEditor({
  jobDescription,
  jobTitle,
  company,
  initialContent,
}: ChatEditorProps) {
  const [versions, setVersions] = useState<Version[]>([
    {
      content: initialContent,
      instruction: "Initial generation",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [assistantProposal, setAssistantProposal] = useState<{
    action: DocumentAssistantAction;
    before: string;
    after: string;
    range: SelectionRange;
  } | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantLoadingAction, setAssistantLoadingAction] =
    useState<DocumentAssistantAction | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const assistantRequestIdRef = useRef(0);
  const currentVersion =
    currentVersionIndex >= 0 ? versions[currentVersionIndex] : null;
  const currentContent = currentVersion?.content ?? "";
  const currentContentRef = useRef(currentContent);
  const currentVersionIndexRef = useRef(currentVersionIndex);
  currentContentRef.current = currentContent;
  currentVersionIndexRef.current = currentVersionIndex;
  const selectedText = useMemo(
    () => normalizeSelection(currentContent, selectionRange),
    [currentContent, selectionRange],
  );
  const suggestions = useMemo(
    () => getDocumentSuggestions(currentContent, jobDescription),
    [currentContent, jobDescription],
  );

  const invalidateAssistantRequest = useCallback(() => {
    assistantRequestIdRef.current += 1;
    setAssistantLoadingAction(null);
  }, []);

  const clearAssistantResponse = useCallback(() => {
    setAssistantProposal(null);
    setAssistantError(null);
  }, []);

  const clearAssistantSelection = useCallback(() => {
    setSelectionRange(null);
    clearAssistantResponse();
  }, [clearAssistantResponse]);

  const goToVersion = useCallback(
    (index: number, options?: { closeHistory?: boolean }) => {
      invalidateAssistantRequest();
      setCurrentVersionIndex(index);
      if (options?.closeHistory) {
        setShowHistory(false);
      }
      clearAssistantSelection();
    },
    [clearAssistantSelection, invalidateAssistantRequest],
  );

  const generate = useCallback(async () => {
    invalidateAssistantRequest();
    setIsGenerating(true);
    setError(null);
    clearAssistantSelection();

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company,
          action: "generate",
        }),
      });

      const result = await readCoverLetterApiResult(
        res,
        "Failed to generate cover letter",
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const newVersion: Version = {
        content: result.content,
        instruction: "Initial generation",
        createdAt: new Date().toISOString(),
      };
      setVersions([newVersion]);
      setCurrentVersionIndex(0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    jobDescription,
    jobTitle,
    company,
    clearAssistantSelection,
    invalidateAssistantRequest,
  ]);

  async function handleRevise() {
    if (!instruction.trim() || !currentVersion) return;

    invalidateAssistantRequest();
    setIsGenerating(true);
    setError(null);
    clearAssistantResponse();

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company,
          action: "revise",
          currentContent: currentVersion.content,
          instruction: instruction.trim(),
        }),
      });

      const result = await readCoverLetterApiResult(
        res,
        "Failed to revise cover letter",
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const newVersion: Version = {
        content: result.content,
        instruction: instruction.trim(),
        createdAt: new Date().toISOString(),
      };
      const newVersions = [
        ...versions.slice(0, currentVersionIndex + 1),
        newVersion,
      ];
      setVersions(newVersions);
      setCurrentVersionIndex(newVersions.length - 1);
      setInstruction("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRevise();
    }
  }

  async function handleCopy() {
    if (!currentVersion) return;
    await navigator.clipboard.writeText(currentVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!currentVersion) return;
    const blob = new Blob([currentVersion.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName =
      company.toLowerCase().replace(/\s+/g, "-") || "cover-letter";
    a.download = `cover-letter-${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRevert(index: number) {
    goToVersion(index, { closeHistory: true });
  }

  function handleContentChange(content: string) {
    invalidateAssistantRequest();
    currentContentRef.current = content;
    setVersions((prev) =>
      prev.map((version, index) =>
        index === currentVersionIndex ? { ...version, content } : version,
      ),
    );
    clearAssistantSelection();
  }

  function handleSelectionChange() {
    const editor = editorRef.current;
    if (!editor) return;

    const nextRange = {
      start: editor.selectionStart,
      end: editor.selectionEnd,
    };
    const nextSelection = nextRange.end > nextRange.start ? nextRange : null;
    const rangeChanged =
      selectionRange?.start !== nextSelection?.start ||
      selectionRange?.end !== nextSelection?.end;

    if (rangeChanged) {
      invalidateAssistantRequest();
    }

    setSelectionRange(nextSelection);
    clearAssistantResponse();
  }

  async function handleAssistantAction(action: DocumentAssistantAction) {
    const selection = normalizeSelection(currentContent, selectionRange);
    if (!selection) {
      setAssistantError("Select text in the editor first.");
      return;
    }

    const requestId = assistantRequestIdRef.current + 1;
    assistantRequestIdRef.current = requestId;
    const requestContent = currentContent;
    const requestVersionIndex = currentVersionIndex;

    setAssistantLoadingAction(action);
    setAssistantError(null);
    setAssistantProposal(null);

    try {
      const res = await fetch("/api/documents/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          selectedText: selection.text,
          documentContent: currentContent,
          jobDescription,
        }),
      });

      const result = await readCoverLetterApiResult(
        res,
        "Failed to rewrite selected text",
      );
      if (!result.ok) {
        if (assistantRequestIdRef.current !== requestId) return;
        setAssistantError(result.error);
        return;
      }

      if (
        assistantRequestIdRef.current !== requestId ||
        currentContentRef.current !== requestContent ||
        currentVersionIndexRef.current !== requestVersionIndex
      ) {
        return;
      }

      setAssistantProposal({
        action,
        before: selection.text,
        after: result.content,
        range: { start: selection.start, end: selection.end },
      });
    } catch {
      if (assistantRequestIdRef.current !== requestId) return;
      setAssistantError("Network error. Please try again.");
    } finally {
      if (assistantRequestIdRef.current === requestId) {
        setAssistantLoadingAction(null);
      }
    }
  }

  function handleAcceptProposal() {
    if (!assistantProposal || !currentVersion) return;

    const currentSelection = normalizeSelection(
      currentVersion.content,
      assistantProposal.range,
    );
    if (
      !currentSelection ||
      currentSelection.text !== assistantProposal.before
    ) {
      invalidateAssistantRequest();
      clearAssistantSelection();
      setAssistantError(
        "The selected text changed. Select the passage again and retry.",
      );
      return;
    }

    invalidateAssistantRequest();
    const content = applySelectionRewrite(
      currentVersion.content,
      assistantProposal.range,
      assistantProposal.after,
    );
    const newVersion: Version = {
      content,
      instruction: `AI: ${DOCUMENT_ASSISTANT_ACTION_LABELS[assistantProposal.action]}`,
      createdAt: new Date().toISOString(),
    };
    const newVersions = [
      ...versions.slice(0, currentVersionIndex + 1),
      newVersion,
    ];
    setVersions(newVersions);
    setCurrentVersionIndex(newVersions.length - 1);
    clearAssistantSelection();

    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }

  function handleRejectProposal() {
    clearAssistantResponse();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Cover Letter</h2>
          {versions.length > 0 && (
            <span className="text-xs text-muted-foreground">
              v{currentVersionIndex + 1} of {versions.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  goToVersion(Math.max(0, currentVersionIndex - 1))
                }
                disabled={currentVersionIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  goToVersion(
                    Math.min(versions.length - 1, currentVersionIndex + 1),
                  )
                }
                disabled={currentVersionIndex >= versions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            disabled={versions.length <= 1}
          >
            <History className="h-4 w-4 mr-1" />
            History
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={isGenerating}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!currentVersion}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!currentVersion}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
          <h3 className="text-sm font-medium">Version History</h3>
          {versions.map((v, i) => (
            <button
              key={i}
              onClick={() => handleRevert(i)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                i === currentVersionIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <span className="font-medium">v{i + 1}</span>
              <span className="ml-2 text-xs opacity-75">{v.instruction}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative min-h-[300px]">
          {isGenerating && !currentVersion ? (
            <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating cover letter...
            </div>
          ) : currentVersion ? (
            <Textarea
              ref={editorRef}
              value={currentVersion.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              onMouseUp={handleSelectionChange}
              className="h-full min-h-[300px] resize-none rounded-lg border bg-card p-6 text-sm leading-relaxed"
              aria-label="Cover letter editor"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
              No cover letter generated yet.
            </div>
          )}
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Assistant</h3>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {selectedText ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Selection
                  </p>
                  <div className="max-h-28 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm">
                    {selectedText.text}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {DOCUMENT_ASSISTANT_ACTIONS.map((action) => {
                    const Icon = QUICK_ACTION_ICONS[action];
                    return (
                      <Button
                        key={action}
                        variant={action === "rewrite" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAssistantAction(action)}
                        disabled={assistantLoadingAction !== null}
                        className="justify-start"
                      >
                        {assistantLoadingAction === action ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="mr-2 h-4 w-4" />
                        )}
                        {DOCUMENT_ASSISTANT_ACTION_LABELS[action]}
                      </Button>
                    );
                  })}
                </div>

                {assistantError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {assistantError}
                  </div>
                )}

                {assistantProposal && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Before / After
                      </p>
                      <div className="space-y-2">
                        {buildSimpleDiff(
                          assistantProposal.before,
                          assistantProposal.after,
                        ).map((line, index) => (
                          <div
                            key={`${line.type}-${index}`}
                            className={cn(
                              "rounded-md border p-3 text-sm leading-relaxed",
                              line.type === "removed" &&
                                "border-destructive/40 bg-destructive/10 text-destructive",
                              line.type === "added" &&
                                "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
                              line.type === "unchanged" && "bg-muted/30",
                            )}
                          >
                            <span className="mb-1 block text-xs font-medium uppercase opacity-70">
                              {line.type === "removed"
                                ? "Before"
                                : line.type === "added"
                                  ? "After"
                                  : "Unchanged"}
                            </span>
                            {line.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAcceptProposal}
                        className="flex-1"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRejectProposal}
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select text in the editor to rewrite a specific passage.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Suggestions
                  </p>
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-md border bg-muted/20 p-3 text-sm"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Chat input */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Refine: "make it more concise", "emphasize leadership", "add more technical details"...'
          className="min-h-[44px] max-h-[120px] resize-none"
          disabled={isGenerating || !currentVersion}
          rows={1}
        />
        <Button
          onClick={handleRevise}
          disabled={isGenerating || !instruction.trim() || !currentVersion}
          className="shrink-0"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
