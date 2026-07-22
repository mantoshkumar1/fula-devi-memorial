#!/usr/bin/env node
/**
 * Public Records validation — zero dependencies, pure Node.
 *
 * Checks that the single work-records data source and the files it references
 * agree: every published record points at a real file, follows the stable
 * naming rules, generates a real route, and — for a draft guide — is honestly
 * marked and kept out of search indexes.
 *
 * Like the Privacy Pipeline it is deliberately byte-level: it reads the data
 * source as text rather than importing it, so it runs identically in the
 * pre-commit hook, in GitHub Actions and in the Cloudflare build with no
 * install step and no TypeScript toolchain.
 *
 * WHAT IT CANNOT DO: it cannot see a face. Whether a photograph or document is
 * safe to publish is a human editorial judgement (see the Privacy Pipeline and
 * docs/ADDING_PUBLIC_RECORDS.md). This script only guards structure.
 *
 * Exits non-zero if anything is wrong.
 */

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const DATA = 'src/data/work-records.ts';
const PUBLIC = 'public';
const HEADERS = 'public/_headers';

/** Page generators, one per record area (discriminator `type`). */
const GENERATORS = {
  clothing: 'src/pages/records/clothing/[year].astro',
  education: 'src/pages/records/education/[slug].astro',
};

/** Locale-neutral record views used by both English and Hindi generators. */
const RECORD_VIEWS = {
  clothing: 'src/views/ClothingRecordView.astro',
  education: 'src/views/EducationRecordView.astro',
};

const errors = [];
let assetsChecked = 0;
let routesChecked = 0;

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

const text = await readFile(DATA, 'utf8');
const headers = (await exists(HEADERS)) ? await readFile(HEADERS, 'utf8') : '';

// Every /records/... string literal in the data source: assets and routes.
const refs = [...text.matchAll(/['"](\/records\/[^'"]+)['"]/g)].map((m) => m[1]);
const unique = [...new Set(refs)];
const assets = unique.filter((r) => /\.(jpg|jpeg|png|pdf)$/i.test(r));
const routes = unique.filter((r) => r.endsWith('/'));

// --- assets: existence and stable naming ---
for (const ref of assets) {
  assetsChecked += 1;
  const base = ref.split('/').pop();
  const seg = ref.split('/'); // ['', 'records', '<area>', '<slug>', '<file>']
  const area = seg[2];

  if (!(await exists(path.join(PUBLIC, ref)))) {
    errors.push(`Referenced file does not exist: ${ref}`);
  }
  if (/\s/.test(ref)) {
    errors.push(`Path contains a space: ${ref}`);
  }
  // Safe published names are lowercase words, digits and hyphens only. This
  // rejects spaces, capitals and raw camera/WhatsApp exports — the usual way a
  // personal name reaches a filename. It is a guard, not proof of safety.
  if (!/^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|pdf)$/.test(base)) {
    errors.push(`Unsafe filename (possible personal name or export name): ${ref}`);
  }

  if (area === 'clothing') {
    const year = seg[3];
    if (!/^\d{4}$/.test(year)) {
      errors.push(`Clothing year directory is not four digits: ${ref}`);
    }
    const ok =
      base === 'cover.jpg' ||
      /^distribution-\d{2}\.jpg$/.test(base) ||
      /^newspaper-\d{2}\.jpg$/.test(base);
    if (!ok) {
      errors.push(
        `Clothing file must be distribution-NN.jpg, newspaper-NN.jpg or cover.jpg: ${ref}`,
      );
    }
  }

  if (area === 'education' && ref.endsWith('.jpg')) {
    if (!/^report-card-\d{4}-\d{4}-page-\d\.jpg$/.test(base)) {
      errors.push(
        `Education record file must be report-card-<year>-<year>-page-N.jpg: ${ref}`,
      );
    }
  }
}

