export const personaSlugs = [
  "career-switcher",
  "new-grad",
  "laid-off-senior",
  "returning-parent",
  "visa-sponsorship",
  "remote-only",
  "executive",
  "contractor",
  "nonprofit-to-tech",
  "disabled-candidate",
] as const;

export type PersonaSlug = (typeof personaSlugs)[number];

export interface PersonaFixtureRequirement {
  label: string;
  relativePath: string;
}

export interface JourneyStepDefinition {
  label: string;
  expected: string;
  screenshotName: string;
}

const MAX_BANK_ASSERTIONS = 25;
const STABLE_KEY_BLOCKLIST = /^(id|uuid|createdAt|updatedAt|sourceDocumentId)$/i;
const MIN_ASSERTION_LENGTH = 3;

export interface PersonaTargetOpportunity {
  title: string;
  company: string;
  summary: string;
  url?: string;
  location?: string;
  skills: string[];
}

export const personaFixtureRequirements = {
  resumePdf: {
    label: "resume PDF",
    relativePath: "tests/fixtures/personas/{slug}/resume.pdf",
  },
  expectedBankEntries: {
    label: "expected bank entries",
    relativePath: "tests/fixtures/personas/{slug}/expected.json",
  },
  targetOpportunity: {
    label: "target opportunity",
    relativePath: "tests/fixtures/personas/{slug}/target-jobs/job-1.json",
  },
} as const satisfies Record<string, PersonaFixtureRequirement>;

export const requiredPersonaFixtures = Object.values(
  personaFixtureRequirements,
);

export const personaJourneySteps = {
  signUp: {
    label: "Sign up",
    expected: "A unique persona email can reach the authenticated app shell.",
    screenshotName: "01-sign-up.png",
  },
  onboarding: {
    label: "Onboarding",
    expected:
      "The persona can complete or skip onboarding with reasonable defaults.",
    screenshotName: "02-onboarding.png",
  },
  uploadResume: {
    label: "Upload resume",
    expected: "The persona resume PDF uploads and creates parsed profile data.",
    screenshotName: "03-upload-resume.png",
  },
  verifyBank: {
    label: "Verify bank",
    expected:
      "The rendered bank entries match the persona expected.json fixture.",
    screenshotName: "04-verify-bank.png",
  },
  addOpportunity: {
    label: "Add target opportunity",
    expected:
      "The target job URL or manual data creates a tracked opportunity.",
    screenshotName: "05-add-opportunity.png",
  },
  tailorResume: {
    label: "Tailor resume",
    expected: "Studio generates a tailored resume for the new opportunity.",
    screenshotName: "06-tailor-resume.png",
  },
  coverLetter: {
    label: "Generate cover letter",
    expected:
      "The cover-letter flow generates persona- and job-specific content.",
    screenshotName: "07-cover-letter.png",
  },
  atsScan: {
    label: "Run ATS scan",
    expected:
      "The ATS scanner accepts the resume and job description and returns a score.",
    screenshotName: "08-ats-scan.png",
  },
  analytics: {
    label: "Check analytics",
    expected: "Analytics includes the new application in the funnel.",
    screenshotName: "09-analytics.png",
  },
} as const satisfies Record<string, JourneyStepDefinition>;

export function fixturePathFor(
  requirement: PersonaFixtureRequirement,
  slug: PersonaSlug,
): string {
  return requirement.relativePath.replace("{slug}", slug);
}

export function missingFixtureLabels(
  slug: PersonaSlug,
  existingRelativePaths: ReadonlySet<string>,
): string[] {
  return requiredPersonaFixtures
    .filter(
      (requirement) =>
        !existingRelativePaths.has(fixturePathFor(requirement, slug)),
    )
    .map(
      (requirement) =>
        `${requirement.label} (${fixturePathFor(requirement, slug)})`,
    );
}

export function formatSkipReason(
  slug: PersonaSlug,
  missing: readonly string[],
): string {
  if (missing.length === 0) {
    return "";
  }

  return `Persona journey '${slug}' requires fixtures from Test 1.1: ${missing.join(", ")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstStringValue(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function stringArrayValue(
  source: Record<string, unknown>,
  keys: readonly string[],
): string[] {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function parseTargetOpportunity(
  fixture: unknown,
): PersonaTargetOpportunity {
  const source = isRecord(fixture) ? fixture : {};
  const nestedJob = isRecord(source.job)
    ? source.job
    : isRecord(source.opportunity)
      ? source.opportunity
      : source;

  const title = firstStringValue(nestedJob, [
    "title",
    "role",
    "jobTitle",
    "position",
  ]);
  const company = firstStringValue(nestedJob, [
    "company",
    "organization",
    "employer",
  ]);
  const summary =
    firstStringValue(nestedJob, [
      "summary",
      "description",
      "jobDescription",
      "about",
    ]) ?? title;

  if (!title || !company || !summary) {
    throw new Error(
      "target-jobs/job-1.json must include title, company, and summary or description fields",
    );
  }

  return {
    title,
    company,
    summary,
    url: firstStringValue(nestedJob, ["url", "sourceUrl", "jobUrl"]),
    location: firstStringValue(nestedJob, ["location", "city"]),
    skills: stringArrayValue(nestedJob, [
      "requiredSkills",
      "skills",
      "requirements",
    ]),
  };
}

export function collectExpectedBankAssertions(fixture: unknown): string[] {
  const assertions = new Set<string>();

  function visit(value: unknown, key?: string): void {
    if (typeof value === "string") {
      const normalized = value.trim().replace(/\s+/g, " ");
      if (
        normalized.length >= MIN_ASSERTION_LENGTH &&
        !STABLE_KEY_BLOCKLIST.test(key ?? "")
      ) {
        assertions.add(normalized);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, key));
      return;
    }

    if (isRecord(value)) {
      Object.entries(value).forEach(([childKey, childValue]) =>
        visit(childValue, childKey),
      );
    }
  }

  visit(fixture);
  return [...assertions].slice(0, MAX_BANK_ASSERTIONS);
}
