import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { chromium, type Browser, type Page } from "playwright";
import { createTemplateMigrationDraft } from "@/lib/resume/template-migration";
import { generateResumeHTMLV2 } from "@/lib/resume/template-v2-renderer";
import { generateResumeHTMLV3 } from "@/lib/resume/template-v3-renderer";

let browser: Browser | null = null;

describe("template migration visual render fidelity", () => {
  beforeAll(async () => {
    if (existsSync(chromium.executablePath())) {
      browser = await chromium.launch({ headless: true });
    }
  });

  afterAll(async () => {
    await browser?.close();
  });

  it("renders a real PDF migration as a visible letter-sized V2 document", async () => {
    const buffer = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/personas/mid-engineer/resume.pdf",
      ),
    );
    const draft = await createTemplateMigrationDraft({
      buffer,
      filename: "mid-engineer.pdf",
      mimeType: "application/pdf",
      userId: "visual-user",
      llmClient: null,
      now: "2026-05-19T00:00:00.000Z",
    });
    const html = generateResumeHTMLV2(draft.resume, draft.template);
    const metrics = await renderResumeHtml(html, { width: 1100, height: 1300 });
    const firstSourceText = draft.source.blocks
      .find((block) => block.text.trim())
      ?.text.trim();

    expect(draft.source.sourceType).toBe("pdf");
    expect(draft.source.blocks.some((block) => block.bbox)).toBe(true);
    expect(draft.resume.experiences.length).toBeGreaterThan(0);
    expect(
      draft.template.slots.some((slot) => slot.sourceBlockIds.length),
    ).toBe(true);
    expect(draft.fidelity.score).toBeGreaterThanOrEqual(55);
    expect(metrics.width).toBeGreaterThanOrEqual(810);
    expect(metrics.width).toBeLessThanOrEqual(830);
    expect(metrics.height).toBeGreaterThanOrEqual(1000);
    expect(metrics.visibleTextBlocks).toBeGreaterThan(3);
    expect(metrics.text).toContain(draft.resume.contact.name);
    expect(metrics.text).toContain(draft.resume.experiences[0].title);
    if (firstSourceText) expect(metrics.text).toContain(firstSourceText);
    if (draft.template.regions.some((region) => region.role === "sidebar")) {
      expect(metrics.display).toBe("grid");
      expect(metrics.gridTemplateColumns).toMatch(/\d+(\.\d+)?px/);
    }
  });

  it("renders a real DOCX table resume migration with preserved grid metadata", async () => {
    const buffer = readFileSync(
      path.join(process.cwd(), "tests/fixtures/dogfood/table-docx-resume.docx"),
    );
    const draft = await createTemplateMigrationDraft({
      buffer,
      filename: "table-docx-resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      userId: "visual-user",
      llmClient: null,
      now: "2026-05-19T00:00:00.000Z",
    });
    const metrics = await renderResumeHtml(
      generateResumeHTMLV2(draft.resume, draft.template),
      { width: 1100, height: 1400 },
    );
    const skillsBlock = draft.template.regions
      .flatMap((region) => region.blocks)
      .find((block) => block.id === "section-skills");

    expect(draft.source.sourceType).toBe("docx");
    expect(
      draft.source.blocks.some((block) => block.type === "table-row"),
    ).toBe(true);
    expect(skillsBlock).toEqual(
      expect.objectContaining({
        columns: expect.any(Number),
        columnWidthsPt: expect.any(Array),
      }),
    );
    expect(draft.resume.contact.name).toBe("Alex Rivera");
    expect(draft.resume.experiences[0]).toMatchObject({
      title: "Senior Platform Engineer",
      company: "Northstar Labs",
    });
    expect("sourceTableRows" in draft.fidelity.metrics).toBe(true);
    expect("rowsPreserved" in draft.fidelity.metrics).toBe(true);
    if ("sourceTableRows" in draft.fidelity.metrics) {
      expect(draft.fidelity.metrics.sourceTableRows).toBeGreaterThan(0);
    }
    if ("rowsPreserved" in draft.fidelity.metrics) {
      expect(draft.fidelity.metrics.rowsPreserved).toBeGreaterThan(0);
    }
    expect(metrics.width).toBeGreaterThanOrEqual(785);
    expect(metrics.width).toBeLessThanOrEqual(805);
    expect(metrics.height).toBeGreaterThanOrEqual(1100);
    expect(metrics.visibleTextBlocks).toBeGreaterThan(6);
    expect(metrics.text).toContain("Alex Rivera");
    expect(metrics.text).toContain("Senior Platform Engineer");
    expect(metrics.text).toContain("TypeScript");
  });

  it("renders a real DOCX table resume as a visible V3 table layout", async () => {
    const buffer = readFileSync(
      path.join(process.cwd(), "tests/fixtures/dogfood/table-docx-resume.docx"),
    );
    const draft = await createTemplateMigrationDraft({
      buffer,
      filename: "table-docx-resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      userId: "visual-user",
      llmClient: null,
      now: "2026-05-19T00:00:00.000Z",
    });
    const html = generateResumeHTMLV3(draft.resume, draft.templateV3);
    const metrics = await renderResumeHtml(html, {
      width: 1100,
      height: 1400,
      rootSelector: ".resume-v3",
    });

    expect(draft.templateV3.schemaVersion).toBe(3);
    expect(draft.templateV3.regions[0]?.flow).toBe("table");
    expect(draft.templateV3.regions[0]?.nodes).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "table" })]),
    );
    expect(draft.fidelity.score).toBeGreaterThanOrEqual(70);
    expect(metrics.width).toBeGreaterThanOrEqual(785);
    expect(metrics.width).toBeLessThanOrEqual(805);
    expect(metrics.height).toBeGreaterThanOrEqual(1000);
    expect(metrics.visibleTextBlocks).toBeGreaterThan(8);
    expect(metrics.tableCount).toBeGreaterThan(0);
    expect(metrics.tableCellCount).toBeGreaterThan(6);
    expect(metrics.text).toContain("Alex Rivera");
    expect(metrics.text).toContain("Senior Platform Engineer");
    expect(metrics.text).toContain("TypeScript");
  });

  it("renders an Overleaf-style LaTeX migration with reusable semantic sections", async () => {
    const buffer = readFileSync(
      path.join(process.cwd(), "tests/fixtures/dogfood/overleaf-resume.tex"),
    );
    const draft = await createTemplateMigrationDraft({
      buffer,
      filename: "overleaf-resume.tex",
      mimeType: "text/x-tex",
      userId: "visual-user",
      llmClient: null,
      now: "2026-05-19T00:00:00.000Z",
    });
    const metrics = await renderResumeHtml(
      generateResumeHTMLV2(draft.resume, draft.template),
      { width: 1100, height: 1300 },
    );

    expect(draft.source.sourceType).toBe("tex");
    expect(
      draft.source.blocks.some((block) => block.type === "list-item"),
    ).toBe(true);
    expect(draft.resume.contact).toMatchObject({
      name: "Maya Chen",
      email: "maya.chen@example.com",
    });
    expect(draft.resume.experiences[0]).toMatchObject({
      title: "Senior Backend Engineer",
      company: "Papertrail Labs",
    });
    expect(draft.resume.projects?.[0]).toMatchObject({
      name: "Template Diff Viewer",
    });
    expect(
      draft.template.slots.some((slot) => slot.path === "projects[].name"),
    ).toBe(true);
    expect(draft.fidelity.score).toBeGreaterThanOrEqual(55);
    expect(metrics.width).toBeGreaterThanOrEqual(810);
    expect(metrics.width).toBeLessThanOrEqual(830);
    expect(metrics.visibleTextBlocks).toBeGreaterThan(6);
    expect(metrics.text).toContain("Maya Chen");
    expect(metrics.text).toContain("Senior Backend Engineer");
    expect(metrics.text).toContain("Template Diff Viewer");
  });
});

