import { cn } from "@/lib/utils";
import { JOB_STATUS_LABELS, type JobStatus } from "@/lib/constants/jobs";

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  saved: "bg-muted text-muted-foreground",
  dismissed: "bg-muted text-muted-foreground",
  withdrawn: "bg-muted text-muted-foreground",
  applied: "bg-info/15 text-info",
  interviewing: "bg-warning/15 text-warning",
  offered: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  ...JOB_STATUS_LABELS,
  interviewing: "Interview",
};

interface JobStatusBadgeProps {
  status: string;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        STATUS_CLASSES[status] ?? STATUS_CLASSES.saved,
        className,
      )}
    >
      {STATUS_LABELS[status as JobStatus] ?? "Saved"}
    </span>
  );
}
