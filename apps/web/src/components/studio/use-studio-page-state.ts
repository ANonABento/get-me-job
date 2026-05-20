"use client";

import { nowEpoch } from "@/lib/format/time";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getDefaultTemplateIdForDocumentMode,
  getTemplateForDocumentMode,
  TEMPLATES,
} from "@/lib/resume/template-data";
import type {
  ResumeTemplate,
  TemplateStyles,
} from "@/lib/resume/template-data";
import { useCustomTemplates } from "@/lib/templates/use-custom-templates";
import {
  DEFAULT_BUILDER_PANEL,
  createInitialSections,
  getVisibleSectionIds,
  reorderSections,
  toggleSectionVisibility,
  type BuilderPanel,
  type SectionState,
} from "@/lib/builder/section-manager";
import {
  addBuilderVersion,
  createBuilderVersion,
  isBuilderStateSaved,
  readBuilderVersions,
  writeBuilderVersions,
  type BuilderDraftState,
  type BuilderVersion,
} from "@/lib/builder/version-history";
import { getCoverLetterTemplate } from "@/lib/builder/cover-letter-document";
import {
  createDatedExportFilename,
  createDocumentFilename,
  downloadContentAsDocx,
  downloadHtmlAsPdf,
} from "@/lib/builder/document-export";
import { buildCoverLetterPreviewContent } from "@/lib/builder/cover-letter-preview-fallback";
import { generateResumePreviewFallbackHTML } from "@/lib/builder/resume-preview-fallback";
import { tailoredResumeToTipTapDocument } from "@/lib/editor/bank-to-tiptap";
import {
  coverLetterHtmlToText,
  coverLetterTextToTipTapDocument,
  createBlankCoverLetterTipTapDocument,
  isBlankCoverLetterTipTapDocument,
} from "@/lib/editor/cover-letter-tiptap";
import {
  createEditorBodyHtml,
  createPrintableCoverLetterEditorHtml,
  createPrintableEditorHtml,
} from "@/lib/editor/document-html";
import {
  DEFAULT_PAGE_SETTINGS,
  normalizePageSettings,
  type PageSettings,
} from "@/lib/editor/page-settings";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { readJsonResponse } from "@/lib/http";
import type { TailoredResume } from "@/lib/resume/generator";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { StudioSaveStatus } from "./save-status";
import type { BankCategory, BankEntry } from "@/types";
import type { CoverLetterCritique } from "@/lib/ai/critique-prompts";
import {
  COVER_LETTER_DOCUMENT_ID,
  RESUME_DOCUMENT_ID,
  createStudioDocument,
  deleteStudioDocument,
  getActiveStudioDocument,
  getDocumentsForType,
  renameStudioDocument,
  updateStudioDocument,
  type DocumentMode,
  type StudioDocument,
} from "./studio-documents";

interface BuilderPreviewResponse {
  html?: string;
  resume?: TailoredResume;
}

interface ExtensionResumeResponse {
  resume?: {
    id: string;
    content?: unknown;
    contentJson?: string;
    jobId?: string;
    templateId?: string;
  };
}

interface ExtensionCoverLetterResponse {
  coverLetter?: {
    id: string;
    content: string;
    jobId?: string;
  };
}

interface StudioPageState {
  activeDocumentId: string;
  aiPanelCollapsed: boolean;
  compareVersionId: string | null;
  currentDraftState: BuilderDraftState;
  currentDocuments: StudioDocument[];
  documents: StudioDocument[];
  documentMode: DocumentMode;
  draftIsSaved: boolean;
  entries: BankEntry[];
  entryPickerOpen: boolean;
  exportMenuOpen: boolean;
  filesPanelCollapsed: boolean;
  generating: boolean;
  handleCopyHtml: () => Promise<void>;
  handleCreateDocument: () => void;
  handleDeleteDocument: (id: string) => void;
  handleDownloadDocx: () => Promise<void>;
  handleDownloadPdf: () => Promise<void>;
  handleCloseVersionDiff: () => void;
  handleCompareVersion: (id: string) => void;
  handlePreviewVersion: (id: string) => void;
  handleRenameDocument: (id: string, name: string) => void;
  handleReorder: (fromIndex: number, toIndex: number) => void;
  handleSaveManualVersion: () => void;
  handleSelectDocument: (id: string) => void;
  handleGenerateFromBank: () => void;
  handleTemplateSelect: (templateId: string) => void;
  handleTemplateImported: (templateId: string, resume: TailoredResume) => void;
  handleToggleEntry: (id: string) => void;
  handleToggleVisibility: (categoryId: BankCategory) => void;
  html: string;
  content?: TipTapJSONContent;
  pageSettings: PageSettings;
  handlePageSettingsChange: (pageSettings: PageSettings) => void;
  handleContentChange: (content: TipTapJSONContent) => void;
  coverLetterCritique?: CoverLetterCritique;
  handleCoverLetterCritique: (critique: CoverLetterCritique) => void;
  handleCoverLetterGenerated: (content: string) => void;
  handleCoverLetterSuggestionApply: (
    rangeInLetter: string,
    suggestion: string,
  ) => boolean;
  customTemplates: ResumeTemplate[];
  isExporting: boolean;
  linkedOpportunityId: string;
  loading: boolean;
  manualVersionName: string;
  mobileView: BuilderPanel;
  previewVersionId: string | null;
  refreshCustomTemplates: () => Promise<ResumeTemplate[]>;
  saveStatus: StudioSaveStatus;
  sections: SectionState[];
  selectedResumeTemplate: ResumeTemplate | undefined;
  selectedIds: Set<string>;
  stagedSelectionCount: number;
  setLinkedOpportunityId: (opportunityId: string) => void;
  setAiPanelCollapsed: (collapsed: boolean) => void;
  setDocumentMode: (mode: DocumentMode) => void;
  setEntryPickerOpen: (open: boolean) => void;
  setExportMenuOpen: (open: boolean) => void;
  setFilesPanelCollapsed: (collapsed: boolean) => void;
  setManualVersionName: (name: string) => void;
  setMobileView: (panel: BuilderPanel) => void;
  templateId: string;
  toggleAiPanelCollapsed: () => void;
  toggleFilesPanelCollapsed: () => void;
  togglePreviewOnly: () => void;
  versions: BuilderVersion[];
}

