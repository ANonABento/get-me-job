"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Editor } from "@tiptap/react";
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileCode,
  FileText,
  History,
  Link2,
  Loader2,
  PanelLeft,
  PanelRight,
  Pencil,
  Plus,
  RotateCcw,
  RotateCw,
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  Wand2,
} from "lucide-react";
import { nowEpoch } from "@/lib/format/time";
import {
  COVER_LETTER_TEMPLATES,
  getCoverLetterTemplate,
} from "@/lib/builder/cover-letter-document";
import { getTemplate, TEMPLATES } from "@/lib/resume/template-data";
import type { TailoredResume } from "@/lib/resume/generator";
import type { ResumeTemplate } from "@/lib/resume/template-types";
import { cn } from "@/lib/utils";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TemplatePreviewThumbnail } from "./template-preview-thumbnail";
import {
  DOCUMENT_MODE_LABELS,
  DOCUMENT_MODE_OPTIONS,
  type DocumentMode,
} from "./studio-documents";
import {
  getStudioSaveStatusIcon,
  getStudioSaveStatusLabel,
  type StudioSaveStatus,
} from "./save-status";
import { CustomTemplateManagerDialog } from "./custom-template-manager";

interface StudioSubBarProps {
  documentMode: DocumentMode;
  onDocumentModeChange: (mode: DocumentMode) => void;
  coverLetterCount: number;

  activeDocumentId: string | null;
  activeDocumentName: string;
  onRename: (id: string, name: string) => void;
  saveStatus: StudioSaveStatus;
  draftIsSaved: boolean;
  versionsCount: number;
  onOpenVersionHistory: () => void;

  editor: Editor | null;

  templateId: string;
  customTemplates: ResumeTemplate[];
  onTemplateSelect: (templateId: string) => void;
  onTemplateImported?: (templateId: string, resume: TailoredResume) => void;
  onTemplatesChanged: () => void | Promise<void>;

  onTailorAi: () => void;
  onTailorManual: () => void;
  onTailorSettings: () => void;

  exportMenuOpen: boolean;
  onExportMenuOpenChange: (open: boolean) => void;
  isExporting: boolean;
  canCopyHtml: boolean;
  canDownloadDocx: boolean;
  canDownloadPdf: boolean;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onCopyHtml: () => void;
  onExportPlainText: () => void;
  onLatexExport: () => void;
  onShareLink: () => void;

  onFilesPanelToggle?: () => void;
  onAiPanelToggle?: () => void;
}

interface TemplatePickerPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

