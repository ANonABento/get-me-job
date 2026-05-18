"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Plus } from "lucide-react";
import { SectionList } from "@/components/builder/section-list";
import { StudioSkeleton } from "@/components/skeletons/studio-skeleton";
import { AiAssistantPanel } from "@/components/studio/ai-assistant-panel";
import { MobileBuilderTabs } from "@/components/studio/mobile-builder-tabs";
import { ResumePreview } from "@/components/studio/resume-preview";
import { StudioFilePanel } from "@/components/studio/studio-file-panel";
import {
  StudioCanvas,
  type CanvasMode,
} from "@/components/studio/studio-canvas";
import {
  StudioLeftRail,
  type LeftRailTab,
} from "@/components/studio/studio-left-rail";
import { StudioSubBar } from "@/components/studio/studio-sub-bar";
import { useTailorSettingsDialog } from "@/components/studio/tailor-settings-dialog";
import { useStudioKeyboardShortcuts } from "@/components/studio/use-studio-keyboard-shortcuts";
import { useStudioPageState } from "@/components/studio/use-studio-page-state";
import { VersionDiffView } from "@/components/studio/version-diff-view";
import { VersionHistorySection } from "@/components/studio/version-history-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageWorkspace } from "@/components/ui/page-layout";
import { useToast } from "@/components/ui/toast";
import { getMobilePanelClasses } from "@/lib/builder/section-manager";
import { downloadLatex } from "@/lib/export/latex-client";
import { createShareLink, copyShareUrl } from "@/lib/share/client";
import { runManualTailor } from "@/lib/tailor/manual-tailor-handler";
import { loadTailorSettings } from "@/lib/tailor/settings";
import { cn } from "@/lib/utils";

