#!/usr/bin/env node
/**
 * Privacy Pipeline — sanitizing.
 *
 * Strips metadata from images and PDFs in place. Local / pre-commit only; the
 * production build never runs this, so a deploy can never modify files.
 *
 * Idempotent: files already clean are skipped, so re-running changes nothing
 * and creates no Git churn. Every file is re-verified after writing — success
 * is never claimed without checking.
 *
 * Text content is deliberately not auto-edited: removing a name or a number
 * from published copy is an editorial decision, not a mechanical one. The
 * check reports it; a human fixes it.
 *
 * Usage:
 *   node scripts/privacy-sanitize.mjs             # sanitize public/
 *   node scripts/privacy-sanitize.mjs a.jpg b.pdf # sanitize specific files
 */

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { collectFiles } from './lib/files.mjs';
import { requireTool } from './lib/tools.mjs';
import { inspectFile, IMAGE_EXTENSIONS } from './lib/image-metadata.mjs';
import { inspectPdfFile, PDF_EXTENSIONS } from './lib/pdf-metadata.mjs';
import { sanitizeImage } from './lib/image-sanitize.mjs';
import { sanitizePdf } from './lib/pdf-sanitize.mjs';

const PUBLIC_ROOTS = ['public'];
const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...PDF_EXTENSIONS];

const isPdf = (file) => PDF_EXTENSIONS.includes(path.extname(file).toLowerCase());
const inspect = (file) => (isPdf(file) ? inspectPdfFile(file) : inspectFile(file));
const sanitize = (file) => (isPdf(file) ? sanitizePdf(file) : sanitizeImage(file));

const hash = async (file) =>
  createHash('sha256').update(await readFile(file)).digest('hex');

const explicit = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const files = explicit.length
  ? explicit.filter((f) => ALL_EXTENSIONS.includes(path.extname(f).toLowerCase())).sort()
  : await collectFiles(PUBLIC_ROOTS, ALL_EXTENSIONS);

if (files.length === 0) {
  console.log('Privacy sanitizer: no images or PDFs found — nothing to do.');
  process.exit(0);
}

// Only require the tools actually needed for what we are about to process.
const needsImages = files.some((f) => !isPdf(f));
const needsPdfs = files.some(isPdf);
if (needsImages || needsPdfs) await requireTool('exiftool');
if (needsPdfs) await requireTool('qpdf', '--version');

console.log(`Privacy sanitizer: checking ${files.length} file(s).`);

const changed = [];
const failed = [];
let alreadyClean = 0;

for (const file of files) {
  let before;
  try {
    before = await inspect(file);
  } catch (error) {
    failed.push({ file, reason: `could not be read: ${error.message}` });
    continue;
  }

  if (before.verifiable && before.findings.length === 0) {
    alreadyClean++;
    continue;
  }

  const hashBefore = await hash(file);

  try {
    await sanitize(file);
  } catch (error) {
    failed.push({ file, reason: `failed: ${error.message.split('\n')[0]}` });
    continue;
  }

  // Never claim removal without verifying the result.
  const after = await inspect(file);
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

  if ((await hash(file)) !== hashBefore) {
    changed.push({ file, removed: [...new Set(before.findings)] });
  } else {
    alreadyClean++;
  }
}

if (changed.length > 0) {
  console.log(`\n✓ Sanitized ${changed.length} file(s):\n`);
  for (const { file, removed } of changed) {
    console.log(`  ${file}`);
    for (const item of removed) console.log(`      removed: ${item}`);
  }
}

if (alreadyClean > 0) {
  console.log(`\n${alreadyClean} file(s) were already clean — left untouched.`);
}

if (failed.length > 0) {
  console.error(`\n✗ ${failed.length} file(s) could not be sanitized:\n`);
  for (const { file, reason } of failed) console.error(`  ${file}  ${reason}`);
  process.exit(1);
}

console.log(`\n✓ All ${files.length} file(s) verified free of private metadata.`);
