"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobDescription, JobMatch } from "@/types";
import {
  Loader2,
  Plus,
  FileText,
  Trash2,
  Download,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  X,
  MapPin,
  Wifi,
  ShieldCheck,
  MessageSquare,
  Info,
  FileEdit,
  FileDown,
  Mail,
} from "lucide-react";
import dynamic from "next/dynamic";
import { CoverLetterDialog } from "@/components/cover-letter/cover-letter-dialog";
import { ImportJobDialog } from "@/components/jobs/import-job-dialog";
import { GmailImportModal } from "@/components/google";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonJobCard } from "@/components/ui/skeleton";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";

const ATSScoreBreakdown = dynamic(
  () => import("@/components/ats/score-breakdown").then((m) => m.ATSScoreBreakdown),
  { loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" /> }
);
const ATSScoreBadge = dynamic(
  () => import("@/components/ats/score-breakdown").then((m) => m.ATSScoreBadge),
  { loading: () => <div className="h-6 w-16 animate-pulse rounded bg-muted" /> }
);

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", description: "", url: "" });
  const [addingJob, setAddingJob] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, JobMatch>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Record<string, string>>({});
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  const [atsResults, setAtsResults] = useState<Record<string, ATSAnalysisResult>>({});
  const [atsAnalyzing, setAtsAnalyzing] = useState<string | null>(null);
  const [atsDialogJob, setAtsDialogJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [remoteFilter, setRemoteFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [coverLetterJob, setCoverLetterJob] = useState<JobDescription | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/jobs/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setTemplates([
        { id: "classic", name: "Classic", description: "Traditional professional format" },
        { id: "modern", name: "Modern", description: "Contemporary design" },
        { id: "minimal", name: "Minimal", description: "Clean and simple" },
        { id: "executive", name: "Executive", description: "Bold headers, strong hierarchy" },
        { id: "tech", name: "Tech", description: "Tech industry focused" },
        { id: "creative", name: "Creative", description: "Bold colors for creative roles" },
        { id: "compact", name: "Compact", description: "Dense layout for experienced pros" },
        { id: "professional", name: "Professional", description: "Conservative for business" },
      ]);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.description) return;

    setAddingJob(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      const data = await res.json();
      if (data.job) {
        setJobs([data.job, ...jobs]);
        setNewJob({ title: "", company: "", description: "", url: "" });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error("Failed to add job:", error);
    } finally {
      setAddingJob(false);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const updateJobStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setJobs(jobs.map((j) => (j.id === id ? { ...j, status: status as JobDescription["status"] } : j)));
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const analyzeJob = async (jobId: string) => {
    setAnalyzing(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/analyze`, { method: "POST" });
      const data = await res.json();
      if (data.analysis) {
        setAnalyses({ ...analyses, [jobId]: data.analysis });
      }
    } catch (error) {
      console.error("Failed to analyze job:", error);
    } finally {
      setAnalyzing(null);
    }
  };

  const generateResume = async (jobId: string) => {
    setGenerating(jobId);
    try {
      const templateId = selectedTemplate[jobId] || "classic";
      const res = await fetch(`/api/jobs/${jobId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to generate resume:", error);
    } finally {
      setGenerating(null);
    }
  };

  const runAtsCheck = async (jobId: string) => {
    setAtsAnalyzing(jobId);
    try {
      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json() as ATSAnalysisResult;
      if (data.score) {
        setAtsResults({ ...atsResults, [jobId]: data });
      }
    } catch (error) {
      console.error("Failed to run ATS check:", error);
    } finally {
      setAtsAnalyzing(null);
    }
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter((job) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesKeywords = job.keywords?.some((kw) => kw.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesKeywords) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== "all" && (job.status || "saved") !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== "all" && job.type !== typeFilter) {
        return false;
      }
      // Remote filter
      if (remoteFilter === "remote" && !job.remote) {
        return false;
      }
      if (remoteFilter === "onsite" && job.remote) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "company":
          return a.company.localeCompare(b.company);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all" || remoteFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRemoteFilter("all");
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Target className="h-4 w-4" />
                Job Tracker
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Job Applications
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Track your target jobs, analyze match scores, and generate tailored resumes.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl border bg-card p-5 text-center">
                <p className="text-3xl font-bold text-primary">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Jobs Tracked</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowImportDialog(true)}
                  size="lg"
                  variant="outline"
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  Import
                </Button>
                <GmailImportModal
                  onImport={async (email) => {
                    const jobData = {
                      title: email.parsed?.role || email.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim(),
                      company: email.parsed?.company || email.from.split("@")[1]?.split(".")[0] || "Unknown",
                      description: email.snippet,
                      url: "",
                    };
                    try {
                      const res = await fetch("/api/jobs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(jobData),
                      });
                      if (res.ok) {
                        fetchJobs();
                      }
                    } catch (error) {
                      console.error("Failed to create job from email:", error);
                    }
                  }}
                  trigger={
                    <Button size="lg" variant="outline">
                      <Mail className="h-5 w-5 mr-2" />
                      Gmail
                    </Button>
                  }
                />
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="lg"
                  className="gradient-bg text-white hover:opacity-90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      {jobs.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-6 border-b">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="company">Company A-Z</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonJobCard key={i} className="rounded-2xl p-5" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState onAdd={() => setShowAddDialog(true)} />
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">No jobs match your filters</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </div>
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
                onSelectTemplate={(id) => setSelectedTemplate({ ...selectedTemplate, [job.id]: id })}
                onAnalyze={() => analyzeJob(job.id)}
                onGenerate={() => generateResume(job.id)}
                onDelete={() => deleteJob(job.id)}
                onStatusChange={(status) => updateJobStatus(job.id, status)}
                expanded={expandedDescription === job.id}
                onToggleExpand={() =>
                  setExpandedDescription(expandedDescription === job.id ? null : job.id)
                }
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

      {/* ATS Breakdown Dialog */}
      {atsDialogJob && atsResults[atsDialogJob] && (
        <ATSScoreBreakdown
          result={atsResults[atsDialogJob]}
          open={!!atsDialogJob}
          onOpenChange={(open) => !open && setAtsDialogJob(null)}
        />
      )}

      {/* Cover Letter Dialog */}
      {coverLetterJob && (
        <CoverLetterDialog
          open={!!coverLetterJob}
          onOpenChange={(open) => !open && setCoverLetterJob(null)}
          jobId={coverLetterJob.id}
          jobTitle={coverLetterJob.title}
          company={coverLetterJob.company}
        />
      )}

      {/* Import Job Dialog */}
      <ImportJobDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onJobImported={fetchJobs}
      />

      {/* Gmail Import Modal - rendered in button section below */}

      {/* Add Job Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Add New Job
            </DialogTitle>
            <DialogDescription>
              Paste the job description to analyze your match and generate a tailored resume.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job URL (optional)</Label>
              <Input
                value={newJob.url}
                onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                rows={10}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Paste the full job description here..."
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={addJob}
              disabled={addingJob || !newJob.title || !newJob.company || !newJob.description}
              className="gradient-bg text-white hover:opacity-90"
            >
              {addingJob && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
        <Briefcase className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold">No jobs tracked yet</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Add a job description to analyze your match score and generate a tailored resume.
      </p>
      <Button onClick={onAdd} size="lg" className="mt-6 gradient-bg text-white hover:opacity-90">
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Job
      </Button>

      {/* Tips */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Paste Job Descriptions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Copy the full job posting to get accurate analysis.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center mb-3">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Get Match Scores</h3>
          <p className="text-sm text-muted-foreground mt-1">
            See how well your profile matches each job.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
            <Download className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Generate Tailored Resumes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create customized resumes for each application.
          </p>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  saved: { label: "Saved", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
  applied: { label: "Applied", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  interviewing: { label: "Interviewing", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  offered: { label: "Offered", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-success dark:text-emerald-400" },
  rejected: { label: "Rejected", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
};

function JobCard({
  job,
  analysis,
  analyzing,
  generating,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onAnalyze,
  onGenerate,
  onDelete,
  onStatusChange,
  expanded,
  onToggleExpand,
  atsResult,
  atsAnalyzing,
  onAtsCheck,
  onAtsDialogOpen,
  onCoverLetter,
}: {
  job: JobDescription;
  analysis?: JobMatch;
  analyzing: boolean;
  generating: boolean;
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  onAnalyze: () => void;
  onGenerate: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  atsResult?: ATSAnalysisResult;
  atsAnalyzing: boolean;
  onAtsCheck: () => void;
  onAtsDialogOpen: () => void;
  onCoverLetter: () => void;
}) {
  const status = job.status || "saved";
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.saved;

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
      {/* Header */}
      <div className="p-5 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                <Select value={status} onValueChange={onStatusChange}>
                  <SelectTrigger className={`h-6 w-auto px-2 text-xs border-0 ${statusStyle.bg} ${statusStyle.text}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {atsResult && (
                  <ATSScoreBadge
                    score={atsResult.score.overall}
                    onClick={onAtsDialogOpen}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{job.company}</span>
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                )}
                {job.remote && (
                  <span className="flex items-center gap-1 text-sm text-success">
                    <Wifi className="h-3.5 w-3.5" />
                    Remote
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Score */}
          {analysis && (
            <CircularProgress
              value={analysis.overallScore}
              size={56}
              strokeWidth={5}
              className="shrink-0"
            />
          )}
        </div>

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
          >
            <ExternalLink className="h-3 w-3" />
            View Job Posting
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <button
              onClick={onToggleExpand}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <EyeOff className="h-3 w-3" /> Show less
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" /> Show more
                </>
              )}
            </button>
          </div>
          <p className={`text-sm text-muted-foreground ${expanded ? "" : "line-clamp-3"}`}>
            {job.description}
          </p>
        </div>

        {/* Keywords */}
        {job.keywords && job.keywords.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Key Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.keywords.slice(0, 8).map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
              {job.keywords.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{job.keywords.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Match Analysis</span>
            </div>

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                  <CheckCircle className="h-3 w-3" /> Suggestions
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {analysis.suggestions.slice(0, 2).map((s: string, i: number) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.gaps && analysis.gaps.length > 0 && (
              <div>
                <p className="text-xs font-medium text-warning flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" /> Gaps to Address
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {analysis.gaps.slice(0, 2).map((g: string, i: number) => (
                    <li key={i}>• {g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions Row 1: Analysis & Generation */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            {analysis ? "Re-analyze" : "Analyze Match"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAtsCheck}
            disabled={atsAnalyzing}
          >
            {atsAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-1.5" />
            )}
            {atsResult ? "Re-check ATS" : "ATS Check"}
          </Button>

          <Select value={selectedTemplate} onValueChange={onSelectTemplate}>
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={onGenerate}
            disabled={generating}
            className="gradient-bg text-white hover:opacity-90"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
            Resume
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions Row 2: Research, Cover Letter & Interview */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-3 mt-1">
          <Link
            href={`/jobs/research/${job.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
            Company Research
          </Link>

          <button
            onClick={onCoverLetter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            <FileEdit className="h-3.5 w-3.5" />
            Cover Letter
          </button>

          {status === "interviewing" && (
            <Link
              href={`/interview?jobId=${job.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Interview Prep
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
