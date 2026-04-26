import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
