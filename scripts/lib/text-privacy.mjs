/**
 * Public text content scanning — zero dependencies.
 *
 * Catches personal identifiers accidentally pasted into published copy or into
 * a public record: Indian government IDs, bank details, phone numbers, email
 * addresses and raw GPS coordinates. These are the things that, once deployed,
 * are crawled and archived permanently.
 *
 * This is a safety net, not a censor. Anything genuinely meant to be public —
 * the institution's own contact email, for instance — goes in
 * scripts/privacy-allowlist.json after a human privacy review.
 */

import { readFile } from 'node:fs/promises';

/**
 * Where published words live: the site's own copy, and the public records
 * served verbatim from `public/records/` — guides and similar text artefacts
 * are published the moment they are committed, so they are scanned like copy.
 */
export const TEXT_ROOTS = [
  'src/content',
  'src/data',
  'src/pages',
  'public/records',
];

/**
 * Text formats only. Never add a binary format here — these files are read as
 * UTF-8. Images and PDFs have their own scanners.
 */
export const TEXT_EXTENSIONS = [
  '.md',
  '.mdx',
  '.ts',
  '.astro',
  '.html',
  '.txt',
  '.json',
  '.csv',
  '.yml',
  '.yaml',
];

const PATTERNS = [
  {
    label: 'Aadhaar-like 12-digit number',
    // 4-4-4 grouping, not part of a longer run of digits.
    re: /(?<![\d-])\d{4}[ -]?\d{4}[ -]?\d{4}(?![\d-])/g,
  },
  {
    label: 'PAN number',
    re: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  },
  {
    label: 'IFSC bank code',
    re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
  },
  {
    label: 'email address',
    re: /\b[\w.+-]+@[\w-]+\.[\w.-]*[a-zA-Z]\b/g,
  },
  {
    label: 'Indian phone number',
    re: /(?:\+91[ -]?)?(?<!\d)[6-9]\d{9}(?!\d)/g,
  },
  {
    label: 'GPS coordinate pair',
    re: /-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g,
  },
];

/** Load approved-public strings. Missing file simply means "nothing allowed". */
export async function loadAllowlist(path = 'scripts/privacy-allowlist.json') {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return new Set(parsed.allow ?? []);
  } catch {
    return new Set();
  }
}

/**
 * Scan text content.
 * @returns {{line: number, label: string, match: string}[]}
 */
export function scanText(content, allowlist = new Set()) {
  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // An explicit escape hatch for reviewed, intentional content.
    if (line.includes('privacy-allow')) return;

    for (const { label, re } of PATTERNS) {
      re.lastIndex = 0;
      for (const match of line.matchAll(re)) {
        const value = match[0].trim();
        if (allowlist.has(value)) continue;
        findings.push({ line: index + 1, label, match: value });
      }
    }
  });

  return findings;
}

export async function scanTextFile(file, allowlist) {
  const content = await readFile(file, 'utf8');
  return { file, findings: scanText(content, allowlist) };
}
