import { alternateLocale, type Locale } from './types.ts';

/**
 * Public page identities whose paths do not require parameters.
 *
 * These are route declarations only. A declaration does not create an Astro
 * page; Hindi remains unpublished until corresponding files are deliberately
 * added in a later phase.
 */
export const STATIC_ROUTE_KEYS = [
  'home',
  'institution',
  'fulaDevi',
  'ourWork',
  'updates',
  'governance',
  'contact',
] as const;

export type StaticRouteKey = (typeof STATIC_ROUTE_KEYS)[number];

/**
 * Dynamic route families that already produce published English record pages.
 * Update-detail routes are intentionally absent: no English detail route is
 * currently published, so Phase 1 must not plan or expose a Hindi counterpart.
 */
export const DYNAMIC_ROUTE_KEYS = ['clothingRecord', 'educationRecord'] as const;

export type DynamicRouteKey = (typeof DYNAMIC_ROUTE_KEYS)[number];
export type RouteKey = StaticRouteKey | DynamicRouteKey;

export interface RouteParamsByKey {
  clothingRecord: { year: string };
  educationRecord: { slug: string };
}

interface StaticRouteDefinition {
  kind: 'static';
  paths: Record<Locale, string>;
}

interface DynamicRouteDefinition<K extends DynamicRouteKey> {
  kind: 'dynamic';
  paths: Record<Locale, string>;
  params: readonly (keyof RouteParamsByKey[K] & string)[];
}

type RouteMap = {
  [K in StaticRouteKey]: StaticRouteDefinition;
} & {
  [K in DynamicRouteKey]: DynamicRouteDefinition<K>;
};

/**
 * The one explicit mapping between equivalent English and Hindi routes.
 * Locale switching must use this map, never pathname prefix replacement.
 */
export const ROUTES = {
  home: {
    kind: 'static',
    paths: { en: '/', hi: '/hi/' },
  },
  institution: {
    kind: 'static',
    paths: { en: '/institution/', hi: '/hi/institution/' },
  },
  fulaDevi: {
    kind: 'static',
    paths: { en: '/fula-devi/', hi: '/hi/fula-devi/' },
  },
  ourWork: {
    kind: 'static',
    paths: { en: '/our-work/', hi: '/hi/our-work/' },
  },
  updates: {
    kind: 'static',
    paths: { en: '/updates/', hi: '/hi/updates/' },
  },
  governance: {
    kind: 'static',
    paths: { en: '/governance/', hi: '/hi/governance/' },
  },
  contact: {
    kind: 'static',
    paths: { en: '/contact/', hi: '/hi/contact/' },
  },
  clothingRecord: {
    kind: 'dynamic',
    paths: {
      en: '/records/clothing/:year/',
      hi: '/hi/records/clothing/:year/',
    },
    params: ['year'],
  },
  educationRecord: {
    kind: 'dynamic',
    paths: {
      en: '/records/education/:slug/',
      hi: '/hi/records/education/:slug/',
    },
    params: ['slug'],
  },
} as const satisfies RouteMap;

const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type AnyRouteDefinition =
  | StaticRouteDefinition
  | {
      kind: 'dynamic';
      paths: Record<Locale, string>;
      params: readonly string[];
    };

function buildRoute(
  definition: AnyRouteDefinition,
  locale: Locale,
  params?: Readonly<Record<string, string>>,
): string {
  let path = definition.paths[locale];

  if (definition.kind === 'static') return path;

  for (const parameter of definition.params) {
    const value = params?.[parameter];
    if (!value || !SAFE_SEGMENT.test(value)) {
      throw new Error(
        `Invalid or missing route parameter "${parameter}" for ${path}`,
      );
    }
    path = path.replace(`:${parameter}`, value);
  }

  if (/:[a-z][a-z0-9]*/.test(path)) {
    throw new Error(`Unresolved route parameter in ${path}`);
  }

  return path;
}

export function routeFor(key: StaticRouteKey, locale: Locale): string;
export function routeFor<K extends DynamicRouteKey>(
  key: K,
  locale: Locale,
  params: RouteParamsByKey[K],
): string;
export function routeFor(
  key: RouteKey,
  locale: Locale,
  params?: Readonly<Record<string, string>>,
): string {
  return buildRoute(ROUTES[key], locale, params);
}

export function alternateRouteFor(key: StaticRouteKey, locale: Locale): string;
export function alternateRouteFor<K extends DynamicRouteKey>(
  key: K,
  locale: Locale,
  params: RouteParamsByKey[K],
): string;
export function alternateRouteFor(
  key: RouteKey,
  locale: Locale,
  params?: Readonly<Record<string, string>>,
): string {
  return buildRoute(ROUTES[key], alternateLocale(locale), params);
}
