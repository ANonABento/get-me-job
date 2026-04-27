export const BUILDER_DOCUMENT_MODES = [
  "resume",
  "tailored-resume",
  "cover-letter",
] as const;

export type BuilderDocumentMode = (typeof BUILDER_DOCUMENT_MODES)[number];

export function isBuilderDocumentMode(
  value: string | null | undefined
): value is BuilderDocumentMode {
  return BUILDER_DOCUMENT_MODES.includes(value as BuilderDocumentMode);
}

export function getBuilderModeFromSearchParam(
  value: string | null | undefined
): BuilderDocumentMode {
  return isBuilderDocumentMode(value) ? value : "resume";
}

export function getBuilderModeHref(mode: BuilderDocumentMode): string {
  if (mode === "tailored-resume") return "/builder?mode=tailored-resume";
  if (mode === "cover-letter") return "/builder?mode=cover-letter";
  return "/builder";
}
