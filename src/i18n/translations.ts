import type { Locale } from './types.ts';

/**
 * A complete locale map. Locale values are required and cannot silently fall
 * back to another language.
 */
export type NoFallbackLocaleMap<T> = {
  [L in Locale]-?: T;
};

export function defineLocaleMap<T>(values: NoFallbackLocaleMap<T>): NoFallbackLocaleMap<T> {
  return values;
}

export function valueForLocale<T>(
  values: NoFallbackLocaleMap<T>,
  locale: Locale,
): T {
  if (!Object.hasOwn(values, locale)) {
    throw new Error(`Missing required ${locale} translation`);
  }
  return values[locale];
}

export type TranslationStatus = 'draft' | 'approved';

export interface CanonicalContent<T> {
  /** Manually advanced when the approved English source changes. */
  sourceVersion: string;
  content: T;
}

export interface TranslatedContent<T> {
  /** The exact English sourceVersion reviewed for this translation. */
  translatedFrom: string;
  /** Only the final editorial approver may move a page to approved. */
  status: TranslationStatus;
  content: T;
}

export interface VersionedTranslation<T> {
  en: CanonicalContent<T>;
  hi: TranslatedContent<T>;
}

export interface TranslationFreshness {
  fresh: boolean;
  sourceVersion: string;
  translatedFrom: string;
}

function assertVersion(label: string, version: string): void {
  if (!version.trim() || /\s/.test(version)) {
    throw new Error(`${label} must be a non-empty version without whitespace`);
  }
}

export function translationFreshness<T>(
  translation: VersionedTranslation<T>,
): TranslationFreshness {
  return {
    fresh: translation.en.sourceVersion === translation.hi.translatedFrom,
    sourceVersion: translation.en.sourceVersion,
    translatedFrom: translation.hi.translatedFrom,
  };
}

/**
 * Defines one complete English/Hindi content pair.
 *
 * Draft work may be stale while it is being revised, but an approved
 * translation is rejected immediately unless it was reviewed against the
 * current English source version.
 */
export function defineVersionedTranslation<T>(
  id: string,
  translation: VersionedTranslation<T>,
): VersionedTranslation<T> {
  assertVersion(`${id}.en.sourceVersion`, translation.en.sourceVersion);
  assertVersion(`${id}.hi.translatedFrom`, translation.hi.translatedFrom);

  const freshness = translationFreshness(translation);
  if (translation.hi.status === 'approved' && !freshness.fresh) {
    throw new Error(
      `${id}: approved Hindi translation targets ${freshness.translatedFrom}, ` +
        `but English is ${freshness.sourceVersion}`,
    );
  }

  return translation;
}

/**
 * Publication gate for a Hindi page. The configured build calls this for every
 * required route before emitting the bilingual production route set.
 */
export function assertHindiReady<T>(
  id: string,
  translation: VersionedTranslation<T>,
): void {
  const freshness = translationFreshness(translation);
  if (translation.hi.status !== 'approved') {
    throw new Error(`${id}: Hindi translation has not been editorially approved`);
  }
  if (!freshness.fresh) {
    throw new Error(
      `${id}: Hindi translation is stale (${freshness.translatedFrom} != ${freshness.sourceVersion})`,
    );
  }
}