export function StudioSubBar({
  documentMode,
  onDocumentModeChange,
  coverLetterCount,
  activeDocumentId,
  activeDocumentName,
  onRename,
  saveStatus,
  draftIsSaved,
  versionsCount,
  onOpenVersionHistory,
  editor,
  templateId,
  customTemplates,
  onTemplateSelect,
  onTemplateImported,
  onTemplatesChanged,
  onTailorAi,
  exportMenuOpen,
  onExportMenuOpenChange,
  isExporting,
  canCopyHtml,
  canDownloadDocx,
  canDownloadPdf,
  onDownloadPdf,
  onDownloadDocx,
  onCopyHtml,
  onExportPlainText,
  onLatexExport,
  onShareLink,
  onTailorManual,
  onTailorSettings,
  onFilesPanelToggle,
  onAiPanelToggle,
}: StudioSubBarProps) {
  const a11yT = useA11yTranslations();

  const [now, setNow] = useState(() => nowEpoch());
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(nowEpoch()), 5_000);
    return () => window.clearInterval(interval);
  }, []);

  const modeLabel = DOCUMENT_MODE_LABELS[documentMode];
  const documentLabel = modeLabel.toLowerCase();

  const templates = useMemo(
    () =>
      documentMode === "cover_letter"
        ? COVER_LETTER_TEMPLATES
        : [...TEMPLATES, ...customTemplates],
    [customTemplates, documentMode],
  );
  const selectedTemplate = useMemo(
    () =>
      documentMode === "cover_letter"
        ? getCoverLetterTemplate(templateId)
        : (customTemplates.find((template) => template.id === templateId) ??
          getTemplate(templateId)),
    [customTemplates, documentMode, templateId],
  );

  const saveStatusLabel = getStudioSaveStatusLabel(saveStatus, now);
  const saveStatusIcon = getStudioSaveStatusIcon(saveStatus);

  const canExport = canCopyHtml && canDownloadPdf && canDownloadDocx;
  const exportDisabled = !canExport || isExporting;
  const exportHelpText = !canExport
    ? documentMode === "cover_letter"
      ? "Select bank entries or write a cover letter draft to enable export."
      : "Select bank entries or edit the resume to enable export."
    : null;

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);
  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const handleLatexExport = useCallback(() => {
    onExportMenuOpenChange(false);
    onLatexExport();
  }, [onExportMenuOpenChange, onLatexExport]);
  const handleShareLink = useCallback(() => {
    onExportMenuOpenChange(false);
    onShareLink();
  }, [onExportMenuOpenChange, onShareLink]);

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <div
        // Sub-bar surface is `--paper` (lighter cream) so it reads as a
        // distinct band against the AppBar — AppBar uses `--bg` and a
        // 1px hairline alone wasn't enough contrast to register them
        // as separate rows.
        className="flex flex-wrap items-center gap-3 border-b border-rule bg-paper px-4 py-2 md:flex-nowrap md:px-6"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <button
          type="button"
          onClick={onFilesPanelToggle}
          aria-label={a11yT("openFilesPanel")}
          className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <DocTypeTabs
          documentMode={documentMode}
          onChange={onDocumentModeChange}
          coverLetterCount={coverLetterCount}
        />

        <span
          aria-hidden
          className="hidden h-6 w-px bg-rule md:block"
          style={{ backgroundColor: "var(--rule)" }}
        />

        <DocTitleBlock
          documentId={activeDocumentId}
          name={activeDocumentName}
          onRename={onRename}
          saveStatusLabel={saveStatusLabel}
          saveStatusIcon={saveStatusIcon}
          draftIsSaved={draftIsSaved}
          versionsCount={versionsCount}
          onOpenVersionHistory={onOpenVersionHistory}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <UndoRedoGroup
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onHistory={onOpenVersionHistory}
          />

          <span
            aria-hidden
            className="hidden h-6 w-px bg-rule md:block"
            style={{ backgroundColor: "var(--rule)" }}
          />

          <TemplatePill
            documentMode={documentMode}
            templateId={templateId}
            documentLabel={documentLabel}
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={onTemplateSelect}
            onManageTemplates={() => setTemplateManagerOpen(true)}
          />

          <TailorSplit
            onAiTailor={onTailorAi}
            onManualTailor={onTailorManual}
            onSettings={onTailorSettings}
          />

          <ExportSplit
            modeLabel={modeLabel}
            documentLabel={documentLabel}
            exportMenuOpen={exportMenuOpen}
            onExportMenuOpenChange={onExportMenuOpenChange}
            isExporting={isExporting}
            exportDisabled={exportDisabled}
            exportHelpText={exportHelpText}
            onDownloadPdf={onDownloadPdf}
            onDownloadDocx={onDownloadDocx}
            onCopyHtml={onCopyHtml}
            onExportPlainText={onExportPlainText}
            onLatexExport={handleLatexExport}
            onShareLink={handleShareLink}
          />
        </div>

        <button
          type="button"
          onClick={onAiPanelToggle}
          aria-label={a11yT("openAiAssistantPanel")}
          className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <PanelRight className="h-5 w-5" />
        </button>
      </div>
      <CustomTemplateManagerDialog
        open={templateManagerOpen}
        onOpenChange={setTemplateManagerOpen}
        onTemplatesChanged={onTemplatesChanged}
        onTemplateImported={
          onTemplateImported ?? ((id) => onTemplateSelect(id))
        }
      />
    </TooltipProvider>
  );
}