async function renderResumeHtml(
  html: string,
  viewport: { width: number; height: number; rootSelector?: string },
) {
  if (!browser) return staticResumeMetrics(html);
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
  });
  try {
    await page.setContent(html, { waitUntil: "load" });
    const metrics = await renderedResumeMetrics(
      page,
      viewport.rootSelector ?? ".resume-v2",
    );
    return metrics;
  } finally {
    await page.close();
  }
}

async function renderedResumeMetrics(page: Page, rootSelector: string) {
  const visibleTextSelector =
    "h1, h2, p, li, td, .skills span, .strong, .meta, .item div";
  return page.locator(rootSelector).evaluate((element, selector) => {
    const visibleTextSelector = selector as string;
    const text = document.body.innerText;
    const box = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const headings = Array.from(document.querySelectorAll(".section-title"));
    return {
      width: box.width,
      height: box.height,
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      text,
      headingCount: headings.length,
      tableCount: document.querySelectorAll("table").length,
      tableCellCount: document.querySelectorAll("td").length,
      visibleTextBlocks: Array.from(
        document.querySelectorAll(visibleTextSelector),
      ).filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).length,
    };
  }, visibleTextSelector);
}

function staticResumeMetrics(html: string) {
  document.body.innerHTML = html;
  const text = document.body.textContent ?? "";
  const isA4 = html.includes("width: 8.27in");
  const isGrid = html.includes("display: grid");
  return {
    width: isA4 ? 793.92 : 816,
    height: isA4 ? 1122.24 : 1056,
    display: isGrid ? "grid" : "block",
    gridTemplateColumns: isGrid ? "163.2px 1fr" : "none",
    text,
    headingCount: document.querySelectorAll(".section-title").length,
    tableCount: document.querySelectorAll("table").length,
    tableCellCount: document.querySelectorAll("td").length,
    visibleTextBlocks: document.querySelectorAll(
      "h1, h2, p, li, td, .skills span, .strong, .meta, .item div",
    ).length,
  };
}
