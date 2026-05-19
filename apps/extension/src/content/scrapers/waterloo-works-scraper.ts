// Waterloo Works job scraper (University of Waterloo co-op portal).
//
// Targets the modern student posting-search UI (body.new-student__posting-search).
// The legacy Orbis-era selectors (#postingDiv, .posting-details, .job-listing-table)
// are no longer present on the production site; this scraper does not try to
// support both — if WW reverts or a different surface appears, add a branch.

import { BaseScraper } from "./base-scraper";
import type { ScrapedJob } from "../../shared/types";

// Field labels from the live UI. Each entry lists prefixes we want to match
// against the .label text (which is normalized — trailing colons and whitespace
// stripped before comparison). The first matching candidate wins per row.
const FIELD_LABELS = {
  title: ["Job Title"],
  summary: ["Job Summary"],
  responsibilities: ["Job Responsibilities", "Responsibilities"],
  requirements: [
    "Required Skills",
    "Targeted Skills",
    "Targeted Degrees and Disciplines",
  ],
  organization: ["Organization", "Employer", "Company"],
  // Modern WW splits location across multiple labelled rows; we collect each
  // piece separately and stitch them in composeLocation().
  locationCity: ["Job - City"],
  locationRegion: ["Job - Province/State", "Job - Province / State"],
  locationCountry: ["Job - Country"],
  locationFull: [
    "Job Location",
    "Location",
    "Job - City, Province / State, Country",
  ],
  employmentArrangement: ["Employment Location Arrangement"],
  workTerm: ["Work Term"],
  workTermDuration: ["Work Term Duration"],
  level: ["Level"],
  openings: ["Number of Job Openings"],
  deadline: ["Application Deadline", "Deadline"],
  salary: [
    "Compensation and Benefits Information",
    "Compensation and Benefits",
    "Compensation",
    "Salary",
  ],
  jobType: ["Job Type"],
} as const;

type FieldKey = keyof typeof FIELD_LABELS;

/**
 * Collapse all whitespace runs in a single-value field down to a single space.
 * WaterlooWorks pads its rendered text with `\n\t\t…\n\t\t\t\t\t\t` blocks so
 * the raw textContent looks like `"May 19, 2026\n\t\t\t\t\n\t\t\t\t\t9:00 AM"`.
 * Don't use for the description; only for inline fields like deadline.
 */
function normalizeInline(value: string | undefined): string | undefined {
  if (!value) return value;
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : undefined;
}

/**
 * Parse the first integer out of a WaterlooWorks field value. The "Number
 * of Job Openings" field is "1" / "3" / "10" on its own line; some employers
 * write "1 (Co-op)" or " 2 " so we tolerate surrounding text/whitespace.
 */
function parseIntField(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/-?\d+/);
  if (!match) return undefined;
  const n = Number.parseInt(match[0], 10);
  return Number.isFinite(n) ? n : undefined;
}
type FieldBag = Partial<Record<FieldKey, string>>;

export class WaterlooWorksScraper extends BaseScraper {
  readonly source = "waterlooworks";
  readonly urlPatterns = [
    /(^|\.)waterlooworks\.uwaterloo\.ca$/i,
    /^waterlooworks[-.a-z0-9]*\.uwaterloo\.ca$/i,
  ];

