import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, locales } from "@/i18n";
import { getAlternateLanguages, getSiteMetadata } from "@/lib/seo";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Metadata {
  const siteMetadata = getSiteMetadata();

  if (!isAppLocale(params.locale)) {
    return siteMetadata;
  }

  return {
    ...siteMetadata,
    alternates: {
      canonical: `/${params.locale}`,
      languages: getAlternateLanguages("/"),
    },
  };
}

/**
 * Locale segment layout. The root layout at `app/layout.tsx` owns
 * <html> + <body> + all locale-aware setup (lang, dir, fonts, theme
 * tokens, preload scripts, providers). This layout exists only to
 * validate the locale param and to host `generateMetadata` /
 * `generateStaticParams` for SEO + static rendering.
 */
export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isAppLocale(params.locale)) {
    notFound();
  }
  return <>{children}</>;
}
