"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  LOCALE_COOKIE_NAME,
  formatDateAbsolute,
  formatDateRelative,
  getBrowserDefaultLocale,
  normalizeLocale,
} from "@/lib/format/time";

function readLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export function getPreferredLocale(): string {
  return normalizeLocale(readLocaleCookie() ?? getBrowserDefaultLocale());
}

export function writePreferredLocale(locale: string): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeLocale(locale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(
    normalized,
  )}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(
    new CustomEvent(LOCALE_CHANGE_EVENT, { detail: normalized }),
  );
}

export function usePreferredLocale(initialLocale?: string): string {
  const [locale, setLocale] = useState(() =>
    normalizeLocale(initialLocale ?? getBrowserDefaultLocale()),
  );

  useEffect(() => {
    setLocale(initialLocale ? normalizeLocale(initialLocale) : getPreferredLocale());

    function handleLocaleChange(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setLocale(normalizeLocale(detail ?? getPreferredLocale()));
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
    return () =>
      window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
  }, [initialLocale]);

  return locale;
}

interface TimeAgoProps {
  date: Date | string | number | null | undefined;
  className?: string;
  locale?: string;
}

export function TimeAgo({ date, className, locale }: TimeAgoProps) {
  const preferredLocale = usePreferredLocale(locale);

  if (!date) {
    return <span className={className}>Unknown date</span>;
  }

  const absolute = formatDateAbsolute(date, preferredLocale);
  const relative = formatDateRelative(date);
  const parsedDate = new Date(date);

  return (
    <time
      className={className}
      dateTime={
        Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString()
      }
      title={absolute}
      aria-label={absolute}
    >
      {relative}
    </time>
  );
}
