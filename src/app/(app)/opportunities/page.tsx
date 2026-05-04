"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  Briefcase,
  CalendarClock,
  DollarSign,
  ExternalLink,
  FileDown,
  Filter,
  GripVertical,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { ImportJobDialog } from "@/components/jobs/import-job-dialog";
import { AddOpportunityWizard } from "@/components/opportunities/add-opportunity-wizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { cn } from "@/lib/utils";
import {
  DEFAULT_OPPORTUNITY_FILTERS,
  OPPORTUNITY_KANBAN_COLUMNS,
  OPPORTUNITY_SORT_OPTIONS,
  OPPORTUNITY_SOURCE_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
  OPPORTUNITY_TYPE_TAB_OPTIONS,
  REMOTE_TYPE_OPTIONS,
  SAMPLE_OPPORTUNITIES,
  filterOpportunities,
  formatOpportunityDate,
  formatOpportunityLocation,
  formatOpportunitySalary,
  getOpportunitiesViewStorage,
  getOpportunityFilterOptions,
  groupOpportunitiesByStatus,
  hasActiveOpportunityFilters,
  readOpportunityViewMode,
  writeOpportunityViewMode,
  type Opportunity,
  type OpportunityFilters,
  type OpportunitySource,
  type OpportunityStatus,
  type OpportunityViewMode,
} from "./utils";

const STORAGE_KEY = "taida-opportunities";

const GmailImportModal = dynamic(
  () => import("@/components/google").then((module) => module.GmailImportModal),
  { loading: () => <SkeletonButton className="h-10 w-28" />, ssr: false },
);

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
}

