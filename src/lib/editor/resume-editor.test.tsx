import { render, screen } from "@testing-library/react";
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
      />
    );

    expect(container.querySelector(".resume-editor")).toBeTruthy();
    expect(container.querySelector("style")?.textContent).toContain(
      ".resume-editor .ProseMirror"
    );
    expect(
      await screen.findByText("Product-minded engineer")
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
      />
    );

    expect(await screen.findByText("First summary")).toBeInTheDocument();

    rerender(
      <ResumeEditor
        content={nextContent}
        templateStyles={template.styles}
        editable={false}
      />
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
      />
    );

    expect(
      await screen.findByLabelText("Drag Experience section")
    ).toBeInTheDocument();
    expect(container.querySelector("style")?.textContent).toContain(
      ".resume-section-drag-handle"
    );
    expect(container.querySelector("style")?.textContent).toContain(
      "caret-color"
    );
  });
});
