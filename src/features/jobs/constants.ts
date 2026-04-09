import type { Template } from "@/features/jobs/client-types";

export const DEFAULT_NEW_JOB = {
  title: "",
  company: "",
  description: "",
  url: "",
};

export const FALLBACK_TEMPLATES: Template[] = [
  { id: "classic", name: "Classic", description: "Traditional professional format" },
  { id: "modern", name: "Modern", description: "Contemporary design" },
  { id: "minimal", name: "Minimal", description: "Clean and simple" },
  { id: "executive", name: "Executive", description: "Bold headers, strong hierarchy" },
  { id: "tech", name: "Tech", description: "Tech industry focused" },
  { id: "creative", name: "Creative", description: "Bold colors for creative roles" },
  { id: "compact", name: "Compact", description: "Dense layout for experienced pros" },
  { id: "professional", name: "Professional", description: "Conservative for business" },
];

export const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  saved: { label: "Saved", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
  applied: { label: "Applied", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  interviewing: { label: "Interviewing", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  offered: { label: "Offered", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-success dark:text-emerald-400" },
  rejected: { label: "Rejected", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
};

export const JOB_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const JOB_REMOTE_OPTIONS = [
  { value: "all", label: "All Locations" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
];

export const JOB_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "company", label: "Company A-Z" },
  { value: "title", label: "Title A-Z" },
];
