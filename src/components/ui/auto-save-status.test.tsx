import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutoSaveStatus } from "./auto-save-status";

describe("AutoSaveStatus", () => {
  it("renders the saved state", () => {
    render(<AutoSaveStatus status="saved" />);

    expect(screen.getByRole("status")).toHaveTextContent("All changes saved");
  });

  it("renders the saving state", () => {
    render(<AutoSaveStatus status="saving" />);

    expect(screen.getByRole("status")).toHaveTextContent("Saving...");
    expect(screen.getByRole("status").querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders retry for failed saves", () => {
    const onRetry = vi.fn();
    render(<AutoSaveStatus status="error" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Save failed");
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
