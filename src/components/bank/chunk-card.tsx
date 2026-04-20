"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BankEntry, BankCategory } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Check,
  X,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

// --- Category config ---

export const CATEGORY_CONFIG: Record<
  BankCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  experience: { label: "Experience", icon: Briefcase, color: "bg-info/10 text-info" },
  education: { label: "Education", icon: GraduationCap, color: "bg-success/10 text-success" },
  skill: { label: "Skill", icon: Wrench, color: "bg-primary/10 text-primary" },
  project: { label: "Project", icon: FolderOpen, color: "bg-accent/10 text-accent" },
  achievement: { label: "Achievement", icon: Award, color: "bg-warning/10 text-warning" },
  certification: { label: "Certification", icon: Shield, color: "bg-info/10 text-info" },
};

// --- Field definitions per category ---

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "list" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const CATEGORY_FIELDS: Record<BankCategory, FieldDef[]> = {
  experience: [
    { key: "title", label: "Job Title", type: "text", placeholder: "e.g. Software Engineer" },
    { key: "company", label: "Company", type: "text", placeholder: "e.g. Acme Corp" },
    { key: "location", label: "Location", type: "text", placeholder: "e.g. San Francisco, CA" },
    { key: "startDate", label: "Start Date", type: "text", placeholder: "e.g. 2020-01" },
    { key: "endDate", label: "End Date", type: "text", placeholder: "e.g. 2023-06" },
    { key: "current", label: "Current Position", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description of the role" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Key accomplishments..." },
    { key: "skills", label: "Skills (one per line)", type: "list", placeholder: "React\nTypeScript\nNode.js" },
  ],
  education: [
    { key: "institution", label: "Institution", type: "text", placeholder: "e.g. MIT" },
    { key: "degree", label: "Degree", type: "text", placeholder: "e.g. BS Computer Science" },
    { key: "field", label: "Field of Study", type: "text", placeholder: "e.g. Computer Science" },
    { key: "startDate", label: "Start Date", type: "text", placeholder: "e.g. 2016" },
    { key: "endDate", label: "End Date", type: "text", placeholder: "e.g. 2020" },
    { key: "gpa", label: "GPA", type: "text", placeholder: "e.g. 3.8" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Dean's list\nResearch assistant" },
  ],
  skill: [
    { key: "name", label: "Skill Name", type: "text", placeholder: "e.g. TypeScript" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "technical", label: "Technical" },
        { value: "soft", label: "Soft" },
        { value: "language", label: "Language" },
        { value: "tool", label: "Tool" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "proficiency",
      label: "Proficiency",
      type: "select",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" },
      ],
    },
  ],
  project: [
    { key: "name", label: "Project Name", type: "text", placeholder: "e.g. My App" },
    { key: "description", label: "Description", type: "textarea", placeholder: "What does this project do?" },
    { key: "url", label: "URL", type: "text", placeholder: "https://github.com/..." },
    { key: "technologies", label: "Technologies (one per line)", type: "list", placeholder: "React\nNode.js" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Key features..." },
  ],
  certification: [
    { key: "name", label: "Certification Name", type: "text", placeholder: "e.g. AWS Solutions Architect" },
    { key: "issuer", label: "Issuer", type: "text", placeholder: "e.g. Amazon Web Services" },
    { key: "date", label: "Date", type: "text", placeholder: "e.g. 2023-03" },
    { key: "url", label: "URL", type: "text", placeholder: "https://..." },
  ],
  achievement: [
    { key: "description", label: "Description", type: "textarea", placeholder: "Describe the achievement..." },
  ],
};

// --- Helper functions ---

/** Get a human-readable title from bank entry content */
export function getEntryTitle(entry: BankEntry): string {
  const c = entry.content;
  switch (entry.category) {
    case "experience":
      return [c.title, c.company].filter(Boolean).join(" at ") || "Experience";
    case "education":
      return [c.degree, c.institution].filter(Boolean).join(" — ") || "Education";
    case "skill":
      return (c.name as string) || "Skill";
    case "project":
      return (c.name as string) || "Project";
    case "certification":
      return [c.name, c.issuer].filter(Boolean).join(" — ") || "Certification";
    case "achievement":
      return (c.description as string)?.slice(0, 80) || "Achievement";
    default:
      return "Entry";
  }
}

/** Get date range string for experience/education */
export function getDateRange(content: Record<string, unknown>): string {
  const parts: string[] = [];
  if (content.startDate) parts.push(String(content.startDate));
  if (content.endDate) parts.push(String(content.endDate));
  else if (content.current) parts.push("Present");
  return parts.join(" — ");
}

/** Get first N highlights from content */
export function getHighlights(content: Record<string, unknown>, max: number): string[] {
  if (!Array.isArray(content.highlights)) return [];
  return content.highlights.slice(0, max).map(String);
}

/** Get technologies list from content */
export function getTechnologies(content: Record<string, unknown>): string[] {
  if (!Array.isArray(content.technologies)) return [];
  return content.technologies.map(String);
}

/** Skill category badge color mapping */
export const SKILL_CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  soft: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  language: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  tool: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

/** Convert an array field value to newline-separated text for editing */
export function listToText(value: unknown): string {
  if (Array.isArray(value)) return value.join("\n");
  return "";
}

/** Convert newline-separated text back to an array, preserving empty lines while typing */
export function textToList(text: string): string[] {
  return text.split("\n");
}

/** Clean up a content object before saving: trim strings, filter empty list items */
export function cleanContent(
  content: Record<string, unknown>,
  fields: FieldDef[]
): Record<string, unknown> {
  const cleaned = { ...content };
  for (const field of fields) {
    if (field.type === "list" && Array.isArray(cleaned[field.key])) {
      cleaned[field.key] = (cleaned[field.key] as string[]).filter((s) => s.trim());
    }
    if (field.type === "text" && typeof cleaned[field.key] === "string") {
      cleaned[field.key] = (cleaned[field.key] as string).trim();
    }
  }
  // Remove empty-string values
  for (const [key, val] of Object.entries(cleaned)) {
    if (val === "") delete cleaned[key];
  }
  return cleaned;
}

// --- Field editor component ---

interface FieldEditorProps {
  field: FieldDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

export function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <Input
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 text-sm"
          />
        </div>
      );
    case "textarea":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <textarea
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <input
            id={`field-${field.key}`}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
        </div>
      );
    case "list":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <textarea
            id={`field-${field.key}`}
            value={listToText(value)}
            onChange={(e) => onChange(field.key, textToList(e.target.value))}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      );
    case "select":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <select
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    default:
      return null;
  }
}

