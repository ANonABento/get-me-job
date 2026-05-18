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

export function CustomTemplateManagerDialog({
  open,
  onOpenChange,
  onTemplatesChanged,
  onTemplateImported,
}: CustomTemplateManagerProps) {
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<TemplateApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [importResult, setImportResult] =
    useState<TemplateImportResponse | null>(null);

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
      <DialogContent className="max-w-2xl">
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

        <div className="space-y-3">
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
