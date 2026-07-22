const STORAGE_KEY = 'fula-devi-language';
const PUBLISHED_LANGUAGES = new Set(['en', 'hi']);

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const preferenceStorage = storage();
let storedLanguage = null;

try {
  storedLanguage = preferenceStorage?.getItem(STORAGE_KEY) ?? null;
} catch {
  // Ordinary language links keep working when storage access is blocked.
}

if (
  window.location.pathname === '/' &&
  window.location.search === '' &&
  window.location.hash === '' &&
  storedLanguage === 'hi'
) {
  window.location.replace('/hi/');
}

const languageSelector = document.querySelector('[data-language-selector]');
const alternateChoice = languageSelector?.querySelector(
  '[data-language-choice]',
);

if (alternateChoice) {
  const target = new URL(alternateChoice.getAttribute('href'), window.location.origin);

  if (languageSelector.dataset.preserveQuery === 'true') {
    target.search = window.location.search;
  }

  const approvedFragments = new Set(
    (languageSelector.dataset.approvedFragments ?? '')
      .split(' ')
      .filter(Boolean),
  );
  let fragment = '';
  try {
    fragment = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    // A malformed fragment is never copied to another locale.
  }
  if (fragment && approvedFragments.has(fragment)) {
    target.hash = window.location.hash;
  }

  alternateChoice.setAttribute(
    'href',
    `${target.pathname}${target.search}${target.hash}`,
  );
}

document.addEventListener('click', (event) => {
  const choice = event.target.closest?.('[data-language-choice]');
  const language = choice?.getAttribute('data-language-choice');

  if (!language || !PUBLISHED_LANGUAGES.has(language)) return;

  try {
    preferenceStorage?.setItem(STORAGE_KEY, language);
  } catch {
    // The clicked link still navigates when storage access is blocked.
  }
});
