/**
 * Image metadata detection — zero dependencies, pure Node.
 *
 * Deliberately dependency-free so the same detector runs everywhere: the
 * pre-commit hook, GitHub Actions, and the Cloudflare production build (which
 * cannot install native tools).
 *
 * What counts as a violation: anything that can carry private information —
 * EXIF (camera/device, timestamps, author, software), GPS, IPTC, XMP,
 * comments, and embedded thumbnails.
 *
 * What is deliberately allowed:
 * - Orientation and resolution tags — needed to render the image correctly
 *   without re-encoding it (re-encoding would degrade quality).
 * - ICC colour profiles (JPEG APP2, PNG iCCP, WebP ICCP) — colour management,
 *   not personal data. Stripping them changes how the image looks.
 */

import { readFile } from 'node:fs/promises';
import { collectFiles } from './files.mjs';

export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.tif',
  '.tiff',
];

/**
 * Tags kept on purpose: structural tags an image cannot be decoded without,
 * plus orientation, resolution and the ICC profile. Everything not listed here
 * is treated as a violation, so unknown tags fail closed.
 *
 * Note this must include the baseline TIFF structure tags — a TIFF literally
 * cannot exist without them, so flagging them would make TIFF unpassable.
 */
const ALLOWED_TIFF_TAGS = new Set([
  0x00fe, // NewSubfileType
  0x00ff, // SubfileType
  0x0100, // ImageWidth
  0x0101, // ImageLength
  0x0102, // BitsPerSample
  0x0103, // Compression
  0x0106, // PhotometricInterpretation
  0x0107, // Thresholding
  0x0111, // StripOffsets
  0x0112, // Orientation  (kept so images render the right way up)
  0x0115, // SamplesPerPixel
  0x0116, // RowsPerStrip
  0x0117, // StripByteCounts
  0x011a, // XResolution
  0x011b, // YResolution
  0x011c, // PlanarConfiguration
  0x0128, // ResolutionUnit
  0x013d, // Predictor
  0x0140, // ColorMap
  0x0142, // TileWidth
  0x0143, // TileLength
  0x0144, // TileOffsets
  0x0145, // TileByteCounts
  0x0152, // ExtraSamples
  0x0153, // SampleFormat
  0x015b, // JPEGTables
  0x0201, // JPEGInterchangeFormat (image data in JPEG-compressed TIFF)
  0x0202, // JPEGInterchangeFormatLength
  0x0211, // YCbCrCoefficients
  0x0212, // YCbCrSubSampling
  0x0213, // YCbCrPositioning
  0x0214, // ReferenceBlackWhite
  0x8773, // ICC profile (colour management, not personal data)
]);

const TAG_NAMES = {
  0x010e: 'ImageDescription',
  0x010f: 'Make',
  0x0110: 'Model',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x9003: 'DateTimeOriginal',
  0x9004: 'DateTimeDigitized',
  0x927c: 'MakerNote',
  0x9286: 'UserComment',
  0xa430: 'CameraOwnerName',
  0xa433: 'LensMake',
  0xa434: 'LensModel',
  0xa435: 'LensSerialNumber',
  0xc62f: 'CameraSerialNumber',
};

const u16 = (b, o, le) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
const u32 = (b, o, le) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));

/** Walk one IFD, recording disallowed tags and sub-IFD pointers. */
function scanIfd(tiff, off, le, findings, label, isPrimary) {
  if (off < 0 || off + 2 > tiff.length) return 0;
  const count = u16(tiff, off, le);
  for (let i = 0; i < count; i++) {
    const e = off + 2 + i * 12;
    if (e + 12 > tiff.length) break;
    const tag = u16(tiff, e, le);

    if (tag === 0x8769) {
      findings.push('EXIF sub-IFD (camera/device details, timestamps)');
      continue;
    }
    if (tag === 0x8825) {
      findings.push('GPS location data');
      continue;
    }
    if (tag === 0xa005) {
      findings.push('Interoperability IFD');
      continue;
    }
    if (isPrimary && ALLOWED_TIFF_TAGS.has(tag)) continue;

    findings.push(
      `${label}: ${TAG_NAMES[tag] ?? `tag 0x${tag.toString(16).padStart(4, '0')}`}`,
    );
  }
  const next = off + 2 + count * 12;
  return next + 4 <= tiff.length ? u32(tiff, next, le) : 0;
}

/** Parse a TIFF header (standalone .tif or the payload of a JPEG APP1/Exif). */
function scanTiff(tiff, findings) {
  if (tiff.length < 8) {
    findings.push('malformed EXIF/TIFF block');
    return;
  }
  const order = tiff.readUInt16BE(0);
  const le = order === 0x4949;
  if (!le && order !== 0x4d4d) {
    findings.push('unrecognised EXIF byte order');
    return;
  }
  if (u16(tiff, 2, le) !== 42) {
    findings.push('unrecognised EXIF header');
    return;
  }

  let ifdOff = u32(tiff, 4, le);
  const seen = new Set();
  let index = 0;
  while (ifdOff && ifdOff + 2 <= tiff.length && !seen.has(ifdOff)) {
    seen.add(ifdOff);
    if (index === 1) findings.push('embedded thumbnail (IFD1)');
    ifdOff = scanIfd(
      tiff,
      ifdOff,
      le,
      findings,
      index === 0 ? 'EXIF' : `IFD${index}`,
      index === 0,
    );
    index++;
  }
}

