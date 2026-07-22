import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

export const ENGLISH_INSTITUTION_NAME = 'Fula Devi Memorial Sewa Sansthan';
export const HINDI_INSTITUTION_NAME = 'फुला देवी मेमोरियल सेवा संस्थान';

const HOME_PATHS = new Set(['index.html', 'hi/index.html']);
const REQUIRED_INTERNAL_PATHS = [
  'institution/index.html',
  'governance/index.html',
  'our-work/index.html',
  'hi/institution/index.html',
  'hi/governance/index.html',
  'hi/our-work/index.html',
];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function publicPath(root, file) {
  return relative(root, file).split(sep).join('/');
}

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.match(new RegExp(`\\b${escaped}=["']([^"']*)["']`, 'i'))?.[1] ?? null;
}

function classTokens(tag) {
  return (attribute(tag, 'class') ?? '').split(/\s+/).filter(Boolean);
}

function normalizedText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function elementsWithClass(html, className) {
  const elements = [];
  const openings = html.matchAll(/<([a-z][a-z0-9:-]*)\b[^>]*>/gi);

  for (const match of openings) {
    if (!classTokens(match[0]).includes(className)) continue;
    const tag = match[1].toLowerCase();
    const start = match.index;
    const openingEnd = start + match[0].length;
    const closing = `</${tag}>`;
    const closingStart = html.toLowerCase().indexOf(closing, openingEnd);
    if (closingStart === -1) continue;
    const end = closingStart + closing.length;
    const inner = html.slice(openingEnd, closingStart);
    elements.push({
      tag,
      opening: match[0],
      inner,
      text: normalizedText(inner),
      start,
      end,
      html: html.slice(start, end),
    });
  }

  return elements;
}

function siteHeader(html) {
  for (const match of html.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/gi)) {
    const opening = match[0].match(/^<header\b[^>]*>/i)?.[0] ?? '';
    if (classTokens(opening).includes('site-header')) return match[0];
  }
  return null;
}

function validateHomepage(path, header) {
  const failures = [];
  const primary = elementsWithClass(header, 'site-name');
  const subtitle = elementsWithClass(header, 'site-name-hi');
  const selector = elementsWithClass(header, 'language-selector');

  if (primary.length !== 1) {
    failures.push(`${path}: homepage must contain one primary identity line`);
  }
  if (subtitle.length !== 1) {
    failures.push(`${path}: homepage must contain one Hindi identity subtitle`);
  }
  if (selector.length !== 1) {
    failures.push(`${path}: language selector must remain separate and present`);
  }

  const english = primary[0];
  if (english) {
    if (english.tag !== 'a' || english.text !== ENGLISH_INSTITUTION_NAME) {
      failures.push(`${path}: English homepage identity must be the first linked line`);
    }
    if (attribute(english.opening, 'href') !== '/') {
      failures.push(`${path}: English homepage identity must link to /`);
    }
  }

  const hindi = subtitle[0];
  if (hindi) {
    if (hindi.tag !== 'p' || hindi.text !== HINDI_INSTITUTION_NAME) {
      failures.push(`${path}: Hindi homepage identity must be a non-linked subtitle`);
    }
    if (attribute(hindi.opening, 'href') !== null) {
      failures.push(`${path}: Hindi homepage subtitle must not have a link target`);
    }
  }

  if (english && hindi && english.start >= hindi.start) {
    failures.push(`${path}: homepage identity order must be English then Hindi`);
  }
  if (english && hindi && selector[0] && selector[0].start <= hindi.end) {
    failures.push(`${path}: selector must follow the complete bilingual identity block`);
  }

  return failures;
}

function validateInternal(path, header) {
  const failures = [];
  const isHindi = path.startsWith('hi/');
  const expectedName = isHindi ? HINDI_INSTITUTION_NAME : ENGLISH_INSTITUTION_NAME;
  const unexpectedName = isHindi ? ENGLISH_INSTITUTION_NAME : HINDI_INSTITUTION_NAME;
  const expectedHref = isHindi ? '/hi/' : '/';
  const primary = elementsWithClass(header, 'site-name');
  const subtitle = elementsWithClass(header, 'site-name-hi');

  if (primary.length !== 1) {
    failures.push(`${path}: internal page must contain one locale identity line`);
  } else {
    if (
      primary[0].tag !== 'a' ||
      primary[0].text !== expectedName ||
      attribute(primary[0].opening, 'href') !== expectedHref
    ) {
      failures.push(`${path}: internal identity does not match its locale`);
    }
  }
  if (subtitle.length !== 0 || header.includes(unexpectedName)) {
    failures.push(`${path}: internal identity must not be bilingual`);
  }

  return failures;
}

export function readHeaderIdentityPages(root) {
  return new Map(
    filesUnder(root)
      .filter((file) => file.endsWith('.html'))
      .map((file) => [publicPath(root, file), readFileSync(file, 'utf8')]),
  );
}

