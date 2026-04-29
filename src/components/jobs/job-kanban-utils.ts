import type { JobDescription } from "@/types";

export type JobsViewMode = "list" | "kanban";
export type JobKanbanStatus = "pending" | "saved" | "applied" | "interviewing" | "offered" | "rejected";

export const JOBS_VIEW_STORAGE_KEY = "get_me_job_jobs_view";

export const JOB_KANBAN_COLUMNS: readonly { value: JobKanbanStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offered", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const KANBAN_STATUS_VALUES = new Set<JobKanbanStatus>(JOB_KANBAN_COLUMNS.map((column) => column.value));

type WritableStorageLike = Pick<Storage, "setItem">;

export function getJobsViewStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function parseJobsViewMode(value: string | null | undefined): JobsViewMode {
  return value === "kanban" ? "kanban" : "list";
}

export function readJobsViewMode(storage: Pick<Storage, "getItem"> | null | undefined): JobsViewMode {
  if (!storage) return "list";

  try {
    return parseJobsViewMode(storage.getItem(JOBS_VIEW_STORAGE_KEY));
  } catch {
    return "list";
  }
}

export function writeJobsViewMode(storage: WritableStorageLike | null | undefined, mode: JobsViewMode): void {
  if (!storage) return;

  try {
    storage.setItem(JOBS_VIEW_STORAGE_KEY, mode);
  } catch {
    // Keep the in-memory mode when the browser refuses localStorage writes.
  }
}

export function getKanbanStatusValue(job: Pick<JobDescription, "status">): JobKanbanStatus {
  const status = job.status;
  return status && KANBAN_STATUS_VALUES.has(status as JobKanbanStatus) ? (status as JobKanbanStatus) : "saved";
}

export function groupJobsByKanbanStatus(jobs: JobDescription[]): Record<JobKanbanStatus, JobDescription[]> {
  const grouped = JOB_KANBAN_COLUMNS.reduce(
    (acc, column) => {
      acc[column.value] = [];
      return acc;
    },
    {} as Record<JobKanbanStatus, JobDescription[]>
  );

  for (const job of jobs) {
    grouped[getKanbanStatusValue(job)].push(job);
  }

  return grouped;
}

export function formatJobDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;

  const date = parseDeadlineDate(deadline);
  if (!date) return null;

  return `Due ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)}`;
}

function parseDeadlineDate(deadline: string): Date | null {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const date = new Date(deadline);
  return Number.isNaN(date.getTime()) ? null : date;
}
