import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumePreview, getPreviewEmptyStateContent } from "./resume-preview";
import type { TipTapJSONContent } from "@/lib/editor/types";
import type { TailoredResume } from "@/lib/resume/generator";

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

const baseResume: TailoredResume = {
  contact: { name: "Jane Doe" },
  summary: "Product engineer.",
  experiences: [],
  skills: ["React"],
  education: [],
};

const tailoredResume: TailoredResume = {
  ...baseResume,
  summary: "Product engineer with GraphQL experience.",
  skills: ["React", "GraphQL"],
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

  it("renders a View changes toggle for structured tailored resumes", async () => {
    render(
      <ResumePreview
        templateId="classic"
        content={content}
        baseResume={baseResume}
        tailoredResume={tailoredResume}
      />,
    );

    expect(
      await screen.findByText("Focused product engineer"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View changes" }));

    expect(screen.getByText(/^Added:/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Summary" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Focused product engineer"),
    ).not.toBeInTheDocument();
  });

  it("returns resume empty state content by default", () => {
    expect(getPreviewEmptyStateContent()).toMatchObject({
      eyebrow: "Resume",
      heading: "Select entries from your bank",
      steps: [
        "Pick the bank entries to include",
        "Review the generated preview",
        "Edit and export your resume",
      ],
    });
  });

  it("returns cover letter empty state content", () => {
    expect(getPreviewEmptyStateContent("cover_letter")).toMatchObject({
      eyebrow: "Cover Letter",
      heading: "Select entries from your bank",
      steps: [
        "Pick the bank entries to include",
        "Add job details when you are ready",
        "Preview and edit the cover letter",
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
      screen.getByRole("heading", { name: "Select entries from your bank" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "/illustrations/empty/studio-zero.svg",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getByText("Pick the bank entries to include"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review the generated preview"),
    ).toBeInTheDocument();
    expect(screen.getByText("Edit and export your resume")).toBeInTheDocument();
    expect(
      screen.getByText("Pick the bank entries to include").closest("ol"),
    ).toHaveClass("mt-7");
    expect(screen.getByText("1").className).toContain("rounded-full");

    fireEvent.click(
      screen.getByRole("button", {
        name: /select entries from your bank/i,
      }),
    );

    expect(handleAddFromBank).toHaveBeenCalledTimes(1);
  });

  it("renders cover letter empty state steps", () => {
    render(<ResumePreview templateId="classic" documentMode="cover_letter" />);

    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(
      screen.getByText("Preview and edit the cover letter"),
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
    expect(previewPage?.className).toContain("bg-paper");
    expect(previewPage?.className).toContain("text-paper-foreground");
    expect(previewPage?.className).toContain("border-paper-border");
    expect(previewPage?.className).toContain("shadow-[var(--shadow-elevated)]");
    expect(previewPage).not.toHaveStyle("border-top: 4px solid #1f2937");
  });

  it("renders V3 visual template HTML without generic resume padding or accent border", () => {
    render(
      <ResumePreview
        templateId="classic"
        documentMode="resume"
        html='<article class="resume-v3">Visual layout</article>'
      />,
    );

    const visualResume = document.querySelector(".resume-v3");
    const htmlWrapper = visualResume?.parentElement;
    const previewPage = htmlWrapper?.parentElement;

    expect(visualResume).toHaveTextContent("Visual layout");
    expect(htmlWrapper).not.toHaveClass("px-14");
    expect(previewPage).not.toHaveStyle("border-top: 4px solid #333333");
  });
});
