"use client";

/**
 * CoachRail — right column of the editorial Interview Prep shell.
 *
 * Per `docs/editorial-rebuild-todo.md`, Interview Prep is the primary placement
 * for the coach rail. Renders an accent paper card (Today's focus), a live
 * interview meta panel, and a tip card. Mirrors v2 `.ip-coach` + `.ip-side-card`.
 */

import type { ReactNode } from "react";
import { Lightbulb, Sparkles, Target } from "lucide-react";
import {
  CompanyGlyph,
  EditorialPanel,
  EditorialPanelBody,
  EditorialPanelHeader,
  MonoCap,
} from "@/components/editorial";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
import type { InterviewSession, PastSession } from "@/types/interview";
import type { Opportunity } from "@/types/opportunity";

interface CoachRailProps {
  session: InterviewSession | null;
  selectedJob: Opportunity | undefined;
  pastSessions: PastSession[];
}

interface MetaRowProps {
  label: string;
  children: ReactNode;
}

function MetaRow({ label, children }: MetaRowProps) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1 text-[12px]">
      <dt className="text-ink-3">{label}</dt>
      <dd className="m-0 text-ink-2">{children}</dd>
    </div>
  );
}

function computeFocus(session: InterviewSession | null): {
  title: string;
  body: string;
} {
  if (!session) {
    return {
      title: "Warm up first",
      body: "Pick a session on the left, or start a fresh mock — Sloth Coach tunes feedback to your target role.",
    };
  }
  const answered = session.answers.filter(
    (a) => a && a.trim().length > 0 && a !== "[skipped]",
  ).length;
  const total = session.questions.length;
  const remaining = Math.max(total - answered, 0);
  if (answered === 0) {
    return {
      title: "Open with a hook",
      body: "Aim to land the Situation in 20 seconds so the data + outcome have room to breathe.",
    };
  }
  if (remaining === 0) {
    return {
      title: "Wrap with a pitch",
      body: "You've answered every question — finish the loop with a 60-second close that names the role and the outcome you'll drive.",
    };
  }
  return {
    title: "Tighten openings",
    body: `${pluralize(remaining, "question")} left. Notion-tier interviewers cut early — keep the Situation under 25% of each answer.`,
  };
}

export function CoachRail({
  session,
  selectedJob,
  pastSessions,
}: CoachRailProps) {
  const focus = computeFocus(session);
  const completedCount = pastSessions.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <aside aria-label="Coach" className="flex flex-col gap-4">
      {/* Coach pep card — accent border-left, paper background */}
      <div
        className={cn(
          "relative overflow-hidden rounded-md border-l-4 border-brand bg-paper p-4",
        )}
        style={{ borderRadius: "var(--r-md)" }}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand",
            )}
            aria-hidden
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <MonoCap size="sm" tone="accent">
              Today&apos;s focus
            </MonoCap>
            <h3 className="mt-1 font-display text-[15px] font-semibold leading-tight tracking-tight text-ink">
              {focus.title}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
              {focus.body}
            </p>
          </div>
        </div>
      </div>

      {/* Live interview meta — only when a job is selected */}
      {selectedJob ? (
        <EditorialPanel as="aside">
          <EditorialPanelHeader
            title="Live interview"
            eyebrow="Target role"
            icon={Target}
          />
          <EditorialPanelBody>
            <div className="mb-3 flex items-center gap-2">
              <CompanyGlyph company={selectedJob.company} size="sm" />
              <span className="truncate text-[13px] font-semibold text-ink">
                {selectedJob.company || "Untitled company"}
              </span>
            </div>
            <dl className="flex flex-col gap-1.5">
              <MetaRow label="Role">{selectedJob.title || "—"}</MetaRow>
              {selectedJob.city || selectedJob.region || selectedJob.country ? (
                <MetaRow label="Location">
                  {[selectedJob.city, selectedJob.region, selectedJob.country]
                    .filter(Boolean)
                    .join(" · ")}
                </MetaRow>
              ) : null}
              {selectedJob.status ? (
                <MetaRow label="Stage">{selectedJob.status}</MetaRow>
              ) : null}
              {session ? (
                <MetaRow label="Questions">
                  {pluralize(session.questions.length, "question")}
                </MetaRow>
              ) : null}
            </dl>
          </EditorialPanelBody>
        </EditorialPanel>
      ) : null}

      {/* Static coaching tips card */}
      <EditorialPanel as="aside">
        <EditorialPanelHeader
          title="Coach tips"
          eyebrow="Sloth playbook"
          icon={Lightbulb}
        />
        <EditorialPanelBody>
          <ul className="flex flex-col gap-3 text-[12.5px] leading-relaxed text-ink-2">
            <li>
              <span className="font-semibold text-ink">STAR, fast.</span> Land
              the Situation in 20 seconds so Action + Result get the spotlight.
            </li>
            <li>
              <span className="font-semibold text-ink">Name the metric.</span>{" "}
              Replace &quot;a lot of users&quot; with the actual number — even a
              rough one beats a vague one.
            </li>
            <li>
              <span className="font-semibold text-ink">Show the receipts.</span>{" "}
              Link a doc or screenshot when the interviewer follows up.
            </li>
          </ul>
        </EditorialPanelBody>
      </EditorialPanel>

      <p className="px-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
        {pluralize(completedCount, "session")} completed
      </p>
    </aside>
  );
}
