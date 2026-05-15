"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ClipboardList,
  Copy,
  CopyPlus,
  Edit3,
  ExternalLink,
  History,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { TimeAgo } from "@/components/format/time-ago";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { StandardEmptyState } from "@/components/ui/page-layout";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { VirtualGrid } from "@/components/ui/virtual-list";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  isExtensionSourced,
  getAnswerSourceLabel,
  type AnswerBankSource,
  type AnswerBankEntry,
} from "@/lib/answers/answer-bank";
import {
  ANSWER_COMPONENT_LABELS,
  ANSWER_COMPONENT_TYPES,
  classifyAnswerComponent,
  type AnswerComponentType,
} from "@/lib/answers/answer-components";
import { nowIso, toNullableEpoch } from "@/lib/format/time";
import {
  BANK_GRID_GAP_PX,
  ESTIMATED_CARD_HEIGHT_ANSWER,
  MIN_ANSWER_COLUMN_WIDTH_PX,
} from "@/lib/constants/virtualization";
import {
  THEME_CONTROL_CLASSES,
  THEME_INTERACTIVE_SURFACE_CLASSES,
} from "@/lib/theme/component-classes";
import { cn } from "@/lib/utils";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface AnswerFormState {
  question: string;
  answer: string;
  sourceCompany: string;
  sourceUrl: string;
}

interface AnswerVersion {
  id: string;
  answerId: string;
  version: number;
  question: string;
  answer: string;
  sourceUrl: string | null;
  sourceCompany: string | null;
  createdAt: string | null;
}

interface MigrationSummary {
  migratedToProfile: Array<{ id: string; question: string; field?: string }>;
  reclassified: Array<{ id: string; question: string; field?: string }>;
  skipped: Array<{ id: string; question: string; field?: string }>;
}

type AnswerSort = "most_used" | "newest" | "alpha";
type SourceFilter = "all" | AnswerBankSource;

const EMPTY_FORM: AnswerFormState = {
  question: "",
  answer: "",
  sourceCompany: "",
  sourceUrl: "",
};

function entryToForm(entry: AnswerBankEntry): AnswerFormState {
  return {
    question: entry.question,
    answer: entry.answer,
    sourceCompany: entry.sourceCompany || "",
    sourceUrl: entry.sourceUrl || "",
  };
}

interface AnswersTabProps {
  onSourceFilterChange?: (filter: SourceFilter) => void;
  externalSourceFilter?: SourceFilter | null;
  onSourceCountsChange?: (counts: {
    all: number;
    manual: number;
    extension: number;
    curated: number;
  }) => void;
  onAddAnswerHandleChange?: (handler: () => void) => void;
}

