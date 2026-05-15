import "./globals.css";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import {
  DM_Sans,
  Inter_Tight,
  JetBrains_Mono,
  Outfit,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import {
  EditorialPrefsProvider,
  editorialPrefsPreloadScript,
} from "@/lib/editorial-prefs";
import { isAppLocale, localeDir, type AppLocale } from "@/i18n";
import { ensureEnvValidated } from "@/lib/env";
import {
  CANONICAL_ROUTE_PATH_HEADER,
  getAlternateLanguages,
  getMetadataBase,
  getSiteMetadata,
} from "@/lib/seo";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { themeTokensToCssVariables } from "@/lib/theme/apply";
import { getThemePreloadScript } from "@/lib/theme/preload-script";
import { getTheme } from "@/lib/theme/registry";

ensureEnvValidated();

// Geist Sans ships from Vercel's `geist` package (next/font/google doesn't expose it on Next 14.2).
const geistVariable = GeistSans.variable;
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500"],
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["700"],
  display: "swap",
});
// The remaining four feed the `data-display` selectors in globals.css so the
// Tweaks display picker actually swaps fonts instead of falling back to
// system sans.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["700"],
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["700"],
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["700"],
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = getSiteMetadata();

function AlternateLanguageLinks({ path }: { path: string }) {
  const metadataBase = getMetadataBase();
  return Object.entries(getAlternateLanguages(path)).map(([language, href]) => (
    <link
      key={`hreflang-${language}`}
      rel="alternate"
      href={new URL(href, metadataBase).toString()}
      hrefLang={language}
    />
  ));
}

/**
 * Root layout. Only this layout renders <html> and <body> — the nested
 * [locale]/layout.tsx is a passthrough so we don't end up with duplicate
 * shells in SSR (which previously surfaced as a chain of React hydration
 * warnings: "html cannot be a child of body" / "mounting a new html
 * component").
 *
 * The locale, dir, font className, theme tokens, and preload scripts all
 * resolve here so they're in the SSR HTML on the first paint.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  if (!isAppLocale(locale)) {
    notFound();
  }

  const appLocale = locale as AppLocale;
  const messages = await getMessages({ locale: appLocale });
  const requestHeaders = headers();
  // Only forward the per-request nonce to the inline scripts in production —
  // in dev the CSP falls back to 'unsafe-inline', and emitting a dynamic
  // nonce attribute would cause a hydration mismatch on every render.
  const nonce =
    process.env.NODE_ENV === "production"
      ? (requestHeaders.get(CSP_NONCE_HEADER) ?? undefined)
      : undefined;
  const routePath = requestHeaders.get(CANONICAL_ROUTE_PATH_HEADER) ?? "/";
  const fontClassName = [
    geistVariable,
    jetbrainsMono.variable,
    outfit.variable,
    spaceGrotesk.variable,
    plusJakarta.variable,
    interTight.variable,
    dmSans.variable,
  ].join(" ");

  return (
    <html
      lang={appLocale}
      dir={localeDir(appLocale)}
      suppressHydrationWarning
      data-palette="cream"
      data-accent="rust"
      data-display="outfit"
      data-radius="soft"
      className={fontClassName}
      style={
        themeTokensToCssVariables(getTheme("slothing").light) as CSSProperties
      }
    >
      <head>
        <AlternateLanguageLinks path={routePath} />
        {/* Preload scripts mutate documentElement before React hydration;
            both are wrapped in suppressHydrationWarning. */}
        <script
          {...(nonce ? { nonce } : {})}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getThemePreloadScript() }}
        />
        <script
          {...(nonce ? { nonce } : {})}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: editorialPrefsPreloadScript }}
        />
      </head>
      <body className="font-body">
        <AuthSessionProvider>
          <ThemeProvider>
            <EditorialPrefsProvider>
              <NextIntlClientProvider
                locale={appLocale}
                messages={messages}
                timeZone="UTC"
              >
                {children}
              </NextIntlClientProvider>
            </EditorialPrefsProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
