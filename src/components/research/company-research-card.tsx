"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Building2,
  Info,
  HelpCircle,
  Users,
  Newspaper,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { CompanyResearch } from "@/lib/db/company-research";

interface CompanyResearchCardProps {
  companyName: string;
  jobId?: string;
  onRefresh?: () => void;
}

type ResearchData = CompanyResearch & { fromCache: boolean };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
}: {
  title: string;
  icon: typeof Info;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-t">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function CompanyResearchCard({
  companyName,
  jobId,
  onRefresh,
}: CompanyResearchCardProps) {
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        company: companyName,
        ...(jobId && { jobId }),
        ...(forceRefresh && { refresh: "true" }),
      });

      const res = await fetch(`/api/research/company?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch research");
      }

      setResearch(data);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load research");
    } finally {
      setLoading(false);
    }
  }, [companyName, jobId, onRefresh]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  if (loading && !research) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{companyName}</h3>
            <p className="text-sm text-muted-foreground">Researching company...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !research) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Building2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">{companyName}</h3>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchResearch()}
          className="w-full py-2 rounded-lg border text-sm font-medium hover:bg-muted/50"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!research) return null;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{companyName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {research.fromCache && (
                  <span>Updated {formatRelativeTime(research.updatedAt)}</span>
                )}
                {!research.fromCache && (
                  <span className="flex items-center gap-1 text-primary">
                    <Sparkles className="h-3 w-3" />
                    Fresh research
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => fetchResearch(true)}
            disabled={loading}
            className={cn(
              "p-2 rounded-lg hover:bg-muted transition-colors",
              loading && "opacity-50 cursor-not-allowed"
            )}
            title="Refresh research"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {research.summary && (
        <div className="p-4">
          <p className="text-sm leading-relaxed">{research.summary}</p>
        </div>
      )}

      {/* Key Facts */}
      <ExpandableSection title="Key Facts" icon={Info} defaultExpanded>
        <ul className="space-y-2">
          {research.keyFacts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary font-medium shrink-0">•</span>
              <span className="flex-1">{fact}</span>
            </li>
          ))}
        </ul>
      </ExpandableSection>

      {/* Interview Questions */}
      <ExpandableSection title="Questions to Ask" icon={HelpCircle} defaultExpanded>
        <div className="space-y-2">
          {research.interviewQuestions.map((question, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 group"
            >
              <span className="text-xs font-medium text-primary shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <span className="flex-1 text-sm">{question}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={question} />
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Culture Notes */}
      {research.cultureNotes && (
        <ExpandableSection title="Culture & Work Environment" icon={Users}>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {research.cultureNotes}
          </p>
        </ExpandableSection>
      )}

      {/* Recent News */}
      {research.recentNews && (
        <ExpandableSection title="Recent News & Developments" icon={Newspaper}>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {research.recentNews}
          </p>
        </ExpandableSection>
      )}

      {/* Quick Links */}
      <div className="p-3 bg-muted/30 border-t">
        <p className="text-xs text-muted-foreground mb-2">Quick Research Links</p>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Google",
              url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`,
            },
            {
              label: "LinkedIn",
              url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.replace(/\s+/g, "-").toLowerCase())}`,
            },
            {
              label: "Glassdoor",
              url: `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(companyName)}`,
            },
            {
              label: "News",
              url: `https://news.google.com/search?q=${encodeURIComponent(companyName)}`,
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-muted transition-colors"
            >
              {link.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