// --- routes: clean shape, real directory, real generator ---
for (const route of routes) {
  routesChecked += 1;
  if (!/^\/records\/[a-z-]+\/[a-z0-9-]+\/$/.test(route)) {
    errors.push(`Route is not a clean /records/<area>/<slug>/ path: ${route}`);
    continue;
  }
  const area = route.split('/')[2];
  const generator = GENERATORS[area];
  if (!generator) {
    errors.push(`No known page generator for record area "${area}": ${route}`);
    continue;
  }
  if (!(await exists(generator))) {
    errors.push(`Route ${route} has no generator page at ${generator}`);
  }
  // The record's files must exist under public/. Clothing keeps a per-year
  // directory; an education record's pages carry the year in the filename and
  // live directly under the area directory.
  const dir =
    area === 'education'
      ? path.join(PUBLIC, 'records', area)
      : path.join(PUBLIC, route);
  if (!(await exists(dir))) {
    errors.push(`Route ${route} has no directory at ${dir}`);
  }
}

// --- resource guides: explicit state, and draft-only indexing rules ---
// A draft guide must be kept out of search indexes; a final guide must NOT
// carry that draft-only restriction. The header for a path is noindex only if
// its block actually contains an X-Robots-Tag: noindex line.
const headerNoindex = (pdf) => {
  const hi = headers.indexOf(pdf);
  return hi >= 0 && /X-Robots-Tag:\s*noindex/i.test(headers.slice(hi, hi + 200));
};
const pdfs = assets.filter((a) => a.endsWith('.pdf'));
for (const pdf of pdfs) {
  // The guide's object literal is small; look at the text around its href.
  const at = text.indexOf(`'${pdf}'`);
  const window = at >= 0 ? text.slice(Math.max(0, at - 600), at + 400) : '';
  const state = window.match(/state:\s*'(draft|final)'/);
  if (!state) {
    errors.push(`Resource guide ${pdf} has no explicit state: 'draft' | 'final'`);
    continue;
  }
  if (state[1] === 'draft' && !headerNoindex(pdf)) {
    errors.push(`Draft guide ${pdf} lacks "X-Robots-Tag: noindex" in ${HEADERS}`);
  }
  if (state[1] === 'final' && headerNoindex(pdf)) {
    errors.push(
      `Final guide ${pdf} still carries a draft-only "X-Robots-Tag: noindex" in ${HEADERS} — remove it`,
    );
  }
}

// --- media kinds used by the record pages must be valid ---
const KINDS = ['programme-photo', 'independent-coverage', 'academic-record-page'];
const PAGE_TEMPLATES = [RECORD_VIEWS.clothing, RECORD_VIEWS.education];
for (const template of PAGE_TEMPLATES) {
  if (!(await exists(template))) continue;
  const src = await readFile(template, 'utf8');
  for (const m of src.matchAll(/data-mv-kind=["']([^"']+)["']/g)) {
    if (!KINDS.includes(m[1])) {
      errors.push(`Invalid media kind "${m[1]}" in ${template}`);
    }
  }
}

// --- counts are derived, never hardcoded ---
// A stale hardcoded "N photographs" summary would drift from the real file
// count; the summary must be computed from the data.
if (/recordSummary\s*:/.test(text)) {
  errors.push(
    `${DATA} hardcodes a recordSummary — the Our Work count must be derived from the media, not stored`,
  );
}

// The clothing record page must show independent coverage immediately after the
// lead photograph: the lead is index 0, coverage is index 1, and the remaining
// gallery photographs start at 2 (or at 1 when a record has no coverage).
const clothingTemplate = await readFile(RECORD_VIEWS.clothing, 'utf8');
if (!/coverageIndex\s*=\s*1\b/.test(clothingTemplate)) {
  errors.push(
    `${RECORD_VIEWS.clothing} must place independent coverage at index 1, immediately after the lead photograph (coverageIndex = 1)`,
  );
}
if (!/galleryStart\s*=\s*record\.page\.coverage\s*\?\s*2\s*:\s*1/.test(clothingTemplate)) {
  errors.push(
    `${RECORD_VIEWS.clothing} must start the remaining photographs after the coverage (galleryStart = record.page.coverage ? 2 : 1)`,
  );
}

// --- report ---
console.log(
  `Public Records: checked ${assetsChecked} asset(s) and ${routesChecked} route(s) ` +
    `declared in ${DATA}.`,
);

if (errors.length) {
  console.error('');
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('\n✗ Public Records: FAILED');
  process.exit(1);
}

console.log(
  'Note: structure only. A face cannot be validated by a script — every record ' +
    'still needs human privacy review before publication.',
);
console.log('\n✓ Public Records: all checks passed.');
