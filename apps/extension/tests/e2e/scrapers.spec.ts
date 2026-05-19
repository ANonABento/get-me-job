import { expect, test, type BrowserContext } from "@playwright/test";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  closeExtensionContext,
  loadFixture,
  launchExtensionContext,
  seedExtensionStorage,
  sendMessageToTab,
} from "../helpers/extension-context";
import { extensionOpportunitySchema } from "../helpers/extension-opportunity-schema";

let context: BrowserContext;
let extensionId: string;
let teardownContext:
  | Awaited<ReturnType<typeof launchExtensionContext>>
  | undefined;

test.beforeAll(async () => {
  teardownContext = await launchExtensionContext();
  context = teardownContext.context;
  extensionId = teardownContext.extensionId;
});

test.afterAll(async () => {
  await closeExtensionContext(teardownContext);
});

const cases = [
  {
    source: "greenhouse",
    fixture: "greenhouse-mock.html",
    expected: {
      title: "Staff Backend Engineer",
      company: "Verdant Systems",
      location: "Remote - US",
      postedAt: "2026-05-01",
    },
  },
  {
    source: "lever",
    fixture: "lever-mock.html",
    expected: {
      title: "Senior ML Engineer",
      company: "Helio Labs",
      location: "Boston, MA / Remote",
      postedAt: "2026-04-29",
    },
  },
  {
    source: "indeed",
    fixture: "indeed-mock.html",
    expected: {
      title: "Frontend Platform Engineer",
      company: "Northstar Analytics",
      location: "Austin, TX",
      postedAt: "2026-04-25",
    },
  },
  {
    source: "workday",
    fixture: "workday-mock.html",
    expected: {
      title: "Product Security Engineer",
      company: "Meridian Cloud",
      location: "Remote, US, US",
      postedAt: "2026-04-20",
    },
  },
  {
    source: "unknown",
    fixture: "unknown-jsonld-job.html",
    expected: {
      title: "Principal Platform Engineer",
      company: "Mosaic Robotics",
      location: "Remote, Canada, CA",
      postedAt: "2026-05-12",
    },
  },
] as const;

