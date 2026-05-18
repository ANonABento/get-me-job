"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Editorial hero — locked copy + autoplay video stage.
 *
 * The video file at /marketing/sections/the-loop.mp4 may not exist yet
 * (Codex is producing it on a parallel worktree). When the source 404s
 * we hide the <video> entirely and let the mascot poster carry the
 * frame so the section never looks broken.
 */

export function LandingHero() {
  return (
    <section className="border-b border-rule bg-page">
      <div className="mx-auto w-full max-w-[1480px] px-5 pb-12 pt-7 md:px-10 md:pb-16 md:pt-9 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          {/* Copy column */}
          <div className="flex max-w-[640px] flex-col">
            <AnnouncementPill />

            <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(48px,6vw,78px)] font-extrabold leading-[0.96] tracking-display text-ink">
              You&rsquo;re not lazy.
              <br />
              <span className="text-ink-3">Your job search system is.</span>
            </h1>

            <p className="mt-5 max-w-[520px] text-[16.5px] leading-[1.5] text-ink-2">
              Slothing replaces the fifteen tabs, the eight Google Docs, and the
              cover letter you&rsquo;ve rewritten for the eleventh time.
              <strong className="mt-1 block font-semibold text-ink">
                One workspace. One source of truth. One calmer way to apply.
              </strong>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-page transition-opacity hover:opacity-90"
              >
                Try Slothing free <span aria-hidden>→</span>
              </Link>
              <a
                href="https://github.com/ANonABento/slothing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-transparent px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-rule-strong-bg"
              >
                <span aria-hidden>★</span> Star on GitHub
              </a>
            </div>
          </div>

          {/* Video stage */}
          <HeroVideoStage />
        </div>
      </div>
    </section>
  );
}

function AnnouncementPill() {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-rule bg-paper py-1 pl-1 pr-3 text-[12.5px] text-ink-2">
      <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
        Demo
      </span>
      Watch the loop · 42s
      <span aria-hidden>→</span>
    </span>
  );
}

function HeroVideoStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const onError = () => setHasVideo(false);
    node.addEventListener("error", onError);
    const sources = node.querySelectorAll("source");
    sources.forEach((s) => s.addEventListener("error", onError));
    return () => {
      node.removeEventListener("error", onError);
      sources.forEach((s) => s.removeEventListener("error", onError));
    };
  }, []);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-rule shadow-paper-elevated">
      {/* Paper backdrop gradient via solid layered tokens — no inline hex */}
      <div className="absolute inset-0 z-[0] bg-paper" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[0] opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 0%, var(--bg-2) 100%)",
        }}
      />

      {/* Frame chrome */}
      <div className="absolute left-4 top-3 z-[3] inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          the loop · auto
        </span>
      </div>

      <span className="absolute right-3 top-3 z-[3] inline-flex items-center gap-2 rounded-full bg-inverse px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inverse-ink">
        <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand">
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-brand opacity-40 animate-ping"
          />
        </span>
        autoplay · loop
      </span>

      {/* Mascot poster — always visible underneath the video */}
      <div className="absolute inset-x-0 bottom-0 z-[1] flex h-[86%] items-end justify-center">
        <Image
          src="/brand/sloths/slothing-mascot-hero.png"
          alt="Slothing mascot holding a folder, mid-loop"
          width={640}
          height={640}
          priority
          className="h-full w-auto object-contain drop-shadow-[0_24px_30px_rgba(80,60,30,0.2)]"
        />
      </div>

      {/* Autoplay video — hidden if source 404s */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Slothing product loop preview"
          className="absolute inset-0 z-[2] h-full w-full object-cover"
        >
          <source src="/marketing/sections/the-loop.mp4" type="video/mp4" />
        </video>
      ) : null}

      {/* Scrub bar */}
      <div className="absolute inset-x-4 bottom-3 z-[3] flex items-center gap-2.5">
        <span className="font-mono text-[10.5px] text-ink-3">0:16</span>
        <div
          className="flex-1 overflow-hidden rounded-full"
          style={{ background: "var(--rule-strong)", height: "3px" }}
        >
          <div className="h-full hero-scrub-fill rounded-full bg-brand" />
        </div>
        <span className="font-mono text-[10.5px] text-ink-3">0:42</span>
      </div>

      <style jsx>{`
        @keyframes hero-scrub {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        :global(.hero-scrub-fill) {
          width: 38%;
          animation: hero-scrub 42s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.hero-scrub-fill) {
            animation: none;
            width: 38%;
          }
        }
      `}</style>
    </div>
  );
}
