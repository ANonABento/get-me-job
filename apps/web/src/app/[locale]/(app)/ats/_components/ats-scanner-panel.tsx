"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, FileText, History, Loader2 } from "lucide-react";
import {
  EditorialPanel,
  EditorialPanelBody,
  EditorialPanelHeader,
} from "@/components/editorial";
import { StandardEmptyState } from "@/components/ui/page-layout";
import { TimeAgo } from "@/components/format/time-ago";
import { ScannerForm } from "@/components/ats/scanner-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { pluralize } from "@/lib/text/pluralize";
import type { ATSScanResult } from "@/lib/ats/analyzer";
import type { JdMatchResult } from "@/lib/ats/match-score";
import type { StoredScanRecord } from "@/lib/db/ats-scans";

const NO_OPPORTUNITY = "__none__";

interface OpportunityOption {
  id: string;
  title: string;
  company: string;
  summary: string;
  responsibilities?: string[];
  requiredSkills?: string[];
}

interface OpportunitiesApiResponse {
  opportunities?: OpportunityOption[];
}

interface ScansApiResponse {
  history?: StoredScanRecord[];
}

function opportunityToJdText(opportunity: OpportunityOption): string {
  const parts = [
    `${opportunity.title} at ${opportunity.company}`,
    opportunity.summary,
  ];
  if (opportunity.responsibilities?.length) {
    parts.push(
      "Responsibilities",
      ...opportunity.responsibilities.map((item) => `- ${item}`),
    );
  }
  if (opportunity.requiredSkills?.length) {
    parts.push(
      "Required skills",
      ...opportunity.requiredSkills.map((item) => `- ${item}`),
    );
  }
  return parts.filter(Boolean).join("\n\n");
}

interface AtsScannerPanelProps {
  locale: string;
}

