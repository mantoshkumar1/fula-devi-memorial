import {
  alternateEquivalentRouteFor,
  equivalentRouteFor,
} from './equivalent-routes.ts';
import { assertHindiPublicationReady } from './publication-readiness.ts';
import {
  LANGUAGE_STORAGE_KEY,
  applyStoredRootRedirect,
  bareRootRedirectTarget,
  storeLanguagePreference,
  validStoredPreference,
  type LocationLike,
} from './preference.ts';
import { buildLanguageSelectorState } from './selector.ts';
import { activateLanguagePreference } from '../scripts/language-preference.ts';
import type { Locale } from './types.ts';
import { SHARED_UI_BY_LOCALE } from './ui.ts';
import {
  defineVersionedTranslation,
  valueForLocale,
  type NoFallbackLocaleMap,
} from './translations.ts';

const BILINGUAL = ['en', 'hi'] as const satisfies readonly Locale[];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Phase 3 validation: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `Phase 3 validation: ${message} (${String(actual)} != ${String(expected)})`,
    );
  }
}

function expectFailure(run: () => void, expected: string): void {
  try {
    run();
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes(expected),
      `unexpected failure for ${expected}`,
    );
    return;
  }
  throw new Error(`Phase 3 validation: expected failure for ${expected}`);
}

function validateEquivalentRoutes(): void {
  assertEqual(
    equivalentRouteFor({ key: 'governance' }, 'hi', {
      publishedLocales: BILINGUAL,
    }),
    '/hi/governance/',
    'static route equivalence',
  );
  assertEqual(
    equivalentRouteFor(
      { key: 'clothingRecord', params: { year: '2025' } },
      'hi',
      { publishedLocales: BILINGUAL },
    ),
    '/hi/records/clothing/2025/',
    'clothing parameter preservation',
  );
  assertEqual(
    equivalentRouteFor(
      { key: 'educationRecord', params: { slug: '2025-2026' } },
      'hi',
      { publishedLocales: BILINGUAL },
    ),
    '/hi/records/education/2025-2026/',
    'education parameter preservation',
  );
  assertEqual(
    equivalentRouteFor(
      { key: 'updateDetail', params: { slug: 'future-update' } },
      'hi',
      { publishedLocales: BILINGUAL },
    ),
    '/hi/updates/future-update/',
    'future update-detail equivalence',
  );
  assertEqual(
    equivalentRouteFor({ key: 'ourWork' }, 'hi', {
      currentUrl: '/our-work/?source=archive#education',
      approvedFragments: ['education'],
      publishedLocales: BILINGUAL,
    }),
    '/hi/our-work/?source=archive#education',
    'query and approved fragment preservation',
  );
  assertEqual(
    equivalentRouteFor({ key: 'ourWork' }, 'hi', {
      currentUrl: '/our-work/?source=archive#unreviewed',
      approvedFragments: ['education'],
      publishedLocales: BILINGUAL,
    }),
    '/hi/our-work/?source=archive',
    'unapproved fragment rejection',
  );
  assertEqual(
    alternateEquivalentRouteFor({ key: 'contact' }, 'en', {
      publishedLocales: ['en'],
    }),
    null,
    'unpublished locale rejection',
  );
  assertEqual(
    equivalentRouteFor({ key: 'notFound' }, 'hi', {
      publishedLocales: BILINGUAL,
    }),
    '/hi/404.html',
    '404 route equivalence',
  );
}

function validateSelectorStates(): void {
  assertEqual(
    buildLanguageSelectorState({
      currentLocale: 'en',
      alternateHref: '/hi/',
      ariaLabel: 'Language',
      publishedLocales: ['en'],
    }),
    null,
    'selector must stay absent in English-only mode',
  );

  const state = buildLanguageSelectorState({
    currentLocale: 'en',
    alternateHref: '/hi/',
    ariaLabel: 'Language',
    publishedLocales: BILINGUAL,
  });
  assert(state, 'bilingual selector state must exist');
  assertEqual(state.items.length, 2, 'selector item count');

  const english = state.items[0];
  const hindi = state.items[1];
  assert(english.kind === 'active', 'English must be the active non-link state');
  assertEqual(english.ariaCurrent, 'page', 'active selector semantics');
  assertEqual(english.language, 'en', 'English lang attribute');
  assert(hindi.kind === 'link', 'Hindi must be the alternate link state');
  assertEqual(hindi.href, '/hi/', 'alternate selector destination');
  assertEqual(hindi.hreflang, 'hi', 'alternate selector hreflang');
  assertEqual(hindi.language, 'hi', 'Hindi lang attribute');

  const hindiState = buildLanguageSelectorState({
    currentLocale: 'hi',
    alternateHref: '/',
    ariaLabel: 'Language',
    publishedLocales: BILINGUAL,
  });
  assert(hindiState, 'Hindi selector state must exist');
  assert(
    hindiState.items[0].kind === 'link' &&
      hindiState.items[1].kind === 'active',
    'Hindi selector must invert link and active semantics',
  );
}