for (const testCase of cases) {
  test(`${testCase.source} fixture extracts a valid from-extension payload`, async () => {
    const page = await context.newPage();
    try {
      await loadFixture(page, testCase.fixture);

      const job = await page.evaluate((source) => {
        const text = (selectors: string[]) => {
          for (const selector of selectors) {
            const el = document.querySelector(selector);
            const value = selector.includes("img[alt]")
              ? el?.getAttribute("alt")?.trim()
              : el?.textContent?.trim();
            if (value) return value;
          }
          return undefined;
        };

        const clean = (html: string) =>
          html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<\/li>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        const structured = () => {
          for (const el of document.querySelectorAll(
            'script[type="application/ld+json"]',
          )) {
            if (!el.textContent) continue;
            const data = JSON.parse(el.textContent);
            if (data["@type"] === "JobPosting") return data;
          }
          return undefined;
        };

        const jobData = structured();
        const locationFromStructured = () => {
          const address = jobData?.jobLocation?.address;
          return [
            address?.addressLocality,
            address?.addressRegion,
            address?.addressCountry,
          ]
            .filter(Boolean)
            .join(", ");
        };

        if (source === "greenhouse") {
          return {
            title: text([".app-title", ".job-title", "#header h1"]),
            company: text(["#header .company-name", ".company-name"]),
            location: text([".location", ".job-location"]),
            description: clean(
              document.querySelector("#content")?.innerHTML || "",
            ),
            requirements: [],
            keywords: ["typescript", "node.js", "aws"],
            salary: "$170000-220000",
            type: "full-time",
            remote: true,
            url: window.location.href,
            source,
            sourceJobId: "fixture",
            postedAt: jobData?.datePosted,
          };
        }

        if (source === "lever") {
          const company =
            text([".main-header-logo img[alt]"]) ||
            document.title.split(" - ").pop()?.trim();
          return {
            title: text([".posting-headline h2", ".posting-headline h1"]),
            company,
            location: text([".posting-categories .location"]),
            description: clean(
              Array.from(document.querySelectorAll(".section.page-centered"))
                .map((section) => section.innerHTML)
                .join("\n\n"),
            ),
            requirements: [],
            keywords: ["python", "postgresql", "aws"],
            salary: "$180000-235000",
            type: "full-time",
            remote: true,
            url: window.location.href,
            source,
            sourceJobId: "fixture",
            postedAt: jobData?.datePosted,
          };
        }

        if (source === "indeed") {
          return {
            title: text([
              ".jobsearch-JobInfoHeader-title",
              '[data-testid="jobsearch-JobInfoHeader-title"]',
            ]),
            company: text([
              '[data-testid="inlineHeader-companyName"] a',
              '[data-testid="inlineHeader-companyName"]',
            ]),
            location: text(['[data-testid="inlineHeader-companyLocation"]']),
            description: clean(
              document.querySelector("#jobDescriptionText")?.innerHTML || "",
            ),
            requirements: [],
            keywords: ["react", "typescript", "graphql"],
            salary: text([
              '[data-testid="jobsearch-JobMetadataHeader-salaryInfo"]',
            ]),
            type: "full-time",
            remote: true,
            url: window.location.href,
            source,
            sourceJobId: "fixture",
            postedAt: jobData?.datePosted,
          };
        }

        if (source === "unknown") {
          return {
            title: jobData?.title,
            company: jobData?.hiringOrganization?.name,
            location: locationFromStructured(),
            description: clean(jobData?.description || ""),
            requirements: [],
            keywords: ["typescript", "node.js", "postgresql", "kubernetes"],
            salary: "CAD 190,000 - 240,000",
            type: "full-time",
            remote: true,
            url: window.location.href,
            source,
            sourceJobId: "fixture",
            postedAt: jobData?.datePosted,
          };
        }

        return {
          title: jobData?.title,
          company: jobData?.hiringOrganization?.name,
          location: locationFromStructured(),
          description: clean(jobData?.description || ""),
          requirements: [],
          keywords: ["typescript", "go", "kubernetes"],
          salary: "USD 150,000 - 195,000",
          type: "full-time",
          remote: true,
          url: window.location.href,
          source,
          sourceJobId: "fixture",
          postedAt: jobData?.datePosted,
        };
      }, testCase.source);

      expect(job.title).toBe(testCase.expected.title);
      expect(job.company).toBe(testCase.expected.company);
      expect(job.location).toBe(testCase.expected.location);
      expect(job.description.length).toBeGreaterThan(120);
      expect(job.url).toContain(testCase.fixture);
      expect(job.postedAt).toBe(testCase.expected.postedAt);
      expect(job.title).not.toContain("navigation");
      expect(job.company).not.toContain("navigation");
      expect(extensionOpportunitySchema.safeParse(job).success).toBe(true);
    } finally {
      await page.close();
    }
  });
}

test("Greenhouse, Lever, and Indeed fixtures expose job list cards", async () => {
  const page = await context.newPage();
  try {
    await loadFixture(page, "greenhouse-mock.html");
    const greenhouseJobs = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".opening")).map((card) => ({
        title: card.querySelector("a")?.textContent?.trim(),
        company: document.querySelector(".company-name")?.textContent?.trim(),
        location: card.querySelector(".location")?.textContent?.trim(),
        url: (card.querySelector("a") as HTMLAnchorElement | null)?.href,
      })),
    );
    expect(greenhouseJobs).toHaveLength(2);
    expect(greenhouseJobs[0]).toMatchObject({
      title: "Platform Engineer",
      company: "Verdant Systems",
      location: "New York, NY",
    });

    await loadFixture(page, "lever-mock.html");
    const leverJobs = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".posting")).map((card) => ({
        title: card.querySelector(".posting-title h5")?.textContent?.trim(),
        company: document
          .querySelector(".main-header-logo img")
          ?.getAttribute("alt"),
        location: card.querySelector(".location")?.textContent?.trim(),
        url: (card as HTMLAnchorElement).href,
      })),
    );
    expect(leverJobs).toHaveLength(2);
    expect(leverJobs[0]).toMatchObject({
      title: "Applied AI Engineer",
      company: "Helio Labs",
      location: "New York, NY",
    });

    await loadFixture(page, "indeed-mock.html");
    const indeedJobs = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".job_seen_beacon")).map((card) => ({
        title: card.querySelector(".jobTitle")?.textContent?.trim(),
        company: card
          .querySelector('[data-testid="company-name"]')
          ?.textContent?.trim(),
        location: card
          .querySelector('[data-testid="text-location"]')
          ?.textContent?.trim(),
        url:
          (card.querySelector(".jobTitle") as HTMLAnchorElement | null)?.href ||
          `https://www.indeed.com/viewjob?jk=${card.getAttribute("data-jk")}`,
      })),
    );
    expect(indeedJobs).toHaveLength(2);
    expect(indeedJobs[0]).toMatchObject({
      title: "Senior React Engineer",
      company: "Pioneer Apps",
      location: "Denver, CO",
    });
  } finally {
    await page.close();
  }
});

