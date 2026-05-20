"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  Loader2,
  PenLine,
  X,
  XCircle,
} from "lucide-react";
import { OpportunityDetailSkeleton } from "@/components/skeletons/opportunity-detail-skeleton";
import { Badge } from "@/components/ui/badge";
import { TimeAgo } from "@/components/format/time-ago";
import { Button } from "@/components/ui/button";
import { OpportunityStatusBadge } from "@/components/opportunities/opportunity-status-badge";
import { OpportunityActions } from "@/components/opportunities/opportunity-actions";
import { OpportunityContacts } from "@/components/opportunities/opportunity-contacts";
import { Input } from "@/components/ui/input";
import {
  AppPage,
  PageContent,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useDevMode } from "@/hooks/use-dev-mode";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useUndoableAction } from "@/hooks/use-undoable-action";
import { readJsonResponse } from "@/lib/http";
import { cn } from "@/lib/utils";
import type { JobDescription, JobStatus } from "@/types";
import {
  OPPORTUNITY_FIELD_SECTIONS,
  buildAppliedOpportunityPatch,
  buildOpportunityPatch,
  formatOpportunityFieldPreview,
  formatOpportunityFieldValue,
  type OpportunityFieldConfig,
} from "./utils";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface OpportunityResponse {
  job?: JobDescription;
}

interface ResumesResponse {
  resumes?: Array<{
    id: string;
    htmlPath?: string;
    matchScore?: number;
    createdAt: string;
  }>;
}

interface CoverLettersResponse {
  versions?: Array<{
    id: string;
    version: number;
    createdAt: string;
  }>;
}

type NotesSaveState = "idle" | "saving" | "saved" | "error";
type DismissUndoInput = { previousStatus: JobStatus };

function fieldInputValue(
  opportunity: JobDescription,
  field: OpportunityFieldConfig,
) {
  const value = formatOpportunityFieldValue(opportunity, field);
  return field.type === "date" ? value.slice(0, 10) : value;
}

function DocumentDate({ value }: { value: string }) {
  return <TimeAgo date={value} />;
}

interface OpportunityFieldSectionsProps {
  opportunity: JobDescription;
  editingField: string | null;
  savingField: string | null;
  draftValue: string;
  draftChecked: boolean;
  onStartEditing: (field: OpportunityFieldConfig) => void;
  onDraftValueChange: (value: string) => void;
  onDraftCheckedChange: (checked: boolean) => void;
  onSaveField: (field: OpportunityFieldConfig) => void;
  onCancelEditing: () => void;
}

