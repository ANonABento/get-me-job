import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { OnboardingDialog } from "@/components/onboarding";

export const dynamic = "force-dynamic";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardShortcutsProvider>
      <ToastProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />
          <main
            id="main-content"
            className="flex-1 overflow-x-hidden overflow-y-auto bg-background"
            role="main"
            aria-label="Main content"
          >
            <div className="lg:hidden h-16" aria-hidden="true" />
            {children}
          </main>
        </div>
        <CommandPalette />
        <OnboardingDialog />
      </ToastProvider>
    </KeyboardShortcutsProvider>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return <AppShell>{children}</AppShell>;
  }

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/dashboard" });
  }

  return <AppShell>{children}</AppShell>;
}
