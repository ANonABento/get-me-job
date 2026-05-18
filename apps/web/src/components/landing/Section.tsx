"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reusable editorial feature section.
 *
 * Spec source: docs/handoff/landing-implementation.md §4 + §6.
 *
 * Two visual variants:
 *   - `video`     — autoplay/loop/muted/playsinline, falls back to cropped
 *                   poster panel from /marketing/loop/loop-hero.png when
 *                   the source file is missing.
 *   - `placeholder` — labeled card (no panel crop). Used for sections
 *                   without a recorded demo yet (Extension, Open source).
 *
 * `flipped` swaps copy/visual at lg+. Visual stays above copy on mobile.
 *
 * Background alternation is owned by the parent (sections marked `alt`
 * get `bg-paper`; otherwise `bg-page`). Keeping it out of this component
 * means we don't need :nth-of-type CSS that breaks if order ever changes.
 */

type Detail = { label: string; value: string };

type PlaceholderVariant = {
  variant: "placeholder";
  frameLabel: string;
  bigLabel: string;
  smallLabel: string;
  smallTail: string;
};

type VideoVariant = {
  variant: "video";
  frameLabel: string;
  videoSrc: string;
  /** 1-based index into the 6-panel loop-hero.png panorama for the fallback poster. */
  posterPanel: 1 | 2 | 3 | 4 | 5 | 6;
  meta: { path: string; duration: string };
};

type SectionVariant = VideoVariant | PlaceholderVariant;

export type SectionProps = {
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  details: [Detail, Detail];
  flipped?: boolean;
  alt?: boolean;
} & SectionVariant;

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
      {props.variant === "video" ? <LiveBadge label="autoplay" /> : null}

      {props.variant === "video" ? (
        <SectionVideo
          src={props.videoSrc}
          posterPanel={props.posterPanel}
          alt={`${props.eyebrow} demo recording`}
        />
      ) : (
        <SectionPlaceholder
          big={props.bigLabel}
          smallLead={props.smallLabel}
          smallTail={props.smallTail}
        />
      )}

      {props.variant === "video" ? (
        <div className="absolute inset-x-4 bottom-3 z-[3] flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
          <span>{props.meta.path}</span>
          <span>loops · {props.meta.duration}</span>
        </div>
      ) : null}
    </div>
  );
}

function SectionVideo({
  src,
  posterPanel,
  alt,
}: {
  src: string;
  posterPanel: 1 | 2 | 3 | 4 | 5 | 6;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const onError = () => setHasVideo(false);
    node.addEventListener("error", onError);
    // <source> errors don't bubble to <video>; listen on each source too.
    const sources = node.querySelectorAll("source");
    sources.forEach((s) => s.addEventListener("error", onError));
    return () => {
      node.removeEventListener("error", onError);
      sources.forEach((s) => s.removeEventListener("error", onError));
    };
  }, []);

  // 6-panel panorama: index 1 → 0%, index 6 → 100% (step = 20%).
  const positionPercent = (posterPanel - 1) * 20;

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[0]"
        style={{
          backgroundImage: "url('/marketing/loop/loop-hero.png')",
          backgroundSize: "600% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: `${positionPercent}% center`,
        }}
      />
      {hasVideo ? (
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
      ) : null}
    </>
  );
}

function SectionPlaceholder({
  big,
  smallLead,
  smallTail,
}: {
  big: string;
  smallLead: string;
  smallTail: string;
}) {
  return (
    <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
        {smallLead}
      </span>
      <span className="font-display text-[clamp(22px,2.4vw,30px)] font-extrabold tracking-display text-ink">
        {big}
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
        {smallTail}
      </span>
    </div>
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
