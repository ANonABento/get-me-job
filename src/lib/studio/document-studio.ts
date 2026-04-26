export const STUDIO_DOCUMENT_MODES = ["resume", "cover-letter", "tailored"] as const;

export type StudioDocumentMode = (typeof STUDIO_DOCUMENT_MODES)[number];

export function isStudioDocumentMode(value: string): value is StudioDocumentMode {
  return STUDIO_DOCUMENT_MODES.includes(value as StudioDocumentMode);
}

export function shouldShowJobDescription(mode: StudioDocumentMode): boolean {
  return mode === "cover-letter" || mode === "tailored";
}

export function getStudioDocumentTitle(mode: StudioDocumentMode): string {
  switch (mode) {
    case "cover-letter":
      return "Cover Letter";
    case "tailored":
      return "Tailored Resume";
    case "resume":
      return "Resume";
  }
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
