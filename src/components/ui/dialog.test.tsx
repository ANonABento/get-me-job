import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

function AccessibleDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogContent className={className}>
      <DialogTitle className="sr-only">Test dialog heading</DialogTitle>
      <DialogDescription className="sr-only">
        Test dialog description
      </DialogDescription>
      {children}
    </DialogContent>
  );
}

describe("Dialog", () => {
  it("should not render content by default", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });

  it("should render trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <AccessibleDialogContent>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </AccessibleDialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText("Open"));

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });

  it("should render DialogHeader with correct classes", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogHeader data-testid="header">Header Content</DialogHeader>
        </AccessibleDialogContent>
      </Dialog>
    );

    const header = screen.getByTestId("header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("space-y-1.5");
  });

  it("should render DialogFooter with correct classes", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogFooter data-testid="footer">Footer Content</DialogFooter>
        </AccessibleDialogContent>
      </Dialog>
    );

    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("flex-col-reverse");
  });

  it("should render DialogTitle with correct classes", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle>My Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    const title = screen.getByText("My Title");
    expect(title).toHaveClass("text-lg");
    expect(title).toHaveClass("font-semibold");
  });

  it("should render DialogDescription with correct classes", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogDescription>My Description</DialogDescription>
        </AccessibleDialogContent>
      </Dialog>
    );

    const description = screen.getByText("My Description");
    expect(description).toHaveClass("text-sm");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("should render close button in DialogContent", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    // Close button has sr-only text
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("should close dialog when close button is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should render with controlled open state", async () => {
    const { rerender } = render(
      <Dialog open={false}>
        <AccessibleDialogContent>
          <DialogTitle>Controlled Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Controlled Title")).not.toBeInTheDocument();

    rerender(
      <Dialog open={true}>
        <AccessibleDialogContent>
          <DialogTitle>Controlled Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByText("Controlled Title")).toBeInTheDocument();
  });

  it("should merge custom className on DialogContent", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent className="custom-dialog">
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    const content = screen.getByText("Title").closest("[class*='custom-dialog']");
    expect(content).toBeInTheDocument();
  });

  it("should merge custom className on DialogHeader", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogHeader className="custom-header" data-testid="header">
            Header
          </DialogHeader>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("header")).toHaveClass("custom-header");
  });

  it("should merge custom className on DialogFooter", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogFooter className="custom-footer" data-testid="footer">
            Footer
          </DialogFooter>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("footer")).toHaveClass("custom-footer");
  });

  it("should merge custom className on DialogTitle", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle className="custom-title">Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByText("Title")).toHaveClass("custom-title");
  });

  it("should merge custom className on DialogDescription", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogDescription className="custom-description">
            Description
          </DialogDescription>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByText("Description")).toHaveClass("custom-description");
  });

  it("should render DialogClose component", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose data-testid="custom-close">Close Me</DialogClose>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("custom-close")).toBeInTheDocument();
    expect(screen.getByText("Close Me")).toBeInTheDocument();
  });

  it("should not have slide animation classes that cause position jump", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    const content = screen.getByRole("dialog");
    const className = content.className;

    // Should NOT have slide-in/slide-out classes that cause corner spawning
    expect(className).not.toContain("slide-in-from-left");
    expect(className).not.toContain("slide-in-from-top");
    expect(className).not.toContain("slide-out-to-left");
    expect(className).not.toContain("slide-out-to-top");

    // Should still have zoom and fade animations for smooth center appearance
    expect(className).toContain("zoom-in-95");
    expect(className).toContain("zoom-out-95");
    expect(className).toContain("fade-in-0");
    expect(className).toContain("fade-out-0");
  });

  it("should be centered with translate-x and translate-y", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogTitle>Title</DialogTitle>
        </AccessibleDialogContent>
      </Dialog>
    );

    const content = screen.getByRole("dialog");
    const className = content.className;

    expect(className).toContain("left-[50%]");
    expect(className).toContain("top-[50%]");
    expect(className).toContain("translate-x-[-50%]");
    expect(className).toContain("translate-y-[-50%]");
  });

  it("should render dialog with full structure", async () => {
    render(
      <Dialog open>
        <AccessibleDialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </AccessibleDialogContent>
      </Dialog>
    );

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });
});
