import { render, screen } from "@testing-library/react";
import { Briefcase, Sparkles } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { QuickActionCard, QuickActionStrip } from "./quick-action-strip";

describe("QuickActionCard", () => {
  it("renders title, subtitle and icon", () => {
    render(
      <QuickActionCard
        icon={Briefcase}
        title="Add to Knowledge Bank"
        subtitle="Drop in a resume, notes, or review."
      />,
    );
    expect(screen.getByText("Add to Knowledge Bank")).toBeInTheDocument();
    expect(
      screen.getByText("Drop in a resume, notes, or review."),
    ).toBeInTheDocument();
  });

  it("renders a kbd chip from a string shortcut", () => {
    render(<QuickActionCard icon={Briefcase} title="x" shortcut="⌘ K" />);
    expect(screen.getByLabelText("⌘ K")).toBeInTheDocument();
  });

  it("renders a kbd chip from an array shortcut", () => {
    render(
      <QuickActionCard icon={Briefcase} title="x" shortcut={["⌘", "I"]} />,
    );
    expect(screen.getByLabelText("⌘ I")).toBeInTheDocument();
  });

  it("renders as a button by default", () => {
    render(<QuickActionCard icon={Briefcase} title="x" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as an anchor when href is provided", () => {
    render(<QuickActionCard icon={Briefcase} title="x" href="/somewhere" />);
    expect(screen.getByRole("link", { name: /x/i })).toHaveAttribute(
      "href",
      "/somewhere",
    );
  });

  it("invokes onClick", () => {
    const handler = vi.fn();
    render(<QuickActionCard icon={Briefcase} title="x" onClick={handler} />);
    screen.getByRole("button").click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("renders as a disabled button when disabled", () => {
    render(<QuickActionCard icon={Briefcase} title="x" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("falls back to button (ignoring href) when disabled", () => {
    render(<QuickActionCard icon={Briefcase} title="x" href="/x" disabled />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("QuickActionStrip", () => {
  it("renders children inside a responsive grid", () => {
    render(
      <QuickActionStrip>
        <QuickActionCard icon={Briefcase} title="One" />
        <QuickActionCard icon={Sparkles} title="Two" />
      </QuickActionStrip>,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("supports 3-column layout when cols=3", () => {
    const { container } = render(
      <QuickActionStrip cols={3}>
        <QuickActionCard icon={Briefcase} title="x" />
      </QuickActionStrip>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /lg:grid-cols-3/,
    );
  });
});
