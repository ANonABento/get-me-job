import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeepSection, MonoCap } from "./primitives";
import { CloserStats } from "./RichSections";

/* ───────────────── Closer ───────────────── */
export function Closer() {
  return (
    <DeepSection className="pt-0">
      <div className="relative overflow-hidden rounded-2xl bg-inverse p-8 text-inverse-ink md:p-12 lg:p-16">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-center">
          <div>
            <MonoCap className="text-inverse-ink/55">
              Ready when you are
            </MonoCap>
            <h2 className="mt-4 font-display text-closer-h2">
              Atomize your career once.
              <br />
              Apply for the rest of it.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[17px] leading-7 opacity-80">
              Free to start. Free to self-host. Bring your own keys, or use
              hosted Slothing when you want the boring parts handled.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="default">
                <Link href="/sign-in">Try Slothing free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href="https://github.com/ANonABento/slothing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Star on GitHub
                </a>
              </Button>
            </div>
            <CloserStats />
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute inset-x-0 top-0 rounded-xl border border-inverse-ink/15 bg-inverse-ink/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-inverse-ink/15 pb-3">
                <MonoCap className="text-inverse-ink/55">
                  Today in Slothing
                </MonoCap>
                <span className="rounded-sm bg-inverse-ink/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-inverse-ink/70">
                  focused
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Tailor resume", "Figma design engineer"],
                  ["Fill application", "Greenhouse form ready"],
                  ["Prep story", "Roadmap pushback answer"],
                  ["Send follow-up", "Linear recruiter thread"],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-lg border border-inverse-ink/[0.12] bg-inverse-ink/[0.07] p-3"
                  >
                    <div className="text-[13px] font-semibold">{title}</div>
                    <div className="mt-1 text-[12px] opacity-65">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <Image
              src="/brand/sloths/slothing-mascot-closer.png"
              alt="Slothing mascot seated with a closed resume folder"
              fill
              className="object-contain object-bottom drop-shadow-[0_32px_42px_rgba(0,0,0,0.34)]"
              sizes="(max-width: 768px) 70vw, 420px"
            />
          </div>
        </div>
      </div>
    </DeepSection>
  );
}

/* ───────────────── Footer ───────────────── */
export function LandingFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto w-full max-w-wrap px-5 py-12 md:px-10 md:py-16">
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
