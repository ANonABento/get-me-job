import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState, getErrorMessage, ErrorBoundaryFallback } from "./error-state";

describe("ErrorState", () => {
  it("should render default title and message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We couldn't complete your request. Please try again.")
    ).toBeInTheDocument();
  });

  it("should render custom title and message", () => {
    render(<ErrorState title="Not Found" message="Page does not exist" />);
    expect(screen.getByText("Not Found")).toBeInTheDocument();
    expect(screen.getByText("Page does not exist")).toBeInTheDocument();
  });

  it("should render retry button when onRetry provided", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const button = screen.getByText("Try Again");
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should render dismiss button when onDismiss provided", () => {
    const onDismiss = vi.fn();
    render(<ErrorState onDismiss={onDismiss} />);
    const button = screen.getByText("Dismiss");
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not render action buttons when no callbacks", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    expect(screen.queryByText("Dismiss")).not.toBeInTheDocument();
  });

  describe("inline variant", () => {
    it("should render inline layout", () => {
      const onRetry = vi.fn();
      render(<ErrorState variant="inline" title="Inline Error" onRetry={onRetry} />);
      expect(screen.getByText("Inline Error")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should render dismiss icon button when onDismiss provided", () => {
      const onDismiss = vi.fn();
      render(<ErrorState variant="inline" onDismiss={onDismiss} />);
      // The dismiss button uses an XCircle icon
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("card variant", () => {
    it("should render card layout", () => {
      render(<ErrorState variant="card" title="Card Error" />);
      expect(screen.getByText("Card Error")).toBeInTheDocument();
    });

    it("should render retry and dismiss in card", () => {
      const onRetry = vi.fn();
      const onDismiss = vi.fn();
      render(
        <ErrorState variant="card" onRetry={onRetry} onDismiss={onDismiss} />
      );
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });
  });
});

describe("getErrorMessage", () => {
  it("should extract message from Error instance", () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
  });

  it("should return string directly", () => {
    expect(getErrorMessage("plain string")).toBe("plain string");
  });

  it("should extract message from object with message", () => {
    expect(getErrorMessage({ message: "obj message" })).toBe("obj message");
  });

  it("should extract error from object with error field", () => {
    expect(getErrorMessage({ error: "obj error" })).toBe("obj error");
  });

  it("should return default for unknown types", () => {
    expect(getErrorMessage(42)).toBe("An unexpected error occurred");
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
  });
});

describe("ErrorBoundaryFallback", () => {
  it("should render error message with retry", () => {
    const resetFn = vi.fn();
    render(
      <ErrorBoundaryFallback
        error={new Error("Boundary error")}
        resetErrorBoundary={resetFn}
      />
    );
    expect(screen.getByText("Application Error")).toBeInTheDocument();
    expect(screen.getByText("Boundary error")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Try Again"));
    expect(resetFn).toHaveBeenCalledTimes(1);
  });
});
