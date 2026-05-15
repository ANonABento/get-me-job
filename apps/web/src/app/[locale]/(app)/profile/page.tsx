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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { Textarea } from "@/components/ui/textarea";
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
            <Link href="/answers">{t("answerBankPrompt.action")}</Link>
          </Button>
        </div>

        {showEmptyState ? (
          <ProfileEmptyState onFillManually={() => setShowEmptyState(false)} />
        ) : (
          <>
            <div className="mb-6">
              <CompletenessCard
                result={completeness}
                onSelectGap={focusGap}
                celebrating={celebratingCompleteness}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
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
                          className="h-24 w-24 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-primary text-3xl font-semibold text-primary-foreground">
                          {initials}
                        </div>
                      )}
                      <h2 className="mt-4 text-xl font-semibold">
                        {form.name || t("sidebar.yourName")}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {form.headline || t("sidebar.addHeadline")}
                      </p>
                    </div>
                    <div className="mt-6 space-y-3 text-sm">
                      <button
                        type="button"
                        onClick={() => focusField("overview", "email")}
                        className="flex w-full min-w-0 items-center gap-2 rounded text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {form.email || t("sidebar.noEmail")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => focusField("overview", "location")}
                        className="flex w-full min-w-0 items-center gap-2 rounded text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {form.location || t("sidebar.noLocation")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          focusField("preferences", "targetSalaryMin")
                        }
                        className="flex w-full min-w-0 items-center gap-2 rounded text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <span className="truncate">{salaryRange}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <LifetimeStatsCard streak={streak} />

                <div
                  role="tablist"
                  aria-label={t("tabs.ariaLabel")}
                  className="grid gap-2 rounded-md border bg-card p-2"
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
                          "flex items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium transition-colors",
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                        )}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {t(tab.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="space-y-6">
                {activeTab === "overview" ? (
                  <>
                    <Card id="identity" data-section="identity" tabIndex={-1}>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("sections.identity.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("sections.identity.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field id="avatarUrl" label={t("fields.avatarUrl")}>
                          <Input
                            id="avatarUrl"
                            value={form.avatarUrl}
                            placeholder="https://..."
                            onChange={(event) =>
                              updateField("avatarUrl", event.target.value)
                            }
                          />
                        </Field>
                        <Field id="name" label={t("fields.fullName")}>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(event) =>
                              updateField("name", event.target.value)
                            }
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <Field id="headline" label={t("fields.headline")}>
                            <Input
                              id="headline"
                              value={form.headline}
                              placeholder={t("placeholders.headline")}
                              onChange={(event) =>
                                updateField("headline", event.target.value)
                              }
                            />
                          </Field>
                        </div>
                      </CardContent>
                    </Card>

                    <Card id="contact" data-section="contact">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("sections.contact.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("sections.contact.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field id="email" label={t("fields.email")}>
                          <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                              updateField("email", event.target.value)
                            }
                          />
                        </Field>
                        <Field id="phone" label={t("fields.phone")}>
                          <Input
                            id="phone"
                            value={form.phone}
                            onChange={(event) =>
                              updateField("phone", event.target.value)
                            }
                          />
                        </Field>
                        <Field id="location" label={t("fields.location")}>
                          <Input
                            id="location"
                            value={form.location}
                            onChange={(event) =>
                              updateField("location", event.target.value)
                            }
                          />
                        </Field>
                        <Field id="linkedin" label={t("fields.linkedin")}>
                          <div className="relative">
                            <Linkedin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                        </Field>
                        <Field id="github" label={t("fields.github")}>
                          <div className="relative">
                            <Github className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                        </Field>
                        <Field id="website" label={t("fields.website")}>
                          <div className="relative">
                            <Globe className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                        </Field>
                      </CardContent>
                    </Card>

                    <Card id="summary" data-section="summary">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("sections.summary.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("sections.summary.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Field id="summaryText" label={t("fields.summary")}>
                          <Textarea
                            id="summaryText"
                            value={form.summary}
                            rows={8}
                            onChange={(event) =>
                              updateField("summary", event.target.value)
                            }
                          />
                        </Field>
                      </CardContent>
                    </Card>

                    <Card id="profile-signals" data-section="profile-signals">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("sections.savedSignals.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("sections.savedSignals.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                            className="rounded-md border p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <div className="text-2xl font-semibold">
                              {item.count}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {careerDetailProfile ? (
                      <Card id="career-details" data-section="career-details">
                        <CardHeader>
                          <CardTitle className="text-xl">
                            {t("sections.careerDetails.title")}
                          </CardTitle>
                          <CardDescription>
                            {t("sections.careerDetails.description")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          {careerDetailProfile.experiences.map((experience) => (
                            <div
                              key={experience.id}
                              className="rounded-md border p-4"
                            >
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                                <h3 className="font-medium">
                                  {experience.title}
                                </h3>
                                <span className="text-sm text-muted-foreground">
                                  {experience.company}
                                </span>
                              </div>
                              {experience.highlights.length > 0 ? (
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                  {experience.highlights.map((highlight) => (
                                    <li key={highlight}>{highlight}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}

                          {careerDetailProfile.projects.map((project) => (
                            <div
                              key={project.id}
                              className="rounded-md border p-4"
                            >
                              <h3 className="font-medium">{project.name}</h3>
                              {project.description ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {project.description}
                                </p>
                              ) : null}
                              {project.highlights.length > 0 ? (
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                  {project.highlights.map((highlight) => (
                                    <li key={highlight}>{highlight}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : null}
                  </>
                ) : null}

                {activeTab === "preferences" ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("workStyle.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("workStyle.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {workStyleOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm"
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Sparkles className="h-5 w-5 text-primary" />
                          {t("targetRoles.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("targetRoles.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("salary.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("salary.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-3">
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
                        <Field id="targetSalaryMin" label={t("fields.minimum")}>
                          <Input
                            id="targetSalaryMin"
                            inputMode="numeric"
                            value={form.targetSalaryMin}
                            onChange={(event) =>
                              updateField("targetSalaryMin", event.target.value)
                            }
                          />
                        </Field>
                        <Field id="targetSalaryMax" label={t("fields.maximum")}>
                          <Input
                            id="targetSalaryMax"
                            inputMode="numeric"
                            value={form.targetSalaryMax}
                            onChange={(event) =>
                              updateField("targetSalaryMax", event.target.value)
                            }
                          />
                        </Field>
                      </CardContent>
                    </Card>
                  </>
                ) : null}

                {activeTab === "privacy" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {t("privacy.title")}
                      </CardTitle>
                      <CardDescription>
                        {t("privacy.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <label className="flex items-start gap-3 rounded-md border p-4">
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
                          <span className="block text-sm font-medium">
                            {t("privacy.openToRecruiters.title")}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {t("privacy.openToRecruiters.description")}
                          </span>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 rounded-md border p-4">
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
                          <span className="block text-sm font-medium">
                            {t("privacy.shareContactInfo.title")}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {t("privacy.shareContactInfo.description")}
                          </span>
                        </span>
                      </label>
                    </CardContent>
                  </Card>
                ) : null}
              </section>
            </div>
          </>
        )}
      </PageContent>
    </AppPage>
  );
}
