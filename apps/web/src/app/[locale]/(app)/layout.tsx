import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth, isDevAuthBypassAllowed, isNextAuthConfigured } from "@/auth";
import { AppBar } from "@/components/layout/app-bar";
import { ChromeProvider } from "@/components/layout/chrome-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { RouteScrollReset } from "@/components/layout/route-scroll-reset";
import { TweaksPanel } from "@/components/layout/tweaks-panel";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import type { Metadata } from "next";
import { OnboardingDialog } from "@/components/onboarding";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

async function AppShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <CommandPaletteProvider>
      <KeyboardShortcutsProvider>
        <ChromeProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            <ToastProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {t("skipToMain")}
              </a>
              {/*
            Layout shape:
            - Desktop: sidebar is a full-height column on the left
              (logo + nav + bottom area). AppBar lives inside the right
              column, above the main content, so when it's hidden the
              sidebar stays anchored to the top and the logo never moves.
            - Mobile: sidebar is an off-canvas drawer (handled inside
              Sidebar itself). AppBar is hidden on mobile via `lg:flex`.
          */}
              <div
                className="flex h-screen text-foreground"
                style={{ backgroundColor: "var(--bg)" }}
              >
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="hidden lg:block">
                    <AppBar />
                  </div>
                  <main
                    id="main-content"
                    className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-none pt-16 lg:pt-0"
                    style={{ backgroundColor: "var(--bg)" }}
                    role="main"
                    aria-label={t("mainContent")}
                    tabIndex={-1}
                  >
                    <RouteScrollReset />
                    {children}
                  </main>
                </div>
              </div>
              <TweaksPanel />
              <CommandPalette />
              <OnboardingDialog />
            </ToastProvider>
          </TooltipProvider>
        </ChromeProvider>
      </KeyboardShortcutsProvider>
    </CommandPaletteProvider>
  );
}

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isNextAuthConfigured()) {
    if (isDevAuthBypassAllowed()) {
      return <AppShell>{children}</AppShell>;
    }

    redirect(`/${params.locale}/sign-in?error=auth-unavailable`);
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect(
      `/${params.locale}/sign-in?callbackUrl=${encodeURIComponent(
        `/${params.locale}/dashboard`,
      )}`,
    );
  }

  return <AppShell>{children}</AppShell>;
}
