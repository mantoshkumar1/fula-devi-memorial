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

A date is recorded as "Date unknown" unless it has been independently verified.
Where the occasion is known but the year is not, that is recorded as
"Kanwar Yatra, date unknown". Several supplied filenames contained years, but
those are family labels rather than verified records, so they are kept only as
a parenthetical note beside the unknown date, never as the date itself.

## Published photographs

### 1. Blue-sari portrait

- **Public path:** `public/images/fula-devi/portrait/fula-devi-blue-sari-portrait.jpg`
- **Visual description:** Fula Devi wearing a blue sari, facing the camera, head
  covered, indoor background. A photograph of a physical print.
- **Role on the page:** primary portrait, immediately after the introduction. No
  caption, by instruction.
- **Source category:** family photograph.
- **Date:** Date unknown. (The supplied filename indicated 2003; not verified.)
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
- **Role on the page:** everyday-life photograph, after "She Helped Without
  Judgement". Displayed with its height capped rather than its width, so the
  whole frame is visible without dominating a desktop screen; not cropped.
- **Source category:** family photograph.
- **Date:** Date unknown. (The supplied filename indicated 2003; not verified.)
- **Occasion:** confirmed by the family — the wedding ceremony of Fula Devi's
  youngest daughter. Which ritual within the ceremony the photograph shows is
  not recorded and is not inferred.
- **Caption verified:** yes. Caption: "Fula Devi holding a decorated clay pot
  during her daughter's wedding ceremony." The public caption says "her
  daughter" rather than naming which one; the archive keeps the fuller detail
  recorded above. The decorated clay pot she is holding is visibly present in
  the photograph; the occasion rests on family knowledge rather than on
  anything visible in it.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### 3. Kanwar Yatra with her husband

- **Public path:** `public/images/fula-devi/pilgrimage/fula-devi-kanwar-yatra-with-husband.jpg`
- **Visual description:** Fula Devi in an orange sari beside a man in saffron,
  both walking in a river carrying kanwars; other pilgrims behind them.
- **Role on the page:** first of the two pilgrimage photographs shown together
  after "She Respected Every Faith". No gallery heading is used.
- **Source category:** family photograph.
- **Date:** Kanwar Yatra, date unknown. (The supplied filename indicated 2000; not verified.)
- **Occasion:** Kanwar Yatra. Route and participation confirmed by the family —
  see "The Kanwar Yatra" below.
- **Caption verified:** partly. Caption: "Fula Devi and her husband during the
  Kanwar Yatra." Two adults carrying kanwars are clearly visible; the
  identification of the second person as her husband rests on family knowledge,
  not on anything visible in the photograph.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### 4. Kanwar Yatra group

- **Public path:** `public/images/fula-devi/pilgrimage/fula-devi-kanwar-yatra-group-01.jpg`
- **Visual description:** four women standing side by side holding kanwars, in a
  wooded, rocky setting.
- **Role on the page:** second of the two pilgrimage photographs shown together
  after "She Respected Every Faith". No gallery heading is used.
- **Source category:** family photograph.
- **Date:** Kanwar Yatra, date unknown. (The supplied filename indicated 2000; not verified.)
- **Occasion:** Kanwar Yatra. Route and participation confirmed by the family —
  see "The Kanwar Yatra" below.
- **Caption verified:** yes. Relationship confirmed by the family: Fula Devi
  with her daughters during the Kanwar Yatra. The caption and alt text state
  that relationship and name no one. It rests on family knowledge rather than
  on anything visible in the photograph, which is why it was withheld until the
  family confirmed it.
- **AI facial reconstruction used:** no.
- **Privacy Pipeline:** passed. No metadata present; file left untouched.

### The Kanwar Yatra

Confirmed by the family, and recorded here because it applies to both
pilgrimage photographs rather than to either one alone:

- **Occasion:** Kanwar Yatra.
- **Route:** Sultanganj, Bihar, to Deoghar, Jharkhand.
- **Distance:** approximately 105 km, on foot.
- **What was carried:** holy water from the Ganges.
- **Confirmed by the family:** the route and the family's participation.
- **Date:** unknown, unless independently confirmed.

The two photographs are from this pilgrimage. It is not established that they
were taken at the same moment, and the page does not claim they were: the note
below the pair says the photographs were taken during a Kanwar Yatra, and each
caption describes only its own photograph.

### Presentation of the two pilgrimage photographs

The two Kanwar Yatra photographs are published together, in a two-column layout
on wider screens and a single column on narrow ones. No visible "Photographs"
gallery heading is used: they belong to the section about her faith rather than
to a separate collection. Both keep their natural aspect ratios — no
fixed-height cropping, no carousel, no lightbox, no JavaScript.

The two have different aspect ratios, so on wider screens they are aligned at
the top and their lower edges and captions fall where they fall. Equal heights
are not forced, and neither photograph is cropped or stretched to make them
match. The shared pilgrimage note spans both columns beneath them, so the route
is stated once rather than repeated in each caption.

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
