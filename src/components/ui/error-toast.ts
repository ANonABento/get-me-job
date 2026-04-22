"use client";

import { getErrorMessage } from "./error-state";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastInput {
  type: ToastType;
  title: string;
  description?: string;
}

type AddToast = (toast: ToastInput) => void;

interface ErrorToastOptions {
  title: string;
  error?: unknown;
  description?: string;
  fallbackDescription?: string;
}

export function getResponseErrorMessage(
  body: unknown,
  fallbackMessage: string
): string {
  if (typeof body === "object" && body !== null) {
    if (
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
    ) {
      return (body as { error: string }).error;
    }
    if (
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
    ) {
      return (body as { message: string }).message;
    }
  }

  return fallbackMessage;
}

export function createErrorToast({
  title,
  error,
  description,
  fallbackDescription,
}: ErrorToastOptions): ToastInput {
  const errorMessage =
    error === undefined ? undefined : getErrorMessage(error);
  const resolvedDescription =
    description ??
    (errorMessage === "An unexpected error occurred"
      ? fallbackDescription
      : errorMessage) ??
    fallbackDescription;

  return {
    type: "error",
    title,
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
  };
}

export function showErrorToast(
  addToast: AddToast,
  options: ErrorToastOptions
) {
  addToast(createErrorToast(options));
}
