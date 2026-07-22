/**
 * Locales understood by the Version 1.1 architecture.
 */
export const SUPPORTED_LOCALES = ['en', 'hi'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * The single publication switch for every bilingual feature. Components,
 * alternates, redirects and output validation all derive from it.
 */
export const PUBLISHED_LOCALES = ['en', 'hi'] as const satisfies readonly Locale[];

export type PublishedLocale = (typeof PUBLISHED_LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function localeIsPublished(
  locale: Locale,
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): boolean {
  return publishedLocales.includes(locale);
}

export function hasMultiplePublishedLocales(
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): boolean {
  return publishedLocales.length > 1;
}

/** The site has exactly two locales, so every locale has one counterpart. */
export function alternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'hi' : 'en';
}
