export const STUDIO_DOCUMENT_MODES = [
  "resume",
  "tailored",
  "cover-letter",
] as const;

export type StudioDocumentMode = (typeof STUDIO_DOCUMENT_MODES)[number];

export function isStudioDocumentMode(
  value: string | null | undefined
): value is StudioDocumentMode {
  return STUDIO_DOCUMENT_MODES.includes(value as StudioDocumentMode);
}

export function getStudioModeFromSearchParam(
  value: string | null | undefined
): StudioDocumentMode {
  return isStudioDocumentMode(value) ? value : "resume";
}

export function getStudioModeHref(mode: StudioDocumentMode): string {
  if (mode === "cover-letter") return "/studio?mode=cover-letter";
  if (mode === "tailored") return "/studio?mode=tailored";
  return "/studio";
}
