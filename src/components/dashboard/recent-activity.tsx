"use client";

import { Upload, FileText, Briefcase, Clock } from "lucide-react";
import { formatDateRelative } from "@/lib/format/time";

export interface ActivityItem {
  id: string;
  type: "document_uploaded" | "resume_generated" | "job_added" | "job_applied";
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ElementType> = {
  document_uploaded: Upload,
  resume_generated: FileText,
  job_added: Briefcase,
  job_applied: Briefcase,
};

const ACTIVITY_LABELS: Record<ActivityItem["type"], string> = {
  document_uploaded: "Uploaded",
  resume_generated: "Generated resume for",
  job_added: "Added job",
  job_applied: "Applied to",
};

function formatRelativeTime(timestamp: string): string {
  return formatDateRelative(timestamp);
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = ACTIVITY_ICONS[item.type];
          const label = ACTIVITY_LABELS[item.type];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 text-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground">{label}</span>{" "}
                <span className="font-medium truncate">{item.title}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { formatRelativeTime };
