# Adding Public Records

The permanent, step-by-step process for publishing a new public record —
photographs, newspaper coverage, a report card, or a guide — to
[fuladevi.org](https://fuladevi.org).

Follow this document. Do not improvise a new publication structure. The site is
deliberately uniform: one data source, one set of record pages, one privacy
pipeline, one validator. New records slot into that structure; they do not add
to it.

> The single most important rule: **a record is published only after a human has
> looked at every image and judged it safe.** No script can see a face. The
> automated checks below guard structure and metadata — they do not, and cannot,
> decide whether a photograph should be public.

---

## 1. Preserve the originals

Keep the untouched originals **outside `public/` and outside Git** — for
example under `private-media/` (git-ignored) or off the repository entirely.
Originals carry full metadata and unredacted faces; they must never be
committed. See `docs/FULA_DEVI_IMAGE_ARCHIVE.md`.

## 2. Make privacy-safe public copies

Work from a copy, never the original.

- Blur or remove anything that must not be public (see the privacy rules below).
- Do not use generative restoration, face reconstruction, or "beauty" editing.
  Blur and crop only.

## 3. Place the public copies

Put the public copies under the correct programme directory:

- `public/records/clothing/<year>/`
- `public/records/education/`
- `public/records/healthcare/`
- `public/records/financial-awareness/`

Add a new programme directory only when there is a real record to put in it,
and give it a `README.md` written as a public document.

## 4. Use stable, descriptive filenames

Lowercase words, digits and hyphens only. These names are permanent public
URLs.

- `distribution-01.jpg`, `distribution-02.jpg`, …
- `newspaper-01.jpg`
- `report-card-<academic-year>-page-1.jpg` (e.g. `report-card-2025-2026-page-1.jpg`)
- A display-only cover derivative, when one is needed (see step 13): `cover.jpg`

## 5. Never publish a raw export or a personal filename

No WhatsApp/camera export names (`IMG-20240115-WA0007.jpg`), and no filename
that contains a person's name. `records:check` rejects spaces, capitals and
unusual characters, but naming is your responsibility, not the script's.

## 6–10. Privacy rules for what is inside the frame

6. **Children must not be identifiable** unless documented guardian consent
   exists. If in doubt, blur.
7. **Adult beneficiaries who are the clear subject of a close-up handover
   photograph** must not be identifiable unless documented consent exists.
8. **Organisers, volunteers and speakers acting publicly** may remain
   identifiable.
9. **Wide public-event photographs** may retain adults who are not singled out.
10. **Newspaper clippings are preserved exactly as published.** They are public
    record; do not blur faces or alter them.

A report card additionally must **not** expose any of: the child's name; parent
or guardian names; mobile number; date of birth; roll number; admission or
registration number; student ID; QR code or barcode; any handwritten signature
(parent, teacher or principal). School name and address, academic year, class,
subjects, marks, grades and non-identifying remarks may remain.

## 11. Strip metadata

Remove EXIF, GPS, XMP, IPTC, embedded thumbnails, device and software strings,
and timestamps from every public copy:

```
npm run privacy:sanitize
```

This is metadata-only and lossless — it never re-encodes the image.

## 12. No generative editing

Restated because it matters: no AI restoration, face reconstruction or
retouching. A public record must remain a faithful record.

## 13. Choose a cover, and derive it if it is heavy

Pick one **wide overview** image as the year's cover. If that image is larger
than roughly **450 KB** or wider than **1600 px**, create a display-only
derivative for the Our Work preview:

- long edge ≈ 1280 px, reasonable JPEG compression, metadata stripped;
- save it as `cover.jpg` beside the originals;
- **keep the full-resolution original** at its own permanent URL — the record
  page uses the original; only the Our Work preview uses `cover.jpg`;
- visually confirm the derivative did not alter identities or content.

## 14. Add the record to the data source

Edit `src/data/work-records.ts` — the single source of truth. Add one typed
record (`type: 'clothing' | 'education'`) or a `ResourceGuide`. Both the Our
Work preview and the dedicated record page derive from this entry; never write
record details in two places.

Alt text describes the visible scene, never identifies a person, and never
mentions that a face was blurred. Set intrinsic `width`/`height` on every image.

## 15. Keep independent coverage separate

Newspaper coverage goes in the record's `coverage` field and renders in its own
"Independent Coverage" section — never mixed into the photo gallery.

## 16. Never publish a raw attachment list

The visitor-facing interface is the editorial record page. Do not surface a
directory listing, a `README`, or a list of filenames as the way people view a
record.

## 17–19. Verify locally

```
npm run privacy:check     # metadata + published-text scan (fails closed)
npm run records:check     # data source ↔ files: existence, naming, routes, draft noindex
npm run build             # prebuild runs both checks, then astro build
```

## 20–21. Commit and push

```
git add public/records/... src/data/work-records.ts   # and any page/header edits
git commit
git push
```

The pre-commit hook sanitizes staged images/PDFs, then runs both checks. GitHub
Actions runs them again on push. Nothing bypasses them.

## 22–23. Verify the deployment

Wait for the Cloudflare Pages build, then confirm on the live site:

- the record page renders and every image and link resolves;
- **compare live bytes to the repository** (checksum), not just HTTP 200;
- metadata is absent from the live files.

## 24. Purge cache if you replaced an existing asset

If you replaced a file at a URL that already existed, follow the **Cloudflare
Cache Policy** in `CLAUDE.md`: purge the exact asset path(s), because a stale
edge copy can outlive the deploy. This matters most for a privacy re-issue — a
redacted image is worthless if the old one is still cached. New URLs need no
purge.

## 25. No empty or "coming soon" records

Do not create a record card, directory placeholder, or record page for work
that has no published record yet. An honest absence is better than a promise of
nothing. A guide that is not finished is published as a clearly labelled
**draft** (see below), not as a "coming soon" stub.

---

## Draft guides

A guide may be published before it is finished, but only as an honest draft:

- Mark it `state: 'draft'` in `src/data/work-records.ts`. The card then shows a
  "Draft resource" label.
- The draft PDF must say plainly that it is a draft and must not be relied upon.
- Add the draft's path to `public/_headers` with
  `X-Robots-Tag: noindex, noarchive` so a placeholder is never indexed.
- `records:check` enforces that every draft PDF carries that header.

When the finished guide replaces the draft **at the same URL**:

- change `state` to `'final'`;
- remove that path's `noindex` block from `public/_headers`;
- follow the Cloudflare Cache Policy in `CLAUDE.md` (step 24).

---

## The withheld education record

As of this writing there is no published education record. The available
report-card copies still expose a signatory's handwriting in the annual
signature area, which is prohibited. The record is therefore withheld: the
Education section on Our Work carries its text only, with no visual preview and
no record page.

To publish it later: redact the remaining signature on the public copy, confirm
none of the prohibited identifiers in step 10 remain, name the files
`report-card-2025-2026-page-1.jpg` / `-page-2.jpg`, add an `EducationRecord`
entry to the data source, create `src/pages/records/education/[slug].astro`, and
run the full verification above.
