import type { ContactInfo, Experience, Profile } from "@/types";

export interface ProfileFormValues {
  avatarUrl: string;
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  workStyle: string[];
  targetRoles: string[];
  targetSalaryMin: string;
  targetSalaryMax: string;
  targetSalaryCurrency: string;
  openToRecruiters: boolean;
  shareContactInfo: boolean;
}

const DEFAULT_CURRENCY = "USD";

function cleanList(values: string[] | undefined): string[] {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function mostRecentExperience(profile: Profile | null): Experience | undefined {
  return [...(profile?.experiences ?? [])].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (b.current && !a.current) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  })[0];
}

export function splitProfileList(value: string): string[] {
  return cleanList(value.split(/[\n,]/));
}

export function joinProfileList(values: string[] | undefined): string {
  return cleanList(values).join(", ");
}

export function getProfileInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "P";
}

export function buildResumeDefaults(profile: Profile | null): Pick<
  ProfileFormValues,
  "headline" | "targetRoles"
> {
  const currentExperience = mostRecentExperience(profile);
  const headline = currentExperience
    ? `${currentExperience.title}${currentExperience.company ? ` at ${currentExperience.company}` : ""}`
    : "";

  const experienceTitles = (profile?.experiences ?? []).map((experience) => experience.title);
  const skillRoles = (profile?.skills ?? [])
    .filter((skill) => skill.category === "technical" || skill.category === "tool")
    .slice(0, 3)
    .map((skill) => `${skill.name} role`);

  return {
    headline,
    targetRoles: cleanList([...experienceTitles, ...skillRoles]).slice(0, 6),
  };
}

export function profileToFormValues(profile: Profile | null): ProfileFormValues {
  const contact = profile?.contact ?? ({ name: "" } satisfies ContactInfo);
  const resumeDefaults = buildResumeDefaults(profile);
  const targetRoles = cleanList(contact.targetRoles);

  return {
    avatarUrl: contact.avatarUrl ?? "",
    name: contact.name ?? "",
    headline: contact.headline || resumeDefaults.headline,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    location: contact.location ?? "",
    linkedin: contact.linkedin ?? "",
    github: contact.github ?? "",
    website: contact.website ?? "",
    summary: profile?.summary ?? "",
    workStyle: cleanList(contact.workStyle),
    targetRoles: targetRoles.length > 0 ? targetRoles : resumeDefaults.targetRoles,
    targetSalaryMin: contact.targetSalaryMin ?? "",
    targetSalaryMax: contact.targetSalaryMax ?? "",
    targetSalaryCurrency: contact.targetSalaryCurrency ?? DEFAULT_CURRENCY,
    openToRecruiters: contact.openToRecruiters ?? false,
    shareContactInfo: contact.shareContactInfo ?? false,
  };
}

export function formValuesToProfileUpdate(
  values: ProfileFormValues,
  currentProfile: Profile | null,
): Partial<Profile> {
  return {
    contact: {
      ...(currentProfile?.contact ?? { name: "" }),
      avatarUrl: values.avatarUrl.trim(),
      name: values.name.trim(),
      headline: values.headline.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      linkedin: values.linkedin.trim(),
      github: values.github.trim(),
      website: values.website.trim(),
      workStyle: cleanList(values.workStyle),
      targetRoles: cleanList(values.targetRoles),
      targetSalaryMin: values.targetSalaryMin.trim(),
      targetSalaryMax: values.targetSalaryMax.trim(),
      targetSalaryCurrency: values.targetSalaryCurrency.trim() || DEFAULT_CURRENCY,
      openToRecruiters: values.openToRecruiters,
      shareContactInfo: values.shareContactInfo,
    },
    summary: values.summary.trim(),
  };
}
