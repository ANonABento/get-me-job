import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ensureEnvValidated } from "@/lib/env";

ensureEnvValidated();

const SITE_NAME = "Taida";
const SITE_TITLE = `${SITE_NAME} — AI-Powered Job Application Assistant`;
const SITE_DESCRIPTION =
  "AI-powered job application assistant — resume tailoring, interview prep, and application tracking to land your dream job.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://taida.app"
  ),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const app = (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return app;
  }

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {app}
    </ClerkProvider>
  );
}
