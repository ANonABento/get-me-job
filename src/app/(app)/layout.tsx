import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { OnboardingDialog } from "@/components/onboarding";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardShortcutsProvider>
      <ToastProvider>
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen">
          <Sidebar />
          <main
            id="main-content"
            className="flex-1 overflow-auto bg-background"
            role="main"
            aria-label="Main content"
          >
            <div className="lg:hidden h-16" aria-hidden="true" />
            {children}
          </main>
        </div>
        <OnboardingDialog />
      </ToastProvider>
    </KeyboardShortcutsProvider>
  );
}
