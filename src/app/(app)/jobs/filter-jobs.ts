import type { JobDescription } from "@/types";
import { getTrackedJobStatus, type TrackedJobStatus } from "@/lib/constants/jobs";

export type JobStatusFilter = "all" | TrackedJobStatus;
export type JobTypeFilter = "all" | "full-time" | "part-time" | "contract" | "internship";
export type JobRemoteFilter = "all" | "remote" | "onsite";
export type JobSortOption = "newest" | "oldest" | "company" | "title";

export interface JobFilters {
  searchQuery: string;
  statusFilter: JobStatusFilter;
  typeFilter: JobTypeFilter;
  remoteFilter: JobRemoteFilter;
  sortBy: JobSortOption;
}

export const DEFAULT_JOB_FILTERS: JobFilters = {
  searchQuery: "",
  statusFilter: "all",
  typeFilter: "all",
  remoteFilter: "all",
  sortBy: "newest",
};

export function getJobStatusValue(job: Pick<JobDescription, "status">): TrackedJobStatus {
  return getTrackedJobStatus(job.status);
}

export function filterJobs(jobs: JobDescription[], filters: JobFilters): JobDescription[] {
  return [...jobs]
    .filter((job) => matchesFilters(job, filters))
    .sort((a, b) => sortJobs(a, b, filters.sortBy));
}

export function hasActiveJobFilters(
  filters: Pick<JobFilters, "searchQuery" | "statusFilter" | "typeFilter" | "remoteFilter">
): boolean {
  return Boolean(
    filters.searchQuery ||
      filters.statusFilter !== DEFAULT_JOB_FILTERS.statusFilter ||
      filters.typeFilter !== DEFAULT_JOB_FILTERS.typeFilter ||
      filters.remoteFilter !== DEFAULT_JOB_FILTERS.remoteFilter
  );
}

function matchesFilters(job: JobDescription, filters: JobFilters): boolean {
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    const matchesTitle = job.title.toLowerCase().includes(query);
    const matchesCompany = job.company.toLowerCase().includes(query);
    const matchesKeywords = job.keywords?.some((keyword) => keyword.toLowerCase().includes(query));

    if (!matchesTitle && !matchesCompany && !matchesKeywords) {
      return false;
    }
  }

  if (filters.statusFilter !== "all" && getJobStatusValue(job) !== filters.statusFilter) {
    return false;
  }

  if (filters.typeFilter !== "all" && job.type !== filters.typeFilter) {
    return false;
  }

  if (filters.remoteFilter === "remote" && !job.remote) {
    return false;
  }

  if (filters.remoteFilter === "onsite" && job.remote) {
    return false;
  }

  return true;
}

function sortJobs(a: JobDescription, b: JobDescription, sortBy: JobSortOption): number {
  switch (sortBy) {
    case "newest":
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    case "oldest":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case "company":
      return a.company.localeCompare(b.company);
    case "title":
      return a.title.localeCompare(b.title);
    default:
      return 0;
  }
}
