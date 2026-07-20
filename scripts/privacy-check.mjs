#!/usr/bin/env node
/**
 * Privacy Pipeline — verification.
 *
 * Read-only: never modifies files. Zero dependencies, so the identical check
 * runs in the pre-commit hook, in GitHub Actions and in the Cloudflare
 * production build (which cannot install native tools).
 *
 * Covers:
 *   images  public/**   EXIF, GPS, IPTC, XMP, comments, thumbnails
 *   PDFs    public/**   Info dictionary, XMP, recoverable incremental updates
 *   text    src/**      personal identifiers in published copy
 *
 * Exits non-zero if anything is found, or if any file could not be verified —
 * unsupported formats are reported, never silently passed.
 */

import { collectFiles } from './lib/files.mjs';
import { inspectFile, IMAGE_EXTENSIONS } from './lib/image-metadata.mjs';
import { inspectPdfFile, PDF_EXTENSIONS } from './lib/pdf-metadata.mjs';
import {
  scanTextFile,
  loadAllowlist,
  TEXT_ROOTS,
  TEXT_EXTENSIONS,
} from './lib/text-privacy.mjs';

const PUBLIC_ROOTS = ['public'];
let failed = false;

/** Shared reporting for the two binary scanners. */
async function checkBinaries({ title, roots, extensions, inspect, hint }) {
  const files = await collectFiles(roots, extensions);
  if (files.length === 0) {
    console.log(`${title}: no files found — nothing to verify.`);
    return;
  }

  const dirty = [];
  const unverifiable = [];

  for (const file of files) {
    try {
      const result = await inspect(file);
      if (!result.verifiable) {
        unverifiable.push({ file, reason: `unverifiable (${result.format})` });
      } else if (result.findings.length > 0) {
        dirty.push(result);
      }
    } catch (error) {
      unverifiable.push({ file, reason: `could not be read: ${error.message}` });
    }
  }

  console.log(
    `${title}: scanned ${files.length} file(s) — ` +
      `${files.length - dirty.length - unverifiable.length} clean, ` +
      `${dirty.length} with metadata, ${unverifiable.length} unverifiable.`,
  );

  for (const { file, format, findings } of dirty) {
    console.error(`\n  ✗ ${file}  [${format}]`);
    for (const finding of [...new Set(findings)]) console.error(`      - ${finding}`);
  }
  for (const { file, reason } of unverifiable) {
    console.error(`\n  ✗ ${file}  ${reason}`);
  }

  if (dirty.length || unverifiable.length) {
    console.error(`\n  → ${hint}`);
    failed = true;
  }
}

await checkBinaries({
  title: 'Images',
  roots: PUBLIC_ROOTS,
  extensions: IMAGE_EXTENSIONS,
  inspect: inspectFile,
  hint: 'Run: npm run privacy:sanitize (or convert to JPEG, PNG or WebP)',
});

await checkBinaries({
  title: 'PDFs  ',
  roots: PUBLIC_ROOTS,
  extensions: PDF_EXTENSIONS,
  inspect: inspectPdfFile,
  hint: 'Run: npm run privacy:sanitize (encrypted PDFs must be decrypted first)',
});

// --- text ---
const allowlist = await loadAllowlist();
const textFiles = await collectFiles(TEXT_ROOTS, TEXT_EXTENSIONS);
const textHits = [];
for (const file of textFiles) {
  const { findings } = await scanTextFile(file, allowlist);
  if (findings.length) textHits.push({ file, findings });
}

console.log(
  `Text  : scanned ${textFiles.length} file(s) — ` +
    `${textFiles.length - textHits.length} clean, ${textHits.length} with possible personal data.`,
);

for (const { file, findings } of textHits) {
  console.error(`\n  ✗ ${file}`);
  for (const { line, label, match } of findings) {
    console.error(`      line ${line}: ${label} — "${match}"`);
  }
}
if (textHits.length) {
  console.error(
    `\n  → Remove it, or if it is genuinely meant to be public, add it to` +
      ` scripts/privacy-allowlist.json after a privacy review.`,
  );
  failed = true;
}

if (failed) {
  console.error('\n✗ Privacy Pipeline: FAILED');
  process.exit(1);
}
console.log('\n✓ Privacy Pipeline: all checks passed.');
