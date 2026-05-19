"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { clearCustomTemplateCache } from "@/lib/templates/use-custom-templates";

interface TemplateApiItem {
  id: string;
  name: string;
  description?: string;
  customDescription?: string | null;
  type: "built-in" | "custom";
  sourceFilename?: string | null;
  sourceType?: string | null;
  updatedAt?: string;
}

interface TemplatesApiResponse {
  templates?: TemplateApiItem[];
}

interface CustomTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplatesChanged: () => void | Promise<void>;
  onTemplateImported?: (templateId: string) => void | Promise<void>;
}

interface TemplateImportResponse {
  template?: {
    id?: string;
    name?: string;
    sourceFilename?: string | null;
    sourceType?: string | null;
  };
  warnings?: string[];
  confidence?: "high" | "medium" | "low";
  error?: string;
}

type TemplateMigrationSlotPath =
  | "contact.name"
  | "contact.email"
  | "contact.phone"
  | "contact.location"
  | "contact.linkedin"
  | "contact.github"
  | "summary"
  | "skills[]"
  | "experiences[].title"
  | "experiences[].company"
  | "experiences[].dates"
  | "experiences[].highlights[]"
  | "education[].institution"
  | "education[].degree"
  | "education[].field"
  | "education[].date"
  | "projects[].name"
  | "projects[].description"
  | "projects[].highlights[]"
  | "certifications[]"
  | "awards[]";

type TemplateMigrationTemplate = {
  name?: string;
} & Record<string, unknown>;

interface TemplateMigrationDraft {
  id: string;
  status: "reviewing" | "committed";
  sourceFilename: string;
  sourceType: string;
  source: {
    pages?: Array<{
      id: string;
      number: number;
      widthPt?: number;
      heightPt?: number;
    }>;
    blocks: Array<{
      id: string;
      type: string;
      text: string;
      pageId?: string;
      slotHint?: TemplateMigrationSlotPath;
      cells?: string[];
      bbox?: {
        xPt: number;
        yPt: number;
        widthPt: number;
        heightPt: number;
      };
    }>;
  };
  resume: {
    contact: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
    };
    summary?: string;
    experiences: Array<{
      company: string;
      title: string;
      dates: string;
      highlights: string[];
    }>;
    skills: string[];
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      date: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      highlights: string[];
    }>;
    certifications?: string[];
    awards?: string[];
  };
  template: TemplateMigrationTemplate;
  fidelity?: {
    score: number;
    status: "ready" | "review" | "low";
    checks: Array<{
      id: string;
      label: string;
      score: number;
      passed: boolean;
      detail: string;
    }>;
  };
  warnings: string[];
  confidence: "high" | "medium" | "low";
}

interface TemplateMigrationResponse {
  draft?: TemplateMigrationDraft;
  error?: string;
}

interface TemplateMigrationPatchResponse {
  draft?: TemplateMigrationDraft;
  error?: string;
}

interface TemplateMigrationCommitResponse {
  template?: { id?: string };
  error?: string;
}