type SaveOperation =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "saved"; at: number }
  | { type: "error"; message: string };

const STAGED_BANK_ENTRY_IDS_KEY = "slothing:selectedBankEntryIds";
export const STUDIO_FILES_PANEL_COLLAPSED_KEY =
  "taida:studio:filesPanelCollapsed";
export const STUDIO_AI_PANEL_COLLAPSED_KEY = "taida:studio:aiPanelCollapsed";

interface LinkStudioVersionOptions {
  documentMode: DocumentMode;
  fetcher?: typeof fetch;
  opportunityId: string;
  versionId: string;
}

async function readLinkError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "Failed to link saved document to opportunity";
  } catch {
    return "Failed to link saved document to opportunity";
  }
}

export async function linkStudioVersionToOpportunity({
  documentMode,
  fetcher = fetch,
  opportunityId,
  versionId,
}: LinkStudioVersionOptions): Promise<void> {
  const trimmedOpportunityId = opportunityId.trim();
  const trimmedVersionId = versionId.trim();
  if (!trimmedOpportunityId || !trimmedVersionId) return;

  const response = await fetcher(
    `/api/opportunities/${encodeURIComponent(trimmedOpportunityId)}/link`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        documentMode === "cover_letter"
          ? { coverLetterId: trimmedVersionId }
          : { resumeId: trimmedVersionId },
      ),
    },
  );

  if (!response.ok) {
    throw new Error(await readLinkError(response));
  }
}

function areSelectedIdsEqual(current: Set<string>, next: string[]): boolean {
  if (current.size !== next.length) return false;
  return next.every((id) => current.has(id));
}

function areSectionsEqual(
  current: SectionState[],
  next: SectionState[],
): boolean {
  return (
    current.length === next.length &&
    current.every(
      (section, index) =>
        section.id === next[index]?.id &&
        section.visible === next[index]?.visible,
    )
  );
}

function createEntrySelectionKey(entries: BankEntry[]): string {
  return entries.map((entry) => entry.id).join("|");
}

export function isDraftSavedForDocument(
  dirtyDocumentIds: Set<string>,
  documentId: string,
  versions: BuilderVersion[],
  currentDraftState: BuilderDraftState,
): boolean {
  return (
    !dirtyDocumentIds.has(documentId) ||
    isBuilderStateSaved(versions, currentDraftState)
  );
}

export function readStudioPanelCollapsed(
  storage: Pick<Storage, "getItem">,
  key: string,
): boolean {
  try {
    return storage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeStudioPanelCollapsed(key: string, collapsed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(collapsed));
  } catch {
    // Ignore storage failures; the visible UI state still updates.
  }
}

export function applyCoverLetterCritiqueSuggestionToText(
  content: string,
  rangeInLetter: string,
  suggestion: string,
): string {
  const range = rangeInLetter.trim();
  const replacement = suggestion.trim();
  if (!content || !range || !replacement) return content;
  if (!content.includes(range)) return content;
  return content.replace(range, replacement);
}