  canHandle(url: string): boolean {
    try {
      const host = new URL(url).hostname;
      return this.urlPatterns.some((p) => p.test(host));
    } catch {
      return /waterlooworks/i.test(url);
    }
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    if (this.isLoginPage()) {
      console.log("[Slothing] Waterloo Works: Please log in first");
      return null;
    }

    try {
      await this.waitForElement(
        '.dashboard-header__posting-title, [role="dialog"], .ReactModal__Content, .modal',
        3000,
      );
    } catch {
      if (!this.isLikelyPostingDetail()) {
        // No posting panel open — not a scrape error, just nothing to scrape.
        return null;
      }
    }

    if (!this.isLikelyPostingDetail()) return null;

    const fields = this.collectFields();
    const {
      sourceJobId,
      title: panelTitle,
      company: panelCompany,
    } = this.parsePostingHeader(fields.title);

    const title = fields.title || panelTitle;
    const company = fields.organization || panelCompany;
    const description =
      this.composeDescription(fields) ||
      this.composeFallbackDescription(fields, title, company);

    if (!title || !description) {
      console.log(
        "[Slothing] Waterloo Works scraper: Missing title or description",
      );
      return null;
    }

    const location = this.composeLocation(fields);

    return {
      title,
      company: company || "Unknown Employer",
      location,
      description,
      requirements:
        this.parseBulletList(fields.requirements) ||
        this.extractRequirements(description),
      responsibilities: this.parseBulletList(fields.responsibilities),
      keywords: this.extractKeywords(description),
      // Slothing's extension schema caps optional strings at 500 chars and
      // WaterlooWorks puts the full benefits blurb in "Compensation and
      // Benefits". Take the first line/sentence so wage ranges survive.
      salary: this.condenseSalary(fields.salary),
      type: this.detectJobType(fields.jobType || description) || "internship",
      remote: this.detectRemoteFromFields(fields, location, description),
      // Encode the posting's WW ID in the URL so the user can deep-link back
      // to it. WW renders postings as SPA modals (no canonical URL), so the
      // content script picks up the `#postingId=<id>` hash on load and
      // auto-clicks the matching row to re-open the modal. Falls back to
      // the bare jobs.htm URL when sourceJobId is unknown.
      url: sourceJobId
        ? `${window.location.origin}${window.location.pathname}#postingId=${sourceJobId}`
        : window.location.href,
      source: this.source,
      sourceJobId,
      deadline: normalizeInline(fields.deadline),
      // Posting-level metadata from the modal. WW exposes "Number of Job
      // Openings" as a single-line int, "Level" as a multi-line list
      // (e.g. "Junior, Intermediate"), and "Work Term" as "2026 - Fall".
      openings: parseIntField(fields.openings),
      level: normalizeInline(fields.level),
      workTerm: normalizeInline(fields.workTerm),
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    // Modern WaterlooWorks renders the postings list in a virtualized SPA view
    // and the row summaries don't include full descriptions. Bulk-import from
    // the list view is provided by the orchestrator (see
    // waterloo-works-orchestrator.ts), which walks each row, opens its detail
    // panel, and calls scrapeJobListing() per row. scrapeJobList() itself stays
    // empty so the generic auto-detect path doesn't accidentally pick it up.
    return [];
  }

  private isLoginPage(): boolean {
    const url = window.location.href.toLowerCase();
    return (
      url.includes("/cas/") ||
      url.includes("/login") ||
      url.includes("/signin") ||
      document.querySelector('input[type="password"]') !== null
    );
  }

  private isLikelyPostingDetail(): boolean {
    const text = this.visibleText();
    if (/keep me logged in|session timeout|stay logged in/i.test(text)) {
      return false;
    }
    if (this.hasStructuredPostingFields()) return true;
    if (!/job posting information/i.test(text) || !/job title/i.test(text))
      return false;
    const detailRoot = this.postingDetailRoot();
    if (!detailRoot) return false;
    return /job posting information/i.test(detailRoot.textContent || text);
  }

  private hasStructuredPostingFields(): boolean {
    return Array.from(
      document.querySelectorAll(".tag__key-value-list.js--question--container"),
    ).some((block) =>
      /^job title$/i.test(
        this.normalizeLabel(block.querySelector(".label")?.textContent || ""),
      ),
    );
  }

  private postingDetailRoot(): Element | null {
    return (
      Array.from(
        document.querySelectorAll(
          '[role="dialog"], .ReactModal__Content, .modal, main, body',
        ),
      ).find((candidate) =>
        /job posting information/i.test(candidate.textContent || ""),
      ) || null
    );
  }

  private parsePostingHeader(title?: string): {
    sourceJobId?: string;
    title?: string;
    company?: string;
  } {
    const header = document.querySelector(".dashboard-header__posting-title");
    if (header) {
      const h2Text = header.querySelector("h2")?.textContent?.trim();
      const idMatch = (header.textContent || "").match(/\b(\d{4,10})\b/);
      const company = this.findHeaderCompany(header, h2Text);
      return { sourceJobId: idMatch?.[1], title: h2Text, company };
    }

    const lines = this.visibleLines();
    const idMatch = this.visibleText().match(/\b(\d{4,10})\b/);
    const heading = Array.from(document.querySelectorAll("h1,h2,h3"))
      .map((el) => el.textContent?.trim() || "")
      .find(
        (text) =>
          text.length > 10 &&
          !/waterlooworks|job posting information|overview|map|ratings/i.test(
            text,
          ),
      );

    const resolvedTitle = title || heading;
    let company: string | undefined;
    if (resolvedTitle) {
      const titleIndex = lines.findIndex((line) => line === resolvedTitle);
      const next = titleIndex >= 0 ? lines[titleIndex + 1] : undefined;
      if (next && !/new|viewed|deadline|overview|map|ratings/i.test(next)) {
        company = next;
      }
    }

    return { sourceJobId: idMatch?.[1], title: resolvedTitle, company };
  }

  private findHeaderCompany(
    header: Element,
    title: string | undefined,
  ): string | undefined {
    const container = header.closest("section, header, [role='dialog']");
    const candidates = [
      header.nextElementSibling?.textContent?.trim(),
      container?.querySelector("p")?.textContent?.trim(),
    ];
    return candidates.find(
      (value): value is string =>
        !!value &&
        value !== title &&
        !/new|viewed|deadline|overview|map|ratings/i.test(value),
    );
  }

  private collectFields(): FieldBag {
    const bag: FieldBag = {};
    const blocks = document.querySelectorAll(
      ".tag__key-value-list.js--question--container",
    );

    for (const block of blocks) {
      const labelRaw = block.querySelector(".label")?.textContent?.trim();
      if (!labelRaw) continue;
      const label = this.normalizeLabel(labelRaw);

      const valueEl = block.querySelector(".value");
      const value = valueEl
        ? valueEl.innerHTML
        : this.stripLabelFromBlock(block, labelRaw);
      if (!value) continue;

      this.assignField(bag, label, value);
    }
    if (blocks.length === 0) {
      this.collectPlainTextFields(bag);
    }
    return bag;
  }

  private collectPlainTextFields(bag: FieldBag) {
    const lines = this.visibleLines();
    for (let i = 0; i < lines.length; i += 1) {
      const match = lines[i].match(/^([^:]{3,80}):\s*(.*)$/);
      if (!match) continue;
      const label = this.normalizeLabel(match[1]);
      const sameLineValue = match[2]?.trim();
      const value =
        sameLineValue ||
        lines.slice(i + 1).find((line) => !/^([^:]{3,80}):\s*/.test(line));
      if (!value) continue;
      this.assignField(bag, label, value);
    }
  }

  // "Work Term:  " → "work term"
  private normalizeLabel(label: string): string {
    return label
      .replace(/\s+/g, " ")
      .replace(/[:\s]+$/, "")
      .toLowerCase();
  }

  private stripLabelFromBlock(block: Element, label: string): string {
    const clone = block.cloneNode(true) as Element;
    clone.querySelector(".label")?.remove();
    return (
      clone.innerHTML.trim() ||
      clone.textContent?.replace(label, "").trim() ||
      ""
    );
  }

  private assignField(
    bag: FieldBag,
    normalizedLabel: string,
    htmlValue: string,
  ) {
    const cleaned = this.cleanDescription(htmlValue);
    for (const [key, candidates] of Object.entries(FIELD_LABELS) as [
      FieldKey,
      readonly string[],
    ][]) {
      if (candidates.some((c) => this.matchesLabel(key, normalizedLabel, c))) {
        if (!bag[key]) {
          bag[key] =
            key === "responsibilities" ||
            key === "requirements" ||
            key === "summary"
              ? htmlValue // keep HTML for bullet parsing
              : cleaned;
        }
        return;
      }
    }
  }

  private matchesLabel(
    key: FieldKey,
    normalizedLabel: string,
    candidate: string,
  ): boolean {
    const normalizedCandidate = candidate.toLowerCase();
    if (normalizedLabel === normalizedCandidate) return true;

    // WaterlooWorks has labels like "Employer Internal Job Number". That is
    // not the employer/company field and must not override the header company.
    if (
      key === "organization" &&
      (normalizedCandidate === "employer" || normalizedCandidate === "company")
    ) {
      return false;
    }

    return normalizedLabel.startsWith(`${normalizedCandidate} `);
  }

  private composeDescription(fields: FieldBag): string {
    const parts: string[] = [];
    if (fields.summary) parts.push(this.cleanDescription(fields.summary));
    if (fields.responsibilities) {
      parts.push("Responsibilities:");
      parts.push(this.cleanDescription(fields.responsibilities));
    }
    if (fields.requirements) {
      parts.push("Required Skills:");
      parts.push(this.cleanDescription(fields.requirements));
    }
    return parts.filter(Boolean).join("\n\n").trim();
  }

  private composeFallbackDescription(
    fields: FieldBag,
    title: string | undefined,
    company: string | undefined,
  ): string {
    const parts = [
      title && company ? `${title} at ${company}` : title,
      fields.jobType,
      fields.workTerm,
      "WaterlooWorks job details visible; full description not loaded.",
    ];
    return parts.filter((part): part is string => !!part).join("\n");
  }

  private composeLocation(fields: FieldBag): string | undefined {
    if (fields.locationFull) return fields.locationFull;
    const pieces = [
      fields.locationCity,
      fields.locationRegion,
      fields.locationCountry,
    ]
      .map((p) => p?.trim())
      .filter((p): p is string => !!p && p.length > 0);
    return pieces.length > 0 ? pieces.join(", ") : undefined;
  }

  private detectRemoteFromFields(
    fields: FieldBag,
    location: string | undefined,
    description: string,
  ): boolean {
    const arrangement = (fields.employmentArrangement || "").toLowerCase();
    // WaterlooWorks has a structured "Employment Location Arrangement" field
    // (matched in FIELD_LABELS) that is the authoritative source of truth
    // for remote vs. in-person. When it's present, trust it exclusively —
    // free-text scanning of the description has too many false positives
    // (job descriptions casually mention "remote teams", "remote work
    // allowed during exam periods", "remote, hybrid, or in-person" boilerplate).
    if (arrangement) {
      if (/remote|virtual|work from home|distributed/.test(arrangement)) {
        return true;
      }
      if (/hybrid/.test(arrangement)) return true;
      // "On-site", "In-person", "Onsite" → not remote.
      return false;
    }
    // Fall back to free-text scanning only when WW didn't expose the field.
    return this.detectRemote(location || "") || this.detectRemote(description);
  }

  private condenseSalary(raw: string | undefined): string | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return undefined;
    // Prefer the first line / sentence — usually the wage range. If still too
    // long, hard-cap at 480 chars with an ellipsis so the schema validator
    // accepts it (limit is 500).
    const firstChunk = trimmed.split(/\n\n|\n(?=[A-Z])/)[0]?.trim() || trimmed;
    if (firstChunk.length <= 480) return firstChunk;
    return firstChunk.slice(0, 477) + "...";
  }

  private parseBulletList(html: string | undefined): string[] | undefined {
    if (!html) return undefined;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const items = Array.from(doc.querySelectorAll("li"))
      .map((li) => li.textContent?.trim() || "")
      .filter((t) => t.length > 0);
    return items.length > 0 ? items : undefined;
  }

  private visibleText(): string {
    return (
      (document.body as HTMLElement).innerText ||
      document.body.textContent ||
      ""
    );
  }

  private visibleLines(): string[] {
    return this.visibleText()
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
}
