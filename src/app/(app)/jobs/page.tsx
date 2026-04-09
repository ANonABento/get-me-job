"use client";

import {
  Loader2,
} from "lucide-react";
import { ATSScoreBreakdown } from "@/components/ats/score-breakdown";
import { CoverLetterDialog } from "@/components/cover-letter/cover-letter-dialog";
import { ImportJobDialog } from "@/components/jobs/import-job-dialog";
import { AddJobDialog } from "@/features/jobs/components/add-job-dialog";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobsEmptyState, JobsNoResults } from "@/features/jobs/components/jobs-empty-state";
import { JobsFilters } from "@/features/jobs/components/jobs-filters";
import { JobsHeader } from "@/features/jobs/components/jobs-header";
import { useJobsPage } from "@/features/jobs/hooks/use-jobs-page";

export default function JobsPage() {
  const {
    addJob,
    addingJob,
    analyzeJob,
    analyses,
    analyzing,
    atsAnalyzing,
    atsDialogJob,
    atsResults,
    clearFilters,
    coverLetterJob,
    createJobFromEmail,
    deleteJob,
    expandedDescription,
    filteredJobs,
    generateResume,
    generating,
    hasActiveFilters,
    jobs,
    loading,
    newJob,
    refreshJobs,
    remoteFilter,
    runAtsCheck,
    searchQuery,
    selectTemplateForJob,
    selectedTemplate,
    setAtsDialogJob,
    setCoverLetterJob,
    setNewJob,
    setRemoteFilter,
    setSearchQuery,
    setShowAddDialog,
    setShowImportDialog,
    setSortBy,
    setStatusFilter,
    setTypeFilter,
    showAddDialog,
    showImportDialog,
    sortBy,
    statusFilter,
    templates,
    toggleExpandedDescription,
    typeFilter,
    updateJobStatus,
  } = useJobsPage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <JobsHeader
        jobsCount={jobs.length}
        onAddJob={() => setShowAddDialog(true)}
        onCreateFromEmail={createJobFromEmail}
        onImportJobs={() => setShowImportDialog(true)}
      />

      {jobs.length > 0 && (
        <JobsFilters
          hasActiveFilters={hasActiveFilters}
          jobsCount={jobs.length}
          onClearFilters={clearFilters}
          onRemoteFilterChange={setRemoteFilter}
          onSearchQueryChange={setSearchQuery}
          onSortByChange={setSortBy}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          remoteFilter={remoteFilter}
          searchQuery={searchQuery}
          sortBy={sortBy}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          visibleJobsCount={filteredJobs.length}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {jobs.length === 0 ? (
          <JobsEmptyState onAdd={() => setShowAddDialog(true)} />
        ) : filteredJobs.length === 0 ? (
          <JobsNoResults onClearFilters={clearFilters} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                analysis={analyses[job.id]}
                analyzing={analyzing === job.id}
                generating={generating === job.id}
                templates={templates}
                selectedTemplate={selectedTemplate[job.id] || "classic"}
                onSelectTemplate={(templateId) => selectTemplateForJob(job.id, templateId)}
                onAnalyze={() => analyzeJob(job.id)}
                onGenerate={() => generateResume(job.id)}
                onDelete={() => deleteJob(job.id)}
                onStatusChange={(status) => updateJobStatus(job.id, status)}
                expanded={expandedDescription === job.id}
                onToggleExpand={() => toggleExpandedDescription(job.id)}
                atsResult={atsResults[job.id]}
                atsAnalyzing={atsAnalyzing === job.id}
                onAtsCheck={() => runAtsCheck(job.id)}
                onAtsDialogOpen={() => setAtsDialogJob(job.id)}
                onCoverLetter={() => setCoverLetterJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      {atsDialogJob && atsResults[atsDialogJob] && (
        <ATSScoreBreakdown
          result={atsResults[atsDialogJob]}
          open={!!atsDialogJob}
          onOpenChange={(open) => !open && setAtsDialogJob(null)}
        />
      )}

      {coverLetterJob && (
        <CoverLetterDialog
          open={!!coverLetterJob}
          onOpenChange={(open) => !open && setCoverLetterJob(null)}
          jobId={coverLetterJob.id}
          jobTitle={coverLetterJob.title}
          company={coverLetterJob.company}
        />
      )}

      <ImportJobDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onJobImported={refreshJobs}
      />

      <AddJobDialog
        addingJob={addingJob}
        newJob={newJob}
        onNewJobChange={setNewJob}
        onOpenChange={setShowAddDialog}
        onSubmit={addJob}
        open={showAddDialog}
      />
    </div>
  );
}
