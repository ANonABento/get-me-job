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
      expect(screen.getAllByText("Reusable render").length).toBeGreaterThan(0);
      expect(screen.getByText("Ready to save")).toBeInTheDocument();
      expect(screen.getByText("Style captured")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    expect(screen.getByText("Semantic tree")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Built migration tooling.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Style Tokens" }));
    expect(screen.getByText("Style tokens")).toBeInTheDocument();
    expect(screen.getByText("Reusable components")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mismatch Report" }));
    expect(screen.getByText("Mismatch report")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Structure" }));
    expect(screen.getByText("Detected structure")).toBeInTheDocument();
    expect(screen.getByText("Outer table")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
    expect(screen.getByText("Source layout")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Select source block Jane Rivera"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Name").length).toBeGreaterThan(0);
    expect(screen.getByText("DOCX")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Visual Evidence" }));
    expect(screen.getByText("Visual evidence render")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTitle("Visual evidence render")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/v3/preview",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
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

  it("selects a saved reusable template without importing source resume content", async () => {
    const onOpenChange = vi.fn();
    const onTemplateSelected = vi.fn();
    const onTemplateImported = vi.fn();
    const fetchMock = vi.fn(async () =>
      Response.json({
        templates: [
          {
            id: "saved-v4-template",
            name: "Saved V4",
            description: "Reusable imported template",
            type: "custom",
            schemaVersion: 4,
            sourceFilename: "resume.docx",
            sourceType: "docx",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderDialog({
      onOpenChange,
      onTemplateImported,
      onTemplateSelected,
    });

    await waitFor(() => {
      expect(screen.getByText("Saved V4")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Use" }));

    expect(onTemplateSelected).toHaveBeenCalledWith("saved-v4-template");
    expect(onTemplateImported).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
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

  it("does not block saving when reusable V4 artifacts exist with weak V3 evidence", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/templates/migrate") {
        return Response.json({
          draft: {
            ...lowFidelityMigrationDraft(),
            confidence: "low",
            reusableTemplate: migrationDraft().reusableTemplate,
            reusableHtml: migrationDraft().reusableHtml,
          },
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
      expect(screen.getByText("Review carefully")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save visual template" }),
    ).not.toBeDisabled();
  });

  it("lets reviewers correct semantic section mappings and regenerate reusable artifacts", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          next.semanticResume = body.semanticResume;
          next.reusableTemplate = {
            ...next.reusableTemplate,
            sectionOrder: body.semanticResume.sections.map(
              (section: { type: string }) => section.type,
            ),
          };
          next.reusableHtml =
            "<html><body><article><h1>Jane Rivera</h1><h2>Projects</h2></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.change(screen.getByLabelText("Title for section-experience"), {
      target: { value: "Projects" },
    });
    fireEvent.change(screen.getByLabelText("Type for section-experience"), {
      target: { value: "projects" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"type":"projects"'),
        }),
      );
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/migrations/draft-1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"title":"Projects"'),
      }),
    );
  });

  it("lets reviewers reorder semantic sections and regenerate reusable artifacts", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraft();
          draft.semanticResume.sections = [
            draft.semanticResume.sections[0],
            {
              id: "section-skills",
              type: "skills",
              title: "Skills",
              confidence: 0.9,
              evidenceRefs: ["block-2"],
              items: [
                {
                  primary: "PDF, DOCX, LaTeX",
                  secondary: "",
                  dateRange: "",
                  meta: [],
                  bullets: [],
                  confidence: 0.86,
                  evidenceRefs: ["block-2"],
                },
              ],
            },
          ];
          draft.reusableTemplate.sectionOrder = ["experience", "skills"];
          return Response.json({
            draft,
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          next.reusableTemplate = {
            ...next.reusableTemplate,
            sectionOrder: body.semanticResume.sections.map(
              (section: { type: string }) => section.type,
            ),
          };
          next.reusableHtml =
            "<html><body><article><h2>Skills</h2><h2>Experience</h2></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Move Skills section up" }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(
        latest.semanticResume.sections.map(
          (section: { type: string }) => section.type,
        ),
      ).toEqual(["skills", "experience"]);
    });
  });

  it("lets reviewers drag semantic sections to reorder reusable artifacts", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraft();
          draft.semanticResume.sections = [
            draft.semanticResume.sections[0],
            {
              id: "section-skills",
              type: "skills",
              title: "Skills",
              confidence: 0.9,
              evidenceRefs: ["block-2"],
              items: [
                {
                  primary: "PDF, DOCX, LaTeX",
                  secondary: "",
                  dateRange: "",
                  meta: [],
                  bullets: [],
                  confidence: 0.86,
                  evidenceRefs: ["block-2"],
                },
              ],
            },
          ];
          draft.reusableTemplate.sectionOrder = ["experience", "skills"];
          return Response.json({
            draft,
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          next.reusableTemplate = {
            ...next.reusableTemplate,
            sectionOrder: body.semanticResume.sections.map(
              (section: { type: string }) => section.type,
            ),
          };
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));

    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    };
    fireEvent.dragStart(screen.getByLabelText("Semantic section Experience"), {
      dataTransfer,
    });
    fireEvent.dragOver(screen.getByLabelText("Semantic section Skills"), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByLabelText("Semantic section Skills"), {
      dataTransfer,
    });

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(
        latest.semanticResume.sections.map(
          (section: { type: string }) => section.type,
        ),
      ).toEqual(["skills", "experience"]);
    });
  });

  it("lets reviewers override style tokens before saving", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          next.styleTokens = body.styleTokens;
          next.reusableHtml =
            '<html><body><article style="color:#123456">Reusable render</article></body></html>';
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Style Tokens" }));
    fireEvent.change(screen.getByLabelText("Accent color"), {
      target: { value: "#123456" },
    });
    fireEvent.change(screen.getByLabelText("Body font"), {
      target: { value: "Georgia, serif" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply style overrides" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/migrations/draft-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"#123456"'),
        }),
      );
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/migrations/draft-1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("Georgia, serif"),
      }),
    );
  });

  it("lets reviewers reset style tokens to inferred values", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.styleTokens = {
            ...next.styleTokens,
            color: {
              ...next.styleTokens.color,
              body: { value: "#111111" },
              accent: {
                ...next.styleTokens.color.accent,
                value: "#2563eb",
              },
            },
          };
          next.reusableHtml =
            '<html><body><article style="color:#2563eb">Reusable render</article></body></html>';
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Style Tokens" }));
    fireEvent.change(screen.getByLabelText("Accent color"), {
      target: { value: "#123456" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Reset to inferred style" }),
    );

    await waitFor(() => {
      expect(patchBodies.at(-1)).toEqual({ resetStyleTokens: true });
    });
    expect(screen.getByLabelText("Accent color")).toHaveValue("#2563eb");
  });

  it("lets reviewers choose inferred style token candidates", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.styleTokens = body.styleTokens;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Style Tokens" }));
    fireEvent.change(screen.getByLabelText("Accent color candidate"), {
      target: { value: "#0f766e" },
    });
    fireEvent.change(screen.getByLabelText("Body typography candidate"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Name typography candidate"), {
      target: { value: "1" },
    });
    fireEvent.change(
      screen.getByLabelText("Section heading typography candidate"),
      {
        target: { value: "1" },
      },
    );
    fireEvent.change(screen.getByLabelText("Section heading font size"), {
      target: { value: "13" },
    });
    fireEvent.change(
      screen.getByLabelText("Entry title typography candidate"),
      {
        target: { value: "1" },
      },
    );
    fireEvent.change(screen.getByLabelText("Entry title font size"), {
      target: { value: "10.5" },
    });
    fireEvent.change(screen.getByLabelText("Metadata typography candidate"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Metadata font size"), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText("Section divider width candidate"), {
      target: { value: "1.25" },
    });
    fireEvent.change(screen.getByLabelText("Section gap candidate"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("Header layout"), {
      target: { value: "stacked" },
    });
    fireEvent.change(screen.getByLabelText("Date layout"), {
      target: { value: "below" },
    });
    fireEvent.change(screen.getByLabelText("Section title layout"), {
      target: { value: "left-rail" },
    });
    fireEvent.change(screen.getByLabelText("Layout columns candidate"), {
      target: { value: "2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply style overrides" }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.styleTokens.color.accent.value).toBe("#0f766e");
      expect(latest.styleTokens.typography.body.fontFamily).toBe(
        "Georgia, serif",
      );
      expect(latest.styleTokens.typography.body.fontSizePt).toBe(11);
      expect(latest.styleTokens.typography.name.fontFamily).toBe(
        "Aptos Display, sans-serif",
      );
      expect(latest.styleTokens.typography.name.fontSizePt).toBe(24);
      expect(latest.styleTokens.typography.sectionHeading.fontFamily).toBe(
        "Aptos, sans-serif",
      );
      expect(latest.styleTokens.typography.sectionHeading.fontSizePt).toBe(13);
      expect(latest.styleTokens.typography.entryTitle.fontFamily).toBe(
        "Georgia, serif",
      );
      expect(latest.styleTokens.typography.entryTitle.fontSizePt).toBe(10.5);
      expect(latest.styleTokens.typography.metadata.fontFamily).toBe(
        "Aptos, sans-serif",
      );
      expect(latest.styleTokens.typography.metadata.fontSizePt).toBe(8);
      expect(latest.styleTokens.rules.sectionDivider.widthPt).toBe(1.25);
      expect(latest.styleTokens.spacing.sectionGapPt.value).toBe(12);
      expect(latest.styleTokens.layout.headerMode.value).toBe("stacked");
      expect(latest.styleTokens.layout.dateAlignment.value).toBe("below");
      expect(latest.styleTokens.layout.sectionTitlePlacement.value).toBe(
        "left-rail",
      );
      expect(latest.styleTokens.layout.columns.value).toBe(2);
    });
  });

  it("lets reviewers move bullets between semantic items", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          next.reusableHtml =
            "<html><body><article><h1>Jane Rivera</h1><h2>Experience</h2></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Move bullet 1 from Senior Engineer to next item",
      }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items[0].bullets).toEqual([]);
      expect(latest.semanticResume.sections[0].items[1].bullets).toEqual([
        "Built migration tooling.",
        "Improved fixture coverage.",
      ]);
    });
  });

  it("lets reviewers drag bullets between semantic items", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          next.reusableHtml =
            "<html><body><article><h1>Jane Rivera</h1><h2>Experience</h2></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));

    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    };
    fireEvent.dragStart(
      screen.getByLabelText("Semantic bullet 1 from Senior Engineer"),
      { dataTransfer },
    );
    const targetItem = screen.getByLabelText(
      "Semantic item Platform Engineer | Beta | 2022 - 2024",
    );
    fireEvent.dragOver(targetItem, { dataTransfer });
    fireEvent.drop(targetItem, { dataTransfer });

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items[0].bullets).toEqual([]);
      expect(latest.semanticResume.sections[0].items[1].bullets).toEqual([
        "Built migration tooling.",
        "Improved fixture coverage.",
      ]);
    });
  });

  it("lets reviewers move bullets to an arbitrary semantic item", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraft();
          draft.semanticResume.sections[0].items.push({
            primary: "Systems Engineer",
            secondary: "Gamma",
            dateRange: "2020 - 2022",
            meta: [],
            bullets: ["Kept systems reliable."],
            confidence: 0.8,
            evidenceRefs: ["block-2"],
          });
          return Response.json({
            draft,
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.change(
      screen.getByLabelText("Move bullet 1 target for Senior Engineer"),
      {
        target: { value: "2" },
      },
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items[0].bullets).toEqual([]);
      expect(latest.semanticResume.sections[0].items[2].bullets).toEqual([
        "Built migration tooling.",
        "Kept systems reliable.",
      ]);
    });
  });

  it("lets reviewers mark source evidence as non-template", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          for (const block of next.source.blocks) {
            if (block.id !== body.sourceBlockDecisions?.[0]?.sourceBlockId) {
              continue;
            }
            Object.assign(block, {
              decorative: body.sourceBlockDecisions[0].decorative,
              slotHint: undefined,
            });
          }
          next.semanticResume = {
            ...next.semanticResume,
            sections: [],
          };
          next.reusableHtml =
            "<html><body><article><h1>Reusable render</h1></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark non-template" }));

    await waitFor(() => {
      expect(patchBodies.at(-1)).toEqual({
        sourceBlockDecisions: [
          {
            sourceBlockId: "block-1",
            decorative: true,
          },
        ],
      });
    });
    expect((await screen.findAllByText("non-template")).length).toBeGreaterThan(
      0,
    );
  });

  it("lets reviewers mark table cells as non-template evidence", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          const decision = body.sourceCellDecisions?.[0];
          const block = next.source.blocks.find(
            (candidate) => candidate.id === decision?.sourceBlockId,
          );
          if (block?.cellMetadata && decision) {
            Object.assign(block.cellMetadata[decision.cellIndex]!, {
              decorative: decision.decorative,
            });
          }
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select source block Skills | PDF | DOCX",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark cell 1 from block-2 non-template",
      }),
    );

    await waitFor(() => {
      expect(patchBodies.at(-1)).toEqual({
        sourceCellDecisions: [
          {
            sourceBlockId: "block-2",
            cellIndex: 0,
            decorative: true,
          },
        ],
      });
    });
    expect((await screen.findAllByText("non-template")).length).toBeGreaterThan(
      0,
    );
  });

  it("lets reviewers mark table cell inline runs as non-template evidence", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraftWithCellRuns();
          return Response.json({
            draft,
            warnings: [],
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
          ) as {
            sourceCellRunDecisions?: Array<{
              sourceBlockId: string;
              cellIndex: number;
              blockIndex: number;
              runIndex: number;
              decorative: boolean;
            }>;
          };
          patchBodies.push(body);
          const next = migrationDraftWithCellRuns();
          const decision = body.sourceCellRunDecisions?.[0];
          const blocks = next.source.blocks as Array<{
            id: string;
            cellMetadata?: Array<{
              blocks?: Array<{
                runs?: Array<{ text: string; decorative?: boolean }>;
              }>;
            }>;
          }>;
          const run =
            decision &&
            blocks.find((candidate) => candidate.id === decision.sourceBlockId)
              ?.cellMetadata?.[decision.cellIndex]?.blocks?.[
              decision.blockIndex
            ]?.runs?.[decision.runIndex];
          if (run && decision) {
            Object.assign(run, { decorative: decision.decorative });
          }
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select source block Skills | PDF | DOCX",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark run 1 from cell 1 block 1 in block-2 non-template",
      }),
    );

    await waitFor(() => {
      expect(patchBodies.at(-1)).toEqual({
        sourceCellRunDecisions: [
          {
            sourceBlockId: "block-2",
            cellIndex: 0,
            blockIndex: 0,
            runIndex: 0,
            decorative: true,
          },
        ],
      });
    });
    expect((await screen.findAllByText("non-template")).length).toBeGreaterThan(
      0,
    );
  });

  it("lets reviewers mark inline runs as non-template evidence", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraft();
          Object.assign(draft.source.blocks[0]!, {
            text: "Name: Jane Rivera",
            runs: [{ text: "Name: " }, { text: "Jane Rivera" }],
          });
          return Response.json({
            draft,
            warnings: [],
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
          ) as {
            sourceRunDecisions?: Array<{
              sourceBlockId: string;
              runIndex: number;
              decorative: boolean;
            }>;
          };
          patchBodies.push(body);
          const next = migrationDraft();
          const blocksWithRuns = next.source.blocks as Array<{
            id: string;
            text: string;
            runs?: Array<{ text: string; decorative?: boolean }>;
          }>;
          Object.assign(blocksWithRuns[0]!, {
            text: "Name: Jane Rivera",
            runs: [{ text: "Name: " }, { text: "Jane Rivera" }],
          });
          const decision = body.sourceRunDecisions?.[0];
          const block = blocksWithRuns.find(
            (candidate) => candidate.id === decision?.sourceBlockId,
          );
          if (block && "runs" in block && block.runs && decision) {
            Object.assign(block.runs[decision.runIndex]!, {
              decorative: decision.decorative,
            });
          }
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Source Evidence" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark run 1 from block-1 non-template",
      }),
    );

    await waitFor(() => {
      expect(patchBodies.at(-1)).toEqual({
        sourceRunDecisions: [
          {
            sourceBlockId: "block-1",
            runIndex: 0,
            decorative: true,
          },
        ],
      });
    });
    expect((await screen.findAllByText("non-template")).length).toBeGreaterThan(
      0,
    );
  });

  it("lets reviewers edit semantic item fields", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          next.reusableHtml =
            "<html><body><article><h1>Jane Rivera</h1><h2>Experience</h2></article></body></html>";
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.change(screen.getByLabelText("Primary for semantic item 1"), {
      target: { value: "Principal Engineer" },
    });
    fireEvent.change(screen.getByLabelText("Secondary for semantic item 1"), {
      target: { value: "Example Labs" },
    });
    fireEvent.change(screen.getByLabelText("Date for semantic item 1"), {
      target: { value: "Jan 2025 - Present" },
    });
    fireEvent.change(screen.getByLabelText("Location for semantic item 1"), {
      target: { value: "Toronto, ON" },
    });
    fireEvent.change(screen.getByLabelText("URL for semantic item 1"), {
      target: { value: "https://example.com/project" },
    });
    fireEvent.change(screen.getByLabelText("Metadata for semantic item 1"), {
      target: { value: "TypeScript | PDF | DOCX" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save semantic item 1" }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items[0]).toMatchObject({
        primary: "Principal Engineer",
        secondary: "Example Labs",
        dateRange: "Jan 2025 - Present",
        location: "Toronto, ON",
        url: "https://example.com/project",
        meta: ["TypeScript", "PDF", "DOCX"],
        confidence: 1,
      });
      expect(latest.semanticResume.sections[0].items[0].bullets).toEqual([
        "Built migration tooling.",
      ]);
    });
  });

  it("lets reviewers split a semantic item from a bullet", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Split Senior Engineer from bullet 1",
      }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      const items = latest.semanticResume.sections[0].items;
      expect(items).toHaveLength(3);
      expect(items[0].primary).toBe("Senior Engineer");
      expect(items[0].bullets).toEqual([]);
      expect(items[1]).toMatchObject({
        primary: "Built migration tooling.",
        bullets: [],
      });
      expect(items[2].primary).toBe("Platform Engineer");
    });
  });

  it("lets reviewers split a semantic item from an item-level split point", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.change(screen.getByLabelText("Split point for Senior Engineer"), {
      target: { value: "0" },
    });

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      const items = latest.semanticResume.sections[0].items;
      expect(items).toHaveLength(3);
      expect(items[0].primary).toBe("Senior Engineer");
      expect(items[0].bullets).toEqual([]);
      expect(items[1]).toMatchObject({
        primary: "Built migration tooling.",
        bullets: [],
      });
      expect(items[2].primary).toBe("Platform Engineer");
    });
  });

  it("lets reviewers merge semantic items without losing the merged header", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Merge Platform Engineer into previous item",
      }),
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      const items = latest.semanticResume.sections[0].items;
      expect(items).toHaveLength(1);
      expect(items[0].primary).toBe("Senior Engineer");
      expect(items[0].bullets).toEqual([
        "Built migration tooling.",
        "Platform Engineer | Beta | 2022 - 2024",
        "Improved fixture coverage.",
      ]);
    });
  });

  it("lets reviewers merge semantic items into an arbitrary target", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          const draft = migrationDraft();
          draft.semanticResume.sections[0].items.push({
            primary: "Systems Engineer",
            secondary: "Gamma",
            dateRange: "2020 - 2022",
            meta: [],
            bullets: ["Kept systems reliable."],
            confidence: 0.8,
            evidenceRefs: ["block-2"],
          });
          return Response.json({
            draft,
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));
    fireEvent.change(
      screen.getByLabelText("Merge target for Senior Engineer"),
      {
        target: { value: "2" },
      },
    );

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items).toHaveLength(2);
      expect(latest.semanticResume.sections[0].items[1].bullets).toEqual([
        "Kept systems reliable.",
        "Senior Engineer | Acme | 2024 - Present",
        "Built migration tooling.",
      ]);
    });
  });

  it("lets reviewers drag semantic items into merge targets", async () => {
    const patchBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/templates/migrate") {
          return Response.json({
            draft: migrationDraft(),
            warnings: [],
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
          patchBodies.push(body);
          const next = migrationDraft();
          next.semanticResume = body.semanticResume;
          return Response.json({ draft: next });
        }
        return Response.json({ templates: [] });
      },
    );
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
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Semantic Tree" }));

    const sourceItem = screen.getByLabelText(
      "Semantic item Platform Engineer | Beta | 2022 - 2024",
    );
    const targetItem = screen.getByLabelText(
      "Semantic item Senior Engineer | Acme | 2024 - Present",
    );
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    };
    fireEvent.dragStart(sourceItem, { dataTransfer });
    fireEvent.dragOver(targetItem, { dataTransfer });
    fireEvent.drop(targetItem, { dataTransfer });

    await waitFor(() => {
      const latest = patchBodies.at(-1) as ReturnType<typeof migrationDraft>;
      expect(latest.semanticResume.sections[0].items).toHaveLength(1);
      expect(latest.semanticResume.sections[0].items[0].bullets).toEqual([
        "Built migration tooling.",
        "Platform Engineer | Beta | 2022 - 2024",
        "Improved fixture coverage.",
      ]);
    });
  });

  it("surfaces fidelity and DOCX table risks in the mismatch report", async () => {
    const draft = {
      ...migrationDraft(),
      sourceFilename: "table-resume.docx",
      sourceType: "docx",
      universalAnalysis: {
        readiness: "review",
        scores: {
          semanticCoverage: 0.92,
          styleCoverage: 0.88,
          layoutResilience: 0.58,
          sourceEvidence: 0.62,
        },
        warnings: [],
      },
      fidelity: {
        score: 61,
        status: "review",
        checks: [
          {
            id: "render_completeness",
            label: "Render completeness",
            score: 0.45,
            passed: false,
            detail:
              "Stress render overflowed after replacing source content with unrelated candidate data.",
          },
          {
            id: "table_structure",
            label: "Table structure",
            score: 0.7,
            passed: false,
            detail:
              "DOCX table rows were detected; confirm which cells are reusable content.",
          },
        ],
      },
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/templates/migrate") {
        return Response.json({ draft });
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
          new File(["PK"], "table-resume.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("table-resume.docx")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Mismatch Report" }));

    expect(screen.getByText("Extraction gate")).toBeInTheDocument();
    expect(screen.getByText("Semantic gate")).toBeInTheDocument();
    expect(screen.getByText("Style gate")).toBeInTheDocument();
    expect(screen.getByText("Render gate")).toBeInTheDocument();
    expect(screen.getByText("App wiring gate")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Use Source Evidence to classify unresolved blocks, table cells/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Use Semantic Tree to correct section types/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Use Style Tokens to choose reusable typography/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Compare Reusable Render with Visual Evidence/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Resolve blocked gates before saving/),
    ).toBeInTheDocument();
    expect(screen.getByText("Weak layout resilience")).toBeInTheDocument();
    expect(screen.getByText("Weak source evidence")).toBeInTheDocument();
    expect(screen.getByText("Render completeness")).toBeInTheDocument();
    expect(screen.getByText("Table structure")).toBeInTheDocument();
    expect(screen.getByText("Table-heavy DOCX review")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Stress render overflowed after replacing source content/,
      ),
    ).toBeInTheDocument();
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
          cellMetadata: [{ text: "Skills" }, { text: "PDF" }, { text: "DOCX" }],
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
    universalAnalysis: {
      readiness: "ready",
      scores: {
        sourceEvidence: 0.9,
        semanticCoverage: 0.85,
        styleCoverage: 0.8,
        layoutResilience: 0.75,
      },
      warnings: [],
    },
    semanticResume: {
      version: 1,
      sourceType: "pdf",
      filename: "resume.pdf",
      contact: {
        name: "Jane Rivera",
        email: "jane@example.com",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        confidence: 0.95,
        evidenceRefs: ["block-1"],
      },
      sections: [
        {
          id: "section-experience",
          type: "experience",
          title: "Experience",
          confidence: 0.9,
          evidenceRefs: ["block-2"],
          items: [
            {
              primary: "Senior Engineer",
              secondary: "Acme",
              dateRange: "2024 - Present",
              meta: [],
              bullets: ["Built migration tooling."],
              confidence: 0.86,
              evidenceRefs: ["block-2"],
            },
            {
              primary: "Platform Engineer",
              secondary: "Beta",
              dateRange: "2022 - 2024",
              meta: [],
              bullets: ["Improved fixture coverage."],
              confidence: 0.82,
              evidenceRefs: ["block-2"],
            },
          ],
        },
      ],
      warnings: [],
    },
    styleTokens: {
      page: { widthPt: 612, heightPt: 792 },
      typography: {
        name: {
          fontFamily: "Inter",
          fontSizePt: 22,
          candidates: [
            {
              label: "Inter 22pt (1 ref)",
              value: { fontFamily: "Inter", fontSizePt: 22 },
            },
            {
              label: "Aptos Display, sans-serif 24pt (1 ref)",
              value: {
                fontFamily: "Aptos Display, sans-serif",
                fontSizePt: 24,
              },
            },
          ],
        },
        body: {
          fontFamily: "Inter",
          fontSizePt: 11,
          candidates: [
            {
              label: "Inter (4 refs)",
              value: { fontFamily: "Inter", fontSizePt: 11 },
            },
            {
              label: "Georgia, serif (2 refs)",
              value: { fontFamily: "Georgia, serif", fontSizePt: 11 },
            },
          ],
        },
        sectionHeading: {
          fontFamily: "Inter",
          fontSizePt: 12,
          fontWeight: "700",
          textTransform: "uppercase",
          candidates: [
            {
              label: "Inter (2 refs)",
              value: { fontFamily: "Inter", fontSizePt: 12 },
            },
            {
              label: "Aptos, sans-serif (1 ref)",
              value: { fontFamily: "Aptos, sans-serif", fontSizePt: 14 },
            },
          ],
        },
        entryTitle: {
          fontFamily: "Inter",
          fontSizePt: 10,
          candidates: [
            {
              label: "Inter 10pt (1 ref)",
              value: { fontFamily: "Inter", fontSizePt: 10 },
            },
            {
              label: "Georgia, serif 11pt (1 ref)",
              value: { fontFamily: "Georgia, serif", fontSizePt: 11 },
            },
          ],
        },
        metadata: {
          fontFamily: "Inter",
          fontSizePt: 9,
          candidates: [
            {
              label: "Inter 9pt (1 ref)",
              value: { fontFamily: "Inter", fontSizePt: 9 },
            },
            {
              label: "Aptos, sans-serif 9pt (1 ref)",
              value: { fontFamily: "Aptos, sans-serif", fontSizePt: 9 },
            },
          ],
        },
      },
      color: {
        body: { value: "#111111" },
        accent: {
          value: "#2563eb",
          candidates: [
            { label: "#2563eb (3 refs)", value: "#2563eb" },
            { label: "#0f766e (2 refs)", value: "#0f766e" },
          ],
        },
      },
      spacing: {
        sectionGapPt: {
          value: 8,
          candidates: [
            { label: "8pt (3 refs)", value: 8 },
            { label: "12pt (2 refs)", value: 12 },
          ],
        },
      },
      rules: {
        sectionDivider: {
          widthPt: 0.75,
          color: "#2563eb",
          candidates: [
            { label: "0.75pt (2 refs)", value: 0.75 },
            { label: "1.25pt (1 ref)", value: 1.25 },
          ],
        },
      },
      layout: {
        headerMode: {
          value: "split",
          candidates: [
            { label: "split (68%)", value: "split" },
            { label: "stacked (44%)", value: "stacked" },
          ],
        },
        dateAlignment: {
          value: "right-column",
          candidates: [
            { label: "right-column (72%)", value: "right-column" },
            { label: "below (42%)", value: "below" },
          ],
        },
        sectionTitlePlacement: {
          value: "above",
          candidates: [
            { label: "above (55%)", value: "above" },
            { label: "left-rail (32%)", value: "left-rail" },
          ],
        },
        columns: {
          value: 1,
          candidates: [
            { label: "1pt (1 refs)", value: 1 },
            { label: "2pt (1 refs)", value: 2 },
          ],
        },
      },
      warnings: [],
    },
    reusableTemplate: {
      schemaVersion: 4,
      sectionOrder: ["experience"],
      components: [
        { kind: "HeaderBlock", id: "header" },
        {
          kind: "Section",
          id: "section-experience",
          sectionType: "experience",
        },
      ],
      diagnostics: [],
    },
    reusableHtml:
      "<html><body><article><h1>Jane Rivera</h1><section>Reusable render</section></article></body></html>",
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

function migrationDraftWithCellRuns() {
  const draft = migrationDraft();
  const tableBlock = draft.source.blocks.find(
    (block) => block.id === "block-2",
  );
  if (tableBlock?.cellMetadata?.[0]) {
    Object.assign(tableBlock.cellMetadata[0], {
      blocks: [
        {
          id: "cell-block-1",
          text: "Label: PDF",
          runs: [{ text: "Label: " }, { text: "PDF" }],
        },
      ],
    });
  }
  return draft;
}

function lowFidelityMigrationDraft() {
  return {
    ...migrationDraft(),
    reusableTemplate: undefined,
    reusableHtml: undefined,
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
