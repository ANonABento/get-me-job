export type ProfileEditorSection =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills";

export const DEFAULT_EXPANDED_PROFILE_SECTIONS = new Set<ProfileEditorSection>([
  "contact",
  "summary",
  "experience",
  "education",
  "skills",
]);
