import { ClerkProvider } from "@clerk/nextjs";
import type { CSSProperties } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ensureEnvValidated } from "@/lib/env";
import { getSiteMetadata } from "@/lib/seo";
import { getThemeVariables } from "@/lib/theme/theme-config";

ensureEnvValidated();

export const metadata = getSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const app = (
    <html
      lang="en"
      suppressHydrationWarning
      style={getThemeVariables("default", "light") as CSSProperties}
    >
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
