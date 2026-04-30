"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-[var(--radius)] border-[length:var(--border-width)] bg-card p-6 shadow-[var(--shadow-card)] [backdrop-filter:var(--backdrop-blur)]">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg mb-2 [text-transform:var(--text-transform)]">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md [letter-spacing:var(--letter-spacing)]">
              {this.state.error?.message ||
                "An unexpected error occurred while loading this component."}
            </p>
            <Button onClick={this.handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface AsyncBoundaryProps {
  children: ReactNode;
  error?: ReactNode;
}

export function AsyncBoundary({ children, error }: AsyncBoundaryProps) {
  return <ErrorBoundary fallback={error}>{children}</ErrorBoundary>;
}
