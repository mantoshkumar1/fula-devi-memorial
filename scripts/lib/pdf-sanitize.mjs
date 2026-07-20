/**
 * PDF sanitizing recipe: strip, then physically rewrite.
 *
 * Two steps, and the second is not optional. ExifTool removes PDF metadata by
 * appending an incremental update: it will then report the file as clean while
 * the original author name and XMP packet remain in the bytes, recoverable by
 * anyone. qpdf rewrites the file structure and drops those orphaned objects.
 *
 * qpdf rewrites structure only — page content is preserved, not re-rendered.
 */

import { rename, unlink } from 'node:fs/promises';
import { run } from './tools.mjs';

export async function sanitizePdf(file) {
  // 1. Remove the Info dictionary and XMP metadata.
  await run('exiftool', ['-all=', '-overwrite_original', '--', file]);

  // 2. Rewrite so the superseded objects are physically gone.
  const temp = `${file}.privacy-tmp`;
  try {
    await run('qpdf', ['--linearize', '--object-streams=preserve', file, temp]);
    await rename(temp, file);
  } catch (error) {
    await unlink(temp).catch(() => {});
    throw error;
  }
}
