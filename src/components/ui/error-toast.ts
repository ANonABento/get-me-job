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