export function validateHeaderIdentityPages(pages) {
  const failures = [];

  for (const required of [...HOME_PATHS, ...REQUIRED_INTERNAL_PATHS]) {
    if (!pages.has(required)) failures.push(`Missing rendered identity fixture: ${required}`);
  }

  for (const [path, html] of pages) {
    const header = siteHeader(html);
    if (!header) {
      failures.push(`${path}: missing site header`);
      continue;
    }
    failures.push(
      ...(HOME_PATHS.has(path)
        ? validateHomepage(path, header)
        : validateInternal(path, header)),
    );
  }

  return failures;
}

export function validateHeaderIdentityOutput(root) {
  return validateHeaderIdentityPages(readHeaderIdentityPages(root));
}

export function assertHeaderIdentityOutput(root) {
  const failures = validateHeaderIdentityOutput(root);
  if (failures.length) {
    throw new Error(`Header identity validation failed:\n- ${failures.join('\n- ')}`);
  }
}

function replaceElement(html, element, replacement) {
  return `${html.slice(0, element.start)}${replacement}${html.slice(element.end)}`;
}

function mutatePage(pages, path, mutate) {
  const copy = new Map(pages);
  const html = copy.get(path);
  if (!html) throw new Error(`Missing mutation fixture: ${path}`);
  copy.set(path, mutate(html));
  return copy;
}

function identityElement(html, className) {
  const header = siteHeader(html);
  const element = header ? elementsWithClass(header, className)[0] : undefined;
  if (!header || !element) throw new Error(`Missing ${className} mutation target`);
  const offset = html.indexOf(header);
  return { ...element, start: offset + element.start, end: offset + element.end };
}

function removeIdentity(className) {
  return (html) => {
    const element = identityElement(html, className);
    return replaceElement(html, element, '');
  };
}

function addSubtitle(html, text, language) {
  const primary = identityElement(html, 'site-name');
  return replaceElement(
    html,
    primary,
    `${primary.html}<p class="site-name-hi" lang="${language}">${text}</p>`,
  );
}

export function runHeaderIdentityMutationTests(root) {
  const pages = readHeaderIdentityPages(root);
  const baseFailures = validateHeaderIdentityPages(pages);
  if (baseFailures.length) {
    throw new Error(`Cannot run mutation tests against invalid output:\n- ${baseFailures.join('\n- ')}`);
  }

  const cases = [
    ['Hindi home loses English', mutatePage(pages, 'hi/index.html', removeIdentity('site-name'))],
    ['English home loses English', mutatePage(pages, 'index.html', removeIdentity('site-name'))],
    ['English home loses Hindi', mutatePage(pages, 'index.html', removeIdentity('site-name-hi'))],
    ['Internal page becomes bilingual', mutatePage(pages, 'hi/institution/index.html', (html) => addSubtitle(html, ENGLISH_INSTITUTION_NAME, 'en'))],
    ['Hindi internal uses English identity', mutatePage(pages, 'hi/governance/index.html', (html) => {
      const element = identityElement(html, 'site-name');
      const replacement = element.html.replace(HINDI_INSTITUTION_NAME, ENGLISH_INSTITUTION_NAME);
      return replaceElement(html, element, replacement);
    })],
    ['English internal gains Hindi subtitle', mutatePage(pages, 'our-work/index.html', (html) => addSubtitle(html, HINDI_INSTITUTION_NAME, 'hi'))],
    ['Hindi home subtitle becomes a link', mutatePage(pages, 'hi/index.html', (html) => {
      const element = identityElement(html, 'site-name-hi');
      const replacement = element.html
        .replace(/^<p\b/i, '<a href="/hi/"')
        .replace(/<\/p>$/i, '</a>');
      return replaceElement(html, element, replacement);
    })],
    ['Hindi home order is reversed', mutatePage(pages, 'hi/index.html', (html) => {
      const primary = identityElement(html, 'site-name');
      const subtitle = identityElement(html, 'site-name-hi');
      const between = html.slice(primary.end, subtitle.start);
      return `${html.slice(0, primary.start)}${subtitle.html}${between}${primary.html}${html.slice(subtitle.end)}`;
    })],
    ['Selector interrupts Hindi home identity', mutatePage(pages, 'hi/index.html', (html) => {
      const selector = identityElement(html, 'language-selector');
      const withoutSelector = replaceElement(html, selector, '');
      const primary = identityElement(withoutSelector, 'site-name');
      return `${withoutSelector.slice(0, primary.end)}${selector.html}${withoutSelector.slice(primary.end)}`;
    })],
  ];

  for (const [name, mutatedPages] of cases) {
    if (validateHeaderIdentityPages(mutatedPages).length === 0) {
      throw new Error(`Header identity mutation was not rejected: ${name}`);
    }
  }

  return cases.map(([name]) => name);
}