export function useStudioPageState(): StudioPageState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<SectionState[]>(
    createInitialSections,
  );
  const [templateId, setTemplateId] = useState(
    getDefaultTemplateIdForDocumentMode("resume"),
  );
  const [loading, setLoading] = useState(true);
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [html, setHtml] = useState("");
  const [content, setContent] = useState<TipTapJSONContent | undefined>();
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    DEFAULT_PAGE_SETTINGS,
  );
  const [coverLetterCritique, setCoverLetterCritique] = useState<
    CoverLetterCritique | undefined
  >();
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<BuilderPanel>(
    DEFAULT_BUILDER_PANEL,
  );
  const [versions, setVersions] = useState<BuilderVersion[]>([]);
  const [manualVersionName, setManualVersionName] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [saveOp, setSaveOp] = useState<SaveOperation>({ type: "idle" });
  const [dirtyDocumentIds, setDirtyDocumentIds] = useState<Set<string>>(
    new Set(),
  );
  const [documents, setDocuments] = useState<StudioDocument[]>([
    createStudioDocument("resume", { id: RESUME_DOCUMENT_ID }),
    createStudioDocument("cover_letter", { id: COVER_LETTER_DOCUMENT_ID }),
  ]);
  const [linkedOpportunityId, setLinkedOpportunityId] = useState("");
  const [stagedSelectionCount, setStagedSelectionCount] = useState(0);
  const [documentMode, setDocumentMode] = useState<DocumentMode>("resume");
  const [filesPanelCollapsed, setFilesPanelCollapsedState] = useState(false);
  const [aiPanelCollapsed, setAiPanelCollapsedState] = useState(false);
  const [activeDocumentIds, setActiveDocumentIds] = useState<
    Record<DocumentMode, string>
  >({ resume: RESUME_DOCUMENT_ID, cover_letter: COVER_LETTER_DOCUMENT_ID });
  const [isExporting, setIsExporting] = useState(false);
  const showErrorToast = useErrorToast();
  const { customTemplates, refresh: refreshCustomTemplates } =
    useCustomTemplates();
  const lastPreviewErrorToastRef = useRef("");
  const lastActiveDocumentIdRef = useRef<string | null>(null);
  const lastCoverLetterEntryKeyRef = useRef<string | null>(null);
  const restoringVersionDocumentIdRef = useRef<string | null>(null);
  const extensionLoadStartedRef = useRef(false);
  const contentRef = useRef<TipTapJSONContent | undefined>(undefined);
  const previousPanelsRef = useRef<{ files: boolean; ai: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFilesPanelCollapsedState(
      readStudioPanelCollapsed(
        window.localStorage,
        STUDIO_FILES_PANEL_COLLAPSED_KEY,
      ),
    );
    setAiPanelCollapsedState(
      readStudioPanelCollapsed(
        window.localStorage,
        STUDIO_AI_PANEL_COLLAPSED_KEY,
      ),
    );
  }, []);

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "cover-letter" || requestedMode === "cover_letter") {
      setDocumentMode("cover_letter");
      return;
    }

    if (requestedMode === "resume") {
      setDocumentMode("resume");
    }
  }, [searchParams]);

  useEffect(() => {
    if (extensionLoadStartedRef.current) return;
    if (searchParams.get("from") !== "extension") return;

    const tailorId = searchParams.get("tailorId");
    const coverLetterId = searchParams.get("coverLetterId");
    if (!tailorId && !coverLetterId) return;

    extensionLoadStartedRef.current = true;
    let cancelled = false;

    async function loadExtensionDocument() {
      try {
        if (tailorId) {
          const response = await fetch(
            `/api/resumes/${encodeURIComponent(tailorId)}`,
          );
          const data = await readJsonResponse<ExtensionResumeResponse>(
            response,
            "Failed to load tailored resume",
          );
          const resume = data.resume;
          const resumeContent =
            resume?.content ??
            (resume?.contentJson ? JSON.parse(resume.contentJson) : null);
          if (!resume || !resumeContent) {
            throw new Error("Saved resume was not found.");
          }

          const nextContent = tailoredResumeToTipTapDocument(
            resumeContent as TailoredResume,
          );
          const nextHtml = createEditorBodyHtml(nextContent);
          const document = createStudioDocument("resume", {
            name: "Tailored resume from extension",
          });
          const nextDocument: StudioDocument = {
            ...document,
            content: nextContent,
            html: nextHtml,
            templateId:
              resume.templateId ||
              getDefaultTemplateIdForDocumentMode("resume"),
            source: "extension",
          };

          if (!cancelled) {
            contentRef.current = nextContent;
            setDocuments((current) => [...current, nextDocument]);
            setActiveDocumentIds((current) => ({
              ...current,
              resume: nextDocument.id,
            }));
            setDocumentMode("resume");
            setContent(nextContent);
            setHtml(nextHtml);
          }
        } else if (coverLetterId) {
          const response = await fetch(
            `/api/cover-letters/${encodeURIComponent(coverLetterId)}`,
          );
          const data = await readJsonResponse<ExtensionCoverLetterResponse>(
            response,
            "Failed to load cover letter",
          );
          const coverLetter = data.coverLetter;
          if (!coverLetter?.content) {
            throw new Error("Saved cover letter was not found.");
          }

          const nextContent = coverLetterTextToTipTapDocument(
            coverLetter.content,
          );
          const nextHtml = createEditorBodyHtml(nextContent);
          const document = createStudioDocument("cover_letter", {
            name: "Cover letter from extension",
          });
          const nextDocument: StudioDocument = {
            ...document,
            content: nextContent,
            html: nextHtml,
            templateId: getDefaultTemplateIdForDocumentMode("cover_letter"),
            source: "extension",
          };

          if (!cancelled) {
            contentRef.current = nextContent;
            setDocuments((current) => [...current, nextDocument]);
            setActiveDocumentIds((current) => ({
              ...current,
              cover_letter: nextDocument.id,
            }));
            setDocumentMode("cover_letter");
            setContent(nextContent);
            setHtml(nextHtml);
          }
        }
      } catch (error) {
        if (!cancelled) {
          showErrorToast(error, {
            title: "Could not load generated document",
            fallbackDescription: "Studio is ready with a blank document.",
          });
        }
      } finally {
        if (!cancelled) router.replace(pathname);
      }
    }

    loadExtensionDocument();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams, showErrorToast]);

  const setFilesPanelCollapsed = useCallback((collapsed: boolean) => {
    setFilesPanelCollapsedState(collapsed);
    writeStudioPanelCollapsed(STUDIO_FILES_PANEL_COLLAPSED_KEY, collapsed);
  }, []);

  const setAiPanelCollapsed = useCallback((collapsed: boolean) => {
    setAiPanelCollapsedState(collapsed);
    writeStudioPanelCollapsed(STUDIO_AI_PANEL_COLLAPSED_KEY, collapsed);
  }, []);

  const toggleFilesPanelCollapsed = useCallback(() => {
    setFilesPanelCollapsedState((current) => {
      const next = !current;
      writeStudioPanelCollapsed(STUDIO_FILES_PANEL_COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  const toggleAiPanelCollapsed = useCallback(() => {
    setAiPanelCollapsedState((current) => {
      const next = !current;
      writeStudioPanelCollapsed(STUDIO_AI_PANEL_COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  const togglePreviewOnly = useCallback(() => {
    if (filesPanelCollapsed && aiPanelCollapsed) {
      const previousPanels = previousPanelsRef.current ?? {
        files: false,
        ai: false,
      };
      setFilesPanelCollapsed(previousPanels.files);
      setAiPanelCollapsed(previousPanels.ai);
      previousPanelsRef.current = null;
      return;
    }

    previousPanelsRef.current = {
      files: filesPanelCollapsed,
      ai: aiPanelCollapsed,
    };
    setFilesPanelCollapsed(true);
    setAiPanelCollapsed(true);
  }, [
    aiPanelCollapsed,
    filesPanelCollapsed,
    setAiPanelCollapsed,
    setFilesPanelCollapsed,
  ]);

  const activeDocument = useMemo(
    () =>
      getActiveStudioDocument(
        documents,
        documentMode,
        activeDocumentIds[documentMode],
      ),
    [activeDocumentIds, documentMode, documents],
  );

  const currentDocuments = useMemo(
    () => getDocumentsForType(documents, documentMode),
    [documentMode, documents],
  );

  useEffect(() => {
    if (hasLoadedEntries) return;

    let cancelled = false;

    async function fetchEntries() {
      setLoading(true);
      try {
        const response = await fetch("/api/bank?limit=200");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (!cancelled) setEntries(data.entries || []);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) {
          setHasLoadedEntries(true);
          setLoading(false);
        }
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [hasLoadedEntries]);

  useEffect(() => {
    const nextSelectedEntryIds = activeDocument.selectedEntryIds ?? [];
    const nextSections = activeDocument.sections ?? createInitialSections();
    const nextTemplateId =
      activeDocument.templateId ??
      getDefaultTemplateIdForDocumentMode(activeDocument.mode);
    const storedVersions =
      typeof window !== "undefined"
        ? readBuilderVersions(window.localStorage, activeDocument.id)
        : [];
    const latestVersion = storedVersions[0];
    const shouldRestoreLatestVersion =
      lastActiveDocumentIdRef.current !== activeDocument.id &&
      latestVersion &&
      latestVersion.state.documentMode === activeDocument.mode &&
      !activeDocument.html &&
      !activeDocument.content &&
      (activeDocument.selectedEntryIds ?? []).length === 0;

    if (shouldRestoreLatestVersion) {
      const restored = latestVersion.state;
      setSelectedIds(new Set(restored.selectedIds));
      setSections(restored.sections);
      setTemplateId(restored.templateId);

      setPreviewVersionId(latestVersion.id);
      restoringVersionDocumentIdRef.current = activeDocument.id;
      lastActiveDocumentIdRef.current = activeDocument.id;
      lastCoverLetterEntryKeyRef.current = null;
      contentRef.current = restored.content;
      setHtml(restored.html);
      setContent(restored.content);
      setPageSettings(normalizePageSettings(restored.pageSettings));
      setCoverLetterCritique(restored.coverLetterCritique);
      setVersions(storedVersions);
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, {
          selectedEntryIds: restored.selectedIds,
          sections: restored.sections,
          templateId: restored.templateId,
          content: restored.content,
          html: restored.html,
          pageSettings: restored.pageSettings,
          coverLetterCritique: restored.coverLetterCritique,
        }),
      );
      return;
    }

    setSelectedIds((current) =>
      areSelectedIdsEqual(current, nextSelectedEntryIds)
        ? current
        : new Set(nextSelectedEntryIds),
    );
    setSections((current) =>
      areSectionsEqual(current, nextSections) ? current : nextSections,
    );
    setTemplateId((current) =>
      current === nextTemplateId ? current : nextTemplateId,
    );

    if (lastActiveDocumentIdRef.current !== activeDocument.id) {
      setPreviewVersionId(null);
      restoringVersionDocumentIdRef.current = null;
      lastActiveDocumentIdRef.current = activeDocument.id;
      lastCoverLetterEntryKeyRef.current = null;
      contentRef.current = activeDocument.content;
      setHtml(activeDocument.html ?? "");
      setContent(activeDocument.content);
      setPageSettings(normalizePageSettings(activeDocument.pageSettings));
      setCoverLetterCritique(activeDocument.coverLetterCritique);
    }

    setVersions(storedVersions);
  }, [
    activeDocument.id,
    activeDocument.content,
    activeDocument.html,
    activeDocument.mode,
    activeDocument.sections,
    activeDocument.selectedEntryIds,
    activeDocument.templateId,
    activeDocument.pageSettings,
    activeDocument.coverLetterCritique,
  ]);

  useEffect(() => {
    if (dirtyDocumentIds.size === 0) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dirtyDocumentIds]);

  const visibleCategoryIds = useMemo(
    () => getVisibleSectionIds(sections),
    [sections],
  );

  const orderedEntries = useMemo(() => {
    const categoryOrder = new Map(visibleCategoryIds.map((id, i) => [id, i]));
    return entries
      .filter(
        (entry) =>
          selectedIds.has(entry.id) &&
          visibleCategoryIds.includes(entry.category),
      )
      .sort(
        (a, b) =>
          (categoryOrder.get(a.category) ?? 999) -
          (categoryOrder.get(b.category) ?? 999),
      );
  }, [entries, selectedIds, visibleCategoryIds]);

  const selectedResumeTemplate = useMemo<ResumeTemplate | undefined>(
    () =>
      documentMode === "resume"
        ? (customTemplates.find((template) => template.id === templateId) ??
          TEMPLATES.find((template) => template.id === templateId))
        : undefined,
    [customTemplates, documentMode, templateId],
  );

  const selectedTemplate = useMemo(
    () =>
      documentMode === "cover_letter"
        ? getCoverLetterTemplate(templateId)
        : selectedResumeTemplate,
    [documentMode, selectedResumeTemplate, templateId],
  );
  const selectedResumeTemplateIsVisual =
    documentMode === "resume" && selectedResumeTemplate?.schemaVersion === 3;

  const currentDraftState = useMemo<BuilderDraftState>(
    () => ({
      documentMode,
      selectedIds: Array.from(selectedIds),
      sections,
      templateId,
      html,
      content,
      pageSettings,
      coverLetterCritique,
    }),
    [
      content,
      coverLetterCritique,
      documentMode,
      html,
      pageSettings,
      sections,
      selectedIds,
      templateId,
    ],
  );

  const draftIsSaved = useMemo(
    () =>
      isDraftSavedForDocument(
        dirtyDocumentIds,
        activeDocument.id,
        versions,
        currentDraftState,
      ),
    [activeDocument.id, currentDraftState, dirtyDocumentIds, versions],
  );

  const saveStatus = useMemo<StudioSaveStatus>(() => {
    if (saveOp.type === "saving") return { state: "saving" };
    if (saveOp.type === "error") {
      return { state: "error", error: saveOp.message };
    }
    if (saveOp.type === "saved") {
      return draftIsSaved
        ? { state: "saved", lastSavedAt: saveOp.at }
        : { state: "unsaved" };
    }
    return { state: draftIsSaved ? "saved" : "unsaved" };
  }, [draftIsSaved, saveOp]);

  useEffect(() => {
    if (previewVersionId) setGenerating(false);
  }, [previewVersionId]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (previewVersionId) {
      restoringVersionDocumentIdRef.current = null;
      return;
    }
    if (restoringVersionDocumentIdRef.current === activeDocument.id) return;

    if (documentMode === "cover_letter") {
      const entryKey = createEntrySelectionKey(orderedEntries);
      const currentContent = contentRef.current;
      const shouldCreateDraft =
        !currentContent ||
        (isBlankCoverLetterTipTapDocument(currentContent) &&
          lastCoverLetterEntryKeyRef.current !== entryKey);
      if (shouldCreateDraft) {
        const nextContent =
          orderedEntries.length > 0
            ? coverLetterTextToTipTapDocument(
                buildCoverLetterPreviewContent(orderedEntries),
              )
            : createBlankCoverLetterTipTapDocument();
        const nextHtml = createEditorBodyHtml(nextContent);
        contentRef.current = nextContent;
        setContent(nextContent);
        setHtml(nextHtml);
        setDocuments((current) =>
          updateStudioDocument(current, activeDocument.id, {
            content: nextContent,
            html: nextHtml,
          }),
        );
        lastCoverLetterEntryKeyRef.current = entryKey;
      }
      setGenerating(false);
      return;
    }

    if (orderedEntries.length === 0) {
      if (activeDocument.source === "extension") {
        setGenerating(false);
        return;
      }
      setHtml("");
      contentRef.current = undefined;
      setContent(undefined);
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, {
          content: undefined,
          html: "",
        }),
      );
      setGenerating(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setGenerating(true);

    async function updatePreview() {
      try {
        const data = await readJsonResponse<BuilderPreviewResponse>(
          await fetch("/api/builder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entryIds: orderedEntries.map((entry) => entry.id),
              templateId,
              sectionOrder: visibleCategoryIds,
            }),
            signal: controller.signal,
          }),
          "Failed to update preview",
        );

        if (!cancelled) {
          lastPreviewErrorToastRef.current = "";
          if (data.html) {
            const nextContent =
              data.resume && !selectedResumeTemplateIsVisual
                ? tailoredResumeToTipTapDocument(data.resume)
                : undefined;
            contentRef.current = nextContent;
            setHtml(data.html);
            setContent(nextContent);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: nextContent,
                html: data.html,
              }),
            );
          } else {
            // API returned empty — use client-side fallback
            const fallbackHtml = generateResumePreviewFallbackHTML(
              orderedEntries,
              templateId,
              selectedResumeTemplate,
            );
            contentRef.current = undefined;
            setHtml(fallbackHtml);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: undefined,
                html: fallbackHtml,
              }),
            );
          }
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === "AbortError";
        if (!cancelled && !isAbortError) {
          try {
            const fallbackHtml = generateResumePreviewFallbackHTML(
              orderedEntries,
              templateId,
              selectedResumeTemplate,
            );
            lastPreviewErrorToastRef.current = "";
            contentRef.current = undefined;
            setHtml(fallbackHtml);
            setContent(undefined);
            setDocuments((current) =>
              updateStudioDocument(current, activeDocument.id, {
                content: undefined,
                html: fallbackHtml,
              }),
            );
          } catch (fallbackErr) {
            const message =
              fallbackErr instanceof Error ? fallbackErr.message : "preview";
            if (lastPreviewErrorToastRef.current !== message) {
              lastPreviewErrorToastRef.current = message;
              showErrorToast(fallbackErr, {
                title: "Could not update preview",
                fallbackDescription:
                  "Please try changing the resume content again.",
              });
            }
          }
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    }

    updatePreview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    documentMode,
    activeDocument.id,
    activeDocument.source,
    orderedEntries,
    previewVersionId,
    selectedResumeTemplate,
    selectedResumeTemplateIsVisual,
    showErrorToast,
    templateId,
    visibleCategoryIds,
  ]);

  const updateActiveDocument = useCallback(
    (updates: Partial<StudioDocument>) => {
      setDocuments((current) =>
        updateStudioDocument(current, activeDocument.id, updates),
      );
    },
    [activeDocument.id],
  );

  const markActiveDocumentDirty = useCallback(() => {
    setDirtyDocumentIds((current) => {
      if (current.has(activeDocument.id)) return current;
      const next = new Set(current);
      next.add(activeDocument.id);
      return next;
    });
  }, [activeDocument.id]);

  useEffect(() => {
    if (!hasLoadedEntries || typeof window === "undefined") return;

    const rawIds = window.localStorage.getItem(STAGED_BANK_ENTRY_IDS_KEY);
    if (!rawIds) return;

    let parsedIds: unknown;
    try {
      parsedIds = JSON.parse(rawIds);
    } catch {
      window.localStorage.removeItem(STAGED_BANK_ENTRY_IDS_KEY);
      return;
    }

    const entryIds = new Set(entries.map((entry) => entry.id));
    const stagedIds = Array.isArray(parsedIds)
      ? parsedIds.filter(
          (id): id is string => typeof id === "string" && entryIds.has(id),
        )
      : [];

    window.localStorage.removeItem(STAGED_BANK_ENTRY_IDS_KEY);
    if (stagedIds.length === 0) return;

    setPreviewVersionId(null);
    setStagedSelectionCount(stagedIds.length);
    markActiveDocumentDirty();
    setSelectedIds((current) => {
      const next = new Set([...current, ...stagedIds]);
      updateActiveDocument({ selectedEntryIds: Array.from(next) });
      return next;
    });
  }, [
    entries,
    hasLoadedEntries,
    markActiveDocumentDirty,
    updateActiveDocument,
  ]);

  const markActiveDocumentSaved = useCallback(() => {
    setDirtyDocumentIds((current) => {
      if (!current.has(activeDocument.id)) return current;
      const next = new Set(current);
      next.delete(activeDocument.id);
      return next;
    });
  }, [activeDocument.id]);

  const handleContentChange = useCallback(
    (nextContent: TipTapJSONContent) => {
      const nextHtml = createEditorBodyHtml(nextContent);
      contentRef.current = nextContent;
      markActiveDocumentDirty();
      setContent(nextContent);
      setHtml(nextHtml);
      updateActiveDocument({ content: nextContent, html: nextHtml });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handlePageSettingsChange = useCallback(
    (nextPageSettings: PageSettings) => {
      const normalized = normalizePageSettings(nextPageSettings);
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setPageSettings(normalized);
      updateActiveDocument({ pageSettings: normalized });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleCoverLetterGenerated = useCallback(
    (generatedContent: string) => {
      const nextContent = coverLetterTextToTipTapDocument(generatedContent);
      const nextHtml = createEditorBodyHtml(nextContent);
      contentRef.current = nextContent;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setContent(nextContent);
      setHtml(nextHtml);
      setCoverLetterCritique(undefined);
      updateActiveDocument({
        content: nextContent,
        html: nextHtml,
        coverLetterCritique: undefined,
      });
      lastCoverLetterEntryKeyRef.current =
        createEntrySelectionKey(orderedEntries);
    },
    [markActiveDocumentDirty, orderedEntries, updateActiveDocument],
  );

  const handleCoverLetterCritique = useCallback(
    (critique: CoverLetterCritique) => {
      markActiveDocumentDirty();
      setCoverLetterCritique(critique);
      updateActiveDocument({ coverLetterCritique: critique });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleCoverLetterSuggestionApply = useCallback(
    (rangeInLetter: string, suggestion: string) => {
      if (documentMode !== "cover_letter") return false;
      const currentText = coverLetterHtmlToText(html);
      const nextText = applyCoverLetterCritiqueSuggestionToText(
        currentText,
        rangeInLetter,
        suggestion,
      );
      if (nextText === currentText) return false;

      const nextContent = coverLetterTextToTipTapDocument(nextText);
      const nextHtml = createEditorBodyHtml(nextContent);
      contentRef.current = nextContent;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setContent(nextContent);
      setHtml(nextHtml);
      updateActiveDocument({ content: nextContent, html: nextHtml });
      return true;
    },
    [documentMode, html, markActiveDocumentDirty, updateActiveDocument],
  );

  const handleToggleEntry = useCallback(
    (id: string) => {
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        updateActiveDocument({ selectedEntryIds: Array.from(next) });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleGenerateFromBank = useCallback(() => {
    setEntryPickerOpen(false);
    setMobileView("preview");
  }, []);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = reorderSections(prev, fromIndex, toIndex);
        if (next !== prev) markActiveDocumentDirty();
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleToggleVisibility = useCallback(
    (categoryId: BankCategory) => {
      setPreviewVersionId(null);
      setSections((prev) => {
        const next = toggleSectionVisibility(prev, categoryId);
        if (!areSectionsEqual(prev, next)) markActiveDocumentDirty();
        updateActiveDocument({ sections: next });
        return next;
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleTemplateSelect = useCallback(
    (nextTemplateId: string) => {
      if (nextTemplateId === templateId) return;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setTemplateId(nextTemplateId);
      updateActiveDocument({ templateId: nextTemplateId });
    },
    [markActiveDocumentDirty, templateId, updateActiveDocument],
  );

  const handleTemplateImported = useCallback(
    (nextTemplateId: string, resume: TailoredResume) => {
      const nextContent = tailoredResumeToTipTapDocument(resume);
      const nextHtml = createEditorBodyHtml(nextContent);
      const nextSections = createInitialSections();
      contentRef.current = nextContent;
      setPreviewVersionId(null);
      markActiveDocumentDirty();
      setDocumentMode("resume");
      setTemplateId(nextTemplateId);
      setSelectedIds(new Set());
      setSections(nextSections);
      setContent(nextContent);
      setHtml(nextHtml);
      updateActiveDocument({
        templateId: nextTemplateId,
        selectedEntryIds: [],
        sections: nextSections,
        content: nextContent,
        html: nextHtml,
      });
    },
    [markActiveDocumentDirty, updateActiveDocument],
  );

  const handleCreateDocument = useCallback(() => {
    const document = createStudioDocument(documentMode, {
      index: currentDocuments.length + 1,
    });
    setDocuments((prev) => [...prev, document]);
    setActiveDocumentIds((prev) => ({ ...prev, [documentMode]: document.id }));
  }, [currentDocuments.length, documentMode]);

  const handleSelectDocument = useCallback(
    (id: string) => {
      setActiveDocumentIds((prev) => ({ ...prev, [documentMode]: id }));
    },
    [documentMode],
  );

  const handleRenameDocument = useCallback((id: string, name: string) => {
    setDocuments((prev) => renameStudioDocument(prev, id, name));
  }, []);

  const handleDeleteDocument = useCallback(
    (id: string) => {
      const result = deleteStudioDocument(documents, id, documentMode);
      setDocuments(result.documents);
      setDirtyDocumentIds((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setActiveDocumentIds((prev) => ({
        ...prev,
        [documentMode]: result.activeDocumentId,
      }));
    },
    [documentMode, documents],
  );

  const saveManualVersion = useCallback(
    (name: string) => {
      const version = createBuilderVersion(currentDraftState, {
        kind: "manual",
        name,
      });

      try {
        const next = addBuilderVersion(versions, version);
        if (typeof window !== "undefined") {
          const persisted = writeBuilderVersions(
            window.localStorage,
            activeDocument.id,
            next,
          );
          if (!persisted) {
            throw new Error("Browser storage rejected the version snapshot");
          }
        }
        setVersions(next);
        setManualVersionName("");
        setPreviewVersionId(version.id);
        markActiveDocumentSaved();
        setSaveOp({ type: "saved", at: nowEpoch() });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setSaveOp({ type: "error", message });
        showErrorToast(err, {
          title: "Could not save version",
          fallbackDescription:
            "The browser refused to persist this version. Free up storage and try again.",
        });
        return;
      }

      if (linkedOpportunityId) {
        void linkStudioVersionToOpportunity({
          documentMode,
          opportunityId: linkedOpportunityId,
          versionId: version.id,
        }).catch((err) => {
          showErrorToast(err, {
            title: "Could not link opportunity",
            fallbackDescription:
              "The document was saved, but it was not attached to the selected opportunity.",
          });
        });
      }
    },
    [
      activeDocument.id,
      currentDraftState,
      documentMode,
      linkedOpportunityId,
      markActiveDocumentSaved,
      showErrorToast,
      versions,
    ],
  );

  const handleSaveManualVersion = useCallback(() => {
    setSaveOp({ type: "saving" });
    // Defer the actual save by a microtask so React can render the
    // "Saving..." status before the synchronous localStorage write resolves.
    void Promise.resolve().then(() => {
      saveManualVersion(manualVersionName);
    });
  }, [manualVersionName, saveManualVersion]);

  const handlePreviewVersion = useCallback(
    (id: string) => {
      const version = versions.find((item) => item.id === id);
      if (!version) return;

      setPreviewVersionId(id);
      setSelectedIds(new Set(version.state.selectedIds));
      setSections(version.state.sections);
      setTemplateId(version.state.templateId);
      setHtml(version.state.html);
      setPageSettings(normalizePageSettings(version.state.pageSettings));
      setCoverLetterCritique(version.state.coverLetterCritique);
      markActiveDocumentSaved();
      contentRef.current = version.state.content;
      setContent(version.state.content);
      updateActiveDocument({
        selectedEntryIds: version.state.selectedIds,
        sections: version.state.sections,
        templateId: version.state.templateId,
        content: version.state.content,
        html: version.state.html,
        pageSettings: version.state.pageSettings,
        coverLetterCritique: version.state.coverLetterCritique,
      });
    },
    [markActiveDocumentSaved, updateActiveDocument, versions],
  );

  const handleCompareVersion = useCallback((id: string) => {
    setCompareVersionId(id);
  }, []);

  const handleCloseVersionDiff = useCallback(() => {
    setCompareVersionId(null);
  }, []);

  const getPrintableHtml = useCallback(() => {
    const bodyHtml = content ? createEditorBodyHtml(content) : html;
    if (!bodyHtml) return "";
    if (selectedResumeTemplateIsVisual) return html || bodyHtml;

    if (documentMode === "cover_letter") {
      if (!selectedTemplate || selectedTemplate.styles.layout !== "letter") {
        return bodyHtml;
      }

      return createPrintableCoverLetterEditorHtml(
        bodyHtml,
        selectedTemplate.styles,
        `${selectedTemplate.name} Cover Letter`,
        pageSettings,
      );
    }

    if (!selectedTemplate || !("layout" in selectedTemplate.styles))
      return bodyHtml;

    return createPrintableEditorHtml(
      bodyHtml,
      selectedTemplate.styles as TemplateStyles,
      `${selectedTemplate.name} Resume`,
      pageSettings,
    );
  }, [
    content,
    documentMode,
    html,
    pageSettings,
    selectedResumeTemplateIsVisual,
    selectedTemplate,
  ]);

  const handleDownloadPdf = useCallback(async () => {
    const printableHtml = getPrintableHtml();
    if (!printableHtml) return;

    setIsExporting(true);
    try {
      await downloadHtmlAsPdf(
        printableHtml,
        createDocumentFilename(
          documentMode === "cover_letter" ? "cover-letter" : "resume",
          selectedTemplate?.name,
        ),
        pageSettings,
      );
    } catch (err) {
      showErrorToast(err, {
        title: "Could not download PDF",
        fallbackDescription:
          documentMode === "cover_letter"
            ? "Please try exporting the cover letter again."
            : "Please try exporting the resume again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [
    documentMode,
    getPrintableHtml,
    pageSettings,
    selectedTemplate?.name,
    showErrorToast,
  ]);

  const handleDownloadDocx = useCallback(async () => {
    if (!content) return;

    setIsExporting(true);
    try {
      const mode = documentMode === "cover_letter" ? "cover_letter" : "resume";
      await downloadContentAsDocx(
        content,
        createDatedExportFilename(
          documentMode === "cover_letter" ? "cover-letter" : "resume",
          "docx",
        ),
        {
          mode,
          templateId,
          pageSettings,
        },
      );
    } catch (err) {
      showErrorToast(err, {
        title: "Could not download DOCX",
        fallbackDescription:
          documentMode === "cover_letter"
            ? "Please try exporting the cover letter again."
            : "Please try exporting the resume again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [content, documentMode, pageSettings, showErrorToast, templateId]);

  const handleCopyHtml = useCallback(async () => {
    const currentHtml = getPrintableHtml() || html;
    if (!currentHtml) return;
    await navigator.clipboard.writeText(currentHtml);
  }, [getPrintableHtml, html]);

  return {
    activeDocumentId: activeDocumentIds[documentMode],
    aiPanelCollapsed,
    compareVersionId,
    currentDraftState,
    currentDocuments,
    documents,
    documentMode,
    draftIsSaved,
    entries,
    entryPickerOpen,
    exportMenuOpen,
    filesPanelCollapsed,
    generating,
    content,
    coverLetterCritique,
    customTemplates,
    handleContentChange,
    pageSettings,
    handlePageSettingsChange,
    handleCoverLetterCritique,
    handleCoverLetterGenerated,
    handleCoverLetterSuggestionApply,
    handleCopyHtml,
    handleCreateDocument,
    handleDeleteDocument,
    handleDownloadDocx,
    handleDownloadPdf,
    handleCloseVersionDiff,
    handleCompareVersion,
    handlePreviewVersion,
    handleRenameDocument,
    handleReorder,
    handleSaveManualVersion,
    handleSelectDocument,
    handleGenerateFromBank,
    handleTemplateSelect,
    handleTemplateImported,
    handleToggleEntry,
    handleToggleVisibility,
    html,
    isExporting,
    linkedOpportunityId,
    loading,
    manualVersionName,
    mobileView,
    previewVersionId,
    refreshCustomTemplates,
    saveStatus,
    sections,
    selectedResumeTemplate,
    selectedIds,
    stagedSelectionCount,
    setAiPanelCollapsed,
    setLinkedOpportunityId,
    setDocumentMode,
    setEntryPickerOpen,
    setExportMenuOpen,
    setFilesPanelCollapsed,
    setManualVersionName,
    setMobileView,
    templateId,
    toggleAiPanelCollapsed,
    toggleFilesPanelCollapsed,
    togglePreviewOnly,
    versions,
  };
}
