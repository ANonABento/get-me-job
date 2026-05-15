"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  DollarSign,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { CompletenessCard } from "@/components/profile/completeness-card";
import { ProfileEmptyState } from "@/components/profile/profile-empty-state";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { Textarea } from "@/components/ui/textarea";
import {
  EditorialPanel,
  EditorialPanelBody,
  EditorialPanelHeader,
  MonoCap,
  CompanyGlyph,
} from "@/components/editorial";
import { pluralize } from "@/lib/text/pluralize";
import {
  formValuesToProfileUpdate,
  getProfileInitials,
  joinProfileList,
  profileToFormValues,
  splitProfileList,
  type ProfileFormValues,
} from "@/lib/profile-form";
import { cn } from "@/lib/utils";
import {
  getCrossedCompletenessThresholds,
  scoreProfile,
  type ProfileCompletenessGap,
} from "@/lib/profile/completeness";
import type { Profile } from "@/types";
import { LifetimeStatsCard } from "@/components/streak/lifetime-stats-card";
import type { StreakState } from "@/lib/streak/types";
import { Link } from "@/i18n/navigation";

type ProfileTab = "overview" | "preferences" | "privacy";

const tabs: { id: ProfileTab; labelKey: string; icon: typeof User }[] = [
  { id: "overview", labelKey: "tabs.overview", icon: User },
  { id: "preferences", labelKey: "tabs.preferences", icon: BriefcaseBusiness },
  { id: "privacy", labelKey: "tabs.privacy", icon: Shield },
];

const workStyleOptions = [
  { value: "remote", labelKey: "workStyle.options.remote" },
  { value: "hybrid", labelKey: "workStyle.options.hybrid" },
  { value: "onsite", labelKey: "workStyle.options.onsite" },
  { value: "full-time", labelKey: "workStyle.options.fullTime" },
  { value: "contract", labelKey: "workStyle.options.contract" },
];

