export interface HackathonTemplate {
  id: string;
  label: string;
  description: string;
  defaults: Record<string, unknown>;
}

export const HACKATHON_TEMPLATES: HackathonTemplate[] = [
  {
    id: "devpost-online",
    label: "DevPost Online",
    description: "Remote DevPost event with project submission and opt-in prizes.",
    defaults: {
      organizer: "Devpost",
      location: "Online",
      teamSizeMin: "1",
      teamSizeMax: "4",
      prizes: ["Grand Prize", "Best Use of Sponsor API", "Community Choice"],
      tracks: ["AI/ML", "Developer Tools", "Social Impact"],
      themes: ["Build in public", "Working demo", "Clear project story"],
    },
  },
  {
    id: "campus-weekend",
    label: "Campus Weekend",
    description: "In-person weekend hackathon with larger teams and expo judging.",
    defaults: {
      location: "Campus",
      teamSizeMin: "1",
      teamSizeMax: "5",
      prizes: ["Overall Winner", "Best First-Time Hack", "Best Design"],
      tracks: ["Hardware", "Web", "Mobile"],
      themes: ["Student life", "Sustainability", "Accessibility"],
    },
  },
  {
    id: "sponsor-challenge",
    label: "Sponsor Challenge",
    description: "Prize-driven challenge centered on a sponsor API or platform.",
    defaults: {
      teamSizeMin: "1",
      teamSizeMax: "3",
      prizes: ["Sponsor API Prize", "Most Creative Use Case", "Best Technical Implementation"],
      tracks: ["API Integration", "Automation", "Data"],
      themes: ["Sponsor platform", "Measurable impact", "Production potential"],
    },
  },
];

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => String(item).trim());
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

export function getHackathonTemplate(
  templateId: string
): HackathonTemplate | undefined {
  return HACKATHON_TEMPLATES.find((template) => template.id === templateId);
}

export function applyHackathonTemplate(
  content: Record<string, unknown>,
  templateId: string
): Record<string, unknown> {
  const template = getHackathonTemplate(templateId);
  if (!template) return content;

  const merged = { ...template.defaults };
  for (const [key, value] of Object.entries(content)) {
    if (hasMeaningfulValue(value)) merged[key] = value;
  }
  return merged;
}
