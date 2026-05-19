import { getTranslations } from "next-intl/server";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { AnnouncementBar } from "@/components/landing/primitives";
import { ToastProvider } from "@/components/ui/toast";

/**
 * Marketing layout — shared chrome (announcement bar + nav + footer)
 * around every page in the (marketing) route group.
 *
 * The optional announcement bar lives ABOVE the navbar in DOM order
 * but renders inside the main content (NOT fixed-positioned), so it
 * scrolls away naturally. The fixed navbar overlays it at scrollY=0;
 * once the user scrolls past ~30px the bar disappears under the nav.
 * This is a deliberate tradeoff to avoid coupling navbar offsets to
 * announcement state — Phase 1b's navbar refresh can revisit.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // skipToMain lives in the `nav` namespace, not `a11y` — using the
  // a11yT translator here was the source of a type-check break on main.
  const navT = await getTranslations("nav");

  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {navT("skipToMain")}
      </a>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        {/* pt-20 (80px) clears the fixed navbar's unscrolled height
            (py-5 + h-10 logo = ~80px). The navbar transitions to py-3
            on scroll but the top of every page should clear the
            un-scrolled state so heroes don't slip under the bar. */}
        <main id="main-content" className="flex-1 pt-20">
          <MarketingAnnouncement />
          {children}
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

/**
 * Renders the announcement bar only when
 * `NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_BODY` is set. Body string can
 * include the trailing arrow; keep it short — the bar is 32px tall.
 *
 * Optional companion env vars:
 *   - `NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_BADGE` (default "New")
 *   - `NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_REINFORCE` (bold lead line)
 *   - `NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_HREF` (makes the bar clickable)
 */
function MarketingAnnouncement() {
  const body = process.env.NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_BODY;
  if (!body) return null;
  const badge = process.env.NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_BADGE ?? "New";
  const reinforce = process.env.NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_REINFORCE;
  const href = process.env.NEXT_PUBLIC_MARKETING_ANNOUNCEMENT_HREF;
  return (
    <AnnouncementBar
      badge={badge}
      body={body}
      reinforce={reinforce}
      href={href}
    />
  );
}
