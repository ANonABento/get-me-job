import type { Profile } from "@/types";

export function getProfileCompleteness(profile: Profile | null): number {
  if (!profile) {
    return 0;
  }

  let score = 0;

  if (profile.contact?.name) {
    score += 15;
  }
  if (profile.contact?.email) {
    score += 15;
  }
  if (profile.summary && profile.summary.length > 50) {
    score += 20;
  }
  if (profile.experiences.length > 0) {
    score += 25;
  }
  if (profile.education.length > 0) {
    score += 10;
  }
  if (profile.skills.length >= 3) {
    score += 15;
  }

  return Math.min(score, 100);
}
