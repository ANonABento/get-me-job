import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Features } from "./features";

describe("Features", () => {
  it("should render the section header", () => {
    render(<Features />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText(/Your career data,/)).toBeInTheDocument();
  });

  it("should render all four feature cards", () => {
    render(<Features />);
    expect(screen.getByText("Knowledge Bank")).toBeInTheDocument();
    expect(screen.getByText("Smart Parser")).toBeInTheDocument();
    expect(screen.getByText("AI Tailoring")).toBeInTheDocument();
    expect(screen.getByText("ATS Scanner")).toBeInTheDocument();
  });

  it("should render feature descriptions", () => {
    render(<Features />);
    expect(screen.getByText(/searchable knowledge bank/)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic section detection/)).toBeInTheDocument();
    expect(screen.getByText(/Match your bank against any job/)).toBeInTheDocument();
    expect(screen.getByText(/Score your resume against real ATS/)).toBeInTheDocument();
  });

  it("should render exactly 4 feature cards", () => {
    render(<Features />);
    const cards = screen.getAllByRole("heading", { level: 3 });
    expect(cards).toHaveLength(4);
  });
});