function validatePreferenceRules(): void {
  assertEqual(validStoredPreference('unknown'), null, 'invalid stored preference');
  assertEqual(
    bareRootRedirectTarget(
      { pathname: '/', search: '?source=home', hash: '' },
      'hi',
      BILINGUAL,
    ),
    null,
    'query-bearing root precedence',
  );
  assertEqual(
    bareRootRedirectTarget(
      { pathname: '/', search: '', hash: '#contact' },
      'hi',
      BILINGUAL,
    ),
    null,
    'fragment-bearing root precedence',
  );
  assertEqual(
    bareRootRedirectTarget(
      { pathname: '/contact/', search: '', hash: '' },
      'hi',
      BILINGUAL,
    ),
    null,
    'explicit English deep-link precedence',
  );
  assertEqual(
    bareRootRedirectTarget(
      { pathname: '/hi/', search: '', hash: '' },
      'en',
      BILINGUAL,
    ),
    null,
    'Hindi routes never redirect to English',
  );
  assertEqual(
    bareRootRedirectTarget(
      { pathname: '/', search: '', hash: '' },
      'hi',
      ['en'],
    ),
    null,
    'unpublished Hindi redirect rejection',
  );

  let replaced = '';
  const location: LocationLike = {
    pathname: '/',
    search: '',
    hash: '',
    replace: (url) => {
      replaced = url;
    },
  };
  const blockedStorage = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  assertEqual(
    applyStoredRootRedirect(blockedStorage, location, BILINGUAL),
    false,
    'localStorage read failure safety',
  );
  assertEqual(replaced, '', 'blocked storage must not redirect');
  assertEqual(
    storeLanguagePreference(blockedStorage, 'hi', BILINGUAL),
    false,
    'localStorage write failure safety',
  );

  const redirectStorage = {
    getItem: (key: string) => (key === LANGUAGE_STORAGE_KEY ? 'hi' : null),
    setItem: () => undefined,
  };
  assertEqual(
    applyStoredRootRedirect(redirectStorage, location, BILINGUAL),
    true,
    'eligible root redirect application',
  );
  assertEqual(replaced, '/hi/', 'root redirect must use the Hindi home route');

  let clickListener: ((event: Event) => void) | null = null;
  const stored: [string, string][] = [];
  const cleanup = activateLanguagePreference(
    {
      document: {
        addEventListener: (_type, listener) => {
          clickListener = listener;
        },
        removeEventListener: () => {
          clickListener = null;
        },
      },
      location: {
        pathname: '/contact/',
        search: '',
        hash: '',
        replace: () => {
          throw new Error('deep link must not redirect');
        },
      },
      localStorage: {
        getItem: () => null,
        setItem: (key, value) => stored.push([key, value]),
      },
    },
    BILINGUAL,
  );
  const installedListener = clickListener as ((event: Event) => void) | null;
  assert(installedListener, 'selector click listener must be installed');
  installedListener({
    target: {
      closest: () => ({
        getAttribute: () => 'hi',
      }),
    },
  } as unknown as Event);
  assertEqual(stored.length, 1, 'only selector action stores a preference');
  assertEqual(stored[0][0], LANGUAGE_STORAGE_KEY, 'preference storage key');
  assertEqual(stored[0][1], 'hi', 'stored selector locale');
  cleanup();
}

export function validatePhase3Infrastructure(): void {
  validateEquivalentRoutes();
  validateSelectorStates();
  validatePreferenceRules();
  expectFailure(
    () =>
      assertHindiPublicationReady({
        sharedUiByLocale: {},
        translationsByRoute: {},
      }),
    'complete shared UI',
  );

  const testHindiUi = {
    ...SHARED_UI_BY_LOCALE.en,
    locale: 'hi' as const,
    metadata: {
      ...SHARED_UI_BY_LOCALE.en.metadata,
      htmlLanguage: 'hi',
      openGraphLocale: 'hi',
    },
  };
  expectFailure(
    () =>
      assertHindiPublicationReady({
        sharedUiByLocale: { hi: testHindiUi },
        translationsByRoute: {
          home: {
            en: { sourceVersion: '1', content: null },
            hi: { translatedFrom: '1', status: 'draft', content: null },
          },
        },
      }),
    'not been editorially approved',
  );
  expectFailure(
    () =>
      defineVersionedTranslation('stale-test', {
        en: { sourceVersion: '2', content: null },
        hi: {
          translatedFrom: '1',
          status: 'approved',
          content: null,
        },
      }),
    'approved Hindi translation targets 1, but English is 2',
  );
  expectFailure(
    () =>
      valueForLocale(
        { en: 'English only' } as NoFallbackLocaleMap<string>,
        'hi',
      ),
    'Missing required hi translation',
  );
}
