import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { SettingsNav } from "./settings-nav";

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
}

beforeAll(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: StubIntersectionObserver,
  });
});

describe("SettingsNav", () => {
  it("renders an anchor link per item and exposes the nav label", () => {
    render(
      <SettingsNav
        items={[
          { id: "account", label: "Account" },
          { id: "appearance", label: "Appearance" },
          { id: "danger", label: "Danger zone", destructive: true },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: /settings sections/i });
    expect(nav).toBeInTheDocument();

    const account = screen.getByRole("link", { name: "Account" });
    expect(account).toHaveAttribute("href", "#account");

    const appearance = screen.getByRole("link", { name: "Appearance" });
    expect(appearance).toHaveAttribute("href", "#appearance");

    // The destructive item still renders as a link — colour change only.
    const danger = screen.getByRole("link", { name: "Danger zone" });
    expect(danger).toHaveAttribute("href", "#danger");
    expect(danger.className).toMatch(/destructive/);
  });

  it("falls back to the first item as active before scroll-spy fires", () => {
    render(
      <SettingsNav
        items={[
          { id: "first", label: "First" },
          { id: "second", label: "Second" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "First" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Second" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders an optional hint badge next to a label", () => {
    render(<SettingsNav items={[{ id: "ai", label: "AI", hint: "ok" }]} />);

    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
