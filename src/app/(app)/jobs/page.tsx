"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CoverLetterDialog } from "@/components/cover-letter/cover-letter-dialog";
import { AddJobDialog } from "@/components/jobs/add-job-dialog";
import { JobKanbanView } from "@/components/jobs/job-kanban-view";
import {
  getJobsViewStorage,
  readJobsViewMode,
  writeJobsViewMode,
  type JobsViewMode,
} from "@/components/jobs/job-kanban-utils";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { JobsHero } from "@/components/jobs/jobs-hero";
import { JobCard, type ResumeTemplate } from "@/components/jobs/job-card";
import { ImportJobDialog } from "@/components/jobs/import-job-dialog";
import { JobsNoResults } from "@/components/jobs/jobs-no-results";
import { JobsToolbar } from "@/components/jobs/jobs-toolbar";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonJobCard } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import { readJsonResponse } from "@/lib/http";
import type { JobDescription, JobMatch, JobStatus } from "@/types";
import {
  filterJobs,
  hasActiveJobFilters,
  type JobRemoteFilter,
  type JobSortOption,
  type JobStatusFilter,
  type JobTypeFilter,
} from "./filter-jobs";

const ATSScoreBreakdown = dynamic(
  () =>
    import("@/components/ats/score-breakdown").then(
      (module) => module.ATSScoreBreakdown,
    ),
  {
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />,
  },
);

const FALLBACK_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional format",
  },
  { id: "modern", name: "Modern", description: "Contemporary design" },
  { id: "minimal", name: "Minimal", description: "Clean and simple" },
  {
    id: "executive",
    name: "Executive",
    description: "Bold headers, strong hierarchy",
  },
  { id: "tech", name: "Tech", description: "Tech industry focused" },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colors for creative roles",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout for experienced pros",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Conservative for business",
  },
];

interface JobsResponse {
  jobs?: JobDescription[];
}

interface TemplatesResponse {
  templates?: ResumeTemplate[];
}

interface AnalyzeJobResponse {
  analysis?: JobMatch;
}