function scanJpeg(buf, findings) {
  let off = 2;
  while (off + 4 <= buf.length) {
    if (buf[off] !== 0xff) break;
    const marker = buf[off + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      off += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break; // start of scan / end of image
    const segLen = buf.readUInt16BE(off + 2);
    if (segLen < 2) break;
    const end = off + 2 + segLen;
    if (end > buf.length) break;
    const data = buf.subarray(off + 4, end);

    if (marker === 0xe1) {
      if (data.subarray(0, 6).toString('latin1') === 'Exif\0\0') {
        scanTiff(data.subarray(6), findings);
      } else if (
        data.toString('latin1', 0, 29).startsWith('http://ns.adobe.com/xap/1.0/')
      ) {
        findings.push('XMP metadata');
      } else {
        findings.push('APP1 metadata segment');
      }
    } else if (marker === 0xed) {
      findings.push('IPTC / Photoshop metadata (APP13)');
    } else if (marker === 0xfe) {
      findings.push('JPEG comment (COM)');
    } else if (marker >= 0xe3 && marker <= 0xef) {
      findings.push(`APP${marker - 0xe0} metadata segment`);
    }
    // APP0 (JFIF) and APP2 (ICC_PROFILE) are intentionally allowed.
    off = end;
  }
}

const PNG_METADATA_CHUNKS = {
  tEXt: 'text metadata',
  zTXt: 'compressed text metadata',
  iTXt: 'XMP / international text metadata',
  tIME: 'modification timestamp',
};

/** An embedded EXIF block is inspected on its merits, not flagged outright —
 *  a block holding only Orientation is exactly what sanitizing leaves behind. */
function scanEmbeddedExif(data, findings) {
  const payload =
    data.subarray(0, 6).toString('latin1') === 'Exif\0\0' ? data.subarray(6) : data;
  scanTiff(payload, findings);
}

function scanPng(buf, findings) {
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    if (PNG_METADATA_CHUNKS[type]) {
      findings.push(`${type}: ${PNG_METADATA_CHUNKS[type]}`);
    } else if (type === 'eXIf') {
      scanEmbeddedExif(buf.subarray(off + 8, off + 8 + len), findings);
    }
    if (type === 'IEND') break;
    const next = off + 12 + len;
    if (next <= off || next > buf.length) break;
    off = next;
  }
}

function scanWebp(buf, findings) {
  let off = 12; // "RIFF" + size + "WEBP"
  while (off + 8 <= buf.length) {
    const fourcc = buf.toString('latin1', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (fourcc === 'EXIF') {
      scanEmbeddedExif(buf.subarray(off + 8, off + 8 + size), findings);
    } else if (fourcc === 'XMP ') {
      findings.push('XMP metadata chunk');
    }
    const next = off + 8 + size + (size % 2);
    if (next <= off) break;
    off = next;
  }
}

/** Generic ISO base media file format box walker (HEIC/HEIF). */
function* boxes(buf, start, end) {
  let off = start;
  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    let header = 8;
    if (size === 1) {
      if (off + 16 > end) return;
      size = Number(buf.readBigUInt64BE(off + 8));
      header = 16;
    } else if (size === 0) {
      size = end - off;
    }
    if (size < header || off + size > end) return;
    yield { type, start: off + header, end: off + size };
    off += size;
  }
}

/** Returns true if the file structure was understood well enough to verify. */
function scanHeif(buf, findings) {
  let meta = null;
  for (const box of boxes(buf, 0, buf.length)) {
    if (box.type === 'meta') meta = box;
  }
  if (!meta) return false;

  // `meta` is a FullBox: skip version + flags.
  for (const box of boxes(buf, meta.start + 4, meta.end)) {
    if (box.type !== 'iinf') continue;
    const version = buf[box.start];
    const countBytes = version === 0 ? 2 : 4;
    for (const entry of boxes(buf, box.start + 4 + countBytes, box.end)) {
      if (entry.type !== 'infe') continue;
      const ver = buf[entry.start];
      let p = entry.start + 4;
      if (ver < 2) continue;
      p += ver === 2 ? 2 : 4; // item_ID
      p += 2; // protection_index
      if (p + 4 > entry.end) continue;
      const itemType = buf.toString('latin1', p, p + 4);
      if (itemType === 'Exif') findings.push('EXIF metadata item');
      else if (itemType === 'mime') findings.push('XMP / MIME metadata item');
    }
  }
  return true;
}

/**
 * Inspect an image buffer.
 * @returns {{format: string, verifiable: boolean, findings: string[]}}
 */
export function inspectImage(buf) {
  const findings = [];

  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    scanJpeg(buf, findings);
    return { format: 'JPEG', verifiable: true, findings };
  }
  if (buf.length >= 8 && buf.toString('latin1', 0, 8) === '\x89PNG\r\n\x1a\n') {
    scanPng(buf, findings);
    return { format: 'PNG', verifiable: true, findings };
  }
  if (
    buf.length >= 12 &&
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WEBP'
  ) {
    scanWebp(buf, findings);
    return { format: 'WebP', verifiable: true, findings };
  }
  const tiffMagic = buf.length >= 4 && buf.toString('latin1', 0, 4);
  if (tiffMagic === 'II*\0' || tiffMagic === 'MM\0*') {
    scanTiff(buf, findings);
    return { format: 'TIFF', verifiable: true, findings };
  }
  if (buf.length >= 12 && buf.toString('latin1', 4, 8) === 'ftyp') {
    const verified = scanHeif(buf, findings);
    return { format: 'HEIC/HEIF', verifiable: verified, findings };
  }

  return { format: 'unknown', verifiable: false, findings };
}

/** Recursively collect image files under the given roots. */
export const collectImages = (roots) => collectFiles(roots, IMAGE_EXTENSIONS);

/** Inspect a file on disk. */
export async function inspectFile(file) {
  const buf = await readFile(file);
  return { file, ...inspectImage(buf) };
}
