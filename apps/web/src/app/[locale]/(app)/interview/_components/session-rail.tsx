"use client";

/**
 * SessionRail — left column of the editorial Interview Prep shell.
 *
 * Mirrors v2 `.ip-rail-cap` + `.ip-session` blocks. Lists upcoming/in-progress
 * sessions, then past completed sessions. Maps the existing `PastSession[]`
 * data shape onto the editorial paper-card row treatment.
 */

import { Trash2 } from "lucide-react";
import { MonoCap, CompanyGlyph } from "@/components/editorial";
import { TimeAgo } from "@/components/format/time-ago";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
import type { PastSession } from "@/types/interview";
import type { Opportunity } from "@/types/opportunity";

interface SessionRailProps {
  pastSessions: PastSession[];
  opportunities: Opportunity[];
  activeSessionId?: string | null;
  onResume: (session: PastSession) => void;
  onDelete: (sessionId: string) => void;
}

function getCompanyName(
  pastSession: PastSession,
  opportunities: Opportunity[],
): string {
  if (pastSession.jobId === null) return "Generic practice";
  const match = opportunities.find((o) => o.id === pastSession.jobId);
  if (!match) return "Untitled session";
  return match.company || match.title || "Untitled session";
}

function getRoleLabel(
  pastSession: PastSession,
  opportunities: Opportunity[],
): string {
  if (pastSession.jobId === null) {
    const cat = pastSession.category;
    if (!cat) return "Mixed questions";
    return `${cat.replace(/-/g, " ")} questions`;
  }
  const match = opportunities.find((o) => o.id === pastSession.jobId);
  return match?.title ?? "Untitled role";
}

function stageLabel(pastSession: PastSession): string {
  if (pastSession.status === "in_progress") return "ACTIVE";
  return "DONE";
}

interface SessionRowProps {
  pastSession: PastSession;
  company: string;
  role: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionRow({
  pastSession,
  company,
  role,
  isActive,
  onClick,
  onDelete,
}: SessionRowProps) {
  const stage = stageLabel(pastSession);
  const answered = pastSession.answers?.length ?? 0;
  const total = pastSession.questions.length;
  return (
    <div
      className={cn(
        "group flex flex-col gap-1.5 rounded-md border bg-paper p-3 transition-colors",
        isActive
          ? "border-brand bg-brand-soft"
          : "border-rule hover:border-rule-strong",
      )}
      style={{ borderRadius: "var(--r-md)" }}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-2 text-left"
      >
        <CompanyGlyph company={company} size="sm" />
        <span className="flex-1 truncate text-[13px] font-semibold leading-tight text-ink">
          {company}
        </span>
        <MonoCap
          size="sm"
          tone={isActive ? "ink" : "muted"}
          className={cn(
            "rounded-full px-2 py-0.5",
            isActive ? "bg-inverse text-inverse-ink" : "bg-rule-strong-bg",
          )}
        >
          {stage}
        </MonoCap>
      </button>
      <button
        type="button"
        onClick={onClick}
        className="text-left text-[11.5px] text-ink-2"
      >
        {role}
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between text-left"
      >
        <MonoCap size="sm">
          {pastSession.completedAt ? (
            <TimeAgo date={pastSession.completedAt} />
          ) : (
            <TimeAgo date={pastSession.startedAt} />
          )}
        </MonoCap>
        <span className="font-mono text-[10.5px] text-ink-3">
          {pluralize(answered, "answer")} / {total} {pluralize(total, "Q")}
        </span>
      </button>
      <div className="flex justify-end">
        <button
          type="button"
          aria-label="Delete session"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md p-1 text-ink-3 opacity-0 transition-opacity hover:bg-rule-strong-bg hover:text-destructive focus:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function SessionRail({
  pastSessions,
  opportunities,
  activeSessionId,
  onResume,
  onDelete,
}: SessionRailProps) {
  const inProgress = pastSessions.filter((s) => s.status === "in_progress");
  const completed = pastSessions.filter((s) => s.status === "completed");

  return (
    <aside aria-label="Interview sessions" className="flex flex-col gap-2">
      {inProgress.length > 0 ? (
        <>
          <MonoCap size="sm" className="mb-1 mt-0 px-1">
            In progress
          </MonoCap>
          <div className="flex flex-col gap-2">
            {inProgress.map((s) => (
              <SessionRow
                key={s.id}
                pastSession={s}
                company={getCompanyName(s, opportunities)}
                role={getRoleLabel(s, opportunities)}
                isActive={s.id === activeSessionId}
                onClick={() => onResume(s)}
                onDelete={() => onDelete(s.id)}
              />
            ))}
          </div>
        </>
      ) : null}

      <MonoCap size="sm" className="mb-1 mt-3 px-1">
        Past practice
      </MonoCap>
      {completed.length === 0 ? (
        <p className="rounded-md border border-rule bg-paper px-3 py-3 text-[12px] text-ink-3">
          Sessions you complete will show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {completed.slice(0, 10).map((s) => (
            <SessionRow
              key={s.id}
              pastSession={s}
              company={getCompanyName(s, opportunities)}
              role={getRoleLabel(s, opportunities)}
              isActive={s.id === activeSessionId}
              onClick={() => onResume(s)}
              onDelete={() => onDelete(s.id)}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
