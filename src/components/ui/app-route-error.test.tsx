import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppRouteError } from "./app-route-error";

describe("AppRouteError", () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("renders a friendly message with a retry action", () => {
    render(
      <AppRouteError error={new Error("boom")} reset={vi.fn()} />
    );

    expect(screen.getByText("We couldn't load this page")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Something went wrong while loading this page. Try again to reload it."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("calls reset when the retry button is clicked", () => {
    const reset = vi.fn();

    render(<AppRouteError error={new Error("boom")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});

