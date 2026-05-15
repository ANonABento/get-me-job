"use client";

import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { TimeAgo } from "@/components/format/time-ago";
import { pluralize } from "@/lib/text/pluralize";
import { getPipelineCount } from "@/lib/opportunities/pipeline";

/**
 * Editorial dashboard sections rebuilt from the Slothing handoff.
 * All four export a single React component each so `page.tsx` can swap
 * out the legacy `DashboardStatStrip` / `TodayPanel` / `PipelineSummary` /
 * `RecentOpportunitiesPanel` blocks without touching the data layer.
 */

interface DashboardStats {
  documentsCount: number;
  resumesGenerated: number;
  profileCompleteness: { percentage: number };
  jobsByStatus: Record<string, number>;
  extensionInstalled: boolean;
}

interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
}

interface TodayAction {
  icon: LucideIcon;
  title: string;
  context: string;
  href: string;
  actionLabel: string;
  tone: "primary" | "warning" | "success";
}

/* ─── Focused moves ─── */

interface EditorialFocusedMovesProps {
  actions: TodayAction[];
}

export function EditorialFocusedMoves({ actions }: EditorialFocusedMovesProps) {
  const top = actions.slice(0, 2);
  const headerCount = top.length || 0;
  const headline = headerCount
    ? `${pluralize(headerCount, "focused move")} for today`
    : "Nothing pressing — pick a small next step";

  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        padding: "18px 20px",
      }}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center"
          style={{
            backgroundColor: "var(--brand-soft)",
            color: "var(--brand-dark)",
            borderRadius: "var(--r-sm)",
          }}
          aria-hidden="true"
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p
            className="leading-tight"
            style={{
              fontFamily: "var(--display)",
              fontSize: "17px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}
          >
            {headline}
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
            Small actions. Big impact.
          </p>
        </div>
      </div>

      {top.length > 0 ? (
        <ul className="space-y-2">
          {top.map((action, index) => (
            <FocusedRow key={action.title} action={action} number={index + 1} />
          ))}
        </ul>
      ) : (
        <EmptyRow />
      )}
    </section>
  );
}

