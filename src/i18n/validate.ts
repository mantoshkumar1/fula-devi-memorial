import {
  DEFAULT_LOCALE,
  PUBLISHED_LOCALES,
  SUPPORTED_LOCALES,
  type Locale,
} from './types.ts';
import {
  DYNAMIC_ROUTE_KEYS,
  ROUTES,
  STATIC_ROUTE_KEYS,
  type RouteKey,
} from './routes.ts';

const PLACEHOLDER = /:([a-z][a-z0-9]*)/g;

function placeholders(path: string): string[] {
  return [...path.matchAll(PLACEHOLDER)].map((match) => match[1]);
}

function assertRouteShape(routeKey: RouteKey, locale: Locale, path: string): void {
  if (!path.startsWith('/') || !path.endsWith('/')) {
    throw new Error(`${routeKey}.${locale} must be an absolute trailing-slash path`);
  }
  if (locale === 'en' && path.startsWith('/hi/')) {
    throw new Error(`${routeKey}.en must not use the Hindi prefix`);
  }
  if (locale === 'hi' && !path.startsWith('/hi/')) {
    throw new Error(`${routeKey}.hi must use the /hi/ prefix`);
  }
}

/**
 * Build-time validation for the Phase 1 foundation.
 *
 * This validates declarations only. It does not register Astro i18n routing,
 * create Hindi pages, or alter any rendered output.
 */
export function validateI18nFoundation(): void {
  if (!SUPPORTED_LOCALES.includes(DEFAULT_LOCALE)) {
    throw new Error(`Default locale ${DEFAULT_LOCALE} is not supported`);
  }
  if (!(PUBLISHED_LOCALES as readonly Locale[]).includes(DEFAULT_LOCALE)) {
    throw new Error(`Default locale ${DEFAULT_LOCALE} must remain published`);
  }
  for (const locale of PUBLISHED_LOCALES) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new Error(`Published locale ${locale} is not supported`);
    }
  }

  const routeKeys = [...STATIC_ROUTE_KEYS, ...DYNAMIC_ROUTE_KEYS];
  const seen = new Map<Locale, Set<string>>(
    SUPPORTED_LOCALES.map((locale) => [locale, new Set<string>()]),
  );

  for (const routeKey of routeKeys) {
    const definition = ROUTES[routeKey];

    for (const locale of SUPPORTED_LOCALES) {
      const path = definition.paths[locale];
      assertRouteShape(routeKey, locale, path);

      const localePaths = seen.get(locale);
      if (!localePaths) throw new Error(`No route registry for ${locale}`);
      if (localePaths.has(path)) {
        throw new Error(`Duplicate ${locale} route declaration: ${path}`);
      }
      localePaths.add(path);
    }

    if (definition.kind === 'static') {
      for (const locale of SUPPORTED_LOCALES) {
        if (placeholders(definition.paths[locale]).length) {
          throw new Error(`${routeKey}.${locale} is static but contains a parameter`);
        }
      }
      continue;
    }

    const expected = [...definition.params].sort();
    for (const locale of SUPPORTED_LOCALES) {
      const actual = placeholders(definition.paths[locale]).sort();
      if (actual.join(',') !== expected.join(',')) {
        throw new Error(
          `${routeKey}.${locale} parameters do not match: ` +
            `${actual.join(',') || 'none'} != ${expected.join(',')}`,
        );
      }
    }
  }

  if (ROUTES.home.paths.en !== '/' || ROUTES.home.paths.hi !== '/hi/') {
    throw new Error('Home routes must remain / and /hi/');
  }
}
