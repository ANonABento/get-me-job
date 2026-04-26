export const STUDIO_DOCUMENT_MODES = ["resume", "cover-letter", "tailored"] as const;

export type StudioDocumentMode = (typeof STUDIO_DOCUMENT_MODES)[number];

export const STUDIO_ROUTE = "/studio";
export const STUDIO_MODE_SEARCH_PARAM = "mode";
export const DEFAULT_STUDIO_DOCUMENT_MODE: StudioDocumentMode = "resume";

const STUDIO_DOCUMENT_TITLES: Record<StudioDocumentMode, string> = {
  resume: "Resume",
  "cover-letter": "Cover Letter",
  tailored: "Tailored Resume",
};

export function isStudioDocumentMode(value: string): value is StudioDocumentMode {
  return STUDIO_DOCUMENT_MODES.includes(value as StudioDocumentMode);
}

export function getStudioModeFromSearchParam(
  value: string | null
): StudioDocumentMode {
  return value && isStudioDocumentMode(value)
    ? value
    : DEFAULT_STUDIO_DOCUMENT_MODE;
}

export function getStudioModeHref(mode: StudioDocumentMode): string {
  return mode === DEFAULT_STUDIO_DOCUMENT_MODE
    ? STUDIO_ROUTE
    : `${STUDIO_ROUTE}?${STUDIO_MODE_SEARCH_PARAM}=${mode}`;
}

export function shouldShowJobDescription(mode: StudioDocumentMode): boolean {
  return mode === "cover-letter" || mode === "tailored";
}

export function getStudioDocumentTitle(mode: StudioDocumentMode): string {
  return STUDIO_DOCUMENT_TITLES[mode];
}

export function getDefaultStudioContent(mode: StudioDocumentMode): string {
  if (mode === "cover-letter") {
    return `
      <p>Dear Hiring Manager,</p>
      <p>I am excited to apply for this role and bring a record of relevant execution, collaboration, and measurable impact.</p>
      <p>Sincerely,</p>
    `;
  }

  if (mode === "tailored") {
    return `
      <h1>Your Name</h1>
      <p>Targeted summary aligned to the job description.</p>
      <h2>Relevant Experience</h2>
      <ul>
        <li>Prioritized accomplishment mapped to the role requirements.</li>
      </ul>
      <h2>Skills</h2>
      <p>Keywords and strengths tailored for this application.</p>
    `;
  }

  return `
    <h1>Your Name</h1>
    <p>Professional summary focused on your strongest qualifications.</p>
    <h2>Experience</h2>
    <ul>
      <li>Selected achievement from your knowledge bank.</li>
    </ul>
    <h2>Education</h2>
    <p>Degree, institution, and relevant details.</p>
  `;
}
