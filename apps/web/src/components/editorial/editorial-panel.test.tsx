import { render, screen } from "@testing-library/react";
import { Briefcase } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  EditorialPanel,
  EditorialPanelBody,
  EditorialPanelFooter,
  EditorialPanelHeader,
} from "./editorial-panel";

describe("EditorialPanel", () => {
  it("renders a paper-card section with editorial chrome", () => {
    render(
      <EditorialPanel>
        <span data-testid="kid">Body</span>
      </EditorialPanel>,
    );
    const panel = screen.getByTestId("kid").parentElement;
    expect(panel?.tagName).toBe("SECTION");
    expect(panel?.className).toMatch(/border-rule/);
    expect(panel?.className).toMatch(/bg-paper/);
  });

  it("accepts a custom element type", () => {
    render(
      <EditorialPanel as="aside">
        <span data-testid="kid">x</span>
      </EditorialPanel>,
    );
    expect(screen.getByTestId("kid").parentElement?.tagName).toBe("ASIDE");
  });
});

describe("EditorialPanelHeader", () => {
  it("renders the title and eyebrow", () => {
    render(<EditorialPanelHeader title="Today" eyebrow="INSIDE SLOTHING" />);
    expect(screen.getByRole("heading", { name: "Today" })).toBeVisible();
    expect(screen.getByText("INSIDE SLOTHING")).toBeVisible();
  });

  it("renders an icon when supplied", () => {
    const { container } = render(
      <EditorialPanelHeader title="Opportunities" icon={Briefcase} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders the right-aligned action slot", () => {
    render(
      <EditorialPanelHeader title="Today" action={<button>View all</button>} />,
    );
    expect(
      screen.getByRole("button", { name: "View all" }),
    ).toBeInTheDocument();
  });
});

describe("EditorialPanelBody", () => {
  it("adds the app-shell-panel padding class by default", () => {
    const { container } = render(
      <EditorialPanelBody>
        <p>x</p>
      </EditorialPanelBody>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /app-shell-panel/,
    );
  });

  it("drops the padding class when flush=true", () => {
    const { container } = render(
      <EditorialPanelBody flush>
        <p>x</p>
      </EditorialPanelBody>,
    );
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /app-shell-panel/,
    );
  });
});

describe("EditorialPanelFooter", () => {
  it("renders with a top hairline rule and ink-3 text", () => {
    const { container } = render(
      <EditorialPanelFooter>3 items hidden</EditorialPanelFooter>,
    );
    const foot = container.firstChild as HTMLElement;
    expect(foot.className).toMatch(/border-t/);
    expect(foot.className).toMatch(/text-ink-3/);
    expect(foot.textContent).toBe("3 items hidden");
  });
});