function StudioPageContent() {
  const studio = useStudioPageState();
  const { setAiPanelCollapsed, setExportMenuOpen } = studio;
  const [editor, setEditor] = useState<Editor | null>(null);
  // Default to Knowledge — that's where the user picks the entries that
  // compose the doc, which is the primary day-to-day workflow. Files
  // (file list + version history) is a secondary nav the user clicks
  // into deliberately.
  const [leftRailTab, setLeftRailTab] = useState<LeftRailTab>("knowledge");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("wysiwyg");
  const { addToast } = useToast();
  const compareVersion = useMemo(
    () =>
      studio.versions.find(
        (version) => version.id === studio.compareVersionId,
      ) ?? null,
    [studio.compareVersionId, studio.versions],
  );
  const documentIsEmpty = !studio.content && !studio.html;
  const hasBankEntries = studio.entries.length > 0;
  const isFirstRunSelectionState =
    documentIsEmpty && hasBankEntries && studio.selectedIds.size === 0;
  const activeDocumentName = useMemo(
    () =>
      studio.currentDocuments.find((d) => d.id === studio.activeDocumentId)
        ?.name ?? "Untitled",
    [studio.activeDocumentId, studio.currentDocuments],
  );
  const coverLetterCount = useMemo(
    () => studio.documents.filter((d) => d.mode === "cover_letter").length,
    [studio.documents],
  );
  const handleShortcutExport = useCallback(() => {
    setExportMenuOpen(true);
  }, [setExportMenuOpen]);
  const handleShortcutFocusAiInput = useCallback(() => {
    setAiPanelCollapsed(false);
    window.requestAnimationFrame(() => {
      document.getElementById("studio-jd-input")?.focus();
    });
  }, [setAiPanelCollapsed]);
  const handleTailorAi = useCallback(() => {
    setAiPanelCollapsed(false);
    window.requestAnimationFrame(() => {
      document.getElementById("studio-jd-input")?.focus();
    });
  }, [setAiPanelCollapsed]);
  const handleExportPlainText = useCallback(() => {
    const stripped = (studio.html ?? "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!stripped) {
      addToast({
        type: "warning",
        title: "Nothing to export",
        description: "Add content before exporting plain text.",
      });
      return;
    }
    const blob = new Blob([stripped], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeDocumentName.replace(/[^a-z0-9-_ ]/gi, "").trim() || "document"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [activeDocumentName, addToast, studio.html]);
  const handleOpenVersionHistory = useCallback(() => {
    studio.setFilesPanelCollapsed(false);
    setLeftRailTab("files");
    window.requestAnimationFrame(() => {
      document
        .getElementById("studio-version-history")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [studio]);
  const handleTailorManual = useCallback(() => {
    try {
      const result = runManualTailor({
        entries: studio.entries,
        selectedIds: studio.selectedIds,
        sections: studio.sections,
        documentMode: studio.documentMode,
        templateId: studio.templateId,
        settings: loadTailorSettings(),
      });
      studio.handleContentChange(result.content);
      addToast({
        type: "success",
        title: "Tailored from selected sections",
        description: `${result.usedEntryCount} entr${result.usedEntryCount === 1 ? "y" : "ies"} assembled.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not tailor manually",
        description:
          error instanceof Error
            ? error.message
            : "Select bank entries first, then try again.",
      });
    }
  }, [
    addToast,
    studio.documentMode,
    studio.entries,
    studio.handleContentChange,
    studio.sections,
    studio.selectedIds,
    studio.templateId,
  ]);
  const { open: openTailorSettings, dialog: tailorSettingsDialog } =
    useTailorSettingsDialog();
  const handleLatexExport = useCallback(async () => {
    if (!studio.html) {
      addToast({
        type: "warning",
        title: "Nothing to export",
        description: "Add content before exporting LaTeX.",
      });
      return;
    }
    try {
      await downloadLatex(studio.html, `${activeDocumentName}.tex`, {
        title: activeDocumentName,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "LaTeX export failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [activeDocumentName, addToast, studio.html]);
  const handleShareLink = useCallback(async () => {
    if (!studio.html) {
      addToast({
        type: "warning",
        title: "Nothing to share",
        description: "Add content before creating a share link.",
      });
      return;
    }
    try {
      const share = await createShareLink(studio.html, activeDocumentName);
      const copied = await copyShareUrl(share.url);
      addToast({
        type: "success",
        title: copied ? "Share link copied" : "Share link created",
        description: copied
          ? `Pasted to clipboard — expires in 7 days.`
          : share.url,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not create share link",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [activeDocumentName, addToast, studio.html]);

  useStudioKeyboardShortcuts({
    onSave: studio.handleSaveManualVersion,
    onExport: handleShortcutExport,
    onToggleAiPanel: studio.toggleAiPanelCollapsed,
    onFocusAiInput: handleShortcutFocusAiInput,
    onToggleFilesPanel: studio.toggleFilesPanelCollapsed,
    onTogglePreviewOnly: studio.togglePreviewOnly,
  });

  if (studio.loading) {
    return <StudioSkeleton />;
  }

  return (
    <PageWorkspace>
      <StudioSubBar
        documentMode={studio.documentMode}
        onDocumentModeChange={studio.setDocumentMode}
        coverLetterCount={coverLetterCount}
        activeDocumentId={studio.activeDocumentId}
        activeDocumentName={activeDocumentName}
        onRename={studio.handleRenameDocument}
        saveStatus={studio.saveStatus}
        draftIsSaved={studio.draftIsSaved}
        versionsCount={studio.versions.length}
        onOpenVersionHistory={handleOpenVersionHistory}
        editor={editor}
        templateId={studio.templateId}
        customTemplates={studio.customTemplates}
        onTemplateSelect={studio.handleTemplateSelect}
        onTemplatesChanged={async () => {
          await studio.refreshCustomTemplates();
        }}
        onTailorAi={handleTailorAi}
        onTailorManual={handleTailorManual}
        onTailorSettings={openTailorSettings}
        exportMenuOpen={studio.exportMenuOpen}
        onExportMenuOpenChange={studio.setExportMenuOpen}
        isExporting={studio.isExporting}
        canCopyHtml={Boolean(studio.content || studio.html)}
        canDownloadDocx={Boolean(studio.content || studio.html)}
        canDownloadPdf={Boolean(studio.content || studio.html)}
        onDownloadPdf={studio.handleDownloadPdf}
        onDownloadDocx={studio.handleDownloadDocx}
        onCopyHtml={studio.handleCopyHtml}
        onExportPlainText={handleExportPlainText}
        onLatexExport={() => void handleLatexExport()}
        onShareLink={() => void handleShareLink()}
        onAiPanelToggle={() => studio.setMobileView("assistant")}
        onFilesPanelToggle={() => studio.setMobileView("edit")}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <MobileBuilderTabs
          mobileView={studio.mobileView}
          onMobileViewChange={studio.setMobileView}
        />

        <div className="flex flex-1 overflow-hidden">
          <div
            id="builder-edit-panel"
            role="tabpanel"
            aria-labelledby="builder-edit-tab"
            className={cn(
              "w-full overflow-y-auto transition-[width] duration-200 md:flex-none md:shrink-0 md:border-r",
              studio.filesPanelCollapsed ? "md:w-12" : "md:w-[300px]",
              getMobilePanelClasses(studio.mobileView, "edit"),
            )}
          >
            <StudioLeftRail
              activeTab={leftRailTab}
              onTabChange={setLeftRailTab}
              collapsed={studio.filesPanelCollapsed}
              onToggleCollapsed={studio.toggleFilesPanelCollapsed}
              filesContent={
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
                    onCompareVersion={studio.handleCompareVersion}
                    onPreviewVersion={studio.handlePreviewVersion}
                    onManualVersionNameChange={studio.setManualVersionName}
                    onSaveVersion={studio.handleSaveManualVersion}
                  />
                </>
              }
              filesCount={studio.currentDocuments.length}
              knowledgeContent={
                <div className="flex flex-col">
                  {studio.stagedSelectionCount > 0 ? (
                    <div className="border-b px-4 py-3">
                      <Badge variant="success">
                        Using {studio.stagedSelectionCount} staged bank
                        component
                        {studio.stagedSelectionCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  ) : null}
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
                    emptySelectionHint={
                      isFirstRunSelectionState
                        ? "Select entries to build your first draft."
                        : undefined
                    }
                  />
                  <div className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => studio.setEntryPickerOpen(true)}
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      {isFirstRunSelectionState
                        ? "Open bank picker"
                        : "Add from bank"}
                    </Button>
                  </div>
                </div>
              }
              knowledgeCount={studio.entries.length}
              linkedOpportunityId={studio.linkedOpportunityId}
              onLinkOpportunity={(opportunity) =>
                studio.setLinkedOpportunityId(opportunity.id)
              }
            />
          </div>

          <div
            id="builder-preview-panel"
            role="tabpanel"
            aria-labelledby="builder-preview-tab"
            data-document-editor-root="true"
            className={cn(
              "relative w-full flex-1 overflow-auto",
              getMobilePanelClasses(studio.mobileView, "preview"),
            )}
          >
            {studio.generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <StudioCanvas
              mode={canvasMode}
              onModeChange={setCanvasMode}
              content={studio.content}
              html={studio.html}
              templateName={studio.templateId}
              documentName={activeDocumentName}
            >
              <ResumePreview
                templateId={studio.templateId}
                html={studio.html}
                documentMode={studio.documentMode}
                onAddFromBank={() => studio.setEntryPickerOpen(true)}
                bankIsEmpty={studio.entries.length === 0}
                content={studio.content}
                onContentChange={studio.handleContentChange}
                pageSettings={studio.pageSettings}
                onPageSettingsChange={studio.handlePageSettingsChange}
                onEditorReady={setEditor}
              />
            </StudioCanvas>
          </div>

          <AiAssistantPanel
            id="builder-assistant-panel"
            role="tabpanel"
            aria-labelledby="builder-assistant-tab"
            className={getMobilePanelClasses(studio.mobileView, "assistant")}
            documentContent={studio.html}
            documentMode={studio.documentMode}
            selectedEntryCount={studio.selectedIds.size}
            selectedEntryIds={Array.from(studio.selectedIds)}
            coverLetterCritique={studio.coverLetterCritique}
            onCoverLetterCritique={studio.handleCoverLetterCritique}
            onCoverLetterGenerated={studio.handleCoverLetterGenerated}
            onCoverLetterSuggestionApply={
              studio.handleCoverLetterSuggestionApply
            }
            onGenerateFromBank={studio.handleGenerateFromBank}
            onOpenBank={() => studio.setEntryPickerOpen(true)}
            onOpportunityClear={() => studio.setLinkedOpportunityId("")}
            onOpportunitySelect={studio.setLinkedOpportunityId}
            collapsed={studio.aiPanelCollapsed}
            onToggleCollapsed={studio.toggleAiPanelCollapsed}
          />
        </div>
      </div>
      <VersionDiffView
        currentDraftState={studio.currentDraftState}
        onOpenChange={(open) => {
          if (!open) studio.handleCloseVersionDiff();
        }}
        open={Boolean(compareVersion)}
        version={compareVersion}
      />
      {tailorSettingsDialog}
    </PageWorkspace>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <StudioPageContent />
    </Suspense>
  );
}
