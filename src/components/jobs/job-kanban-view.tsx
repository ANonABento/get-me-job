"use client";

import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import {
  Briefcase,
  CalendarClock,
  CircleDollarSign,
  GripVertical,
  MapPin,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  THEME_DASHED_SURFACE_CLASSES,
  THEME_INTERACTIVE_SURFACE_CLASSES,
  THEME_MUTED_SURFACE_CLASSES,
} from "@/lib/theme/component-classes";
import { cn } from "@/lib/utils";
import type { JobDescription } from "@/types";
import {
  JOB_KANBAN_COLUMNS,
  formatJobDeadline,
  getKanbanStatusValue,
  groupJobsByKanbanStatus,
  type JobKanbanStatus,
} from "./job-kanban-utils";

interface JobKanbanViewProps {
  jobs: JobDescription[];
  onStatusChange: (jobId: string, status: JobKanbanStatus) => void;
}

const COLUMN_STYLES: Record<JobKanbanStatus, string> = {
  pending: "border-muted-foreground/25",
  saved: "border-info/30",
  applied: "border-primary/30",
  interviewing: "border-warning/35",
  offered: "border-success/35",
  rejected: "border-destructive/30",
};

export function JobKanbanView({ jobs, onStatusChange }: JobKanbanViewProps) {
  const groupedJobs = useMemo(() => groupJobsByKanbanStatus(jobs), [jobs]);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  const handleDragStart = (event: DragEvent<HTMLElement>, jobId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", jobId);
    setDraggedJobId(jobId);
  };

  const handleDrop = (
    event: DragEvent<HTMLElement>,
    status: JobKanbanStatus,
  ) => {
    event.preventDefault();
    const jobId = event.dataTransfer.getData("text/plain") || draggedJobId;
    const job = jobs.find((candidate) => candidate.id === jobId);

    setDraggedJobId(null);

    if (!job || getKanbanStatusValue(job) === status) return;
    onStatusChange(job.id, status);
  };

  return (
    <div
      className="overflow-x-auto pb-4"
      role="region"
      aria-label="Job kanban board"
      aria-roledescription="kanban board"
      tabIndex={0}
    >
      <div className="grid min-w-[1120px] grid-cols-6 gap-4">
        {JOB_KANBAN_COLUMNS.map((column) => {
          const columnJobs = groupedJobs[column.value];

          return (
            <section
              key={column.value}
              aria-label={`${column.label} jobs`}
              className={cn(
                "flex min-h-[520px] flex-col p-3",
                THEME_MUTED_SURFACE_CLASSES,
                COLUMN_STYLES[column.value],
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => handleDrop(event, column.value)}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{column.label}</h2>
                <Badge variant="secondary" className="shrink-0">
                  {columnJobs.length}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {columnJobs.length === 0 ? (
                  <div
                    className={cn(
                      "grid min-h-28 place-items-center px-3 text-center text-sm text-muted-foreground",
                      THEME_DASHED_SURFACE_CLASSES,
                    )}
                  >
                    Drop jobs here
                  </div>
                ) : (
                  columnJobs.map((job) => (
                    <JobKanbanCard
                      key={job.id}
                      job={job}
                      isDragging={draggedJobId === job.id}
                      onDragStart={(event) => handleDragStart(event, job.id)}
                      onDragEnd={() => setDraggedJobId(null)}
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

interface JobKanbanCardProps {
  job: JobDescription;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

function JobKanbanCard({
  job,
  isDragging,
  onDragStart,
  onDragEnd,
}: JobKanbanCardProps) {
  const deadlineLabel = formatJobDeadline(job.deadline);
  const tags = job.keywords.slice(0, 4);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab p-3 active:cursor-grabbing",
        THEME_INTERACTIVE_SURFACE_CLASSES,
        isDragging && "opacity-50",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5">
            {job.title}
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {job.company}
          </p>
        </div>
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        {deadlineLabel && (
          <Badge
            variant="outline"
            className="gap-1 border-warning/35 bg-warning/10 text-warning"
          >
            <CalendarClock className="h-3 w-3" />
            {deadlineLabel}
          </Badge>
        )}

        {job.salary && (
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}

        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="max-w-full gap-1 truncate text-[11px]"
              >
                <Tag className="h-3 w-3 shrink-0" />
                <span className="truncate">{tag}</span>
              </Badge>
            ))}
            {job.keywords.length > tags.length && (
              <Badge variant="outline" className="text-[11px]">
                +{job.keywords.length - tags.length}
              </Badge>
            )}
          </div>
        )}
      </div>

      {!deadlineLabel && !job.salary && !job.location && tags.length === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          No details yet
        </div>
      )}
    </article>
  );
}
