/**
 * Four-stat strip used inside the dark closer band.
 *
 * Tokens flip with the surrounding band: when mounted inside
 * `bg-inverse`, the labels become muted-inverse-ink and the numbers
 * stay full-strength. When mounted on a paper surface, they fall back
 * to `text-ink` + `text-ink-3` via the `surface` prop.
 */

export type MonoStat = { n: string; l: string };

export type MonoStatStripProps = {
  stats: readonly MonoStat[];
  /**
   * Which surface this strip lives on. `inverse` is the default
   * (dark closer band). `page` uses regular ink tokens.
   */
  surface?: "inverse" | "page";
};

export function MonoStatStrip({
  stats,
  surface = "inverse",
}: MonoStatStripProps) {
  const isInverse = surface === "inverse";
  const number = isInverse ? "text-inverse-ink" : "text-ink";
  const label = isInverse ? "text-inverse-ink/55" : "text-ink-3";
  const border = isInverse ? "border-inverse-ink/20" : "border-rule";

  return (
    <dl
      className={`mt-8 flex flex-wrap gap-8 border-t pt-7 md:gap-10 ${border}`}
    >
      {stats.map((stat) => (
        <div key={stat.n}>
          <dt
            className={`font-display text-[24px] font-extrabold tracking-tight leading-none ${number}`}
          >
            {stat.n}
          </dt>
          <dd
            className={`mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] ${label}`}
          >
            {stat.l}
          </dd>
        </div>
      ))}
    </dl>
  );
}
