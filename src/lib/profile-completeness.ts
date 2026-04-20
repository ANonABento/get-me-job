import type { Profile } from "@/types";

export interface ProfileSection {
  key: string;
  label: string;
  complete: boolean;
  weight: number;
  href: string;
}

export interface ProfileCompletenessResult {
  percentage: number;
  sections: ProfileSection[];
  nextAction: ProfileSection | null;
}

const SECTION_WEIGHTS = {
  contact: 20,
  summary: 15,
  experience: 25,
  education: 15,
  skills: 25,
} as const;

export function calculateProfileCompleteness(
  profile: Profile | null
): ProfileCompletenessResult {
  const sections: ProfileSection[] = [
    {
      key: "contact",
      label: "Contact Info",
      complete: Boolean(profile?.contact?.name && profile?.contact?.email),
      weight: SECTION_WEIGHTS.contact,
      href: "/profile#contact",
    },
    {
      key: "summary",
      label: "Professional Summary",
      complete: Boolean(profile?.summary && profile.summary.length > 20),
      weight: SECTION_WEIGHTS.summary,
      href: "/profile#summary",
    },
    {
      key: "experience",
      label: "Work Experience",
      complete: (profile?.experiences?.length ?? 0) > 0,
      weight: SECTION_WEIGHTS.experience,
      href: "/profile#experience",
    },
    {
      key: "education",
      label: "Education",
      complete: (profile?.education?.length ?? 0) > 0,
      weight: SECTION_WEIGHTS.education,
      href: "/profile#education",
    },
    {
      key: "skills",
      label: "Skills",
      complete: (profile?.skills?.length ?? 0) >= 3,
      weight: SECTION_WEIGHTS.skills,
      href: "/profile#skills",
    },
  ];

  const totalWeight = Object.values(SECTION_WEIGHTS).reduce((a, b) => a + b, 0);
  const earnedWeight = sections
    .filter((s) => s.complete)
    .reduce((sum, s) => sum + s.weight, 0);

  const percentage = Math.round((earnedWeight / totalWeight) * 100);
  const nextAction = sections.find((s) => !s.complete) ?? null;

  return { percentage, sections, nextAction };
}