function formatSalaryRange(
  form: ProfileFormValues,
  t: ReturnType<typeof useTranslations>,
): string {
  const min = form.targetSalaryMin.trim();
  const max = form.targetSalaryMax.trim();

  if (!min && !max) return t("sidebar.noTargetSalary");
  if (min && max)
    return t("sidebar.salaryRange", {
      currency: form.targetSalaryCurrency,
      min,
      max,
    });
  if (min)
    return t("sidebar.salaryMinimum", {
      currency: form.targetSalaryCurrency,
      min,
    });
  return t("sidebar.salaryMaximum", {
    currency: form.targetSalaryCurrency,
    max,
  });
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

/**
 * Editorial section row — mono-cap label on the left, editable input(s)
 * on the right. Mirrors the v2 `.pf-row` pattern with 180px label column
 * on >=md. Stacks vertically on small screens.
 */
function ResumeRow({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-3 border-b border-rule py-3.5 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4">
      <div className="flex items-baseline gap-0.5 pt-2">
        <Label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
          {label}
        </Label>
        {required ? (
          <span aria-hidden className="text-brand">
            *
          </span>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Source pill — "AI extracted" / "Hand-written" — small mono-cap chip
 * sitting in section heads to indicate how the section was populated.
 */
function SourcePill({
  variant = "ai",
  children,
}: {
  variant?: "ai" | "user";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
        variant === "ai"
          ? "bg-brand-soft text-brand"
          : "bg-rule-strong-bg text-ink-3",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Completion ring — visual echo of the v2 `.pf-ring` SVG ring. Reads
 * the same completeness score the rest of the page uses; purely
 * presentational (the live `<CompletenessCard>` carries the real
 * progressbar role + gap list).
 */
function CompletionRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="var(--rule-strong-bg)"
        strokeWidth="6"
      />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text
        x="28"
        y="32"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
      >
        {clamped}%
      </text>
    </svg>
  );
}

interface SectionStatus {
  id: string;
  labelKey: string;
  count: number | null;
  tone: "ok" | "warn" | "miss";
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [form, setForm] = useState<ProfileFormValues>(() =>
    profileToFormValues(null),
  );
  const [savedForm, setSavedForm] = useState<ProfileFormValues>(() =>
    profileToFormValues(null),
  );
  const [targetRolesText, setTargetRolesText] = useState("");
  const [loading, setLoading] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  // Bump to re-run the initial load when the user retries after a fetch
  // failure. The actual reload logic lives in the loadProfile effect below.
  const [reloadKey, setReloadKey] = useState(0);
  const [celebratingCompleteness, setCelebratingCompleteness] = useState(false);
  const previousCompletenessScore = useRef<number | null>(null);
  const loadProfileError = t("errors.loadProfile");

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const liveProfile = useMemo<Profile>(() => {
    const update = formValuesToProfileUpdate(form, profile);
    const baseProfile: Profile = profile ?? {
      id: "live-profile",
      contact: { name: "" },
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    };

    return {
      ...baseProfile,
      ...update,
      contact: {
        ...baseProfile.contact,
        ...(update.contact ?? {}),
      },
    };
  }, [form, profile]);

  const completeness = useMemo(() => scoreProfile(liveProfile), [liveProfile]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      setAuthRedirecting(false);

      try {
        const [profileResponse, streakResponse] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/streak"),
        ]);
        if (cancelled) return;

        if (profileResponse.status === 401) {
          setAuthRedirecting(true);
          router.replace(
            `/${locale}/sign-in?callbackUrl=${encodeURIComponent(`/${locale}/profile`)}`,
          );
          return;
        }

        if (!profileResponse.ok) throw new Error(loadProfileError);
        const data = (await profileResponse.json()) as {
          profile: Profile | null;
        };
        const streakData = streakResponse.ok
          ? ((await streakResponse.json()) as { streak?: StreakState })
          : {};
        if (cancelled) return;

        const nextForm = profileToFormValues(data.profile);
        setProfile(data.profile);
        setShowEmptyState(data.profile === null);
        setStreak(streakData.streak ?? null);
        setForm(nextForm);
        setSavedForm(nextForm);
        setTargetRolesText(joinProfileList(nextForm.targetRoles));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : loadProfileError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [loadProfileError, locale, router, reloadKey]);

  useEffect(() => {
    if (!isDirty) return;

    const prompt = t("unsavedChanges.prompt");
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = prompt;
      return prompt;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, t]);

  useEffect(() => {
    if (!isDirty) return;

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);
      if (currentUrl.href === nextUrl.href) return;

      if (!window.confirm(t("unsavedChanges.prompt"))) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () =>
      document.removeEventListener("click", handleDocumentClick, true);
  }, [isDirty, t]);

  useEffect(() => {
    if (loading) return;
    const previousScore = previousCompletenessScore.current;
    previousCompletenessScore.current = completeness.score;

    if (previousScore === null) return;
    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      getCrossedCompletenessThresholds(previousScore, completeness.score)
        .length === 0
    ) {
      return;
    }

    setCelebratingCompleteness(true);
    const timeout = window.setTimeout(
      () => setCelebratingCompleteness(false),
      900,
    );

    return () => window.clearTimeout(timeout);
  }, [completeness.score, loading]);

  function updateField<K extends keyof ProfileFormValues>(
    field: K,
    value: ProfileFormValues[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus(null);
  }

  function toggleWorkStyle(value: string) {
    setForm((current) => {
      const exists = current.workStyle.includes(value);
      return {
        ...current,
        workStyle: exists
          ? current.workStyle.filter((item) => item !== value)
          : [...current.workStyle, value],
      };
    });
    setStatus(null);
  }

  function discardChanges() {
    setForm(savedForm);
    setTargetRolesText(joinProfileList(savedForm.targetRoles));
    setStatus(null);
    setError(null);
  }

  async function saveChanges() {
    const previousSavedForm = savedForm;

    setSaving(true);
    setError(null);
    setStatus(null);
    setSavedForm(form);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToProfileUpdate(form, profile)),
      });
      const data = (await response.json()) as {
        profile?: Profile | null;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? t("errors.saveProfile"));

      const nextProfile = data.profile ?? profile;
      const nextForm = profileToFormValues(nextProfile);
      setProfile(nextProfile);
      setForm(nextForm);
      setSavedForm(nextForm);
      setTargetRolesText(joinProfileList(nextForm.targetRoles));
      window.dispatchEvent(new Event("taida:profile:updated"));
      setShowEmptyState(false);
      setStatus(t("status.saved"));
    } catch (err) {
      setSavedForm(previousSavedForm);
      setError(err instanceof Error ? err.message : t("errors.saveProfile"));
    } finally {
      setSaving(false);
    }
  }

  const initials = getProfileInitials(form.name);
  const salaryRange = formatSalaryRange(form, t);
  const careerDetailProfile =
    profile && (profile.experiences.length > 0 || profile.projects.length > 0)
      ? profile
      : null;

  function focusField(tab: ProfileTab, fieldId: string) {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const field = document.getElementById(fieldId);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (field instanceof HTMLElement) field.focus();
    });
  }

  function focusGap(gap: ProfileCompletenessGap) {
    if (gap.focus.fieldId) {
      focusField(gap.focus.tab, gap.focus.fieldId);
      return;
    }

    setActiveTab(gap.focus.tab);
    requestAnimationFrame(() => {
      const section = gap.focus.sectionId
        ? document.getElementById(gap.focus.sectionId)
        : null;
      section?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (section instanceof HTMLElement) section.focus();
    });
  }

  if (loading || authRedirecting) {
    return <ProfileSkeleton />;
  }

  // Initial load failed and no profile is in state. Show ONLY the error
  // surface with a retry — don't render the editor, otherwise the user
  // can "Save" the empty default-profile and overwrite their real server
  // data with garbage on the next successful request.
  const initialLoadFailed = error !== null && profile === null;
  if (initialLoadFailed) {
    return (
      <AppPage>
        <PageHeader
          width="wide"
          icon={User}
          title={t("title")}
          description={t("description")}
        />
        <PageContent width="wide">
          <ErrorState
            variant="card"
            title={t("errors.loadProfile")}
            message={error}
            onRetry={() => setReloadKey((n) => n + 1)}
          />
        </PageContent>
      </AppPage>
    );
  }

  // ── Section status meta for the TOC rail.
  const sectionStatuses: SectionStatus[] = [
    {
      id: "identity",
      labelKey: "sections.identity.title",
      count: null,
      tone: form.name && form.email && form.headline ? "ok" : "warn",
    },
    {
      id: "contact",
      labelKey: "sections.contact.title",
      count: null,
      tone:
        form.email || form.phone || form.linkedin || form.github || form.website
          ? "ok"
          : "warn",
    },
    {
      id: "summary",
      labelKey: "sections.summary.title",
      count: null,
      tone: form.summary.trim() ? "ok" : "warn",
    },
    {
      id: "experience-section",
      labelKey: "signals.experience",
      count: liveProfile.experiences.length,
      tone: liveProfile.experiences.length > 0 ? "ok" : "miss",
    },
    {
      id: "education-section",
      labelKey: "signals.education",
      count: liveProfile.education.length,
      tone: liveProfile.education.length > 0 ? "ok" : "miss",
    },
    {
      id: "skills-section",
      labelKey: "signals.skills",
      count: liveProfile.skills.length,
      tone: liveProfile.skills.length > 0 ? "ok" : "miss",
    },
    {
      id: "projects-section",
      labelKey: "signals.projects",
      count: liveProfile.projects.length,
      tone: liveProfile.projects.length > 0 ? "ok" : "miss",
    },
  ];

  return (
    <AppPage>
      <PageHeader
        width="wide"
        icon={User}
        title={t("title")}
        description={t("description")}
        actions={
          <>
            {saving || status ? (
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-2 text-sm font-medium text-success"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {saving ? t("status.saving") : status}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || saving}
              onClick={discardChanges}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("actions.discard")}
            </Button>
            <Button
              type="button"
              disabled={!isDirty || saving}
              onClick={() => void saveChanges()}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t("actions.saveChanges")}
            </Button>
          </>
        }
      />

      <PageContent width="wide">
        {error ? (
          <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="mb-5 flex flex-col gap-2 rounded-[var(--radius)] border bg-card/70 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t("answerBankPrompt.text")}</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/answer-bank">{t("answerBankPrompt.action")}</Link>
          </Button>
        </div>

        {showEmptyState ? (
          <ProfileEmptyState onFillManually={() => setShowEmptyState(false)} />
        ) : (
          <>
            {/* Resume hero — large display H1 + contact-info row + avatar tile. */}
            <EditorialPanel className="mb-6">
              <EditorialPanelBody className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {/* Avatar tile — flat editorial treatment matching the
                    AppBar chip. Initials live as the base layer; the
                    img sits on top and self-hides on error (handles
                    stale seed URLs like example.com). */}
                <div className="flex-shrink-0">
                  <div
                    className="relative grid h-20 w-20 place-items-center overflow-hidden font-display text-[26px] font-bold"
                    style={{
                      borderRadius: "var(--r-md)",
                      backgroundColor: "var(--brand-soft)",
                      border: "1px solid var(--rule)",
                      color: "var(--brand-dark)",
                    }}
                  >
                    <span aria-hidden="true">{initials}</span>
                    {form.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.avatarUrl}
                        alt={
                          form.name
                            ? t("sidebar.profilePhotoNamed", {
                                name: form.name,
                              })
                            : t("sidebar.profilePhoto")
                        }
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <MonoCap size="sm" tone="muted">
                    {t("title")}
                  </MonoCap>
                  <h2 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">
                    {form.name || t("sidebar.yourName")}
                  </h2>
                  {form.headline ? (
                    <p className="mt-1 text-[14px] text-ink-2">
                      {form.headline}
                    </p>
                  ) : (
                    <p className="mt-1 text-[14px] text-ink-3">
                      {t("sidebar.addHeadline")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                    <button
                      type="button"
                      onClick={() => focusField("overview", "email")}
                      className="flex min-w-0 items-center gap-1.5 rounded text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                      <span className="truncate">
                        {form.email || t("sidebar.noEmail")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => focusField("overview", "location")}
                      className="flex min-w-0 items-center gap-1.5 rounded text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                      <span className="truncate">
                        {form.location || t("sidebar.noLocation")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        focusField("preferences", "targetSalaryMin")
                      }
                      className="flex min-w-0 items-center gap-1.5 rounded text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <DollarSign className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                      <span className="truncate">{salaryRange}</span>
                    </button>
                    {form.linkedin ? (
                      <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
                        <Linkedin className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                        <span className="truncate">{form.linkedin}</span>
                      </span>
                    ) : null}
                    {form.github ? (
                      <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
                        <Github className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                        <span className="truncate">{form.github}</span>
                      </span>
                    ) : null}
                    {form.website ? (
                      <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                        <span className="truncate">{form.website}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </EditorialPanelBody>
            </EditorialPanel>

            <div className="mb-6">
              <CompletenessCard
                result={completeness}
                onSelectGap={focusGap}
                celebrating={celebratingCompleteness}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              {/* TOC rail + completion ring + lifetime stats + tab nav. */}
              <aside className="space-y-5">
                <nav
                  aria-label={t("tabs.ariaLabel")}
                  className="flex flex-col gap-0.5"
                >
                  <MonoCap size="sm" tone="muted" className="px-2.5 pb-2 pt-1">
                    {t("tabs.overview")}
                  </MonoCap>
                  {sectionStatuses.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 rounded-sm border-l-2 border-transparent px-2.5 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-rule-strong-bg hover:text-ink"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveTab("overview");
                        requestAnimationFrame(() => {
                          document.getElementById(section.id)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        });
                      }}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "h-2 w-2 rounded-full",
                          section.tone === "ok" &&
                            "bg-[var(--stage-applied-dot)]",
                          section.tone === "warn" &&
                            "bg-[var(--stage-interview-dot)]",
                          section.tone === "miss" && "bg-rule-strong",
                        )}
                      />
                      <span className="flex-1 truncate">
                        {t(section.labelKey)}
                      </span>
                      {section.count !== null ? (
                        <span className="font-mono text-[10px] text-ink-3">
                          {section.count}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </nav>

                {/* Profile health ring — visual echo of the completeness
                    score (the full progressbar + gap list lives in the
                    <CompletenessCard> above). */}
                <EditorialPanel aria-hidden="true">
                  <EditorialPanelBody className="flex items-center gap-3">
                    <CompletionRing score={completeness.score} />
                    <div className="min-w-0 text-[12.5px] leading-snug text-ink-2">
                      <strong className="block text-[13.5px] font-semibold text-ink">
                        {t("completeness.readiness")}
                      </strong>
                      <span className="text-ink-3">
                        {pluralize(
                          completeness.gaps.length,
                          "quick win",
                          "quick wins",
                        )}{" "}
                        left
                      </span>
                    </div>
                  </EditorialPanelBody>
                </EditorialPanel>

                <LifetimeStatsCard streak={streak} />

                <div
                  role="tablist"
                  aria-label={t("tabs.ariaLabel")}
                  className="grid gap-1 rounded-md border border-rule bg-paper p-1.5"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-ink-2 hover:bg-rule-strong-bg hover:text-ink",
                        )}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {t(tab.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="space-y-5">
                {activeTab === "overview" ? (
                  <>
                    {/* Basics / Identity */}
                    <EditorialPanel as="article" className="scroll-mt-24">
                      <div
                        id="identity"
                        data-section="identity"
                        tabIndex={-1}
                        className="focus:outline-none"
                      >
                        <EditorialPanelHeader
                          title={t("sections.identity.title")}
                          action={
                            <SourcePill variant="ai">AI extracted</SourcePill>
                          }
                        />
                        <EditorialPanelBody>
                          <ResumeRow
                            label={t("fields.fullName")}
                            htmlFor="name"
                            required
                          >
                            <Input
                              id="name"
                              value={form.name}
                              onChange={(event) =>
                                updateField("name", event.target.value)
                              }
                            />
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.headline")}
                            htmlFor="headline"
                          >
                            <Input
                              id="headline"
                              value={form.headline}
                              placeholder={t("placeholders.headline")}
                              onChange={(event) =>
                                updateField("headline", event.target.value)
                              }
                            />
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.avatarUrl")}
                            htmlFor="avatarUrl"
                          >
                            <Input
                              id="avatarUrl"
                              value={form.avatarUrl}
                              placeholder="https://..."
                              onChange={(event) =>
                                updateField("avatarUrl", event.target.value)
                              }
                            />
                          </ResumeRow>
                        </EditorialPanelBody>
                      </div>
                    </EditorialPanel>

                    {/* Contact */}
                    <EditorialPanel as="article" className="scroll-mt-24">
                      <div id="contact" data-section="contact">
                        <EditorialPanelHeader
                          title={t("sections.contact.title")}
                          action={
                            <SourcePill variant="user">Hand-written</SourcePill>
                          }
                        />
                        <EditorialPanelBody>
                          <ResumeRow label={t("fields.email")} htmlFor="email">
                            <Input
                              id="email"
                              type="email"
                              value={form.email}
                              onChange={(event) =>
                                updateField("email", event.target.value)
                              }
                            />
                          </ResumeRow>
                          <ResumeRow label={t("fields.phone")} htmlFor="phone">
                            <Input
                              id="phone"
                              value={form.phone}
                              onChange={(event) =>
                                updateField("phone", event.target.value)
                              }
                            />
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.location")}
                            htmlFor="location"
                          >
                            <Input
                              id="location"
                              value={form.location}
                              onChange={(event) =>
                                updateField("location", event.target.value)
                              }
                            />
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.linkedin")}
                            htmlFor="linkedin"
                          >
                            <div className="relative">
                              <Linkedin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3" />
                              <Input
                                id="linkedin"
                                className="pl-9"
                                value={form.linkedin}
                                placeholder="https://linkedin.com/in/..."
                                onChange={(event) =>
                                  updateField("linkedin", event.target.value)
                                }
                              />
                            </div>
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.github")}
                            htmlFor="github"
                          >
                            <div className="relative">
                              <Github className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3" />
                              <Input
                                id="github"
                                className="pl-9"
                                value={form.github}
                                placeholder="https://github.com/..."
                                onChange={(event) =>
                                  updateField("github", event.target.value)
                                }
                              />
                            </div>
                          </ResumeRow>
                          <ResumeRow
                            label={t("fields.website")}
                            htmlFor="website"
                          >
                            <div className="relative">
                              <Globe className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3" />
                              <Input
                                id="website"
                                className="pl-9"
                                value={form.website}
                                placeholder="https://..."
                                onChange={(event) =>
                                  updateField("website", event.target.value)
                                }
                              />
                            </div>
                          </ResumeRow>
                        </EditorialPanelBody>
                      </div>
                    </EditorialPanel>

                    {/* Summary */}
                    <EditorialPanel as="article" className="scroll-mt-24">
                      <div id="summary" data-section="summary">
                        <EditorialPanelHeader
                          title={t("sections.summary.title")}
                          action={
                            <SourcePill variant="user">Hand-written</SourcePill>
                          }
                        />
                        <EditorialPanelBody>
                          <Field id="summaryText" label={t("fields.summary")}>
                            <Textarea
                              id="summaryText"
                              value={form.summary}
                              rows={6}
                              onChange={(event) =>
                                updateField("summary", event.target.value)
                              }
                            />
                          </Field>
                        </EditorialPanelBody>
                      </div>
                    </EditorialPanel>

                    {/* Saved profile signals — 5-up summary */}
                    <EditorialPanel as="article">
                      <div id="profile-signals" data-section="profile-signals">
                        <EditorialPanelHeader
                          title={t("sections.savedSignals.title")}
                        />
                        <EditorialPanelBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          {[
                            {
                              id: "experience",
                              label: t("signals.experience"),
                              count: liveProfile.experiences.length,
                            },
                            {
                              id: "education",
                              label: t("signals.education"),
                              count: liveProfile.education.length,
                            },
                            {
                              id: "skills",
                              label: t("signals.skills"),
                              count: liveProfile.skills.length,
                            },
                            {
                              id: "projects",
                              label: t("signals.projects"),
                              count: liveProfile.projects.length,
                            },
                            {
                              id: "achievements",
                              label: t("signals.awards"),
                              count: liveProfile.certifications.length,
                            },
                          ].map((item) => (
                            <div
                              key={item.id}
                              id={item.id}
                              tabIndex={-1}
                              className="rounded-md border border-rule bg-background p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <div className="font-display text-2xl font-semibold text-ink">
                                {item.count}
                              </div>
                              <MonoCap
                                size="sm"
                                tone="muted"
                                className="mt-0.5 block"
                              >
                                {item.label}
                              </MonoCap>
                            </div>
                          ))}
                        </EditorialPanelBody>
                      </div>
                    </EditorialPanel>

                    {/* Experience — read-only display until inline-edit API exists */}
                    {liveProfile.experiences.length > 0 ? (
                      <EditorialPanel as="article" className="scroll-mt-24">
                        <div
                          id="experience-section"
                          data-section="experience-section"
                        >
                          <EditorialPanelHeader
                            title={t("signals.experience")}
                            eyebrow={pluralize(
                              liveProfile.experiences.length,
                              "role",
                              "roles",
                            )}
                            action={
                              <SourcePill variant="ai">AI extracted</SourcePill>
                            }
                          />
                          <div>
                            {liveProfile.experiences.map(
                              (experience, index) => (
                                <div
                                  key={experience.id}
                                  className={cn(
                                    "px-[18px] py-4",
                                    index <
                                      liveProfile.experiences.length - 1 &&
                                      "border-b border-rule",
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <CompanyGlyph
                                      company={experience.company}
                                      size="lg"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-ink">
                                          {experience.title}
                                        </h3>
                                        {experience.startDate ? (
                                          <span className="flex-shrink-0 font-mono text-[11.5px] text-ink-3">
                                            {experience.startDate}
                                            {experience.current
                                              ? " — Present"
                                              : experience.endDate
                                                ? ` — ${experience.endDate}`
                                                : ""}
                                          </span>
                                        ) : null}
                                      </div>
                                      {experience.company ? (
                                        <p className="mt-0.5 text-[13px] italic text-ink-3">
                                          {experience.company}
                                          {experience.location
                                            ? ` · ${experience.location}`
                                            : ""}
                                        </p>
                                      ) : null}
                                      {experience.highlights.length > 0 ? (
                                        <ul className="mt-2 list-none space-y-1">
                                          {experience.highlights.map(
                                            (highlight, idx) => (
                                              <li
                                                key={idx}
                                                className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-2"
                                              >
                                                <span
                                                  aria-hidden
                                                  className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-ink-3"
                                                />
                                                <span>{highlight}</span>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </EditorialPanel>
                    ) : (
                      <EditorialPanel as="article" className="scroll-mt-24">
                        <div id="experience-section">
                          <EditorialPanelHeader
                            title={t("signals.experience")}
                          />
                          <EditorialPanelBody className="flex flex-col items-center gap-3 py-10 text-center">
                            <BriefcaseBusiness className="h-6 w-6 text-ink-3" />
                            <p className="max-w-prose text-[13px] text-ink-3">
                              {t("emptyState.description")}
                            </p>
                            <Button asChild size="sm" variant="outline">
                              <Link href="/bank">
                                {t("emptyState.uploadResume")}
                              </Link>
                            </Button>
                          </EditorialPanelBody>
                        </div>
                      </EditorialPanel>
                    )}

                    {/* Education */}
                    {liveProfile.education.length > 0 ? (
                      <EditorialPanel as="article" className="scroll-mt-24">
                        <div
                          id="education-section"
                          data-section="education-section"
                        >
                          <EditorialPanelHeader
                            title={t("signals.education")}
                            eyebrow={pluralize(
                              liveProfile.education.length,
                              "entry",
                              "entries",
                            )}
                            action={
                              <SourcePill variant="ai">AI extracted</SourcePill>
                            }
                          />
                          <div>
                            {liveProfile.education.map((entry, index) => (
                              <div
                                key={entry.id}
                                className={cn(
                                  "px-[18px] py-4",
                                  index < liveProfile.education.length - 1 &&
                                    "border-b border-rule",
                                )}
                              >
                                <div className="flex items-baseline justify-between gap-3">
                                  <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-ink">
                                    {entry.degree}
                                    {entry.field ? ` · ${entry.field}` : ""}
                                  </h3>
                                  {entry.endDate ? (
                                    <span className="flex-shrink-0 font-mono text-[11.5px] text-ink-3">
                                      {entry.endDate}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[13px] italic text-ink-3">
                                  {entry.institution}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </EditorialPanel>
                    ) : null}

                    {/* Skills — chip cloud */}
                    {liveProfile.skills.length > 0 ? (
                      <EditorialPanel as="article" className="scroll-mt-24">
                        <div id="skills-section" data-section="skills-section">
                          <EditorialPanelHeader
                            title={t("signals.skills")}
                            eyebrow={pluralize(
                              liveProfile.skills.length,
                              "tag",
                              "tags",
                            )}
                            action={
                              <SourcePill variant="ai">AI extracted</SourcePill>
                            }
                          />
                          <EditorialPanelBody>
                            {(() => {
                              const grouped = liveProfile.skills.reduce(
                                (acc, skill) => {
                                  const key = skill.category;
                                  acc[key] = acc[key] ?? [];
                                  acc[key]!.push(skill);
                                  return acc;
                                },
                                {} as Record<string, typeof liveProfile.skills>,
                              );
                              const categoryLabels: Record<string, string> = {
                                technical: "Technical",
                                soft: "Soft skills",
                                language: "Languages",
                                tool: "Tools",
                                other: "Other",
                              };
                              return Object.entries(grouped).map(
                                ([category, items], idx) => (
                                  <div
                                    key={category}
                                    className={cn(idx > 0 && "mt-4")}
                                  >
                                    <MonoCap
                                      size="sm"
                                      tone="muted"
                                      className="block"
                                    >
                                      {categoryLabels[category] ?? category}
                                    </MonoCap>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {items.map((skill) => (
                                        <span
                                          key={skill.id}
                                          className="inline-flex items-center rounded-full border border-rule bg-background px-2.5 py-1 text-[12.5px] text-ink"
                                        >
                                          {skill.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ),
                              );
                            })()}
                          </EditorialPanelBody>
                        </div>
                      </EditorialPanel>
                    ) : null}

                    {/* Projects */}
                    {liveProfile.projects.length > 0 ? (
                      <EditorialPanel as="article" className="scroll-mt-24">
                        <div
                          id="projects-section"
                          data-section="projects-section"
                        >
                          <EditorialPanelHeader
                            title={t("signals.projects")}
                            eyebrow={pluralize(
                              liveProfile.projects.length,
                              "project",
                              "projects",
                            )}
                            action={
                              <SourcePill variant="ai">AI extracted</SourcePill>
                            }
                          />
                          <div>
                            {liveProfile.projects.map((project, index) => (
                              <div
                                key={project.id}
                                className={cn(
                                  "px-[18px] py-4",
                                  index < liveProfile.projects.length - 1 &&
                                    "border-b border-rule",
                                )}
                              >
                                <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink">
                                  {project.name}
                                </h3>
                                {project.description ? (
                                  <p className="mt-1 text-[13px] text-ink-2">
                                    {project.description}
                                  </p>
                                ) : null}
                                {project.highlights.length > 0 ? (
                                  <ul className="mt-2 list-none space-y-1">
                                    {project.highlights.map(
                                      (highlight, idx) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-2"
                                        >
                                          <span
                                            aria-hidden
                                            className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-ink-3"
                                          />
                                          <span>{highlight}</span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      </EditorialPanel>
                    ) : null}

                    {/* Re-render the legacy career details card for back-compat
                        with anything that scrolls to #career-details; only
                        shown when at least one experience or project exists. */}
                    {careerDetailProfile ? (
                      <div
                        id="career-details"
                        data-section="career-details"
                        aria-hidden="true"
                      />
                    ) : null}
                  </>
                ) : null}

                {activeTab === "preferences" ? (
                  <>
                    <EditorialPanel as="article">
                      <EditorialPanelHeader title={t("workStyle.title")} />
                      <EditorialPanelBody>
                        <p className="mb-3 text-[13px] text-ink-3">
                          {t("workStyle.description")}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {workStyleOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-3 rounded-md border border-rule bg-background p-3 text-[13px] text-ink"
                            >
                              <input
                                type="checkbox"
                                checked={form.workStyle.includes(option.value)}
                                onChange={() => toggleWorkStyle(option.value)}
                                className="h-4 w-4 rounded border-input"
                              />
                              {t(option.labelKey)}
                            </label>
                          ))}
                        </div>
                      </EditorialPanelBody>
                    </EditorialPanel>

                    <EditorialPanel as="article">
                      <EditorialPanelHeader
                        title={t("targetRoles.title")}
                        icon={Sparkles}
                      />
                      <EditorialPanelBody>
                        <p className="mb-3 text-[13px] text-ink-3">
                          {t("targetRoles.description")}
                        </p>
                        <Field id="targetRoles" label={t("fields.targetRoles")}>
                          <Textarea
                            id="targetRoles"
                            value={targetRolesText}
                            rows={4}
                            onChange={(event) => {
                              setTargetRolesText(event.target.value);
                              updateField(
                                "targetRoles",
                                splitProfileList(event.target.value),
                              );
                            }}
                          />
                        </Field>
                      </EditorialPanelBody>
                    </EditorialPanel>

                    <EditorialPanel as="article">
                      <EditorialPanelHeader title={t("salary.title")} />
                      <EditorialPanelBody>
                        <p className="mb-3 text-[13px] text-ink-3">
                          {t("salary.description")}
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <Field
                            id="targetSalaryCurrency"
                            label={t("fields.currency")}
                          >
                            <Input
                              id="targetSalaryCurrency"
                              value={form.targetSalaryCurrency}
                              onChange={(event) =>
                                updateField(
                                  "targetSalaryCurrency",
                                  event.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field
                            id="targetSalaryMin"
                            label={t("fields.minimum")}
                          >
                            <Input
                              id="targetSalaryMin"
                              inputMode="numeric"
                              value={form.targetSalaryMin}
                              onChange={(event) =>
                                updateField(
                                  "targetSalaryMin",
                                  event.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field
                            id="targetSalaryMax"
                            label={t("fields.maximum")}
                          >
                            <Input
                              id="targetSalaryMax"
                              inputMode="numeric"
                              value={form.targetSalaryMax}
                              onChange={(event) =>
                                updateField(
                                  "targetSalaryMax",
                                  event.target.value,
                                )
                              }
                            />
                          </Field>
                        </div>
                      </EditorialPanelBody>
                    </EditorialPanel>
                  </>
                ) : null}

                {activeTab === "privacy" ? (
                  <EditorialPanel as="article">
                    <EditorialPanelHeader title={t("privacy.title")} />
                    <EditorialPanelBody>
                      <p className="mb-3 text-[13px] text-ink-3">
                        {t("privacy.description")}
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 rounded-md border border-rule bg-background p-4">
                          <input
                            type="checkbox"
                            checked={form.openToRecruiters}
                            onChange={(event) =>
                              updateField(
                                "openToRecruiters",
                                event.target.checked,
                              )
                            }
                            className="mt-1 h-4 w-4 rounded border-input"
                          />
                          <span>
                            <span className="block text-[13.5px] font-medium text-ink">
                              {t("privacy.openToRecruiters.title")}
                            </span>
                            <span className="mt-1 block text-[13px] text-ink-3">
                              {t("privacy.openToRecruiters.description")}
                            </span>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 rounded-md border border-rule bg-background p-4">
                          <input
                            type="checkbox"
                            checked={form.shareContactInfo}
                            onChange={(event) =>
                              updateField(
                                "shareContactInfo",
                                event.target.checked,
                              )
                            }
                            className="mt-1 h-4 w-4 rounded border-input"
                          />
                          <span>
                            <span className="block text-[13.5px] font-medium text-ink">
                              {t("privacy.shareContactInfo.title")}
                            </span>
                            <span className="mt-1 block text-[13px] text-ink-3">
                              {t("privacy.shareContactInfo.description")}
                            </span>
                          </span>
                        </label>
                      </div>
                    </EditorialPanelBody>
                  </EditorialPanel>
                ) : null}
              </section>
            </div>
          </>
        )}
      </PageContent>
    </AppPage>
  );
}
