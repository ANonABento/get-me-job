import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OpportunityDrawer } from "./opportunity-drawer";
import type { Opportunity } from "../utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const BASE_OPPORTUNITY: Opportunity = {
  id: "opp-test",
  type: "job",
  title: "Senior Product Engineer",
  company: "Linear",
  source: "linkedin",
  city: "San Francisco",
  province: "CA",
  country: "US",
  remoteType: "remote",
  summary: "Ship product surface across web and mobile.",
  responsibilities: ["Own UX", "Partner with design"],
  requiredSkills: ["TypeScript", "React"],
  techStack: ["TypeScript", "React"],
  salaryMin: 180000,
  salaryMax: 220000,
  salaryCurrency: "USD",
  status: "applied",
  scrapedAt: "2026-05-01T10:00:00.000Z",
  tags: ["growth"],
  createdAt: "2026-05-01T10:00:00.000Z",
  updatedAt: "2026-05-01T10:00:00.000Z",
};

describe("OpportunityDrawer", () => {
  it("renders nothing when no opportunity is supplied", () => {
    render(
      <OpportunityDrawer
        opportunity={null}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders core fields and footer when open", () => {
    render(
      <OpportunityDrawer
        opportunity={BASE_OPPORTUNITY}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: /Senior Product Engineer/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Linear").length).toBeGreaterThan(0);
    expect(screen.getByText(/Own UX/)).toBeInTheDocument();
    expect(screen.getByText(/Tailor in Studio/)).toBeInTheDocument();
  });

  it("fires onStatusChange when the status select changes", () => {
    const onStatusChange = vi.fn();
    render(
      <OpportunityDrawer
        opportunity={BASE_OPPORTUNITY}
        onClose={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );

    const select = screen.getByLabelText(
      /Update status for Senior Product Engineer/i,
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "offer" } });
    expect(onStatusChange).toHaveBeenCalledWith(BASE_OPPORTUNITY, "offer");
  });

  it("invokes onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(
      <OpportunityDrawer
        opportunity={BASE_OPPORTUNITY}
        onClose={onClose}
        onStatusChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalled();
  });
});
