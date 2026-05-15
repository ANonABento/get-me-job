import { render, screen } from "@testing-library/react";
import { Settings } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  AppPage,
  CenteredPagePanel,
  PageContent,
  PageHeader,
  PageIconTile,
  PageLoadingState,
  PagePanel,
  PagePanelHeader,
  PageSection,
  PageWorkspace,
  StandardEmptyState,
  getPageWidthClassName,
} from "./page-layout";

const settingsTitle = "Settings";
const emptyTitle = "Nothing here";
const panelTitle = "Panel title";
const sectionTitle = "Shared section";

describe("page layout helpers", () => {
  it("returns the expected width classes", () => {
    expect(getPageWidthClassName("full")).toBe("");
    expect(getPageWidthClassName("narrow")).toBe("mx-auto max-w-3xl");
    // `wide` is full-bleed now that we've dropped the coach rail; the
    // previous `max-w-screen-2xl` cap stranded content on wide viewports.
    expect(getPageWidthClassName("wide")).toBe("");
  });

  it("renders a standard page header", () => {
    render(
      <PageHeader
        icon={Settings}
        title={settingsTitle}
        description="Configure the app."
        actions={<button>Save</button>}
        width="narrow"
      />,
    );

    expect(screen.getByRole("banner")).toHaveClass("border-b", "bg-card/70");
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveClass(
      "text-3xl",
    );
    expect(screen.getByText("Configure the app.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("keeps page header descriptions at a readable prose width", () => {
    render(
      <PageHeader
        icon={Settings}
        title={settingsTitle}
        description="Configure the app."
      />,
    );

    const description = screen.getByText("Configure the app.");
    expect(description).toHaveClass("max-w-prose");
    expect(description).not.toHaveClass("max-w-2xl");
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
      "px-6",
      "py-6",
      "max-w-3xl",
    );
  });

  it("renders the standard empty state", () => {
    render(
      <StandardEmptyState
        icon={Settings}
        title={emptyTitle}
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

  it("renders shared panel and loading primitives", () => {
    render(
      <>
        <PageWorkspace>Workspace body</PageWorkspace>
        <CenteredPagePanel>Centered body</CenteredPagePanel>
        <PagePanel>
          <PagePanelHeader icon={Settings} title={panelTitle} />
          Panel body
        </PagePanel>
        <PageIconTile icon={Settings} />
        <PageLoadingState icon={Settings} label="Loading page..." />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Panel title" })).toHaveClass(
      "text-xl",
    );
    expect(screen.getByText("Panel body")).toHaveClass(
      "rounded-lg",
      "border",
      "bg-card",
    );
    expect(screen.getByText("Workspace body")).toHaveClass(
      "h-[calc(100vh-4rem)]",
      "lg:h-screen",
    );
    expect(screen.getByText("Centered body")).toHaveClass("max-w-md");
    expect(screen.getByText("Loading page...")).toHaveClass(
      "text-muted-foreground",
    );
  });

  it("renders a reusable page section with standard title, icon, and action", () => {
    render(
      <PageSection
        icon={Settings}
        title={sectionTitle}
        description="Consistent surface."
        action={<button>Manage</button>}
      >
        Section body
      </PageSection>,
    );

    expect(screen.getByRole("heading", { name: "Shared section" })).toHaveClass(
      "font-semibold",
    );
    expect(screen.getByText("Consistent surface.")).toHaveClass(
      "text-muted-foreground",
    );
    expect(screen.getByRole("button", { name: "Manage" })).toBeInTheDocument();
    expect(screen.getByText("Section body").parentElement).toHaveClass(
      "rounded-lg",
      "border",
      "bg-card",
    );
  });
});
