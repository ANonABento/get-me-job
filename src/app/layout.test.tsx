import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { getSiteMetadata } from "@/lib/seo";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "--font-sans" }),
}));

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

import { metadata } from "./layout";

describe("app layout metadata", () => {
  it("uses the shared site metadata", () => {
    expect(metadata).toEqual(getSiteMetadata());
  });
});
