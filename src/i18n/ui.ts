import { englishUi } from '../locales/en/ui.ts';
import type { StaticRouteKey } from './routes.ts';
import type { Locale, PublishedLocale } from './types.ts';

export interface SharedUi {
  locale: Locale;
  institution: {
    displayName: string;
    mastheadSubtitle?: {
      text: string;
      language: string;
    };
  };
  metadata: {
    htmlLanguage: string;
    openGraphLocale: string;
    titleSeparator: string;
  };
  skipToContent: string;
  navigation: {
    primaryAriaLabel: string;
    footerAriaLabel: string;
    labels: Record<StaticRouteKey, string>;
  };
  footer: {
    registrationNumberLabel: string;
  };
  breadcrumbs: {
    ariaLabel: string;
    homeLabel: string;
  };
}

/**
 * Complete shared UI for every locale that may currently render.
 *
 * There is deliberately no default entry and no fallback branch. Publishing a
 * new locale expands PublishedLocale, which makes a missing module a type
 * error before that locale can build.
 */
export const SHARED_UI_BY_LOCALE = {
  en: englishUi,
} as const satisfies Record<PublishedLocale, SharedUi>;

export function sharedUiFor(locale: PublishedLocale): SharedUi {
  if (!Object.hasOwn(SHARED_UI_BY_LOCALE, locale)) {
    throw new Error(`Missing required ${locale} shared UI`);
  }
  return SHARED_UI_BY_LOCALE[locale];
}
