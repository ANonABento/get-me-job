import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TermsPage from "./page";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TermsPage", () => {
  it("renders required terms sections", () => {
    render(<TermsPage />);

    expect(
      screen.getByRole("heading", { name: "Terms of Service" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Acceptable use" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Disclaimer and limitation of liability",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Governing law" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Disputes" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "support@slothing.work" }).length,
    ).toBeGreaterThan(0);
  });

  it("does not ship placeholder legal copy", () => {
    const { container } = render(<TermsPage />);

    expect(container).not.toHaveTextContent(
      /TBD|being finalized|draft|legal counsel|pending legal review/i,
    );
    expect(container).toHaveTextContent(/State of Delaware/i);
    expect(container).toHaveTextContent(/within 30 days/i);
  });
});
