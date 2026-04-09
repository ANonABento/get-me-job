"use client";

import { ATSScoreBadge } from "@/components/ats/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_STYLES } from "@/features/jobs/constants";
import type { Template } from "@/features/jobs/client-types";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import type { JobDescription, JobMatch } from "@/types";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CheckCircle,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileEdit,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Wifi,
} from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  analysis?: JobMatch;
  analyzing: boolean;
  atsAnalyzing: boolean;
  atsResult?: ATSAnalysisResult;
  expanded: boolean;
  generating: boolean;
  job: JobDescription;
  onAnalyze: () => void;
  onAtsCheck: () => void;
  onAtsDialogOpen: () => void;
  onCoverLetter: () => void;
  onDelete: () => void;
  onGenerate: () => void;
  onSelectTemplate: (templateId: string) => void;
  onStatusChange: (status: string) => void;
  onToggleExpand: () => void;
  selectedTemplate: string;
  templates: Template[];
}

export function JobCard({
  analysis,
  analyzing,
  atsAnalyzing,
  atsResult,
  expanded,
  generating,
  job,
  onAnalyze,
  onAtsCheck,
  onAtsDialogOpen,
  onCoverLetter,
  onDelete,
  onGenerate,
  onSelectTemplate,
  onStatusChange,
  onToggleExpand,
  selectedTemplate,
  templates,
}: JobCardProps) {
  const status = job.status || "saved";
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.saved;

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
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

      <div className="p-5 space-y-4">
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

        {job.keywords && job.keywords.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Key Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.keywords.slice(0, 8).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
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
                  {analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
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
                  {analysis.gaps.slice(0, 2).map((gap, index) => (
                    <li key={index}>• {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
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
