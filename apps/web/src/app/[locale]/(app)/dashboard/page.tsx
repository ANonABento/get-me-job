"use client";

import { nowIso } from "@/lib/format/time";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Upload,
  FileText,
  ArrowRight,
  CheckCircle2,
  Plus,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  UserCheck,
  Circle,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  Puzzle,
  type LucideIcon,
} from "lucide-react";
import {
  calculateProfileCompleteness,
  type ProfileCompletenessResult,
} from "@/lib/profile-completeness";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useErrorToast } from "@/hooks/use-error-toast";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import {
  AppPage,
  PageContent,
  PagePanel,
  PagePanelHeader,
  pageGridClasses,
} from "@/components/ui/page-layout";
import {
  EditorialDashboardHeader,
  buildDashboardSubline,
} from "@/components/dashboard/editorial-header";
import {
  EditorialDashboardRail,
  EditorialFocusedMoves,
  EditorialPipelineStrip,
  EditorialRecentTable,
} from "@/components/dashboard/editorial-sections";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { SkeletonCard, SkeletonStatCard } from "@/components/ui/skeleton";
import {
  BASIC_ONBOARDING_STEPS,
  countCompletedSteps,
  getActiveStepIndex,
} from "@/lib/onboarding/steps";
import { computeOnboardingActive } from "@/lib/onboarding/state";
import type { OnboardingStep } from "@/lib/onboarding/types";
import { hasExtensionConnectionToken } from "@/lib/extension/detect";
import {
  getPipelineCount,
  getPipelineTotal,
} from "@/lib/opportunities/pipeline";
import { Link } from "@/i18n/navigation";
import { StreakHeroCard } from "@/components/streak/streak-hero-card";
import type { StreakState } from "@/lib/streak/types";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface DashboardStats {
  documentsCount: number;
  resumesGenerated: number;
  profileCompleteness: ProfileCompletenessResult;
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

interface OnboardingApiState {
  dismissedAt: string | null;
  firstName: string | null;
}

type DashboardResource =
  | "profile"
  | "documents"
  | "analytics"
  | "onboarding"
  | "streak";

type ResourceErrors = Partial<Record<DashboardResource, string>>;

interface ProfileApiData {
  profile?: Parameters<typeof calculateProfileCompleteness>[0];
}

interface DocumentsApiData {
  documents?: Array<Record<string, unknown>>;
}

interface AnalyticsApiData {
  overview?: { totalResumesGenerated?: number };
  jobs?: { byStatus?: Record<string, number> };
  recent?: { jobs?: RecentJob[] };
}

interface StreakApiData {
  streak?: StreakState | null;
}

const DEFAULT_STATS: DashboardStats = {
  documentsCount: 0,
  resumesGenerated: 0,
  profileCompleteness: { percentage: 0, sections: [], nextAction: null },
  jobsByStatus: {},
  extensionInstalled: false,
};

class AuthRequiredError extends Error {
  constructor() {
    super("AUTH_REQUIRED");
  }
}

class RequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function isTransientError(error: unknown) {
  return (
    (error instanceof RequestError && error.status >= 500) ||
    error instanceof TypeError
  );
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function retry<T>(
  operation: () => Promise<T>,
  { times = 2, backoffMs = 300 }: { times?: number; backoffMs?: number } = {},
) {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof AuthRequiredError) throw error;
      if (attempt >= times || !isTransientError(error)) throw error;

      attempt += 1;
      await delay(backoffMs * attempt);
    }
  }
}

async function fetchJson<T>(url: string) {
  return retry(async () => {
    const response = await fetch(url);
    const body = await response.json().catch(() => null);

    if (response.status === 401) {
      throw new AuthRequiredError();
    }

    if (!response.ok) {
      throw new RequestError(
        body?.error || `Request failed for ${url}`,
        response.status,
      );
    }

    return body as T;
  });
}

