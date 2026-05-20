"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
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
import type { TailoredResume } from "@/lib/resume/generator";
import { clearCustomTemplateCache } from "@/lib/templates/use-custom-templates";

const LOW_VISUAL_FIDELITY_MESSAGE =
  "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.";

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
  onTemplateImported?: (
    templateId: string,
    resume: TailoredResume,
  ) => void | Promise<void>;
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
  slots: Array<{
    sourceBlockIds: string[];
  }>;
} & Record<string, unknown>;

type VisualTemplateV3 = {
  schemaVersion: 3;
  name?: string;
  repeatGroups?: V3RepeatGroup[];
} & Record<string, unknown>;

type ReviewPane =
  | "reusable"
  | "semantic"
  | "style"
  | "structure"
  | "original"
  | "preview";

type V3RepeatCollection =
  | "experiences"
  | "projects"
  | "education"
  | "skills"
  | "certifications"
  | "awards";

type V3RepeatEmptyBehavior = "hide" | "show-placeholder" | "reserve-space";

type V3RepeatGroup = {
  id: string;
  collection: V3RepeatCollection;
  nodeIds?: string[];
  emptyBehavior: V3RepeatEmptyBehavior;
  sourceRefs?: unknown[];
};

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
  resume: TailoredResume;
  template: TemplateMigrationTemplate;
  templateV3?: VisualTemplateV3;
  universalAnalysis?: {
    readiness?: string;
    scores?: Record<string, number>;
    warnings?: string[];
  };
  semanticResume?: {
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
      confidence?: number;
    };
    sections?: Array<{
      id: string;
      type: string;
      title: string;
      confidence?: number;
      items: Array<{
        primary: string;
        secondary?: string;
        location?: string;
        dateRange?: string;
        meta?: string[];
        bullets?: string[];
        confidence?: number;
      }>;
    }>;
    warnings?: string[];
  };
  styleTokens?: {
    page?: Record<string, unknown>;
    typography?: Record<string, unknown>;
    color?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    rules?: Record<string, unknown>;
    layout?: Record<string, unknown>;
    warnings?: string[];
  };
  reusableTemplate?: {
    schemaVersion?: number;
    sectionOrder?: string[];
    components?: Array<{ kind?: string; sectionType?: string; id?: string }>;
    diagnostics?: string[];
  };
  reusableHtml?: string;
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

const slotAssignmentOptions: Array<[TemplateMigrationSlotPath, string]> = [
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
];

const repeatCollectionOptions: Array<[V3RepeatCollection, string]> = [
  ["experiences", "Experience"],
  ["projects", "Projects"],
  ["education", "Education"],
  ["skills", "Skills"],
  ["certifications", "Certifications"],
  ["awards", "Awards"],
];

const repeatEmptyBehaviorOptions: Array<[V3RepeatEmptyBehavior, string]> = [
  ["hide", "Hide empty"],
  ["show-placeholder", "Show placeholder"],
  ["reserve-space", "Reserve space"],
];