export function CustomTemplateManagerDialog({
  open,
  onOpenChange,
  onTemplatesChanged,
  onTemplateImported,
}: CustomTemplateManagerProps) {
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const migrationInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<TemplateApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [importResult, setImportResult] =
    useState<TemplateImportResponse | null>(null);
  const [migrationDraft, setMigrationDraft] =
    useState<TemplateMigrationDraft | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationSaving, setMigrationSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState(0);
  const [selectedEducationIndex, setSelectedEducationIndex] = useState(0);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [migrationTemplateName, setMigrationTemplateName] = useState("");
  const [migrationName, setMigrationName] = useState("");
  const [migrationSummary, setMigrationSummary] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to load templates");
      const data = (await response.json()) as TemplatesApiResponse;
      setTemplates((data.templates ?? []).filter((t) => t.type === "custom"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  useEffect(() => {
    if (!migrationDraft?.template) {
      setPreviewHtml("");
      setPreviewError(null);
      return;
    }

    const controller = new AbortController();
    setPreviewLoading(true);
    setPreviewError(null);
    void fetch("/api/templates/v2/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: migrationDraft.template,
        resume: migrationDraft.resume,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as {
          html?: string;
          error?: string;
        } | null;
        if (!response.ok || !body?.html) {
          throw new Error(body?.error ?? "Could not render preview");
        }
        setPreviewHtml(body.html);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setPreviewHtml("");
        setPreviewError(
          error instanceof Error ? error.message : "Could not render preview",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setPreviewLoading(false);
      });

    return () => controller.abort();
  }, [migrationDraft]);

  async function notifyTemplatesChanged() {
    clearCustomTemplateCache();
    await onTemplatesChanged();
    await refresh();
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/templates/import", {
        method: "POST",
        body: formData,
      });
      const body = (await response
        .json()
        .catch(() => null)) as TemplateImportResponse | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not import template");
      }
      setImportResult(body);
      addToast({
        type: "success",
        title: "Template imported",
        description: `${file.name} is available in Studio.`,
      });
      await notifyTemplatesChanged();
      if (body?.template?.id) {
        await onTemplateImported?.(body.template.id);
      }
    } catch (error) {
      setImportResult(null);
      addToast({
        type: "error",
        title: "Template import failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleMigrationUpload(file: File) {
    setMigrating(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/templates/migrate", {
        method: "POST",
        body: formData,
      });
      const body = (await response
        .json()
        .catch(() => null)) as TemplateMigrationResponse | null;
      if (!response.ok || !body?.draft) {
        throw new Error(body?.error ?? "Could not migrate resume");
      }
      setMigrationDraft(body.draft);
      setMigrationTemplateName(body.draft.template.name ?? "");
      setMigrationName(body.draft.resume.contact.name ?? "");
      setMigrationSummary(body.draft.resume.summary ?? "");
      setSelectedBlockId(body.draft.source.blocks[0]?.id ?? null);
      setSelectedExperienceIndex(0);
      setSelectedEducationIndex(0);
      setSelectedProjectIndex(0);
      addToast({
        type: "success",
        title: "Migration draft ready",
        description: "Review the detected fields before saving the template.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Resume migration failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrating(false);
      if (migrationInputRef.current) migrationInputRef.current.value = "";
    }
  }

  async function patchMigrationDraft(
    body: Record<string, unknown>,
  ): Promise<TemplateMigrationDraft> {
    if (!migrationDraft) throw new Error("No migration draft");
    const response = await fetch(
      `/api/templates/migrations/${encodeURIComponent(migrationDraft.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = (await response
      .json()
      .catch(() => null)) as TemplateMigrationPatchResponse | null;
    if (!response.ok || !data?.draft) {
      throw new Error(data?.error ?? "Could not update migration draft");
    }
    setMigrationDraft(data.draft);
    setMigrationTemplateName(data.draft.template.name ?? "");
    setMigrationName(data.draft.resume.contact.name ?? "");
    setMigrationSummary(data.draft.resume.summary ?? "");
    return data.draft;
  }

  async function handleSaveMigrationReview() {
    if (!migrationDraft) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        resume: {
          ...migrationDraft.resume,
          contact: {
            ...migrationDraft.resume.contact,
            name: migrationName,
          },
          summary: migrationSummary,
        },
        template: {
          ...migrationDraft.template,
          name: migrationTemplateName,
        },
      });
      addToast({
        type: "success",
        title: "Migration review saved",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not save review",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  async function handleAssignSelectedBlock(path: TemplateMigrationSlotPath) {
    if (!migrationDraft || !selectedBlockId) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        slotCorrections: [
          {
            sourceBlockId: selectedBlockId,
            path,
            index: correctionIndexForPath(path),
          },
        ],
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not assign source text",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  function correctionIndexForPath(path: TemplateMigrationSlotPath) {
    if (path.startsWith("experiences[]")) return selectedExperienceIndex;
    if (path.startsWith("education[]")) return selectedEducationIndex;
    if (path.startsWith("projects[]")) return selectedProjectIndex;
    return undefined;
  }

  async function handleCommitMigration() {
    if (!migrationDraft) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        resume: {
          ...migrationDraft.resume,
          contact: {
            ...migrationDraft.resume.contact,
            name: migrationName,
          },
          summary: migrationSummary,
        },
        template: {
          ...migrationDraft.template,
          name: migrationTemplateName,
        },
      });
      const response = await fetch(
        `/api/templates/migrations/${encodeURIComponent(migrationDraft.id)}/commit`,
        { method: "POST" },
      );
      const data = (await response
        .json()
        .catch(() => null)) as TemplateMigrationCommitResponse | null;
      if (!response.ok || !data?.template?.id) {
        throw new Error(data?.error ?? "Could not save migrated template");
      }
      setMigrationDraft(null);
      await notifyTemplatesChanged();
      await onTemplateImported?.(data.template.id);
      addToast({
        type: "success",
        title: "Migrated template saved",
        description: "The reusable template is available in Studio.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not save migrated template",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  async function handleDelete(templateId: string) {
    setBusyId(templateId);
    try {
      const response = await fetch(
        `/api/templates?id=${encodeURIComponent(templateId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Could not delete template");
      await notifyTemplatesChanged();
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not delete template",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveMetadata(templateId: string) {
    const name = draftName.trim();
    if (!name) return;
    const description = draftDescription.trim();
    setBusyId(templateId);
    try {
      const response = await fetch("/api/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: templateId,
          name,
          description: description || null,
        }),
      });
      if (!response.ok) throw new Error("Could not update template metadata");
      setEditingId(null);
      setDraftName("");
      setDraftDescription("");
      await notifyTemplatesChanged();
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not update template",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Custom templates</DialogTitle>
          <DialogDescription>
            Import PDF, DOCX, or LaTeX templates, then edit metadata or delete
            your custom Studio templates.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.tex,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/x-tex,application/x-tex"
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <input
          ref={migrationInputRef}
          type="file"
          accept=".pdf,.docx,.tex,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/x-tex,application/x-tex"
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void handleMigrationUpload(file);
          }}
        />

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              Import template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => migrationInputRef.current?.click()}
              disabled={migrating}
            >
              {migrating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              Import existing resume
            </Button>
          </div>

          {importResult ? (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {importResult.template?.name ?? "Imported template"}
                </span>
                {importResult.confidence ? (
                  <span className="rounded-sm bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
                    {importResult.confidence} confidence
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {importResult.template?.sourceFilename ?? "Uploaded file"}
                {importResult.template?.sourceType
                  ? ` (${importResult.template.sourceType.toUpperCase()})`
                  : ""}
              </p>
              {importResult.warnings?.length ? (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {importResult.warnings.map((warning) => (
                    <p key={warning} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{warning}</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {migrationDraft ? (
            <div className="rounded-md border border-border bg-background p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{migrationDraft.sourceFilename}</p>
                  <p className="text-xs text-muted-foreground">
                    {migrationDraft.sourceType.toUpperCase()} migration -{" "}
                    {migrationDraft.confidence} confidence
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSaveMigrationReview()}
                    disabled={migrationSaving}
                  >
                    Save review
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleCommitMigration()}
                    disabled={migrationSaving}
                  >
                    Save migrated template
                  </Button>
                </div>
              </div>

              {migrationDraft.warnings.length ? (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {migrationDraft.warnings.slice(0, 3).map((warning) => (
                    <p key={warning} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{warning}</span>
                    </p>
                  ))}
                </div>
              ) : null}

              {migrationDraft.fidelity ? (
                <div className="mt-3 rounded-md border bg-muted/20 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Fidelity
                    </p>
                    <span className="rounded-sm bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
                      {migrationDraft.fidelity.score}%{" "}
                      {migrationDraft.fidelity.status}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                    {migrationDraft.fidelity.checks.slice(0, 4).map((check) => (
                      <div
                        key={check.id}
                        className="rounded-sm border border-border/70 bg-background/60 px-2 py-1"
                        title={check.detail}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate">{check.label}</span>
                          <span
                            className={
                              check.passed
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }
                          >
                            {Math.round(check.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <div className="space-y-2">
                  <Input
                    value={migrationTemplateName}
                    onChange={(event) =>
                      setMigrationTemplateName(event.currentTarget.value)
                    }
                    aria-label="Migrated template name"
                    placeholder="Template name"
                  />
                  <Input
                    value={migrationName}
                    onChange={(event) =>
                      setMigrationName(event.currentTarget.value)
                    }
                    aria-label="Migrated resume name"
                    placeholder="Resume name"
                  />
                  <Textarea
                    value={migrationSummary}
                    onChange={(event) =>
                      setMigrationSummary(event.currentTarget.value)
                    }
                    rows={4}
                    aria-label="Migrated resume summary"
                    placeholder="Summary"
                  />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <MigrationIndexSelect
                      label="Experience"
                      prefix="Job"
                      value={selectedExperienceIndex}
                      count={migrationDraft.resume.experiences.length}
                      getLabel={(index) =>
                        migrationDraft.resume.experiences[index]?.title
                      }
                      onChange={setSelectedExperienceIndex}
                    />
                    <MigrationIndexSelect
                      label="Education"
                      prefix="School"
                      value={selectedEducationIndex}
                      count={migrationDraft.resume.education.length}
                      getLabel={(index) =>
                        migrationDraft.resume.education[index]?.institution
                      }
                      onChange={setSelectedEducationIndex}
                    />
                    <MigrationIndexSelect
                      label="Project"
                      prefix="Project"
                      value={selectedProjectIndex}
                      count={migrationDraft.resume.projects?.length ?? 0}
                      getLabel={(index) =>
                        migrationDraft.resume.projects?.[index]?.name
                      }
                      onChange={setSelectedProjectIndex}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["contact.name", "Name"],
                        ["contact.email", "Email"],
                        ["contact.phone", "Phone"],
                        ["contact.location", "Location"],
                        ["contact.linkedin", "LinkedIn"],
                        ["contact.github", "GitHub"],
                        ["summary", "Summary"],
                        ["skills[]", "Skills"],
                        ["experiences[].title", "Job title"],
                        ["experiences[].company", "Company"],
                        ["experiences[].dates", "Dates"],
                        ["experiences[].highlights[]", "Bullets"],
                        ["education[].institution", "School"],
                        ["education[].degree", "Degree"],
                        ["education[].field", "Field"],
                        ["education[].date", "Grad date"],
                        ["projects[].name", "Project"],
                        ["projects[].description", "Project desc"],
                        ["projects[].highlights[]", "Project bullets"],
                        ["certifications[]", "Certs"],
                        ["awards[]", "Awards"],
                      ] as Array<[TemplateMigrationSlotPath, string]>
                    ).map(([path, label]) => (
                      <Button
                        key={path}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleAssignSelectedBlock(path)}
                        disabled={!selectedBlockId || migrationSaving}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <div className="max-h-52 space-y-1 overflow-auto rounded-md border bg-muted/20 p-2">
                    {migrationDraft.source.blocks.slice(0, 60).map((block) => (
                      <button
                        key={block.id}
                        type="button"
                        className={`w-full rounded-sm px-2 py-1 text-left text-xs transition-colors ${
                          selectedBlockId === block.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedBlockId(block.id)}
                      >
                        <span className="mr-1 text-[10px] uppercase opacity-70">
                          {block.type}
                        </span>
                        {block.slotHint ? (
                          <span className="mr-1 rounded-sm bg-background/70 px-1 text-[10px] text-muted-foreground">
                            {slotLabel(block.slotHint)}
                          </span>
                        ) : null}
                        {block.cells?.length ? (
                          <span className="mt-1 grid gap-1 sm:grid-flow-col sm:auto-cols-fr">
                            {block.cells.map((cell, index) => (
                              <span
                                key={`${block.id}-${index}`}
                                className="rounded-sm border border-border/70 bg-background/60 px-1 py-0.5"
                              >
                                {cell}
                              </span>
                            ))}
                          </span>
                        ) : (
                          block.text
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <SourceLayoutPreview
                    draft={migrationDraft}
                    selectedBlockId={selectedBlockId}
                    onSelect={setSelectedBlockId}
                  />
                  <TemplatePreview
                    html={previewHtml}
                    loading={previewLoading}
                    error={previewError}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="divide-y rounded-md border">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading templates
              </div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No custom templates yet.
              </div>
            ) : (
              templates.map((template) => {
                const editing = editingId === template.id;
                return (
                  <div
                    key={template.id}
                    className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="space-y-2">
                          <Input
                            value={draftName}
                            onChange={(event) =>
                              setDraftName(event.currentTarget.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setEditingId(null);
                                setDraftName("");
                                setDraftDescription("");
                              }
                            }}
                            aria-label="Template name"
                          />
                          <Textarea
                            value={draftDescription}
                            onChange={(event) =>
                              setDraftDescription(event.currentTarget.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setEditingId(null);
                                setDraftName("");
                                setDraftDescription("");
                              }
                            }}
                            maxLength={300}
                            rows={3}
                            aria-label="Template description"
                            placeholder="Short description shown in the template picker"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium">
                            {template.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {template.customDescription ??
                              template.description ??
                              template.sourceFilename ??
                              "Custom template"}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {editing ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setDraftName("");
                              setDraftDescription("");
                            }}
                            disabled={busyId === template.id}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleSaveMetadata(template.id)}
                            disabled={busyId === template.id}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(template.id);
                            setDraftName(template.name);
                            setDraftDescription(
                              template.customDescription ?? "",
                            );
                          }}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete(template.id)}
                        disabled={busyId === template.id}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MigrationIndexSelect({
  label,
  prefix,
  value,
  count,
  getLabel,
  onChange,
}: {
  label: string;
  prefix: string;
  value: number;
  count: number;
  getLabel: (index: number) => string | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-1 text-xs text-muted-foreground">
      <span>{label}</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      >
        {indexOptions(count).map((index) => (
          <option key={index} value={index}>
            {entryLabel(prefix, index, getLabel(index))}
          </option>
        ))}
      </select>
    </label>
  );
}

function SourceLayoutPreview({
  draft,
  selectedBlockId,
  onSelect,
}: {
  draft: TemplateMigrationDraft;
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
}) {
  const page = draft.source.pages?.[0];
  const blocks = draft.source.blocks.filter(
    (block) => block.pageId === page?.id && block.bbox,
  );

  if (!page?.widthPt || !page.heightPt || blocks.length === 0) {
    return (
      <div className="rounded-md border bg-muted/20 p-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Source layout
        </p>
        <div className="mt-2 rounded-sm border border-dashed bg-background p-4 text-xs text-muted-foreground">
          Source geometry was not available for this file. Use the text blocks
          list for review.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Source layout
        </p>
        <p className="text-[10px] text-muted-foreground">Page {page.number}</p>
      </div>
      <div
        className="relative mt-2 overflow-hidden rounded-sm border bg-background"
        style={{ aspectRatio: `${page.widthPt} / ${page.heightPt}` }}
      >
        {blocks.map((block) => {
          const bbox = block.bbox!;
          return (
            <button
              key={block.id}
              type="button"
              title={block.text}
              aria-label={`Select source block ${block.text}`}
              className={`absolute overflow-hidden rounded-sm border px-0.5 text-left text-[6px] leading-none transition-colors ${
                selectedBlockId === block.id
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-emerald-700/30 bg-emerald-700/10 text-emerald-950 hover:border-primary/60"
              }`}
              style={{
                left: `${(bbox.xPt / page.widthPt!) * 100}%`,
                top: `${(bbox.yPt / page.heightPt!) * 100}%`,
                width: `${(bbox.widthPt / page.widthPt!) * 100}%`,
                height: `${(bbox.heightPt / page.heightPt!) * 100}%`,
              }}
              onClick={() => onSelect(block.id)}
            >
              {block.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TemplatePreview({
  html,
  loading,
  error,
}: {
  html: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Rendered preview
        </p>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="mt-2 h-72 overflow-hidden rounded-sm border bg-background">
        {error ? (
          <div className="p-4 text-xs text-muted-foreground">{error}</div>
        ) : html ? (
          <iframe
            title="Migrated template preview"
            className="h-full w-full bg-background"
            srcDoc={html}
          />
        ) : (
          <div className="p-4 text-xs text-muted-foreground">
            Preview will appear after the migration draft renders.
          </div>
        )}
      </div>
    </div>
  );
}

function indexOptions(count: number): number[] {
  return Array.from({ length: Math.max(count + 1, 1) }, (_, index) => index);
}

function entryLabel(prefix: string, index: number, label?: string): string {
  return label?.trim()
    ? `${index + 1}. ${label.trim()}`
    : `${prefix} ${index + 1}`;
}

function slotLabel(path: TemplateMigrationSlotPath): string {
  const labels: Record<TemplateMigrationSlotPath, string> = {
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.location": "Location",
    "contact.linkedin": "LinkedIn",
    "contact.github": "GitHub",
    summary: "Summary",
    "skills[]": "Skills",
    "experiences[].title": "Job title",
    "experiences[].company": "Company",
    "experiences[].dates": "Dates",
    "experiences[].highlights[]": "Experience bullets",
    "education[].institution": "School",
    "education[].degree": "Degree",
    "education[].field": "Field",
    "education[].date": "Grad date",
    "projects[].name": "Project",
    "projects[].description": "Project desc",
    "projects[].highlights[]": "Project bullets",
    "certifications[]": "Certs",
    "awards[]": "Awards",
  };
  return labels[path];
}
