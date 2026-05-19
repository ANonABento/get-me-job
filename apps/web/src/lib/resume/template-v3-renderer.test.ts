import { describe, expect, it } from "vitest";
import {
  generateDocumentTemplateV3CSS,
  generateResumeHTMLV3,
} from "@/lib/resume/template-v3-renderer";
import type { TailoredResume } from "@/lib/resume/generator";
import type { DocumentTemplateV3 } from "@/lib/resume/template-v3";

describe("DocumentTemplateV3 renderer", () => {
  it("renders table columns, cells, borders, padding, fills, and slots", () => {
    const html = generateResumeHTMLV3(sampleResume, sampleTemplate);
    const css = generateDocumentTemplateV3CSS(sampleTemplate);

    expect(html).toContain('<table class="v3-table"');
    expect(html).toContain('<col style="width:300pt"');
    expect(html).toContain("margin-left:auto;margin-right:auto");
    expect(html).toContain("border-bottom:0.75pt solid #111827");
    expect(html).toContain("border-left:0.5pt dotted #94A3B8");
    expect(html).toContain("border-top:0.5pt solid #CBD5E1");
    expect(html).toContain("padding:3pt 6pt 3pt 6pt");
    expect(html).toContain("background:#E5E7EB");
    expect(html).toContain("Mara Voss");
    expect(html).toContain("2023 - Present");
    expect(css).toContain(".v3-table { width: 100%; border-collapse: collapse");
  });

  it("repeats contiguous table row groups per collection item", () => {
    const html = generateResumeHTMLV3(
      {
        ...sampleResume,
        experiences: [
          {
            title: "Senior Product Engineer",
            company: "Northstar Labs",
            dates: "2023 - Present",
            highlights: ["Preserved table layouts."],
          },
          {
            title: "Frontend Engineer",
            company: "Fieldwire Systems",
            dates: "2020 - 2023",
            highlights: ["Rendered row groups in order."],
          },
        ],
      },
      repeatTemplate,
    );

    const firstTitle = html.indexOf("Senior Product Engineer");
    const firstBullet = html.indexOf("Preserved table layouts.");
    const secondTitle = html.indexOf("Frontend Engineer");
    const secondBullet = html.indexOf("Rendered row groups in order.");
    expect(firstTitle).toBeGreaterThan(-1);
    expect(firstTitle).toBeLessThan(firstBullet);
    expect(firstBullet).toBeLessThan(secondTitle);
    expect(secondTitle).toBeLessThan(secondBullet);
    expect(html).toContain("line-height:1.1");
    expect(html).toContain("font-style:italic");
    expect(html).toContain("marker-decimal");
  });

  it("does not reuse slot-level fallbacks for missing collection occurrences", () => {
    const html = generateResumeHTMLV3(
      {
        ...sampleResume,
        experiences: [
          {
            title: "Engineer",
            company: "Lab",
            dates: "2026",
            highlights: ["Only real highlight"],
          },
        ],
      },
      occurrenceFallbackTemplate,
    );

    expect(html).toContain("Only real highlight");
    expect(html).toContain("Original second line");
    expect(html).not.toContain("Original first line");
  });
});

const sampleResume: TailoredResume = {
  contact: {
    name: "Mara Voss",
    email: "mara@example.com",
    phone: "+1 (416) 847-1928",
  },
  summary: "",
  experiences: [
    {
      title: "Senior Product Engineer",
      company: "Northstar Labs",
      dates: "2023 - Present",
      highlights: ["Preserved table layouts."],
    },
  ],
  skills: [],
  education: [],
};

