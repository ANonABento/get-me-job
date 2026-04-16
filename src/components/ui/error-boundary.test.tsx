import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary, AsyncBoundary } from "./error-boundary";

// Component that throws on render
function ThrowingComponent({ message }: { message: string }): never {
  throw new Error(message);
}

// Suppress console.error for expected errors in tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello world</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("should render default fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Test error" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <ThrowingComponent message="Test error" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent message="Callback test" />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("Callback test");
  });

  it("should reset error state when Try Again is clicked", () => {
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) throw new Error("Conditional error");
      return <p>Recovered</p>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });
});

describe("AsyncBoundary", () => {
  it("should render children when no error", () => {
    render(
      <AsyncBoundary>
        <p>Content</p>
      </AsyncBoundary>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render custom error fallback", () => {
    render(
      <AsyncBoundary error={<p>Async error</p>}>
        <ThrowingComponent message="fail" />
      </AsyncBoundary>
    );
    expect(screen.getByText("Async error")).toBeInTheDocument();
  });
});
