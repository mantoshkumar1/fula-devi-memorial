# Fula Devi — photographic archive

Record of the family photographs of Fula Devi (1958–2006): which are published,
which are retained privately, and what is and is not known about each.

## Permanent archival rule

> Historical authenticity takes precedence over visual perfection. Do not use
> generative restoration or facial reconstruction on photographs of Fula Devi.

No AI facial reconstruction, generative restoration, upscaling, retouching or
recolouring has been applied to any photograph listed here. Sanitizing removes
metadata only — pixels, dimensions and orientation are unchanged, verified by
comparing raw pixel hashes before and after.

Dates below are recorded only where known. Several supplied filenames contained
years, but those are family labels rather than verified records, so they are
recorded as approximate and marked accordingly rather than presented as fact.

## Published photographs

### 1. Blue-sari portrait

- **Public path:** `public/images/fula-devi/portrait/fula-devi-blue-sari-portrait.jpg`
- **Visual description:** Fula Devi wearing a blue sari, facing the camera, head
  covered, indoor background. A photograph of a physical print.
- **Role on the page:** primary portrait, immediately after the introduction. No
  caption, by instruction.
- **Source category:** family photograph.
- **Date:** approximate only — the supplied filename indicated 2003; not verified.
- **Occasion:** unknown.
- **Caption verified:** not applicable (no caption).
- **Alt text:** "Portrait of Fula Devi wearing a blue sari and looking toward the camera." — verified against the image.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. An EXIF sub-IFD (camera/device details and
  timestamps) was removed; pixels unchanged.

### 2. Holding a decorated clay pot

- **Public path:** `public/images/fula-devi/life/fula-devi-holding-painted-pot.jpg`
- **Visual description:** Fula Devi holding a white clay pot hand-painted with
  fruit and leaf motifs, standing under a thatched shelter; bamboo fencing and
  greenery behind her.
- **Role on the page:** everyday-life photograph, after "She Helped Without Judgement".
- **Source category:** family photograph.
- **Date:** approximate only — the supplied filename indicated 2003; not verified.
- **Occasion:** unknown.
- **Caption verified:** yes — "Fula Devi holding a decorated clay pot." matches
  what is visible.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### 3. Kanwar Yatra with her husband

- **Public path:** `public/images/fula-devi/pilgrimage/fula-devi-kanwar-yatra-with-husband.jpg`
- **Visual description:** Fula Devi in an orange sari beside a man in saffron,
  both walking in a river carrying kanwars; other pilgrims behind them.
- **Role on the page:** after "She Respected Every Faith".
- **Source category:** family photograph.
- **Date:** Kanwar Yatra, date unknown. (The supplied filename indicated 2000; not verified.)
- **Occasion:** known — Kanwar Yatra.
- **Caption verified:** partly. Two adults carrying kanwars are clearly visible;
  the identification of the second person as her husband rests on family
  knowledge, not on anything visible in the photograph.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### 4. Kanwar Yatra group

- **Public path:** `public/images/fula-devi/pilgrimage/fula-devi-kanwar-yatra-group-01.jpg`
- **Visual description:** four women standing side by side holding kanwars, in a
  wooded, rocky setting.
- **Role on the page:** first image in the "Photographs" gallery.
- **Source category:** family photograph.
- **Date:** Kanwar Yatra, date unknown. (The supplied filename indicated 2000; not verified.)
- **Occasion:** known — Kanwar Yatra.
- **Caption verified:** yes, as written. The caption reads "Fula Devi during the
  Kanwar Yatra" and the alt text describes three other women without naming or
  relating them, because their identities cannot be established from the image.
  The supplied filename described them as her daughters; that is not stated
  publicly since it cannot be verified visually.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### Gallery second slot — unfilled

The "Photographs" gallery was specified as two images. Only one Kanwar Yatra
photograph remained after the with-husband photograph was placed in its own
section. The slot is left empty rather than filled with a near-duplicate or an
unrelated photograph. The markup already accommodates a second image.

## Retained privately, not published

Originals of every supplied photograph — including those published — are kept
at `private-media/fula-devi/originals/`, which is listed in `.gitignore`. They
are never committed, never copied into `dist/`, and therefore never served by
Cloudflare. Originals are never overwritten or deleted after a public web copy
is made.

Not published:

- **Seated, yellow shawl.** Fula Devi seated in a decorated ceremonial setting,
  a yellow cloth across her lap, banana leaf and printed cloth visible. Family
  photograph; occasion and date unknown. Excluded from the public page by
  instruction and retained in the private archive only.

## Adding a photograph later

1. Keep the original in `private-media/fula-devi/originals/` — never edit it.
2. Copy it to the appropriate folder under `public/images/fula-devi/`.
3. Run `npm run privacy:sanitize`, then `npm run privacy:check`. The pre-commit
   hook enforces both.
4. Write a caption and alt text describing only what is visibly present. Do not
   assert identities, relationships, dates or occasions that the image itself
   does not show and that are not independently known.
5. Add an entry to this file.
