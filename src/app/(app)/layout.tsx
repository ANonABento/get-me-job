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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-background">
            <div className="lg:hidden h-16" />
            {children}
          </main>
        </div>
        <OnboardingDialog />
      </ToastProvider>
    </KeyboardShortcutsProvider>
  );
}