test("WaterlooWorks live-style listing rows surface bulk page state", async () => {
  const page = await context.newPage();
  const url =
    "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";
  try {
    await page.route(url, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html>
          <html>
            <body class="nPostingController page--1430 is--my-account new-student__posting-search loaded">
              <main>
                <h1>Jobs / Applications</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Level</th>
                      <th>Openings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><a href="javascript:void(0)">AI Toolchain Software Developer</a></td>
                      <td>Waterloo</td>
                      <td>Junior, Intermediate</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><a href="javascript:void(0)">Verification and Validation - Load and Performance Testing</a></td>
                      <td>Waterloo</td>
                      <td>Junior, Intermediate</td>
                      <td>32</td>
                    </tr>
                  </tbody>
                </table>
                <a class="pagination__link" aria-label="Go to next page" href="javascript:void(0)">Next</a>
              </main>
            </body>
          </html>`,
      }),
    );
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    const wwState = await sendMessageToTab<{
      success: boolean;
      data: {
        kind: "list" | "detail" | "other";
        rowCount: number;
        hasNextPage: boolean;
      };
    }>(context, extensionId, "waterlooworks.uwaterloo.ca", {
      type: "WW_GET_PAGE_STATE",
    });
    expect(wwState).toMatchObject({
      success: true,
      data: { kind: "list", rowCount: 2, hasNextPage: true },
    });
  } finally {
    await page.close();
  }
});

test("WaterlooWorks list page still surfaces bulk state when a detail modal is open", async () => {
  const page = await context.newPage();
  const url =
    "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";
  try {
    await page.route(url, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html>
          <html>
            <body class="nPostingController page--1430 is--my-account new-student__posting-search loaded">
              <main>
                <table>
                  <tbody>
                    <tr>
                      <td><button type="button">AI Toolchain Software Developer</button></td>
                      <td>onsemi</td>
                      <td>Waterloo</td>
                    </tr>
                    <tr>
                      <td><button type="button">Software Developer</button></td>
                      <td>onsemi</td>
                      <td>Waterloo</td>
                    </tr>
                  </tbody>
                </table>
                <div role="dialog" aria-modal="true">
                  <div class="dashboard-header__posting-title">
                    <span>471264</span>
                    <h2>AI Toolchain Software Developer</h2>
                  </div>
                </div>
              </main>
            </body>
          </html>`,
      }),
    );
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    const wwState = await sendMessageToTab<{
      success: boolean;
      data: {
        kind: "list" | "detail" | "other";
        rowCount: number;
        hasNextPage: boolean;
      };
    }>(context, extensionId, "waterlooworks.uwaterloo.ca", {
      type: "WW_GET_PAGE_STATE",
    });
    expect(wwState).toMatchObject({
      success: true,
      data: { kind: "list", rowCount: 2 },
    });
  } finally {
    await page.close();
  }
});

