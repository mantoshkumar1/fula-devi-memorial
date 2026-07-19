#!/usr/bin/env node
/**
 * Verify that no image in the public website carries private metadata.
 *
 * Read-only: never modifies files. Zero dependencies, so it runs identically in
 * the pre-commit hook, in GitHub Actions, and in the Cloudflare production
 * build (which cannot install native tools).
 *
 * Usage:
 *   node scripts/check-image-metadata.mjs             # scan public/
 *   node scripts/check-image-metadata.mjs a.jpg b.png # scan specific files
 *
 * Exits non-zero if any image carries metadata, or if any image could not be
 * verified — unsupported formats are reported, never silently passed.
 */

import { collectImages, inspectFile, IMAGE_EXTENSIONS } from './lib/image-metadata.mjs';

const ROOTS = ['public'];

const explicit = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const files = explicit.length ? explicit.sort() : await collectImages(ROOTS);

if (files.length === 0) {
  console.log(
    `Image metadata check: no images found in ${ROOTS.join(', ')}/ — nothing to verify.`,
  );
  console.log(`Formats covered: ${IMAGE_EXTENSIONS.join(' ')}`);
  process.exit(0);
}

const dirty = [];
const unverifiable = [];
let clean = 0;

for (const file of files) {
  let result;
  try {
    result = await inspectFile(file);
  } catch (error) {
    unverifiable.push({ file, reason: `could not be read: ${error.message}` });
    continue;
  }

  if (!result.verifiable) {
    unverifiable.push({
      file,
      reason: `unrecognised or unsupported format (detected: ${result.format})`,
    });
  } else if (result.findings.length > 0) {
    dirty.push(result);
  } else {
    clean++;
  }
}

console.log(`Image metadata check: scanned ${files.length} image(s).`);

if (dirty.length > 0) {
  console.error(`\n✗ ${dirty.length} image(s) still carry metadata:\n`);
  for (const { file, format, findings } of dirty) {
    console.error(`  ${file}  [${format}]`);
    for (const finding of [...new Set(findings)]) console.error(`      - ${finding}`);
  }
}

if (unverifiable.length > 0) {
  console.error(`\n✗ ${unverifiable.length} image(s) could not be verified:\n`);
  for (const { file, reason } of unverifiable) console.error(`  ${file}  ${reason}`);
}

if (dirty.length > 0 || unverifiable.length > 0) {
  console.error(`\nRun: npm run images:sanitize`);
  console.error(
    `If a file cannot be sanitized, convert it to JPEG, PNG or WebP before committing.`,
  );
  process.exit(1);
}

console.log(`✓ All ${clean} image(s) are free of EXIF, GPS, IPTC and XMP metadata.`);
