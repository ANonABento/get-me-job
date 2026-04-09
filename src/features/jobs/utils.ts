import type { JobFilters } from "@/features/jobs/client-types";
import type { JobDescription } from "@/types";

export function filterAndSortJobs(
  jobs: JobDescription[],
  filters: JobFilters
): JobDescription[] {
  const { remoteFilter, searchQuery, sortBy, statusFilter, typeFilter } = filters;

  return jobs
    .filter((job) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesKeywords = job.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesCompany && !matchesKeywords) {
          return false;
        }
      }

      if (statusFilter !== "all" && (job.status || "saved") !== statusFilter) {
        return false;
      }

      if (typeFilter !== "all" && job.type !== typeFilter) {
        return false;
      }

      if (remoteFilter === "remote" && !job.remote) {
        return false;
      }

      if (remoteFilter === "onsite" && job.remote) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      switch (sortBy) {
        case "newest":
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        case "oldest":
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        case "company":
          return left.company.localeCompare(right.company);
        case "title":
          return left.title.localeCompare(right.title);
        default:
          return 0;
      }
    });
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return Boolean(
    filters.searchQuery ||
      filters.statusFilter !== "all" ||
      filters.typeFilter !== "all" ||
      filters.remoteFilter !== "all"
  );
}
