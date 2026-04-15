"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

const CATEGORY_CONFIG: Record<
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

/** Get a preview string for collapsed state */
export function getEntryPreview(entry: BankEntry): string {
  const c = entry.content;
  switch (entry.category) {
    case "experience": {
      const parts: string[] = [];
      if (c.startDate) parts.push(String(c.startDate));
      if (c.endDate) parts.push(String(c.endDate));
      else if (c.current) parts.push("Present");
      const dateStr = parts.join(" — ");
      const desc = c.description ? String(c.description).slice(0, 120) : "";
      return [dateStr, desc].filter(Boolean).join(" | ");
    }
    case "education": {
      const parts: string[] = [];
      if (c.field) parts.push(String(c.field));
      if (c.gpa) parts.push(`GPA: ${c.gpa}`);
      return parts.join(" | ") || "";
    }
    case "skill":
      return [c.category, c.proficiency].filter(Boolean).join(" | ");
    case "project":
      return (c.description as string)?.slice(0, 120) || "";
    case "certification":
      return [c.date, c.url].filter(Boolean).join(" | ");
    case "achievement":
      return "";
    default:
      return JSON.stringify(c).slice(0, 120);
  }
}

interface ChunkCardProps {
  entry: BankEntry;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

export function ChunkCard({ entry, onUpdate, onDelete }: ChunkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [deleting, setDeleting] = useState(false);

  const config = CATEGORY_CONFIG[entry.category];
  const Icon = config.icon;
  const title = getEntryTitle(entry);
  const preview = getEntryPreview(entry);

  function handleEdit() {
    setEditContent(JSON.stringify(entry.content, null, 2));
    setEditing(true);
    setExpanded(true);
  }

  function handleSave() {
    try {
      const parsed = JSON.parse(editContent);
      onUpdate(entry.id, parsed);
      setEditing(false);
    } catch {
      // Invalid JSON — keep editing
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditContent("");
  }

  function handleDelete() {
    setDeleting(true);
    onDelete(entry.id);
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
          {!expanded && preview && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {preview}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(entry.createdAt)}
          </p>
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
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border bg-muted p-3 text-sm font-mono min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
              />
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
              <pre className="text-sm bg-muted rounded-lg p-3 overflow-auto max-h-[300px] whitespace-pre-wrap font-mono">
                {JSON.stringify(entry.content, null, 2)}
              </pre>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