function getResourceError(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function hasAnyError(errors: ResourceErrors, resources: DashboardResource[]) {
  return resources.some((resource) => Boolean(errors[resource]));
}

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingApiState>({
    dismissedAt: null,
    firstName: null,
  });
  const [dismissSubmitting, setDismissSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<ResourceErrors>({});
  const [retryingResources, setRetryingResources] = useState<
    DashboardResource[]
  >([]);
  const showErrorToast = useErrorToast();

  const redirectToSignIn = useCallback(() => {
    window.location.assign("/sign-in?callbackUrl=/dashboard");
  }, []);

  const loadResource = useCallback(
    async (resource: DashboardResource) => {
      try {
        setLoadErrors((current) => ({ ...current, [resource]: undefined }));

        if (resource === "profile") {
          const profileData = await fetchJson<ProfileApiData>("/api/profile");
          setStats((current) => ({
            ...current,
            profileCompleteness: calculateProfileCompleteness(
              profileData.profile ?? null,
            ),
            extensionInstalled: hasExtensionConnectionToken(
              window.localStorage,
            ),
          }));
          return;
        }

        if (resource === "documents") {
          const documentsData = await fetchJson<DocumentsApiData>(
            "/api/documents?limit=200",
          );
          setStats((current) => ({
            ...current,
            documentsCount: (documentsData.documents || []).length,
            extensionInstalled: hasExtensionConnectionToken(
              window.localStorage,
            ),
          }));
          return;
        }

        if (resource === "analytics") {
          const analyticsData =
            await fetchJson<AnalyticsApiData>("/api/analytics");
          setStats((current) => ({
            ...current,
            resumesGenerated:
              analyticsData.overview?.totalResumesGenerated || 0,
            jobsByStatus: analyticsData.jobs?.byStatus || {},
            extensionInstalled: hasExtensionConnectionToken(
              window.localStorage,
            ),
          }));
          setRecentJobs(analyticsData.recent?.jobs || []);
          return;
        }

        if (resource === "onboarding") {
          const onboardingData = await fetchJson<OnboardingApiState>(
            "/api/onboarding/state",
          );
          setOnboardingState({
            dismissedAt: onboardingData.dismissedAt ?? null,
            firstName: onboardingData.firstName ?? null,
          });
          return;
        }

        const streakData = await fetchJson<StreakApiData>("/api/streak");
        setStreak(streakData.streak ?? null);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          redirectToSignIn();
          return;
        }

        setLoadErrors((current) => ({
          ...current,
          [resource]: getResourceError(error),
        }));
      }
    },
    [redirectToSignIn],
  );

  const retryResources = useCallback(
    async (resources: DashboardResource[]) => {
      setRetryingResources((current) =>
        Array.from(new Set([...current, ...resources])),
      );

      try {
        await Promise.all(resources.map((resource) => loadResource(resource)));
      } finally {
        setRetryingResources((current) =>
          current.filter((resource) => !resources.includes(resource)),
        );
      }
    },
    [loadResource],
  );

  useEffect(() => {
    async function fetchStats() {
      const primaryResources: DashboardResource[] = [
        "profile",
        "documents",
        "analytics",
        "onboarding",
      ];

      const streakLoad = loadResource("streak");
      await Promise.allSettled(
        primaryResources.map((resource) => loadResource(resource)),
      );

      setLoading(false);
      await streakLoad;
    }

    fetchStats();
  }, [loadResource, redirectToSignIn]);

  async function handleSkipOnboarding() {
    const previousState = onboardingState;

    try {
      setDismissSubmitting(true);
      const optimisticDismissedAt = nowIso();
      setOnboardingState((current) => ({
        ...current,
        dismissedAt: optimisticDismissedAt,
      }));

      const response = await fetch("/api/onboarding/dismiss", {
        method: "POST",
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          redirectToSignIn();
          return;
        }

        throw new Error(body?.error || "Could not skip onboarding.");
      }

      setOnboardingState({
        dismissedAt: body.dismissedAt ?? optimisticDismissedAt,
        firstName: body.firstName ?? previousState.firstName,
      });
    } catch (error) {
      setOnboardingState(previousState);
      showErrorToast(error, {
        title: t("errors.skipTitle"),
        fallbackDescription: t("errors.skipFallback"),
      });
    } finally {
      setDismissSubmitting(false);
    }
  }

  const onboardingActive = computeOnboardingActive({
    dismissedAt: onboardingState.dismissedAt,
    stats,
  });

  const retrying = useMemo(
    () => new Set(retryingResources),
    [retryingResources],
  );

  const totalPipeline = getPipelineTotal(stats.jobsByStatus);
  const queueCount = getPipelineCount(stats.jobsByStatus, "saved");
  const interviewsThisWeek = getPipelineCount(
    stats.jobsByStatus,
    "interviewing",
  );
  const headerTitle = onboardingState.firstName
    ? `Today, ${onboardingState.firstName}`
    : "Today";
  const headerSubline = buildDashboardSubline({
    queueCount: !loading ? queueCount : undefined,
    interviewsThisWeek: !loading ? interviewsThisWeek : undefined,
  });

  return (
    <ErrorBoundary>
      <AppPage padding="none">
        <EditorialDashboardHeader title={headerTitle} subline={headerSubline} />
        <PageContent width="wide" className="space-y-4 lg:py-8">
          {loading ? (
            <DashboardSkeleton />
          ) : onboardingActive ? (
            <NewUserDashboard
              stats={stats}
              firstName={onboardingState.firstName}
              onSkip={handleSkipOnboarding}
              skipSubmitting={dismissSubmitting}
            />
          ) : (
            <ActiveDashboard
              stats={stats}
              recentJobs={recentJobs}
              firstName={onboardingState.firstName}
              streak={streak}
              errors={loadErrors}
              retrying={retrying}
              onRetry={retryResources}
            />
          )}
        </PageContent>
      </AppPage>
    </ErrorBoundary>
  );
}

