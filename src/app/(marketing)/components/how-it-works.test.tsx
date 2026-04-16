import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorks } from "./how-it-works";

describe("HowItWorks", () => {
  it("should render the section header", () => {
    render(<HowItWorks />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText(/three steps/)).toBeInTheDocument();
  });

  it("should render all three steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Bank")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
  });

  it("should render step numbers", () => {
    render(<HowItWorks />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("should render step descriptions", () => {
    render(<HowItWorks />);
    expect(screen.getByText(/Drop in your resumes/)).toBeInTheDocument();
    expect(screen.getByText(/chunked, indexed, and stored/)).toBeInTheDocument();
    expect(screen.getByText(/Paste a job description/)).toBeInTheDocument();
  });
});