const sampleTemplate: DocumentTemplateV3 = {
  schemaVersion: 3,
  id: "template-v3",
  name: "Table Template",
  page: {
    size: "letter",
    widthPt: 612,
    heightPt: 792,
    margins: { top: "36pt", right: "36pt", bottom: "36pt", left: "36pt" },
  },
  tokens: {
    body: { fontFamily: "Aptos", fontSize: "10pt", lineHeight: "1.25" },
    name: {
      fontFamily: "Aptos Display",
      fontSize: "20pt",
      lineHeight: "1.1",
      fontWeight: "700",
    },
  },
  regions: [
    {
      id: "region-page-frame",
      role: "page-frame",
      flow: "table",
      nodes: [
        {
          kind: "table",
          id: "table-1",
          alignment: "center",
          borders: {
            insideV: { widthPt: 0.5, style: "dotted", color: "#94A3B8" },
            insideH: { widthPt: 0.5, style: "solid", color: "#CBD5E1" },
          },
          columns: [{ widthPt: 300 }, { widthPt: 180 }],
          rows: [
            {
              kind: "row",
              id: "row-header",
              cells: [
                {
                  kind: "cell",
                  id: "cell-name",
                  padding: {
                    top: "3pt",
                    right: "6pt",
                    bottom: "3pt",
                    left: "6pt",
                  },
                  fill: { color: "#E5E7EB" },
                  borders: {
                    bottom: {
                      widthPt: 0.75,
                      style: "solid",
                      color: "#111827",
                    },
                  },
                  nodes: [
                    {
                      kind: "slot",
                      id: "node-name",
                      slotId: "slot-name",
                    },
                  ],
                },
                {
                  kind: "cell",
                  id: "cell-date",
                  textAlign: "right",
                  nodes: [
                    {
                      kind: "slot",
                      id: "node-dates",
                      slotId: "slot-dates",
                    },
                  ],
                },
              ],
            },
            {
              kind: "row",
              id: "row-summary",
              cells: [
                {
                  kind: "cell",
                  id: "cell-summary-label",
                  nodes: [
                    {
                      kind: "text",
                      id: "summary-label",
                      text: "Summary",
                      token: "body",
                    },
                  ],
                },
                {
                  kind: "cell",
                  id: "cell-summary-value",
                  nodes: [
                    {
                      kind: "text",
                      id: "summary-value",
                      text: "Grid rules preserved",
                      token: "body",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  slots: [
    {
      id: "slot-name",
      path: "contact.name",
      role: "text",
      token: "name",
      sourceRefs: [{ sourceId: "block-1" }],
    },
    {
      id: "slot-dates",
      path: "experiences[].dates",
      role: "metadata",
      token: "body",
      sourceRefs: [{ sourceId: "block-2" }],
    },
  ],
  repeatGroups: [],
  diagnostics: [],
};

const repeatTemplate: DocumentTemplateV3 = {
  ...sampleTemplate,
  regions: [
    {
      id: "region-page-frame",
      role: "page-frame",
      flow: "table",
      nodes: [
        {
          kind: "table",
          id: "table-repeat",
          columns: [{ widthPt: 300 }, { widthPt: 180 }],
          rows: [
            {
              kind: "row",
              id: "row-experience-head",
              repeatGroupId: "repeat-experiences",
              cells: [
                {
                  kind: "cell",
                  id: "cell-title",
                  nodes: [
                    {
                      kind: "slot",
                      id: "node-title",
                      slotId: "slot-experience-title",
                    },
                  ],
                },
                {
                  kind: "cell",
                  id: "cell-dates",
                  textAlign: "right",
                  nodes: [
                    {
                      kind: "slot",
                      id: "node-exp-dates",
                      slotId: "slot-experience-dates",
                    },
                  ],
                },
              ],
            },
            {
              kind: "row",
              id: "row-experience-bullets",
              repeatGroupId: "repeat-experiences",
              cells: [
                {
                  kind: "cell",
                  id: "cell-bullets",
                  colSpan: 2,
                  nodes: [
                    {
                      kind: "list",
                      id: "node-highlights",
                      slotId: "slot-experience-highlights",
                      items: [],
                      marker: "decimal",
                      style: {
                        lineHeight: "1.1",
                        fontStyle: "italic",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  slots: [
    ...sampleTemplate.slots,
    {
      id: "slot-experience-title",
      path: "experiences[].title",
      role: "text",
      sourceRefs: [{ sourceId: "block-3" }],
    },
    {
      id: "slot-experience-dates",
      path: "experiences[].dates",
      role: "metadata",
      sourceRefs: [{ sourceId: "block-4" }],
    },
    {
      id: "slot-experience-highlights",
      path: "experiences[].highlights[]",
      role: "list",
      sourceRefs: [{ sourceId: "block-5" }],
    },
  ],
  repeatGroups: [
    {
      id: "repeat-experiences",
      collection: "experiences",
      nodeIds: ["row-experience-head", "row-experience-bullets"],
      emptyBehavior: "hide",
      sourceRefs: [{ sourceId: "block-3" }, { sourceId: "block-5" }],
    },
  ],
};

const occurrenceFallbackTemplate: DocumentTemplateV3 = {
  ...sampleTemplate,
  regions: [
    {
      id: "region-page-frame",
      role: "page-frame",
      flow: "block",
      nodes: [
        {
          kind: "slot",
          id: "highlight-1",
          slotId: "slot-highlights",
          slotOccurrence: 0,
          fallback: "Original first line",
        },
        {
          kind: "slot",
          id: "highlight-2",
          slotId: "slot-highlights",
          slotOccurrence: 5,
          fallback: "Original second line",
        },
      ],
    },
  ],
  slots: [
    {
      id: "slot-highlights",
      path: "experiences[].highlights[]",
      role: "list",
      sourceRefs: [
        { sourceId: "block-1", text: "Original first line" },
        { sourceId: "block-2", text: "Original second line" },
      ],
      fallback: "Original first line",
    },
  ],
  repeatGroups: [],
};
