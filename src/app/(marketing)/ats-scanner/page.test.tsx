import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ATSScannerPage from "./page";

describe("ATSScannerPage", () => {
  it("does not use a dollar sign icon for the free benefit", () => {
    const { container } = render(<ATSScannerPage />);

    expect(screen.getByText("100% Free")).toBeInTheDocument();
    expect(container.querySelector(".lucide-dollar-sign")).toBeNull();
    expect(container.querySelector(".lucide-sparkles")).not.toBeNull();
  });
});