function NewUserDashboard({
  stats,
  firstName,
  onSkip,
  skipSubmitting,
}: {
  stats: DashboardStats;
  firstName: string | null;
  onSkip: () => void;
  skipSubmitting: boolean;
}) {
  const a11yT = useA11yTranslations();

  const t = useTranslations("dashboard");
  const steps = BASIC_ONBOARDING_STEPS;
  const completedCount = countCompletedSteps(steps, stats);
  const activeStepIndex = getActiveStepIndex(steps, stats);
  const activeStep = steps[activeStepIndex] ?? steps[0];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-lg)",
            padding: "20px 22px",
          }}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p
                className="font-mono text-[10px] uppercase"
                style={{
                  letterSpacing: "0.16em",
                  color: "var(--brand)",
                }}
              >
                {t("onboarding.startHere")}
              </p>
              <h2
                className="mt-1.5"
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: "var(--ink)",
                }}
              >
                {t("onboarding.title")}
              </h2>
              <p
                className="mt-2 max-w-prose text-[13.5px] leading-snug"
                style={{ color: "var(--ink-2)" }}
              >
                {t("onboarding.description")}
              </p>
            </div>
            <div
              className="inline-flex w-fit shrink-0 items-center gap-2 px-3 py-1.5"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--r-pill)",
                color: "var(--ink-2)",
              }}
            >
              <span
                className="grid h-5 w-5 place-items-center font-mono text-[11px] font-semibold"
                style={{
                  backgroundColor: "var(--brand)",
                  color: "var(--bg)",
                  borderRadius: "var(--r-pill)",
                }}
              >
                {completedCount}
              </span>
              <span className="text-[12px] font-medium">
                {t("onboarding.complete", { total: steps.length })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <SetupStep
                key={step.id}
                number={index + 1}
                step={step}
                active={index === activeStepIndex}
                complete={step.isComplete(stats)}
              />
            ))}
          </div>
        </section>

        <aside
          className="flex flex-col"
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-lg)",
            padding: "20px 22px",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 flex-shrink-0 place-items-center"
              style={{
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand-dark)",
                borderRadius: "var(--r-sm)",
              }}
              aria-hidden="true"
            >
              <Target className="h-4 w-4" />
            </span>
            <span
              className="font-mono text-[10px] uppercase"
              style={{
                letterSpacing: "0.16em",
                color: "var(--ink-3)",
              }}
            >
              {t("onboarding.unlocks")}
            </span>
          </div>
          <p
            className="mt-3 text-[13.5px] leading-snug"
            style={{ color: "var(--ink-2)" }}
          >
            {getUnlockPreviewIntro(activeStep, t)}
          </p>
          <div
            className="mt-4 pt-4"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <p
              className="font-mono text-[10px] uppercase"
              style={{
                letterSpacing: "0.14em",
                color: "var(--ink-3)",
              }}
            >
              {t("onboarding.afterStep")}
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {getUnlockPreviewItems(activeStep, t).map((item) => (
              <UnlockItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
          <div
            className="mt-auto pt-4"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onSkip}
              disabled={skipSubmitting}
              aria-label={a11yT("skipOnboarding")}
            >
              {t("onboarding.skip")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SetupStep({
  number,
  step,
  active = false,
  complete = false,
}: {
  number: number;
  step: OnboardingStep;
  active?: boolean;
  complete?: boolean;
}) {
  const t = useTranslations("dashboard");
  const Icon = step.icon;

  return (
    <Link
      href={step.href}
      className="group flex items-center gap-3.5 px-3.5 py-3 transition-colors"
      style={{
        backgroundColor: active ? "var(--brand-soft)" : "var(--bg)",
        border: active ? "1px solid var(--brand)" : "1px solid var(--rule)",
        borderRadius: "var(--r-md)",
        color: "var(--ink)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--rule)";
      }}
    >
      <span
        className="grid h-7 w-7 flex-shrink-0 place-items-center font-mono text-[11px] font-semibold"
        style={{
          borderRadius: "var(--r-pill)",
          backgroundColor: complete
            ? "var(--brand)"
            : active
              ? "var(--paper)"
              : "var(--paper)",
          color: complete ? "var(--bg)" : "var(--ink-2)",
          border: complete ? "1px solid var(--brand)" : "1px solid var(--rule)",
        }}
        aria-hidden="true"
      >
        {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : `0${number}`}
      </span>
      <Icon
        className="h-3.5 w-3.5 flex-shrink-0"
        style={{ color: active ? "var(--brand-dark)" : "var(--ink-3)" }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <h3
          className="text-[13.5px] font-semibold leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {t(`onboarding.steps.${step.id}.title`)}
        </h3>
        <p
          className="mt-0.5 text-[12px] leading-snug"
          style={{ color: "var(--ink-3)" }}
        >
          {t(`onboarding.steps.${step.id}.description`)}
        </p>
      </div>
      <span
        className="inline-flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium"
        style={{
          backgroundColor: active ? "var(--ink)" : "var(--paper)",
          color: active ? "var(--bg)" : "var(--ink-2)",
          border: active ? "none" : "1px solid var(--rule)",
          borderRadius: "var(--r-pill)",
        }}
      >
        {active
          ? t("onboarding.recommended")
          : t(`onboarding.steps.${step.id}.actionLabel`)}
        {!active ? <ArrowRight className="h-3 w-3" aria-hidden="true" /> : null}
      </span>
    </Link>
  );
}

function UnlockItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px]">
      <span
        className="grid h-7 w-7 flex-shrink-0 place-items-center"
        style={{
          backgroundColor: "var(--brand-soft)",
          color: "var(--brand-dark)",
          borderRadius: "var(--r-sm)",
        }}
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p
          className="font-medium leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-[11.5px] leading-snug"
          style={{ color: "var(--ink-3)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function ActiveDashboard({
  stats,
  recentJobs,
  firstName,
  streak,
  errors,
  retrying,
  onRetry,
}: {
  stats: DashboardStats;
  recentJobs: RecentJob[];
  firstName: string | null;
  streak: StreakState | null;
  errors: ResourceErrors;
  retrying: Set<DashboardResource>;
  onRetry: (resources: DashboardResource[]) => void;
}) {
  const t = useTranslations("dashboard");
  const commonT = useTranslations("common");
  const actions = buildTodayActions(stats, recentJobs, t);
  const statsResources: DashboardResource[] = [
    "profile",
    "documents",
    "analytics",
  ];
  const statsError = hasAnyError(errors, statsResources);
  const statsRetrying = statsResources.some((resource) =>
    retrying.has(resource),
  );
  const retryStats = () => onRetry(statsResources);
  const retryAnalytics = () => onRetry(["analytics"]);
  const retryStreak = () => onRetry(["streak"]);

  return (
    <div className="space-y-5">
      <Suspense fallback={<SkeletonCard />}>
        {errors.streak ? (
          <DashboardSectionError
            onRetry={retryStreak}
            retryLabel={commonT("tryAgain")}
            retrying={retrying.has("streak")}
          />
        ) : (
          <StreakHeroCard streak={streak} />
        )}
      </Suspense>

      <Suspense fallback={<SkeletonCard />}>
        {statsError ? (
          <DashboardSectionError
            onRetry={retryStats}
            retryLabel={commonT("tryAgain")}
            retrying={statsRetrying}
          />
        ) : (
          <EditorialFocusedMoves actions={actions} />
        )}
      </Suspense>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Suspense
            fallback={
              <div className={pageGridClasses.fourStats}>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </div>
            }
          >
            {errors.analytics ? (
              <DashboardSectionError
                onRetry={retryAnalytics}
                retryLabel={commonT("tryAgain")}
                retrying={retrying.has("analytics")}
              />
            ) : (
              <EditorialPipelineStrip stats={stats} />
            )}
          </Suspense>
          <Suspense fallback={<SkeletonCard />}>
            {errors.analytics ? (
              <DashboardSectionError
                onRetry={retryAnalytics}
                retryLabel={commonT("tryAgain")}
                retrying={retrying.has("analytics")}
              />
            ) : (
              <EditorialRecentTable recentJobs={recentJobs} />
            )}
          </Suspense>
        </div>

        <Suspense fallback={<SkeletonCard />}>
          {statsError ? (
            <DashboardSectionError
              onRetry={retryStats}
              retryLabel={commonT("tryAgain")}
              retrying={statsRetrying}
            />
          ) : (
            <EditorialDashboardRail stats={stats} recentJobs={recentJobs} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

function DashboardSectionError({
  onRetry,
  retryLabel,
  retrying = false,
}: {
  onRetry: () => void;
  retryLabel: string;
  retrying?: boolean;
}) {
  const t = useTranslations("dashboard");

  return (
    <PagePanel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {t("errors.loadSection")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      </div>
    </PagePanel>
  );
}

interface TodayAction {
  icon: LucideIcon;
  title: string;
  context: string;
  href: string;
  actionLabel: string;
  tone: "primary" | "warning" | "success";
}

function buildTodayActions(
  stats: DashboardStats,
  recentJobs: RecentJob[],
  t: ReturnType<typeof useTranslations<"dashboard">>,
): TodayAction[] {
  const actions: TodayAction[] = [];

  if (stats.documentsCount === 0) {
    actions.push({
      icon: Upload,
      title: t("today.uploadResumeTitle"),
      context: t("today.uploadResumeContext"),
      href: "/bank",
      actionLabel: t("today.uploadResumeAction"),
      tone: "primary",
    });
  }

  if (stats.jobsByStatus.pending) {
    actions.push({
      icon: Briefcase,
      title: t("today.reviewNewTitle", { count: stats.jobsByStatus.pending }),
      context: t("today.reviewNewContext"),
      href: "/opportunities/review",
      actionLabel: t("today.reviewNewAction"),
      tone: "primary",
    });
  }

  if (stats.profileCompleteness.percentage < 80) {
    actions.push({
      icon: UserCheck,
      title: t("today.completeProfileTitle"),
      context: t("today.completeProfileContext", {
        percentage: stats.profileCompleteness.percentage,
      }),
      href: stats.profileCompleteness.nextAction?.href ?? "/profile",
      actionLabel: t("today.completeProfileAction"),
      tone: "warning",
    });
  }

  if (recentJobs.some((job) => job.status === "interviewing")) {
    actions.push({
      icon: Calendar,
      title: t("today.prepareInterviewsTitle"),
      context: t("today.prepareInterviewsContext"),
      href: "/interview",
      actionLabel: t("today.prepareInterviewsAction"),
      tone: "success",
    });
  }

  actions.push({
    icon: Mail,
    title: t("today.draftFollowUpTitle"),
    context: t("today.draftFollowUpContext"),
    href: "/emails",
    actionLabel: t("today.draftFollowUpAction"),
    tone: "primary",
  });

  if (stats.documentsCount > 0) {
    actions.push({
      icon: FileText,
      title: t("today.tailoredDocumentTitle"),
      context: t("today.tailoredDocumentContext", {
        count: stats.documentsCount,
      }),
      href: "/studio",
      actionLabel: t("today.tailoredDocumentAction"),
      tone: "primary",
    });
  }

  return actions.slice(0, 3);
}

function getUnlockPreviewIntro(
  step: OnboardingStep | undefined,
  t: ReturnType<typeof useTranslations<"dashboard">>,
): string {
  const knownIds = [
    "upload-resume",
    "install-extension",
    "add-opportunity",
    "create-tailored-doc",
  ];
  const previewId =
    step?.id && knownIds.includes(step.id) ? step.id : "upload-resume";

  return t(`onboarding.unlockPreview.${previewId}.intro`);
}

function getUnlockPreviewItems(
  step: OnboardingStep | undefined,
  t: ReturnType<typeof useTranslations<"dashboard">>,
): Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> {
  switch (step?.id) {
    case "install-extension":
      return [
        {
          icon: Puzzle,
          title: t("onboarding.unlockPreview.install-extension.items.0.title"),
          description: t(
            "onboarding.unlockPreview.install-extension.items.0.description",
          ),
        },
        {
          icon: FileText,
          title: t("onboarding.unlockPreview.install-extension.items.1.title"),
          description: t(
            "onboarding.unlockPreview.install-extension.items.1.description",
          ),
        },
        {
          icon: Briefcase,
          title: t("onboarding.unlockPreview.install-extension.items.2.title"),
          description: t(
            "onboarding.unlockPreview.install-extension.items.2.description",
          ),
        },
      ];
    case "add-opportunity":
      return [
        {
          icon: Target,
          title: t("onboarding.unlockPreview.add-opportunity.items.0.title"),
          description: t(
            "onboarding.unlockPreview.add-opportunity.items.0.description",
          ),
        },
        {
          icon: Calendar,
          title: t("onboarding.unlockPreview.add-opportunity.items.1.title"),
          description: t(
            "onboarding.unlockPreview.add-opportunity.items.1.description",
          ),
        },
        {
          icon: BarChart3,
          title: t("onboarding.unlockPreview.add-opportunity.items.2.title"),
          description: t(
            "onboarding.unlockPreview.add-opportunity.items.2.description",
          ),
        },
      ];
    case "create-tailored-doc":
      return [
        {
          icon: CheckCircle2,
          title: t(
            "onboarding.unlockPreview.create-tailored-doc.items.0.title",
          ),
          description: t(
            "onboarding.unlockPreview.create-tailored-doc.items.0.description",
          ),
        },
        {
          icon: Mail,
          title: t(
            "onboarding.unlockPreview.create-tailored-doc.items.1.title",
          ),
          description: t(
            "onboarding.unlockPreview.create-tailored-doc.items.1.description",
          ),
        },
        {
          icon: UserCheck,
          title: t(
            "onboarding.unlockPreview.create-tailored-doc.items.2.title",
          ),
          description: t(
            "onboarding.unlockPreview.create-tailored-doc.items.2.description",
          ),
        },
      ];
    case "upload-resume":
    default:
      return [
        {
          icon: FileText,
          title: t("onboarding.unlockPreview.upload-resume.items.0.title"),
          description: t(
            "onboarding.unlockPreview.upload-resume.items.0.description",
          ),
        },
        {
          icon: Briefcase,
          title: t("onboarding.unlockPreview.upload-resume.items.1.title"),
          description: t(
            "onboarding.unlockPreview.upload-resume.items.1.description",
          ),
        },
        {
          icon: Target,
          title: t("onboarding.unlockPreview.upload-resume.items.2.title"),
          description: t(
            "onboarding.unlockPreview.upload-resume.items.2.description",
          ),
        },
      ];
  }
}
