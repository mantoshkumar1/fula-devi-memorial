import { routeFor } from './routes.ts';
import {
  PUBLISHED_LOCALES,
  isLocale,
  localeIsPublished,
  type Locale,
} from './types.ts';

export const LANGUAGE_STORAGE_KEY = 'fula-devi-language';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LocationLike {
  pathname: string;
  search: string;
  hash: string;
  replace(url: string): void;
}

export function validStoredPreference(value: string | null): Locale | null {
  return value && isLocale(value) ? value : null;
}

export function readStoredPreference(storage: StorageLike | null): Locale | null {
  if (!storage) return null;
  try {
    return validStoredPreference(storage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function storeLanguagePreference(
  storage: StorageLike | null,
  locale: string,
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): boolean {
  if (!storage || !isLocale(locale) || !localeIsPublished(locale, publishedLocales)) {
    return false;
  }
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}

export function bareRootRedirectTarget(
  location: Pick<LocationLike, 'pathname' | 'search' | 'hash'>,
  storedPreference: string | null,
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): string | null {
  // A query or fragment makes this an explicit URL, not a bare-root visit.
  if (
    location.pathname !== '/' ||
    location.search !== '' ||
    location.hash !== ''
  ) {
    return null;
  }
  if (validStoredPreference(storedPreference) !== 'hi') return null;
  if (!localeIsPublished('hi', publishedLocales)) return null;

  return routeFor('home', 'hi');
}

export function applyStoredRootRedirect(
  storage: StorageLike | null,
  location: LocationLike,
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): boolean {
  const storedPreference = readStoredPreference(storage);
  const target = bareRootRedirectTarget(
    location,
    storedPreference,
    publishedLocales,
  );
  if (!target) return false;

  location.replace(target);
  return true;
}
