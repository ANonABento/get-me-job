import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TEMPLATES } from "@/lib/resume/templates";
import { ResumeEditor } from "./resume-editor";
import type { TipTapJSONContent } from "./types";

describe("ResumeEditor", () => {
  it("renders TipTap content with scoped resume template CSS", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "contactInfo",
          attrs: { name: "Jane Doe", email: "jane@example.com" },
        },
        {
          type: "resumeSection",
          attrs: { title: "Summary" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Product-minded engineer" }],
            },
          ],
        },
      ],
    };

    const { container } = render(
      <ResumeEditor
        content={content}
        templateStyles={template.styles}
        editable={false}
      />,
    );

    expect(container.querySelector(".resume-editor")).toBeTruthy();
    expect(container.querySelector("style")?.textContent).toContain(
      ".resume-editor .ProseMirror",
    );
    expect(
      await screen.findByText("Product-minded engineer"),
    ).toBeInTheDocument();
  });

  it("updates rendered content when the document prop changes", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const firstContent: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Summary" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "First summary" }],
            },
          ],
        },
      ],
    };
    const nextContent: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Summary" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Updated summary" }],
            },
          ],
        },
      ],
    };

    const { rerender } = render(
      <ResumeEditor
        content={firstContent}
        templateStyles={template.styles}
        editable={false}
      />,
    );

    expect(await screen.findByText("First summary")).toBeInTheDocument();

    rerender(
      <ResumeEditor
        content={nextContent}
        templateStyles={template.styles}
        editable={false}
      />,
    );

    expect(await screen.findByText("Updated summary")).toBeInTheDocument();
    expect(screen.queryByText("First summary")).not.toBeInTheDocument();
  });

  it("renders section drag handles and editor interaction styles", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Experience" },
          content: [{ type: "paragraph" }],
        },
      ],
    };

    const { container } = render(
      <ResumeEditor
        content={content}
        templateStyles={template.styles}
        editable
      />,
    );

    expect(
      await screen.findByLabelText("Drag Experience section"),
    ).toBeInTheDocument();
    expect(container.querySelector("style")?.textContent).toContain(
      ".resume-section-drag-handle",
    );
    expect(container.querySelector("style")?.textContent).toContain(
      "caret-color",
    );
  });

  it("updates resume node attribute text from inline edits", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const handleUpdate = vi.fn();
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "contactInfo",
          attrs: {
            name: "Jane Doe",
            email: "jane@example.com",
          },
        },
        {
          type: "resumeSection",
          attrs: { title: "Experience" },
          content: [
            {
              type: "resumeEntry",
              attrs: {
                company: "Acme",
                title: "Engineer",
                dates: "2020",
              },
              content: [
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Built APIs" }],
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
    };

    render(
      <ResumeEditor
        content={content}
        templateStyles={template.styles}
        editable
        onUpdate={handleUpdate}
      />,
    );

    const name = await screen.findByText("Jane Doe");
    name.textContent = "Janet Doe";
    fireEvent.blur(name);

    const sectionTitle = screen.getByText("Experience");
    sectionTitle.textContent = "Relevant Experience";
    fireEvent.blur(sectionTitle);

    const entryTitle = screen.getByText("Engineer");
    entryTitle.textContent = "Staff Engineer";
    fireEvent.blur(entryTitle);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          content: expect.arrayContaining([
            expect.objectContaining({
              type: "contactInfo",
              attrs: expect.objectContaining({ name: "Janet Doe" }),
            }),
            expect.objectContaining({
              type: "resumeSection",
              attrs: expect.objectContaining({ title: "Relevant Experience" }),
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: "resumeEntry",
                  attrs: expect.objectContaining({ title: "Staff Engineer" }),
                }),
              ]),
            }),
          ]),
        }),
      );
    });
  });

  it("renders contact details without a leading separator when earlier fields are empty", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "contactInfo",
          attrs: {
            name: "Jane Doe",
            phone: "555-1234",
          },
        },
      ],
    };

    const { container } = render(
      <ResumeEditor
        content={content}
        templateStyles={template.styles}
        editable
      />,
    );

    expect(await screen.findByText("555-1234")).toBeInTheDocument();
    expect(container.querySelector(".contact")?.textContent).toBe("555-1234");
  });

  it("renders freeform cover letter content with cover letter editor styles", async () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear Hiring Team," }],
        },
      ],
    };

    const { container } = render(
      <ResumeEditor
        content={content}
        templateStyles={template.styles}
        variant="cover_letter"
        editable
      />,
    );

    expect(await screen.findByText("Dear Hiring Team,")).toBeInTheDocument();
    expect(container.querySelector(".cover-letter-editor")).toBeTruthy();
    expect(container.querySelector("style")?.textContent).toContain(
      ".cover-letter-editor .ProseMirror",
    );
    expect(container.querySelector("style")?.textContent).toContain(
      "padding: 0.7in",
    );
  });
});