function OpportunityFieldSections({
  opportunity,
  editingField,
  savingField,
  draftValue,
  draftChecked,
  onStartEditing,
  onDraftValueChange,
  onDraftCheckedChange,
  onSaveField,
  onCancelEditing,
}: OpportunityFieldSectionsProps) {
  const showDebugIds = useDevMode();

  return (
    <>
      {OPPORTUNITY_FIELD_SECTIONS.map((section) => (
        <section key={section.id} className="rounded-lg border bg-card">
          {/* audit/08: section headings now use the editorial mono-
              eyebrow treatment (same as the Actions / AI helpers
              sub-headers shipped in iter-5). Section names also
              renamed in utils.ts: Core → Role, etc. */}
          <div className="border-b px-5 py-3">
            <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {section.title}
            </h2>
          </div>
          <div className="divide-y">
            {section.fields.map((field) => {
              if (field.key === "id" && !showDebugIds) {
                return null;
              }

              const isEditing = editingField === field.key;
              const isSaving = savingField === field.key;
              const preview = formatOpportunityFieldPreview(opportunity, field);
              const rawValue = opportunity[field.key as keyof JobDescription];
              const showTimeAgo =
                (field.key === "appliedAt" || field.key === "createdAt") &&
                typeof rawValue === "string" &&
                rawValue.length > 0;

              return (
                <div
                  key={field.key}
                  className="group grid gap-3 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)]"
                >
                  <div className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </div>
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        {field.type === "textarea" || field.type === "list" ? (
                          <Textarea
                            value={draftValue}
                            placeholder={field.placeholder}
                            onChange={(event) =>
                              onDraftValueChange(event.target.value)
                            }
                            className="min-h-32"
                          />
                        ) : field.type === "checkbox" ? (
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={draftChecked}
                              onChange={(event) =>
                                onDraftCheckedChange(event.target.checked)
                              }
                              className="h-4 w-4 rounded border-input"
                            />
                            Remote
                          </label>
                        ) : field.type === "select" ? (
                          <select
                            value={draftValue}
                            onChange={(event) =>
                              onDraftValueChange(event.target.value)
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={field.type === "date" ? "date" : field.type}
                            value={draftValue}
                            onChange={(event) =>
                              onDraftValueChange(event.target.value)
                            }
                          />
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onSaveField(field)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-1.5 h-4 w-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={onCancelEditing}
                            disabled={isSaving}
                          >
                            <X className="mr-1.5 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "min-h-9 min-w-0 whitespace-pre-wrap break-words text-sm leading-6",
                            preview === "Not set" && "text-muted-foreground",
                          )}
                        >
                          {showTimeAgo ? <TimeAgo date={rawValue} /> : preview}
                        </div>
                        {field.type !== "readonly" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            // Hide the pencil at idle to keep the section
                            // chrome quiet; reveal on row-hover, on
                            // keyboard focus into the row, or for any
                            // currently-focused button (touch). This
                            // matches the "edit-on-intent" pattern of
                            // Linear/Notion field rows.
                            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                            onClick={() => onStartEditing(field)}
                            aria-label={`Edit ${field.label}`}
                          >
                            <PenLine className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export default function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const a11yT = useA11yTranslations();

  const [opportunity, setOpportunity] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [draftChecked, setDraftChecked] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [resumes, setResumes] = useState<
    NonNullable<ResumesResponse["resumes"]>
  >([]);
  const [coverLetters, setCoverLetters] = useState<
    NonNullable<CoverLettersResponse["versions"]>
  >([]);
  const [notes, setNotes] = useState("");
  const [notesSaveState, setNotesSaveState] = useState<NotesSaveState>("idle");
  const lastSavedNotesRef = useRef("");
  const patchQueueRef = useRef<Promise<void>>(Promise.resolve());
  const showErrorToast = useErrorToast();

  const fetchOpportunity = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${params.id}`);
      const data = await readJsonResponse<OpportunityResponse>(
        response,
        "Failed to load opportunity",
      );
      if (data.job) {
        setOpportunity(data.job);
        setNotes(data.job.notes ?? "");
        lastSavedNotesRef.current = data.job.notes ?? "";
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load opportunity",
        fallbackDescription: "Refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [params.id, showErrorToast]);

  const fetchLinkedDocuments = useCallback(async () => {
    const [resumeResult, coverLetterResult] = await Promise.allSettled([
      fetch(`/api/opportunities/${params.id}/resumes`).then((response) =>
        readJsonResponse<ResumesResponse>(
          response,
          "Failed to load generated resumes",
        ),
      ),
      fetch(`/api/opportunities/${params.id}/cover-letter/history`).then(
        (response) =>
          readJsonResponse<CoverLettersResponse>(
            response,
            "Failed to load cover letters",
          ),
      ),
    ]);

    if (resumeResult.status === "fulfilled") {
      setResumes(resumeResult.value.resumes ?? []);
    }

    if (coverLetterResult.status === "fulfilled") {
      setCoverLetters(coverLetterResult.value.versions ?? []);
    }
  }, [params.id]);

  useEffect(() => {
    void fetchOpportunity();
    void fetchLinkedDocuments();
  }, [fetchOpportunity, fetchLinkedDocuments]);

  const patchOpportunity = useCallback(
    async (patch: Partial<JobDescription>) => {
      const queuedPatch = patchQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          const response = await fetch(`/api/opportunities/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          const data = await readJsonResponse<OpportunityResponse>(
            response,
            "Failed to update opportunity",
          );

          setOpportunity(
            (current) =>
              data.job ?? (current ? { ...current, ...patch } : current),
          );

          return data.job;
        });

      patchQueueRef.current = queuedPatch.then(
        () => undefined,
        () => undefined,
      );

      return queuedPatch;
    },
    [params.id],
  );

  const dismissOpportunity = useUndoableAction<DismissUndoInput>({
    action: async () => {
      await patchOpportunity({ status: "dismissed" });
    },
    undoAction: async ({ previousStatus }) => {
      await patchOpportunity({ status: previousStatus });
    },
    message: "Opportunity dismissed.",
    description: "Status changed to dismissed.",
  });

  const startEditing = (field: OpportunityFieldConfig) => {
    if (!opportunity || field.type === "readonly") return;

    setEditingField(field.key);
    setDraftValue(fieldInputValue(opportunity, field));
    setDraftChecked(Boolean(opportunity[field.key as keyof JobDescription]));
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
    setDraftChecked(false);
  };

  const saveField = async (field: OpportunityFieldConfig) => {
    setSavingField(field.key);
    try {
      await patchOpportunity(
        buildOpportunityPatch(
          field,
          field.type === "checkbox" ? draftChecked : draftValue,
        ),
      );
      cancelEditing();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not save field",
        fallbackDescription: "Try saving the field again.",
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleApply = async () => {
    if (!opportunity) return;

    try {
      const updated = await patchOpportunity(buildAppliedOpportunityPatch());
      const sourceUrl = updated?.url ?? opportunity.url;
      if (sourceUrl) {
        window.open(sourceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not mark as applied",
        fallbackDescription: "Try applying again.",
      });
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissOpportunity({
        previousStatus: opportunity?.status ?? "saved",
      });
    } catch (error) {
      showErrorToast(error, {
        title: "Could not dismiss opportunity",
        fallbackDescription: "Try dismissing it again.",
      });
    }
  };

  useEffect(() => {
    if (!opportunity || notes === lastSavedNotesRef.current) {
      return;
    }

    setNotesSaveState("saving");
    const timeout = window.setTimeout(async () => {
      try {
        const updated = await patchOpportunity({ notes });
        lastSavedNotesRef.current = updated?.notes ?? notes;
        setNotesSaveState("saved");
      } catch (error) {
        setNotesSaveState("error");
        showErrorToast(error, {
          title: "Could not save notes",
          fallbackDescription: "Your latest notes were not saved.",
        });
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [notes, opportunity, patchOpportunity, showErrorToast]);

  const status = opportunity?.status ?? "saved";
  const linkedDocumentCount = resumes.length + coverLetters.length;
  if (loading) {
    return <OpportunityDetailSkeleton />;
  }

  if (!opportunity) {
    return (
      <AppPage>
        <PageContent>
          <StandardEmptyState
            icon={XCircle}
            title={a11yT("opportunityNotFound")}
            description="This opportunity may have been deleted or is no longer available."
          />
        </PageContent>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <header className="border-b pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* audit/11: detail-page H1 picks up font-display per
                      the editorial system (CLAUDE.md: "Headings use
                      font-display tracking-tight"). Was inheriting the
                      body font; matches the bento title now.
                      audit/14: text-2xl on mobile, text-3xl on md+ —
                      matches the bento title responsive treatment. */}
                  <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                    {opportunity.title}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {opportunity.company}
                    {opportunity.location ? ` · ${opportunity.location}` : ""}
                  </p>
                </div>
                <OpportunityStatusBadge
                  status={status}
                  className="px-3 py-1 text-sm"
                />
              </div>
            </header>

            <Suspense fallback={<SkeletonCard />}>
              <OpportunityFieldSections
                opportunity={opportunity}
                editingField={editingField}
                savingField={savingField}
                draftValue={draftValue}
                draftChecked={draftChecked}
                onStartEditing={startEditing}
                onDraftValueChange={setDraftValue}
                onDraftCheckedChange={setDraftChecked}
                onSaveField={(field) => void saveField(field)}
                onCancelEditing={cancelEditing}
              />
            </Suspense>

            <Suspense fallback={<SkeletonCard />}>
              <section className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Notes
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {notesSaveState === "saving" && "Saving notes..."}
                    {notesSaveState === "saved" && "Notes saved"}
                    {notesSaveState === "error" && "Notes not saved"}
                  </span>
                </div>
                <div className="p-5">
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={a11yT("addPrivateNotesAboutThisOpportunity")}
                    className="min-h-36"
                  />
                </div>
              </section>
            </Suspense>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Suspense fallback={<SkeletonCard />}>
              <OpportunityActions
                opportunity={opportunity}
                onApply={handleApply}
                onGeneratedDocument={fetchLinkedDocuments}
              />
            </Suspense>

            <Suspense fallback={<SkeletonCard />}>
              <OpportunityContacts opportunityId={opportunity.id} />
            </Suspense>

            <Suspense fallback={<SkeletonCard />}>
              <section className="rounded-lg border bg-card p-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => void handleDismiss()}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </section>

              <section className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Linked Documents
                  </h2>
                  <Badge variant="outline">{linkedDocumentCount}</Badge>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Tailored resumes</h3>
                    <div className="mt-2 space-y-2">
                      {resumes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          None attached
                        </p>
                      ) : (
                        resumes.map((resume) => (
                          <a
                            key={resume.id}
                            href={resume.htmlPath || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                          >
                            <span>
                              Resume
                              {resume.matchScore
                                ? ` · ${Math.round(resume.matchScore)}% match`
                                : ""}
                            </span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Cover letters</h3>
                    <div className="mt-2 space-y-2">
                      {coverLetters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          None attached
                        </p>
                      ) : (
                        coverLetters.map((letter) => (
                          <div
                            key={letter.id}
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            <div className="font-medium">
                              Version {letter.version}
                            </div>
                            <div className="text-muted-foreground">
                              <DocumentDate value={letter.createdAt} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </Suspense>
          </aside>
        </div>
      </PageContent>
    </AppPage>
  );
}
