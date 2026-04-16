import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "./testimonials";

describe("Testimonials", () => {
  it("should render the section header", () => {
    render(<Testimonials />);
    expect(screen.getByText("Social Proof")).toBeInTheDocument();
    expect(screen.getByText(/Trusted by job seekers/)).toBeInTheDocument();
  });

  it("should render stat values", () => {
    render(<Testimonials />);
    expect(screen.getByText("10,000+")).toBeInTheDocument();
    expect(screen.getByText("50,000+")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("should render stat labels", () => {
    render(<Testimonials />);
    expect(screen.getByText("Job seekers using Taida")).toBeInTheDocument();
    expect(screen.getByText("Tailored resumes generated")).toBeInTheDocument();
    expect(screen.getByText("ATS pass rate after optimization")).toBeInTheDocument();
  });

  it("should render a testimonial quote", () => {
    render(<Testimonials />);
    expect(
      screen.getByText(/Taida turned my 3-hour resume rewrite/)
    ).toBeInTheDocument();
  });
});
