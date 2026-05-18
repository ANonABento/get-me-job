import Image from "next/image";
import Link from "next/link";
import { MonoCap } from "./primitives";

/**
 * Dark closer band — full-bleed --inverse-bg with mascot on the right
 * and a four-stat strip beneath the CTAs.
 *
 * Token-driven so the band stays intentional in both light + dark
 * themes (the slothing preset flips --inverse-bg/--inverse-ink so the
 * indigo wall stays the inverse of whatever the rest of the page is).
 */
export function Closer() {
  return (
    <section className="border-t border-rule bg-inverse text-inverse-ink">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-20 md:px-10 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-inverse-ink/55">
              Ready when you are
            </span>
            <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(40px,5vw,62px)] font-extrabold leading-[0.96] tracking-display">
              Atomize your career once.
              <br />
              <span className="text-inverse-ink/50">
                Apply for the rest of it.
              </span>
            </h2>
            <p className="mt-5 max-w-[50ch] text-[17px] leading-[1.55] text-inverse-ink/75">
              Free to start. Free to self-host. Bring your own keys, or use
              hosted Slothing when you want the boring parts handled.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-full bg-page px-5 py-3 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90"
              >
                Try Slothing free <span aria-hidden>→</span>
              </Link>
              <a
                href="https://github.com/ANonABento/slothing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-inverse-ink/40 bg-transparent px-5 py-3 text-[14px] font-semibold text-inverse-ink transition-colors hover:border-inverse-ink/70"
              >
                <span aria-hidden>★</span> Star on GitHub
              </a>
            </div>

            <CloserStats />
          </div>

          <div className="relative mx-auto flex h-[360px] w-full max-w-[420px] items-end justify-center md:h-[420px]">
            <Image
              src="/brand/sloths/slothing-mascot-closer.png"
              alt="Slothing mascot at rest"
              fill
              sizes="(max-width: 768px) 70vw, 420px"
              className="object-contain object-bottom drop-shadow-[0_24px_32px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const CLOSER_STATS = [
  { n: "BYOK", l: "Bring your key" },
  { n: "AGPL", l: "Open license" },
  { n: "$0", l: "Free to start" },
  { n: "100%", l: "Self-hostable" },
] as const;

function CloserStats() {
  return (
    <dl className="mt-8 flex flex-wrap gap-8 border-t border-inverse-ink/20 pt-7 md:gap-10">
      {CLOSER_STATS.map((stat) => (
        <div key={stat.n}>
          <dt className="font-display text-[24px] font-extrabold tracking-tight leading-none text-inverse-ink">
            {stat.n}
          </dt>
          <dd className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-inverse-ink/55">
            {stat.l}
          </dd>
        </div>
      ))}
    </dl>
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
