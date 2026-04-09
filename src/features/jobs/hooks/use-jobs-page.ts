"use client";

import { useDeferredValue, useEffect, useState } from "react";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import { DEFAULT_NEW_JOB, FALLBACK_TEMPLATES } from "@/features/jobs/constants";
import type {
  AddJobDraft,
  ImportedEmailPreview,
  JobFilters,
  Template,
} from "@/features/jobs/client-types";
import {
  createJob,
  fetchJobs,
  fetchJobTemplates,
  patchJobStatus,
  removeJob,
  requestAtsAnalysis,
  requestJobAnalysis,
  requestResumeGeneration,
} from "@/features/jobs/api";
import { filterAndSortJobs, hasActiveJobFilters } from "@/features/jobs/utils";
import type { JobDescription, JobMatch } from "@/types";

export function useJobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newJob, setNewJob] = useState<AddJobDraft>(DEFAULT_NEW_JOB);
  const [addingJob, setAddingJob] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [atsAnalyzing, setAtsAnalyzing] = useState<string | null>(null);
  const [atsDialogJob, setAtsDialogJob] = useState<string | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<JobDescription | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, JobMatch>>({});
  const [atsResults, setAtsResults] = useState<Record<string, ATSAnalysisResult>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Record<string, string>>({});
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    void loadInitialJobs();
    void loadTemplates();
  }, []);

  async function loadInitialJobs() {
    setLoading(true);
    try {
      setJobs(await fetchJobs());
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshJobs() {
    try {
      setJobs(await fetchJobs());
    } catch (error) {
      console.error("Failed to refresh jobs:", error);
    }
  }

  async function loadTemplates() {
    try {
      const fetchedTemplates = await fetchJobTemplates();
      setTemplates(fetchedTemplates.length > 0 ? fetchedTemplates : FALLBACK_TEMPLATES);
    } catch {
      setTemplates(FALLBACK_TEMPLATES);
    }
  }

  async function addJob() {
    if (!newJob.title || !newJob.company || !newJob.description) {
      return;
    }

    setAddingJob(true);
    try {
      const job = await createJob(newJob);
      setJobs((currentJobs) => [job, ...currentJobs]);
      setNewJob(DEFAULT_NEW_JOB);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Failed to add job:", error);
    } finally {
      setAddingJob(false);
    }
  }

  async function deleteJob(jobId: string) {
    try {
      await removeJob(jobId);
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  }

  async function updateJobStatus(jobId: string, status: string) {
    try {
      await patchJobStatus(jobId, status);
      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === jobId ? { ...job, status: status as JobDescription["status"] } : job
        )
      );
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  }

  async function analyzeJob(jobId: string) {
    setAnalyzing(jobId);
    try {
      const analysis = await requestJobAnalysis(jobId);
      if (analysis) {
        setAnalyses((currentAnalyses) => ({ ...currentAnalyses, [jobId]: analysis }));
      }
    } catch (error) {
      console.error("Failed to analyze job:", error);
    } finally {
      setAnalyzing(null);
    }
  }

  async function generateResume(jobId: string) {
    setGenerating(jobId);
    try {
      const templateId = selectedTemplate[jobId] || "classic";
      const pdfUrl = await requestResumeGeneration(jobId, templateId);
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to generate resume:", error);
    } finally {
      setGenerating(null);
    }
  }

  async function runAtsCheck(jobId: string) {
    setAtsAnalyzing(jobId);
    try {
      const result = await requestAtsAnalysis(jobId);
      if (result.score) {
        setAtsResults((currentResults) => ({ ...currentResults, [jobId]: result }));
      }
    } catch (error) {
      console.error("Failed to run ATS check:", error);
    } finally {
      setAtsAnalyzing(null);
    }
  }

  async function createJobFromEmail(email: ImportedEmailPreview) {
    const jobInput = {
      title: email.parsed?.role || email.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim(),
      company: email.parsed?.company || email.from.split("@")[1]?.split(".")[0] || "Unknown",
      description: email.snippet,
      url: "",
    };

    try {
      await createJob(jobInput);
      await refreshJobs();
    } catch (error) {
      console.error("Failed to create job from email:", error);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRemoteFilter("all");
  }

  function toggleExpandedDescription(jobId: string) {
    setExpandedDescription((currentJobId) => (currentJobId === jobId ? null : jobId));
  }

  function selectTemplateForJob(jobId: string, templateId: string) {
    setSelectedTemplate((currentTemplates) => ({ ...currentTemplates, [jobId]: templateId }));
  }

  const filters: JobFilters = {
    searchQuery: deferredSearchQuery,
    statusFilter,
    typeFilter,
    remoteFilter,
    sortBy,
  };

  const rawFilters: JobFilters = {
    searchQuery,
    statusFilter,
    typeFilter,
    remoteFilter,
    sortBy,
  };

  return {
    addJob,
    addingJob,
    analyzeJob,
    analyses,
    analyzing,
    atsAnalyzing,
    atsDialogJob,
    atsResults,
    clearFilters,
    coverLetterJob,
    createJobFromEmail,
    deleteJob,
    expandedDescription,
    filteredJobs: filterAndSortJobs(jobs, filters),
    generateResume,
    generating,
    hasActiveFilters: hasActiveJobFilters(rawFilters),
    jobs,
    loading,
    newJob,
    refreshJobs,
    remoteFilter,
    runAtsCheck,
    searchQuery,
    selectTemplateForJob,
    selectedTemplate,
    setAtsDialogJob,
    setCoverLetterJob,
    setNewJob,
    setRemoteFilter,
    setSearchQuery,
    setShowAddDialog,
    setShowImportDialog,
    setSortBy,
    setStatusFilter,
    setTypeFilter,
    showAddDialog,
    showImportDialog,
    sortBy,
    statusFilter,
    templates,
    toggleExpandedDescription,
    typeFilter,
    updateJobStatus,
  };
}
