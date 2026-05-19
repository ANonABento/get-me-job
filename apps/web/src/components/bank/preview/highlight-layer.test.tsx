import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HighlightLayer } from "./highlight-layer";

describe("HighlightLayer", () => {
  it("renders only the selected highlight when a selection is active", () => {
    render(
      <div className="relative">
        <HighlightLayer
          highlights={[
            {
              entryId: "exp-1",
              category: "experience",
              sourceQuality: "exact",
              bboxes: [[1, 10, 20, 110, 40]],
            },
            {
              entryId: "edu-1",
              category: "education",
              sourceQuality: "exact",
              bboxes: [[1, 10, 60, 110, 80]],
            },
          ]}
          selectedEntryId="exp-1"
          onSelectEntry={vi.fn()}
          pageWidth={612}
          pageHeight={792}
          renderScale={1}
        />
      </div>,
    );

    expect(
      screen.getByRole("button", { name: /exact source highlight/i }),
    ).toHaveAttribute("aria-current", "true");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("uses dashed amber styling for fuzzy source highlights", () => {
    const onSelectEntry = vi.fn();
    render(
      <div className="relative">
        <HighlightLayer
          highlights={[
            {
              entryId: "exp-1",
              category: "experience",
              sourceQuality: "fuzzy",
              bboxes: [[1, 10, 20, 110, 40]],
            },
          ]}
          selectedEntryId="exp-1"
          onSelectEntry={onSelectEntry}
          pageWidth={612}
          pageHeight={792}
          renderScale={1}
        />
      </div>,
    );

    const highlight = screen.getByRole("button", {
      name: /fuzzy source highlight/i,
    });
    expect(highlight).toHaveStyle({
      outlineStyle: "dashed",
      outlineColor: "rgb(245, 158, 11)",
    });

    fireEvent.click(highlight);
    expect(onSelectEntry).toHaveBeenCalledWith("exp-1");
  });
});