// --- Content preview for collapsed state ---

function ContentPreview({ entry }: { entry: BankEntry }) {
  const c = entry.content;

  switch (entry.category) {
    case "experience": {
      const dateRange = getDateRange(c);
      const highlights = getHighlights(c, 2);
      return (
        <div className="mt-1 space-y-1">
          {(c.location || dateRange) && (
            <p className="text-xs text-muted-foreground">
              {[c.location, dateRange].filter(Boolean).join(" · ")}
            </p>
          )}
          {c.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {String(c.description)}
            </p>
          ) : null}
          {highlights.length > 0 && (
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              {highlights.map((h, i) => (
                <li key={i} className="truncate">{h}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "education": {
      const dateRange = getDateRange(c);
      return (
        <div className="mt-1 space-y-0.5">
          {c.field ? (
            <p className="text-sm text-muted-foreground">{String(c.field)}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {[dateRange, c.gpa ? `GPA: ${c.gpa}` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
      );
    }
    case "skill": {
      const cat = c.category ? String(c.category) : "";
      const prof = c.proficiency ? String(c.proficiency) : "";
      return (
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {cat && (
            <span className={cn("text-2xs px-1.5 py-0.5 rounded-full font-medium", SKILL_CATEGORY_COLORS[cat] || SKILL_CATEGORY_COLORS.other)}>
              {cat}
            </span>
          )}
          {prof && (
            <span className="text-xs text-muted-foreground">{prof}</span>
          )}
        </div>
      );
    }
    case "project": {
      const techs = getTechnologies(c);
      return (
        <div className="mt-1 space-y-1">
          {c.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {String(c.description)}
            </p>
          ) : null}
          {techs.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {techs.slice(0, 5).map((t, i) => (
                <span key={i} className="text-2xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {t}
                </span>
              ))}
              {techs.length > 5 && (
                <span className="text-2xs text-muted-foreground">+{techs.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      );
    }
    case "certification": {
      return (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground">
            {[c.issuer, c.date].filter(Boolean).map(String).join(" · ")}
          </p>
        </div>
      );
    }
    case "achievement": {
      return c.description ? (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {String(c.description)}
        </p>
      ) : null;
    }
    default:
      return null;
  }
}

// --- ChunkCard component ---

interface ChunkCardProps {
  entry: BankEntry;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

export function ChunkCard({ entry, onUpdate, onDelete }: ChunkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, unknown>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const config = CATEGORY_CONFIG[entry.category];
  const Icon = config.icon;
  const title = getEntryTitle(entry);
  const fields = CATEGORY_FIELDS[entry.category];

  function handleEdit() {
    setEditContent({ ...entry.content });
    setEditing(true);
    setExpanded(true);
  }

  function handleFieldChange(key: string, value: unknown) {
    setEditContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const cleaned = cleanContent(editContent, fields);
    onUpdate(entry.id, cleaned);
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditContent({});
  }

  function handleDeleteClick() {
    setConfirmDelete(true);
  }

  function handleConfirmDelete() {
    onDelete(entry.id);
    setConfirmDelete(false);
  }

  function handleCancelDelete() {
    setConfirmDelete(false);
  }

  return (
    <div className="rounded-xl border bg-card transition-all hover:border-primary/30">
      {/* Header */}
      <button
        onClick={() => !editing && setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{title}</span>
            <Badge variant="secondary" className="text-2xs">
              {config.label}
            </Badge>
            {entry.confidenceScore >= 0.9 && (
              <Badge variant="success" className="text-2xs">
                High confidence
              </Badge>
            )}
          </div>
          {!expanded && (
            <ContentPreview entry={entry} />
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(entry.createdAt)}
            </span>
            {entry.sourceDocumentId && (
              <span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">
                from {entry.sourceDocumentId}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-3">
          {editing ? (
            <div className="space-y-3">
              {fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={editContent[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-sm">
                {fields.map((field) => {
                  const val = entry.content[field.key];
                  if (val === undefined || val === null || val === "") return null;
                  if (field.type === "checkbox") {
                    if (!val) return null;
                    return (
                      <div key={field.key} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-success" />
                        <span className="text-muted-foreground">{field.label}</span>
                      </div>
                    );
                  }
                  if (field.type === "list" && Array.isArray(val)) {
                    if (val.length === 0) return null;
                    return (
                      <div key={field.key}>
                        <span className="text-xs text-muted-foreground font-medium">{field.label}</span>
                        <ul className="mt-1 list-disc list-inside text-sm">
                          {val.map((item, i) => (
                            <li key={i}>{String(item)}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={field.key}>
                      <span className="text-xs text-muted-foreground font-medium">{field.label}: </span>
                      <span>{String(val)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Delete this entry?
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelDelete}
                    >
                      No
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleConfirmDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
