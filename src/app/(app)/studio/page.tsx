"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  FileText,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { SectionList } from "@/components/builder/section-list";
import { AiAssistantPanel } from "@/components/studio/ai-assistant-panel";
import { ResumePreview } from "@/components/studio/resume-preview";
import { StudioFilePanel } from "@/components/studio/studio-file-panel";
import { StudioHeader } from "@/components/studio/studio-header";
import { StudioLoading } from "@/components/studio/studio-loading";
import { useStudioPageState } from "@/components/studio/use-studio-page-state";
import { VersionHistorySection } from "@/components/studio/version-history-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudioMobilePanel = "files" | "ai" | null;
type StudioMobileView = "edit" | "preview";

const FILES_PANEL_STORAGE_KEY = "studio.filesPanel.open";
const AI_PANEL_STORAGE_KEY = "studio.aiPanel.open";
const DEFAULT_FILES_PANEL_WIDTH = 280;
const DEFAULT_AI_PANEL_WIDTH = 360;
const MIN_PANEL_WIDTH = 240;
const MAX_FILES_PANEL_WIDTH = 420;
const MAX_AI_PANEL_WIDTH = 480;

function readStoredPanelState(key: string): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(key) !== "false";
}

function StudioPageContent() {
  const studio = useStudioPageState();
  const [filesPanelOpen, setFilesPanelOpen] = useState(() =>
    readStoredPanelState(FILES_PANEL_STORAGE_KEY),
  );
  const [aiPanelOpen, setAiPanelOpen] = useState(() =>
    readStoredPanelState(AI_PANEL_STORAGE_KEY),
  );
  const [filesPanelWidth, setFilesPanelWidth] = useState(
    DEFAULT_FILES_PANEL_WIDTH,
  );
  const [aiPanelWidth, setAiPanelWidth] = useState(DEFAULT_AI_PANEL_WIDTH);
  const [mobilePanel, setMobilePanel] = useState<StudioMobilePanel>(null);
  const [mobileView, setMobileView] = useState<StudioMobileView>("edit");
  const dragStartRef = useRef<{
    side: "files" | "ai";
    pointerX: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(
      FILES_PANEL_STORAGE_KEY,
      String(filesPanelOpen),
    );
  }, [filesPanelOpen]);

  useEffect(() => {
    window.localStorage.setItem(AI_PANEL_STORAGE_KEY, String(aiPanelOpen));
  }, [aiPanelOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierPressed = event.metaKey || event.ctrlKey;

      if (modifierPressed && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setFilesPanelOpen((open) => !open);
        return;
      }

      if (modifierPressed && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setAiPanelOpen((open) => !open);
        return;
      }

      if (event.key === "Escape") {
        setMobilePanel(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMobilePanel = useCallback(() => setMobilePanel(null), []);

  const filesPanelStyle = filesPanelOpen
    ? ({
        "--studio-files-panel-width": `${filesPanelWidth}px`,
      } as CSSProperties)
    : undefined;

  const startPanelResize = useCallback(
    (side: "files" | "ai", event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragStartRef.current = {
        side,
        pointerX: event.clientX,
        width: side === "files" ? filesPanelWidth : aiPanelWidth,
      };
    },
    [aiPanelWidth, filesPanelWidth],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      const delta =
        dragStart.side === "files"
          ? event.clientX - dragStart.pointerX
          : dragStart.pointerX - event.clientX;
      const nextWidth = dragStart.width + delta;

      if (dragStart.side === "files") {
        setFilesPanelWidth(
          Math.min(MAX_FILES_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, nextWidth)),
        );
      } else {
        setAiPanelWidth(
          Math.min(MAX_AI_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, nextWidth)),
        );
      }
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const renderFilesPanelContent = () => (
    <>
      <StudioFilePanel
        documents={studio.currentDocuments}
        activeDocumentId={studio.activeDocumentId}
        onCreate={studio.handleCreateDocument}
        onSelect={studio.handleSelectDocument}
        onRename={studio.handleRenameDocument}
        onDelete={studio.handleDeleteDocument}
      />

      <VersionHistorySection
        versions={studio.versions}
        previewVersionId={studio.previewVersionId}
        manualVersionName={studio.manualVersionName}
        onPreviewVersion={studio.handlePreviewVersion}
        onManualVersionNameChange={studio.setManualVersionName}
        onSaveVersion={studio.handleSaveManualVersion}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SectionList
          sections={studio.sections}
          entries={studio.entries}
          selectedIds={studio.selectedIds}
          onReorder={studio.handleReorder}
          onToggleVisibility={studio.handleToggleVisibility}
          onToggleEntry={studio.handleToggleEntry}
          pickerOpen={studio.entryPickerOpen}
          onPickerOpenChange={studio.setEntryPickerOpen}
          showSections={studio.documentMode === "resume"}
        />
        <div className="px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => studio.setEntryPickerOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add from bank
          </Button>
        </div>
      </div>
    </>
  );

  const renderAiPanel = (className?: string) => (
    <AiAssistantPanel
      className={className}
      documentContent={studio.html}
      documentMode={studio.documentMode}
      selectedEntryCount={studio.selectedIds.size}
      selectedEntryIds={Array.from(studio.selectedIds)}
      onCoverLetterGenerated={studio.handleCoverLetterGenerated}
      onOpenBank={() => studio.setEntryPickerOpen(true)}
      onOpportunityClear={() => studio.setLinkedOpportunityId("")}
      onOpportunitySelect={studio.setLinkedOpportunityId}
    />
  );

  if (studio.loading) {
    return <StudioLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <StudioHeader
        documentMode={studio.documentMode}
        draftIsSaved={studio.draftIsSaved}
        saveStatus={studio.saveStatus}
        templateId={studio.templateId}
        canCopyHtml={Boolean(studio.content || studio.html)}
        canDownloadPdf={Boolean(studio.content || studio.html)}
        isExporting={studio.isExporting}
        onDocumentModeChange={studio.setDocumentMode}
        onFilesPanelToggle={() => setMobilePanel("files")}
        onAiPanelToggle={() => setMobilePanel("ai")}
        onTemplateSelect={studio.handleTemplateSelect}
        onCopyHtml={studio.handleCopyHtml}
        onDownloadPdf={studio.handleDownloadPdf}
      />

      <div
        role="tablist"
        aria-label="Builder view"
        className="grid grid-cols-2 gap-1 border-b-[length:var(--border-width)] bg-background p-2 lg:hidden"
      >
        {(["edit", "preview"] as const).map((view) => (
          <button
            key={view}
            id={`builder-${view}-tab`}
            type="button"
            role="tab"
            aria-controls={`builder-${view}-panel`}
            aria-selected={mobileView === view}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors",
              mobileView === view
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
            )}
            onClick={() => setMobileView(view)}
          >
            {view}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-muted/50">
        <div className="flex h-full min-h-0">
          <aside
            id="builder-edit-panel"
            role="tabpanel"
            aria-labelledby="builder-edit-tab"
            className={cn(
              "relative min-h-0 shrink-0 flex-col border-r-[length:var(--border-width)] bg-background transition-[width] duration-200 ease-out",
              mobileView === "edit" ? "flex w-full" : "hidden",
              "lg:flex",
              filesPanelOpen
                ? "lg:w-[var(--studio-files-panel-width)]"
                : "lg:w-10",
            )}
            style={filesPanelStyle}
          >
            <button
              type="button"
              className="absolute -right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border-[length:var(--border-width)] bg-background text-muted-foreground shadow-[var(--shadow-button)] transition-colors hover:text-foreground"
              onClick={() => setFilesPanelOpen((open) => !open)}
              aria-label={
                filesPanelOpen ? "Collapse files panel" : "Expand files panel"
              }
            >
              {filesPanelOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>

            {filesPanelOpen ? (
              <>
                {renderFilesPanelContent()}
                <div
                  role="separator"
                  aria-label="Resize files panel"
                  aria-orientation="vertical"
                  className="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none"
                  onPointerDown={(event) => startPanelResize("files", event)}
                />
              </>
            ) : (
              <button
                type="button"
                className="flex h-full w-10 items-start justify-center pt-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setFilesPanelOpen(true)}
                aria-label="Open files panel"
              >
                <FileText className="h-5 w-5" />
              </button>
            )}
          </aside>

          <main
            id="builder-preview-panel"
            role="tabpanel"
            aria-labelledby="builder-preview-tab"
            data-document-editor-root="true"
            className={cn(
              "relative min-w-0 flex-1 overflow-auto px-3 py-4 lg:px-4 lg:py-6",
              mobileView === "preview" ? "block" : "hidden",
              "lg:block",
            )}
          >
            {studio.generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <div className="mx-auto w-full max-w-[900px]">
              <ResumePreview
                templateId={studio.templateId}
                html={studio.html}
                documentMode={studio.documentMode}
                onAddFromBank={() => studio.setEntryPickerOpen(true)}
                content={studio.content}
                onContentChange={studio.handleContentChange}
              />
            </div>
          </main>

          <aside
            className={cn(
              "relative hidden shrink-0 border-l-[length:var(--border-width)] bg-background transition-[width] duration-200 ease-out lg:block",
              aiPanelOpen ? "" : "w-10",
            )}
            style={aiPanelOpen ? { width: `${aiPanelWidth}px` } : undefined}
          >
            <button
              type="button"
              className="absolute -left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border-[length:var(--border-width)] bg-background text-muted-foreground shadow-[var(--shadow-button)] transition-colors hover:text-foreground"
              onClick={() => setAiPanelOpen((open) => !open)}
              aria-label={
                aiPanelOpen
                  ? "Collapse AI assistant panel"
                  : "Expand AI assistant panel"
              }
            >
              {aiPanelOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </button>

            {aiPanelOpen ? (
              <>
                {renderAiPanel("h-full w-full border-l-0")}
                <div
                  role="separator"
                  aria-label="Resize AI assistant panel"
                  aria-orientation="vertical"
                  className="absolute inset-y-0 left-0 z-10 w-2 cursor-col-resize touch-none"
                  onPointerDown={(event) => startPanelResize("ai", event)}
                />
              </>
            ) : (
              <button
                type="button"
                className="flex h-full w-10 items-start justify-center pt-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setAiPanelOpen(true)}
                aria-label="Open AI assistant panel"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            )}
          </aside>
        </div>
      </div>

      {mobilePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close studio panel backdrop"
            className="absolute inset-0 bg-background/70"
            onClick={closeMobilePanel}
          />
          <div
            className={cn(
              "absolute inset-y-0 flex w-full flex-col bg-background shadow-[var(--shadow-elevated)]",
              mobilePanel === "files" ? "left-0" : "right-0",
            )}
          >
            <div className="flex items-center justify-between border-b-[length:var(--border-width)] px-4 py-3">
              <h2 className="text-sm font-semibold">
                {mobilePanel === "files" ? "Files" : "AI Assistant"}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeMobilePanel}
                aria-label="Close studio panel"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {mobilePanel === "files" ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {renderFilesPanelContent()}
              </div>
            ) : (
              renderAiPanel("min-h-0 w-full flex-1 border-l-0")
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioPageContent />
    </Suspense>
  );
}