interface UpdateOpportunityResponse {
  opportunity?: Opportunity;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [filters, setFilters] = useState<OpportunityFilters>(
    DEFAULT_OPPORTUNITY_FILTERS,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<OpportunityViewMode>("list");
  const showErrorToast = useErrorToast();

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await fetch("/api/opportunities");
      const data = await readJsonResponse<OpportunitiesResponse>(
        response,
        "Failed to load opportunities",
      );
      if (data.opportunities) {
        setOpportunities(data.opportunities);
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
    }
  }, [showErrorToast]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Opportunity[];
      if (Array.isArray(parsed)) setOpportunities(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setViewMode(readOpportunityViewMode(getOpportunitiesViewStorage()));
    void fetchOpportunities();
  }, [fetchOpportunities]);

  const filteredOpportunities = useMemo(
    () => filterOpportunities(opportunities, filters),
    [opportunities, filters],
  );

  const filterOptions = useMemo(
    () => getOpportunityFilterOptions(opportunities),
    [opportunities],
  );

  const counts = useMemo(
    () => ({
      all: opportunities.length,
      job: opportunities.filter((opportunity) => opportunity.type === "job")
        .length,
      hackathon: opportunities.filter(
        (opportunity) => opportunity.type === "hackathon",
      ).length,
      pending: opportunities.filter(
        (opportunity) => opportunity.status === "pending",
      ).length,
    }),
    [opportunities],
  );

  const hasActiveFilters = hasActiveOpportunityFilters(filters);

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

  async function handleStatusChange(
    opportunityId: string,
    status: OpportunityStatus,
  ) {
    const previousOpportunity = opportunities.find(
      (opportunity) => opportunity.id === opportunityId,
    );
    const nextOpportunities = opportunities.map((opportunity) =>
      opportunity.id === opportunityId
        ? { ...opportunity, status, updatedAt: new Date().toISOString() }
        : opportunity,
    );

    saveOpportunities(nextOpportunities);

    try {
      const response = await fetch(
        `/api/opportunities/${encodeURIComponent(opportunityId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = await readJsonResponse<UpdateOpportunityResponse>(
        response,
        "Failed to update opportunity status",
      );

      if (data.opportunity) {
        saveOpportunities(
          nextOpportunities.map((opportunity) =>
            opportunity.id === opportunityId ? data.opportunity! : opportunity,
          ),
        );
      }
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

  async function handleGmailImport(email: {
    subject: string;
    from: string;
    snippet: string;
    parsed?: { role?: string; company?: string };
  }) {
    const jobData = {
      title:
        email.parsed?.role ||
        email.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim(),
      company:
        email.parsed?.company ||
        email.from.split("@")[1]?.split(".")[0] ||
        "Unknown",
      description: email.snippet,
      url: "",
    };

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      await readJsonResponse<unknown>(response, "Failed to create job");
      await fetchOpportunities();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not import Gmail opportunity",
        fallbackDescription: "Please try importing the email again.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/70">
        <div className="px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Opportunity Bank
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
                  Jobs and hackathons
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review saved opportunities, compare fit signals, and keep
                  application work moving from one list.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Stat label="Total" value={counts.all} />
              <Stat label="Job" value={counts.job} />
              <Stat label="Hackathon" value={counts.hackathon} />
              <Stat label="Pending" value={counts.pending} />
              <div
                className="flex rounded-lg border bg-card p-1"
                aria-label="Opportunity view mode"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  aria-pressed={viewMode === "list"}
                  onClick={() => handleViewModeChange("list")}
                  className="h-11"
                >
                  <List className="mr-2 h-4 w-4" />
                  List
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  aria-pressed={viewMode === "kanban"}
                  onClick={() => handleViewModeChange("kanban")}
                  className="h-11"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                Import
              </Button>
              <GmailImportModal
                onImport={(email) => void handleGmailImport(email)}
                trigger={
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Gmail
                  </Button>
                }
              />
              <Button variant="gradient" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "grid",
          viewMode === "list" && "lg:grid-cols-[280px_1fr]",
        )}
      >
        {viewMode === "list" && (
          <aside className="border-b bg-card/45 p-5 lg:min-h-[calc(100vh-145px)] lg:border-b-0 lg:border-r lg:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="opportunity-type">Type</Label>
                <Select
                  value={filters.typeTab}
                  onValueChange={(value) =>
                    updateFilter(
                      "typeTab",
                      value as OpportunityFilters["typeTab"],
                    )
                  }
                >
                  <SelectTrigger id="opportunity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_TYPE_TAB_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter(
                      "status",
                      value as OpportunityFilters["status"],
                    )
                  }
                >
                  <SelectTrigger id="opportunity-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-source">Source</Label>
                <Select
                  value={filters.source}
                  onValueChange={(value) =>
                    updateFilter(
                      "source",
                      value as OpportunityFilters["source"],
                    )
                  }
                >
                  <SelectTrigger id="opportunity-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-tag">Tags</Label>
                <Select
                  value={filters.tag}
                  onValueChange={(value) => updateFilter("tag", value)}
                >
                  <SelectTrigger id="opportunity-tag">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {filterOptions.tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-remote">Remote type</Label>
                <Select
                  value={filters.remoteType}
                  onValueChange={(value) =>
                    updateFilter(
                      "remoteType",
                      value as OpportunityFilters["remoteType"],
                    )
                  }
                >
                  <SelectTrigger id="opportunity-remote">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMOTE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-tech">Tech stack</Label>
                <Select
                  value={filters.techStack}
                  onValueChange={(value) => updateFilter("techStack", value)}
                >
                  <SelectTrigger id="opportunity-tech">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any stack</SelectItem>
                    {filterOptions.techStacks.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>
        )}

        <section
          aria-label="Opportunities list"
          className="min-w-0 px-5 py-6 sm:px-8"
        >
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex w-full rounded-lg border bg-card p-1 sm:w-auto">
              {OPPORTUNITY_TYPE_TAB_OPTIONS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => updateFilter("typeTab", tab.value)}
                  className={cn(
                    "min-h-11 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none",
                    filters.typeTab === tab.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_200px] xl:w-[560px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.searchQuery}
                  onChange={(event) =>
                    updateFilter("searchQuery", event.target.value)
                  }
                  placeholder="Search title, company, skills"
                  className="pl-9"
                  aria-label="Search opportunities"
                />
              </div>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  updateFilter("sortBy", value as OpportunityFilters["sortBy"])
                }
              >
                <SelectTrigger aria-label="Sort opportunities">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      Sort by {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length}
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-center">
              <Briefcase className="mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">No opportunities found</h2>
              <Button variant="outline" className="mt-5" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : viewMode === "kanban" ? (
            <OpportunityKanbanView
              opportunities={filteredOpportunities}
              onStatusChange={(opportunityId, status) =>
                void handleStatusChange(opportunityId, status)
              }
            />
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityRow
                  key={opportunity.id}
                  opportunity={opportunity}
                  onStatusChange={(status) =>
                    void handleStatusChange(opportunity.id, status)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

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
    </div>
  );
}

function OpportunityRow({
  opportunity,
  onStatusChange,
}: {
  opportunity: Opportunity;
  onStatusChange: (status: OpportunityStatus) => void;
}) {
  const isHackathon = opportunity.type === "hackathon";

  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={isHackathon ? "warning" : "info"}
              className="capitalize"
            >
              {isHackathon ? "Hackathon" : "Job"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {opportunity.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {opportunity.source}
            </span>
          </div>

          <div>
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="group inline-flex min-h-11 items-center"
            >
              <h2 className="break-words text-xl font-semibold tracking-normal text-foreground group-hover:text-primary">
                {opportunity.title}
              </h2>
            </Link>
            <div className="mt-1 text-sm font-medium text-muted-foreground">
              {opportunity.company}
            </div>
          </div>

          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            {opportunity.summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {(opportunity.techStack ?? []).slice(0, 5).map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
            {opportunity.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid shrink-0 gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:w-80 xl:grid-cols-1">
          <Meta icon={MapPin} value={formatOpportunityLocation(opportunity)} />
          <Meta
            icon={CalendarClock}
            value={
              opportunity.deadline
                ? `Due ${formatOpportunityDate(opportunity.deadline)}`
                : "No deadline"
            }
          />
          <Meta
            icon={DollarSign}
            value={formatOpportunitySalary(opportunity)}
          />
          <Select
            value={opportunity.status}
            onValueChange={(value) =>
              onStatusChange(value as OpportunityStatus)
            }
          >
            <SelectTrigger
              aria-label={`Update status for ${opportunity.title}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPPORTUNITY_KANBAN_COLUMNS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isHackathon && opportunity.teamSize && (
            <Meta
              icon={Trophy}
              value={`Team ${opportunity.teamSize.min}-${opportunity.teamSize.max}`}
            />
          )}
          {opportunity.sourceUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open source
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function OpportunityKanbanView({
  opportunities,
  onStatusChange,
}: {
  opportunities: Opportunity[];
  onStatusChange: (opportunityId: string, status: OpportunityStatus) => void;
}) {
  const groupedOpportunities = useMemo(
    () => groupOpportunitiesByStatus(opportunities),
    [opportunities],
  );
  const [draggedOpportunityId, setDraggedOpportunityId] = useState<
    string | null
  >(null);

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    opportunityId: string,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", opportunityId);
    setDraggedOpportunityId(opportunityId);
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    status: OpportunityStatus,
  ) {
    event.preventDefault();
    const opportunityId =
      event.dataTransfer.getData("text/plain") || draggedOpportunityId;
    const opportunity = opportunities.find(
      (candidate) => candidate.id === opportunityId,
    );

    setDraggedOpportunityId(null);

    if (!opportunity || opportunity.status === status) return;
    onStatusChange(opportunity.id, status);
  }

  return (
    <div
      className="overflow-x-auto pb-4"
      role="region"
      aria-label="Opportunity kanban board"
      aria-roledescription="kanban board"
      tabIndex={0}
    >
      <div className="grid min-w-[1480px] grid-cols-8 gap-4">
        {OPPORTUNITY_KANBAN_COLUMNS.map((column) => {
          const columnOpportunities = groupedOpportunities[column.value];

          return (
            <section
              key={column.value}
              aria-label={`${column.label} opportunities`}
              className="flex min-h-[560px] flex-col rounded-lg border bg-card/70 p-3"
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => handleDrop(event, column.value)}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{column.label}</h2>
                <Badge variant="secondary" className="shrink-0">
                  {columnOpportunities.length}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {columnOpportunities.length === 0 ? (
                  <div className="grid min-h-28 place-items-center rounded-lg border border-dashed bg-background/50 px-3 text-center text-sm text-muted-foreground">
                    Drop opportunities here
                  </div>
                ) : (
                  columnOpportunities.map((opportunity) => (
                    <OpportunityKanbanCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      isDragging={draggedOpportunityId === opportunity.id}
                      onDragStart={(event) =>
                        handleDragStart(event, opportunity.id)
                      }
                      onDragEnd={() => setDraggedOpportunityId(null)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityKanbanCard({
  opportunity,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  opportunity: Opportunity;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}) {
  const details = [
    formatOpportunityLocation(opportunity),
    opportunity.deadline
      ? `Due ${formatOpportunityDate(opportunity.deadline)}`
      : undefined,
  ].filter(Boolean);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border bg-background p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="group inline-flex min-h-11 items-center"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 group-hover:text-primary">
              {opportunity.title}
            </h3>
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {opportunity.company}
          </p>
        </div>
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <Badge
          variant={opportunity.type === "hackathon" ? "warning" : "info"}
          className="capitalize"
        >
          {opportunity.type}
        </Badge>
        {details.map((detail) => (
          <div key={detail} className="truncate">
            {detail}
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[...(opportunity.techStack ?? []), ...opportunity.tags]
            .slice(0, 4)
            .map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="max-w-full truncate text-[11px]"
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const displayLabel =
    label === "Job" || label === "Hackathon"
      ? pluralizeLabel(value, label)
      : label;

  return (
    <div className="min-w-20 rounded-lg border bg-background px-3 py-2 text-center">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{displayLabel}</div>
    </div>
  );
}

function pluralizeLabel(value: number, singularLabel: string): string {
  return value === 1 ? singularLabel : `${singularLabel}s`;
}

function Field({
  label,
  id,
  className,
  children,
}: {
  label: string;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Meta({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex min-h-9 items-center gap-2 rounded-md bg-muted/60 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}
