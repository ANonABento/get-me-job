"use client";

import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  Wand2,
} from "lucide-react";
import {
  CompanyGlyph,
  EditorialDetailDrawer,
  MatchScoreBar,
  MonoCap,
  StatusPill,
} from "@/components/editorial";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityStatus } from "../utils";
import {
  formatOpportunityDate,
  formatOpportunityLocation,
  formatOpportunitySalary,
  OPPORTUNITY_KANBAN_COLUMNS,
} from "../utils";
import { mapStatusToStage } from "./opportunity-row";

interface OpportunityDrawerProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onStatusChange: (opportunity: Opportunity, status: OpportunityStatus) => void;
  /**
   * Optional match score to show in the drawer. Falls back to hiding the
   * bar entirely when omitted.
   */
  matchScore?: number;
  locale?: string;
}

export function OpportunityDrawer({
  opportunity,
  onClose,
  onStatusChange,
  matchScore,
  locale,
}: OpportunityDrawerProps) {
  const open = opportunity != null;
  const stage = opportunity ? mapStatusToStage(opportunity.status) : "saved";

  return (
    <EditorialDetailDrawer
      open={open}
      onClose={onClose}
      title={opportunity?.title ?? ""}
      eyebrow="OPPORTUNITY"
      headerAction={
        opportunity ? (
          <StatusPill stage={stage}>
            {capitalize(opportunity.status)}
          </StatusPill>
        ) : undefined
      }
      footer={
        opportunity ? (
          <DrawerFooter
            opportunity={opportunity}
            onStatusChange={(status) => onStatusChange(opportunity, status)}
          />
        ) : undefined
      }
    >
      {opportunity ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <CompanyGlyph company={opportunity.company} size="lg" />
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink-2">
                {opportunity.company}
              </div>
              <div className="text-[12px] text-ink-3 capitalize">
                {opportunity.source}
                {opportunity.sourceUrl ? (
                  <>
                    <span aria-hidden="true" className="mx-1.5 opacity-50">
                      ·
                    </span>
                    <a
                      href={opportunity.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      Visit posting <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {matchScore != null ? (
            <section aria-label="Match score" className="space-y-2">
              <MonoCap size="sm">Match score</MonoCap>
              <MatchScoreBar value={matchScore} showTier />
            </section>
          ) : null}

          <section aria-label="At a glance" className="space-y-2">
            <MonoCap size="sm">At a glance</MonoCap>
            <dl className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
              <FactRow
                icon={MapPin}
                label="Location"
                value={formatOpportunityLocation(opportunity)}
              />
              <FactRow
                icon={DollarSign}
                label="Compensation"
                value={formatOpportunitySalary(opportunity, locale)}
              />
              <FactRow
                icon={CalendarClock}
                label="Deadline"
                value={
                  opportunity.deadline
                    ? formatOpportunityDate(opportunity.deadline, locale)
                    : "No deadline"
                }
              />
              <FactRow
                icon={FileText}
                label="Type"
                value={opportunity.type === "hackathon" ? "Hackathon" : "Job"}
              />
            </dl>
          </section>

          <section aria-label="Summary" className="space-y-2">
            <MonoCap size="sm">Summary</MonoCap>
            <p className="whitespace-pre-line text-[13px] leading-6 text-ink-2">
              {opportunity.summary || "No summary available."}
            </p>
          </section>

          {opportunity.responsibilities?.length ? (
            <section aria-label="Responsibilities" className="space-y-2">
              <MonoCap size="sm">Responsibilities</MonoCap>
              <ul className="space-y-1.5 text-[13px] leading-6 text-ink-2">
                {opportunity.responsibilities.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-3 w-3 flex-shrink-0 text-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {opportunity.requiredSkills?.length ? (
            <section aria-label="Required skills" className="space-y-2">
              <MonoCap size="sm">Required skills</MonoCap>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-rule-strong-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-2"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {opportunity.tags.length > 0 ? (
            <section aria-label="Tags" className="space-y-2">
              <MonoCap size="sm">Tags</MonoCap>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-rule px-2 py-0.5 text-[11.5px] text-ink-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </EditorialDetailDrawer>
  );
}

interface FactRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function FactRow({ icon: Icon, label, value }: FactRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-rule bg-page px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-ink-3" aria-hidden />
      <div className="min-w-0">
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          {label}
        </dt>
        <dd className="truncate text-[12.5px] text-ink">{value}</dd>
      </div>
    </div>
  );
}

interface DrawerFooterProps {
  opportunity: Opportunity;
  onStatusChange: (status: OpportunityStatus) => void;
}

function DrawerFooter({ opportunity, onStatusChange }: DrawerFooterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/studio?opportunity=${encodeURIComponent(opportunity.id)}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-paper transition-colors hover:bg-brand-dark",
        )}
        style={{ borderRadius: "var(--r-md)" }}
      >
        <Wand2 className="h-3.5 w-3.5" /> Tailor in Studio
      </Link>
      <label className="ml-auto flex items-center gap-1.5 text-[11.5px] text-ink-3">
        Status
        <select
          value={opportunity.status}
          onChange={(event) =>
            onStatusChange(event.target.value as OpportunityStatus)
          }
          aria-label={`Update status for ${opportunity.title}`}
          className="rounded-sm border border-rule bg-page px-2 py-1 text-[12px] text-ink focus:border-rule-strong focus:outline-none"
          style={{ borderRadius: "var(--r-sm)" }}
        >
          {OPPORTUNITY_KANBAN_COLUMNS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
