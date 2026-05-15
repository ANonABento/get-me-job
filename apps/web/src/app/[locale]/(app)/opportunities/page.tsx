"use client";

import { nowIso } from "@/lib/format/time";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  Clipboard,
  FileDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ImportJobDialog } from "@/components/jobs/import-job-dialog";
import { AddOpportunityWizard } from "@/components/opportunities/add-opportunity-wizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  AppPage,
  PageContent,
  PageHeader,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonJobCard, SkeletonKanbanLane } from "@/components/ui/skeleton";
import { VirtualList } from "@/components/ui/virtual-list";
import { showAchievementToasts } from "@/components/streak/achievement-toast";
import { useToast } from "@/components/ui/toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useUndoableAction } from "@/hooks/use-undoable-action";
import { ESTIMATED_CARD_HEIGHT_OPPORTUNITY_ROW } from "@/lib/constants/virtualization";
import { readJsonResponse } from "@/lib/http";
import { extractUnlockedFromResponse } from "@/lib/streak/client";
import { pluralize } from "@/lib/text/pluralize";
import { Link } from "@/i18n/navigation";
import {
  EditorialPanel,
  PasteBox,
  type PasteBoxHandle,
} from "@/components/editorial";
import {
  DEFAULT_KANBAN_VISIBLE_LANES,
  DEFAULT_OPPORTUNITY_FILTERS,
  OPPORTUNITY_SORT_OPTIONS,
  SAMPLE_OPPORTUNITIES,
  countActiveOpportunityFilters,
  filterOpportunities,
  getOpportunitiesViewStorage,
  getOpportunityFiltersFromStatusSearchParam,
  hasActiveOpportunityFilters,
  normalizeKanbanVisibleLanes,
  parseOpportunityStatusSearchParam,
  readOpportunityViewMode,
  writeOpportunityViewMode,
  type KanbanLaneId,
  type Opportunity,
  type OpportunityFilters,
  type OpportunityStatus,
  type OpportunityViewMode,
} from "./utils";
import type { SettingsResponse } from "@/types/api";
import { OpportunitiesEmptyHero } from "./_components/empty-hero";
import { KanbanBoard } from "./_components/kanban-board";
import { OpportunityDrawer } from "./_components/opportunity-drawer";
import { OpportunityRow } from "./_components/opportunity-row";
import { SegmentedToggle } from "./_components/segmented-toggle";
import { StatusTabs, type StatusTabValue } from "./_components/status-tabs";

const STORAGE_KEY = "taida-opportunities";

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

interface UpdateOpportunityResponse {
  opportunity?: Opportunity;
  unlocked?: unknown[];
}

