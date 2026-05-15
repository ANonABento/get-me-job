import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { getSiteMetadata } from "@/lib/seo";

vi.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({ variable: "--font-jetbrains" }),
  Outfit: () => ({ variable: "--font-outfit" }),
  Space_Grotesk: () => ({ variable: "--font-space" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-jakarta" }),
  Inter_Tight: () => ({ variable: "--font-inter" }),
  DM_Sans: () => ({ variable: "--font-dm" }),
}));

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "--font-geist-sans" },
}));

vi.mock("@/components/auth/session-provider", () => ({
  AuthSessionProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

import { generateMetadata } from "./[locale]/layout";

describe("localized app layout metadata", () => {
  it("uses the shared site metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } })).toEqual({
      ...getSiteMetadata(),
      alternates: {
        canonical: "/en",
        languages: {
          "x-default": "/en",
          en: "/en",
          es: "/es",
          "zh-CN": "/zh-CN",
          "pt-BR": "/pt-BR",
          hi: "/hi",
          fr: "/fr",
          ja: "/ja",
          ko: "/ko",
        },
      },
    });
  });
});
