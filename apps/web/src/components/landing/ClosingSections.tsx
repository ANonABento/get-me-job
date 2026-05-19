import { MonoCap } from "./primitives";
import { InverseCTABand } from "./InverseCTABand";

/**
 * Landing-specific closer — thin wrapper around the reusable
 * `InverseCTABand` primitive with the landing's locked copy.
 *
 * Other surfaces (/pricing, /extension, /ats-scanner) consume
 * `InverseCTABand` directly with their own props.
 */
const LANDING_CLOSER_STATS = [
  { n: "BYOK", l: "Bring your key" },
  { n: "AGPL", l: "Open license" },
  { n: "$0", l: "Free to start" },
  { n: "100%", l: "Self-hostable" },
] as const;

export function Closer() {
  return (
    <InverseCTABand
      eyebrow="Ready when you are"
      headlineTop="Atomize your career once."
      headlineBottom="Apply for the rest of it."
      body="Free to start. Free to self-host. Bring your own keys, or use hosted Slothing when you want the boring parts handled."
      ctaPrimary={{
        label: "Try Slothing free",
        href: "/sign-in",
      }}
      ctaSecondary={{
        label: "Star on GitHub",
        href: "https://github.com/ANonABento/slothing",
        leadingGlyph: "★",
        external: true,
      }}
      stats={LANDING_CLOSER_STATS}
      mascot={{
        src: "/brand/sloths/slothing-mascot-closer.png",
        alt: "Slothing mascot at rest",
      }}
    />
  );
}

/* ───────────────── Footer ───────────────── */
export function LandingFooter() {
  return (
    <footer className="border-t border-rule bg-page">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-[18px] font-bold text-ink">
              Slothing
            </div>
            <p className="mt-2 text-[13px] text-ink-3">
              A calmer way to job hunt. Free and open source.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Studio", "/studio"],
              ["Opportunities", "/opportunities"],
              ["Interview prep", "/interview"],
              ["Pricing", "/pricing"],
            ]}
          />
          <FooterCol
            title="Open source"
            links={[
              ["GitHub", "https://github.com/ANonABento/slothing"],
              ["Self-host docs", "/docs/self-host"],
              ["License", "/docs/license"],
              ["Roadmap", "https://github.com/ANonABento/slothing/projects"],
            ]}
          />
          <FooterCol
            title="Community"
            links={[
              ["Discord", "https://discord.gg/slothing"],
              [
                "Discussions",
                "https://github.com/ANonABento/slothing/discussions",
              ],
              ["Issues", "https://github.com/ANonABento/slothing/issues"],
              ["Changelog", "/changelog"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-rule pt-6 text-[12.5px] text-ink-3 md:flex-row">
          <span>© 2026 Slothing</span>
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
  links: [string, string][];
}) {
  return (
    <div>
      <MonoCap>{title}</MonoCap>
      <ul className="mt-3 space-y-2 text-[13.5px]">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-ink-2 hover:text-ink">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