interface GenerateResumeResponse {
  pdfUrl?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [atsAnalyzing, setAtsAnalyzing] = useState<string | null>(null);
  const [atsDialogJob, setAtsDialogJob] = useState<string | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<JobDescription | null>(
    null,
  );
  const [expandedDescription, setExpandedDescription] = useState<string | null>(
    null,
  );
  const [analyses, setAnalyses] = useState<Record<string, JobMatch>>({});
  const [atsResults, setAtsResults] = useState<
    Record<string, ATSAnalysisResult>
  >({});
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Record<string, string>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<JobTypeFilter>("all");
  const [remoteFilter, setRemoteFilter] = useState<JobRemoteFilter>("all");
  const [sortBy, setSortBy] = useState<JobSortOption>("newest");
  const [viewMode, setViewMode] = useState<JobsViewMode>("list");
  const showErrorToast = useErrorToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await readJsonResponse<JobsResponse>(
        response,
        "Failed to load jobs",
      );
      setJobs(data.jobs || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load jobs",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs/templates");
      const data = await readJsonResponse<TemplatesResponse>(
        response,
        "Failed to load templates",
      );
      setTemplates(data.templates || []);
    } catch {
      setTemplates(FALLBACK_TEMPLATES);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
    void fetchTemplates();
  }, [fetchJobs, fetchTemplates]);

  useEffect(() => {
    setViewMode(readJobsViewMode(getJobsViewStorage()));
  }, []);

  const handleViewModeChange = (mode: JobsViewMode) => {
    setViewMode(mode);
    writeJobsViewMode(getJobsViewStorage(), mode);
  };

  const deleteJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: "Delete this job?",
      description:
        "This permanently removes the job, notes, status, and linked generated work from this list. This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      await readJsonResponse<unknown>(response, "Failed to delete job");
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not delete job",
        fallbackDescription: "Please try deleting the job again.",
      });
    }
  };

  const updateJobStatus = async (id: string, status: JobStatus) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await readJsonResponse<unknown>(response, "Failed to update job status");
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status } : job)),
      );
    } catch (error) {
      showErrorToast(error, {
        title: "Could not update job status",
        fallbackDescription: "Please try changing the status again.",
      });
    }
  };

  const analyzeJob = async (jobId: string) => {
    setAnalyzing(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: "POST",
      });
      const data = await readJsonResponse<AnalyzeJobResponse>(
        response,
        "Failed to analyze job",
      );
      const analysis = data.analysis;
      if (analysis) setAnalyses((prev) => ({ ...prev, [jobId]: analysis }));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not analyze job",
        fallbackDescription: "Please try the analysis again.",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const generateResume = async (jobId: string) => {
    setGenerating(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate[jobId] || "classic",
        }),
      });
      const data = await readJsonResponse<GenerateResumeResponse>(
        response,
        "Failed to generate resume",
      );
      if (data.pdfUrl) window.open(data.pdfUrl, "_blank");
    } catch (error) {
      showErrorToast(error, {
        title: "Could not generate resume",
        fallbackDescription: "Please try generating the resume again.",
      });
    } finally {
      setGenerating(null);
    }
  };

  const runAtsCheck = async (jobId: string) => {
    setAtsAnalyzing(jobId);
    try {
      const response = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await readJsonResponse<ATSAnalysisResult>(
        response,
        "Failed to run ATS check",
      );
      if (data.score) setAtsResults((prev) => ({ ...prev, [jobId]: data }));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not run ATS check",
        fallbackDescription: "Please try the ATS check again.",
      });
    } finally {
      setAtsAnalyzing(null);
    }
  };

  const filteredJobs = filterJobs(jobs, {
    searchQuery,
    statusFilter,
    typeFilter,
    remoteFilter,
    sortBy,
  });
  const hasActiveFilters = hasActiveJobFilters({
    searchQuery,
    statusFilter,
    typeFilter,
    remoteFilter,
  });
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRemoteFilter("all");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <JobsHero
          jobsCount={jobs.length}
          viewMode={viewMode}
          onImportClick={() => setShowImportDialog(true)}
          onAddClick={() => setShowAddDialog(true)}
          onViewModeChange={handleViewModeChange}
          onGmailImportSuccess={fetchJobs}
        />

        {jobs.length > 0 && (
          <JobsToolbar
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            remoteFilter={remoteFilter}
            sortBy={sortBy}
            hasActiveFilters={hasActiveFilters}
            filteredCount={filteredJobs.length}
            totalCount={jobs.length}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onRemoteChange={setRemoteFilter}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
          />
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonJobCard key={index} className="rounded-2xl p-5" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <JobsEmptyState onAdd={() => setShowAddDialog(true)} />
          ) : filteredJobs.length === 0 ? (
            <JobsNoResults onClearFilters={clearFilters} />
          ) : viewMode === "kanban" ? (
            <JobKanbanView
              jobs={filteredJobs}
              onStatusChange={(jobId, status) =>
                void updateJobStatus(jobId, status)
              }
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  analysis={analyses[job.id]}
                  analyzing={analyzing === job.id}
                  generating={generating === job.id}
                  templates={templates}
                  selectedTemplate={selectedTemplate[job.id] || "classic"}
                  expanded={expandedDescription === job.id}
                  atsResult={atsResults[job.id]}
                  atsAnalyzing={atsAnalyzing === job.id}
                  onSelectTemplate={(id) =>
                    setSelectedTemplate((prev) => ({ ...prev, [job.id]: id }))
                  }
                  onAnalyze={() => void analyzeJob(job.id)}
                  onGenerate={() => void generateResume(job.id)}
                  onDelete={() => void deleteJob(job.id)}
                  onStatusChange={(status) =>
                    void updateJobStatus(job.id, status as JobStatus)
                  }
                  onToggleExpand={() =>
                    setExpandedDescription((prev) =>
                      prev === job.id ? null : job.id,
                    )
                  }
                  onAtsCheck={() => void runAtsCheck(job.id)}
                  onAtsDialogOpen={() => setAtsDialogJob(job.id)}
                  onCoverLetter={() => setCoverLetterJob(job)}
                />
              ))}
            </div>
          )}
        </div>

        {atsDialogJob && atsResults[atsDialogJob] && (
          <ATSScoreBreakdown
            result={atsResults[atsDialogJob]}
            open={!!atsDialogJob}
            onOpenChange={(open) => !open && setAtsDialogJob(null)}
          />
        )}

        {coverLetterJob && (
          <CoverLetterDialog
            open={!!coverLetterJob}
            onOpenChange={(open) => !open && setCoverLetterJob(null)}
            jobId={coverLetterJob.id}
            jobTitle={coverLetterJob.title}
            company={coverLetterJob.company}
          />
        )}

        <ImportJobDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onJobImported={fetchJobs}
        />
        <AddJobDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onCreated={(job) => setJobs((prev) => [job, ...prev])}
        />
        {confirmDialog}
      </div>
    </ErrorBoundary>
  );
}
