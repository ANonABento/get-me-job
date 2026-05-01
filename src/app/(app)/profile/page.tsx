"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { Profile } from "@/types";

type ProfileTab = "overview" | "preferences" | "privacy";

const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "preferences", label: "Preferences", icon: BriefcaseBusiness },
  { id: "privacy", label: "Privacy", icon: Shield },
];

const workStyleOptions = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
  { value: "full-time", label: "Full-time" },
  { value: "contract", label: "Contract" },
];

function formatSalaryRange(form: ProfileFormValues): string {
  const min = form.targetSalaryMin.trim();
  const max = form.targetSalaryMax.trim();

  if (!min && !max) return "No target salary";
  if (min && max) return `${form.targetSalaryCurrency} ${min}-${max}`;
  if (min) return `${form.targetSalaryCurrency} ${min}+`;
  return `Up to ${form.targetSalaryCurrency} ${max}`;
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
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileFormValues>(() =>
    profileToFormValues(null),
  );
  const [savedForm, setSavedForm] = useState<ProfileFormValues>(() =>
    profileToFormValues(null),
  );
  const [targetRolesText, setTargetRolesText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Could not load profile");
      const data = (await response.json()) as { profile: Profile | null };
      const nextForm = profileToFormValues(data.profile);
      setProfile(data.profile);
      setForm(nextForm);
      setSavedForm(nextForm);
      setTargetRolesText(joinProfileList(nextForm.targetRoles));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

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
    setSaving(true);
    setError(null);
    setStatus(null);

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

      if (!response.ok) throw new Error(data.error ?? "Could not save profile");

      const nextProfile = data.profile ?? profile;
      const nextForm = profileToFormValues(nextProfile);
      setProfile(nextProfile);
      setForm(nextForm);
      setSavedForm(nextForm);
      setTargetRolesText(joinProfileList(nextForm.targetRoles));
      setStatus("Changes saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = getProfileInitials(form.name);
  const salaryRange = formatSalaryRange(form);

  if (loading) {
    return (
      <AppPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        width="wide"
        icon={User}
        eyebrow="Candidate profile"
        title="Profile"
        description="Maintain the profile details used for resumes, autofill, matching, and job search preferences."
        actions={
          <>
            {status ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                <Check className="h-4 w-4" />
                {status}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || saving}
              onClick={discardChanges}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Discard
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
              Save changes
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

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.avatarUrl}
                      alt=""
                      className="h-24 w-24 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-primary text-3xl font-semibold text-primary-foreground">
                      {initials}
                    </div>
                  )}
                  <h2 className="mt-4 text-xl font-semibold">
                    {form.name || "Your name"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.headline || "Add a headline"}
                  </p>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{form.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {form.location || "No location"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="truncate">{salaryRange}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div
              role="tablist"
              aria-label="Profile sections"
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
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            {activeTab === "overview" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Identity</CardTitle>
                    <CardDescription>
                      Core details used across resumes and application forms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="avatarUrl" label="Avatar URL">
                      <Input
                        id="avatarUrl"
                        value={form.avatarUrl}
                        placeholder="https://..."
                        onChange={(event) =>
                          updateField("avatarUrl", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="name" label="Full name">
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field id="headline" label="Headline">
                        <Input
                          id="headline"
                          value={form.headline}
                          placeholder="Senior product engineer"
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
                    <CardTitle className="text-xl">Contact</CardTitle>
                    <CardDescription>
                      Public contact and social links for autofill.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="email" label="Email address">
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="phone" label="Phone number">
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="location" label="Location">
                      <Input
                        id="location"
                        value={form.location}
                        onChange={(event) =>
                          updateField("location", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="linkedin" label="LinkedIn">
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
                    <Field id="github" label="GitHub">
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
                    <Field id="website" label="Website">
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
                    <CardTitle className="text-xl">Summary</CardTitle>
                    <CardDescription>
                      A reusable professional summary for resumes and outreach.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="summaryText"
                      value={form.summary}
                      rows={8}
                      onChange={(event) =>
                        updateField("summary", event.target.value)
                      }
                    />
                  </CardContent>
                </Card>
              </>
            ) : null}

            {activeTab === "preferences" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Work Style</CardTitle>
                    <CardDescription>
                      Preferences used when matching roles and filtering jobs.
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
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Target Roles
                    </CardTitle>
                    <CardDescription>
                      Auto-populated from resume roles when no saved targets exist.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Target Salary Range</CardTitle>
                    <CardDescription>
                      Keep compensation expectations ready for applications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <Field id="targetSalaryCurrency" label="Currency">
                      <Input
                        id="targetSalaryCurrency"
                        value={form.targetSalaryCurrency}
                        onChange={(event) =>
                          updateField("targetSalaryCurrency", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="targetSalaryMin" label="Minimum">
                      <Input
                        id="targetSalaryMin"
                        inputMode="numeric"
                        value={form.targetSalaryMin}
                        onChange={(event) =>
                          updateField("targetSalaryMin", event.target.value)
                        }
                      />
                    </Field>
                    <Field id="targetSalaryMax" label="Maximum">
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
                  <CardTitle className="text-xl">Privacy</CardTitle>
                  <CardDescription>
                    Control how profile details are reused by connected workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-start gap-3 rounded-md border p-4">
                    <input
                      type="checkbox"
                      checked={form.openToRecruiters}
                      onChange={(event) =>
                        updateField("openToRecruiters", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-input"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        Open to recruiter outreach
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Allows this profile to be used for recruiter-facing exports.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-md border p-4">
                    <input
                      type="checkbox"
                      checked={form.shareContactInfo}
                      onChange={(event) =>
                        updateField("shareContactInfo", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-input"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        Include contact info in generated documents
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Adds email, phone, and links when exporting profile-backed documents.
                      </span>
                    </span>
                  </label>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </PageContent>
    </AppPage>
  );
}
