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
  | "mismatch"
  | "structure"
  | "original"
  | "preview";

type SemanticSectionType =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "awards"
  | "publications"
  | "custom";

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
      decorative?: boolean;
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
      type: SemanticSectionType;
      title: string;
      confidence?: number;
      evidenceRefs?: string[];
      items: Array<{
        primary: string;
        secondary?: string;
        location?: string;
        dateRange?: string;
        meta?: string[];
        url?: string;
        bullets?: string[];
        confidence?: number;
        evidenceRefs?: string[];
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

type EditableStyleTokens = NonNullable<TemplateMigrationDraft["styleTokens"]>;

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

type SemanticDraftSection = NonNullable<
  NonNullable<TemplateMigrationDraft["semanticResume"]>["sections"]
>[number];

type SemanticDraftResume = NonNullable<
  TemplateMigrationDraft["semanticResume"]
>;

type SemanticDraftItem = SemanticDraftSection["items"][number];

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

const semanticSectionTypeOptions: Array<[SemanticSectionType, string]> = [
  ["summary", "Summary"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["certifications", "Certifications"],
  ["awards", "Awards"],
  ["publications", "Publications"],
  ["custom", "Custom"],
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
      const response = await fetch("/api/templates?includeLegacy=true");
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

  async function handleMarkSelectedBlockDecorative(decorative: boolean) {
    if (!migrationDraft || !selectedBlockId) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        sourceBlockDecisions: [
          {
            sourceBlockId: selectedBlockId,
            decorative,
          },
        ],
      });
      addToast({
        type: "success",
        title: decorative
          ? "Source block marked non-template"
          : "Source block restored",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not update source evidence",
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

  async function handleUpdateSemanticSection(
    sectionId: string,
    updates: { type?: SemanticSectionType; title?: string },
  ) {
    if (!migrationDraft?.semanticResume) return;
    const nextSemantic = {
      ...migrationDraft.semanticResume,
      sections: (migrationDraft.semanticResume.sections ?? []).map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    };
    await handleUpdateSemanticResume(nextSemantic, "Semantic mapping updated");
  }

  async function handleUpdateSemanticResume(
    semanticResume: SemanticDraftResume,
    successTitle = "Semantic tree updated",
  ) {
    if (!migrationDraft?.semanticResume) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({
        semanticResume,
      });
      addToast({
        type: "success",
        title: successTitle,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not update semantic tree",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  async function handleUpdateStyleTokens(styleTokens: EditableStyleTokens) {
    if (!migrationDraft) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({ styleTokens });
      addToast({
        type: "success",
        title: "Style tokens updated",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not update style tokens",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMigrationSaving(false);
    }
  }

  async function handleResetStyleTokens() {
    if (!migrationDraft) return;
    setMigrationSaving(true);
    try {
      await patchMigrationDraft({ resetStyleTokens: true });
      addToast({
        type: "success",
        title: "Style tokens reset",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not reset style tokens",
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
                      onMarkSelectedBlockDecorative={
                        handleMarkSelectedBlockDecorative
                      }
                      selectedExperienceIndex={selectedExperienceIndex}
                      selectedEducationIndex={selectedEducationIndex}
                      selectedProjectIndex={selectedProjectIndex}
                      onExperienceIndexChange={setSelectedExperienceIndex}
                      onEducationIndexChange={setSelectedEducationIndex}
                      onProjectIndexChange={setSelectedProjectIndex}
                      onAssignSelectedBlock={handleAssignSelectedBlock}
                      onUpdateRepeatGroup={handleUpdateRepeatGroup}
                      onCreateRepeatGroup={handleCreateRepeatGroup}
                      onUpdateSemanticSection={handleUpdateSemanticSection}
                      onUpdateSemanticResume={handleUpdateSemanticResume}
                      onUpdateStyleTokens={handleUpdateStyleTokens}
                      onResetStyleTokens={handleResetStyleTokens}
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
  onMarkSelectedBlockDecorative,
  selectedExperienceIndex,
  selectedEducationIndex,
  selectedProjectIndex,
  onExperienceIndexChange,
  onEducationIndexChange,
  onProjectIndexChange,
  onAssignSelectedBlock,
  onUpdateRepeatGroup,
  onCreateRepeatGroup,
  onUpdateSemanticSection,
  onUpdateSemanticResume,
  onUpdateStyleTokens,
  onResetStyleTokens,
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
  onMarkSelectedBlockDecorative: (decorative: boolean) => void | Promise<void>;
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
  onUpdateSemanticSection: (
    sectionId: string,
    updates: { type?: SemanticSectionType; title?: string },
  ) => void | Promise<void>;
  onUpdateSemanticResume: (
    semanticResume: SemanticDraftResume,
    successTitle?: string,
  ) => void | Promise<void>;
  onUpdateStyleTokens: (
    styleTokens: EditableStyleTokens,
  ) => void | Promise<void>;
  onResetStyleTokens: () => void | Promise<void>;
  migrationSaving: boolean;
  previewHtml: string;
  previewLoading: boolean;
  previewError: string | null;
}) {
  return (
    <div className="rounded-md border border-border bg-background">
      <div className="border-b border-border p-2">
        <div
          className="grid gap-1 rounded-sm bg-muted/40 p-1 text-xs sm:grid-cols-3 lg:grid-cols-7"
          aria-label="Visual template review panes"
        >
          {(
            [
              ["reusable", "Reusable Render"],
              ["semantic", "Semantic Tree"],
              ["style", "Style Tokens"],
              ["mismatch", "Mismatch Report"],
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
          <SemanticTreePane
            draft={draft}
            onUpdateSection={onUpdateSemanticSection}
            onUpdateSemanticResume={onUpdateSemanticResume}
            migrationSaving={migrationSaving}
          />
        ) : activePane === "style" ? (
          <StyleTokensPane
            draft={draft}
            onUpdateStyleTokens={onUpdateStyleTokens}
            onResetStyleTokens={onResetStyleTokens}
            migrationSaving={migrationSaving}
          />
        ) : activePane === "mismatch" ? (
          <MismatchReportPane draft={draft} />
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
              onMarkSelectedBlockDecorative={onMarkSelectedBlockDecorative}
              migrationSaving={migrationSaving}
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
  const reusableIssue = reusableTemplateBlockingMessage(draft);
  if (reusableIssue) return reusableIssue;
  return !draft.reusableTemplate &&
    draft.templateV3 &&
    draft.fidelity?.status === "low"
    ? LOW_VISUAL_FIDELITY_MESSAGE
    : null;
}

function reusableTemplateBlockingMessage(
  draft: TemplateMigrationDraft,
): string | null {
  if (!draft.reusableTemplate) return null;
  if (!draft.reusableHtml?.trim()) {
    return "Reusable render is missing. Review the mismatch report before saving.";
  }
  if (!draft.reusableTemplate.sectionOrder?.length) {
    return "Reusable template sections are missing. Review the semantic tree before saving.";
  }
  if (!draft.reusableTemplate.components?.length) {
    return "Reusable template components are missing. Review the reusable render before saving.";
  }
  if (!draft.semanticResume?.sections?.length) {
    return "Semantic sections are missing. Review the semantic tree before saving.";
  }
  if (!draft.styleTokens) {
    return "Style tokens are missing. Review the style tokens before saving.";
  }
  const scores = draft.universalAnalysis?.scores ?? {};
  if ((scores.semanticCoverage ?? 0) < 0.55) {
    return "Semantic coverage is too low to save. Fix section and item mappings first.";
  }
  if ((scores.styleCoverage ?? 0) < 0.45) {
    return "Style coverage is too low to save. Review typography and spacing tokens first.";
  }
  if ((scores.layoutResilience ?? 0) < 0.7) {
    return "Layout resilience is too low to save. Review the stress render first.";
  }
  return null;
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

function SemanticTreePane({
  draft,
  onUpdateSection,
  onUpdateSemanticResume,
  migrationSaving,
}: {
  draft: TemplateMigrationDraft;
  onUpdateSection: (
    sectionId: string,
    updates: { type?: SemanticSectionType; title?: string },
  ) => void | Promise<void>;
  onUpdateSemanticResume: (
    semanticResume: SemanticDraftResume,
    successTitle?: string,
  ) => void | Promise<void>;
  migrationSaving: boolean;
}) {
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
            <SemanticSectionCard
              key={section.id}
              semantic={semantic}
              section={section}
              onUpdateSection={onUpdateSection}
              onUpdateSemanticResume={onUpdateSemanticResume}
              migrationSaving={migrationSaving}
            />
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

function SemanticSectionCard({
  semantic,
  section,
  onUpdateSection,
  onUpdateSemanticResume,
  migrationSaving,
}: {
  semantic: SemanticDraftResume | undefined;
  section: SemanticDraftSection;
  onUpdateSection: (
    sectionId: string,
    updates: { type?: SemanticSectionType; title?: string },
  ) => void | Promise<void>;
  onUpdateSemanticResume: (
    semanticResume: SemanticDraftResume,
    successTitle?: string,
  ) => void | Promise<void>;
  migrationSaving: boolean;
}) {
  const [title, setTitle] = useState(section.title);
  const [type, setType] = useState<SemanticSectionType>(section.type);
  const dirty = title !== section.title || type !== section.type;

  useEffect(() => {
    setTitle(section.title);
    setType(section.type);
  }, [section.id, section.title, section.type]);

  function moveBullet(
    itemIndex: number,
    bulletIndex: number,
    targetItemIndex: number,
  ) {
    if (!semantic) return;
    if (
      targetItemIndex === itemIndex ||
      targetItemIndex < 0 ||
      targetItemIndex >= section.items.length
    ) {
      return;
    }
    const bullet = section.items[itemIndex]?.bullets?.[bulletIndex];
    if (!bullet) return;
    const nextSemantic: SemanticDraftResume = {
      ...semantic,
      sections: (semantic.sections ?? []).map((candidate) => {
        if (candidate.id !== section.id) return candidate;
        const items = candidate.items.map((item) => ({
          ...item,
          meta: [...(item.meta ?? [])],
          bullets: [...(item.bullets ?? [])],
          evidenceRefs: [...(item.evidenceRefs ?? [])],
        }));
        items[itemIndex].bullets.splice(bulletIndex, 1);
        const insertionIndex =
          targetItemIndex < itemIndex
            ? items[targetItemIndex].bullets.length
            : 0;
        items[targetItemIndex].bullets.splice(insertionIndex, 0, bullet);
        return { ...candidate, items };
      }),
    };
    void onUpdateSemanticResume(nextSemantic, "Bullet moved");
  }

  function splitItemFromBullet(itemIndex: number, bulletIndex: number) {
    if (!semantic) return;
    const item = section.items[itemIndex];
    const bullet = item?.bullets?.[bulletIndex]?.trim();
    if (!item || !bullet) return;
    const nextSemantic: SemanticDraftResume = {
      ...semantic,
      sections: (semantic.sections ?? []).map((candidate) => {
        if (candidate.id !== section.id) return candidate;
        const items = candidate.items.map((candidateItem) => ({
          ...candidateItem,
          meta: [...(candidateItem.meta ?? [])],
          bullets: [...(candidateItem.bullets ?? [])],
          evidenceRefs: [...(candidateItem.evidenceRefs ?? [])],
        }));
        const original = items[itemIndex];
        const movedBullets = original.bullets.slice(bulletIndex + 1);
        items[itemIndex] = {
          ...original,
          bullets: original.bullets.slice(0, bulletIndex),
        };
        items.splice(itemIndex + 1, 0, {
          primary: bullet,
          meta: [],
          bullets: movedBullets,
          confidence: Math.min(original.confidence ?? 0.7, 0.7),
          evidenceRefs: [...(original.evidenceRefs ?? [])],
        });
        return { ...candidate, items };
      }),
    };
    void onUpdateSemanticResume(nextSemantic, "Semantic item split");
  }

  function mergeItemIntoPrevious(itemIndex: number) {
    if (!semantic || itemIndex <= 0) return;
    const item = section.items[itemIndex];
    if (!item) return;
    const nextSemantic: SemanticDraftResume = {
      ...semantic,
      sections: (semantic.sections ?? []).map((candidate) => {
        if (candidate.id !== section.id) return candidate;
        const items = candidate.items.map((candidateItem) => ({
          ...candidateItem,
          meta: [...(candidateItem.meta ?? [])],
          bullets: [...(candidateItem.bullets ?? [])],
          evidenceRefs: [...(candidateItem.evidenceRefs ?? [])],
        }));
        const previous = items[itemIndex - 1];
        const current = items[itemIndex];
        const mergedHeader = semanticItemHeaderText(current);
        previous.bullets = [
          ...previous.bullets,
          ...(mergedHeader ? [mergedHeader] : []),
          ...current.bullets,
        ];
        previous.evidenceRefs = uniqueStrings([
          ...previous.evidenceRefs,
          ...current.evidenceRefs,
        ]);
        previous.confidence = Math.min(
          previous.confidence ?? 0.7,
          current.confidence ?? 0.7,
        );
        items.splice(itemIndex, 1);
        return { ...candidate, items };
      }),
    };
    void onUpdateSemanticResume(nextSemantic, "Semantic items merged");
  }

  function updateItem(
    itemIndex: number,
    updates: Pick<SemanticDraftItem, "primary"> &
      Partial<Pick<SemanticDraftItem, "secondary" | "dateRange">> &
      Partial<Pick<SemanticDraftItem, "location" | "url" | "meta">>,
  ) {
    if (!semantic) return;
    const nextSemantic: SemanticDraftResume = {
      ...semantic,
      sections: (semantic.sections ?? []).map((candidate) => {
        if (candidate.id !== section.id) return candidate;
        return {
          ...candidate,
          items: candidate.items.map((item, index) =>
            index === itemIndex ? { ...item, ...updates, confidence: 1 } : item,
          ),
        };
      }),
    };
    void onUpdateSemanticResume(nextSemantic, "Semantic item updated");
  }

  return (
    <div className="rounded-sm border border-border bg-muted/10 p-2">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Section title
          </span>
          <Input
            value={title}
            aria-label={`Title for ${section.id}`}
            className="h-8 text-xs"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Type
          </span>
          <select
            className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
            value={type}
            aria-label={`Type for ${section.id}`}
            disabled={migrationSaving}
            onChange={(event) =>
              setType(event.currentTarget.value as SemanticSectionType)
            }
          >
            {semanticSectionTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!dirty || migrationSaving || !title.trim()}
            onClick={() =>
              void onUpdateSection(section.id, {
                title: title.trim(),
                type,
              })
            }
          >
            Save
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-primary">
          {section.type}
        </span>
        <span>{formatConfidence(section.confidence)} confidence</span>
        <span>{section.items.length} items</span>
      </div>
      <div className="mt-2 space-y-2">
        {section.items.slice(0, 8).map((item, itemIndex) => (
          <SemanticItemCard
            key={`${section.id}-${itemIndex}`}
            item={item}
            itemIndex={itemIndex}
            itemCount={section.items.length}
            itemLabels={section.items.map(
              (candidateItem, candidateIndex) =>
                semanticItemHeaderText(candidateItem) ||
                `Item ${candidateIndex + 1}`,
            )}
            migrationSaving={migrationSaving}
            onUpdateItem={updateItem}
            onMergeItemIntoPrevious={mergeItemIntoPrevious}
            onMoveBullet={moveBullet}
            onSplitItemFromBullet={splitItemFromBullet}
          />
        ))}
      </div>
    </div>
  );
}

function SemanticItemCard({
  item,
  itemIndex,
  itemCount,
  itemLabels,
  migrationSaving,
  onUpdateItem,
  onMergeItemIntoPrevious,
  onMoveBullet,
  onSplitItemFromBullet,
}: {
  item: SemanticDraftItem;
  itemIndex: number;
  itemCount: number;
  itemLabels: string[];
  migrationSaving: boolean;
  onUpdateItem: (
    itemIndex: number,
    updates: Pick<SemanticDraftItem, "primary"> &
      Partial<Pick<SemanticDraftItem, "secondary" | "dateRange">> &
      Partial<Pick<SemanticDraftItem, "location" | "url" | "meta">>,
  ) => void;
  onMergeItemIntoPrevious: (itemIndex: number) => void;
  onMoveBullet: (
    itemIndex: number,
    bulletIndex: number,
    targetItemIndex: number,
  ) => void;
  onSplitItemFromBullet: (itemIndex: number, bulletIndex: number) => void;
}) {
  const [primary, setPrimary] = useState(item.primary);
  const [secondary, setSecondary] = useState(item.secondary ?? "");
  const [dateRange, setDateRange] = useState(item.dateRange ?? "");
  const [location, setLocation] = useState(item.location ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [meta, setMeta] = useState((item.meta ?? []).join(" | "));
  const dirty =
    primary !== item.primary ||
    secondary !== (item.secondary ?? "") ||
    dateRange !== (item.dateRange ?? "") ||
    location !== (item.location ?? "") ||
    url !== (item.url ?? "") ||
    meta !== (item.meta ?? []).join(" | ");

  useEffect(() => {
    setPrimary(item.primary);
    setSecondary(item.secondary ?? "");
    setDateRange(item.dateRange ?? "");
    setLocation(item.location ?? "");
    setUrl(item.url ?? "");
    setMeta((item.meta ?? []).join(" | "));
  }, [
    item.primary,
    item.secondary,
    item.dateRange,
    item.location,
    item.url,
    item.meta,
  ]);

  return (
    <div className="border-l pl-2">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_132px_auto]">
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Primary
          </span>
          <Input
            value={primary}
            aria-label={`Primary for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setPrimary(event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Secondary
          </span>
          <Input
            value={secondary}
            aria-label={`Secondary for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setSecondary(event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Date
          </span>
          <Input
            value={dateRange}
            aria-label={`Date for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setDateRange(event.currentTarget.value)}
          />
        </label>
        <div className="flex items-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!dirty || migrationSaving || !primary.trim()}
            aria-label={`Save semantic item ${itemIndex + 1}`}
            onClick={() =>
              onUpdateItem(itemIndex, {
                primary: primary.trim(),
                secondary: secondary.trim() || undefined,
                dateRange: dateRange.trim() || undefined,
                location: location.trim() || undefined,
                url: url.trim() || undefined,
                meta: splitSemanticMeta(meta),
              })
            }
          >
            Save
          </Button>
          {itemCount > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={migrationSaving || itemIndex === 0}
              aria-label={`Merge ${item.primary || `item ${itemIndex + 1}`} into previous item`}
              onClick={() => onMergeItemIntoPrevious(itemIndex)}
            >
              Merge
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Location
          </span>
          <Input
            value={location}
            aria-label={`Location for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setLocation(event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            URL
          </span>
          <Input
            value={url}
            aria-label={`URL for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setUrl(event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase text-muted-foreground">
            Metadata
          </span>
          <Input
            value={meta}
            aria-label={`Metadata for semantic item ${itemIndex + 1}`}
            className="h-8 text-xs"
            onChange={(event) => setMeta(event.currentTarget.value)}
          />
        </label>
      </div>
      {item.bullets?.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
          {item.bullets.slice(0, 5).map((bullet, bulletIndex) => (
            <li key={`${bullet}-${bulletIndex}`}>
              <div className="flex items-start justify-between gap-2">
                <span>{bullet}</span>
                <span className="flex shrink-0 gap-1">
                  {itemCount > 1 ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-[10px]"
                        disabled={migrationSaving || itemIndex === 0}
                        aria-label={`Move bullet ${bulletIndex + 1} from ${item.primary || `item ${itemIndex + 1}`} to previous item`}
                        onClick={() =>
                          onMoveBullet(itemIndex, bulletIndex, itemIndex - 1)
                        }
                      >
                        Prev
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-[10px]"
                        disabled={
                          migrationSaving || itemIndex === itemCount - 1
                        }
                        aria-label={`Move bullet ${bulletIndex + 1} from ${item.primary || `item ${itemIndex + 1}`} to next item`}
                        onClick={() =>
                          onMoveBullet(itemIndex, bulletIndex, itemIndex + 1)
                        }
                      >
                        Next
                      </Button>
                      <select
                        className="h-6 max-w-36 rounded-sm border border-border bg-background px-1 text-[10px] text-foreground"
                        disabled={migrationSaving}
                        aria-label={`Move bullet ${bulletIndex + 1} target for ${item.primary || `item ${itemIndex + 1}`}`}
                        value={String(itemIndex)}
                        onChange={(event) =>
                          onMoveBullet(
                            itemIndex,
                            bulletIndex,
                            Number(event.currentTarget.value),
                          )
                        }
                      >
                        {itemLabels.map((label, optionIndex) => (
                          <option
                            key={`${label}-${optionIndex}`}
                            value={optionIndex}
                          >
                            {optionIndex === itemIndex ? "Current item" : label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-1.5 text-[10px]"
                    disabled={migrationSaving}
                    aria-label={`Split ${item.primary || `item ${itemIndex + 1}`} from bullet ${bulletIndex + 1}`}
                    onClick={() =>
                      onSplitItemFromBullet(itemIndex, bulletIndex)
                    }
                  >
                    Split
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StyleTokensPane({
  draft,
  onUpdateStyleTokens,
  onResetStyleTokens,
  migrationSaving,
}: {
  draft: TemplateMigrationDraft;
  onUpdateStyleTokens: (
    styleTokens: EditableStyleTokens,
  ) => void | Promise<void>;
  onResetStyleTokens: () => void | Promise<void>;
  migrationSaving: boolean;
}) {
  const tokens = draft.styleTokens;
  const analysis = draft.universalAnalysis;
  const template = draft.reusableTemplate;
  const [accentColor, setAccentColor] = useState(
    tokenValue(tokens?.color?.accent, "#111111"),
  );
  const [bodyFont, setBodyFont] = useState(
    tokenString(tokens?.typography?.body, "fontFamily"),
  );
  const [bodySize, setBodySize] = useState(
    String(tokenNumber(tokens?.typography?.body, "fontSizePt", 10)),
  );
  const [headingFont, setHeadingFont] = useState(
    tokenString(tokens?.typography?.sectionHeading, "fontFamily"),
  );
  const [headingSize, setHeadingSize] = useState(
    String(tokenNumber(tokens?.typography?.sectionHeading, "fontSizePt", 11)),
  );
  const [dividerWidth, setDividerWidth] = useState(
    tokenNumber(tokens?.rules?.sectionDivider, "widthPt", 0.75),
  );
  const [sectionGap, setSectionGap] = useState(
    tokenValue(tokens?.spacing?.sectionGapPt, "8"),
  );
  const [margins, setMargins] = useState(() => pageMargins(tokens));
  const accentCandidates = scalarTokenCandidates(tokens?.color?.accent);
  const bodyTypographyCandidates = typographyTokenCandidates(
    tokens?.typography?.body,
  );
  const headingTypographyCandidates = typographyTokenCandidates(
    tokens?.typography?.sectionHeading,
  );
  const dividerWidthCandidates = numericTokenCandidates(
    tokens?.rules?.sectionDivider,
  );
  const sectionGapCandidates = numericTokenCandidates(
    tokens?.spacing?.sectionGapPt,
  );

  useEffect(() => {
    setAccentColor(tokenValue(tokens?.color?.accent, "#111111"));
    setBodyFont(tokenString(tokens?.typography?.body, "fontFamily"));
    setBodySize(
      String(tokenNumber(tokens?.typography?.body, "fontSizePt", 10)),
    );
    setHeadingFont(
      tokenString(tokens?.typography?.sectionHeading, "fontFamily"),
    );
    setHeadingSize(
      String(tokenNumber(tokens?.typography?.sectionHeading, "fontSizePt", 11)),
    );
    setDividerWidth(
      tokenNumber(tokens?.rules?.sectionDivider, "widthPt", 0.75),
    );
    setSectionGap(tokenValue(tokens?.spacing?.sectionGapPt, "8"));
    setMargins(pageMargins(tokens));
  }, [tokens]);

  function saveStyleTokens() {
    const next = editableStyleTokens(tokens);
    const nextAccent = accentColor.trim();
    const nextBodyFont = bodyFont.trim();
    const nextBodySize = Number(bodySize);
    const nextHeadingFont = headingFont.trim();
    const nextHeadingSize = Number(headingSize);
    const nextSectionGap = Number(sectionGap);
    next.color = {
      ...(next.color ?? {}),
      accent: scalarToken(nextAccent || "#111111"),
      rule: scalarToken(nextAccent || "#111111"),
    };
    next.typography = {
      ...(next.typography ?? {}),
      body: {
        ...(isRecord(next.typography?.body) ? next.typography.body : {}),
        ...(nextBodyFont ? { fontFamily: nextBodyFont } : {}),
        ...(Number.isFinite(nextBodySize) ? { fontSizePt: nextBodySize } : {}),
        confidence: 1,
        evidenceRefs: [],
      },
      sectionHeading: {
        ...(isRecord(next.typography?.sectionHeading)
          ? next.typography.sectionHeading
          : {}),
        ...(nextHeadingFont ? { fontFamily: nextHeadingFont } : {}),
        ...(Number.isFinite(nextHeadingSize)
          ? { fontSizePt: nextHeadingSize }
          : {}),
        confidence: 1,
        evidenceRefs: [],
      },
    };
    next.rules = {
      ...(next.rules ?? {}),
      sectionDivider: {
        ...(isRecord(next.rules?.sectionDivider)
          ? next.rules.sectionDivider
          : {}),
        widthPt: Number.isFinite(dividerWidth) ? dividerWidth : 0.75,
        color: nextAccent || "#111111",
        style: "solid",
        confidence: 1,
        evidenceRefs: [],
      },
    };
    next.spacing = {
      ...(next.spacing ?? {}),
      sectionGapPt: scalarToken(
        Number.isFinite(nextSectionGap) ? nextSectionGap : 8,
      ),
    };
    next.page = {
      ...(next.page ?? {}),
      margins,
    };
    void onUpdateStyleTokens(next);
  }

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
      <div className="mt-2 rounded-sm border bg-background p-3">
        <p className="text-[10px] font-medium uppercase text-muted-foreground">
          Editable overrides
        </p>
        <div className="mt-2 grid gap-2 lg:grid-cols-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Accent</span>
            <Input
              value={accentColor}
              aria-label="Accent color"
              onChange={(event) => setAccentColor(event.currentTarget.value)}
              placeholder="#111111"
            />
            {accentCandidates.length ? (
              <select
                className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                aria-label="Accent color candidate"
                value={accentColor}
                onChange={(event) => setAccentColor(event.currentTarget.value)}
              >
                <option value={accentColor}>Current: {accentColor}</option>
                {accentCandidates.map((candidate) => (
                  <option key={candidate.value} value={candidate.value}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Body font</span>
            <Input
              value={bodyFont}
              aria-label="Body font"
              onChange={(event) => setBodyFont(event.currentTarget.value)}
              placeholder="Arial, sans-serif"
            />
            {bodyTypographyCandidates.length ? (
              <select
                className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                aria-label="Body typography candidate"
                value=""
                onChange={(event) => {
                  const candidate =
                    bodyTypographyCandidates[Number(event.currentTarget.value)];
                  if (!candidate) return;
                  if (candidate.value.fontFamily) {
                    setBodyFont(candidate.value.fontFamily);
                  }
                  if (typeof candidate.value.fontSizePt === "number") {
                    setBodySize(String(candidate.value.fontSizePt));
                  }
                }}
              >
                <option value="">Current: {bodyFont || "detected"}</option>
                {bodyTypographyCandidates.map((candidate, index) => (
                  <option key={`${candidate.label}-${index}`} value={index}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Body size pt</span>
            <Input
              value={bodySize}
              aria-label="Body font size"
              onChange={(event) => setBodySize(event.currentTarget.value)}
              inputMode="decimal"
            />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Section heading font</span>
            <Input
              value={headingFont}
              aria-label="Section heading font"
              onChange={(event) => setHeadingFont(event.currentTarget.value)}
              placeholder="Arial, sans-serif"
            />
            {headingTypographyCandidates.length ? (
              <select
                className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                aria-label="Section heading typography candidate"
                value=""
                onChange={(event) => {
                  const candidate =
                    headingTypographyCandidates[
                      Number(event.currentTarget.value)
                    ];
                  if (!candidate) return;
                  if (candidate.value.fontFamily) {
                    setHeadingFont(candidate.value.fontFamily);
                  }
                  if (typeof candidate.value.fontSizePt === "number") {
                    setHeadingSize(String(candidate.value.fontSizePt));
                  }
                }}
              >
                <option value="">Current: {headingFont || "detected"}</option>
                {headingTypographyCandidates.map((candidate, index) => (
                  <option key={`${candidate.label}-${index}`} value={index}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Heading size pt</span>
            <Input
              value={headingSize}
              aria-label="Section heading font size"
              onChange={(event) => setHeadingSize(event.currentTarget.value)}
              inputMode="decimal"
            />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Divider width pt</span>
            <Input
              value={String(dividerWidth)}
              aria-label="Section divider width"
              onChange={(event) =>
                setDividerWidth(Number(event.currentTarget.value))
              }
              inputMode="decimal"
            />
            {dividerWidthCandidates.length ? (
              <select
                className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                aria-label="Section divider width candidate"
                value={String(dividerWidth)}
                onChange={(event) =>
                  setDividerWidth(Number(event.currentTarget.value))
                }
              >
                <option value={String(dividerWidth)}>
                  Current: {dividerWidth}pt
                </option>
                {dividerWidthCandidates.map((candidate) => (
                  <option key={candidate.value} value={candidate.value}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Section gap pt</span>
            <Input
              value={sectionGap}
              aria-label="Section gap"
              onChange={(event) => setSectionGap(event.currentTarget.value)}
              inputMode="decimal"
            />
            {sectionGapCandidates.length ? (
              <select
                className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                aria-label="Section gap candidate"
                value={sectionGap}
                onChange={(event) => setSectionGap(event.currentTarget.value)}
              >
                <option value={sectionGap}>Current: {sectionGap}pt</option>
                {sectionGapCandidates.map((candidate) => (
                  <option key={candidate.value} value={candidate.value}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
          {(["top", "right", "bottom", "left"] as const).map((edge) => (
            <label
              key={edge}
              className="space-y-1 text-xs text-muted-foreground"
            >
              <span>Margin {edge}</span>
              <Input
                value={margins[edge]}
                aria-label={`Margin ${edge}`}
                onChange={(event) =>
                  setMargins((current) => ({
                    ...current,
                    [edge]: event.currentTarget.value,
                  }))
                }
                placeholder="42pt"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={migrationSaving || !tokens}
            onClick={saveStyleTokens}
          >
            Apply style overrides
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={migrationSaving || !tokens}
            onClick={() => void onResetStyleTokens()}
          >
            Reset to inferred style
          </Button>
        </div>
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

function MismatchReportPane({ draft }: { draft: TemplateMigrationDraft }) {
  const items = mismatchReportItems(draft);
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Mismatch report
        </p>
        <p className="text-[10px] text-muted-foreground">
          {items.length ? `${items.length} review items` : "No blockers"}
        </p>
      </div>
      <div className="mt-2 max-h-[420px] space-y-2 overflow-auto rounded-sm border bg-background p-3 text-xs">
        {items.length ? (
          items.map((item) => (
            <div
              key={`${item.tone}-${item.label}-${item.detail}`}
              className={`rounded-sm border p-2 ${
                item.tone === "danger"
                  ? "border-red-700/20 bg-red-700/5 text-red-900"
                  : item.tone === "warning"
                    ? "border-amber-700/20 bg-amber-700/5 text-amber-900"
                    : "border-border bg-muted/20 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.label}</p>
                <span className="shrink-0 rounded-sm bg-background/70 px-1.5 py-0.5 text-[10px] uppercase">
                  {item.area}
                </span>
              </div>
              <p className="mt-1 leading-5">{item.detail}</p>
              {item.action ? (
                <p className="mt-1 text-[11px] opacity-80">{item.action}</p>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-emerald-700/20 bg-emerald-700/5 p-3 text-emerald-800">
            No semantic, style, or reusable-template gaps were detected from the
            current evidence.
          </div>
        )}
      </div>
    </div>
  );
}

function mismatchReportItems(draft: TemplateMigrationDraft): Array<{
  area: string;
  label: string;
  detail: string;
  action?: string;
  tone: "info" | "warning" | "danger";
}> {
  const items: Array<{
    area: string;
    label: string;
    detail: string;
    action?: string;
    tone: "info" | "warning" | "danger";
  }> = [];
  const scores = draft.universalAnalysis?.scores ?? {};
  if ((scores.semanticCoverage ?? 1) < 0.75) {
    items.push({
      area: "semantic",
      label: "Low semantic coverage",
      detail: `Semantic coverage is ${formatConfidence(scores.semanticCoverage)}.`,
      action:
        "Review section types and source block assignments before saving.",
      tone: "warning",
    });
  }
  if ((scores.styleCoverage ?? 1) < 0.75) {
    items.push({
      area: "style",
      label: "Low style coverage",
      detail: `Style coverage is ${formatConfidence(scores.styleCoverage)}.`,
      action: "Check typography, rule, margin, and color tokens.",
      tone: "warning",
    });
  }
  for (const section of draft.semanticResume?.sections ?? []) {
    if ((section.confidence ?? 1) < 0.7) {
      items.push({
        area: "semantic",
        label: `Review ${section.title || section.type}`,
        detail: `Section confidence is ${formatConfidence(section.confidence)}.`,
        action: "Correct the section type or title in the Semantic Tree pane.",
        tone: "warning",
      });
    }
    for (const item of section.items ?? []) {
      if ((item.confidence ?? 1) < 0.65) {
        items.push({
          area: "semantic",
          label: item.primary || `Untitled ${section.type} item`,
          detail: `Item confidence is ${formatConfidence(item.confidence)} in ${section.title || section.type}.`,
          action:
            "Check whether continuation lines or bullets belong to another item.",
          tone: "info",
        });
      }
    }
  }
  if (!draft.reusableHtml || !draft.reusableTemplate?.sectionOrder?.length) {
    items.push({
      area: "reusable",
      label: "Reusable render unavailable",
      detail: "The migration draft has no reusable semantic render.",
      action: "Do not save until semantic artifacts regenerate successfully.",
      tone: "danger",
    });
  }
  for (const warning of [
    ...(draft.semanticResume?.warnings ?? []),
    ...(draft.styleTokens?.warnings ?? []),
    ...(draft.reusableTemplate?.diagnostics ?? []),
  ].slice(0, 12)) {
    items.push({
      area: "diagnostic",
      label: "Importer diagnostic",
      detail: warning,
      tone: "info",
    });
  }
  return items;
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

function formatConfidence(value: number | undefined): string {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function semanticItemHeaderText(
  item: SemanticDraftSection["items"][number],
): string {
  return [
    item.primary,
    item.secondary,
    item.location,
    ...(item.meta ?? []),
    item.dateRange,
  ]
    .filter(Boolean)
    .join(" | ");
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function splitSemanticMeta(value: string): string[] {
  return value
    .split(/\s*[|,;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTokenJson(value: unknown): string {
  if (!value || (isRecord(value) && Object.keys(value).length === 0)) {
    return "Not detected";
  }
  return JSON.stringify(value, null, 2);
}

function editableStyleTokens(
  tokens: TemplateMigrationDraft["styleTokens"],
): EditableStyleTokens {
  return JSON.parse(
    JSON.stringify(
      tokens ?? {
        version: 1,
        sourceType: "pdf",
        filename: "imported-template",
        page: {
          size: "letter",
          widthPt: 612,
          heightPt: 792,
          margins: {
            top: "42pt",
            right: "42pt",
            bottom: "42pt",
            left: "42pt",
          },
        },
        typography: {},
        color: {},
        spacing: {},
        rules: {},
        layout: {},
        warnings: [],
      },
    ),
  ) as EditableStyleTokens;
}

function scalarToken<T extends string | number>(value: T) {
  return {
    value,
    confidence: 1,
    evidenceRefs: [],
  };
}

function tokenValue(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.value === "string") return value.value;
  if (isRecord(value) && typeof value.value === "number") {
    return String(value.value);
  }
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function tokenString(value: unknown, key: string, fallback = ""): string {
  if (isRecord(value) && typeof value[key] === "string") {
    return value[key];
  }
  return fallback;
}

function tokenNumber(value: unknown, key: string, fallback: number): number {
  if (isRecord(value) && typeof value[key] === "number") return value[key];
  return fallback;
}

function scalarTokenCandidates(
  value: unknown,
): Array<{ label: string; value: string }> {
  if (!isRecord(value) || !Array.isArray(value.candidates)) return [];
  return value.candidates
    .map((candidate) => {
      if (!isRecord(candidate) || typeof candidate.value !== "string") {
        return null;
      }
      return {
        value: candidate.value,
        label:
          typeof candidate.label === "string"
            ? candidate.label
            : candidate.value,
      };
    })
    .filter((candidate): candidate is { label: string; value: string } =>
      Boolean(candidate),
    );
}

function typographyTokenCandidates(value: unknown): Array<{
  label: string;
  value: { fontFamily?: string; fontSizePt?: number };
}> {
  if (!isRecord(value) || !Array.isArray(value.candidates)) return [];
  return value.candidates
    .map((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate.value)) return null;
      const fontFamily = candidate.value.fontFamily;
      const fontSizePt = candidate.value.fontSizePt;
      if (typeof fontFamily !== "string" && typeof fontSizePt !== "number") {
        return null;
      }
      return {
        value: {
          ...(typeof fontFamily === "string" ? { fontFamily } : {}),
          ...(typeof fontSizePt === "number" ? { fontSizePt } : {}),
        },
        label:
          typeof candidate.label === "string"
            ? candidate.label
            : [fontFamily, fontSizePt ? `${fontSizePt}pt` : null]
                .filter(Boolean)
                .join(" "),
      };
    })
    .filter(
      (
        candidate,
      ): candidate is {
        label: string;
        value: { fontFamily?: string; fontSizePt?: number };
      } => Boolean(candidate),
    );
}

function numericTokenCandidates(
  value: unknown,
): Array<{ label: string; value: number }> {
  if (!isRecord(value) || !Array.isArray(value.candidates)) return [];
  return value.candidates
    .map((candidate) => {
      if (!isRecord(candidate) || typeof candidate.value !== "number") {
        return null;
      }
      return {
        value: candidate.value,
        label:
          typeof candidate.label === "string"
            ? candidate.label
            : `${candidate.value}`,
      };
    })
    .filter((candidate): candidate is { label: string; value: number } =>
      Boolean(candidate),
    );
}

function pageMargins(tokens: TemplateMigrationDraft["styleTokens"]): {
  top: string;
  right: string;
  bottom: string;
  left: string;
} {
  const margins = tokens?.page?.margins;
  return {
    top: tokenString(margins, "top", "42pt"),
    right: tokenString(margins, "right", "42pt"),
    bottom: tokenString(margins, "bottom", "42pt"),
    left: tokenString(margins, "left", "42pt"),
  };
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
                  : block.decorative
                    ? "border-muted-foreground/30 bg-muted/60 text-muted-foreground"
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
  onMarkSelectedBlockDecorative,
  migrationSaving,
}: {
  blocks: TemplateMigrationDraft["source"]["blocks"];
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onMarkSelectedBlockDecorative: (decorative: boolean) => void | Promise<void>;
  migrationSaving: boolean;
}) {
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Source text
        </p>
        <div className="flex items-center gap-2">
          {selectedBlock ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              disabled={migrationSaving}
              onClick={() =>
                void onMarkSelectedBlockDecorative(!selectedBlock.decorative)
              }
            >
              {selectedBlock.decorative
                ? "Use as template"
                : "Mark non-template"}
            </Button>
          ) : null}
          <p className="text-[10px] text-muted-foreground">
            {Math.min(blocks.length, 80)} blocks
          </p>
        </div>
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
            {block.decorative ? (
              <span className="mr-1 rounded-sm bg-amber-700/10 px-1 text-[10px] text-amber-800">
                non-template
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
