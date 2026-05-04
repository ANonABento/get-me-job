"use client";

import { Upload, FileText, Briefcase, Clock } from "lucide-react";
import { useState } from "react";

export interface ActivityItem {
  id: string;
  type: "document_uploaded" | "resume_generated" | "job_added" | "job_applied";
  targetId?: string;
  title: string;
  timestamp: string;
}

interface RolledUpActivityItem extends ActivityItem {
  count: number;
  timestamps: string[];
}

interface RecentActivityProps {
  items: ActivityItem[];
  maxItems?: number;
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
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getActivityDay(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function rollupActivityItems(items: ActivityItem[]): RolledUpActivityItem[] {
  const groups = new Map<string, RolledUpActivityItem>();

  for (const item of items) {
    const targetKey = item.targetId ?? item.title;
    const key = [item.type, targetKey, getActivityDay(item.timestamp)].join("|");
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.timestamps.push(item.timestamp);
      if (new Date(item.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        existing.timestamp = item.timestamp;
      }
    } else {
      groups.set(key, {
        ...item,
        count: 1,
        timestamps: [item.timestamp],
      });
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function formatActivityTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentActivity({ items, maxItems = 5 }: RecentActivityProps) {
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  if (items.length === 0) return null;

  const rolledUpItems = rollupActivityItems(items).slice(0, maxItems);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {rolledUpItems.map((item) => {
          const Icon = ACTIVITY_ICONS[item.type];
          const label = ACTIVITY_LABELS[item.type];
          const tooltipOpen = openTooltipId === item.id;
          return (
            <div
              key={item.id}
              className="group relative flex items-center gap-3 text-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground">{label}</span>{" "}
                <span className="font-medium truncate">{item.title}</span>
                {item.count > 1 && (
                  <button
                    type="button"
                    className="ml-2 inline-flex h-5 items-center rounded-md bg-muted px-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-expanded={tooltipOpen}
                    aria-label={`Show ${item.count} timestamps`}
                    onClick={() =>
                      setOpenTooltipId((current) =>
                        current === item.id ? null : item.id
                      )
                    }
                  >
                    {item.count}&times;
                  </button>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(item.timestamp)}
              </span>
              {item.count > 1 && (
                <div
                  role="tooltip"
                  className={`absolute right-0 top-9 z-10 min-w-28 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md ${
                    tooltipOpen ? "block" : "hidden group-hover:block group-focus-within:block"
                  }`}
                >
                  <div className="space-y-1">
                    {item.timestamps
                      .slice()
                      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                      .map((timestamp) => (
                        <div key={timestamp}>{formatActivityTime(timestamp)}</div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { formatRelativeTime };
