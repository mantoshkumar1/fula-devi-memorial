/**
 * PDF metadata detection — zero dependencies, pure Node.
 *
 * Deliberately byte-level rather than asking a tool what the PDF "contains".
 * That distinction matters: ExifTool edits a PDF by appending an incremental
 * update, so after `-all=` it reports no metadata while the original author
 * name, software string and XMP packet are still sitting in the file, fully
 * recoverable. Scanning the raw bytes is what catches that.
 *
 * The sanitizer therefore rewrites the file with qpdf; this detector is the
 * proof that the rewrite actually worked.
 */

import { readFile } from 'node:fs/promises';

export const PDF_EXTENSIONS = ['.pdf'];

/** Document Info dictionary keys that carry authorship / provenance. */
const INFO_KEYS = [
  ['/Author', 'document author'],
  ['/Title', 'document title'],
  ['/Subject', 'document subject'],
  ['/Keywords', 'document keywords'],
  ['/Creator', 'creating application'],
  ['/Producer', 'producing application'],
  ['/CreationDate', 'creation timestamp'],
  ['/ModDate', 'modification timestamp'],
];

/**
 * Inspect a PDF buffer.
 * @returns {{format: string, verifiable: boolean, findings: string[]}}
 */
export function inspectPdf(buf) {
  const findings = [];

  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return { format: 'not a PDF', verifiable: false, findings };
  }

  const raw = buf.toString('latin1');

  // An encrypted PDF hides its own contents from this scanner, so we cannot
  // honestly claim it is clean.
  if (raw.includes('/Encrypt')) {
    return {
      format: 'PDF (encrypted)',
      verifiable: false,
      findings: ['encrypted — contents cannot be verified'],
    };
  }

  for (const [key, label] of INFO_KEYS) {
    if (raw.includes(key)) findings.push(`${label} (${key})`);
  }

  if (raw.includes('xpacket') || raw.includes('xmpmeta') || raw.includes('adobe:ns:meta')) {
    findings.push('XMP metadata packet');
  }

  // The smoking gun for a PDF that was "sanitized" but not rewritten.
  if (raw.includes('%BeginExifToolUpdate')) {
    findings.push(
      'ExifTool incremental update — the original metadata is still recoverable',
    );
  }

  if (raw.includes('/EmbeddedFile')) findings.push('embedded file attachment');
  if (raw.includes('/JavaScript') || raw.includes('/JS ')) {
    findings.push('embedded JavaScript');
  }
  if (raw.includes('/Launch')) findings.push('launch action');

  return { format: 'PDF', verifiable: true, findings };
}

export async function inspectPdfFile(file) {
  const buf = await readFile(file);
  return { file, ...inspectPdf(buf) };
}
