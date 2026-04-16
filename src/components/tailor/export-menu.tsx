"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Code,
  Globe,
  Copy,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TailoredResume } from "@/lib/resume/generator";

export interface ExportMenuProps {
  resumeId: string;
  resume: TailoredResume;
  templateId: string;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: "pdf" | "latex" | "html" | "clipboard";
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "pdf",
    label: "PDF",
    description: "Download as PDF",
    icon: <FileText className="h-4 w-4" />,
    format: "pdf",
  },
  {
    id: "latex",
    label: "LaTeX",
    description: "Download .tex file",
    icon: <Code className="h-4 w-4" />,
    format: "latex",
  },
  {
    id: "html",
    label: "HTML",
    description: "Download HTML file",
    icon: <Globe className="h-4 w-4" />,
    format: "html",
  },
  {
    id: "clipboard",
    label: "Copy to Clipboard",
    description: "Copy resume text",
    icon: <Copy className="h-4 w-4" />,
    format: "clipboard",
  },
];

function resumeToPlainText(resume: TailoredResume): string {
  const lines: string[] = [];

  // Contact
  if (resume.contact.name) lines.push(resume.contact.name);
  const contactDetails = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
  ]
    .filter(Boolean)
    .join(" | ");
  if (contactDetails) lines.push(contactDetails);
  lines.push("");

  // Summary
  if (resume.summary) {
    lines.push("SUMMARY");
    lines.push(resume.summary);
    lines.push("");
  }

  // Experience
  if (resume.experiences.length > 0) {
    lines.push("EXPERIENCE");
    for (const exp of resume.experiences) {
      lines.push(`${exp.title} at ${exp.company} (${exp.dates})`);
      for (const h of exp.highlights) {
        lines.push(`  • ${h}`);
      }
      lines.push("");
    }
  }

  // Skills
  if (resume.skills.length > 0) {
    lines.push("SKILLS");
    lines.push(resume.skills.join(", "));
    lines.push("");
  }

  // Education
  if (resume.education.length > 0) {
    lines.push("EDUCATION");
    for (const edu of resume.education) {
      lines.push(
        `${edu.degree} in ${edu.field}, ${edu.institution} (${edu.date})`
      );
    }
  }

  return lines.join("\n");
}

async function downloadExport(
  resumeId: string,
  templateId: string,
  format: "pdf" | "latex" | "html"
): Promise<void> {
  const res = await fetch("/api/resume/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeId, templateId, format }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const ext = format === "pdf" ? "pdf" : format === "latex" ? "tex" : "html";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportMenu({ resumeId, resume, templateId }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleExport = useCallback(
    async (option: ExportOption) => {
      setError(null);

      if (option.format === "clipboard") {
        try {
          const text = resumeToPlainText(resume);
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setError("Failed to copy to clipboard");
        }
        setOpen(false);
        return;
      }

      setLoading(option.id);
      try {
        await downloadExport(resumeId, templateId, option.format);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Export failed"
        );
      } finally {
        setLoading(null);
      }
    },
    [resume, resumeId, templateId]
  );

  return (
    <div className="relative" ref={menuRef}>
      <Button
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {copied ? "Copied!" : "Export"}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border bg-popover p-1 shadow-md"
          role="menu"
        >
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              role="menuitem"
              disabled={loading !== null}
              onClick={() => handleExport(option)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                "hover:bg-accent/10 hover:text-accent-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              {loading === option.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                option.icon
              )}
              <div className="text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border border-destructive/50 bg-destructive/5 p-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

// Exported for testing
export { resumeToPlainText, EXPORT_OPTIONS };
