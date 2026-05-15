import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth, isDevAuthBypassAllowed, isNextAuthConfigured } from "@/auth";
import { AppBar } from "@/components/layout/app-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { TweaksPanel } from "@/components/layout/tweaks-panel";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { OnboardingDialog } from "@/components/onboarding";

export const dynamic = "force-dynamic";

async function AppShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <CommandPaletteProvider>
      <KeyboardShortcutsProvider>
        <ToastProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {t("skipToMain")}
          </a>
          <div
            className="flex h-screen flex-col text-foreground"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <div className="hidden lg:block">
              <AppBar />
            </div>
            <div className="flex min-h-0 flex-1">
              <Sidebar />
              <main
                id="main-content"
                className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-none pt-16 lg:pt-0"
                style={{ backgroundColor: "var(--bg)" }}
                role="main"
                aria-label={t("mainContent")}
                tabIndex={-1}
              >
                {children}
              </main>
            </div>
          </div>
          <TweaksPanel />
          <CommandPalette />
          <OnboardingDialog />
        </ToastProvider>
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
