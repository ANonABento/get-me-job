// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { LinkedInScraper } from "./linkedin-scraper";

describe("LinkedInScraper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "/jobs/search/?currentJobId=471268");
  });

  it("handles LinkedIn selected-job search results URLs", () => {
    expect(
      new LinkedInScraper().canHandle(
        "https://www.linkedin.com/jobs/search-results/?currentJobId=4414255803",
      ),
    ).toBe(true);
  });

  it("detects selected search jobs before the full description block loads", async () => {
    document.body.innerHTML = `
      <main>
        <section class="jobs-search__job-details--container">
          <h1>Robotics Engineer Intern, Mechanical [Summer/Fall]</h1>
          <div class="job-details-jobs-unified-top-card__primary-description-container">
            <a href="/company/contoro-robotics">Contoro Robotics</a>
            <span class="job-details-jobs-unified-top-card__bullet">Austin, TX</span>
            <span class="job-details-jobs-unified-top-card__bullet">1 month ago</span>
          </div>
          <button>Apply</button>
          <button>Save</button>
          <section>
            Determine your fit and how to stand out
          </section>
        </section>
      </main>
    `;

    const job = await new LinkedInScraper().scrapeJobListing();

    expect(job).toMatchObject({
      title: "Robotics Engineer Intern, Mechanical [Summer/Fall]",
      company: "Contoro Robotics",
      location: "Austin, TX",
      source: "linkedin",
      sourceJobId: "471268",
    });
    expect(job?.description).toContain("Robotics Engineer Intern");
  });

  it("falls back to visible top-card text for company and location", async () => {
    document.body.innerHTML = `
      <main>
        <section class="scaffold-layout__detail">
          <h1>Robotics Test & Validation Intern</h1>
          <div>Contoro Robotics</div>
          <div>Austin, TX (On-site)</div>
          <button>Apply</button>
          <button>Save</button>
        </section>
      </main>
    `;
    Object.defineProperty(document.body, "innerText", {
      configurable: true,
      value: [
        "Robotics Test & Validation Intern",
        "Contoro Robotics",
        "Austin, TX (On-site)",
        "Apply",
        "Save",
      ].join("\n"),
    });

    const job = await new LinkedInScraper().scrapeJobListing();

    expect(job).toMatchObject({
      title: "Robotics Test & Validation Intern",
      company: "Contoro Robotics",
      location: "Austin, TX (On-site)",
    });
  });
});
