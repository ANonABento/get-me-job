import { render, screen } from "@testing-library/react";
import { Settings } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  AppPage,
  PageContent,
  PageHeader,
  StandardEmptyState,
  getPageWidthClassName,
} from "./page-layout";

describe("page layout helpers", () => {
  it("returns the expected width classes", () => {
    expect(getPageWidthClassName("full")).toBe("");
    expect(getPageWidthClassName("narrow")).toBe("mx-auto max-w-3xl");
    expect(getPageWidthClassName("wide")).toBe("mx-auto max-w-6xl");
  });

  it("renders a standard page header", () => {
    render(
      <PageHeader
        icon={Settings}
        eyebrow="Configuration"
        title="Settings"
        description="Configure the app."
        actions={<button>Save</button>}
        width="narrow"
      />,
    );

    expect(screen.getByRole("banner")).toHaveClass("border-b", "bg-card/70");
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveClass(
      "text-3xl",
    );
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Configure the app.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("applies page and content spacing consistently", () => {
    const { container } = render(
      <AppPage>
        <PageContent width="narrow">Content</PageContent>
      </AppPage>,
    );

    expect(container.firstChild).toHaveClass(
      "min-h-screen",
      "bg-background",
      "pb-24",
    );
    expect(screen.getByText("Content")).toHaveClass(
      "px-5",
      "py-6",
      "max-w-3xl",
    );
  });

  it("renders the standard empty state", () => {
    render(
      <StandardEmptyState
        icon={Settings}
        title="Nothing here"
        description="Try another filter."
        action={<button>Reset</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Nothing here" })).toHaveClass(
      "text-lg",
    );
    expect(screen.getByText("Try another filter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});
