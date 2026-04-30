"use client";

import { Suspense } from "react";
import { Loader2, Plus } from "lucide-react";
import { SectionList } from "@/components/builder/section-list";
import { AiAssistantPanel } from "@/components/studio/ai-assistant-panel";
import { MobileBuilderTabs } from "@/components/studio/mobile-builder-tabs";
import { ResumePreview } from "@/components/studio/resume-preview";
import { StudioFilePanel } from "@/components/studio/studio-file-panel";
import { StudioHeader } from "@/components/studio/studio-header";
import { StudioLoading } from "@/components/studio/studio-loading";
import { useStudioPageState } from "@/components/studio/use-studio-page-state";
import { VersionHistorySection } from "@/components/studio/version-history-section";
import { Button } from "@/components/ui/button";
import { getMobilePanelClasses } from "@/lib/builder/section-manager";
import { cn } from "@/lib/utils";

function StudioPageContent() {
  const studio = useStudioPageState();

  if (studio.loading) {
    return <StudioLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <StudioHeader
        documentMode={studio.documentMode}
        draftIsSaved={studio.draftIsSaved}
        templateId={studio.templateId}
        canCopyHtml={Boolean(studio.content || studio.html)}
        canDownloadPdf={Boolean(studio.content || studio.html)}
        isExporting={studio.isExporting}
        resumeScore={studio.resumeScore}
        onDocumentModeChange={studio.setDocumentMode}
        onTemplateSelect={studio.handleTemplateSelect}
        onCopyHtml={studio.handleCopyHtml}
        onDownloadPdf={studio.handleDownloadPdf}
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
              "w-full overflow-y-auto md:w-[280px] md:flex-none md:shrink-0 md:border-r",
              getMobilePanelClasses(studio.mobileView, "edit"),
            )}
          >
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

            <div className="flex-1 overflow-y-auto">
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
            <ResumePreview
              templateId={studio.templateId}
              html={studio.html}
              documentMode={studio.documentMode}
              onAddFromBank={() => studio.setEntryPickerOpen(true)}
              content={studio.content}
              onContentChange={studio.handleContentChange}
            />
          </div>

          <AiAssistantPanel
            documentContent={studio.html}
            documentMode={studio.documentMode}
            selectedEntryCount={studio.selectedIds.size}
            selectedEntryIds={Array.from(studio.selectedIds)}
            onCoverLetterGenerated={studio.handleCoverLetterGenerated}
            onJobDescriptionChange={studio.setJobDescription}
            onOpenBank={() => studio.setEntryPickerOpen(true)}
            onOpportunityClear={() => studio.setLinkedOpportunityId("")}
            onOpportunitySelect={studio.setLinkedOpportunityId}
          />
        </div>
      </div>
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
