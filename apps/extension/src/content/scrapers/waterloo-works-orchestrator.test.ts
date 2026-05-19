// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  WaterlooWorksOrchestrator,
  getWaterlooWorksRows,
  readWaterlooWorksRowMeta,
} from "./waterloo-works-orchestrator";

// Helper to build a postings-list page with N rows. Each row's title link, when
// clicked, mutates the DOM to put a single posting panel in place (simulating
// the side-panel that the live UI shows). A "next page" link is wired up to
// replace the row text content so the orchestrator can detect a page change.
function buildPostingsPage(args: {
  rowTitles: string[];
  totalPages: number;
  currentPage: number;
  nextPagesData?: string[][]; // ordered list of titles per page (index 0 = page 1)
}) {
  const { rowTitles, totalPages, currentPage, nextPagesData } = args;

  document.body.className = "new-student__posting-search";
  document.body.innerHTML = `
    <table class="data-viewer-table">
      <tbody>
        ${rowTitles
          .map(
            (t, i) => `
          <tr class="table__row--body" data-id="page${currentPage}-row${i}">
            <td><a href="javascript:void(0)" class="overflow--ellipsis">${t}</a></td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <div class="pagination">
      <a
        class="pagination__link${currentPage >= totalPages ? " disabled" : ""}"
        aria-label="Go to next page"
        href="javascript:void(0)"
      >next</a>
    </div>
  `;

  // Wire next-page on the link itself so test isolation is automatic — no
  // document-level listeners that leak across tests.
  if (nextPagesData) {
    const nextLink = document.querySelector<HTMLAnchorElement>(
      'a.pagination__link[aria-label="Go to next page"]',
    );
    if (nextLink && !nextLink.classList.contains("disabled")) {
      nextLink.addEventListener("click", (e) => {
        e.preventDefault();
        const next = currentPage + 1;
        if (next > totalPages) return;
        buildPostingsPage({
          rowTitles: nextPagesData[next - 1],
          totalPages,
          currentPage: next,
          nextPagesData,
        });
      });
    }
  }

  // Wire the row clicks: clicking a title link adds (or replaces) a posting
  // detail panel as a SIBLING of the postings table so the table stays in the
  // DOM for subsequent iterations — mirroring the real WW side-panel UX.
  for (const a of Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a.overflow--ellipsis"),
  )) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = a.textContent || "";
      const id = `${100 + Math.floor(Math.random() * 9000)}`;
      // Remove any previously-attached panel first
      document.querySelector("#test-posting-panel")?.remove();
      const panel = document.createElement("section");
      panel.id = "test-posting-panel";
      panel.innerHTML = `
        <div class="dashboard-header__posting-title">
          <i>fiber_manual_record</i>
          ${id}
          <h2>${t}</h2>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Job Title:</span>
          <div class="value">${t}</div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Organization:</span>
          <div class="value">Test Employer</div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Job Summary:</span>
          <div class="value"><p>${t} role description.</p></div>
        </div>
        <div class="tag__key-value-list js--question--container">
          <span class="label">Job - City:</span>
          <div class="value">Toronto</div>
        </div>
      `;
      document.body.appendChild(panel);
    });
  }
}

// (next-page wiring moved into buildPostingsPage via the nextPagesData arg)

describe("WaterlooWorksOrchestrator", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.className = "";
    // jsdom doesn't natively support arrow-key navigation etc; we're fine with
    // direct clicks via element.click().
  });

  it("scrapeAllVisible iterates rows and returns scraped jobs", async () => {
    buildPostingsPage({
      rowTitles: ["Job A", "Job B", "Job C"],
      totalPages: 1,
      currentPage: 1,
    });

    const o = new WaterlooWorksOrchestrator();
    const progressEvents: Array<{ scrapedCount: number; lastTitle?: string }> =
      [];
    const jobs = await o.scrapeAllVisible({
      throttleMs: 0,
      onProgress: (p) =>
        progressEvents.push({
          scrapedCount: p.scrapedCount,
          lastTitle: p.lastTitle,
        }),
    });
    expect(jobs.length).toBe(3);
    expect(jobs.map((j) => j.title)).toEqual(["Job A", "Job B", "Job C"]);
    expect(progressEvents.length).toBeGreaterThanOrEqual(3);
    expect(progressEvents.at(-1)?.scrapedCount).toBe(3);
  });

  it("detects live-style WaterlooWorks rows without legacy row classes", () => {
    document.body.className = "new-student__posting-search";
    document.body.innerHTML = `
      <table>
        <thead>
          <tr><th>Job Title</th><th>Location</th><th>Openings</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><a href="javascript:void(0)">AI Toolchain Software Developer</a></td>
            <td>Waterloo</td>
            <td>8</td>
          </tr>
          <tr>
            <td><a href="javascript:void(0)">Verification and Validation</a></td>
            <td>Waterloo</td>
            <td>32</td>
          </tr>
        </tbody>
      </table>
      <a aria-label="Go to next page" href="javascript:void(0)">Next</a>
    `;

    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
    expect(getWaterlooWorksRows().length).toBe(2);
  });

  it("detects role-grid rows and title buttons from the modern list", () => {
    document.body.className = "new-student__posting-search";
    document.body.innerHTML = `
      <div role="table">
        <div role="rowgroup">
          <div role="row">
            <div role="cell"><input type="checkbox" /></div>
            <div role="cell">471264</div>
            <div role="cell"><button type="button">AI Toolchain Software Developer</button></div>
            <div role="cell">onsemi</div>
            <div role="cell">Waterloo</div>
          </div>
          <div role="row">
            <div role="cell"><input type="checkbox" /></div>
            <div role="cell">471263</div>
            <div role="cell"><button type="button">Software Developer</button></div>
            <div role="cell">onsemi</div>
            <div role="cell">Waterloo</div>
          </div>
        </div>
      </div>
    `;

    expect(getWaterlooWorksRows().length).toBe(2);
  });

  it("scrapeAllVisible respects maxJobs cap", async () => {
    buildPostingsPage({
      rowTitles: ["A", "B", "C", "D", "E"],
      totalPages: 1,
      currentPage: 1,
    });
    const o = new WaterlooWorksOrchestrator();
    const jobs = await o.scrapeAllVisible({ throttleMs: 0, maxJobs: 2 });
    expect(jobs.length).toBe(2);
  });

  it("scrapeAllPaginated walks multiple pages until next is disabled", async () => {
    const pages = [["P1-Job1", "P1-Job2"], ["P2-Job1", "P2-Job2"], ["P3-Only"]];
    buildPostingsPage({
      rowTitles: pages[0],
      totalPages: pages.length,
      currentPage: 1,
      nextPagesData: pages,
    });

    const o = new WaterlooWorksOrchestrator();
    const jobs = await o.scrapeAllPaginated({ throttleMs: 0, maxPages: 10 });
    const titles = jobs.map((j) => j.title);
    expect(titles).toEqual([
      "P1-Job1",
      "P1-Job2",
      "P2-Job1",
      "P2-Job2",
      "P3-Only",
    ]);
  });

  it("scrapeAllPaginated stops at maxPages even if more pages exist", async () => {
    const pages = [["P1-Job1"], ["P2-Job1"], ["P3-Job1"]];
    buildPostingsPage({
      rowTitles: pages[0],
      totalPages: pages.length,
      currentPage: 1,
      nextPagesData: pages,
    });

    const o = new WaterlooWorksOrchestrator();
    const jobs = await o.scrapeAllPaginated({ throttleMs: 0, maxPages: 2 });
    expect(jobs.map((j) => j.title)).toEqual(["P1-Job1", "P2-Job1"]);
  });

  it("returns empty array if there are no rows", async () => {
    document.body.innerHTML =
      '<table class="data-viewer-table"><tbody></tbody></table>';
    const jobs = await new WaterlooWorksOrchestrator().scrapeAllVisible({
      throttleMs: 0,
    });
    expect(jobs).toEqual([]);
  });
});

describe("readWaterlooWorksRowMeta", () => {
  function makeRow(html: string): HTMLElement {
    const wrapper = document.createElement("table");
    wrapper.innerHTML = `<tbody>${html}</tbody>`;
    document.body.innerHTML = "";
    document.body.appendChild(wrapper);
    return wrapper.querySelector("tr") as HTMLElement;
  }

  it("extracts ID from a span-wrapped cell + applicants from rightmost int", () => {
    // Mirror of the live WW row shape: spans wrap each cell's content,
    // ID is a 6-digit number, openings (2) appears before Apps (51).
    const row = makeRow(`
      <tr class="table__row--body">
        <td><input type="checkbox" /></td>
        <td><div class="row-toolbar">icons</div></td>
        <td><span>471268</span></td>
        <td><span class="display--flex"><a href="javascript:void(0)">AI Toolchain</a></span></td>
        <td><span>onsemi</span></td>
        <td><span>Industrial Solutions Division</span></td>
        <td><span>2</span></td>
        <td><span>Waterloo</span></td>
        <td><span>Junior, Intermediate</span></td>
        <td><span>51</span></td>
      </tr>
    `);
    expect(readWaterlooWorksRowMeta(row)).toEqual({
      sourceJobId: "471268",
      applicants: 51,
    });
  });

  it("tolerates a status-bullet prefix on the ID cell", () => {
    // WW renders an unread-posting bullet ("●") before the ID. The cell's
    // textContent becomes "● 471268" — strict integer regex misses this.
    const row = makeRow(`
      <tr class="table__row--body">
        <td><span class="status-dot">●</span> 471268</td>
        <td><a href="javascript:void(0)">Title</a></td>
        <td>1</td>
        <td>12</td>
      </tr>
    `);
    expect(readWaterlooWorksRowMeta(row).sourceJobId).toBe("471268");
    expect(readWaterlooWorksRowMeta(row).applicants).toBe(12);
  });

  it("ignores integers embedded in non-numeric text (salary, ratings, etc.)", () => {
    // "Hourly $50,000" should not seed a fake 50000 sourceJobId, and a
    // multi-word level cell ("Junior 2 Intermediate 3") shouldn't make
    // the applicants count flip to 3.
    const row = makeRow(`
      <tr class="table__row--body">
        <td><a href="javascript:void(0)">Title</a></td>
        <td>Hourly $50,000</td>
        <td>Junior 2 Intermediate 3</td>
        <td>87</td>
      </tr>
    `);
    expect(readWaterlooWorksRowMeta(row)).toEqual({
      sourceJobId: undefined,
      applicants: 87,
    });
  });

  it("returns undefined for both fields when no integer cells exist", () => {
    const row = makeRow(`
      <tr class="table__row--body">
        <td><a href="javascript:void(0)">Title only</a></td>
        <td>Company</td>
      </tr>
    `);
    expect(readWaterlooWorksRowMeta(row)).toEqual({
      sourceJobId: undefined,
      applicants: undefined,
    });
  });

  it("does not count the ID cell as applicants", () => {
    // If the ID is the only integer in the row, applicants stays
    // undefined rather than echoing the ID.
    const row = makeRow(`
      <tr class="table__row--body">
        <td><span>471268</span></td>
        <td><a href="javascript:void(0)">Title</a></td>
      </tr>
    `);
    expect(readWaterlooWorksRowMeta(row)).toEqual({
      sourceJobId: "471268",
      applicants: undefined,
    });
  });
});
