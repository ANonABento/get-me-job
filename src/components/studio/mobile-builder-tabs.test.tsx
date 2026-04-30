import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileBuilderTabs } from "./mobile-builder-tabs";

describe("MobileBuilderTabs", () => {
  it("uses theme variables for tab chrome and changes views", () => {
    const onMobileViewChange = vi.fn();

    render(
      <MobileBuilderTabs
        mobileView="edit"
        onMobileViewChange={onMobileViewChange}
      />,
    );

    expect(screen.getByRole("tablist").className).toContain(
      "border-b-[length:var(--border-width)]",
    );
    expect(screen.getByRole("tab", { name: "Edit" }).className).toContain(
      "border-b-[length:calc(var(--border-width)_*_2)]",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Preview" }));

    expect(onMobileViewChange).toHaveBeenCalledWith("preview");
  });
});
