import { expect, test, type BrowserContext } from "@playwright/test";
import type { ExtensionProfile } from "../../src/shared/types";
import {
  closeExtensionContext,
  loadDemoPage,
  launchExtensionContext,
  seedExtensionStorage,
  sendMessageToTab,
} from "../helpers/extension-context";

let context: BrowserContext;
let extensionId: string;
let teardownContext:
  | Awaited<ReturnType<typeof launchExtensionContext>>
  | undefined;

const profile: ExtensionProfile = {
  id: "profile-e2e",
  contact: {
    name: "Riley Chen",
    email: "riley.chen@example.com",
    phone: "+1 555 010 1200",
    location: "Seattle, WA, United States",
    linkedin: "https://www.linkedin.com/in/rileychen",
    github: "https://github.com/rileychen",
    website: "https://rileychen.example.com",
  },
  summary: "Platform engineer focused on reliable product infrastructure.",
  experiences: [
    {
      id: "exp-1",
      company: "Northwind Labs",
      title: "Staff Software Engineer",
      location: "Seattle, WA",
      startDate: "2021-01",
      current: true,
      description: "Leads platform engineering for customer-facing systems.",
      highlights: ["Built deployment automation", "Mentored engineers"],
      skills: ["TypeScript", "React", "Node.js"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Washington",
      degree: "BS",
      field: "Computer Science",
      endDate: "2016",
      highlights: [],
    },
  ],
  skills: [
    {
      id: "skill-1",
      name: "TypeScript",
      category: "technical",
      proficiency: "expert",
    },
  ],
  projects: [],
  certifications: [],
  computed: {
    firstName: "Riley",
    lastName: "Chen",
    currentCompany: "Northwind Labs",
    currentTitle: "Staff Software Engineer",
    yearsExperience: 9,
    skillsList: "TypeScript, React, Node.js",
  },
};

test.beforeAll(async () => {
  teardownContext = await launchExtensionContext();
  context = teardownContext.context;
  extensionId = teardownContext.extensionId;
});

test.afterAll(async () => {
  await closeExtensionContext(teardownContext);
});

test.beforeEach(async () => {
  await seedExtensionStorage(context, extensionId, {
    authToken: "test-token",
    tokenExpiry: "2099-01-01T00:00:00.000Z",
    cachedProfile: profile,
    profileCachedAt: new Date().toISOString(),
    apiBaseUrl: "http://localhost:3000",
    settings: {
      autoFillEnabled: true,
      showConfidenceIndicators: true,
      minimumConfidence: 0.5,
      learnFromAnswers: true,
      notifyOnJobDetected: true,
    },
  });
});

test("fills supported demo form fields and leaves sensitive/custom fields empty", async () => {
  const page = await context.newPage();
  try {
    await loadDemoPage(page, "job-form.html");

    const fillResponse = await sendMessageToTab<{
      success: boolean;
      data?: { filled: number; skipped: number; errors: number };
      error?: string;
    }>(context, extensionId, "job-form.html", { type: "TRIGGER_FILL" });

    expect(fillResponse.success).toBe(true);
    expect(fillResponse.data?.errors).toBe(0);
    expect(fillResponse.data?.filled).toBeGreaterThanOrEqual(10);

    await expect(page.locator("#email")).toHaveValue(profile.contact.email!);

    await expect(page.locator("#firstName")).toHaveValue("Riley");
    await expect(page.locator("#lastName")).toHaveValue("Chen");
    await expect(page.locator("#phone")).toHaveValue(profile.contact.phone!);
    await expect(page.locator("#city")).toHaveValue("Seattle");
    await expect(page.locator("#state")).toHaveValue("WA");
    await expect(page.locator("#country")).toHaveValue("United States");
    await expect(page.locator("#linkedin")).toHaveValue(
      profile.contact.linkedin!,
    );
    await expect(page.locator("#github")).toHaveValue(profile.contact.github!);
    await expect(page.locator("#portfolio")).toHaveValue(
      profile.contact.website!,
    );
    await expect(page.locator("#experience")).toHaveValue("9");
    await expect(page.locator("#currentCompany")).toHaveValue("Northwind Labs");
    await expect(page.locator("#currentTitle")).toHaveValue(
      "Staff Software Engineer",
    );

    await expect(page.locator("#salary")).toHaveValue("");
    await expect(page.locator("#startDate")).toHaveValue("");
    await expect(page.locator("#visa")).toHaveValue("");
    await expect(page.locator("#whyCompany")).toHaveValue("");
    await expect(page.locator("#biggestChallenge")).toHaveValue("");

    await expect(page.locator("#firstName")).not.toHaveValue(
      profile.contact.email!,
    );
    await expect(page.locator("#currentCompany")).not.toHaveValue(
      profile.contact.linkedin!,
    );
  } finally {
    await page.close();
  }
});

test("autofill is idempotent when triggered twice", async () => {
  const page = await context.newPage();
  try {
    await loadDemoPage(page, "job-form.html");

    await sendMessageToTab(context, extensionId, "job-form.html", {
      type: "TRIGGER_FILL",
    });
    await page.waitForTimeout(200);
    await sendMessageToTab(context, extensionId, "job-form.html", {
      type: "TRIGGER_FILL",
    });

    await expect(page.locator("#email")).toHaveValue(profile.contact.email!);
    await expect(page.locator("#phone")).toHaveValue(profile.contact.phone!);
    await expect(page.locator("#firstName")).toHaveValue("Riley");
  } finally {
    await page.close();
  }
});

test("preserves user-entered values unless overwrite is requested", async () => {
  const page = await context.newPage();
  try {
    await loadDemoPage(page, "job-form.html");
    await page.locator("#firstName").fill("Manual");

    const firstFill = await sendMessageToTab<{
      success: boolean;
      data?: { filled: number; conflicts: number };
    }>(context, extensionId, "job-form.html", { type: "TRIGGER_FILL" });

    expect(firstFill.success).toBe(true);
    expect(firstFill.data?.conflicts).toBeGreaterThanOrEqual(1);
    await expect(page.locator("#firstName")).toHaveValue("Manual");

    const overwriteFill = await sendMessageToTab<{
      success: boolean;
      data?: { filled: number; conflicts: number };
    }>(context, extensionId, "job-form.html", {
      type: "TRIGGER_FILL",
      payload: { overwriteExisting: true },
    });

    expect(overwriteFill.success).toBe(true);
    await expect(page.locator("#firstName")).toHaveValue("Riley");
  } finally {
    await page.close();
  }
});

test("reports resume uploads without filling file inputs", async () => {
  const page = await context.newPage();
  try {
    await loadDemoPage(page, "job-form.html");

    const status = await sendMessageToTab<{
      page: {
        detectedUploadCount: number;
        documentUploads: Array<{ kind: string; label?: string }>;
      };
    }>(context, extensionId, "job-form.html", {
      type: "GET_SURFACE_CONTEXT",
    });

    expect(status.page.detectedUploadCount).toBe(1);
    expect(status.page.documentUploads[0]).toMatchObject({ kind: "resume" });
    await expect(page.locator("#resumeUpload")).toHaveValue("");
  } finally {
    await page.close();
  }
});
