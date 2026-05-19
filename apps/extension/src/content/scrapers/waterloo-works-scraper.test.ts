// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it, beforeEach } from "vitest";

import { WaterlooWorksScraper } from "./waterloo-works-scraper";

const FIXTURE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../tests/fixtures/waterloo-works-mock.html",
);

async function loadFixture() {
  const html = await readFile(FIXTURE, "utf8");
  // Extract just the body content + body class so we can mount it into JSDOM's
  // existing document without trying to replace the html element.
  const bodyMatch = html.match(/<body\s+class="([^"]+)">([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error("fixture missing <body>");
  document.body.className = bodyMatch[1];
  document.body.innerHTML = bodyMatch[2];
}

describe("WaterlooWorksScraper (modern UI)", () => {
  beforeEach(() => {
    document.body.className = "";
    document.body.innerHTML = "";
  });

  it("canHandle accepts waterlooworks URLs", () => {
    const s = new WaterlooWorksScraper();
    expect(
      s.canHandle(
        "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm",
      ),
    ).toBe(true);
    expect(
      s.canHandle(
        "https://waterlooworks-staging.uwaterloo.ca/myAccount/co-op/full/jobs.htm",
      ),
    ).toBe(true);
    expect(s.canHandle("https://example.com")).toBe(false);
  });

  it("scrapeJobListing returns a job from the modern posting panel", async () => {
    await loadFixture();
    const job = await new WaterlooWorksScraper().scrapeJobListing();

    expect(job).not.toBeNull();
    expect(job!.source).toBe("waterlooworks");
    expect(job!.title).toBe(
      "Software Engineering Intern (Commercial Software)",
    );
    expect(job!.sourceJobId).toBe("469433");
    expect(job!.company).toBe("Acme Commercial Software Inc.");
    expect(job!.location).toBe("Toronto, Ontario, Canada");
    expect(job!.type).toBe("internship");
    expect(job!.deadline).toContain("June 15");
    // Deadline should be a single-line value, not raw textContent with
    // embedded tabs/newlines (WW pads its rendered text with both).
    expect(job!.deadline).not.toMatch(/[\n\t]/);
    expect(job!.salary).toMatch(/28-32|CAD/);
    expect(job!.remote).toBe(true); // "Hybrid" arrangement
    // sourceJobId is encoded in the URL so the opportunities view can
    // deep-link back to the modal via the #postingId hash hook.
    expect(job!.url).toContain("#postingId=469433");
  });

  it("respects the structured arrangement field over free-text description", async () => {
    // WW exposes "Employment Location Arrangement" as a structured field.
    // When it says "On-site", we should not flag remote even if the
    // description mentions remote work elsewhere.
    document.body.className = "new-student__posting-search";
    document.body.innerHTML = `
      <section>
        <div class="dashboard-header__posting-title"><h2>Onsite job</h2><i>fiber_manual_record</i> 999001</div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Job Title:</span><div class="value">Onsite job</div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Organization:</span><div class="value">Acme Co</div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Job Summary:</span>
          <div class="value">
            <p>Standard onsite role. We do not support remote work.
            Some teams have remote folks occasionally.</p>
          </div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Employment Location Arrangement:</span>
          <div class="value">On-site</div>
        </div>
      </section>
    `;
    const job = await new WaterlooWorksScraper().scrapeJobListing();
    expect(job).not.toBeNull();
    expect(job!.remote).toBe(false);
  });

  it("description concatenates summary + responsibilities + skills sections", async () => {
    await loadFixture();
    const job = await new WaterlooWorksScraper().scrapeJobListing();

    expect(job!.description).toContain("Commercial Software team");
    expect(job!.description.toLowerCase()).toContain("responsibilities");
    expect(job!.description).toContain("Toronto office");
  });

  it("parses requirements and responsibilities as bullet lists when available", async () => {
    await loadFixture();
    const job = await new WaterlooWorksScraper().scrapeJobListing();

    expect(job!.requirements.length).toBeGreaterThan(0);
    expect(
      job!.requirements.some((r) => /TypeScript|JavaScript|Go|Python/.test(r)),
    ).toBe(true);
    expect(job!.responsibilities?.length).toBeGreaterThan(0);
  });

  it("scrapeJobList returns empty array (no bulk surface on modern UI)", async () => {
    await loadFixture();
    const jobs = await new WaterlooWorksScraper().scrapeJobList();
    expect(jobs).toEqual([]);
  });

  it("returns null when no posting panel is open", async () => {
    document.body.className = "dashboardController";
    document.body.innerHTML = "<main>Dashboard content</main>";
    const job = await new WaterlooWorksScraper().scrapeJobListing();
    expect(job).toBeNull();
  });

  it("ignores WaterlooWorks keep-alive dialogs", async () => {
    document.body.className = "dashboardController";
    document.body.innerHTML = `
      <div role="dialog">
        <h2>Keep Me Logged In</h2>
        <p>Your WaterlooWorks session is about to expire.</p>
        <button>Keep me logged in</button>
      </div>
    `;
    Object.defineProperty(document.body, "innerText", {
      configurable: true,
      value: [
        "Keep Me Logged In",
        "Your WaterlooWorks session is about to expire.",
      ].join("\n"),
    });

    const job = await new WaterlooWorksScraper().scrapeJobListing();

    expect(job).toBeNull();
  });

  it("scrapes the modal-style WaterlooWorks detail view", async () => {
    document.body.innerHTML = `
      <div role="dialog">
        <header>
          <div class="dashboard-header__posting-title">
            <span>471268</span>
            <h2>Verification and Validation - Load and Performance Testing</h2>
          </div>
          <p>Agfa HealthCare Inc - Divisional Office</p>
        </header>
        <nav>OVERVIEW MAP WORK TERM RATINGS</nav>
        <section>
          <h3>JOB POSTING INFORMATION</h3>
          <p>Work Term:</p>
          <p>2026 - Fall</p>
          <p>Job Type:</p>
          <p>Co-op Main</p>
          <p>Job Title:</p>
          <p>Verification and Validation - Load and Performance Testing</p>
          <p>Employer Internal Job Number:</p>
          <p>SK</p>
          <p>Job Summary:</p>
          <p>Validate load and performance characteristics for healthcare software.</p>
        </section>
      </div>
    `;
    Object.defineProperty(document.body, "innerText", {
      configurable: true,
      value: [
        "471268",
        "Verification and Validation - Load and Performance Testing",
        "Agfa HealthCare Inc - Divisional Office",
        "JOB POSTING INFORMATION",
        "Work Term:",
        "2026 - Fall",
        "Job Type:",
        "Co-op Main",
        "Job Title:",
        "Verification and Validation - Load and Performance Testing",
        "Employer Internal Job Number:",
        "SK",
        "Job Summary:",
        "Validate load and performance characteristics for healthcare software.",
      ].join("\n"),
    });

    const job = await new WaterlooWorksScraper().scrapeJobListing();

    expect(job).toMatchObject({
      source: "waterlooworks",
      sourceJobId: "471268",
      title: "Verification and Validation - Load and Performance Testing",
      company: "Agfa HealthCare Inc - Divisional Office",
      type: "internship",
    });
    expect(job?.description).toContain("healthcare software");
  });

  it("returns null on a login page", async () => {
    document.body.innerHTML = '<input type="password" />';
    const job = await new WaterlooWorksScraper().scrapeJobListing();
    expect(job).toBeNull();
  });
});
