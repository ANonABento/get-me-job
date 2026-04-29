import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress, CircularProgress } from "./progress";

describe("Progress", () => {
  it("should render progressbar element", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should have correct aria attributes", () => {
    render(<Progress value={50} max={100} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should default to 0 value and 100 max", () => {
    render(<Progress />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should show label when showLabel is true", () => {
    render(<Progress value={75} showLabel />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should not show label by default", () => {
    render(<Progress value={75} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("should clamp percentage between 0 and 100", () => {
    const { rerender } = render(<Progress value={-10} />);
    let progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    rerender(<Progress value={150} />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });

  it("should fall back to a safe max when max is not positive", () => {
    const { rerender } = render(<Progress value={0} max={0} showLabel />);
    let progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(<Progress value={50} max={-1} showLabel />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should apply sm size class", () => {
    render(<Progress size="sm" data-testid="progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.className).toContain("h-1.5");
  });

  it("should apply md size class by default", () => {
    render(<Progress data-testid="progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.className).toContain("h-2.5");
  });

  it("should apply lg size class", () => {
    render(<Progress size="lg" data-testid="progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.className).toContain("h-4");
  });

  it("should apply success variant", () => {
    render(<Progress variant="success" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.firstChild;
    expect(fill).toHaveClass("bg-success");
  });

  it("should apply warning variant", () => {
    render(<Progress variant="warning" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.firstChild;
    expect(fill).toHaveClass("bg-warning");
  });

  it("should apply destructive variant", () => {
    render(<Progress variant="destructive" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.firstChild;
    expect(fill).toHaveClass("bg-destructive");
  });

  it("should apply default variant", () => {
    render(<Progress variant="default" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.firstChild;
    expect(fill).toHaveClass("bg-primary");
  });

  it("should merge custom className", () => {
    render(<Progress className="custom-progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.className).toContain("custom-progress");
  });

  it("should calculate percentage correctly with custom max", () => {
    render(<Progress value={25} max={50} showLabel />);
    expect(screen.getByText("50%")).toBeInTheDocument(); // 25/50 = 50%
  });
});

describe("CircularProgress", () => {
  it("should render svg element", () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should show value by default", () => {
    render(<CircularProgress value={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("should hide value when showValue is false", () => {
    render(<CircularProgress value={75} showValue={false} />);
    expect(screen.queryByText("75")).not.toBeInTheDocument();
  });

  it("should render with custom size", () => {
    const { container } = render(<CircularProgress value={50} size={100} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "100");
    expect(svg).toHaveAttribute("height", "100");
  });

  it("should render with default size of 80", () => {
    const { container } = render(<CircularProgress value={50} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
  });

  it("should have two circle elements (background and progress)", () => {
    const { container } = render(<CircularProgress value={50} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CircularProgress value={50} className="custom-circular" />,
    );
    expect(container.firstChild).toHaveClass("custom-circular");
  });

  it("should round displayed value", () => {
    render(<CircularProgress value={75.7} />);
    expect(screen.getByText("76")).toBeInTheDocument();
  });

  it("should clamp displayed value to valid progress bounds", () => {
    const { rerender } = render(<CircularProgress value={150} />);
    expect(screen.getByText("100")).toBeInTheDocument();

    rerender(<CircularProgress value={-20} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