function DocTypeTabs({
  documentMode,
  onChange,
  coverLetterCount,
}: {
  documentMode: DocumentMode;
  onChange: (mode: DocumentMode) => void;
  coverLetterCount: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="Document type"
      className="flex items-center gap-1"
    >
      {DOCUMENT_MODE_OPTIONS.map(({ mode, label }) => {
        const isActive = documentMode === mode;
        const Icon = mode === "cover_letter" ? FileText : FileText;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 border-b-2 px-2 text-[13px] font-medium transition-colors",
              isActive
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={{
              borderColor: isActive ? "var(--brand)" : "transparent",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {mode === "cover_letter" && coverLetterCount > 0 && (
              <span
                className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold tabular-nums"
                style={{
                  backgroundColor: isActive
                    ? "var(--brand-soft)"
                    : "var(--rule-strong-bg)",
                  color: isActive ? "var(--brand-dark)" : "var(--ink-3)",
                }}
              >
                {coverLetterCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DocTitleBlock({
  documentId,
  name,
  onRename,
  saveStatusLabel,
  saveStatusIcon,
  draftIsSaved,
  versionsCount,
  onOpenVersionHistory,
}: {
  documentId: string | null;
  name: string;
  onRename: (id: string, name: string) => void;
  saveStatusLabel: string;
  saveStatusIcon: "saved" | "saving" | "warn" | "error";
  draftIsSaved: boolean;
  versionsCount: number;
  onOpenVersionHistory: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(name);
  }, [name]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = useCallback(() => {
    const next = draftName.trim();
    if (documentId && next && next !== name) {
      onRename(documentId, next);
    } else {
      setDraftName(name);
    }
    setEditing(false);
  }, [documentId, draftName, name, onRename]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setDraftName(name);
        setEditing(false);
      }
    },
    [commit, name],
  );

  return (
    <div className="hidden min-w-0 flex-shrink items-baseline gap-2 md:flex">
      <div className="flex min-w-0 items-center gap-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="min-w-0 max-w-[280px] truncate border-b border-brand bg-transparent font-display text-[15px] font-semibold tracking-tight outline-none"
            style={{
              borderColor: "var(--brand)",
            }}
            aria-label="Document name"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-w-0 max-w-[320px] items-center gap-1.5 truncate rounded-sm px-1 font-display text-[15px] font-semibold tracking-tight hover:bg-rule-strong-bg"
          >
            <span className="truncate">{name}</span>
            <Pencil
              className="h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
        )}
      </div>

      <span
        className="hidden items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] md:inline-flex"
        style={{ color: "var(--ink-3)" }}
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              saveStatusIcon === "saved" && draftIsSaved
                ? "var(--brand)"
                : saveStatusIcon === "error"
                  ? "hsl(var(--destructive))"
                  : "var(--ink-3)",
          }}
        />
        {saveStatusLabel}
        {versionsCount > 0 && (
          <>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={onOpenVersionHistory}
              className="font-mono text-[10.5px] uppercase tracking-[0.12em] underline-offset-2 hover:underline"
              style={{ color: "var(--ink-3)" }}
            >
              {versionsCount} {versionsCount === 1 ? "version" : "versions"}
            </button>
          </>
        )}
      </span>
    </div>
  );
}

function UndoRedoGroup({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onHistory,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onHistory: () => void;
}) {
  return (
    <div className="flex items-center">
      <IconBarButton
        label="Undo (⌘Z)"
        onClick={onUndo}
        disabled={!canUndo}
        icon={<RotateCcw className="h-3.5 w-3.5" />}
      />
      <IconBarButton
        label="Redo (⌘⇧Z)"
        onClick={onRedo}
        disabled={!canRedo}
        icon={<RotateCw className="h-3.5 w-3.5" />}
      />
      <IconBarButton
        label="Version history"
        onClick={onHistory}
        icon={<History className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function IconBarButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-sm transition-colors hover:bg-rule-strong-bg disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            color: "var(--ink-2)",
          }}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function TemplatePill({
  documentMode,
  templateId,
  documentLabel,
  templates,
  selectedTemplate,
  onSelect,
  onManageTemplates,
}: {
  documentMode: DocumentMode;
  templateId: string;
  documentLabel: string;
  templates: ReadonlyArray<{ id: string; name: string; description: string }>;
  selectedTemplate: { id: string; name: string };
  onSelect: (id: string) => void;
  onManageTemplates: () => void;
}) {
  const a11yT = useA11yTranslations();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<TemplatePickerPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.name.toLowerCase().includes(q));
  }, [search, templates]);

  const templateListLabel = `${DOCUMENT_MODE_LABELS[documentMode]} templates`;
  const showSearch = templates.length >= 6;

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const reposition = () => {
      const trigger = buttonRef.current;
      if (!trigger) return;
      const gutter = 16;
      const maxWidth = 560;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(maxWidth, window.innerWidth - gutter * 2);
      const left = Math.min(
        Math.max(rect.right - width, gutter),
        window.innerWidth - width - gutter,
      );
      const top = rect.bottom + 8;
      setPosition({
        left,
        top,
        width,
        maxHeight: Math.max(
          240,
          Math.min(window.innerHeight * 0.6, window.innerHeight - top - gutter),
        ),
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    reposition();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  const pickerStyle: CSSProperties | undefined =
    position === null
      ? undefined
      : {
          left: position.left,
          top: position.top,
          width: position.width,
          maxHeight: position.maxHeight,
        };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Select ${documentLabel} template: ${selectedTemplate.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-rule bg-paper px-2.5 text-[13px] font-medium transition-colors hover:border-rule-strong"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full border border-rule"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-soft) 0%, var(--brand) 100%)",
            borderColor: "var(--rule)",
          }}
        />
        <span className="hidden truncate md:inline">
          {selectedTemplate.name}
        </span>
        <span className="md:hidden">Template</span>
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label={templateListLabel}
            style={pickerStyle}
            className="fixed z-50 mt-2 flex flex-col overflow-hidden rounded-md border border-rule bg-popover p-2 text-popover-foreground shadow-paper-elevated"
          >
            {showSearch && (
              <div className="relative mb-2 shrink-0">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={a11yT("searchTemplates")}
                  aria-label={a11yT("searchTemplates")}
                  className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {filteredTemplates.map((template) => {
                const isSelected = template.id === selectedTemplate.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    role="option"
                    aria-label={`${template.name} template`}
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(template.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group rounded-sm border p-2 text-left text-sm transition-colors hover:bg-muted",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <TemplatePreviewThumbnail
                      template={
                        template as Parameters<
                          typeof TemplatePreviewThumbnail
                        >[0]["template"]
                      }
                      className="h-32"
                    />
                    <span className="mt-2 block">
                      <span className="flex items-center gap-1.5 font-medium leading-tight">
                        <span className="min-w-0 flex-1 truncate">
                          {template.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                        {template.description}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filteredTemplates.length === 0 && (
                <div className="col-span-2 px-2 py-8 text-center text-sm text-muted-foreground">
                  No templates found.
                </div>
              )}
            </div>
            {documentMode !== "cover_letter" ? (
              <div className="mt-2 border-t border-border/70 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onManageTemplates();
                  }}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-sm text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Manage custom templates
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function TailorSplit({
  onAiTailor,
  onManualTailor,
  onSettings,
}: {
  onAiTailor: () => void;
  onManualTailor: () => void;
  onSettings: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onAiTailor();
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-l-sm border border-rule bg-paper px-2.5 text-[13px] font-medium transition-colors hover:border-rule-strong"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
        <span className="hidden md:inline">Tailor</span>
      </button>
      <button
        type="button"
        aria-label="Tailor options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className="inline-flex h-9 w-7 items-center justify-center rounded-r-sm border border-l-0 border-rule bg-paper transition-colors hover:border-rule-strong"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--rule)",
        }}
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-md border border-rule bg-popover p-1.5 text-popover-foreground shadow-paper-elevated"
        >
          <MenuItem
            icon={
              <Sparkles
                className="h-3.5 w-3.5"
                style={{ color: "var(--brand)" }}
              />
            }
            title="AI tailor"
            description="Let AI pick the best bullets & ordering for the target JD"
            kbd="⌘ ⇧ T"
            onClick={() => {
              setOpen(false);
              onAiTailor();
            }}
          />
          <MenuItem
            icon={<Sliders className="h-3.5 w-3.5" />}
            title="Manual tailor"
            description="Deterministically assemble from selected sections — no AI"
            kbd="⌘ T"
            onClick={() => {
              setOpen(false);
              onManualTailor();
            }}
          />
          <div
            className="my-1 h-px bg-rule"
            style={{ backgroundColor: "var(--rule)" }}
          />
          <MenuItem
            icon={<SettingsIcon className="h-3.5 w-3.5" />}
            title="Tailor settings…"
            description="Bullet ranges, # roles & projects, ATS rules"
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
          />
        </div>
      )}
    </div>
  );
}

function ExportSplit({
  modeLabel,
  documentLabel,
  exportMenuOpen,
  onExportMenuOpenChange,
  isExporting,
  exportDisabled,
  exportHelpText,
  onDownloadPdf,
  onDownloadDocx,
  onCopyHtml,
  onExportPlainText,
  onLatexExport,
  onShareLink,
}: {
  modeLabel: string;
  documentLabel: string;
  exportMenuOpen: boolean;
  onExportMenuOpenChange: (open: boolean) => void;
  isExporting: boolean;
  exportDisabled: boolean;
  exportHelpText: string | null;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onCopyHtml: () => void;
  onExportPlainText: () => void;
  onLatexExport: () => void;
  onShareLink: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        onExportMenuOpenChange(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExportMenuOpenChange(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [exportMenuOpen, onExportMenuOpenChange]);

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button
        type="button"
        aria-label={`Download ${documentLabel} PDF`}
        onClick={onDownloadPdf}
        disabled={exportDisabled}
        title={exportDisabled && exportHelpText ? exportHelpText : undefined}
        className="inline-flex h-9 items-center gap-1.5 rounded-l-sm px-3 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "var(--ink)",
          color: "var(--bg)",
        }}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        <span className="hidden md:inline">Export PDF</span>
      </button>
      <button
        type="button"
        aria-label={`${modeLabel} export options`}
        aria-expanded={exportMenuOpen}
        aria-haspopup="menu"
        onClick={() => onExportMenuOpenChange(!exportMenuOpen)}
        disabled={exportDisabled}
        title={exportDisabled && exportHelpText ? exportHelpText : undefined}
        className="inline-flex h-9 w-7 items-center justify-center rounded-r-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "var(--ink)",
          color: "var(--bg)",
          borderLeft:
            "1px solid color-mix(in srgb, var(--bg) 18%, transparent)",
        }}
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {exportMenuOpen && (
        <div
          role="menu"
          aria-label={`${modeLabel} export actions`}
          className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-md border border-rule bg-popover p-1.5 text-popover-foreground shadow-paper-elevated"
        >
          <MenuItem
            icon={<FileText className="h-3.5 w-3.5" />}
            title="PDF"
            description="Print-ready, ATS-friendly"
            onClick={() => {
              onExportMenuOpenChange(false);
              onDownloadPdf();
            }}
          />
          <MenuItem
            icon={<FileText className="h-3.5 w-3.5" />}
            title="DOCX"
            description="Word-editable"
            onClick={() => {
              onExportMenuOpenChange(false);
              onDownloadDocx();
            }}
          />
          <MenuItem
            icon={<FileCode className="h-3.5 w-3.5" />}
            title="LaTeX (.tex)"
            description="Raw source for Overleaf"
            onClick={onLatexExport}
          />
          <MenuItem
            icon={<FileText className="h-3.5 w-3.5" />}
            title="Plain text"
            description="For ATS form pastes"
            onClick={() => {
              onExportMenuOpenChange(false);
              onExportPlainText();
            }}
          />
          <MenuItem
            icon={<Copy className="h-3.5 w-3.5" />}
            title="Copy HTML"
            description="Paste into other editors"
            onClick={() => {
              onExportMenuOpenChange(false);
              onCopyHtml();
            }}
          />
          <div
            className="my-1 h-px bg-rule"
            style={{ backgroundColor: "var(--rule)" }}
          />
          <MenuItem
            icon={<Link2 className="h-3.5 w-3.5" />}
            title="Share link"
            description="View-only, expires in 7d"
            onClick={onShareLink}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  title,
  description,
  kbd,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  kbd?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-rule-strong-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="mt-0.5 grid h-6 w-6 place-items-center rounded-sm"
        style={{ color: "var(--ink-2)" }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight text-foreground">
          {title}
        </span>
        <span
          className="mt-0.5 block text-[11.5px] leading-snug"
          style={{ color: "var(--ink-3)" }}
        >
          {description}
        </span>
      </span>
      {kbd && (
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-sm)",
            padding: "1px 6px",
          }}
        >
          {kbd}
        </span>
      )}
    </button>
  );
}
