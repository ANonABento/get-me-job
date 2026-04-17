import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

describe("Hero", () => {
  it("should render the Taida headline", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { name: /You're not lazy/ });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("You're efficient.");
  });

  it("should render the badge text", () => {
    render(<Hero />);
    expect(
      screen.getByText(/AI-Powered Resume Intelligence/)
    ).toBeInTheDocument();
  });

  it("should render the subheadline with Taida description", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Taida builds a knowledge bank/)
    ).toBeInTheDocument();
  });

  it("should render Try Free ATS Scanner CTA linking to /ats-scanner", () => {
    render(<Hero />);
    const atsLink = screen.getByRole("link", { name: /Try Free ATS Scanner/ });
    expect(atsLink).toHaveAttribute("href", "/ats-scanner");
  });

  it("should render Get Started CTA linking to sign-up", () => {
    render(<Hero />);
    const getStarted = screen.getByRole("link", { name: /Get Started/ });
    expect(getStarted).toHaveAttribute(
      "href",
      "/sign-up?redirect_url=/dashboard"
    );
  });

  it("should render social proof section", () => {
    render(<Hero />);
    expect(screen.getByText(/Join 10,000\+ job seekers/)).toBeInTheDocument();
    expect(screen.getByText("4.9/5 rating")).toBeInTheDocument();
  });
});