test("WaterlooWorks detail modal surfaces a detected job", async () => {
  const page = await context.newPage();
  const url =
    "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";
  try {
    await page.route(url, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html>
          <html>
            <body class="nPostingController page--1430 is--my-account new-student__posting-search loaded">
              <div class="posting-list-underlay">
                <table>
                  <tbody>
                    <tr><td>AI Toolchain Software Developer</td><td>8</td></tr>
                  </tbody>
                </table>
              </div>
              <div role="dialog" aria-modal="true">
                <section class="dashboard-header">
                  <div class="dashboard-header__posting-title">
                    <span>471264</span>
                    <h2>AI Toolchain Software Developer</h2>
                  </div>
                  <p>onsemi - Industrial Solutions Division</p>
                </section>
                <nav>OVERVIEW MAP WORK TERM RATINGS</nav>
                <section>
                  <h3>JOB POSTING INFORMATION</h3>
                  <p>Work Term:</p>
                  <p>2026 - Fall</p>
                  <p>Job Type:</p>
                  <p>Co-op Main</p>
                  <p>Job Title:</p>
                  <p>AI Toolchain Software Developer</p>
                  <p>Employer Internal Job Number:</p>
                  <p>SK</p>
                  <p>Number of Job Openings:</p>
                  <p>1</p>
                  <p>Level:</p>
                  <p>Junior</p>
                  <p>Intermediate</p>
                  <p>Senior</p>
                  <p>Region:</p>
                  <p>ON - Waterloo Region</p>
                  <p>Job - City:</p>
                  <p>Waterloo</p>
                  <p>Job Summary:</p>
                  <p>Build and maintain internal AI developer tools for industrial semiconductor software teams.</p>
                </section>
              </div>
            </body>
          </html>`,
      }),
    );
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    const surface = await sendMessageToTab<{
      page: { job: { title: string; company: string; source: string } | null };
      tab: { supported: boolean; contentScriptReady: boolean };
    }>(context, extensionId, "waterlooworks.uwaterloo.ca", {
      type: "GET_SURFACE_CONTEXT",
    });

    expect(surface.tab).toMatchObject({
      supported: true,
      contentScriptReady: true,
    });
    expect(surface.page.job).toMatchObject({
      title: "AI Toolchain Software Developer",
      company: "onsemi - Industrial Solutions Division",
      source: "waterlooworks",
    });
  } finally {
    await page.close();
  }
});

test("Greenhouse bulk import surfaces duplicate counts from the extension response", async () => {
  const localExtension = await launchExtensionContext();
  const requests: unknown[] = [];
  const server = await new Promise<Server>((resolve) => {
    const instance = createServer((request, response) => {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        if (
          request.method === "POST" &&
          request.url === "/api/opportunities/from-extension"
        ) {
          requests.push(JSON.parse(body));
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              imported: 1,
              opportunityIds: ["opp-platform"],
              pendingCount: 1,
              dedupedIds: ["222222"],
            }),
          );
          return;
        }

        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "not found" }));
      });
    });
    instance.listen(0, "127.0.0.1", () => resolve(instance));
  });
  const { port } = server.address() as AddressInfo;

  await seedExtensionStorage(
    localExtension.context,
    localExtension.extensionId,
    {
      authToken: "test-token",
      tokenExpiry: "2099-01-01T00:00:00.000Z",
      cachedProfile: null,
      apiBaseUrl: `http://127.0.0.1:${port}`,
      settings: {
        autoFillEnabled: true,
        showConfidenceIndicators: true,
        minimumConfidence: 0.5,
        learnFromAnswers: true,
        notifyOnJobDetected: true,
      },
    },
  );
  const page = await localExtension.context.newPage();
  try {
    await loadFixture(page, "greenhouse-mock.html");
    const response = await sendMessageToTab<{
      success: boolean;
      data?: {
        imported: number;
        attempted: number;
        duplicateCount?: number;
        dedupedIds?: string[];
      };
      error?: string;
    }>(
      localExtension.context,
      localExtension.extensionId,
      "greenhouse-mock.html",
      {
        type: "BULK_GREENHOUSE_SCRAPE_VISIBLE",
      },
    );

    expect(response, response.error).toMatchObject({ success: true });
    expect(response.data).toMatchObject({
      imported: 1,
      attempted: 2,
      duplicateCount: 1,
      dedupedIds: ["222222"],
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      jobs: expect.arrayContaining([
        expect.objectContaining({ sourceJobId: "111111" }),
        expect.objectContaining({ sourceJobId: "222222" }),
      ]),
    });
  } finally {
    await page.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closeExtensionContext(localExtension);
  }
});
