import { readdirSync, readFileSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { workRecords } from '../data/work-records.ts';
import {
  NOT_FOUND_PATHS,
  STATIC_ROUTE_KEYS,
  routeFor,
} from './routes.ts';
import { PUBLISHED_LOCALES, localeIsPublished } from './types.ts';
import { validateHeaderIdentityOutput } from '../../scripts/lib/header-identity-output.mjs';
import { validateLocalizedContentOutput } from '../../scripts/lib/localized-content-output.mjs';

interface RoutePair {
  label: string;
  en: string;
  hi: string;
  indexable: boolean;
}

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function publicPath(root: string, file: string): string {
  return relative(root, file).split(sep).join('/');
}

function outputPath(route: string): string {
  if (route === '/') return 'index.html';
  if (route.endsWith('.html')) return route.slice(1);
  return `${route.slice(1)}index.html`;
}

function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).href;
}

function escapePattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${escapePattern(name)}=["']([^"']*)["']`, 'i'),
  );
  return match?.[1] ?? null;
}

function hasTag(
  html: string,
  name: string,
  expected: Readonly<Record<string, string>>,
): boolean {
  return tags(html, name).some((tag) =>
    Object.entries(expected).every(
      ([key, value]) => attribute(tag, key) === value,
    ),
  );
}

function routePairs(): RoutePair[] {
  const staticPairs = STATIC_ROUTE_KEYS.map((key) => ({
    label: key,
    en: routeFor(key, 'en'),
    hi: routeFor(key, 'hi'),
    indexable: true,
  }));

  const recordPairs = workRecords.map((record) =>
    record.type === 'clothing'
      ? {
          label: `clothingRecord:${record.slug}`,
          en: routeFor('clothingRecord', 'en', { year: record.slug }),
          hi: routeFor('clothingRecord', 'hi', { year: record.slug }),
          indexable: true,
        }
      : {
          label: `educationRecord:${record.slug}`,
          en: routeFor('educationRecord', 'en', { slug: record.slug }),
          hi: routeFor('educationRecord', 'hi', { slug: record.slug }),
          indexable: true,
        },
  );

  return [
    ...staticPairs,
    ...recordPairs,
    {
      label: 'notFound',
      en: NOT_FOUND_PATHS.en,
      hi: NOT_FOUND_PATHS.hi,
      indexable: false,
    },
  ];
}

function validateEnglishOnlyOutput(root: string, files: string[]): string[] {
  const failures: string[] = [];

  for (const file of files) {
    const path = publicPath(root, file);
    if (path === 'hi' || path.startsWith('hi/')) {
      failures.push(`Hindi output exists: ${path}`);
    }
    if (basename(path).includes('language-preference')) {
      failures.push(`Preference script was emitted: ${path}`);
    }
    if (!path.endsWith('.html')) continue;

    const html = readFileSync(file, 'utf8');
    if (html.includes('data-language-selector')) {
      failures.push(`Language selector was rendered: ${path}`);
    }
    if (html.includes('data-language-choice')) {
      failures.push(`Language preference control was rendered: ${path}`);
    }
    if (/hreflang=["']hi["']/.test(html)) {
      failures.push(`Hindi alternate link was rendered: ${path}`);
    }
    if (html.includes('/hi/')) {
      failures.push(`Hindi route leaked into English HTML: ${path}`);
    }
    if (html.includes('language-preference')) {
      failures.push(`Preference script was referenced: ${path}`);
    }
  }

  return failures;
}

function validateRouteFiles(
  root: string,
  files: string[],
  pairs: RoutePair[],
): string[] {
  const failures: string[] = [];
  const actual = new Set(
    files
      .map((file) => publicPath(root, file))
      .filter((path) => path.endsWith('.html')),
  );
  const expected = new Set(
    pairs.flatMap((pair) => [outputPath(pair.en), outputPath(pair.hi)]),
  );

  for (const path of expected) {
    if (!actual.has(path)) failures.push(`Missing rendered route: ${path}`);
  }
  for (const path of actual) {
    if (!expected.has(path)) failures.push(`Unexpected rendered route: ${path}`);
  }

  return failures;
}

function validateExecutableScripts(html: string, path: string): string[] {
  const failures: string[] = [];
  const scripts = html.matchAll(/<script\b([^>]*)>[\s\S]*?<\/script>/gi);

  for (const match of scripts) {
    const opening = `<script${match[1]}>`;
    if (attribute(opening, 'type') === 'application/ld+json') continue;
    const src = attribute(opening, 'src');
    if (!src || !src.startsWith('/')) {
      failures.push(`Executable script is not same-origin external on ${path}`);
    }
  }

  return failures;
}

function collectIds(html: string): string[] {
  return [...html.matchAll(/\bid=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .sort();
}

function validatePagePair(
  root: string,
  origin: string,
  pair: RoutePair,
): string[] {
  const failures: string[] = [];
  const editions = [
    { locale: 'en', alternate: 'hi', route: pair.en, other: pair.hi },
    { locale: 'hi', alternate: 'en', route: pair.hi, other: pair.en },
  ] as const;

  for (const edition of editions) {
    const path = outputPath(edition.route);
    const html = readFileSync(resolve(root, path), 'utf8');
    const canonical = absoluteUrl(origin, edition.route);
    const alternate = absoluteUrl(origin, edition.other);

    if (!hasTag(html, 'html', { lang: edition.locale })) {
      failures.push(`Incorrect html lang on ${path}`);
    }
    if (!html.includes('data-language-selector')) {
      failures.push(`Missing language selector on ${path}`);
    }
    if (!hasTag(html, 'nav', {
      'data-preserve-query': 'true',
    })) {
      failures.push(`Selector query policy is missing on ${path}`);
    }
    if (!hasTag(html, 'a', {
      href: edition.other,
      hreflang: edition.alternate,
      lang: edition.alternate,
      'data-language-choice': edition.alternate,
    })) {
      failures.push(`Incorrect alternate-language selector link on ${path}`);
    }
    if (!html.includes(
      `<span lang="${edition.locale}" aria-current="page"`,
    )) {
      failures.push(`Active language is not non-linked on ${path}`);
    }
    const preferenceScript = tags(html, 'script').find(
      (tag) =>
        attribute(tag, 'type') === 'module' &&
        attribute(tag, 'src')?.startsWith(
          '/scripts/language-preference.js?v=',
        ),
    );
    if (!preferenceScript) {
      failures.push(`Missing preference script on ${path}`);
    }
    if (!hasTag(html, 'link', { rel: 'canonical', href: canonical })) {
      failures.push(`Incorrect canonical URL on ${path}`);
    }
    if (!hasTag(html, 'link', {
      rel: 'alternate',
      hreflang: edition.locale,
      href: canonical,
    })) {
      failures.push(`Missing self hreflang on ${path}`);
    }
    if (!hasTag(html, 'link', {
      rel: 'alternate',
      hreflang: edition.alternate,
      href: alternate,
    })) {
      failures.push(`Missing reciprocal hreflang on ${path}`);
    }

    const expectsXDefault = pair.label === 'home';
    const hasXDefault = hasTag(html, 'link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: absoluteUrl(origin, '/'),
    });
    if (expectsXDefault !== hasXDefault) {
      failures.push(`Incorrect x-default policy on ${path}`);
    }

    const ogLocale = edition.locale === 'en' ? 'en_IN' : 'hi_IN';
    const ogAlternate = edition.locale === 'en' ? 'hi_IN' : 'en_IN';
    if (!hasTag(html, 'meta', {
      property: 'og:locale',
      content: ogLocale,
    })) {
      failures.push(`Incorrect Open Graph locale on ${path}`);
    }
    if (!hasTag(html, 'meta', {
      property: 'og:locale:alternate',
      content: ogAlternate,
    })) {
      failures.push(`Incorrect Open Graph locale alternate on ${path}`);
    }

    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
    const description = tags(html, 'meta')
      .find((tag) => attribute(tag, 'name') === 'description');
    const descriptionContent = description
      ? attribute(description, 'content') ?? ''
      : '';
    if (!title.trim() || !descriptionContent.trim()) {
      failures.push(`Missing localized title or description on ${path}`);
    }
    if (
      edition.locale === 'hi' &&
      (!/[\u0900-\u097f]/.test(title) ||
        !/[\u0900-\u097f]/.test(descriptionContent))
    ) {
      failures.push(`Hindi metadata lacks Devanagari content on ${path}`);
    }

    if (edition.locale === 'hi') {
      const fallbackMarkers = [
        '>Skip to content<',
        'aria-label="Primary"',
        'aria-label="Footer"',
        'aria-label="Language"',
        'data-viewer-dialog-label="Media viewer"',
        'data-viewer-close-label="Close viewer"',
      ];
      for (const marker of fallbackMarkers) {
        if (html.includes(marker)) {
          failures.push(`English interface fallback on ${path}: ${marker}`);
        }
      }
    }

    failures.push(...validateExecutableScripts(html, path));
  }

  const englishIds = collectIds(
    readFileSync(resolve(root, outputPath(pair.en)), 'utf8'),
  );
  const hindiIds = collectIds(
    readFileSync(resolve(root, outputPath(pair.hi)), 'utf8'),
  );
  if (englishIds.join('\n') !== hindiIds.join('\n')) {
    failures.push(`Fragment ID drift for ${pair.label}`);
  }

  return failures;
}

function validateSitemap(
  root: string,
  origin: string,
  pairs: RoutePair[],
): string[] {
  const failures: string[] = [];
  const sitemapPath = resolve(root, 'sitemap-0.xml');
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const actual = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
  );
  const expected = new Set(
    pairs
      .filter((pair) => pair.indexable)
      .flatMap((pair) => [pair.en, pair.hi])
      .map((path) => absoluteUrl(origin, path)),
  );

  for (const url of expected) {
    if (!actual.has(url)) failures.push(`Sitemap is missing ${url}`);
  }
  for (const url of actual) {
    if (!expected.has(url)) failures.push(`Unexpected sitemap URL: ${url}`);
  }

  return failures;
}

function validateInternalLinks(
  root: string,
  origin: string,
  pairs: RoutePair[],
): string[] {
  const failures: string[] = [];

  for (const route of pairs.flatMap((pair) => [pair.en, pair.hi])) {
    const sourcePath = outputPath(route);
    const html = readFileSync(resolve(root, sourcePath), 'utf8');

    for (const tag of tags(html, 'a')) {
      const href = attribute(tag, 'href');
      if (!href) continue;

      const target = new URL(href, absoluteUrl(origin, route));
      if (target.origin !== origin) continue;

      const targetPath = target.pathname.endsWith('/')
        ? outputPath(target.pathname)
        : target.pathname.slice(1);
      const targetFile = resolve(root, targetPath);
      try {
        const targetHtml = readFileSync(targetFile, 'utf8');
        if (target.hash) {
          const id = decodeURIComponent(target.hash.slice(1));
          if (!collectIds(targetHtml).includes(id)) {
            failures.push(`Broken fragment ${href} on ${sourcePath}`);
          }
        }
      } catch {
        failures.push(`Broken internal link ${href} on ${sourcePath}`);
      }
    }
  }

  return failures;
}

function validatePreferenceArtifact(root: string): string[] {
  const failures: string[] = [];
  const path = resolve(root, 'scripts/language-preference.js');
  const script = readFileSync(path, 'utf8');
  const requirements = [
    "window.location.pathname === '/'",
    "window.location.search === ''",
    "window.location.hash === ''",
    "storedLanguage === 'hi'",
    "window.location.replace('/hi/')",
    'target.search = window.location.search',
    'approvedFragments.has(fragment)',
    "closest?.('[data-language-choice]')",
  ];

  for (const requirement of requirements) {
    if (!script.includes(requirement)) {
      failures.push(`Preference artifact is missing rule: ${requirement}`);
    }
  }

  const headers = readFileSync(resolve(root, '_headers'), 'utf8');
  if (!headers.includes("script-src 'self'")) {
    failures.push("CSP no longer limits scripts to 'self'");
  }
  if (headers.includes("script-src 'self' 'unsafe-inline'")) {
    failures.push('CSP permits inline executable scripts');
  }

  return failures;
}

function validateBilingualOutput(
  root: string,
  files: string[],
  origin: string,
): string[] {
  const pairs = routePairs();
  return [
    ...validateRouteFiles(root, files, pairs),
    ...validateHeaderIdentityOutput(root),
    ...validateLocalizedContentOutput(root),
    ...pairs.flatMap((pair) => validatePagePair(root, origin, pair)),
    ...validateSitemap(root, origin, pairs),
    ...validateInternalLinks(root, origin, pairs),
    ...validatePreferenceArtifact(root),
  ];
}

export function validatePublicationOutput(
  directory: URL,
  siteOrigin: string,
): void {
  const root = fileURLToPath(directory);
  const files = filesUnder(root);
  const origin = new URL(siteOrigin).origin;
  const bilingual = localeIsPublished('hi', PUBLISHED_LOCALES);
  const failures = bilingual
    ? validateBilingualOutput(root, files, origin)
    : validateEnglishOnlyOutput(root, files);

  if (failures.length) {
    throw new Error(
      `Publication output validation failed:\n- ${failures.join('\n- ')}`,
    );
  }
}

export function publicationOutputGuard(siteOrigin: string) {
  return {
    name: 'publication-output-guard',
    hooks: {
      'astro:build:done': ({ dir }: { dir: URL }) => {
        validatePublicationOutput(dir, siteOrigin);
      },
    },
  };
}
