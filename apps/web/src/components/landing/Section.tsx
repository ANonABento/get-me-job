"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Reusable editorial feature section.
 *
 * Spec source: docs/handoff/landing-implementation.md §4 + §6.
 *
 * Every section has a per-section illustration (shipped by Codex in
 * /marketing/sections/<slug>.png). If a matching demo video lives at
 * <videoSrc>, it overlays the poster as autoplay/loop/muted. When the
 * video 404s the poster carries the frame on its own.
 *
 * `flipped` swaps copy/visual at lg+. Visual stays above copy on mobile.
 * Background alternation is owned by the parent (`alt` → bg-paper).
 */

type Detail = { label: string; value: string };

export type SectionProps = {
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  details: [Detail, Detail];
  flipped?: boolean;
  alt?: boolean;
  frameLabel: string;
  posterSrc: string;
  posterAlt: string;
  /** Optional autoplay overlay. Falls back to the poster if it 404s. */
  videoSrc?: string;
  meta?: { path: string; duration: string };
};

export function Section(props: SectionProps) {
  const { number, eyebrow, headline, body, details, flipped, alt } = props;

  return (
    <section
      className={`border-t border-rule ${
        alt ? "bg-paper" : "bg-page"
      } py-[64px] md:py-[88px]`}
    >
      <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
        <div
          className={`grid items-center gap-10 lg:gap-14 ${
            flipped
              ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
              : "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          }`}
        >
          {flipped ? (
            <>
              <SectionVisual {...props} />
              <SectionCopy
                number={number}
                eyebrow={eyebrow}
                headline={headline}
                body={body}
                details={details}
              />
            </>
          ) : (
            <>
              <SectionCopy
                number={number}
                eyebrow={eyebrow}
                headline={headline}
                body={body}
                details={details}
              />
              <SectionVisual {...props} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionCopy({
  number,
  eyebrow,
  headline,
  body,
  details,
}: {
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  details: [Detail, Detail];
}) {
  return (
    <div className="max-w-[560px]">
      <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
        <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[10px] text-brand-dark">
          {number}
        </span>
        {eyebrow}
      </span>
      <h3 className="mt-4 max-w-[18ch] font-display text-[clamp(30px,3.4vw,46px)] font-extrabold leading-[1.02] tracking-display text-ink">
        {headline}
      </h3>
      <p className="mt-4 max-w-[56ch] text-[16.5px] leading-[1.55] text-ink-2">
        {body}
      </p>
      <dl className="mt-6 grid max-w-[540px] grid-cols-1 gap-3 sm:grid-cols-2">
        {details.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-rule bg-rule-strong-bg p-3"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              {item.label}
            </dt>
            <dd className="mt-1 text-[14px] font-bold text-ink">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionVisual(props: SectionProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-rule bg-paper shadow-paper-elevated">
      <FrameCap label={props.frameLabel} />
      {props.videoSrc ? <LiveBadge label="autoplay" /> : null}

      <Image
        src={props.posterSrc}
        alt={props.posterAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 640px"
        className="object-cover"
      />

      {props.videoSrc ? (
        <SectionVideo
          src={props.videoSrc}
          alt={`${props.eyebrow} demo recording`}
        />
      ) : null}

      {props.meta ? (
        <div className="absolute inset-x-4 bottom-3 z-[3] flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
          <span>{props.meta.path}</span>
          <span>loops · {props.meta.duration}</span>
        </div>
      ) : null}
    </div>
  );
}

function SectionVideo({ src, alt }: { src: string; alt: string }) {
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

  if (!hasVideo) return null;
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      className="absolute inset-0 z-[1] h-full w-full object-cover"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function FrameCap({ label }: { label: string }) {
  return (
    <div className="absolute left-4 top-3 z-[3] inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand-soft" />
      <span className="h-2 w-2 rounded-full bg-brand-soft" />
      <span className="h-2 w-2 rounded-full bg-brand-soft" />
      <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
    </div>
  );
}

export function LiveBadge({ label }: { label: string }) {
  return (
    <span className="absolute right-3 top-3 z-[3] inline-flex items-center gap-2 rounded-full bg-inverse px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-inverse-ink">
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand">
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full bg-brand opacity-40 animate-ping"
        />
      </span>
      {label}
    </span>
  );
}
