/**
 * PDF metadata detection — zero dependencies, pure Node.
 *
 * Deliberately byte-level rather than asking a tool what the PDF "contains".
 * That distinction matters: ExifTool edits a PDF by appending an incremental
 * update, so after `-all=` it reports no metadata while the original author
 * name, software string and XMP packet are still sitting in the file, fully
 * recoverable. Scanning the raw bytes is what catches that.
 *
 * Raw bytes are not enough on their own: a PDF 1.5+ writer (WeasyPrint, for
 * one) stores its Info dictionary inside a compressed object stream (/ObjStm),
 * so `/Producer` and `/Title` never appear literally in the file yet are fully
 * recoverable once the stream is inflated. This scanner therefore inflates the
 * FlateDecode streams with Node's built-in zlib and scans those too — otherwise
 * the pipeline would fail open on exactly the metadata it exists to catch.
 *
 * The sanitizer rewrites the file with qpdf; this detector is the proof that
 * the rewrite actually worked, in the raw bytes and in the compressed streams.
 */

import { readFile } from 'node:fs/promises';
import zlib from 'node:zlib';

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

/** Scan one block of text for Info-dictionary keys and XMP markers. */
function scanMetadata(text) {
  const found = [];
  for (const [key, label] of INFO_KEYS) {
    if (text.includes(key)) found.push({ key, label });
  }
  if (
    text.includes('xpacket') ||
    text.includes('xmpmeta') ||
    text.includes('adobe:ns:meta')
  ) {
    found.push({ key: 'XMP', label: 'XMP metadata packet' });
  }
  return found;
}

/**
 * Inflate every FlateDecode stream and return the concatenated result, so
 * metadata hidden inside compressed object streams becomes visible. Streams
 * that are not raw zlib (images, other filters, truncated matches) simply fail
 * to inflate and are skipped — this is a detector, not a parser.
 */
function inflateStreams(raw) {
  let out = '';
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    const data = Buffer.from(match[1], 'latin1');
    for (const inflate of [zlib.inflateSync, zlib.inflateRawSync]) {
      try {
        out += inflate(data).toString('latin1') + '\n';
        break;
      } catch {
        // not this flavour of flate — try the next, or skip
      }
    }
  }
  return out;
}

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

  // Metadata in the raw bytes, then the same in inflated (compressed) streams.
  for (const { label, key } of scanMetadata(raw)) findings.push(`${label} (${key})`);
  for (const { label, key } of scanMetadata(inflateStreams(raw))) {
    findings.push(`${label} (${key}) — in a compressed stream`);
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
