import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumePreview } from "./resume-preview";
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
      />
    );

    expect(
      await screen.findByText("Focused product engineer")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add section/i }));

    expect(handleAddSection).toHaveBeenCalledTimes(1);
  });
});
