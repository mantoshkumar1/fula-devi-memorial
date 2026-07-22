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
  routeFor,
  type RouteKey,
  type StaticRouteKey,
} from './routes.ts';
import { PRIMARY_NAV_ROUTE_KEYS } from '../data/nav.ts';
import { SHARED_UI_BY_LOCALE } from './ui.ts';
import { validateConfiguredPublicationReadiness } from './publication-readiness.ts';
import { validatePhase3Infrastructure } from './validate-phase3.ts';

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

function assertNonEmpty(label: string, value: string): void {
  if (!value.trim()) throw new Error(`${label} must not be empty`);
}

function validateNavigation(
  label: string,
  routeKeys: readonly StaticRouteKey[],
  locale: (typeof PUBLISHED_LOCALES)[number],
): void {
  const seen = new Set<StaticRouteKey>();
  const ui = SHARED_UI_BY_LOCALE[locale];

  for (const routeKey of routeKeys) {
    if (seen.has(routeKey)) {
      throw new Error(`${label} contains duplicate route ${routeKey}`);
    }
    seen.add(routeKey);
    assertNonEmpty(
      `${locale}.navigation.labels.${routeKey}`,
      ui.navigation.labels[routeKey],
    );
    routeFor(routeKey, locale);
  }
}

function validateSharedUi(): void {
  for (const locale of PUBLISHED_LOCALES) {
    const ui = SHARED_UI_BY_LOCALE[locale];
    if (ui.locale !== locale) {
      throw new Error(`${locale} shared UI declares locale ${ui.locale}`);
    }

    const requiredStrings = [
      ['institution.displayName', ui.institution.displayName],
      ['metadata.htmlLanguage', ui.metadata.htmlLanguage],
      ['metadata.openGraphLocale', ui.metadata.openGraphLocale],
      ['metadata.titleSeparator', ui.metadata.titleSeparator],
      ['skipToContent', ui.skipToContent],
      ['navigation.primaryAriaLabel', ui.navigation.primaryAriaLabel],
      ['navigation.footerAriaLabel', ui.navigation.footerAriaLabel],
      ['navigation.languageAriaLabel', ui.navigation.languageAriaLabel],
      ['footer.registrationNumberLabel', ui.footer.registrationNumberLabel],
      ['footer.locationLabel', ui.footer.locationLabel],
      ['breadcrumbs.ariaLabel', ui.breadcrumbs.ariaLabel],
      ['breadcrumbs.homeLabel', ui.breadcrumbs.homeLabel],
      ['documents.notYetPublished', ui.documents.notYetPublished],
      ['documents.pdfFallback', ui.documents.pdfFallback],
      ['resources.draftLabel', ui.resources.draftLabel],
      ['resources.opensNewTab', ui.resources.opensNewTab],
      ['sectionPermalinkLabel', ui.sectionPermalinkLabel],
      ['updatesEmptyState', ui.updatesEmptyState],
      ['mediaViewer.dialogLabel', ui.mediaViewer.dialogLabel],
      ['mediaViewer.closeLabel', ui.mediaViewer.closeLabel],
      ['mediaViewer.previousLabel', ui.mediaViewer.previousLabel],
      ['mediaViewer.nextLabel', ui.mediaViewer.nextLabel],
      ['mediaViewer.statusTemplate', ui.mediaViewer.statusTemplate],
      ['mediaViewer.statusWithKindTemplate', ui.mediaViewer.statusWithKindTemplate],
      ['mediaViewer.kindLabels.programme-photo', ui.mediaViewer.kindLabels['programme-photo']],
      ['mediaViewer.kindLabels.independent-coverage', ui.mediaViewer.kindLabels['independent-coverage']],
      ['mediaViewer.kindLabels.academic-record-page', ui.mediaViewer.kindLabels['academic-record-page']],
    ] as const;

    for (const [key, value] of requiredStrings) {
      assertNonEmpty(`${locale}.${key}`, value);
    }
    if (locale === 'en') {
      if (!('mastheadSubtitle' in ui.institution)) {
        throw new Error(`${locale}.institution.mastheadSubtitle is required`);
      }
      const subtitle = ui.institution.mastheadSubtitle;
      assertNonEmpty(
        `${locale}.institution.mastheadSubtitle.text`,
        subtitle.text,
      );
      assertNonEmpty(
        `${locale}.institution.mastheadSubtitle.language`,
        subtitle.language,
      );
    }
    for (const routeKey of STATIC_ROUTE_KEYS) {
      assertNonEmpty(
        `${locale}.navigation.labels.${routeKey}`,
        ui.navigation.labels[routeKey],
      );
    }

    validateNavigation('Primary navigation', PRIMARY_NAV_ROUTE_KEYS, locale);
  }
}

/**
 * Build-time validation for the complete Version 1.1 localization registry.
 * Route declarations, shared UI, approval state, freshness and preference
 * rules must all validate before Astro renders either edition.
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

  validateSharedUi();
  validateConfiguredPublicationReadiness();
  validatePhase3Infrastructure();
}
