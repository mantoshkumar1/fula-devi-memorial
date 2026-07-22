import {
  applyStoredRootRedirect,
  storeLanguagePreference,
  type LocationLike,
  type StorageLike,
} from '../i18n/preference.ts';
import { PUBLISHED_LOCALES, type Locale } from '../i18n/types.ts';

const LANGUAGE_CHOICE_SELECTOR = '[data-language-choice]';

interface ChoiceElementLike {
  getAttribute(name: string): string | null;
}

interface ClickTargetLike {
  closest(selector: string): ChoiceElementLike | null;
}

interface DocumentLike {
  addEventListener(type: 'click', listener: (event: Event) => void): void;
  removeEventListener(type: 'click', listener: (event: Event) => void): void;
}

export interface LanguagePreferenceEnvironment {
  document: DocumentLike;
  location: LocationLike;
  readonly localStorage: StorageLike;
}

function choiceElement(target: EventTarget | null): ChoiceElementLike | null {
  const candidate = target as (EventTarget & Partial<ClickTargetLike>) | null;
  return typeof candidate?.closest === 'function'
    ? candidate.closest(LANGUAGE_CHOICE_SELECTOR)
    : null;
}

/**
 * Testable preference model used by build-time validation. The production
 * counterpart is the CSP-safe same-origin public script with identical rules.
 */
export function activateLanguagePreference(
  environment: LanguagePreferenceEnvironment,
  publishedLocales: readonly Locale[] = PUBLISHED_LOCALES,
): () => void {
  let storage: StorageLike | null = null;
  try {
    storage = environment.localStorage;
  } catch {
    // Links remain ordinary links when storage access is blocked.
  }

  applyStoredRootRedirect(storage, environment.location, publishedLocales);

  const handleClick = (event: Event) => {
    const choice = choiceElement(event.target);
    const locale = choice?.getAttribute('data-language-choice');
    if (locale) storeLanguagePreference(storage, locale, publishedLocales);
  };

  environment.document.addEventListener('click', handleClick);
  return () => environment.document.removeEventListener('click', handleClick);
}
