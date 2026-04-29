"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Briefcase,
  CalendarClock,
  DollarSign,
  ExternalLink,
  Filter,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
  DEFAULT_OPPORTUNITY_FILTERS,
  OPPORTUNITY_SORT_OPTIONS,
  OPPORTUNITY_SOURCE_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
  REMOTE_TYPE_OPTIONS,
  SAMPLE_OPPORTUNITIES,
  filterOpportunities,
  formatOpportunityLocation,
  formatOpportunitySalary,
  getOpportunityFilterOptions,
  hasActiveOpportunityFilters,
  parseOptionalNumber,
  splitDelimitedList,
  trimToUndefined,
  type Opportunity,
  type OpportunityFilters,
  type OpportunitySource,
  type OpportunityStatus,
  type OpportunityType,
  type OpportunityTypeTab,
  type RemoteType,
} from "./utils";

const STORAGE_KEY = "taida-opportunities";

interface OpportunityFormState {
  type: OpportunityType;
  title: string;
  company: string;
  source: OpportunitySource;
  sourceUrl: string;
  city: string;
  province: string;
  country: string;
  remoteType: RemoteType;
  status: OpportunityStatus;
  deadline: string;
  summary: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  tags: string;
  techStack: string;
  requiredSkills: string;
  jobType: NonNullable<Opportunity["jobType"]>;
  level: NonNullable<Opportunity["level"]>;
  prizes: string;
  tracks: string;
  teamMin: string;
  teamMax: string;
  submissionUrl: string;
}

const DEFAULT_FORM_STATE: OpportunityFormState = {
  type: "job",
  title: "",
  company: "",
  source: "manual",
  sourceUrl: "",
  city: "",
  province: "",
  country: "",
  remoteType: "remote",
  status: "saved",
  deadline: "",
  summary: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "USD",
  tags: "",
  techStack: "",
  requiredSkills: "",
  jobType: "full-time",
  level: "intermediate",
  prizes: "",
  tracks: "",
  teamMin: "",
  teamMax: "",
  submissionUrl: "",
};

