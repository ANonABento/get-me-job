"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  Minimize2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getEntryTitle } from "@/components/bank/chunk-card-utils";
import { readCoverLetterApiResult } from "@/lib/cover-letter/api-response";
import { cn } from "@/lib/utils";
import type { BankEntry } from "@/types";
import {
  applyTextReplacement,
  createAiActionInstruction,
  getParagraphRanges,
  type AiActionId,
} from "./ai-action-center-utils";

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface PendingDiff {
  before: string;
  after: string;
  baseContent: string;
  range: { start: number; end: number } | null;
  actionLabel: string;
}

interface ChatEditorProps {
  jobDescription: string;
  jobTitle: string;
  company: string;
  initialContent: string;
}

interface SelectionRange {
  start: number;
  end: number;
}

interface AssistantRewrite {
  before: string;
  after: string;
  range: SelectionRange;
}

export function ChatEditor({
  jobDescription,
  jobTitle,
  company,
  initialContent,
}: ChatEditorProps) {
  const [versions, setVersions] = useState<string[]>([initialContent]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [pendingDiff, setPendingDiff] = useState<PendingDiff | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draftContent, setDraftContent] = useState(initialContent);
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(
    null
  );
  const [assistantRewrite, setAssistantRewrite] =
    useState<AssistantRewrite | null>(null);
  const draftContentRef = useRef(draftContent);
  const currentVersion =
    currentVersionIndex >= 0 ? versions[currentVersionIndex] : null;

  useEffect(() => {
    draftContentRef.current = draftContent;
  }, [draftContent]);

  function clearRewriteState() {
    setSelectedRange(null);
    setAssistantRewrite(null);
  }

  function updateCurrentVersionContent(content: string) {
    setDraftContent(content);
    setVersions((prev) =>
      prev.map((version, index) =>
        index === currentVersionIndex ? { ...version, content } : version
      )
    );
  }

  function selectVersion(
    index: number,
    options: { closeHistory?: boolean } = {}
  ) {
    const nextIndex = Math.min(Math.max(index, 0), versions.length - 1);
    setCurrentVersionIndex(nextIndex);
    setDraftContent(versions[nextIndex]?.content ?? "");
    clearRewriteState();
    if (options.closeHistory) {
      setShowHistory(false);
    }
  }

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company,
          action: "generate",
          selectedBankEntryIds: selectedIds,
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
      setDraftContent(result.content);
      clearRewriteState();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (assistantRequestRef.current === requestId) {
        setIsGenerating(false);
      }
    }
  }

  async function runAssistantAction(
    action: AiActionId,
    actionLabel: string,
    target: TextSelection | null,
  ) {
    const requestId = assistantRequestRef.current + 1;
    assistantRequestRef.current = requestId;
    const baseContent = contentRef.current;
    const before = target?.text ?? baseContent;
    const instruction = createAiActionInstruction({
      action,
      selectedText: before,
      jobDescription,
      sectionLabel:
        action === "rewrite-section" && selectedSection
          ? selectedSection.label
          : undefined,
    });

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company,
          action: "revise",
          currentContent: draftContent,
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
      setDraftContent(result.content);
      clearRewriteState();
      setInstruction("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (assistantRequestRef.current === requestId) {
        setIsGenerating(false);
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRevise();
    }
  }

  async function handleCopy() {
    if (!currentVersion) return;
    await navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!currentVersion) return;
    const blob = new Blob([draftContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName =
      company.toLowerCase().replace(/\s+/g, "-") || "cover-letter";
    a.download = `cover-letter-${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleEditorSelect(event: SyntheticEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;
    const nextRange = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
    setSelectedRange(nextRange.end > nextRange.start ? nextRange : null);
  }

  async function handleAssistantRewrite(prompt = "Rewrite") {
    if (!selectedRange || selectedRange.end <= selectedRange.start) return;

    const requestContent = draftContent;
    const requestRange = selectedRange;
    const selectedText = requestContent.slice(
      requestRange.start,
      requestRange.end
    );

    setIsGenerating(true);
    setError(null);
    setAssistantRewrite(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          company,
          action: "rewrite-selection",
          currentContent: requestContent,
          selectedText,
          instruction: prompt,
        }),
      });

      const result = await readCoverLetterApiResult(
        res,
        "Failed to rewrite selection"
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (draftContentRef.current !== requestContent) return;

      setAssistantRewrite({
        before: selectedText,
        after: result.content,
        range: requestRange,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAcceptRewrite() {
    if (!assistantRewrite) return;
    const { range, after } = assistantRewrite;
    const nextContent = `${draftContent.slice(0, range.start)}${after}${draftContent.slice(
      range.end
    )}`;
    updateCurrentVersionContent(nextContent);
    setAssistantRewrite(null);
    setSelectedRange({
      start: range.start,
      end: range.start + after.length,
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
                aria-label="Previous version"
                onClick={() => selectVersion(currentVersionIndex - 1)}
                disabled={currentVersionIndex <= 0}
                aria-label="Previous version"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next version"
                onClick={() => selectVersion(currentVersionIndex + 1)}
                disabled={currentVersionIndex >= versions.length - 1}
                aria-label="Next version"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={generateFromBank}
            disabled={isGenerating}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Regenerate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
          >
            {copied ? (
              <Check className="mr-1 h-4 w-4" />
            ) : (
              <Copy className="mr-1 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!content}
          >
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {showHistory && (
        <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
          <h3 className="text-sm font-medium">Version History</h3>
          {versions.map((version, index) => (
            <button
              key={`${version.createdAt}-${index}`}
              onClick={() => selectVersion(index, { closeHistory: true })}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                index === currentVersionIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span className="font-medium">v{index + 1}</span>
              <span className="ml-2 text-xs opacity-75">
                {version.instruction}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_18rem]">
        {isGenerating && !currentVersion ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-card text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating cover letter...
          </div>
        ) : currentVersion ? (
          <Textarea
            aria-label="Cover letter editor"
            value={draftContent}
            onChange={(event) => {
              updateCurrentVersionContent(event.target.value);
              clearRewriteState();
            }}
            onSelect={handleEditorSelect}
            className="min-h-[300px] flex-1 resize-none bg-card p-6 text-sm leading-relaxed"
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-card text-muted-foreground">
            No cover letter generated yet.
          </div>
        )}

        <aside className="rounded-lg border bg-muted/30 p-3">
          <h3 className="text-sm font-semibold">AI Assistant</h3>
          {selectedRange ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAssistantRewrite("Rewrite")}
                  disabled={isGenerating}
                >
                  Rewrite
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssistantRewrite("Make concise")}
                  disabled={isGenerating}
                >
                  Make concise
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssistantRewrite("Add metrics")}
                  disabled={isGenerating}
                >
                  Add metrics
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssistantRewrite("Match JD keywords")}
                  disabled={isGenerating}
                >
                  Match JD keywords
                </Button>
              </div>

              {assistantRewrite && (
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Before
                    </div>
                    <p className="rounded-md bg-background p-2">
                      {assistantRewrite.before}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      After
                    </div>
                    <p className="rounded-md bg-background p-2">
                      {assistantRewrite.after}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleAcceptRewrite}>
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAssistantRewrite(null)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Select text in the editor to rewrite a specific passage.</p>
              <p>Select relevant experience and match JD keywords.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Refine: "make it more concise", "emphasize leadership", "add more technical details"...'
          className="max-h-[120px] min-h-[44px] resize-none"
          disabled={isGenerating || !currentVersion}
          rows={1}
        />
        <Button
          onClick={handleRevise}
          disabled={isGenerating || !instruction.trim() || !currentVersion}
          className="shrink-0"
          aria-label="Revise cover letter"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <Textarea
            aria-label="Cover letter editor"
            value={content}
            onChange={handleContentChange}
            onSelect={(event) => updateSelection(event.currentTarget)}
            className="h-full min-h-[420px] resize-none rounded-none border-0 p-6 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <aside className="min-h-0 overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            {!isPanelCollapsed && (
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Assistant
              </h3>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelCollapsed((value) => !value)}
              aria-label={
                isPanelCollapsed
                  ? "Expand AI action center"
                  : "Collapse AI action center"
              }
            >
              {isPanelCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!isPanelCollapsed && (
            <div className="space-y-5">
              <section className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowJobDescription((value) => !value)}
                >
                  Tailor to JD
                </Button>
                {showJobDescription && (
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Job description
                    </p>
                    <div className="max-h-36 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                      {jobDescription}
                    </div>
                    <Button
                      className="mt-3 w-full"
                      size="sm"
                      onClick={() =>
                        runAssistantAction("tailor", "Tailor to JD", null)
                      }
                      disabled={isGenerating}
                    >
                      Apply JD Tailoring
                    </Button>
                  </div>
                )}
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowBankPicker((value) => !value)}
                  disabled={isGenerating}
                >
                  Generate from Bank
                </Button>
                {showBankPicker && (
                  <div className="space-y-3 rounded-md border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Knowledge bank
                      </p>
                      {bankEntries.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            setSelectedBankEntryIds(
                              selectedBankEntryIds.size === bankEntries.length
                                ? new Set()
                                : new Set(bankEntries.map((entry) => entry.id)),
                            )
                          }
                        >
                          {selectedBankEntryIds.size === bankEntries.length
                            ? "Deselect all"
                            : "Select all"}
                        </Button>
                      )}
                    </div>
                    {isLoadingBankEntries && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Loading entries...
                      </div>
                    )}
                    {bankEntriesError && (
                      <p className="text-xs text-destructive">
                        {bankEntriesError}
                      </p>
                    )}
                    {!isLoadingBankEntries &&
                      !bankEntriesError &&
                      bankEntries.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No bank entries found.
                        </p>
                      )}
                    {bankEntries.length > 0 && (
                      <div className="max-h-48 space-y-1 overflow-y-auto">
                        {bankEntries.map((entry) => (
                          <label
                            key={entry.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-background"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBankEntryIds.has(entry.id)}
                              onChange={() => toggleBankEntry(entry.id)}
                              className="h-4 w-4"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {getEntryTitle(entry)}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={generateFromBank}
                      disabled={
                        isGenerating ||
                        isLoadingBankEntries ||
                        !hasLoadedBankEntries ||
                        selectedBankEntryIds.size === 0
                      }
                    >
                      Generate with selected entries
                    </Button>
                  </div>
                )}
                <div className="space-y-2 rounded-md border p-3">
                  <label
                    htmlFor="rewrite-section"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Rewrite Section
                  </label>
                  <select
                    id="rewrite-section"
                    value={selectedSectionIndex}
                    onChange={(event) =>
                      setSelectedSectionIndex(Number(event.target.value))
                    }
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    disabled={sections.length === 0}
                  >
                    {sections.map((section, index) => (
                      <option
                        key={`${section.start}-${section.end}`}
                        value={index}
                      >
                        {section.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleRewriteSection}
                    disabled={!selectedSection || isGenerating}
                  >
                    Rewrite Section
                  </Button>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Contextual actions
                </h4>
                {selection ? (
                  <div className="grid grid-cols-1 gap-2">
                    {CONTEXTUAL_ACTIONS.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          runAssistantAction(action.id, action.label, selection)
                        }
                        disabled={isGenerating}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <p>
                      Select text in the editor to rewrite a specific passage.
                    </p>
                    <p>Select relevant experience and match JD keywords.</p>
                  </div>
                )}
              </section>

              {pendingDiff && (
                <section className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">
                      {pendingDiff.actionLabel}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      Preview
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Before
                      </p>
                      <div className="max-h-32 overflow-y-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">
                        {pendingDiff.before}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        After
                      </p>
                      <div className="max-h-32 overflow-y-auto rounded-md bg-primary/10 p-2 text-xs whitespace-pre-wrap">
                        {pendingDiff.after}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleAcceptDiff}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPendingDiff(null)}
                    >
                      Reject
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
