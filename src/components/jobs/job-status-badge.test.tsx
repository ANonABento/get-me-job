import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JOB_STATUSES } from "@/lib/constants/jobs";
import { JobStatusBadge } from "./job-status-badge";

describe("JobStatusBadge", () => {
  it("renders the label for a known status", () => {
    render(<JobStatusBadge status="applied" />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("renders 'Interview' as the label for interviewing", () => {
    render(<JobStatusBadge status="interviewing" />);
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("falls back to 'Saved' for unknown status", () => {
    render(<JobStatusBadge status="unknown_status" />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("applies the correct semantic class for success states", () => {
    const { container } = render(<JobStatusBadge status="offered" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-success");
  });

  it("applies the correct semantic class for destructive states", () => {
    const { container } = render(<JobStatusBadge status="rejected" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-destructive");
  });

  it("applies the correct semantic class for muted states", () => {
    for (const status of ["saved", "pending", "dismissed", "withdrawn"]) {
      const { container } = render(<JobStatusBadge status={status} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-muted");
    }
  });

  it("accepts an additional className prop", () => {
    const { container } = render(<JobStatusBadge status="applied" className="extra-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("extra-class");
  });

  it("renders all known statuses without throwing", () => {
    for (const status of JOB_STATUSES) {
      expect(() => render(<JobStatusBadge status={status} />)).not.toThrow();
    }
  });
});
