"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcherCompact } from "@/components/i18n/locale-switcher";
import { Link } from "@/i18n/navigation";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const navLinks = [
  { labelKey: "features", href: "#features" },
  { labelKey: "extension", href: "/extension" },
  { labelKey: "howItWorks", href: "#how-it-works" },
  { labelKey: "pricing", href: "/pricing" },
] as const;

export function Navbar() {
  const a11yT = useA11yTranslations();

  const locale = useLocale();
  const t = useTranslations("marketing.nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const callbackUrl = `/${locale}/dashboard`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm border-b py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex min-h-11 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold gradient-text">Slothing</span>
              <span className="text-2xs text-muted-foreground hidden sm:block">
                Resume Intelligence 怠惰
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label={a11yT("navigation")}
            className="hidden md:flex items-center gap-8"
          >
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.labelKey}
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.labelKey)}
                </a>
              ) : (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.labelKey)}
                </Link>
              ),
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LocaleSwitcherCompact />
            <Button variant="ghost" asChild>
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                prefetch={false}
              >
                {t("signIn")}
              </Link>
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                prefetch={false}
              >
                {t("getStarted")}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
            aria-label={a11yT("toggleMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-nav-menu"
          hidden={!mobileOpen}
          className="md:hidden mt-4 pb-4 border-t pt-4"
        >
          <nav
            aria-label={a11yT("mobileNavigation")}
            className="flex flex-col gap-4"
          >
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.labelKey}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.labelKey)}
                </a>
              ) : (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.labelKey)}
                </Link>
              ),
            )}
            <LocaleSwitcherCompact className="mt-2" />
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="outline" asChild>
                <Link
                  href={{ pathname: "/sign-in", query: { callbackUrl } }}
                  prefetch={false}
                >
                  {t("signIn")}
                </Link>
              </Button>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                <Link
                  href={{ pathname: "/sign-in", query: { callbackUrl } }}
                  prefetch={false}
                >
                  {t("getStarted")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
