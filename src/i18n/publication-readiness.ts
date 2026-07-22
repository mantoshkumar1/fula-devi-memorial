import { STATIC_ROUTE_KEYS, type RouteKey } from './routes.ts';
import {
  PUBLISHED_LOCALES,
  localeIsPublished,
  type Locale,
} from './types.ts';
import {
  assertHindiReady,
  type VersionedTranslation,
} from './translations.ts';
import { SHARED_UI_BY_LOCALE, type SharedUi } from './ui.ts';

export type HindiTranslationKey =
  | (typeof STATIC_ROUTE_KEYS)[number]
  | Extract<RouteKey, 'clothingRecord' | 'educationRecord'>
  | 'notFound';

/**
 * Update detail is deliberately absent until an English detail route publishes.
 * Dynamic records and the 404 experience still require approved Hindi content.
 */
export const REQUIRED_HINDI_TRANSLATION_KEYS = [
  ...STATIC_ROUTE_KEYS,
  'clothingRecord',
  'educationRecord',
  'notFound',
] as const satisfies readonly HindiTranslationKey[];

/** Later phases register reviewed page content here; Phase 3 adds no copy. */
export const HINDI_TRANSLATIONS_BY_ROUTE: Partial<
  Record<HindiTranslationKey, VersionedTranslation<unknown>>
> = {};

interface HindiPublicationEvidence {
  sharedUiByLocale?: Partial<Record<Locale, SharedUi>>;
  translationsByRoute?: Partial<
    Record<HindiTranslationKey, VersionedTranslation<unknown>>
  >;
}

export function assertHindiPublicationReady(
  evidence: HindiPublicationEvidence = {},
): void {
  const sharedUiByLocale =
    evidence.sharedUiByLocale ??
    (SHARED_UI_BY_LOCALE as Partial<Record<Locale, SharedUi>>);
  const translationsByRoute =
    evidence.translationsByRoute ?? HINDI_TRANSLATIONS_BY_ROUTE;
  const ui = sharedUiByLocale.hi;

  if (!ui) throw new Error('Hindi publication requires complete shared UI');
  if (ui.locale !== 'hi') {
    throw new Error(`Hindi shared UI declares locale ${ui.locale}`);
  }

  const metadata = [
    ui.institution.displayName,
    ui.metadata.htmlLanguage,
    ui.metadata.openGraphLocale,
    ui.navigation.languageAriaLabel,
  ];
  if (metadata.some((value) => !value.trim())) {
    throw new Error('Hindi publication requires complete metadata and identity');
  }

  for (const key of REQUIRED_HINDI_TRANSLATION_KEYS) {
    const translation = translationsByRoute[key];
    if (!translation) {
      throw new Error(`Hindi publication requires an approved ${key} translation`);
    }
    assertHindiReady(key, translation);
  }
}

export function validateConfiguredPublicationReadiness(): void {
  if (localeIsPublished('hi', PUBLISHED_LOCALES)) {
    assertHindiPublicationReady();
  }
}
