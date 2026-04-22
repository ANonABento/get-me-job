import { describe, expect, it, vi } from "vitest";

import {
  createErrorToast,
  getResponseErrorMessage,
  showErrorToast,
} from "./error-toast";

describe("error-toast", () => {
  it("builds an error toast from an Error instance", () => {
    expect(
      createErrorToast({
        title: "Couldn't load dashboard",
        error: new Error("Request timed out"),
      })
    ).toEqual({
      type: "error",
      title: "Couldn't load dashboard",
      description: "Request timed out",
    });
  });

  it("prefers an explicit description over the error message", () => {
    expect(
      createErrorToast({
        title: "Upload failed",
        error: new Error("Too much detail"),
        description: "Please try a different file.",
      })
    ).toEqual({
      type: "error",
      title: "Upload failed",
      description: "Please try a different file.",
    });
  });

  it("falls back when the error message is not useful", () => {
    expect(
      createErrorToast({
        title: "Couldn't load templates",
        error: { unexpected: true },
        fallbackDescription: "Please refresh and try again.",
      })
    ).toEqual({
      type: "error",
      title: "Couldn't load templates",
      description: "Please refresh and try again.",
    });
  });

  it("passes the generated toast to addToast", () => {
    const addToast = vi.fn();

    showErrorToast(addToast, {
      title: "Couldn't delete source file",
      error: "Permission denied",
    });

    expect(addToast).toHaveBeenCalledWith({
      type: "error",
      title: "Couldn't delete source file",
      description: "Permission denied",
    });
  });

  it("extracts API error text from a response body", () => {
    expect(
      getResponseErrorMessage(
        { error: "Template service unavailable" },
        "Failed to load templates"
      )
    ).toBe("Template service unavailable");
  });

  it("falls back when an API response body has no usable message", () => {
    expect(
      getResponseErrorMessage(
        { status: "bad" },
        "Failed to generate preview"
      )
    ).toBe("Failed to generate preview");
  });
});
