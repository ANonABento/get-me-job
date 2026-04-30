import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumePreview, getPreviewEmptyStateContent } from "./resume-preview";
import type { TipTapJSONContent } from "@/lib/editor/types";

const content: TipTapJSONContent = {
  type: "doc",
  content: [
    {
      type: "resumeSection",
      attrs: { title: "Summary" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Focused product engineer" }],
        },
      ],
    },
  ],
};

describe("ResumePreview", () => {
  beforeEach(() => {
    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  it("renders editable TipTap content with an add section button", async () => {
    const handleAddSection = vi.fn();

    render(
      <ResumePreview
        templateId="classic"
        content={content}
        onAddSection={handleAddSection}
      />,
    );

    expect(
      await screen.findByText("Focused product engineer"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add section/i }));

    expect(handleAddSection).toHaveBeenCalledTimes(1);
  });

  it("returns resume empty state content by default", () => {
    expect(getPreviewEmptyStateContent()).toMatchObject({
      eyebrow: "Resume",
      heading: "Get started",
      steps: [
        "Select entries from the bank",
        "Choose a template",
        "Preview and edit your resume",
      ],
    });
  });

  it("returns cover letter empty state content", () => {
    expect(getPreviewEmptyStateContent("cover_letter")).toMatchObject({
      eyebrow: "Cover Letter",
      heading: "Get started",
      steps: [
        "Select entries from the bank",
        "Choose a template",
        "Preview and edit your cover letter",
      ],
    });
  });

  it("renders a visual resume empty state with an add from bank CTA", () => {
    const handleAddFromBank = vi.fn();

    render(
      <ResumePreview
        templateId="classic"
        documentMode="resume"
        onAddFromBank={handleAddFromBank}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Get started" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select entries from the bank"),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(
      screen.getByText("Preview and edit your resume"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select entries from the bank").closest("li")?.className,
    ).toContain("rounded-[var(--radius)]");
    expect(
      screen.getByText("Select entries from the bank").closest("li")?.className,
    ).toContain("border-[length:var(--border-width)]");
    expect(
      screen.getByText("Select entries from the bank").closest("li")?.className,
    ).toContain("shadow-[var(--shadow-card)]");
    expect(screen.getByText("1").className).toContain(
      "rounded-[var(--radius)]",
    );

    fireEvent.click(screen.getByRole("button", { name: /add from bank/i }));

    expect(handleAddFromBank).toHaveBeenCalledTimes(1);
  });

  it("renders cover letter empty state steps", () => {
    render(<ResumePreview templateId="classic" documentMode="cover_letter" />);

    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(
      screen.getByText("Preview and edit your cover letter"),
    ).toBeInTheDocument();
  });

  it("renders cover letter HTML without resume-only preview padding", () => {
    render(
      <ResumePreview
        templateId="formal"
        documentMode="cover_letter"
        html='<article class="cover-letter-document">Letter body</article>'
      />,
    );

    const letter = document.querySelector(".cover-letter-document");
    const htmlWrapper = letter?.parentElement;
    const previewPage = htmlWrapper?.parentElement;

    expect(letter).toHaveTextContent("Letter body");
    expect(htmlWrapper).not.toHaveClass("px-14");
    expect(previewPage?.className).toContain("shadow-[var(--shadow-elevated)]");
    expect(previewPage).not.toHaveStyle("border-top: 4px solid #1f2937");
  });
});
