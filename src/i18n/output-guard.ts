import { readdirSync, readFileSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLISHED_LOCALES, localeIsPublished } from './types.ts';

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function publicPath(root: string, file: string): string {
  return relative(root, file).split(sep).join('/');
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

  const redirects = files.find((file) => publicPath(root, file) === '_redirects');
  if (redirects) {
    const rules = readFileSync(redirects, 'utf8');
    if (/^\/\s+\/hi\/?(?:\s|$)/m.test(rules)) {
      failures.push('Bare-root Hindi redirect is active');
    }
  }

  return failures;
}

function validateBilingualOutput(root: string, files: string[]): string[] {
  const failures: string[] = [];
  const paths = new Set(files.map((file) => publicPath(root, file)));
  const englishPages = [...paths].filter(
    (path) =>
      path.endsWith('.html') && path !== '404.html' && !path.startsWith('hi/'),
  );

  for (const englishPage of englishPages) {
    const hindiPage = `hi/${englishPage}`;
    if (!paths.has(hindiPage)) {
      failures.push(`Missing Hindi route parity for ${englishPage}`);
    }

    const html = readFileSync(resolve(root, englishPage), 'utf8');
    if (!html.includes('data-language-selector')) {
      failures.push(`Missing selector on ${englishPage}`);
    }
    if (!html.includes('language-preference')) {
      failures.push(`Missing preference script on ${englishPage}`);
    }
    if (!/hreflang=["']hi["']/.test(html)) {
      failures.push(`Missing Hindi alternate on ${englishPage}`);
    }
  }

  return failures;
}

export function validatePublicationOutput(directory: URL): void {
  const root = fileURLToPath(directory);
  const files = filesUnder(root);
  const bilingual = localeIsPublished('hi', PUBLISHED_LOCALES);
  const failures = bilingual
    ? validateBilingualOutput(root, files)
    : validateEnglishOnlyOutput(root, files);

  if (failures.length) {
    throw new Error(
      `Publication output validation failed:\n- ${failures.join('\n- ')}`,
    );
  }
}

export function publicationOutputGuard() {
  return {
    name: 'publication-output-guard',
    hooks: {
      'astro:build:done': ({ dir }: { dir: URL }) => {
        validatePublicationOutput(dir);
      },
    },
  };
}
