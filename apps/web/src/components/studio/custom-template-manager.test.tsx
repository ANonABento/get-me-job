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

  it("imports a Studio template and shows source, confidence, and warnings", async () => {
    const onTemplatesChanged = vi.fn();
    const onTemplateImported = vi.fn();
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/import") {
          return Response.json({
            template: {
              id: "custom-tex",
              name: "Resume Template",
              sourceFilename: "resume.tex",
              sourceType: "tex",
            },
            warnings: ["Used defaults for page size."],
            confidence: "medium",
            sectionsFound: ["experience"],
          });
        }
        return Response.json({
          templates: [
            {
              id: "custom-tex",
              name: "Resume Template",
              description: "Imported from TEX",
              type: "custom",
              sourceFilename: "resume.tex",
              sourceType: "tex",
            },
          ],
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    renderDialog({
      onTemplatesChanged,
      onTemplateImported,
    });

    const input =
      document.querySelector<HTMLInputElement>("input[type='file']");
    expect(input).not.toBeNull();
    fireEvent.change(input!, {
      target: {
        files: [
          new File(["\\documentclass{article}"], "resume.tex", {
            type: "text/x-tex",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText("Resume Template").length).toBeGreaterThan(0);
      expect(screen.getByText("medium confidence")).toBeInTheDocument();
      expect(screen.getByText("resume.tex (TEX)")).toBeInTheDocument();
      expect(
        screen.getByText("Used defaults for page size."),
      ).toBeInTheDocument();
    });
    await waitFor(() => expect(onTemplatesChanged).toHaveBeenCalled());
    expect(onTemplateImported).toHaveBeenCalledWith("custom-tex");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/import",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });

  it("shows migration source geometry and rendered preview", async () => {
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
        if (url === "/api/templates/v2/preview") {
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
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    renderDialog();

    const inputs =
      document.querySelectorAll<HTMLInputElement>("input[type='file']");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(inputs[1], {
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
      expect(screen.getByText("Source layout")).toBeInTheDocument();
      expect(screen.getByText("Rendered preview")).toBeInTheDocument();
      expect(screen.getByText("Fidelity")).toBeInTheDocument();
      expect(screen.getByText("86% ready")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByTitle("Migrated template preview"),
      ).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/v2/preview",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      screen.getByLabelText("Select source block Jane Rivera"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Name").length).toBeGreaterThan(1);
    expect(screen.getByText("DOCX")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Skills | PDF | DOCX"));
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

  it("commits a reviewed migration and selects the saved V2 template", async () => {
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
      if (url === "/api/templates/v2/preview") {
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
    fireEvent.change(inputs[1], {
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
      screen.getByRole("button", { name: "Save migrated template" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1/commit",
        expect.objectContaining({ method: "POST" }),
      );
    });
    await waitFor(() => expect(onTemplatesChanged).toHaveBeenCalled());
    expect(onTemplateImported).toHaveBeenCalledWith("template-1");
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