export function AtsScannerPanel({ locale }: AtsScannerPanelProps) {
  const { addToast } = useToast();

  const [opportunities, setOpportunities] = useState<OpportunityOption[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(
    null,
  );
  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState<string>(NO_OPPORTUNITY);
  const [seedKey, setSeedKey] = useState(0);

  const [history, setHistory] = useState<StoredScanRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Load opportunities (best-effort — picker is optional).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/opportunities?limit=50", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load opportunities");
        const data = (await res.json()) as OpportunitiesApiResponse;
        if (cancelled) return;
        setOpportunities(data.opportunities ?? []);
      } catch (error) {
        if (cancelled) return;
        setOpportunitiesError(
          error instanceof Error ? error.message : "Could not load list",
        );
      } finally {
        if (!cancelled) setOpportunitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/ats/scans?limit=20", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load scan history");
      const data = (await res.json()) as ScansApiResponse;
      setHistory(data.history ?? []);
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Could not load history",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const selectedOpportunity = useMemo(
    () =>
      opportunities.find(
        (opportunity) => opportunity.id === selectedOpportunityId,
      ) ?? null,
    [opportunities, selectedOpportunityId],
  );

  const defaultJobText = useMemo(() => {
    if (!selectedOpportunity) return undefined;
    return opportunityToJdText(selectedOpportunity);
  }, [selectedOpportunity]);

  const handleOpportunityChange = useCallback((value: string) => {
    setSelectedOpportunityId(value);
    // Bump the key so <ScannerForm> remounts with the new defaultJobText.
    setSeedKey((current) => current + 1);
  }, []);

  const handleScanComplete = useCallback(
    async ({
      result,
      jdText,
    }: {
      result: ATSScanResult;
      jdText: string;
      jdMatch: JdMatchResult | null;
    }) => {
      try {
        const opportunityId =
          selectedOpportunityId !== NO_OPPORTUNITY
            ? selectedOpportunityId
            : undefined;
        const res = await fetch("/api/ats/scans", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            result,
            jdText,
            opportunityId,
            jobTitle: selectedOpportunity?.title,
            jobCompany: selectedOpportunity?.company,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to save scan");
        }
        addToast({
          type: "success",
          title: "Scan saved",
          description: "Added to your scan history.",
        });
        void loadHistory();
      } catch (error) {
        addToast({
          type: "error",
          title: "Could not save scan",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      }
    },
    [selectedOpportunity, selectedOpportunityId, addToast, loadHistory],
  );

  const hasOpportunities = opportunities.length > 0;

  return (
    <div className="space-y-6">
      <EditorialPanel>
        <EditorialPanelHeader
          icon={FileText}
          title="Scan a resume"
          eyebrow="STEP 1"
        />
        <div className="border-b border-rule px-[18px] py-4">
          <label
            htmlFor="ats-opportunity-picker"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Score against an existing opportunity{" "}
            <span className="font-normal text-ink-3">(optional)</span>
          </label>
          {opportunitiesLoading ? (
            <p className="flex items-center gap-2 text-xs text-ink-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading saved opportunities…
            </p>
          ) : opportunitiesError ? (
            <p className="text-xs text-destructive">{opportunitiesError}</p>
          ) : hasOpportunities ? (
            <Select
              value={selectedOpportunityId}
              onValueChange={handleOpportunityChange}
            >
              <SelectTrigger id="ats-opportunity-picker" className="w-full">
                <SelectValue placeholder="Paste a JD below, or pick a saved opportunity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_OPPORTUNITY}>
                  Paste a JD instead
                </SelectItem>
                {opportunities.map((opportunity) => (
                  <SelectItem key={opportunity.id} value={opportunity.id}>
                    {opportunity.title} — {opportunity.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-ink-3">
              You have no saved opportunities yet. Paste a job description below
              instead.
            </p>
          )}
          {selectedOpportunity ? (
            <p className="mt-2 text-xs text-ink-3">
              Prefilled the JD textarea with{" "}
              <span className="font-medium text-ink-2">
                {selectedOpportunity.title}
              </span>{" "}
              at {selectedOpportunity.company}.
            </p>
          ) : null}
        </div>
        <EditorialPanelBody>
          <ScannerForm
            key={seedKey}
            locale={locale}
            defaultJobText={defaultJobText}
            hideSignupPromo
            onScanComplete={handleScanComplete}
          />
        </EditorialPanelBody>
      </EditorialPanel>

      <EditorialPanel>
        <EditorialPanelHeader
          icon={History}
          title="Scan history"
          eyebrow="STEP 2"
        />
        <EditorialPanelBody>
          {historyLoading ? (
            <p className="flex items-center gap-2 text-sm text-ink-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </p>
          ) : historyError ? (
            <p className="text-sm text-destructive">{historyError}</p>
          ) : history.length === 0 ? (
            <StandardEmptyState
              icon={Briefcase}
              title="No scans yet"
              description="Run your first scan above. Saved scans show up here with their overall score and a timestamp so you can track changes over time."
            />
          ) : (
            <ul
              role="list"
              className="divide-y divide-rule overflow-hidden rounded-md border border-rule bg-page-2"
            >
              {history.map((scan) => (
                <ScanHistoryRow key={scan.id} scan={scan} />
              ))}
            </ul>
          )}
        </EditorialPanelBody>
      </EditorialPanel>
    </div>
  );
}

interface StoredReportPayload {
  label?: string;
  jobTitle?: string | null;
  jobCompany?: string | null;
}

function scanLabel(scan: StoredScanRecord): string {
  const report = scan.report as unknown as StoredReportPayload;
  if (report?.label) return report.label;
  if (report?.jobTitle && report?.jobCompany) {
    return `${report.jobTitle} @ ${report.jobCompany}`;
  }
  return "Standalone scan";
}

function ScanHistoryRow({ scan }: { scan: StoredScanRecord }) {
  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-ink">
          {scanLabel(scan)}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <TimeAgo date={scan.scannedAt} />
          <span aria-hidden="true">·</span>
          <span>{pluralize(scan.issueCount, "issue")}</span>
        </p>
      </div>
      <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
        <span className="font-display text-2xl font-bold tracking-tight text-ink">
          {scan.overallScore}
          <span className="text-sm font-medium text-ink-3">/100</span>
        </span>
        <span className="rounded-md border border-rule bg-paper px-2 py-0.5 text-xs font-mono uppercase tracking-[0.16em] text-ink-2">
          {scan.letterGrade}
        </span>
      </div>
    </li>
  );
}