export function BankAnswersTab({
  onSourceFilterChange,
  externalSourceFilter,
  onSourceCountsChange,
  onAddAnswerHandleChange,
}: AnswersTabProps = {}) {
  const a11yT = useA11yTranslations();

  const [answers, setAnswers] = useState<AnswerBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<AnswerComponentType | "all">(
    "all",
  );
  const [activeSource, setActiveSource] = useState<SourceFilter>("all");
  const [sort, setSort] = useState<AnswerSort>("most_used");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreAnswers, setHasMoreAnswers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AnswerBankEntry | null>(
    null,
  );
  const [form, setForm] = useState<AnswerFormState>(EMPTY_FORM);
  const [versions, setVersions] = useState<AnswerVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [dialogTab, setDialogTab] = useState<"edit" | "history">("edit");
  const [migrationSummary, setMigrationSummary] =
    useState<MigrationSummary | null>(null);
  const { addToast } = useToast();
  const showErrorToast = useErrorToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const fetchAnswers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/answer-bank");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch answers");
      setAnswers(data.answers || []);
      setNextCursor(data.nextCursor ?? null);
      setHasMoreAnswers(Boolean(data.hasMore));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreAnswers = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/answer-bank?cursor=${encodeURIComponent(nextCursor)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch answers");
      setAnswers((current) => [...current, ...(data.answers || [])]);
      setNextCursor(data.nextCursor ?? null);
      setHasMoreAnswers(Boolean(data.hasMore));
    } catch (err) {
      showErrorToast(err, {
        title: "Could not load more answers",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, showErrorToast]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  useEffect(() => {
    const key = "taida:answer-bank:pf-migration:done";
    if (typeof window === "undefined" || window.localStorage.getItem(key)) {
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/answer-bank/migrate-personal-facts", {
          method: "POST",
        });
        const data = (await res.json()) as MigrationSummary;
        if (!res.ok) throw new Error("Failed to migrate personal facts");
        window.localStorage.setItem(key, nowIso());
        if (
          data.migratedToProfile.length > 0 ||
          data.reclassified.length > 0 ||
          data.skipped.length > 0
        ) {
          setMigrationSummary(data);
          await fetchAnswers();
        }
      } catch {
        // Non-blocking: users can still manage answers if the cleanup check fails.
      }
    })();
  }, [fetchAnswers]);

  const filteredAnswers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const typeFiltered =
      activeType === "all"
        ? answers
        : answers.filter(
            (entry) => classifyAnswerComponent(entry) === activeType,
          );
    const sourceFiltered =
      activeSource === "all"
        ? typeFiltered
        : typeFiltered.filter((entry) => entry.source === activeSource);
    const searched = !normalized
      ? sourceFiltered
      : sourceFiltered.filter((entry) =>
          [entry.question, entry.answer, entry.sourceCompany, entry.sourceUrl]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalized)),
        );

    return [...searched].sort((a, b) => {
      if (sort === "newest") {
        return (
          (toNullableEpoch(b.updatedAt ?? b.createdAt) ?? 0) -
          (toNullableEpoch(a.updatedAt ?? a.createdAt) ?? 0)
        );
      }
      if (sort === "alpha") return a.question.localeCompare(b.question);
      return b.timesUsed - a.timesUsed;
    });
  }, [activeSource, activeType, answers, query, sort]);

  const stats = useMemo(() => {
    const totalUses = answers.reduce((sum, entry) => sum + entry.timesUsed, 0);
    const sourceCount = new Set(
      answers
        .map((entry) => entry.sourceCompany || entry.sourceUrl)
        .filter(Boolean),
    ).size;
    return { totalUses, sourceCount };
  }, [answers]);

  const typeCounts = useMemo(() => {
    const counts: Record<AnswerComponentType, number> = {
      repeated_question: 0,
      work_authorization: 0,
      logistics: 0,
      compensation: 0,
      links: 0,
    };
    for (const entry of answers) {
      counts[classifyAnswerComponent(entry)] += 1;
    }
    return counts;
  }, [answers]);

  const sourceCounts = useMemo(() => {
    const counts: Record<AnswerBankSource, number> = {
      manual: 0,
      extension: 0,
      curated: 0,
    };
    for (const entry of answers) {
      counts[entry.source] += 1;
    }
    return counts;
  }, [answers]);

  function openCreateDialog() {
    setEditingEntry(null);
    setForm(EMPTY_FORM);
    setVersions([]);
    setDialogTab("edit");
    setDialogOpen(true);
  }

  function openEditDialog(entry: AnswerBankEntry) {
    setEditingEntry(entry);
    setForm(entryToForm(entry));
    setDialogTab("edit");
    setDialogOpen(true);
    void fetchVersions(entry.id);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    setForm(EMPTY_FORM);
    setVersions([]);
    setDialogTab("edit");
  }

  function updateForm(key: keyof AnswerFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAnswer() {
    if (!form.question.trim() || !form.answer.trim()) {
      addToast({
        type: "warning",
        title: "Question and answer are required",
      });
      return;
    }

    setSaving(true);
    try {
      const method = editingEntry ? "PATCH" : "POST";
      const url = editingEntry
        ? `/api/answer-bank/${editingEntry.id}`
        : "/api/answer-bank";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save answer");

      if (editingEntry) {
        setAnswers((prev) =>
          prev.map((entry) => (entry.id === editingEntry.id ? data : entry)),
        );
        void fetchVersions(editingEntry.id);
      } else {
        setAnswers((prev) => {
          const withoutDuplicate = prev.filter((entry) => entry.id !== data.id);
          return [data, ...withoutDuplicate];
        });
      }

      addToast({
        type: "success",
        title: editingEntry ? "Answer updated" : "Answer saved",
      });
      closeDialog();
    } catch (err) {
      showErrorToast(err, {
        title: "Could not save answer",
        fallbackDescription: "Please try saving it again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnswer(entry: AnswerBankEntry) {
    const confirmed = await confirm({
      title: "Delete answer?",
      description:
        "This removes the saved answer from autofill and your Answer Bank.",
      confirmLabel: "Delete",
      confirmVariant: "destructive",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/answer-bank/${entry.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete answer");

      setAnswers((prev) => prev.filter((item) => item.id !== entry.id));
      addToast({ type: "success", title: "Answer deleted" });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not delete answer",
        fallbackDescription: "Please try deleting it again.",
      });
    }
  }

  async function copyAnswer(entry: AnswerBankEntry) {
    await navigator.clipboard.writeText(entry.answer);
    addToast({ type: "success", title: "Answer copied" });
  }

  async function duplicateAnswer(entry: AnswerBankEntry) {
    try {
      const res = await fetch(`/api/answer-bank/${entry.id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate answer");
      setAnswers((prev) => [data, ...prev]);
      addToast({ type: "success", title: "Answer duplicated" });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not duplicate answer",
        fallbackDescription: "Please try duplicating it again.",
      });
    }
  }

  async function promoteAnswer(entry: AnswerBankEntry) {
    setAnswers((prev) =>
      prev.map((item) =>
        item.id === entry.id ? { ...item, source: "curated" } : item,
      ),
    );

    try {
      const res = await fetch(`/api/answer-bank/${entry.id}/promote`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to promote answer");
      setAnswers((prev) =>
        prev.map((item) => (item.id === entry.id ? data : item)),
      );
      addToast({ type: "success", title: "Answer promoted to curated" });
    } catch (err) {
      setAnswers((prev) =>
        prev.map((item) => (item.id === entry.id ? entry : item)),
      );
      showErrorToast(err, {
        title: "Could not promote answer",
        fallbackDescription: "Please try promoting it again.",
      });
    }
  }

  async function fetchVersions(answerId: string) {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/answer-bank/${answerId}/versions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch history");
      setVersions(data.versions || []);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not load history",
        fallbackDescription: "Please try opening the answer again.",
      });
    } finally {
      setVersionsLoading(false);
    }
  }

  async function restoreVersion(version: AnswerVersion) {
    if (!editingEntry) return;
    try {
      const res = await fetch(
        `/api/answer-bank/${editingEntry.id}/versions/${version.id}/restore`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore version");
      setAnswers((prev) =>
        prev.map((entry) => (entry.id === editingEntry.id ? data : entry)),
      );
      setEditingEntry(data);
      setForm(entryToForm(data));
      setDialogTab("edit");
      await fetchVersions(editingEntry.id);
      addToast({ type: "success", title: "Version restored" });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not restore version",
        fallbackDescription: "Please try restoring it again.",
      });
    }
  }

  // Surface source counts up to the rail.
  useEffect(() => {
    onSourceCountsChange?.({
      all: answers.length,
      manual: sourceCounts.manual,
      extension: sourceCounts.extension,
      curated: sourceCounts.curated,
    });
  }, [answers.length, sourceCounts, onSourceCountsChange]);

  // Allow the umbrella's rail to drive source filter.
  useEffect(() => {
    if (externalSourceFilter == null) return;
    setActiveSource(externalSourceFilter);
  }, [externalSourceFilter]);

  useEffect(() => {
    onSourceFilterChange?.(activeSource);
  }, [activeSource, onSourceFilterChange]);

  // Expose the create-answer handler so the umbrella header can trigger it.
  useEffect(() => {
    onAddAnswerHandleChange?.(openCreateDialog);
    // The handler is stable enough; we want it on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAddAnswerHandleChange]);

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <section className="grid gap-3 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>
        }
      >
        <section className="grid gap-3 md:grid-cols-3">
          <AnswerStat label="Saved answers" value={answers.length} />
          <AnswerStat label="Known sources" value={stats.sourceCount} />
          <AnswerStat label="Autofill uses" value={stats.totalUses} />
        </section>
      </Suspense>

      <Suspense fallback={<SkeletonCard />}>
        <section className="space-y-4">
          <CrossLinkBanner />
          {migrationSummary ? (
            <MigrationBanner
              summary={migrationSummary}
              onDismiss={() => setMigrationSummary(null)}
            />
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={a11yT("searchQuestionsAnswersOrSources")}
                className={cn(THEME_CONTROL_CLASSES, "w-full pl-9")}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredAnswers.length} shown
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AnswerSort)}
              className={cn(THEME_CONTROL_CLASSES, "w-full sm:w-40")}
              aria-label={a11yT("sortAnswers")}
            >
              <option value="most_used">Most used</option>
              <option value="newest">Newest</option>
              <option value="alpha">A to Z</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnswerTypeButton
              active={activeSource === "all"}
              count={answers.length}
              onClick={() => setActiveSource("all")}
            >
              All sources
            </AnswerTypeButton>
            <AnswerTypeButton
              active={activeSource === "manual"}
              count={sourceCounts.manual}
              onClick={() => setActiveSource("manual")}
            >
              Manual
            </AnswerTypeButton>
            <AnswerTypeButton
              active={activeSource === "extension"}
              count={sourceCounts.extension}
              onClick={() => setActiveSource("extension")}
            >
              From extension
            </AnswerTypeButton>
            <AnswerTypeButton
              active={activeSource === "curated"}
              count={sourceCounts.curated}
              onClick={() => setActiveSource("curated")}
            >
              Curated
            </AnswerTypeButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnswerTypeButton
              active={activeType === "all"}
              count={answers.length}
              onClick={() => setActiveType("all")}
            >
              All
            </AnswerTypeButton>
            {ANSWER_COMPONENT_TYPES.map((type) => (
              <AnswerTypeButton
                key={type}
                active={activeType === type}
                count={typeCounts[type]}
                onClick={() => setActiveType(type)}
              >
                {ANSWER_COMPONENT_LABELS[type]}
              </AnswerTypeButton>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title={a11yT("failedToLoadAnswers")}
              message={error}
              onRetry={fetchAnswers}
              variant="card"
            />
          ) : filteredAnswers.length === 0 ? (
            <StandardEmptyState
              icon={ClipboardList}
              title={query ? "No matching answers" : "Start your answer bank"}
              description={
                query
                  ? "Try a different search term."
                  : "Save common responses like work authorization, sponsorship, relocation, portfolio links, and repeated application questions."
              }
              action={
                !query ? (
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Answer
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              <AnswerGrid
                entries={filteredAnswers}
                onCopy={copyAnswer}
                onDuplicate={duplicateAnswer}
                onEdit={openEditDialog}
                onDelete={deleteAnswer}
                onPromote={promoteAnswer}
              />
              {hasMoreAnswers ? (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => void loadMoreAnswers()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load more answers"}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </Suspense>

      <AnswerDialog
        open={dialogOpen}
        editing={!!editingEntry}
        form={form}
        saving={saving}
        versions={versions}
        versionsLoading={versionsLoading}
        tab={dialogTab}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
        onFormChange={updateForm}
        onSave={saveAnswer}
        onTabChange={setDialogTab}
        onRestoreVersion={restoreVersion}
      />
      {confirmDialog}
    </div>
  );
}

function AnswerGrid({
  entries,
  onCopy,
  onDuplicate,
  onEdit,
  onDelete,
  onPromote,
}: {
  entries: AnswerBankEntry[];
  onCopy: (entry: AnswerBankEntry) => void;
  onDuplicate: (entry: AnswerBankEntry) => void;
  onEdit: (entry: AnswerBankEntry) => void;
  onDelete: (entry: AnswerBankEntry) => void;
  onPromote: (entry: AnswerBankEntry) => void;
}) {
  function getAnswerKey(entry: AnswerBankEntry): string {
    return entry.id;
  }

  function renderAnswer({ item: entry }: { item: AnswerBankEntry }) {
    return (
      <AnswerCard
        entry={entry}
        onCopy={onCopy}
        onDuplicate={onDuplicate}
        onEdit={onEdit}
        onDelete={onDelete}
        onPromote={onPromote}
      />
    );
  }

  return (
    <VirtualGrid
      items={entries}
      getKey={getAnswerKey}
      estimateSize={ESTIMATED_CARD_HEIGHT_ANSWER}
      gapPx={BANK_GRID_GAP_PX}
      minColumnWidthPx={MIN_ANSWER_COLUMN_WIDTH_PX}
      className="max-h-[calc(100vh-22rem)]"
      renderItem={renderAnswer}
    />
  );
}

function CrossLinkBanner() {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius)] border bg-card/70 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Personal facts (email, phone, location, links) live in your{" "}
        <Link href="/profile" className="font-medium text-primary underline">
          Profile
        </Link>
        . Use this bank for Q&A like sponsorship, references, why this company,
        etc.
      </span>
      <Button asChild variant="outline" size="sm">
        <Link href="/profile">
          Edit Profile
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function MigrationBanner({
  summary,
  onDismiss,
}: {
  summary: MigrationSummary;
  onDismiss: () => void;
}) {
  const count = summary.migratedToProfile.length;
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-primary/20 bg-primary/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>
        Moved {count} personal {count === 1 ? "fact" : "facts"} into your
        Profile. Please verify the details when you have a moment.
      </span>
      <div className="flex gap-2">
        <Button asChild size="sm">
          <Link href="/profile">Review Profile</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function AnswerStat({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn(THEME_INTERACTIVE_SURFACE_CLASSES, "p-4")}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function AnswerTypeButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0 && !active}
      className={cn(
        "min-h-10 rounded-[var(--radius)] px-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        count === 0 && !active && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
      <span
        className={cn(
          "ml-2 inline-flex min-w-5 justify-center rounded-[var(--radius)] px-1 text-xs",
          active ? "bg-primary-foreground/20" : "bg-background",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function AnswerCard({
  entry,
  onCopy,
  onDuplicate,
  onEdit,
  onDelete,
  onPromote,
}: {
  entry: AnswerBankEntry;
  onCopy: (entry: AnswerBankEntry) => void;
  onDuplicate: (entry: AnswerBankEntry) => void;
  onEdit: (entry: AnswerBankEntry) => void;
  onDelete: (entry: AnswerBankEntry) => void;
  onPromote: (entry: AnswerBankEntry) => void;
}) {
  const a11yT = useA11yTranslations();

  const sourceLabel =
    entry.source === "extension"
      ? "From extension"
      : entry.source === "curated"
        ? "Curated"
        : "Manual";
  const sourceMeta = getAnswerSourceLabel(entry);

  return (
    <article className={cn(THEME_INTERACTIVE_SURFACE_CLASSES, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{sourceLabel}</Badge>
            <Badge variant="outline">
              {ANSWER_COMPONENT_LABELS[classifyAnswerComponent(entry)]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Used {entry.timesUsed}x
            </span>
            {entry.updatedAt ? (
              <span className="text-xs text-muted-foreground">
                Updated <TimeAgo date={entry.updatedAt} />
              </span>
            ) : null}
          </div>
          <h2 className="font-display text-base font-semibold leading-6 tracking-tight">
            {entry.question}
          </h2>
          {sourceMeta !== sourceLabel ? (
            <p className="text-xs text-muted-foreground">
              Source: {sourceMeta}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onCopy(entry)}
            aria-label={a11yT("copyAnswer")}
            title={a11yT("copyAnswer")}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onDuplicate(entry)}
            aria-label={a11yT("duplicateAnswer")}
            title={a11yT("duplicateAnswer")}
          >
            <CopyPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(entry)}
            aria-label={a11yT("editAnswer")}
            title={a11yT("editAnswer")}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onDelete(entry)}
            aria-label={a11yT("deleteAnswer")}
            title={a11yT("deleteAnswer")}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {entry.answer}
      </p>
      {isExtensionSourced(entry) ? (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onPromote(entry)}
          >
            Promote to curated
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function AnswerDialog({
  open,
  editing,
  form,
  saving,
  versions,
  versionsLoading,
  tab,
  onOpenChange,
  onFormChange,
  onSave,
  onTabChange,
  onRestoreVersion,
}: {
  open: boolean;
  editing: boolean;
  form: AnswerFormState;
  saving: boolean;
  versions: AnswerVersion[];
  versionsLoading: boolean;
  tab: "edit" | "history";
  onOpenChange: (open: boolean) => void;
  onFormChange: (key: keyof AnswerFormState, value: string) => void;
  onSave: () => void;
  onTabChange: (tab: "edit" | "history") => void;
  onRestoreVersion: (version: AnswerVersion) => void;
}) {
  const a11yT = useA11yTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit answer" : "Add answer"}</DialogTitle>
          <DialogDescription>
            Save a reusable response for repeated application prompts.
          </DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="flex gap-2">
            <Button
              variant={tab === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange("edit")}
            >
              Edit
            </Button>
            <Button
              variant={tab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange("history")}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        ) : null}

        {tab === "edit" ? (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Question</span>
              <input
                value={form.question}
                onChange={(event) =>
                  onFormChange("question", event.target.value)
                }
                className={cn(THEME_CONTROL_CLASSES, "w-full")}
                placeholder={a11yT("exampleWillYouNowOrInTheFuture")}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Answer</span>
              <textarea
                value={form.answer}
                onChange={(event) => onFormChange("answer", event.target.value)}
                className={cn(
                  THEME_CONTROL_CLASSES,
                  "min-h-36 w-full resize-y",
                )}
                placeholder={a11yT("writeTheAnswerYouWantReusedByAutofill")}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Source company</span>
                <input
                  value={form.sourceCompany}
                  onChange={(event) =>
                    onFormChange("sourceCompany", event.target.value)
                  }
                  className={cn(THEME_CONTROL_CLASSES, "w-full")}
                  placeholder={a11yT("optional")}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Source URL</span>
                <input
                  value={form.sourceUrl}
                  onChange={(event) =>
                    onFormChange("sourceUrl", event.target.value)
                  }
                  className={cn(THEME_CONTROL_CLASSES, "w-full")}
                  placeholder={a11yT("optional")}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {versionsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No previous versions yet. Edits you save from now on will show
                up here.
              </p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-[var(--radius)] border bg-card/50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Version {version.version}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {version.question}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreVersion(version)}
                    >
                      Restore
                    </Button>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                    {version.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "edit" ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editing ? "Save Changes" : "Save Answer"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
