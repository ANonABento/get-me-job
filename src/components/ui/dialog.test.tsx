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

describe("Dialog", () => {
  it("should not render content by default", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });

  it("should render trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
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
        <DialogContent>
          <DialogHeader data-testid="header">Header Content</DialogHeader>
        </DialogContent>
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
        <DialogContent>
          <DialogFooter data-testid="footer">Footer Content</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("flex-col-reverse");
  });

  it("should render DialogTitle with correct classes", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const title = screen.getByText("My Title");
    expect(title).toHaveClass("text-lg");
    expect(title).toHaveClass("font-semibold");
  });

  it("should render DialogDescription with correct classes", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription>My Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const description = screen.getByText("My Description");
    expect(description).toHaveClass("text-sm");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("should render close button in DialogContent", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    // Close button has sr-only text
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("should close dialog when close button is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should render with controlled open state", async () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Controlled Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Controlled Title")).not.toBeInTheDocument();

    rerender(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Controlled Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Controlled Title")).toBeInTheDocument();
  });

  it("should merge custom className on DialogContent", async () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByText("Title").closest("[class*='custom-dialog']");
    expect(content).toBeInTheDocument();
  });

  it("should merge custom className on DialogHeader", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader className="custom-header" data-testid="header">
            Header
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("header")).toHaveClass("custom-header");
  });

  it("should merge custom className on DialogFooter", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter className="custom-footer" data-testid="footer">
            Footer
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("footer")).toHaveClass("custom-footer");
  });

  it("should merge custom className on DialogTitle", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="custom-title">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Title")).toHaveClass("custom-title");
  });

  it("should merge custom className on DialogDescription", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription className="custom-description">
            Description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Description")).toHaveClass("custom-description");
  });

  it("should render DialogClose component", async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose data-testid="custom-close">Close Me</DialogClose>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId("custom-close")).toBeInTheDocument();
    expect(screen.getByText("Close Me")).toBeInTheDocument();
  });

  it("should render dialog with full structure", async () => {
    render(
      <Dialog open>
        <DialogContent>
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
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });
});
