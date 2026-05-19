import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast";
import { CustomTemplateManagerDialog } from "./custom-template-manager";

function renderDialog(
  props: Partial<React.ComponentProps<typeof CustomTemplateManagerDialog>> = {},
) {
  return render(
    <ToastProvider>
      <CustomTemplateManagerDialog
        open
        onOpenChange={() => undefined}
        onTemplatesChanged={() => undefined}
        {...props}
      />
    </ToastProvider>,
  );
}

describe("CustomTemplateManagerDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows layout source geometry and rendered preview", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: ["PDF text positions were used."],
            confidence: "high",
          });
        }
        if (url === "/api/templates/v3/preview") {
          return Response.json({
            html: "<html><body><article>Rendered migrated resume</article></body></html>",
            pdfOptions: { format: "Letter" },
          });
        }
        if (url === "/api/templates/migrations/draft-1") {
          const body = JSON.parse(
            String((init as RequestInit | undefined)?.body),
          );
          const next = migrationDraft();
          next.source.blocks = next.source.blocks.map((block) =>
            block.id === body.slotCorrections?.[0]?.sourceBlockId
              ? { ...block, slotHint: body.slotCorrections[0].path }
              : block,
          );
          if (body.templateV3) next.templateV3 = body.templateV3;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    renderDialog();

    const inputs =
      document.querySelectorAll<HTMLInputElement>("input[type='file']");
    expect(inputs.length).toBe(1);
    fireEvent.change(inputs[0], {
      target: {
        files: [
          new File(["%PDF-1.7"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
      expect(screen.getByText("Rendered preview")).toBeInTheDocument();
      expect(screen.getByText("Ready to save")).toBeInTheDocument();
      expect(screen.getByText("Style captured")).toBeInTheDocument();
      expect(screen.getByText("Detected structure")).toBeInTheDocument();
      expect(screen.getByText("Outer table")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Original" }));
    expect(screen.getByText("Source layout")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTitle("Visual template preview")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/v3/preview",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      screen.getByLabelText("Select source block Jane Rivera"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Name").length).toBeGreaterThan(0);
    expect(screen.getByText("DOCX")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Skills | PDF | DOCX"));
    fireEvent.click(screen.getByRole("button", { name: "Structure" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark repeat" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"id":"repeat-custom"'),
        }),
      );
    });
    fireEvent.change(
      screen.getByLabelText("Collection for repeat-experiences"),
      {
        target: { value: "projects" },
      },
    );
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"collection":"projects"'),
        }),
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "Skills" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"path":"skills[]"'),
        }),
      );
    });
  });

  it("commits a reviewed visual template without importing resume content", async () => {
    const onTemplatesChanged = vi.fn();
    const onTemplateImported = vi.fn();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/templates/migrate") {
        return Response.json({
          draft: migrationDraft(),
          warnings: ["PDF text positions were used."],
          confidence: "high",
        });
      }
      if (url === "/api/templates/v3/preview") {
        return Response.json({
          html: "<html><body><article>Rendered migrated resume</article></body></html>",
          pdfOptions: { format: "Letter" },
        });
      }
      if (url === "/api/templates/migrations/draft-1") {
        return Response.json({ draft: migrationDraft() });
      }
      if (url === "/api/templates/migrations/draft-1/commit") {
        return Response.json({ template: { id: "template-1" } });
      }
      return Response.json({
        templates: [
          {
            id: "template-1",
            name: "Migrated",
            description: "Migrated from resume.pdf",
            type: "custom",
            schemaVersion: 2,
            sourceFilename: "resume.pdf",
            sourceType: "pdf",
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDialog({ onTemplatesChanged, onTemplateImported });

    const inputs =
      document.querySelectorAll<HTMLInputElement>("input[type='file']");
    fireEvent.change(inputs[0], {
      target: {
        files: [
          new File(["%PDF-1.7"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save visual template" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1/commit",
        expect.objectContaining({ method: "POST" }),
      );
    });
    await waitFor(() => expect(onTemplatesChanged).toHaveBeenCalled());
    expect(onTemplateImported).not.toHaveBeenCalled();
  });

  it("blocks saving a low-fidelity visual template", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/templates/migrate") {
        return Response.json({
          draft: lowFidelityMigrationDraft(),
          warnings: [],
          confidence: "low",
        });
      }
      if (url === "/api/templates/v3/preview") {
        return Response.json({
          html: "<html><body><article>Partial preview</article></body></html>",
          pdfOptions: { format: "Letter" },
        });
      }
      return Response.json({ templates: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDialog();

    const inputs =
      document.querySelectorAll<HTMLInputElement>("input[type='file']");
    fireEvent.change(inputs[0], {
      target: {
        files: [
          new File(["%PDF-1.7"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Cannot save yet")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.",
        ),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: "Save visual template" }),
    ).toBeDisabled();
  });
});

function migrationDraft() {
  return {
    id: "draft-1",
    status: "reviewing",
    sourceFilename: "resume.pdf",
    sourceType: "pdf",
    source: {
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      blocks: [
        {
          id: "block-1",
          pageId: "page-1",
          type: "paragraph",
          text: "Jane Rivera",
          slotHint: "contact.name",
          bbox: { xPt: 72, yPt: 48, widthPt: 120, heightPt: 14 },
        },
        {
          id: "block-2",
          pageId: "page-1",
          type: "table-row",
          text: "Skills | PDF | DOCX",
          cells: ["Skills", "PDF", "DOCX"],
          bbox: { xPt: 72, yPt: 100, widthPt: 100, heightPt: 12 },
        },
      ],
    },
    resume: {
      contact: { name: "Jane Rivera", email: "jane@example.com" },
      summary: "Document migration engineer.",
      experiences: [
        {
          title: "Staff Engineer",
          company: "Northstar Systems",
          dates: "2021 - Present",
          highlights: ["Built template migration review tools."],
        },
      ],
      skills: ["PDF", "DOCX", "LaTeX"],
      education: [],
      projects: [],
      certifications: [],
      awards: [],
    },
    template: {
      schemaVersion: 2,
      id: "template-1",
      name: "Migrated",
      page: {
        size: "letter",
        margins: {
          top: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
          right: "0.5in",
        },
      },
      tokens: {
        name: { fontFamily: "Inter", fontSize: "20pt", lineHeight: "1.2" },
        heading: { fontFamily: "Inter", fontSize: "12pt", lineHeight: "1.2" },
        body: { fontFamily: "Inter", fontSize: "11pt", lineHeight: "1.4" },
        "body-strong": {
          fontFamily: "Inter",
          fontSize: "11pt",
          lineHeight: "1.4",
        },
        meta: { fontFamily: "Inter", fontSize: "10pt", lineHeight: "1.4" },
      },
      regions: [],
      slots: [],
      diagnostics: [],
    },
    templateV3: {
      schemaVersion: 3,
      id: "template-v3",
      name: "Migrated",
      page: {
        size: "letter",
        widthPt: 612,
        heightPt: 792,
        margins: { top: "36pt", right: "36pt", bottom: "36pt", left: "36pt" },
      },
      tokens: {
        body: { fontFamily: "Inter", fontSize: "11pt", lineHeight: "1.4" },
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
              columns: [{ widthPt: 180 }, { widthPt: 180 }, { widthPt: 180 }],
              rows: [
                {
                  kind: "row",
                  id: "row-block-1",
                  cells: [
                    {
                      kind: "cell",
                      id: "cell-name",
                      nodes: [
                        {
                          kind: "slot",
                          id: "node-name",
                          slotId: "slot-contact-name",
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: "row",
                  id: "row-block-2",
                  repeatGroupId: "repeat-experiences",
                  cells: [
                    {
                      kind: "cell",
                      id: "cell-skills",
                      nodes: [
                        {
                          kind: "list",
                          id: "node-skills",
                          slotId: "slot-skills",
                          items: ["PDF", "DOCX"],
                          marker: "disc",
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
          id: "slot-contact-name",
          path: "contact.name",
          role: "text",
          sourceRefs: [{ sourceId: "block-1" }],
          fallback: "Jane Rivera",
        },
        {
          id: "slot-skills",
          path: "skills[]",
          role: "list",
          sourceRefs: [{ sourceId: "block-2" }],
          fallback: "PDF",
        },
      ],
      repeatGroups: [
        {
          id: "repeat-experiences",
          collection: "experiences",
          nodeIds: ["row-block-2"],
          emptyBehavior: "hide",
          sourceRefs: [{ sourceId: "block-2" }],
        },
      ],
      diagnostics: [],
    },
    fidelity: {
      score: 86,
      status: "ready",
      checks: [
        {
          id: "geometry",
          label: "Source geometry",
          score: 1,
          passed: true,
          detail: "All source blocks have bounding boxes.",
        },
        {
          id: "slots",
          label: "Semantic slots",
          score: 0.9,
          passed: true,
          detail: "Semantic slots are linked.",
        },
      ],
    },
    warnings: ["PDF text positions were used."],
    confidence: "high",
  };
}

function lowFidelityMigrationDraft() {
  return {
    ...migrationDraft(),
    templateV3: {
      schemaVersion: 3,
      id: "template-v3",
      name: "Low fidelity visual template",
      source: { filename: "resume.pdf", type: "pdf" },
      page: {
        size: "letter",
        widthPt: 0,
        heightPt: 0,
        margins: { top: "0pt", right: "0pt", bottom: "0pt", left: "0pt" },
      },
      tokens: {},
      regions: [],
      slots: [],
      repeatGroups: [],
      diagnostics: [],
    },
    fidelity: {
      score: 28,
      status: "low",
      checks: [
        {
          id: "preview_renderable",
          label: "Renderable structure",
          score: 0,
          passed: false,
          detail: "The template includes regions and renderable nodes.",
        },
      ],
    },
  };
}
