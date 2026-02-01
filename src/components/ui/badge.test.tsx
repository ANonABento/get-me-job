import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("should render badge with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should apply default variant classes", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("text-primary-foreground");
  });

  it("should apply secondary variant classes", () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("bg-secondary");
    expect(badge.className).toContain("text-secondary-foreground");
  });

  it("should apply destructive variant classes", () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("bg-destructive");
    expect(badge.className).toContain("text-destructive-foreground");
  });

  it("should apply outline variant classes", () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("text-foreground");
    expect(badge.className).not.toContain("bg-primary");
  });

  it("should have rounded-full class for pill shape", () => {
    render(<Badge data-testid="badge">Pill</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("rounded-full");
  });

  it("should have proper padding", () => {
    render(<Badge data-testid="badge">Padded</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("px-2.5");
    expect(badge.className).toContain("py-0.5");
  });

  it("should merge custom className", () => {
    render(<Badge className="custom-badge" data-testid="badge">Custom</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("custom-badge");
  });

  it("should pass through additional HTML attributes", () => {
    render(<Badge id="my-badge" title="Badge tooltip">Hover me</Badge>);
    const badge = screen.getByText("Hover me");
    expect(badge).toHaveAttribute("id", "my-badge");
    expect(badge).toHaveAttribute("title", "Badge tooltip");
  });

  it("should render with children elements", () => {
    render(
      <Badge data-testid="badge">
        <span>Icon</span> Status
      </Badge>
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Icon Status");
  });
});
