/**
 * Image sanitizing recipe. Behaviour is unchanged from the original
 * implementation — only its location moved, so images and PDFs can share one
 * pipeline entry point.
 *
 * Metadata-only edit: pixels are never re-encoded, so image quality is
 * untouched. Orientation and the ICC colour profile are copied back so images
 * still render the right way up and with the right colours.
 */

import { run } from './tools.mjs';

export async function sanitizeImage(file) {
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
}