const typeTabs: { value: OpportunityTypeTab; label: string }[] = [
  { value: "job", label: "Jobs" },
  { value: "hackathon", label: "Hackathons" },
  { value: "all", label: "All" },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [filters, setFilters] = useState<OpportunityFilters>(DEFAULT_OPPORTUNITY_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<OpportunityFormState>(DEFAULT_FORM_STATE);

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

  const filteredOpportunities = useMemo(
    () => filterOpportunities(opportunities, filters),
    [opportunities, filters]
  );

  const filterOptions = useMemo(
    () => getOpportunityFilterOptions(opportunities),
    [opportunities]
  );

  const counts = useMemo(
    () => ({
      all: opportunities.length,
      job: opportunities.filter((opportunity) => opportunity.type === "job").length,
      hackathon: opportunities.filter((opportunity) => opportunity.type === "hackathon").length,
      pending: opportunities.filter((opportunity) => opportunity.status === "pending").length,
    }),
    [opportunities]
  );

  const hasActiveFilters = hasActiveOpportunityFilters(filters);

  function updateFilter<T extends keyof OpportunityFilters>(key: T, value: OpportunityFilters[T]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateForm<T extends keyof OpportunityFormState>(key: T, value: OpportunityFormState[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_OPPORTUNITY_FILTERS);
  }

  function saveOpportunities(nextOpportunities: Opportunity[]) {
    setOpportunities(nextOpportunities);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOpportunities));
  }

  function handleAddOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const nextOpportunity: Opportunity = {
      id: window.crypto?.randomUUID?.() ?? `opp-${now}`,
      type: form.type,
      title: form.title.trim(),
      company: form.company.trim(),
      source: form.source,
      sourceUrl: trimToUndefined(form.sourceUrl),
      city: trimToUndefined(form.city),
      province: trimToUndefined(form.province),
      country: trimToUndefined(form.country),
      remoteType: form.remoteType,
      summary: form.summary.trim(),
      requiredSkills: splitDelimitedList(form.requiredSkills),
      techStack: splitDelimitedList(form.techStack),
      salaryMin: parseOptionalNumber(form.salaryMin),
      salaryMax: parseOptionalNumber(form.salaryMax),
      salaryCurrency: form.salaryCurrency.trim() || "USD",
      deadline: form.deadline || undefined,
      status: form.status,
      scrapedAt: now,
      tags: splitDelimitedList(form.tags),
      createdAt: now,
      updatedAt: now,
      ...(form.type === "job"
        ? {
            jobType: form.jobType,
            level: form.level,
          }
        : {
            prizes: splitDelimitedList(form.prizes),
            tracks: splitDelimitedList(form.tracks),
            teamSize:
              form.teamMin || form.teamMax
                ? {
                    min: Number(form.teamMin || form.teamMax),
                    max: Number(form.teamMax || form.teamMin),
                  }
                : undefined,
            submissionUrl: trimToUndefined(form.submissionUrl),
          }),
    };

    saveOpportunities([nextOpportunity, ...opportunities]);
    setForm(DEFAULT_FORM_STATE);
    setIsFormOpen(false);
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
                  Review saved opportunities, compare fit signals, and keep application work moving from one list.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Stat label="Total" value={counts.all} />
              <Stat label="Jobs" value={counts.job} />
              <Stat label="Hackathons" value={counts.hackathon} />
              <Stat label="Pending" value={counts.pending} />
              <Button variant="gradient" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr]">
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
              <Label htmlFor="opportunity-status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter("status", value as OpportunityFilters["status"])}>
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
              <Select value={filters.source} onValueChange={(value) => updateFilter("source", value as OpportunityFilters["source"])}>
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
              <Select value={filters.tag} onValueChange={(value) => updateFilter("tag", value)}>
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
              <Select value={filters.remoteType} onValueChange={(value) => updateFilter("remoteType", value as OpportunityFilters["remoteType"])}>
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
              <Select value={filters.techStack} onValueChange={(value) => updateFilter("techStack", value)}>
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

        <main className="min-w-0 px-5 py-6 sm:px-8">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex w-full rounded-lg border bg-card p-1 sm:w-auto">
              {typeTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => updateFilter("typeTab", tab.value)}
                  className={cn(
                    "min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none",
                    filters.typeTab === tab.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                  onChange={(event) => updateFilter("searchQuery", event.target.value)}
                  placeholder="Search title, company, skills"
                  className="pl-9"
                  aria-label="Search opportunities"
                />
              </div>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value as OpportunityFilters["sortBy"])}>
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
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityRow key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Opportunity</DialogTitle>
            <DialogDescription>
              Create a job or hackathon entry for the opportunity bank.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleAddOpportunity}>
            <div className="inline-flex rounded-lg border bg-muted/40 p-1">
              {(["job", "hackathon"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateForm("type", type)}
                  className={cn(
                    "min-h-10 rounded-md px-4 text-sm font-medium capitalize transition-colors",
                    form.type === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" id="opportunity-title">
                <Input id="opportunity-title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} required />
              </Field>
              <Field label={form.type === "job" ? "Company" : "Organizer"} id="opportunity-company">
                <Input id="opportunity-company" value={form.company} onChange={(event) => updateForm("company", event.target.value)} required />
              </Field>
              <Field label="Source" id="opportunity-form-source">
                <Select value={form.source} onValueChange={(value) => updateForm("source", value as OpportunitySource)}>
                  <SelectTrigger id="opportunity-form-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_SOURCE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" id="opportunity-form-status">
                <Select value={form.status} onValueChange={(value) => updateForm("status", value as OpportunityStatus)}>
                  <SelectTrigger id="opportunity-form-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Source URL" id="opportunity-source-url">
                <Input id="opportunity-source-url" value={form.sourceUrl} onChange={(event) => updateForm("sourceUrl", event.target.value)} />
              </Field>
              <Field label="Deadline" id="opportunity-deadline">
                <Input id="opportunity-deadline" type="date" value={form.deadline} onChange={(event) => updateForm("deadline", event.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Field label="City" id="opportunity-city">
                <Input id="opportunity-city" value={form.city} onChange={(event) => updateForm("city", event.target.value)} />
              </Field>
              <Field label="Province" id="opportunity-province">
                <Input id="opportunity-province" value={form.province} onChange={(event) => updateForm("province", event.target.value)} />
              </Field>
              <Field label="Country" id="opportunity-country">
                <Input id="opportunity-country" value={form.country} onChange={(event) => updateForm("country", event.target.value)} />
              </Field>
              <Field label="Remote type" id="opportunity-form-remote">
                <Select value={form.remoteType} onValueChange={(value) => updateForm("remoteType", value as RemoteType)}>
                  <SelectTrigger id="opportunity-form-remote">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMOTE_TYPE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {form.type === "job" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Job type" id="opportunity-job-type">
                  <Select value={form.jobType} onValueChange={(value) => updateForm("jobType", value as OpportunityFormState["jobType"])}>
                    <SelectTrigger id="opportunity-job-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["co-op", "full-time", "part-time", "contract", "internship"].map((jobType) => (
                        <SelectItem key={jobType} value={jobType}>
                          {jobType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Level" id="opportunity-level">
                  <Select value={form.level} onValueChange={(value) => updateForm("level", value as OpportunityFormState["level"])}>
                    <SelectTrigger id="opportunity-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["junior", "intermediate", "senior", "staff"].map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Prizes" id="opportunity-prizes">
                  <Input id="opportunity-prizes" value={form.prizes} onChange={(event) => updateForm("prizes", event.target.value)} />
                </Field>
                <Field label="Tracks" id="opportunity-tracks">
                  <Input id="opportunity-tracks" value={form.tracks} onChange={(event) => updateForm("tracks", event.target.value)} />
                </Field>
                <Field label="Team min" id="opportunity-team-min">
                  <Input id="opportunity-team-min" type="number" min="1" value={form.teamMin} onChange={(event) => updateForm("teamMin", event.target.value)} />
                </Field>
                <Field label="Team max" id="opportunity-team-max">
                  <Input id="opportunity-team-max" type="number" min="1" value={form.teamMax} onChange={(event) => updateForm("teamMax", event.target.value)} />
                </Field>
                <Field label="Submission URL" id="opportunity-submission-url" className="md:col-span-2">
                  <Input id="opportunity-submission-url" value={form.submissionUrl} onChange={(event) => updateForm("submissionUrl", event.target.value)} />
                </Field>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Salary min" id="opportunity-salary-min">
                <Input id="opportunity-salary-min" type="number" min="0" value={form.salaryMin} onChange={(event) => updateForm("salaryMin", event.target.value)} />
              </Field>
              <Field label="Salary max" id="opportunity-salary-max">
                <Input id="opportunity-salary-max" type="number" min="0" value={form.salaryMax} onChange={(event) => updateForm("salaryMax", event.target.value)} />
              </Field>
              <Field label="Currency" id="opportunity-currency">
                <Input id="opportunity-currency" value={form.salaryCurrency} onChange={(event) => updateForm("salaryCurrency", event.target.value.toUpperCase())} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Tags" id="opportunity-tags">
                <Input id="opportunity-tags" value={form.tags} onChange={(event) => updateForm("tags", event.target.value)} />
              </Field>
              <Field label="Tech stack" id="opportunity-tech-stack">
                <Input id="opportunity-tech-stack" value={form.techStack} onChange={(event) => updateForm("techStack", event.target.value)} />
              </Field>
              <Field label="Required skills" id="opportunity-required-skills">
                <Input id="opportunity-required-skills" value={form.requiredSkills} onChange={(event) => updateForm("requiredSkills", event.target.value)} />
              </Field>
            </div>

            <Field label="Summary" id="opportunity-summary">
              <Textarea id="opportunity-summary" value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} required className="min-h-28" />
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Add Opportunity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  const isHackathon = opportunity.type === "hackathon";

  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isHackathon ? "warning" : "info"} className="capitalize">
              {isHackathon ? "Hackathon" : "Job"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {opportunity.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{opportunity.source}</span>
          </div>

          <div>
            <h2 className="break-words text-xl font-semibold tracking-normal text-foreground">
              {opportunity.title}
            </h2>
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
          <Meta icon={CalendarClock} value={opportunity.deadline ? `Due ${formatDate(opportunity.deadline)}` : "No deadline"} />
          <Meta icon={DollarSign} value={formatOpportunitySalary(opportunity)} />
          {isHackathon && opportunity.teamSize && (
            <Meta icon={Trophy} value={`Team ${opportunity.teamSize.min}-${opportunity.teamSize.max}`} />
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-lg border bg-background px-3 py-2 text-center">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
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

function Meta({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="flex min-h-9 items-center gap-2 rounded-md bg-muted/60 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
