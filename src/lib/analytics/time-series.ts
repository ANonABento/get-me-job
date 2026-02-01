import type { JobDescription } from "@/types";

export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  applications: DataPoint[];
  responses: DataPoint[];
  interviews: DataPoint[];
  offers: DataPoint[];
}

export interface TrendMetrics {
  applicationRate: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  responseRate: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  interviewRate: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  successRate: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
}

function getDateRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2020); // Earliest reasonable date
      break;
  }

  return { start, end };
}

function formatDateKey(date: Date, range: TimeRange): string {
  if (range === "7d") {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  if (range === "30d") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getDateKey(date: Date, range: TimeRange): string {
  const d = new Date(date);
  if (range === "7d" || range === "30d") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  // For longer ranges, group by week
  if (range === "90d") {
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return `${weekStart.getFullYear()}-W${String(Math.ceil((d.getDate() + 6 - d.getDay()) / 7)).padStart(2, "0")}`;
  }
  // For 1y or all, group by month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateDateBuckets(range: TimeRange): Map<string, DataPoint> {
  const { start, end } = getDateRange(range);
  const buckets = new Map<string, DataPoint>();
  const current = new Date(start);

  while (current <= end) {
    const key = getDateKey(current, range);
    if (!buckets.has(key)) {
      buckets.set(key, {
        date: key,
        value: 0,
        label: formatDateKey(current, range),
      });
    }

    if (range === "7d" || range === "30d") {
      current.setDate(current.getDate() + 1);
    } else if (range === "90d") {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return buckets;
}

export function generateTimeSeriesData(
  jobs: JobDescription[],
  range: TimeRange
): TimeSeriesData {
  const { start, end } = getDateRange(range);

  // Filter jobs within range
  const filteredJobs = jobs.filter((job) => {
    const created = new Date(job.createdAt);
    return created >= start && created <= end;
  });

  // Initialize buckets
  const applicationBuckets = generateDateBuckets(range);
  const responseBuckets = generateDateBuckets(range);
  const interviewBuckets = generateDateBuckets(range);
  const offerBuckets = generateDateBuckets(range);

  // Populate application data
  filteredJobs.forEach((job) => {
    const key = getDateKey(new Date(job.createdAt), range);
    const bucket = applicationBuckets.get(key);
    if (bucket) {
      bucket.value++;
    }

    // Track responses (interviewing, offered, rejected)
    if (job.status === "interviewing" || job.status === "offered" || job.status === "rejected") {
      const responseBucket = responseBuckets.get(key);
      if (responseBucket) {
        responseBucket.value++;
      }
    }

    // Track interviews
    if (job.status === "interviewing" || job.status === "offered") {
      const interviewBucket = interviewBuckets.get(key);
      if (interviewBucket) {
        interviewBucket.value++;
      }
    }

    // Track offers
    if (job.status === "offered") {
      const offerBucket = offerBuckets.get(key);
      if (offerBucket) {
        offerBucket.value++;
      }
    }
  });

  return {
    applications: Array.from(applicationBuckets.values()),
    responses: Array.from(responseBuckets.values()),
    interviews: Array.from(interviewBuckets.values()),
    offers: Array.from(offerBuckets.values()),
  };
}

export function calculateTrendMetrics(
  jobs: JobDescription[],
  range: TimeRange
): TrendMetrics {
  const { start, end } = getDateRange(range);
  const halfwayPoint = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);

  const recentJobs = jobs.filter((j) => new Date(j.createdAt) >= halfwayPoint);
  const olderJobs = jobs.filter((j) => {
    const date = new Date(j.createdAt);
    return date >= start && date < halfwayPoint;
  });

  const calculateRate = (
    recent: JobDescription[],
    older: JobDescription[],
    filterFn: (j: JobDescription) => boolean
  ) => {
    const recentCount = recent.filter(filterFn).length;
    const olderCount = older.filter(filterFn).length;
    const recentRate = recent.length > 0 ? (recentCount / recent.length) * 100 : 0;
    const olderRate = older.length > 0 ? (olderCount / older.length) * 100 : 0;
    const change = recentRate - olderRate;

    return {
      current: Math.round(recentRate),
      previous: Math.round(olderRate),
      change: Math.round(change),
      trend: (change > 5 ? "up" : change < -5 ? "down" : "stable") as "up" | "down" | "stable",
    };
  };

  // Application rate (applications per time period)
  const applicationRate = {
    current: recentJobs.length,
    previous: olderJobs.length,
    change: recentJobs.length - olderJobs.length,
    trend: (recentJobs.length > olderJobs.length * 1.1 ? "up" : recentJobs.length < olderJobs.length * 0.9 ? "down" : "stable") as "up" | "down" | "stable",
  };

  // Response rate (got any response vs total applications)
  const responseRate = calculateRate(
    recentJobs,
    olderJobs,
    (j) => j.status === "interviewing" || j.status === "offered" || j.status === "rejected"
  );

  // Interview rate (got interview vs total applications)
  const interviewRate = calculateRate(
    recentJobs,
    olderJobs,
    (j) => j.status === "interviewing" || j.status === "offered"
  );

  // Success rate (offers vs total applications)
  const successRate = calculateRate(
    recentJobs,
    olderJobs,
    (j) => j.status === "offered"
  );

  return {
    applicationRate,
    responseRate,
    interviewRate,
    successRate,
  };
}

export interface ActivityEvent {
  id: string;
  type: "application" | "status_change" | "interview" | "offer" | "rejection";
  title: string;
  description: string;
  date: string;
  jobId: string;
  jobTitle: string;
  company: string;
}

export function generateActivityTimeline(
  jobs: JobDescription[],
  limit = 20
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  jobs.forEach((job) => {
    // Application event
    events.push({
      id: `${job.id}-created`,
      type: "application",
      title: "Applied",
      description: `Applied to ${job.title} at ${job.company}`,
      date: job.createdAt,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
    });

    // Status change events
    if (job.status === "interviewing") {
      events.push({
        id: `${job.id}-interview`,
        type: "interview",
        title: "Interview Scheduled",
        description: `Got interview for ${job.title} at ${job.company}`,
        date: job.appliedAt || job.createdAt,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      });
    }

    if (job.status === "offered") {
      events.push({
        id: `${job.id}-offer`,
        type: "offer",
        title: "Offer Received",
        description: `Received offer for ${job.title} at ${job.company}`,
        date: job.appliedAt || job.createdAt,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      });
    }

    if (job.status === "rejected") {
      events.push({
        id: `${job.id}-rejection`,
        type: "rejection",
        title: "Application Rejected",
        description: `${job.title} at ${job.company}`,
        date: job.appliedAt || job.createdAt,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      });
    }
  });

  // Sort by date descending and limit
  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
