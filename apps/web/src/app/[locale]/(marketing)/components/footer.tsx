import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MonoCap } from "@/components/landing/primitives";
import { nowDate } from "@/lib/format/time";

/**
 * Editorial marketing footer — paper band, four columns, mono-cap
 * section labels, version line. Matches the landing PR (#277)'s
 * `LandingFooter` so every marketing route shares the same chrome.
 *
 * Anchor links (#features etc.) only resolve on the landing page.
 * Browsers no-op them on other routes, which is the expected fallback.
 */

const PRODUCT_LINKS: ReadonlyArray<[string, string]> = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "/pricing"],
  ["Extension", "/extension"],
];

const RESOURCES_LINKS: ReadonlyArray<[string, string]> = [
  ["ATS scanner", "/ats-scanner"],
  ["Compare", "/vs"],
  ["Blog", "/blog"],
];

const OPEN_SOURCE_LINKS: ReadonlyArray<[string, string]> = [
  ["GitHub", "https://github.com/ANonABento/slothing"],
  ["Self-host docs", "/docs/self-host"],
  ["License", "/docs/license"],
  ["Roadmap", "https://github.com/ANonABento/slothing/projects"],
];

const LEGAL_LINKS: ReadonlyArray<[string, string]> = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
];

export function Footer() {
  const year = nowDate().getFullYear();

  return (
    <footer className="border-t border-rule bg-page">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-[18px] font-bold tracking-tight text-ink"
            >
              <Image
                src="/brand/slothing-mark.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              Slothing
            </Link>
            <p className="mt-3 max-w-[28ch] text-[13px] leading-5 text-ink-3">
              A calmer way to job hunt. Free and open source.
            </p>
          </div>

          <FooterCol title="Product" links={PRODUCT_LINKS} />
          <FooterCol title="Resources" links={RESOURCES_LINKS} />
          <FooterCol title="Open source" links={OPEN_SOURCE_LINKS} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-rule pt-6 text-[12.5px] text-ink-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {year} Slothing</span>
            <span aria-hidden className="text-ink-3/40">
              ·
            </span>
            <div className="flex flex-wrap gap-3">
              {LEGAL_LINKS.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  prefetch={false}
                  className="text-ink-3 hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <MonoCap>v0.5 · cream · rust · outfit · soft</MonoCap>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<[string, string]>;
}) {
  return (
    <div>
      <h3 className="font-mono text-mono-cap uppercase text-ink-3">{title}</h3>
      <ul className="mt-3 space-y-2 text-[13.5px]">
        {links.map(([label, href]) => {
          const external = href.startsWith("http");
          if (external) {
            return (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-2 transition-colors hover:text-ink"
                >
                  {label}
                </a>
              </li>
            );
          }
          if (href.startsWith("#")) {
            return (
              <li key={label}>
                <a
                  href={href}
                  className="text-ink-2 transition-colors hover:text-ink"
                >
                  {label}
                </a>
              </li>
            );
          }
          return (
            <li key={label}>
              <Link
                href={href}
                prefetch={false}
                className="text-ink-2 transition-colors hover:text-ink"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