function FocusedRow({
  action,
  number,
}: {
  action: TodayAction;
  number: number;
}) {
  const Icon = action.icon;
  return (
    <li>
      <Link
        href={action.href}
        className="group flex items-center gap-3.5 px-3.5 py-3 transition-colors"
        style={{
          backgroundColor: "var(--bg)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r-md)",
          color: "var(--ink)",
          fontSize: "14px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--rule)";
        }}
      >
        <span
          className="grid h-[22px] w-[22px] flex-shrink-0 place-items-center font-mono text-[11px] font-semibold"
          style={{
            borderRadius: "var(--r-pill)",
            backgroundColor: "var(--brand-soft)",
            color: "var(--brand-dark)",
          }}
          aria-hidden="true"
        >
          {number}
        </span>
        <Icon
          className="h-3.5 w-3.5 flex-shrink-0"
          style={{ color: "var(--ink-3)" }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{action.title}</span>
        <span
          className="hidden items-center gap-1 text-[12px] font-medium sm:inline-flex"
          style={{ color: "var(--ink-2)" }}
        >
          {action.actionLabel}
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}

function EmptyRow() {
  return (
    <div
      className="px-4 py-5 text-center text-[13px]"
      style={{
        color: "var(--ink-3)",
        border: "1px dashed var(--rule)",
        borderRadius: "var(--r-md)",
      }}
    >
      You&rsquo;re all caught up — come back tomorrow.
    </div>
  );
}

/* ─── Pipeline strip ─── */

interface EditorialPipelineStripProps {
  stats: DashboardStats;
}

const PIPELINE_STAGES = [
  { label: "Saved", key: "saved", href: "/opportunities?status=saved" },
  { label: "Applied", key: "applied", href: "/opportunities?status=applied" },
  {
    label: "Interviewing",
    key: "interviewing",
    href: "/opportunities?status=interviewing",
  },
  { label: "Offered", key: "offered", href: "/opportunities?status=offered" },
  {
    label: "Rejected",
    key: "rejected",
    href: "/opportunities?status=rejected",
  },
] as const;

export function EditorialPipelineStrip({ stats }: EditorialPipelineStripProps) {
  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase"
            style={{
              letterSpacing: "0.14em",
              color: "var(--ink-3)",
            }}
          >
            Pipeline
          </span>
        </div>
        <Link
          href="/opportunities"
          className="text-[12px] font-medium"
          style={{ color: "var(--brand)" }}
        >
          Open queue →
        </Link>
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        style={{ borderTop: "0" }}
      >
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = getPipelineCount(stats.jobsByStatus, stage.key);
          const isLast = idx === PIPELINE_STAGES.length - 1;
          return (
            <li key={stage.key}>
              <Link
                href={stage.href}
                className="block px-5 py-4 transition-colors"
                style={{
                  borderRight: isLast ? "0" : "1px solid var(--rule)",
                  color: "var(--ink)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--rule-strong-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <p
                  className="mb-1 font-mono text-[10px] uppercase"
                  style={{
                    letterSpacing: "0.12em",
                    color: "var(--ink-3)",
                  }}
                >
                  {stage.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: "28px",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: count === 0 ? "var(--ink-3)" : "var(--ink)",
                  }}
                >
                  {count}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─── Recent applications table ─── */

interface EditorialRecentTableProps {
  recentJobs: RecentJob[];
}

export function EditorialRecentTable({
  recentJobs,
}: EditorialRecentTableProps) {
  const jobs = recentJobs.slice(0, 5);

  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <span
          className="font-mono text-[10px] uppercase"
          style={{
            letterSpacing: "0.14em",
            color: "var(--ink-3)",
          }}
        >
          Recent applications
        </span>
        <Link
          href="/opportunities"
          className="text-[12px] font-medium"
          style={{ color: "var(--brand)" }}
        >
          View all →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <RecentTableEmpty />
      ) : (
        <table
          className="w-full border-collapse"
          style={{ fontSize: "13.5px" }}
        >
          <thead>
            <tr
              className="font-mono text-[10px] uppercase"
              style={{
                letterSpacing: "0.1em",
                color: "var(--ink-3)",
              }}
            >
              <Th>Role</Th>
              <Th>Company</Th>
              <Th>Status</Th>
              <Th align="right">Posted</Th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="group">
                <Td>
                  <Link
                    href={`/opportunities/${job.id}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--ink)" }}
                  >
                    {job.title}
                  </Link>
                </Td>
                <Td>
                  <span style={{ color: "var(--ink-2)" }}>{job.company}</span>
                </Td>
                <Td>
                  <JobStatusBadge status={job.status} />
                </Td>
                <Td align="right">
                  <span
                    className="font-mono text-[11.5px]"
                    style={{ color: "var(--ink-3)" }}
                  >
                    <TimeAgo date={job.createdAt} />
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="font-medium"
      style={{
        textAlign: align ?? "left",
        padding: "10px 20px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "12px 20px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {children}
    </td>
  );
}

function RecentTableEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <div
        className="grid h-10 w-10 place-items-center"
        style={{
          backgroundColor: "var(--bg)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r-md)",
          color: "var(--ink-3)",
        }}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
          No applications yet
        </p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ink-3)" }}>
          Add an opportunity to start tracking your pipeline.
        </p>
      </div>
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium"
        style={{
          backgroundColor: "var(--ink)",
          color: "var(--bg)",
          borderRadius: "var(--r-md)",
        }}
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
        Add opportunity
      </Link>
    </div>
  );
}

/* ─── Right rail ─── */

interface EditorialDashboardRailProps {
  stats: DashboardStats;
  recentJobs: RecentJob[];
}

export function EditorialDashboardRail({
  stats,
  recentJobs,
}: EditorialDashboardRailProps) {
  const interviewing = recentJobs.find((job) => job.status === "interviewing");

  return (
    <aside className="flex flex-col gap-4">
      <ReadinessRailCard stats={stats} />
      <ResumeDraftRailCard stats={stats} />
      <InterviewRailCard job={interviewing} />
    </aside>
  );
}

interface RailCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

function RailCard({
  eyebrow,
  title,
  description,
  rightSlot,
  children,
  footer,
}: RailCardProps) {
  return (
    <section
      className="flex flex-col"
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        padding: "18px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase"
            style={{
              letterSpacing: "0.14em",
              color: "var(--ink-3)",
            }}
          >
            {eyebrow}
          </p>
          <p
            className="mt-1 truncate"
            style={{
              fontFamily: "var(--display)",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            {title}
          </p>
        </div>
        {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
      </div>
      {description ? (
        <p
          className="mt-2 text-[12.5px] leading-snug"
          style={{ color: "var(--ink-3)" }}
        >
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className="overflow-hidden"
      style={{
        height: 4,
        backgroundColor: "var(--rule-strong-bg)",
        borderRadius: "var(--r-pill)",
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          backgroundColor: "var(--brand)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function ReadinessRailCard({ stats }: { stats: DashboardStats }) {
  const percent = stats.profileCompleteness.percentage;
  return (
    <RailCard
      eyebrow="Readiness"
      title="Profile readiness"
      description={
        percent >= 80
          ? "Your profile is in tailoring shape."
          : "Finish your profile so we can tailor better matches."
      }
      rightSlot={
        <span
          style={{
            fontFamily: "var(--display)",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--brand)",
          }}
        >
          {percent}%
        </span>
      }
      footer={<ProgressBar percent={percent} />}
    >
      <ChecklistRow label="Profile" complete={percent >= 50} href="/profile" />
      <ChecklistRow
        label="Documents"
        complete={stats.documentsCount > 0}
        href="/bank"
      />
      <ChecklistRow
        label="Tailored docs"
        complete={stats.resumesGenerated > 0}
        href="/studio"
      />
    </RailCard>
  );
}

function ChecklistRow({
  label,
  complete,
  href,
}: {
  label: string;
  complete: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="-mx-1 flex items-center gap-2.5 rounded-sm px-1 py-1.5 text-[12.5px] transition-colors"
      style={{ color: "var(--ink-2)" }}
    >
      <span
        className="grid h-4 w-4 flex-shrink-0 place-items-center"
        style={{
          borderRadius: "var(--r-pill)",
          backgroundColor: complete ? "var(--brand)" : "transparent",
          border: complete
            ? "1px solid var(--brand)"
            : "1.5px solid var(--rule-strong)",
          color: "var(--bg)",
        }}
        aria-hidden="true"
      >
        {complete ? <Check className="h-2.5 w-2.5" /> : null}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function ResumeDraftRailCard({ stats }: { stats: DashboardStats }) {
  const hasResume = stats.resumesGenerated > 0;
  const completion = hasResume ? 87 : 0;

  return (
    <RailCard
      eyebrow="Resumes"
      title="Resume draft"
      description={
        hasResume
          ? "Continue tailoring your most recent draft."
          : "Upload a base resume to start drafting."
      }
      footer={
        hasResume ? (
          <>
            <ProgressBar percent={completion} />
            <p
              className="mt-1.5 text-[11.5px]"
              style={{ color: "var(--ink-3)" }}
            >
              {completion}% complete
            </p>
          </>
        ) : (
          <Link
            href="/bank"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
            style={{ color: "var(--brand)" }}
          >
            Upload resume <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )
      }
    />
  );
}

function InterviewRailCard({ job }: { job?: RecentJob }) {
  if (!job) {
    return (
      <RailCard
        eyebrow="Interview prep"
        title="Nothing scheduled"
        description="Move an opportunity into interviewing to start practicing answers."
        footer={
          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
            style={{ color: "var(--brand)" }}
          >
            Open prep <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <RailCard
      eyebrow="Interview prep"
      title={job.company}
      description={job.title}
      footer={
        <div
          className="flex items-center justify-between gap-2 px-3 py-2"
          style={{
            backgroundColor: "var(--brand-soft)",
            borderRadius: "var(--r-sm)",
          }}
        >
          <div className="min-w-0">
            <p
              className="text-[12px] font-medium"
              style={{ color: "var(--ink)" }}
            >
              Upcoming interview
            </p>
            <p
              className="font-mono text-[10.5px]"
              style={{ color: "var(--brand-dark)" }}
            >
              <Calendar className="mr-1 inline-block h-3 w-3" /> coming soon
            </p>
          </div>
          <Link
            href="/interview"
            className="inline-flex flex-shrink-0 items-center px-2.5 py-1 text-[11.5px] font-medium"
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--bg)",
              borderRadius: "var(--r-sm)",
            }}
          >
            Start prep
          </Link>
        </div>
      }
    />
  );
}
