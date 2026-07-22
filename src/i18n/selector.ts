import { defineLocaleMap } from './translations.ts';
import {
  PUBLISHED_LOCALES,
  SUPPORTED_LOCALES,
  alternateLocale,
  hasMultiplePublishedLocales,
  localeIsPublished,
  type Locale,
} from './types.ts';

export const LANGUAGE_LABELS = defineLocaleMap({
  en: { label: 'English', language: 'en' },
  hi: { label: 'हिन्दी', language: 'hi' },
});

export interface ActiveLanguageItem {
  kind: 'active';
  locale: Locale;
  label: string;
  language: string;
  ariaCurrent: 'page';
}

export interface LinkedLanguageItem {
  kind: 'link';
  locale: Locale;
  label: string;
  language: string;
  href: string;
  hreflang: Locale;
}

export type LanguageSelectorItem = ActiveLanguageItem | LinkedLanguageItem;

export interface LanguageSelectorState {
  ariaLabel: string;
  items: readonly LanguageSelectorItem[];
}

interface LanguageSelectorStateOptions {
  currentLocale: Locale;
  alternateHref: string | null;
  ariaLabel: string;
  publishedLocales?: readonly Locale[];
}

export function buildLanguageSelectorState({
  currentLocale,
  alternateHref,
  ariaLabel,
  publishedLocales = PUBLISHED_LOCALES,
}: LanguageSelectorStateOptions): LanguageSelectorState | null {
  if (
    !hasMultiplePublishedLocales(publishedLocales) ||
    !localeIsPublished(currentLocale, publishedLocales)
  ) {
    return null;
  }

  const alternate = alternateLocale(currentLocale);
  if (!localeIsPublished(alternate, publishedLocales) || !alternateHref) {
    return null;
  }

  return {
    ariaLabel,
    items: SUPPORTED_LOCALES.map((locale): LanguageSelectorItem => {
      const language = LANGUAGE_LABELS[locale];
      return locale === currentLocale
        ? {
            kind: 'active',
            locale,
            label: language.label,
            language: language.language,
            ariaCurrent: 'page',
          }
        : {
            kind: 'link',
            locale,
            label: language.label,
            language: language.language,
            href: alternateHref,
            hreflang: locale,
          };
    }),
  };
}
