import { fireEvent, render, screen } from "@testing-library/react";
import { Briefcase, Calendar, Mic, Upload } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import {
  EmptyIllustration,
  ErrorEmptyState,
  HowItWorksDiagram,
  OnboardingEmptyState,
  PrerequisiteEmptyState,
  ZeroResultEmptyState,
} from "./empty-states";

describe("EmptyIllustration", () => {
  it("renders an image when name is provided", () => {
    render(<EmptyIllustration name="components-zero" alt="Components" />);
    const img = screen.getByAltText("Components") as HTMLImageElement;
    expect(img.src).toContain("/illustrations/empty/components-zero.svg");
  });

  it("tries raster fallbacks before falling back to the icon disc", () => {
    const { container } = render(
      <EmptyIllustration
        name="components-zero"
        alt="Components"
        icon={Upload}
      />,
    );

    let img = screen.getByAltText("Components") as HTMLImageElement;
    expect(img.src).toContain("/illustrations/empty/components-zero.svg");

    fireEvent.error(img);
    img = screen.getByAltText("Components") as HTMLImageElement;
    expect(img.src).toContain("/illustrations/empty/components-zero.webp");

    fireEvent.error(img);
    img = screen.getByAltText("Components") as HTMLImageElement;
    expect(img.src).toContain("/illustrations/empty/components-zero.png");

    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("allows an explicit supported extension", () => {
    render(<EmptyIllustration name="components-zero.webp" alt="Components" />);
    const img = screen.getByAltText("Components") as HTMLImageElement;
    expect(img.src).toContain("/illustrations/empty/components-zero.webp");
  });

  it("falls back to the icon disc when name is omitted", () => {
    const { container } = render(<EmptyIllustration icon={Upload} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders nothing when neither name nor icon are provided", () => {
    const { container } = render(<EmptyIllustration />);
    expect(container.firstChild).toBeNull();
  });
});

describe("HowItWorksDiagram", () => {
  it("renders one numbered item per step", () => {
    render(
      <HowItWorksDiagram
        steps={[
          { label: "Upload resume" },
          { label: "We extract bullets" },
          { label: "Studio composes a doc" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(screen.getByText("Upload resume")).toBeInTheDocument();
    expect(screen.getByText("Studio composes a doc")).toBeInTheDocument();
  });

  it("renders nothing when steps is empty", () => {
    const { container } = render(<HowItWorksDiagram steps={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("OnboardingEmptyState", () => {
  it("renders title, description, steps, and actions", () => {
    render(
      <OnboardingEmptyState
        title="Let's get started"
        description="Upload a resume to begin."
        icon={Upload}
        steps={[
          { label: "Upload" },
          { label: "Extract" },
          { label: "Compose" },
        ]}
        primaryAction={<button>Upload</button>}
        secondaryAction={<button>Paste manually</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Let's get started" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upload a resume to begin.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Paste manually" }),
    ).toBeInTheDocument();
  });
});

describe("ZeroResultEmptyState", () => {
  it("renders filter chips and fires onRemove", () => {
    const onRemove = vi.fn();
    render(
      <ZeroResultEmptyState
        filters={[
          { label: "Status: Applied", onRemove },
          { label: "Source: LinkedIn" },
        ]}
        action={<button>Clear filters</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Remove Status: Applied/ }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Remove Status: Applied/ }),
    );
    expect(onRemove).toHaveBeenCalledOnce();
    expect(screen.getByText("Source: LinkedIn")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });

  it("uses default copy when no props supplied", () => {
    render(<ZeroResultEmptyState />);
    expect(
      screen.getByRole("heading", { name: "No matches" }),
    ).toBeInTheDocument();
  });
});

describe("ErrorEmptyState", () => {
  it("renders an alert role with code and retry action", () => {
    render(
      <ErrorEmptyState
        code="ERR_FETCH_OPPORTUNITIES"
        action={<button>Retry</button>}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("ERR_FETCH_OPPORTUNITIES")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

describe("PrerequisiteEmptyState", () => {
  it("renders the supplied icon, title, and action", () => {
    const { container } = render(
      <PrerequisiteEmptyState
        icon={Briefcase}
        title="Add a resume first"
        description="The ATS scanner needs a resume to compare against."
        action={<button>Add resume</button>}
        secondaryAction={<button>Use sample</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Add a resume first" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add resume" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use sample" }),
    ).toBeInTheDocument();
    // sanity: the supplied icon (Briefcase) gets rendered as svg
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("smoke renders with default Lock icon and minimal props", () => {
    // Calendar is unused here but imported elsewhere — keeps tree-shake honest
    expect(Calendar).toBeDefined();
    expect(Mic).toBeDefined();
    render(<PrerequisiteEmptyState title="Locked" />);
    expect(screen.getByRole("heading", { name: "Locked" })).toBeInTheDocument();
  });
});
