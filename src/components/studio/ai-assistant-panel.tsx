"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DOCUMENT_ASSISTANT_ACTION_LABELS,
  buildDocumentAssistantRequestPayload,
  isMissingLLMSetupError,
  parseLLMStatusResponse,
  stripDocumentHtml,
  type DocumentAssistantAction,
} from "@/lib/document-assistant";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";

type AssistantRunAction =
  | DocumentAssistantAction
  | "generate-from-bank"
  | "rewrite-section";

interface AiAssistantPanelProps {
  documentContent: string;
  selectedEntryCount: number;
  onOpenBank: () => void;
}

interface AssistantResponse {
  content?: string;
  error?: string;
}

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
  opportunity?: Opportunity;
  error?: string;
}

const QUICK_ACTIONS: DocumentAssistantAction[] = [
  "rewrite",
  "make-concise",
  "add-metrics",
];

const REWRITE_SECTIONS = [
  { value: "summary", label: "Summary" },
  { value: "experience", label: "Experience" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
] as const;

type RewriteSection = (typeof REWRITE_SECTIONS)[number]["value"];

function isRewriteSection(value: string): value is RewriteSection {
  return REWRITE_SECTIONS.some((section) => section.value === value);
}

async function readApiError(
  response: Response,
  fallback = "Assistant request failed.",
): Promise<string> {
  try {
    const data = (await response.json()) as AssistantResponse;
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

function getOpportunityText(opportunity: Opportunity): string {
  return opportunity.summary.trim();
}

export function AiAssistantPanel({
  documentContent,
  selectedEntryCount,
  onOpenBank,
}: AiAssistantPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const runningActionRef = useRef<AssistantRunAction | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");
  const [selectedOpportunityLabel, setSelectedOpportunityLabel] = useState("");
  const [opportunityPickerOpen, setOpportunityPickerOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunityError, setOpportunityError] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [rewriteSection, setRewriteSection] = useState<RewriteSection | "">(
    "",
  );
  const [runningAction, setRunningAction] = useState<AssistantRunAction | null>(
    null,
  );
  const [setupPrompt, setSetupPrompt] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [assistantResult, setAssistantResult] = useState("");

  useEffect(() => {
    function syncSelection() {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      const activeElement = document.activeElement;
      const focusIsInPanel =
        activeElement instanceof Element &&
        panelRef.current?.contains(activeElement);

      if (!text) {
        if (focusIsInPanel) return;
        setSelectedText("");
        return;
      }

      const root = document.querySelector("[data-document-editor-root='true']");
      const anchorNode = selection?.anchorNode;
      const anchorElement =
        anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;

      if (root && anchorElement && root.contains(anchorElement)) {
        setSelectedText(text);
      } else if (!focusIsInPanel) {
        setSelectedText("");
      }
    }

    document.addEventListener("selectionchange", syncSelection);
    return () => {
      document.removeEventListener("selectionchange", syncSelection);
    };
  }, []);

  useEffect(() => {
    const opportunityId = new URLSearchParams(window.location.search).get(
      "opportunityId",
    );
    if (!opportunityId) return;

    let cancelled = false;

    async function preloadOpportunity() {
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`);
        if (!response.ok) {
          throw new Error(await readApiError(response, "Opportunity not found."));
        }
        const data = (await response.json()) as OpportunitiesResponse;
        if (!data.opportunity) throw new Error("Opportunity not found.");
        if (cancelled) return;

        setJobDescription(getOpportunityText(data.opportunity));
        setSelectedOpportunityId(data.opportunity.id);
        setSelectedOpportunityLabel(
          `${data.opportunity.title} at ${data.opportunity.company}`,
        );
      } catch (error) {
        if (!cancelled) {
          setOpportunityError(
            error instanceof Error
              ? error.message
              : "Could not load the selected opportunity.",
          );
        }
      }
    }

    preloadOpportunity();

    return () => {
      cancelled = true;
    };
  }, []);

  const ensureLLMConfigured = useCallback(async () => {
    const response = await fetch("/api/settings/status");
    if (!response.ok) {
      setStatusMessage(
        await readApiError(response, "Could not check LLM setup."),
      );
      setAssistantResult("");
      return false;
    }

    const status = parseLLMStatusResponse(await response.json());
    if (!status.configured) {
      setSetupPrompt(true);
      setStatusMessage("");
      setAssistantResult("");
      return false;
    }

    setSetupPrompt(false);
    return true;
  }, []);

  const loadOpportunities = useCallback(async () => {
    setOpportunitiesLoading(true);
    setOpportunityError("");
    try {
      const response = await fetch("/api/opportunities?status=saved,applied");
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Could not load saved opportunities."),
        );
      }
      const data = (await response.json()) as OpportunitiesResponse;
      setOpportunities(data.opportunities ?? []);
    } catch (error) {
      setOpportunities([]);
      setOpportunityError(
        error instanceof Error
          ? error.message
          : "Could not load saved opportunities.",
      );
    } finally {
      setOpportunitiesLoading(false);
    }
  }, []);

  const handleOpenOpportunityPicker = useCallback(() => {
    setOpportunityPickerOpen(true);
    void loadOpportunities();
  }, [loadOpportunities]);

  const handleSelectOpportunity = useCallback((opportunity: Opportunity) => {
    setJobDescription(getOpportunityText(opportunity));
    setSelectedOpportunityId(opportunity.id);
    setSelectedOpportunityLabel(`${opportunity.title} at ${opportunity.company}`);
    setOpportunityPickerOpen(false);
    setOpportunityError("");
    setStatusMessage(`Loaded ${opportunity.title} from the job bank.`);
    setAssistantResult("");
  }, []);

  const runRewrite = useCallback(
    async (action: DocumentAssistantAction, fallbackText: string) => {
      const textToRewrite = selectedText || fallbackText;
      if (!textToRewrite.trim()) {
        setStatusMessage("Select text in the document first.");
        setAssistantResult("");
        return;
      }

      const response = await fetch("/api/documents/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildDocumentAssistantRequestPayload({
            action,
            selectedText: textToRewrite,
            documentContent,
            jobDescription,
            ...(selectedOpportunityId
              ? { opportunityId: selectedOpportunityId }
              : {}),
          }),
        ),
      });

      if (!response.ok) {
        const error = await readApiError(response);
        if (isMissingLLMSetupError(error)) {
          setSetupPrompt(true);
          setStatusMessage("");
        } else {
          setStatusMessage(error);
        }
        setAssistantResult("");
        return;
      }

      const data = (await response.json()) as AssistantResponse;
      setAssistantResult(data.content ?? "");
      setStatusMessage("Review the rewrite before applying it to the document.");
    },
    [documentContent, jobDescription, selectedOpportunityId, selectedText],
  );

  const handleAssistantAction = useCallback(
    async (action: AssistantRunAction) => {
      if (runningActionRef.current) return;

      runningActionRef.current = action;
      setRunningAction(action);
      setStatusMessage("");
      setAssistantResult("");

      try {
        if (action === "match-jd-keywords" && !jobDescription.trim()) {
          setStatusMessage("Paste a job description first.");
          return;
        }

        if (action === "rewrite-section") {
          const sectionLabel = REWRITE_SECTIONS.find(
            (section) => section.value === rewriteSection,
          )?.label;

          if (!sectionLabel) {
            setStatusMessage("Choose a section to rewrite.");
            return;
          }

          if (!selectedText) {
            setStatusMessage(
              `Select text in the ${sectionLabel.toLowerCase()} section first.`,
            );
            return;
          }
        }

        const configured = await ensureLLMConfigured();
        if (!configured) return;

        if (action === "generate-from-bank") {
          onOpenBank();
          setStatusMessage(
            selectedEntryCount > 0
              ? "Bank entries are ready for the next generation step."
              : "Choose bank entries to generate a stronger draft.",
          );
          return;
        }

        if (action === "rewrite-section") {
          await runRewrite("rewrite", "");
          return;
        }

        await runRewrite(
          action,
          action === "match-jd-keywords"
            ? stripDocumentHtml(documentContent)
            : "",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Assistant request failed.";
        if (isMissingLLMSetupError(message)) {
          setSetupPrompt(true);
          setStatusMessage("");
        } else {
          setStatusMessage(message);
        }
      } finally {
        runningActionRef.current = null;
        setRunningAction(null);
      }
    },
    [
      documentContent,
      ensureLLMConfigured,
      jobDescription,
      onOpenBank,
      rewriteSection,
      runRewrite,
      selectedEntryCount,
      selectedText,
    ],
  );

  const isRunning = (action: AssistantRunAction) => runningAction === action;
  const isBusy = runningAction !== null;
  const hasSelection = selectedText.length > 0;

  return (
    <aside
      ref={panelRef}
      className="hidden w-[360px] shrink-0 flex-col border-l bg-background md:flex"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">AI Assistant</h2>
        <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {setupPrompt && (
          <div
            className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"
            role="status"
          >
            <p className="font-medium">Set up an LLM provider to use AI tools.</p>
            <Link
              href="/settings"
              className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open Settings
            </Link>
          </div>
        )}

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="studio-jd-input">Job description</Label>
            {selectedOpportunityLabel && (
              <span className="truncate text-xs text-muted-foreground">
                {selectedOpportunityLabel}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
            onClick={handleOpenOpportunityPicker}
          >
            <BriefcaseBusiness className="mr-2 h-4 w-4" />
            Select from Job Bank
          </Button>
          <Textarea
            id="studio-jd-input"
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setSelectedOpportunityId("");
              setSelectedOpportunityLabel("");
            }}
            placeholder="Paste the JD here"
            className="min-h-[132px] resize-none"
          />
          <Button
            type="button"
            className="w-full"
            disabled={isBusy}
            onClick={() => handleAssistantAction("match-jd-keywords")}
          >
            {isRunning("match-jd-keywords") ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isRunning("match-jd-keywords") ? "Tailoring..." : "Tailor to JD"}
          </Button>
        </section>

        <section className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
            onClick={() => handleAssistantAction("generate-from-bank")}
          >
            {isRunning("generate-from-bank") ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isRunning("generate-from-bank")
              ? "Preparing..."
              : "Generate from Bank"}
          </Button>
        </section>

        <section className="space-y-2">
          <Label htmlFor="rewrite-section-trigger">Rewrite section</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select
              value={rewriteSection}
              onValueChange={(value) => {
                if (isRewriteSection(value)) setRewriteSection(value);
              }}
            >
              <SelectTrigger
                id="rewrite-section-trigger"
                aria-label="Rewrite Section"
              >
                <SelectValue placeholder="Choose section" />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_SECTIONS.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              disabled={isBusy}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleAssistantAction("rewrite-section")}
              aria-label="Rewrite selected section"
            >
              {isRunning("rewrite-section") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="h-4 w-4" />
              )}
            </Button>
          </div>
        </section>

        {hasSelection && (
          <section
            className="space-y-3 rounded-md border bg-muted/30 p-3"
            aria-label="Selected text quick actions"
          >
            <div>
              <p className="text-sm font-medium">Selected text</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {selectedText}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action}
                  type="button"
                  size="sm"
                  variant="secondary"
                  className={cn(
                    "px-2 text-xs",
                    action === "make-concise" && "text-[11px]",
                  )}
                  disabled={isBusy}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleAssistantAction(action)}
                >
                  {isRunning(action) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    DOCUMENT_ASSISTANT_ACTION_LABELS[action]
                  )}
                </Button>
              ))}
            </div>
          </section>
        )}

        {(statusMessage || assistantResult) && (
          <section className="space-y-2 text-sm" role="status">
            {statusMessage && (
              <p className="text-muted-foreground">{statusMessage}</p>
            )}
            {assistantResult && (
              <div className="rounded-md border bg-muted/30 p-3 text-foreground">
                {assistantResult}
              </div>
            )}
          </section>
        )}
      </div>

      <Dialog
        open={opportunityPickerOpen}
        onOpenChange={setOpportunityPickerOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select from Job Bank</DialogTitle>
            <DialogDescription>
              Choose a saved or applied opportunity to load its description.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {opportunitiesLoading && (
              <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading opportunities...
              </div>
            )}
            {opportunityError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {opportunityError}
              </p>
            )}
            {!opportunitiesLoading &&
              !opportunityError &&
              opportunities.length === 0 && (
                <p className="rounded-md border p-3 text-sm text-muted-foreground">
                  No saved or applied opportunities found.
                </p>
              )}
            {opportunities.map((opportunity) => (
              <button
                key={opportunity.id}
                type="button"
                className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => handleSelectOpportunity(opportunity)}
              >
                <span className="block text-sm font-medium">
                  {opportunity.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {opportunity.company} · {opportunity.status}
                </span>
                <span className="mt-2 line-clamp-2 block text-xs text-muted-foreground">
                  {opportunity.summary}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