export function CustomTemplateManagerDialog({
  open,
  onOpenChange,
  onTemplatesChanged,
}: CustomTemplateManagerProps) {
  const { addToast } = useToast();
  const migrationInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<TemplateApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
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
  const [reviewPane, setReviewPane] = useState<ReviewPane>("structure");

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
    if (!migrationDraft?.templateV3) {
      setPreviewHtml("");
      setPreviewError("This draft does not contain a V3 visual template.");
      return;
    }

    const controller = new AbortController();
    setPreviewLoading(true);
    setPreviewError(null);
    void fetch("/api/templates/v3/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: migrationDraft.templateV3,
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
        throw new Error(body?.error ?? "Could not import visual template");
      }
      setMigrationDraft(body.draft);
      setMigrationTemplateName(
        body.draft.templateV3?.name ?? body.draft.template.name ?? "",
      );
      setMigrationName(body.draft.resume.contact.name ?? "");
      setMigrationSummary(body.draft.resume.summary ?? "");
      setSelectedBlockId(body.draft.source.blocks[0]?.id ?? null);
      setSelectedExperienceIndex(0);
      setSelectedEducationIndex(0);
      setSelectedProjectIndex(0);
      setReviewPane(body.draft.reusableHtml ? "reusable" : "structure");
      addToast({
        type: "success",
        title: "Layout reference ready",
        description:
          "Review the detected structure before saving the template.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Visual template import failed",
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
    if (!migrationDraft) throw new Error("No visual template draft");
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
      throw new Error(data?.error ?? "Could not update visual template draft");
    }
    setMigrationDraft(data.draft);
    setMigrationTemplateName(
      data.draft.templateV3?.name ?? data.draft.template.name ?? "",
    );
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
        templateV3: migrationDraft.templateV3
          ? {
              ...migrationDraft.templateV3,
              name: migrationTemplateName,
            }
          : undefined,
      });
      addToast({
        type: "success",
        title: "Structure review saved",
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

  async function handleUpdateRepeatGroup(
    groupId: string,
    updates: Partial<Pick<V3RepeatGroup, "collection" | "emptyBehavior">>,
  ) {
    if (!migrationDraft?.templateV3) return;
    const repeatGroups = Array.isArray(migrationDraft.templateV3.repeatGroups)
      ? migrationDraft.templateV3.repeatGroups
      : [];
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        templateV3: {
          ...migrationDraft.templateV3,
          repeatGroups: repeatGroups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group,
          ),
        },
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not update repeat group",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  async function handleCreateRepeatGroup(rowId: string) {
    if (!migrationDraft?.templateV3) return;
    const groupId = uniqueRepeatGroupId(migrationDraft.templateV3, "custom");
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        templateV3: assignRowRepeatGroup(migrationDraft.templateV3, rowId, {
          id: groupId,
          collection: "experiences",
          nodeIds: [rowId],
          emptyBehavior: "hide",
          sourceRefs: [{ sourceId: rowId }],
        }),
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not create repeat group",
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
        templateV3: migrationDraft.templateV3
          ? {
              ...migrationDraft.templateV3,
              name: migrationTemplateName,
            }
          : undefined,
      });
      const response = await fetch(
        `/api/templates/migrations/${encodeURIComponent(migrationDraft.id)}/commit`,
        { method: "POST" },
      );
      const data = (await response
        .json()
        .catch(() => null)) as TemplateMigrationCommitResponse | null;
      if (!response.ok || !data?.template?.id) {
        throw new Error(data?.error ?? "Could not save visual template");
      }
      setMigrationDraft(null);
      await notifyTemplatesChanged();
      addToast({
        type: "success",
        title: "Visual template saved",
        description: "The reusable template is available in Studio.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not save visual template",
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
      <DialogContent className="max-h-[92dvh] max-w-[1120px] overflow-hidden p-0">
        <div className="border-b border-border bg-background px-6 py-5">
          <DialogHeader>
            <DialogTitle>Custom templates</DialogTitle>
            <DialogDescription>
              Upload a layout reference, review the detected structure, then
              save it as a reusable Studio template. Resume content import is
              handled separately by document upload.
            </DialogDescription>
          </DialogHeader>
        </div>

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

        <div className="max-h-[calc(92dvh-96px)] space-y-4 overflow-auto px-6 py-5">
          <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Import visual template</p>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <FlowStep
                  index={1}
                  title="Upload layout reference"
                  state={migrationDraft ? "done" : "active"}
                />
                <FlowStep
                  index={2}
                  title="Review structure"
                  state={migrationDraft ? "active" : "idle"}
                />
                <FlowStep
                  index={3}
                  title="Save visual template"
                  state={migrationDraft ? "idle" : "idle"}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-sm border border-border bg-muted/20 px-2 py-1">
                  DOCX: best for tables
                </span>
                <span className="rounded-sm border border-border bg-muted/20 px-2 py-1">
                  LaTeX: best for Overleaf
                </span>
                <span className="rounded-sm border border-border bg-muted/20 px-2 py-1">
                  PDF: selectable text only
                </span>
              </div>
            </div>
            <Button
              type="button"
              className="shrink-0"
              onClick={() => migrationInputRef.current?.click()}
              disabled={migrating}
            >
              {migrating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Upload layout reference
            </Button>
          </div>

          {migrationDraft ? (
            <div className="overflow-hidden rounded-md border border-border bg-background text-sm">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {migrationDraft.sourceFilename}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {sourceTypeLabel(migrationDraft.sourceType)} layout
                          reference
                        </p>
                      </div>
                      <ReadinessBadge draft={migrationDraft} />
                    </div>
                  </div>

                  <div className="grid gap-3 border-b border-border bg-muted/10 px-4 py-3 sm:grid-cols-2 xl:grid-cols-5">
                    <ReviewStat
                      label="Tables detected"
                      value={`${tableBlockCount(migrationDraft)} tables`}
                      tone={
                        tableBlockCount(migrationDraft) ? "good" : "warning"
                      }
                    />
                    <ReviewStat
                      label="Cells preserved"
                      value={cellPreservationLabel(migrationDraft)}
                      tone={
                        preservedCellCount(migrationDraft) > 0
                          ? "good"
                          : "warning"
                      }
                    />
                    <ReviewStat
                      label="Repeat groups"
                      value={`${repeatGroupCount(migrationDraft)} groups`}
                      tone={
                        repeatGroupCount(migrationDraft) > 0
                          ? "good"
                          : "warning"
                      }
                    />
                    <ReviewStat
                      label="Slots mapped"
                      value={`${mappedSlotCount(migrationDraft)} slots`}
                      tone={
                        mappedSlotCount(migrationDraft) >= 2
                          ? "good"
                          : "warning"
                      }
                    />
                    <ReviewStat
                      label="Visual fidelity"
                      value={styleStatusLabel(migrationDraft)}
                      tone={
                        migrationDraft.confidence === "low" ? "warning" : "good"
                      }
                    />
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            Review the structure below, then save the template.
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Uploaded text is used only as slot evidence and
                            preview sample text. This flow does not import
                            resume content into the current Studio document.
                          </p>
                        </div>
                      </div>
                    </div>

                    {migrationDraft.warnings.length ? (
                      <details className="rounded-md border border-border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-medium text-foreground">
                          Import notes
                        </summary>
                        <div className="mt-2 space-y-1.5">
                          {migrationNotes(migrationDraft).map((warning) => (
                            <p key={warning} className="leading-5">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </details>
                    ) : null}

                    <div className="space-y-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Template name
                        </span>
                        <Input
                          value={migrationTemplateName}
                          onChange={(event) =>
                            setMigrationTemplateName(event.currentTarget.value)
                          }
                          aria-label="Visual template name"
                          placeholder="Template name"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Sample preview name
                        </span>
                        <Input
                          value={migrationName}
                          onChange={(event) =>
                            setMigrationName(event.currentTarget.value)
                          }
                          aria-label="Sample preview name"
                          placeholder="Resume name"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Summary
                        </span>
                        <Textarea
                          value={migrationSummary}
                          onChange={(event) =>
                            setMigrationSummary(event.currentTarget.value)
                          }
                          rows={4}
                          aria-label="Sample preview summary"
                          placeholder="Summary"
                        />
                      </label>
                    </div>

                    <VisualTemplateReviewPanes
                      draft={migrationDraft}
                      activePane={reviewPane}
                      onPaneChange={setReviewPane}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={setSelectedBlockId}
                      selectedExperienceIndex={selectedExperienceIndex}
                      selectedEducationIndex={selectedEducationIndex}
                      selectedProjectIndex={selectedProjectIndex}
                      onExperienceIndexChange={setSelectedExperienceIndex}
                      onEducationIndexChange={setSelectedEducationIndex}
                      onProjectIndexChange={setSelectedProjectIndex}
                      onAssignSelectedBlock={handleAssignSelectedBlock}
                      onUpdateRepeatGroup={handleUpdateRepeatGroup}
                      onCreateRepeatGroup={handleCreateRepeatGroup}
                      migrationSaving={migrationSaving}
                      previewHtml={previewHtml}
                      previewLoading={previewLoading}
                      previewError={previewError}
                    />
                  </div>
                </div>

                <div className="bg-muted/10 p-4">
                  <div className="space-y-3 lg:sticky lg:top-4">
                    <TemplatePreview
                      title={
                        migrationDraft.reusableHtml
                          ? "Reusable render"
                          : "Visual evidence render"
                      }
                      emptyMessage="Preview will appear after the template draft renders."
                      html={migrationDraft.reusableHtml ?? previewHtml}
                      loading={
                        migrationDraft.reusableHtml ? false : previewLoading
                      }
                      error={migrationDraft.reusableHtml ? null : previewError}
                    />
                    {visualTemplateBlockingMessage(migrationDraft) ? (
                      <div className="rounded-md border border-amber-700/25 bg-amber-700/10 px-3 py-2 text-xs leading-5 text-amber-900">
                        {visualTemplateBlockingMessage(migrationDraft)}
                      </div>
                    ) : null}
                    <div className="grid gap-2">
                      <Button
                        type="button"
                        onClick={() => void handleCommitMigration()}
                        disabled={
                          migrationSaving ||
                          Boolean(visualTemplateBlockingMessage(migrationDraft))
                        }
                      >
                        {migrationSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save visual template
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handleSaveMigrationReview()}
                        disabled={migrationSaving}
                      >
                        Apply edits to preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!migrationDraft ? (
            <SavedTemplateList
              loading={loading}
              templates={templates}
              busyId={busyId}
              editingId={editingId}
              draftName={draftName}
              draftDescription={draftDescription}
              onEdit={(template) => {
                setEditingId(template.id);
                setDraftName(template.name);
                setDraftDescription(template.customDescription ?? "");
              }}
              onCancelEdit={() => {
                setEditingId(null);
                setDraftName("");
                setDraftDescription("");
              }}
              onDraftNameChange={setDraftName}
              onDraftDescriptionChange={setDraftDescription}
              onSaveMetadata={handleSaveMetadata}
              onDelete={handleDelete}
            />
          ) : null}
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

function VisualTemplateReviewPanes({
  draft,
  activePane,
  onPaneChange,
  selectedBlockId,
  onSelectBlock,
  selectedExperienceIndex,
  selectedEducationIndex,
  selectedProjectIndex,
  onExperienceIndexChange,
  onEducationIndexChange,
  onProjectIndexChange,
  onAssignSelectedBlock,
  onUpdateRepeatGroup,
  onCreateRepeatGroup,
  migrationSaving,
  previewHtml,
  previewLoading,
  previewError,
}: {
  draft: TemplateMigrationDraft;
  activePane: ReviewPane;
  onPaneChange: (pane: ReviewPane) => void;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  selectedExperienceIndex: number;
  selectedEducationIndex: number;
  selectedProjectIndex: number;
  onExperienceIndexChange: (index: number) => void;
  onEducationIndexChange: (index: number) => void;
  onProjectIndexChange: (index: number) => void;
  onAssignSelectedBlock: (
    path: TemplateMigrationSlotPath,
  ) => void | Promise<void>;
  onUpdateRepeatGroup: (
    groupId: string,
    updates: Partial<Pick<V3RepeatGroup, "collection" | "emptyBehavior">>,
  ) => void | Promise<void>;
  onCreateRepeatGroup: (rowId: string) => void | Promise<void>;
  migrationSaving: boolean;
  previewHtml: string;
  previewLoading: boolean;
  previewError: string | null;
}) {
  return (
    <div className="rounded-md border border-border bg-background">
      <div className="border-b border-border p-2">
        <div
          className="grid gap-1 rounded-sm bg-muted/40 p-1 text-xs sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Visual template review panes"
        >
          {(
            [
              ["reusable", "Reusable Render"],
              ["semantic", "Semantic Tree"],
              ["style", "Style Tokens"],
              ["structure", "Structure"],
              ["original", "Source Evidence"],
              ["preview", "Visual Evidence"],
            ] as Array<[ReviewPane, string]>
          ).map(([pane, label]) => (
            <button
              key={pane}
              type="button"
              className={`rounded-sm px-2 py-1.5 font-medium transition-colors ${
                activePane === pane
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onPaneChange(pane)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3">
        {activePane === "reusable" ? (
          <TemplatePreview
            title="Reusable render"
            emptyMessage="Reusable render will appear after semantic template generation."
            html={draft.reusableHtml ?? ""}
            loading={false}
            error={
              draft.reusableHtml
                ? null
                : "Reusable render is unavailable for this draft."
            }
          />
        ) : activePane === "semantic" ? (
          <SemanticTreePane draft={draft} />
        ) : activePane === "style" ? (
          <StyleTokensPane draft={draft} />
        ) : activePane === "original" ? (
          <div className="space-y-3">
            <SourceLayoutPreview
              draft={draft}
              selectedBlockId={selectedBlockId}
              onSelect={onSelectBlock}
            />
            <SourceBlocksList
              blocks={draft.source.blocks}
              selectedBlockId={selectedBlockId}
              onSelect={onSelectBlock}
            />
          </div>
        ) : activePane === "preview" ? (
          <TemplatePreview
            title="Visual evidence render"
            emptyMessage="Visual evidence render will appear after the V3 draft renders."
            html={previewHtml}
            loading={previewLoading}
            error={previewError}
          />
        ) : (
          <StructureReviewPane
            draft={draft}
            selectedBlockId={selectedBlockId}
            selectedExperienceIndex={selectedExperienceIndex}
            selectedEducationIndex={selectedEducationIndex}
            selectedProjectIndex={selectedProjectIndex}
            onExperienceIndexChange={onExperienceIndexChange}
            onEducationIndexChange={onEducationIndexChange}
            onProjectIndexChange={onProjectIndexChange}
            onAssignSelectedBlock={onAssignSelectedBlock}
            onUpdateRepeatGroup={onUpdateRepeatGroup}
            onCreateRepeatGroup={onCreateRepeatGroup}
            migrationSaving={migrationSaving}
          />
        )}
      </div>
    </div>
  );
}

function StructureReviewPane({
  draft,
  selectedBlockId,
  selectedExperienceIndex,
  selectedEducationIndex,
  selectedProjectIndex,
  onExperienceIndexChange,
  onEducationIndexChange,
  onProjectIndexChange,
  onAssignSelectedBlock,
  onUpdateRepeatGroup,
  onCreateRepeatGroup,
  migrationSaving,
}: {
  draft: TemplateMigrationDraft;
  selectedBlockId: string | null;
  selectedExperienceIndex: number;
  selectedEducationIndex: number;
  selectedProjectIndex: number;
  onExperienceIndexChange: (index: number) => void;
  onEducationIndexChange: (index: number) => void;
  onProjectIndexChange: (index: number) => void;
  onAssignSelectedBlock: (
    path: TemplateMigrationSlotPath,
  ) => void | Promise<void>;
  onUpdateRepeatGroup: (
    groupId: string,
    updates: Partial<Pick<V3RepeatGroup, "collection" | "emptyBehavior">>,
  ) => void | Promise<void>;
  onCreateRepeatGroup: (rowId: string) => void | Promise<void>;
  migrationSaving: boolean;
}) {
  return (
    <div className="space-y-4">
      <DetectedStructureTree
        draft={draft}
        onUpdateRepeatGroup={onUpdateRepeatGroup}
        onCreateRepeatGroup={onCreateRepeatGroup}
        migrationSaving={migrationSaving}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <MigrationIndexSelect
          label="Experience"
          prefix="Job"
          value={selectedExperienceIndex}
          count={draft.resume.experiences.length}
          getLabel={(index) => draft.resume.experiences[index]?.title}
          onChange={onExperienceIndexChange}
        />
        <MigrationIndexSelect
          label="Education"
          prefix="School"
          value={selectedEducationIndex}
          count={draft.resume.education.length}
          getLabel={(index) => draft.resume.education[index]?.institution}
          onChange={onEducationIndexChange}
        />
        <MigrationIndexSelect
          label="Project"
          prefix="Project"
          value={selectedProjectIndex}
          count={draft.resume.projects?.length ?? 0}
          getLabel={(index) => draft.resume.projects?.[index]?.name}
          onChange={onProjectIndexChange}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Assign selected source block
        </p>
        <div className="flex flex-wrap gap-2">
          {slotAssignmentOptions.map(([path, label]) => (
            <Button
              key={path}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onAssignSelectedBlock(path)}
              disabled={!selectedBlockId || migrationSaving}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetectedStructureTree({
  draft,
  onUpdateRepeatGroup,
  onCreateRepeatGroup,
  migrationSaving,
}: {
  draft: TemplateMigrationDraft;
  onUpdateRepeatGroup: (
    groupId: string,
    updates: Partial<Pick<V3RepeatGroup, "collection" | "emptyBehavior">>,
  ) => void | Promise<void>;
  onCreateRepeatGroup: (rowId: string) => void | Promise<void>;
  migrationSaving: boolean;
}) {
  const tables = v3Tables(draft);
  const slots = v3SlotSummaries(draft);
  const repeatGroups = v3RepeatGroupSummaries(draft);
  return (
    <div className="rounded-md border border-border bg-muted/10">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Detected structure
        </p>
        <p className="text-[10px] text-muted-foreground">
          {tables.length || 0} tables / {slots.length} slots
        </p>
      </div>
      <div className="max-h-[360px] overflow-auto p-3 text-xs">
        <div className="font-medium text-foreground">Page</div>
        {tables.length ? (
          <div className="mt-2 space-y-2 border-l border-border pl-3">
            {tables.map((table, tableIndex) => (
              <div key={table.id ?? `table-${tableIndex}`}>
                <div className="font-medium text-foreground">
                  Outer table
                  <span className="ml-2 text-muted-foreground">
                    {table.rows.length} rows
                  </span>
                </div>
                <div className="mt-1 space-y-1 border-l border-border pl-3">
                  {table.rows.slice(0, 12).map((row, rowIndex) => (
                    <div key={row.id ?? `${tableIndex}-${rowIndex}`}>
                      <div className="flex items-center justify-between gap-2 text-muted-foreground">
                        <div>
                          Row {rowIndex + 1}
                          {row.repeatGroupId ? (
                            <span className="ml-2 rounded-sm bg-emerald-700/10 px-1 text-emerald-800">
                              repeat group
                            </span>
                          ) : null}
                        </div>
                        {row.id && !row.repeatGroupId ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            disabled={migrationSaving}
                            onClick={() => void onCreateRepeatGroup(row.id!)}
                          >
                            Mark repeat
                          </Button>
                        ) : null}
                      </div>
                      <div className="mt-1 grid gap-1 sm:grid-cols-2">
                        {(row.cells ?? []).map((cell, cellIndex) => (
                          <div
                            key={cell.id ?? `${rowIndex}-${cellIndex}`}
                            className="rounded-sm border border-border bg-background px-2 py-1"
                          >
                            <span className="text-muted-foreground">
                              Cell {cellIndex + 1}
                            </span>
                            {cellSlotLabels(cell).map((label) => (
                              <span
                                key={label}
                                className="ml-1 rounded-sm bg-primary/10 px-1 text-primary"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 rounded-sm border border-dashed border-border bg-background p-3 text-muted-foreground">
            No first-class table was detected. Review source text and slot
            mappings before saving.
          </p>
        )}
        {repeatGroups.length ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="font-medium text-foreground">Repeat groups</p>
            <div className="mt-2 space-y-2">
              {repeatGroups.map((group) => (
                <div
                  key={group.id}
                  className="grid gap-2 rounded-sm border border-emerald-700/20 bg-emerald-700/5 p-2 sm:grid-cols-[1fr_1fr]"
                >
                  <label className="space-y-1">
                    <span className="block text-[10px] font-medium uppercase text-muted-foreground">
                      Collection
                    </span>
                    <select
                      className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                      value={group.collection}
                      aria-label={`Collection for ${group.id}`}
                      disabled={migrationSaving}
                      onChange={(event) =>
                        void onUpdateRepeatGroup(group.id, {
                          collection: event.currentTarget
                            .value as V3RepeatCollection,
                        })
                      }
                    >
                      {repeatCollectionOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[10px] font-medium uppercase text-muted-foreground">
                      Empty rows
                    </span>
                    <select
                      className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                      value={group.emptyBehavior}
                      aria-label={`Empty behavior for ${group.id}`}
                      disabled={migrationSaving}
                      onChange={(event) =>
                        void onUpdateRepeatGroup(group.id, {
                          emptyBehavior: event.currentTarget
                            .value as V3RepeatEmptyBehavior,
                        })
                      }
                    >
                      {repeatEmptyBehaviorOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
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

function SavedTemplateList({
  loading,
  templates,
  busyId,
  editingId,
  draftName,
  draftDescription,
  onEdit,
  onCancelEdit,
  onDraftNameChange,
  onDraftDescriptionChange,
  onSaveMetadata,
  onDelete,
}: {
  loading: boolean;
  templates: TemplateApiItem[];
  busyId: string | null;
  editingId: string | null;
  draftName: string;
  draftDescription: string;
  onEdit: (template: TemplateApiItem) => void;
  onCancelEdit: () => void;
  onDraftNameChange: (value: string) => void;
  onDraftDescriptionChange: (value: string) => void;
  onSaveMetadata: (templateId: string) => void | Promise<void>;
  onDelete: (templateId: string) => void | Promise<void>;
}) {
  return (
    <div className="divide-y rounded-md border bg-background">
      <div className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
        Saved templates
      </div>
      {loading ? (
        <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading templates
        </div>
      ) : templates.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No custom templates yet. Import a visual template to add it here.
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
                        onDraftNameChange(event.currentTarget.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") onCancelEdit();
                      }}
                      aria-label="Template name"
                    />
                    <Textarea
                      value={draftDescription}
                      onChange={(event) =>
                        onDraftDescriptionChange(event.currentTarget.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") onCancelEdit();
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
                      onClick={onCancelEdit}
                      disabled={busyId === template.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onSaveMetadata(template.id)}
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
                    onClick={() => onEdit(template)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void onDelete(template.id)}
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
  );
}

function FlowStep({
  index,
  title,
  state,
}: {
  index: number;
  title: string;
  state: "done" | "active" | "idle";
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-sm border px-2.5 py-2 ${
        state === "active"
          ? "border-primary/40 bg-primary/5 text-foreground"
          : state === "done"
            ? "border-emerald-700/20 bg-emerald-700/5 text-foreground"
            : "border-border bg-muted/10"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          state === "done"
            ? "bg-emerald-700 text-white"
            : state === "active"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {state === "done" ? <CheckCircle2 className="h-3 w-3" /> : index}
      </span>
      <span className="truncate">{title}</span>
    </div>
  );
}

function ReviewStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warning" | "neutral";
}) {
  const valueClass =
    tone === "good"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-foreground";
  return (
    <div className="rounded-sm border border-border bg-background px-3 py-2">
      <p className="text-[10px] font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function ReadinessBadge({ draft }: { draft: TemplateMigrationDraft }) {
  const status = migrationReadiness(draft);
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium ${status.className}`}
      title={status.detail}
    >
      {status.tone === "warning" ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      {status.label}
    </div>
  );
}

function migrationReadiness(draft: TemplateMigrationDraft): {
  label: string;
  detail: string;
  tone: "good" | "warning";
  className: string;
} {
  const blockingMessage = visualTemplateBlockingMessage(draft);
  if (blockingMessage) {
    return {
      label: "Cannot save yet",
      detail: blockingMessage,
      tone: "warning",
      className: "border-amber-700/25 bg-amber-700/10 text-amber-800",
    };
  }
  if (draft.confidence === "low") {
    return {
      label: "Review carefully",
      detail: "Some fields or style details may need manual correction.",
      tone: "warning",
      className: "border-amber-700/25 bg-amber-700/10 text-amber-800",
    };
  }
  if (draft.fidelity?.status === "review" || draft.confidence === "medium") {
    return {
      label: "Ready after review",
      detail:
        "Check the preview and adjust any incorrect fields before saving.",
      tone: "warning",
      className: "border-amber-700/25 bg-amber-700/10 text-amber-800",
    };
  }
  return {
    label: "Ready to save",
    detail: "The imported template has enough text, style, and field coverage.",
    tone: "good",
    className: "border-emerald-700/25 bg-emerald-700/10 text-emerald-800",
  };
}

function visualTemplateBlockingMessage(
  draft: TemplateMigrationDraft,
): string | null {
  return draft.templateV3 && draft.fidelity?.status === "low"
    ? LOW_VISUAL_FIDELITY_MESSAGE
    : null;
}

function mappedSlotCount(draft: TemplateMigrationDraft): number {
  if (draft.templateV3) {
    return Array.isArray(draft.templateV3.slots)
      ? draft.templateV3.slots.length
      : 0;
  }
  return draft.template.slots.filter((slot) => slot.sourceBlockIds.length)
    .length;
}

function tableBlockCount(draft: TemplateMigrationDraft): number {
  if (draft.templateV3) return v3Tables(draft).length;
  return draft.source.blocks.filter((block) => block.type === "table-row")
    .length
    ? 1
    : 0;
}

function cellPreservationLabel(draft: TemplateMigrationDraft): string {
  const preserved = preservedCellCount(draft);
  const source = sourceCellCount(draft);
  return source ? `${preserved}/${source} cells` : `${preserved} cells`;
}

function preservedCellCount(draft: TemplateMigrationDraft): number {
  return v3Tables(draft).reduce(
    (count, table) =>
      count +
      table.rows.reduce(
        (rowCount: number, row: { cells?: unknown[] }) =>
          rowCount + (Array.isArray(row.cells) ? row.cells.length : 0),
        0,
      ),
    0,
  );
}

function sourceCellCount(draft: TemplateMigrationDraft): number {
  return draft.source.blocks.reduce(
    (count, block) => count + (block.cells?.length ?? 0),
    0,
  );
}

function repeatGroupCount(draft: TemplateMigrationDraft): number {
  if (!draft.templateV3) return 0;
  return Array.isArray(draft.templateV3.repeatGroups)
    ? draft.templateV3.repeatGroups.length
    : 0;
}

function v3Tables(draft: TemplateMigrationDraft): Array<{
  id?: string;
  rows: Array<{
    id?: string;
    repeatGroupId?: string;
    cells?: Array<{
      id?: string;
      nodes?: Array<{ kind?: string; slotId?: string }>;
    }>;
  }>;
}> {
  if (!draft.templateV3) return [];
  const regions = Array.isArray(draft.templateV3.regions)
    ? draft.templateV3.regions
    : [];
  return regions.flatMap((region) => {
    const nodes: unknown[] = Array.isArray(region.nodes) ? region.nodes : [];
    return nodes.filter(
      (
        node,
      ): node is {
        id?: string;
        rows: Array<{
          id?: string;
          repeatGroupId?: string;
          cells?: Array<{
            id?: string;
            nodes?: Array<{ kind?: string; slotId?: string }>;
          }>;
        }>;
      } =>
        typeof node === "object" &&
        node !== null &&
        (node as { kind?: string }).kind === "table" &&
        Array.isArray((node as { rows?: unknown }).rows),
    );
  });
}

function v3SlotSummaries(
  draft: TemplateMigrationDraft,
): Array<{ id: string; path: string }> {
  if (!draft.templateV3 || !Array.isArray(draft.templateV3.slots)) return [];
  return draft.templateV3.slots
    .filter((slot): slot is { id: string; path: string } =>
      Boolean(
        typeof slot === "object" &&
        slot !== null &&
        typeof (slot as { id?: unknown }).id === "string" &&
        typeof (slot as { path?: unknown }).path === "string",
      ),
    )
    .map((slot) => ({ id: slot.id, path: slot.path }));
}

function v3RepeatGroupSummaries(
  draft: TemplateMigrationDraft,
): V3RepeatGroup[] {
  if (!draft.templateV3 || !Array.isArray(draft.templateV3.repeatGroups)) {
    return [];
  }
  return draft.templateV3.repeatGroups
    .filter((group): group is V3RepeatGroup =>
      Boolean(
        typeof group === "object" &&
        group !== null &&
        typeof (group as { id?: unknown }).id === "string" &&
        isRepeatCollection((group as { collection?: unknown }).collection),
      ),
    )
    .map((group) => ({
      ...group,
      emptyBehavior: isRepeatEmptyBehavior(group.emptyBehavior)
        ? group.emptyBehavior
        : "hide",
    }));
}

function isRepeatCollection(value: unknown): value is V3RepeatCollection {
  return repeatCollectionOptions.some(([collection]) => collection === value);
}

function isRepeatEmptyBehavior(value: unknown): value is V3RepeatEmptyBehavior {
  return repeatEmptyBehaviorOptions.some(([behavior]) => behavior === value);
}

function uniqueRepeatGroupId(
  template: VisualTemplateV3,
  collection: V3RepeatCollection | "custom",
): string {
  const repeatGroups = Array.isArray(template.repeatGroups)
    ? template.repeatGroups
    : [];
  const base = `repeat-${collection}`;
  let id = base;
  let index = 2;
  const existing = new Set(repeatGroups.map((group) => group.id));
  while (existing.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function assignRowRepeatGroup(
  template: VisualTemplateV3,
  rowId: string,
  group: V3RepeatGroup,
): VisualTemplateV3 {
  const repeatGroups = Array.isArray(template.repeatGroups)
    ? template.repeatGroups
    : [];
  return {
    ...template,
    repeatGroups: [...repeatGroups, group],
    regions: Array.isArray(template.regions)
      ? template.regions.map((region) => ({
          ...region,
          nodes: Array.isArray(region.nodes)
            ? region.nodes.map((node: unknown) =>
                assignRowRepeatGroupToNode(node, rowId, group.id),
              )
            : region.nodes,
        }))
      : template.regions,
  };
}

function assignRowRepeatGroupToNode(
  node: unknown,
  rowId: string,
  groupId: string,
): unknown {
  if (!isRecord(node)) return node;
  if (node.kind === "table" && Array.isArray(node.rows)) {
    return {
      ...node,
      rows: node.rows.map((row) =>
        isRecord(row) && row.id === rowId
          ? { ...row, repeatGroupId: groupId }
          : row,
      ),
    };
  }
  return node;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cellSlotLabels(cell: {
  nodes?: Array<{ kind?: string; slotId?: string }>;
}): string[] {
  return (cell.nodes ?? [])
    .map((node) =>
      (node.kind === "slot" || node.kind === "list") && node.slotId
        ? node.slotId.replace(/^slot-/, "").replace(/-/g, ".")
        : "",
    )
    .filter(Boolean)
    .slice(0, 3);
}

function sourceTypeLabel(sourceType: string): string {
  if (sourceType === "docx") return "DOCX";
  if (sourceType === "tex") return "LaTeX";
  return sourceType.toUpperCase();
}

function styleStatusLabel(draft: TemplateMigrationDraft): string {
  if (draft.confidence === "high") return "Style captured";
  if (draft.confidence === "medium") return "Mostly captured";
  return "Needs review";
}

function migrationNotes(draft: TemplateMigrationDraft): string[] {
  return draft.warnings.map((warning) => {
    if (warning.startsWith("Used defaults for")) {
      return "Some optional styling was not explicit in the file, so common document defaults were used.";
    }
    if (/DOCX table geometry/i.test(warning)) {
      return "DOCX table rows were preserved as grid-style template sections where possible.";
    }
    return warning;
  });
}

function SemanticTreePane({ draft }: { draft: TemplateMigrationDraft }) {
  const semantic = draft.semanticResume;
  const sections = semantic?.sections ?? [];
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Semantic tree
        </p>
        <p className="text-[10px] text-muted-foreground">
          {sections.length} sections
        </p>
      </div>
      <div className="mt-2 max-h-[420px] space-y-3 overflow-auto rounded-sm border bg-background p-3 text-xs">
        <div>
          <p className="font-medium text-foreground">
            {semantic?.contact?.name || draft.resume.contact.name || "Contact"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {[
              semantic?.contact?.email,
              semantic?.contact?.phone,
              semantic?.contact?.location,
              semantic?.contact?.linkedin,
              semantic?.contact?.github,
            ]
              .filter(Boolean)
              .join(" | ") || "No contact details detected"}
          </p>
        </div>
        {sections.length ? (
          sections.map((section) => (
            <div
              key={section.id}
              className="rounded-sm border border-border bg-muted/10 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">
                  {section.title || section.type}
                </p>
                <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  {section.type}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {section.items.slice(0, 8).map((item, index) => (
                  <div
                    key={`${section.id}-${index}`}
                    className="border-l border-border pl-2"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {item.primary || "Untitled item"}
                      </p>
                      {item.dateRange ? (
                        <p className="shrink-0 text-[10px] text-muted-foreground">
                          {item.dateRange}
                        </p>
                      ) : null}
                    </div>
                    {item.secondary ? (
                      <p className="mt-0.5 text-muted-foreground">
                        {item.secondary}
                      </p>
                    ) : null}
                    {item.bullets?.length ? (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
                        {item.bullets.slice(0, 5).map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            Semantic sections are unavailable for this draft.
          </p>
        )}
        {semantic?.warnings?.length ? (
          <div className="rounded-sm border border-amber-700/20 bg-amber-700/5 p-2 text-amber-800">
            {semantic.warnings.slice(0, 4).join(" ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StyleTokensPane({ draft }: { draft: TemplateMigrationDraft }) {
  const tokens = draft.styleTokens;
  const analysis = draft.universalAnalysis;
  const template = draft.reusableTemplate;
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Style tokens
        </p>
        <p className="text-[10px] text-muted-foreground">
          {analysis?.readiness ?? "unknown"} readiness
        </p>
      </div>
      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        <TokenSummaryCard title="Page" value={formatTokenJson(tokens?.page)} />
        <TokenSummaryCard
          title="Typography"
          value={formatTokenJson(tokens?.typography)}
        />
        <TokenSummaryCard
          title="Color"
          value={formatTokenJson(tokens?.color)}
        />
        <TokenSummaryCard
          title="Spacing"
          value={formatTokenJson(tokens?.spacing)}
        />
        <TokenSummaryCard
          title="Rules"
          value={formatTokenJson(tokens?.rules)}
        />
        <TokenSummaryCard
          title="Reusable components"
          value={
            template?.components?.length
              ? template.components
                  .map((component) =>
                    component.sectionType
                      ? `${component.kind}:${component.sectionType}`
                      : component.kind,
                  )
                  .filter(Boolean)
                  .join("\n")
              : "No reusable components available"
          }
        />
      </div>
      {tokens?.warnings?.length || template?.diagnostics?.length ? (
        <div className="mt-3 rounded-sm border border-amber-700/20 bg-amber-700/5 p-2 text-xs text-amber-800">
          {[...(tokens?.warnings ?? []), ...(template?.diagnostics ?? [])]
            .slice(0, 6)
            .join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function TokenSummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-h-24 rounded-sm border border-border bg-background p-2">
      <p className="text-[10px] font-medium uppercase text-muted-foreground">
        {title}
      </p>
      <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-foreground">
        {value}
      </pre>
    </div>
  );
}

function formatTokenJson(value: unknown): string {
  if (!value || (isRecord(value) && Object.keys(value).length === 0)) {
    return "Not detected";
  }
  return JSON.stringify(value, null, 2);
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
          Source geometry was not available for this file. Review the detected
          structure instead.
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

function SourceBlocksList({
  blocks,
  selectedBlockId,
  onSelect,
}: {
  blocks: TemplateMigrationDraft["source"]["blocks"];
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Source text
        </p>
        <p className="text-[10px] text-muted-foreground">
          {Math.min(blocks.length, 80)} blocks
        </p>
      </div>
      <div className="max-h-[360px] space-y-1 overflow-auto rounded-md border bg-muted/10 p-2">
        {blocks.slice(0, 80).map((block) => (
          <button
            key={block.id}
            type="button"
            className={`w-full rounded-sm px-2 py-1.5 text-left text-xs leading-5 transition-colors ${
              selectedBlockId === block.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelect(block.id)}
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
              <span className="mt-1 grid gap-1">
                {block.cells.map((cell, index) => (
                  <span
                    key={`${block.id}-${index}`}
                    className="rounded-sm border border-border/70 bg-background/60 px-1.5 py-0.5"
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
  );
}

function TemplatePreview({
  title,
  emptyMessage,
  html,
  loading,
  error,
}: {
  title: string;
  emptyMessage: string;
  html: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {title}
        </p>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="mt-2 h-[360px] overflow-hidden rounded-sm border bg-background">
        {error ? (
          <div className="p-4 text-xs text-muted-foreground">{error}</div>
        ) : html ? (
          <iframe
            title={title}
            className="h-[278%] w-[278%] origin-top-left scale-[0.36] bg-background"
            srcDoc={html}
          />
        ) : (
          <div className="p-4 text-xs text-muted-foreground">
            {emptyMessage}
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
