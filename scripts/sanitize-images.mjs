#!/usr/bin/env node
/**
 * Strip private metadata from website images, in place.
 *
 * Uses ExifTool — the mature, well-tested tool for this — so it runs locally
 * and in the pre-commit hook, never in the Cloudflare build (which cannot
 * install native tools and must never modify files).
 *
 * Behaviour:
 * - Removes all EXIF, GPS, IPTC, XMP, comments and embedded thumbnails.
 * - Keeps Orientation and the ICC colour profile, so images still render
 *   correctly and with the right colours. This is a metadata-only edit: pixels
 *   are never re-encoded, so image quality is untouched.
 * - Idempotent: files already clean are skipped entirely, so re-running makes
 *   no changes and creates no Git churn.
 * - Verifies every file after writing; never reports success without checking.
 *
 * Usage:
 *   node scripts/sanitize-images.mjs             # sanitize public/
 *   node scripts/sanitize-images.mjs a.jpg b.png # sanitize specific files
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { collectImages, inspectFile } from './lib/image-metadata.mjs';

const run = promisify(execFile);
const ROOTS = ['public'];

async function requireExiftool() {
  try {
    const { stdout } = await run('exiftool', ['-ver']);
    return stdout.trim();
  } catch {
    console.error('✗ ExifTool is not installed, so images cannot be sanitized.\n');
    console.error('  macOS:          brew install exiftool');
    console.error('  Debian/Ubuntu:  sudo apt-get install -y libimage-exiftool-perl');
    console.error('  Other:          https://exiftool.org\n');
    console.error('Verification (npm run images:check) needs no tools and still works.');
    process.exit(1);
  }
}

const hash = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

const version = await requireExiftool();

const explicit = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const files = explicit.length ? explicit.sort() : await collectImages(ROOTS);

if (files.length === 0) {
  console.log(`Image sanitizer: no images found in ${ROOTS.join(', ')}/ — nothing to do.`);
  process.exit(0);
}

console.log(`Image sanitizer (ExifTool ${version}): checking ${files.length} image(s).`);

const changed = [];
const failed = [];
let alreadyClean = 0;

for (const file of files) {
  const before = await inspectFile(file);

  if (before.verifiable && before.findings.length === 0) {
    alreadyClean++;
    continue;
  }

  const hashBefore = await hash(file);

  try {
    // Strip everything, then copy back only the tags needed to render the
    // image correctly. Metadata-only edit — pixels are not re-encoded.
    // -P preserves the file modification time, avoiding needless churn.
    await run('exiftool', [
      '-all=',
      // TIFF keeps IFD0 identity tags through `-all=` because ExifTool treats
      // IFD0 as image structure, so delete these explicitly. Harmless for the
      // other formats, where `-all=` has already removed them.
      '-Make=',
      '-Model=',
      '-Software=',
      '-Artist=',
      '-Copyright=',
      '-ImageDescription=',
      '-HostComputer=',
      '-DocumentName=',
      '-PageName=',
      '-DateTime=',
      '-UserComment=',
      '-tagsfromfile',
      '@',
      '-icc_profile',
      '-Orientation',
      '-overwrite_original',
      '-P',
      '--',
      file,
    ]);
  } catch (error) {
    failed.push({ file, reason: `ExifTool failed: ${error.message.split('\n')[0]}` });
    continue;
  }

  // Never claim removal without verifying the result.
  const after = await inspectFile(file);
  if (!after.verifiable) {
    failed.push({ file, reason: `still unverifiable after sanitizing (${after.format})` });
    continue;
  }
  if (after.findings.length > 0) {
    failed.push({
      file,
      reason: `metadata remains: ${[...new Set(after.findings)].join(', ')}`,
    });
    continue;
  }

  const hashAfter = await hash(file);
  if (hashAfter !== hashBefore) {
    changed.push({ file, removed: [...new Set(before.findings)] });
  } else {
    alreadyClean++;
  }
}

if (changed.length > 0) {
  console.log(`\n✓ Sanitized ${changed.length} image(s):\n`);
  for (const { file, removed } of changed) {
    console.log(`  ${file}`);
    for (const item of removed) console.log(`      removed: ${item}`);
  }
}

if (alreadyClean > 0) {
  console.log(`\n${alreadyClean} image(s) were already clean — left untouched.`);
}

if (failed.length > 0) {
  console.error(`\n✗ ${failed.length} image(s) could not be sanitized:\n`);
  for (const { file, reason } of failed) console.error(`  ${file}  ${reason}`);
  console.error(`\nConvert these to JPEG, PNG or WebP before committing.`);
  process.exit(1);
}

console.log(`\n✓ All ${files.length} image(s) verified free of private metadata.`);
