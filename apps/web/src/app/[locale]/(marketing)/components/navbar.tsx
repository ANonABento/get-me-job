"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Menu, X, Moon, Sun } from "lucide-react";
import { LocaleSwitcherCompact } from "@/components/i18n/locale-switcher";
import { Link } from "@/i18n/navigation";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
import { useTheme } from "@/components/theme-provider";

/**
 * Editorial marketing navbar.
 *
 * - Fixed top-0 with scroll-shadow behaviour preserved.
 * - At scrollY=0: transparent so the landing hero reads through it.
 *   At scrollY>20: paper-tinted with hairline border + soft shadow.
 * - Primary CTA is a filled bg-ink pill (matches landing hero CTAs).
 * - Mobile menu is a paper card with hairline borders + mono-cap labels.
 *
 * Anchor links (#features, #how-it-works) only resolve on `/`. Browsers
 * no-op them elsewhere, which is fine fallback behaviour.
 */

type MarketingNavLink = {
  href: string;
  labelKey?: string;
  label?: string;
};

const navLinks: readonly MarketingNavLink[] = [
  { labelKey: "features", href: "#features" },
  { labelKey: "extension", href: "/extension" },
  { labelKey: "howItWorks", href: "#how-it-works" },
  { labelKey: "pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const a11yT = useA11yTranslations();
  const locale = useLocale();
  const t = useTranslations("marketing.nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleDark } = useTheme();
  const callbackUrl = `/${locale}/dashboard`;

  const getNavLabel = (link: MarketingNavLink) => {
    if (link.label) return link.label;
    return t(link.labelKey ?? "features");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-rule bg-page/85 py-3 shadow-paper-card backdrop-blur-md"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-h-11 items-center gap-2.5">
            <Image
              src="/brand/slothing-mark.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-9 w-9"
            />
            <span className="font-display text-[18px] font-bold tracking-tight text-ink">
              Slothing
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label={a11yT("navigation")}
            className="hidden items-center gap-7 lg:flex"
          >
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label ?? link.labelKey}
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-[13.5px] text-ink-2 transition-colors hover:text-ink"
                >
                  {getNavLabel(link)}
                </a>
              ) : (
                <Link
                  key={link.label ?? link.labelKey}
                  href={link.href}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center text-[13.5px] text-ink-2 transition-colors hover:text-ink"
                >
                  {getNavLabel(link)}
                </Link>
              ),
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <LocaleSwitcherCompact />
            <button
              type="button"
              onClick={toggleDark}
              aria-label={
                isDark ? "Switch to light theme" : "Switch to dark theme"
              }
              className="grid h-9 w-9 place-items-center rounded-md text-ink-2 transition-colors hover:bg-rule-strong-bg hover:text-ink"
            >
              {isDark ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <Link
              href={{ pathname: "/sign-in", query: { callbackUrl } }}
              prefetch={false}
              className="inline-flex min-h-11 items-center text-[13.5px] text-ink-2 transition-colors hover:text-ink"
            >
              {t("signIn")}
            </Link>
            <Link
              href={{ pathname: "/sign-in", query: { callbackUrl } }}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-page transition-opacity hover:opacity-90"
            >
              {t("getStarted")}
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center text-ink-2 transition-colors hover:text-ink lg:hidden"
            aria-label={a11yT("toggleMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-nav-menu"
          hidden={!mobileOpen}
          className="mt-4 rounded-2xl border border-rule bg-paper p-5 shadow-paper-card lg:hidden"
        >
          <nav
            aria-label={a11yT("mobileNavigation")}
            className="flex flex-col gap-1"
          >
            <span className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
              Browse
            </span>
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label ?? link.labelKey}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
                >
                  {getNavLabel(link)}
                </a>
              ) : (
                <Link
                  key={link.label ?? link.labelKey}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
                >
                  {getNavLabel(link)}
                </Link>
              ),
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-rule pt-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
                Account
              </span>
              <LocaleSwitcherCompact />
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                prefetch={false}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-[1.5px] border-ink bg-transparent px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:bg-rule-strong-bg"
              >
                {t("signIn")}
              </Link>
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                prefetch={false}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[14px] font-semibold text-page transition-opacity hover:opacity-90"
              >
                {t("getStarted")}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
