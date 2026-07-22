import {
  routeFor,
  NOT_FOUND_PATHS,
  type DynamicRouteKey,
  type RouteParamsByKey,
  type StaticRouteKey,
} from './routes.ts';
import {
  PUBLISHED_LOCALES,
  alternateLocale,
  localeIsPublished,
  type Locale,
} from './types.ts';

type DynamicRouteReference = {
  [K in DynamicRouteKey]: {
    key: K;
    params: RouteParamsByKey[K];
  };
}[DynamicRouteKey];

export type RouteReference =
  | { key: StaticRouteKey }
  | DynamicRouteReference
  | { key: 'notFound' };

export interface EquivalentRouteOptions {
  /** The current URL supplies query and fragment state, never route identity. */
  currentUrl?: string | URL;
  /** Query parameters are preserved unless a caller explicitly opts out. */
  preserveQuery?: boolean;
  /** Only exact, explicitly approved fragment identifiers may cross locales. */
  approvedFragments?: readonly string[];
  /** Injectable for dependency-free validation; production uses one config. */
  publishedLocales?: readonly Locale[];
}

function routeReferencePath(
  reference: RouteReference,
  locale: Locale,
): string | null {
  if (reference.key === 'notFound') {
    return NOT_FOUND_PATHS[locale];
  }
  if (!('params' in reference)) return routeFor(reference.key, locale);

  switch (reference.key) {
    case 'clothingRecord':
      return routeFor('clothingRecord', locale, reference.params);
    case 'educationRecord':
      return routeFor('educationRecord', locale, reference.params);
    case 'updateDetail':
      return routeFor('updateDetail', locale, reference.params);
  }
}

function sourceUrl(value: string | URL): URL {
  return value instanceof URL
    ? value
    : new URL(value, 'https://route-context.invalid');
}

export function equivalentRouteFor(
  reference: RouteReference,
  targetLocale: Locale,
  options: EquivalentRouteOptions = {},
): string | null {
  const publishedLocales = options.publishedLocales ?? PUBLISHED_LOCALES;
  if (!localeIsPublished(targetLocale, publishedLocales)) return null;

  const targetPath = routeReferencePath(reference, targetLocale);
  if (!targetPath) return null;

  const current = options.currentUrl ? sourceUrl(options.currentUrl) : null;
  const search =
    current && options.preserveQuery !== false ? current.search : '';
  const fragment = current?.hash.slice(1) ?? '';
  const hash =
    fragment && options.approvedFragments?.includes(fragment)
      ? current?.hash ?? ''
      : '';

  return `${targetPath}${search}${hash}`;
}

export function alternateEquivalentRouteFor(
  reference: RouteReference,
  currentLocale: Locale,
  options: EquivalentRouteOptions = {},
): string | null {
  return equivalentRouteFor(reference, alternateLocale(currentLocale), options);
}
