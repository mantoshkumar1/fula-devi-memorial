/**
 * Locales understood by the Version 1.1 architecture.
 *
 * Hindi is deliberately not published yet. Declaring it here makes the route
 * and translation foundations type-safe without creating a page, changing the
 * Astro routing configuration, or exposing an incomplete edition.
 */
export const SUPPORTED_LOCALES = ['en', 'hi'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that may currently produce public pages. */
export const PUBLISHED_LOCALES = ['en'] as const satisfies readonly Locale[];

export type PublishedLocale = (typeof PUBLISHED_LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** The site has exactly two locales, so every locale has one counterpart. */
export function alternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'hi' : 'en';
}
