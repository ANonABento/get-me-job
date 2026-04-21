import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("should render the 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });

  it("should render the branded copy", () => {
    render(<NotFound />);
    expect(screen.getByText(/Lost your way\?/)).toBeInTheDocument();
    expect(
      screen.getByText(/This page took a different career path\./)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't find what you were looking for/)
    ).toBeInTheDocument();
  });

  it("should render Go to Dashboard CTA linking to /dashboard", () => {
    render(<NotFound />);
    const dashboardLink = screen.getByRole("link", { name: /Go to Dashboard/ });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("should render Back to home CTA linking to /", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /Back to home/ });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
