export const DEFAULT_LOCALE = "en-US";
export const LOCALE_COOKIE_NAME = "taida_locale";
export const LOCALE_CHANGE_EVENT = "taida:locale-change";

export const SUPPORTED_LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-CA", label: "English (CA)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["value"];

export function normalizeLocale(locale: string | null | undefined): string {
  if (!locale) return DEFAULT_LOCALE;

  const supported = SUPPORTED_LOCALES.find(
    (candidate) =>
      candidate.value.toLowerCase() === locale.toLowerCase() ||
      candidate.value.split("-")[0].toLowerCase() === locale.toLowerCase(),
  );

  return supported?.value ?? DEFAULT_LOCALE;
}

export function formatDateAbsolute(
  date: Date | string | number,
  locale = DEFAULT_LOCALE,
): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Unknown date";

  const formatter = new Intl.DateTimeFormat(normalizeLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const formatted = formatter.format(value);
  const lastComma = formatted.lastIndexOf(",");

  if (lastComma === -1) return formatted;
  return `${formatted.slice(0, lastComma)} · ${formatted
    .slice(lastComma + 1)
    .trim()}`;
}

export function formatDateRelative(
  date: Date | string | number,
  now: Date | string | number = new Date(),
): string {
  const value = new Date(date);
  const current = new Date(now);
  if (Number.isNaN(value.getTime()) || Number.isNaN(current.getTime())) {
    return "Unknown date";
  }

  const diffMs = current.getTime() - value.getTime();
  const absMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absMs < minute) return "Just now";
  if (absMs < hour) return `${Math.floor(absMs / minute)}m ago`;
  if (absMs < day) return `${Math.floor(absMs / hour)}h ago`;
  if (absMs < 2 * day) return "Yesterday";
  if (absMs < week) return `${Math.floor(absMs / day)}d ago`;
  if (absMs < month) return `${Math.floor(absMs / week)}w ago`;
  if (absMs < year) return `${Math.floor(absMs / month)}mo ago`;
  return `${Math.floor(absMs / year)}y ago`;
}

export function getBrowserDefaultLocale(): string {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  return normalizeLocale(navigator.language);
}