// Tab options for the editorial filter bar. We keep the canonical
// OpportunityStatus enum (8 stages) but only surface the most common ones
// here; the kanban view + the legacy status select still cover the rest.
const STATUS_TAB_VALUES: ReadonlyArray<StatusTabValue> = [
  "all",
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

export default function OpportunitiesPage({
  searchParams = {},
}: {
  searchParams?: { status?: string | string[] };
}) {
  const locale = useLocale();
  const t = useTranslations("opportunities");
  const commonT = useTranslations("common");
  const statusSearchParam = Array.isArray(searchParams.status)
    ? searchParams.status.join(",")
    : searchParams.status;
  const opportunityStatusQuery = useMemo(() => {
    if (!statusSearchParam) return "";
    const params = new URLSearchParams();
    params.set("status", statusSearchParam);
    return params.toString();
  }, [statusSearchParam]);
  const urlStatusFilters = useMemo(
    () => parseOpportunityStatusSearchParam(statusSearchParam),
    [statusSearchParam],
  );
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [filters, setFilters] = useState<OpportunityFilters>(() =>
    getOpportunityFiltersFromStatusSearchParam(statusSearchParam),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<OpportunityViewMode>("list");
  const [visibleKanbanLanes, setVisibleKanbanLanes] = useState<KanbanLaneId[]>([
    ...DEFAULT_KANBAN_VISIBLE_LANES,
  ]);
  const [hasFetched, setHasFetched] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreOpportunities, setHasMoreOpportunities] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [drawerOpportunityId, setDrawerOpportunityId] = useState<string | null>(
    null,
  );
  const [hasCachedData, setHasCachedData] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  });
  const showErrorToast = useErrorToast();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const pasteRef = useRef<PasteBoxHandle | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await fetch(
        opportunityStatusQuery
          ? `/api/opportunities?${opportunityStatusQuery}`
          : "/api/opportunities",
      );
      const data = await readJsonResponse<OpportunitiesResponse>(
        response,
        "Failed to load opportunities",
      );
      if (data.opportunities) {
        setOpportunities(data.opportunities);
        setNextCursor(data.nextCursor ?? null);
        setHasMoreOpportunities(Boolean(data.hasMore));
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(data.opportunities),
        );
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load opportunities",
        fallbackDescription: "Showing locally saved opportunities instead.",
      });
    } finally {
      setHasFetched(true);
    }
  }, [opportunityStatusQuery, showErrorToast]);

  const loadMoreOpportunities = useCallback(async () => {
    if (!nextCursor) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/opportunities?${new URLSearchParams({
          ...(statusSearchParam ? { status: statusSearchParam } : {}),
          cursor: nextCursor,
        }).toString()}`,
      );
      const data = await readJsonResponse<OpportunitiesResponse>(
        response,
        "Failed to load more opportunities",
      );
      setOpportunities((current) => [
        ...current,
        ...(data.opportunities ?? []),
      ]);
      setNextCursor(data.nextCursor ?? null);
      setHasMoreOpportunities(Boolean(data.hasMore));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load more opportunities",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, showErrorToast, statusSearchParam]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Opportunity[];
      if (Array.isArray(parsed)) {
        setOpportunities(parsed);
        setHasCachedData(true);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setHasCachedData(false);
    }
  }, []);

  useEffect(() => {
    setViewMode(readOpportunityViewMode(getOpportunitiesViewStorage()));
    void fetchOpportunities();
  }, [fetchOpportunities]);

  useEffect(() => {
    setFilters(getOpportunityFiltersFromStatusSearchParam(statusSearchParam));
  }, [statusSearchParam]);

  useEffect(() => {
    async function fetchKanbanSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await readJsonResponse<SettingsResponse>(
          response,
          "Failed to load kanban lane settings",
        );
        setVisibleKanbanLanes(
          normalizeKanbanVisibleLanes(data.kanbanVisibleLanes ?? null),
        );
      } catch (error) {
        showErrorToast(error, {
          title: "Could not load kanban lane settings",
          fallbackDescription: "Showing the default pipeline lanes.",
        });
      }
    }

    void fetchKanbanSettings();
  }, [showErrorToast]);

  const filteredOpportunities = useMemo(
    () => filterOpportunities(opportunities, filters, urlStatusFilters),
    [opportunities, filters, urlStatusFilters],
  );

  const counts = useMemo(() => {
    const base: Record<StatusTabValue, number> = {
      all: opportunities.length,
      pending: 0,
      saved: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      expired: 0,
      dismissed: 0,
    };
    for (const opp of opportunities) {
      if (opp.status in base) {
        base[opp.status] = (base[opp.status] ?? 0) + 1;
      }
    }
    return base;
  }, [opportunities]);

  // Pending opportunities are the inbound review queue. The link in the
  // page head is suppressed when there's nothing to review.
  const reviewQueueCount = counts.pending;

  const activeFilterCount = countActiveOpportunityFilters(filters);
  const hasActiveFilters = hasActiveOpportunityFilters(filters);

  const drawerOpportunity = useMemo(
    () =>
      drawerOpportunityId
        ? (opportunities.find((opp) => opp.id === drawerOpportunityId) ?? null)
        : null,
    [opportunities, drawerOpportunityId],
  );

  function updateFilter<T extends keyof OpportunityFilters>(
    key: T,
    value: OpportunityFilters[T],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_OPPORTUNITY_FILTERS);
  }

  function handleViewModeChange(mode: OpportunityViewMode) {
    setViewMode(mode);
    writeOpportunityViewMode(getOpportunitiesViewStorage(), mode);
  }

  function saveOpportunities(nextOpportunities: Opportunity[]) {
    setOpportunities(nextOpportunities);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOpportunities));
  }

  async function persistStatusChange(
    opportunityId: string,
    status: OpportunityStatus,
  ) {
    const response = await fetch(
      `/api/opportunities/${encodeURIComponent(opportunityId)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    return readJsonResponse<UpdateOpportunityResponse>(
      response,
      "Failed to update opportunity status",
    );
  }

  async function handleStatusChange(
    opportunityId: string,
    status: OpportunityStatus,
  ) {
    const previousOpportunity = opportunities.find(
      (opportunity) => opportunity.id === opportunityId,
    );
    const nextOpportunities = opportunities.map((opportunity) =>
      opportunity.id === opportunityId
        ? { ...opportunity, status, updatedAt: nowIso() }
        : opportunity,
    );

    saveOpportunities(nextOpportunities);

    try {
      const data = await persistStatusChange(opportunityId, status);

      if (data.opportunity) {
        saveOpportunities(
          nextOpportunities.map((opportunity) =>
            opportunity.id === opportunityId ? data.opportunity! : opportunity,
          ),
        );
      }
      showAchievementToasts(extractUnlockedFromResponse(data), addToast);
    } catch (error) {
      if (previousOpportunity) {
        setOpportunities((current) => {
          const rolledBackOpportunities = current.map((opportunity) =>
            opportunity.id === opportunityId && opportunity.status === status
              ? previousOpportunity
              : opportunity,
          );
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(rolledBackOpportunities),
          );
          return rolledBackOpportunities;
        });
      }
      showErrorToast(error, {
        title: "Could not update opportunity",
        fallbackDescription: "The status change was not saved.",
      });
    }
  }

  // Reversible archive: status flips to `dismissed`. Wraps both directions
  // in `useUndoableAction` so the toast offers an Undo within 5s, per the
  // destructive-actions pattern (B — optimistic undo snackbar).
  const archiveOpportunity = useUndoableAction<{
    opportunity: Opportunity;
  }>({
    action: async ({ opportunity }) => {
      await handleStatusChange(opportunity.id, "dismissed");
    },
    undoAction: async ({ opportunity }) => {
      await handleStatusChange(opportunity.id, opportunity.status);
    },
    message: "Opportunity archived",
    description: "Undo to restore it to your active list.",
  });

  async function handleArchive(opportunity: Opportunity) {
    if (opportunity.status === "dismissed") return;
    await archiveOpportunity({ opportunity });
  }

  async function handleShowKanbanLane(lane: KanbanLaneId) {
    const previousVisibleLanes = visibleKanbanLanes;
    const nextVisibleLanes = normalizeKanbanVisibleLanes([
      ...visibleKanbanLanes,
      lane,
    ]);

    setVisibleKanbanLanes(nextVisibleLanes);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanbanVisibleLanes: nextVisibleLanes }),
      });
      await readJsonResponse<unknown>(
        response,
        "Failed to save kanban lane settings",
      );
    } catch (error) {
      setVisibleKanbanLanes(previousVisibleLanes);
      showErrorToast(error, {
        title: "Could not update kanban lanes",
        fallbackDescription: "The lane visibility change was not saved.",
      });
    }
  }

  // PasteBox submit handler. If the input looks like a URL, hand off to the
  // existing scrape endpoint; otherwise open the Add wizard with the
  // pasted JD prefilled. The wizard already handles auth, scoring, and
  // persistence — we don't reinvent that pipeline here.
  async function handlePasteSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const looksLikeUrl = /^https?:\/\//i.test(trimmed);
    if (!looksLikeUrl) {
      // TODO(opportunities-paste): wire JD-text -> /api/opportunities/analyze
      // once the unauth analyze endpoint exists. For now we route into the
      // existing wizard with the pasted text as a starting point.
      setIsFormOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/opportunities/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      await readJsonResponse<unknown>(response, "Failed to scrape opportunity");
      addToast({
        type: "info",
        title: "Opportunity captured",
        description: "Review it in your queue to confirm the details.",
      });
      pasteRef.current?.clear();
      await fetchOpportunities();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not import that URL",
        fallbackDescription:
          "Double-check the link or paste the JD text directly.",
      });
    }
  }

  function getOpportunityKey(opportunity: Opportunity): string {
    return opportunity.id;
  }

  function renderOpportunityRow({ item: opportunity }: { item: Opportunity }) {
    return (
      <OpportunityRow
        opportunity={opportunity}
        onOpen={(opp) => setDrawerOpportunityId(opp.id)}
        onArchive={(opp) => {
          void confirm({
            title: "Archive this opportunity?",
            description:
              "It will move out of your active list. You can restore it from the toast that appears.",
            confirmLabel: "Archive",
            confirmVariant: "outline",
          }).then((confirmed) => {
            if (confirmed) {
              void handleArchive(opp);
            }
          });
        }}
        locale={locale}
      />
    );
  }

  const tabOptions = STATUS_TAB_VALUES.map((value) => ({
    value,
    label: value === "all" ? t("status.all") : t(`status.${value}` as const),
    count: counts[value] ?? 0,
  }));

  const activeTab: StatusTabValue =
    filters.status === "all" ? "all" : filters.status;

  return (
    <AppPage>
      <PageHeader
        icon={Sparkles}
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedToggle
              ariaLabel={t("viewMode")}
              options={[
                { value: "list", label: t("list"), icon: List },
                { value: "kanban", label: t("kanban"), icon: LayoutGrid },
              ]}
              value={viewMode}
              onChange={handleViewModeChange}
            />
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <FileDown className="mr-2 h-4 w-4" />
              {commonT("import")}
            </Button>
            <Button variant="gradient" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addOpportunity")}
            </Button>
          </div>
        }
      />

      <PageContent className="space-y-5">
        {reviewQueueCount > 0 ? (
          <div className="flex justify-end">
            <Link
              href="/opportunities/review"
              className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-2.5 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:border-rule-strong hover:text-ink"
              style={{ borderRadius: "var(--r-sm)" }}
            >
              {pluralize(reviewQueueCount, "opportunity", "opportunities")} in
              review queue
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}

        {opportunities.length === 0 ? (
          <OpportunitiesEmptyHero
            onAdd={() => setIsFormOpen(true)}
            onImport={() => setIsImportOpen(true)}
          />
        ) : viewMode === "kanban" ? (
          <Suspense fallback={<OpportunitiesKanbanBodySkeleton />}>
            {!hasFetched && !hasCachedData ? (
              <OpportunitiesKanbanBodySkeleton />
            ) : (
              <div data-testid="opportunities-list">
                <KanbanBoard
                  opportunities={filteredOpportunities}
                  visibleLanes={visibleKanbanLanes}
                  onStatusChange={(opportunityId, status) =>
                    void handleStatusChange(opportunityId, status)
                  }
                  onShowLane={(lane) => void handleShowKanbanLane(lane)}
                />
              </div>
            )}
          </Suspense>
        ) : (
          <>
            <PasteBox
              ref={pasteRef}
              icon={Clipboard}
              title="Paste a job description"
              subtitle="Slothing scores it against your profile and drafts a tailored resume in seconds."
              submitLabel="Analyze match"
              onSubmit={(value) => void handlePasteSubmit(value)}
            />

            <div
              className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
              data-testid="opportunities-filters"
            >
              <StatusTabs
                ariaLabel={t("filters.status")}
                options={tabOptions}
                value={activeTab}
                onChange={(value) =>
                  updateFilter(
                    "status",
                    (value === "all"
                      ? "all"
                      : value) as OpportunityFilters["status"],
                  )
                }
              />

              <div className="grid gap-2 sm:grid-cols-[minmax(200px,1fr)_180px] xl:w-[460px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                  <Input
                    value={filters.searchQuery}
                    onChange={(event) =>
                      updateFilter("searchQuery", event.target.value)
                    }
                    placeholder={t("filters.searchPlaceholder")}
                    className="pl-8"
                    aria-label={t("filters.searchAria")}
                  />
                </div>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter(
                      "sortBy",
                      value as OpportunityFilters["sortBy"],
                    )
                  }
                >
                  <SelectTrigger aria-label={t("filters.sortAria")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t("filters.sortBy", {
                          label: translateOpportunityOption(t, option.label),
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {pluralize(activeFilterCount, "filter")} active
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  {commonT("clearAll")}
                </Button>
              </div>
            ) : null}

            <div className="text-sm text-ink-3">
              {t("summary", {
                shown: filteredOpportunities.length,
                total: opportunities.length,
              })}
            </div>

            <Suspense fallback={<OpportunitiesListBodySkeleton />}>
              {!hasFetched && !hasCachedData ? (
                <OpportunitiesListBodySkeleton />
              ) : filteredOpportunities.length === 0 ? (
                <EditorialPanel className="p-6">
                  <StandardEmptyState
                    icon={Briefcase}
                    title={t("empty.noMatchesTitle")}
                    description={t("empty.noMatchesDescription")}
                    action={
                      <Button variant="outline" onClick={clearFilters}>
                        {t("empty.clearFilters")}
                      </Button>
                    }
                  />
                </EditorialPanel>
              ) : (
                <div data-testid="opportunities-list" className="space-y-2.5">
                  <VirtualList
                    items={filteredOpportunities}
                    getKey={getOpportunityKey}
                    estimateSize={ESTIMATED_CARD_HEIGHT_OPPORTUNITY_ROW}
                    className="max-h-[calc(100vh-26rem)]"
                    itemClassName="pb-2.5"
                    renderItem={renderOpportunityRow}
                  />
                  {hasMoreOpportunities ? (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => void loadMoreOpportunities()}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore
                          ? "Loading..."
                          : "Load more opportunities"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </Suspense>
          </>
        )}
      </PageContent>

      <OpportunityDrawer
        opportunity={drawerOpportunity}
        onClose={() => setDrawerOpportunityId(null)}
        onStatusChange={(opp, status) =>
          void handleStatusChange(opp.id, status)
        }
        locale={locale}
      />

      <AddOpportunityWizard
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSaved={fetchOpportunities}
      />

      <ImportJobDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onJobImported={fetchOpportunities}
      />

      {confirmDialog}
    </AppPage>
  );
}

function OpportunitiesListBodySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonJobCard key={index} />
      ))}
    </div>
  );
}

function OpportunitiesKanbanBodySkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonKanbanLane key={index} cards={index === 0 ? 3 : 1} />
      ))}
    </div>
  );
}

function translateOpportunityOption(
  t: (key: string) => string,
  label: string,
): string {
  const keyByLabel: Record<string, string> = {
    Deadline: "sort.deadline",
    "Date scraped": "sort.scrapedAt",
    Company: "sort.company",
    Salary: "sort.salary",
  };

  const key = keyByLabel[label];
  return key ? t(key) : label;
}
