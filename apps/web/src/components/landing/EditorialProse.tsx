import { cn } from "@/lib/utils";

/**
 * Editorial long-form text wrapper.
 *
 * Tailwind's `prose` plugin ships serif fonts + gray scales that
 * clash with the editorial system (Outfit display, ink/page tokens).
 * `EditorialProse` styles `<h2>`, `<p>`, `<ul>`, `<a>`, `<blockquote>`,
 * `<code>` etc. via descendant selectors so blog posts and legal
 * pages stay on-brand without per-element class attribution.
 *
 * Wrap an `<article>` or `<div>` of post content in this and the
 * children will pick up the right typography automatically.
 */

export type EditorialProseProps = {
  children: React.ReactNode;
  className?: string;
};

export function EditorialProse({ children, className }: EditorialProseProps) {
  return (
    <div className={cn("editorial-prose mx-auto max-w-prose", className)}>
      {children}
      <style>{`
        .editorial-prose {
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 16.5px;
          line-height: 1.7;
          color: var(--ink-2);
        }
        .editorial-prose > * + * {
          margin-top: 1.2em;
        }
        .editorial-prose h2,
        .editorial-prose h3,
        .editorial-prose h4 {
          font-family: var(--display), system-ui, sans-serif;
          color: var(--ink);
          font-weight: 800;
          letter-spacing: var(--display-letter);
          line-height: 1.15;
        }
        .editorial-prose h2 {
          font-size: clamp(26px, 2.6vw, 34px);
          margin-top: 2em;
        }
        .editorial-prose h3 {
          font-size: clamp(20px, 2vw, 24px);
          margin-top: 1.8em;
        }
        .editorial-prose h4 {
          font-size: 18px;
          margin-top: 1.6em;
        }
        .editorial-prose p strong {
          color: var(--ink);
          font-weight: 600;
        }
        .editorial-prose a {
          color: var(--brand);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
        .editorial-prose a:hover {
          color: var(--brand-dark);
        }
        .editorial-prose ul,
        .editorial-prose ol {
          padding-left: 1.4em;
        }
        .editorial-prose ul {
          list-style: none;
          padding-left: 0;
        }
        .editorial-prose ul > li {
          position: relative;
          padding-left: 1.4em;
        }
        .editorial-prose ul > li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.7em;
          height: 5px;
          width: 14px;
          border-radius: 9999px;
          background: var(--brand);
        }
        .editorial-prose ol > li::marker {
          color: var(--brand);
          font-weight: 700;
        }
        .editorial-prose li + li {
          margin-top: 0.5em;
        }
        .editorial-prose blockquote {
          border-left: 3px solid var(--brand);
          padding: 0.4em 0 0.4em 1.2em;
          margin-inline-start: 0;
          color: var(--ink);
          font-style: normal;
        }
        .editorial-prose code {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.92em;
          padding: 0.12em 0.4em;
          border-radius: 4px;
          background: var(--rule-strong-bg);
          color: var(--ink);
        }
        .editorial-prose pre {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 13.5px;
          line-height: 1.6;
          padding: 1em 1.2em;
          border-radius: 12px;
          background: var(--bg-2);
          border: 1px solid var(--rule);
          overflow-x: auto;
        }
        .editorial-prose pre code {
          background: transparent;
          padding: 0;
        }
        .editorial-prose hr {
          border: 0;
          height: 1px;
          background: var(--rule);
          margin: 2.4em 0;
        }
        .editorial-prose img {
          border-radius: 12px;
          border: 1px solid var(--rule);
        }
      `}</style>
    </div>
  );
}
