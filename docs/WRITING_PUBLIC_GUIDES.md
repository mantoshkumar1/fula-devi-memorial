# Writing Public Guides

The institution publishes plain-language guides that explain public government
schemes (Ayushman Bharat / PM-JAY, PMJJBY, and others). These guides are read by
villagers who may find official language hard to follow. How they are written
matters as much as what they contain.

## The rule

> हर निर्देश पूरा और साफ वाक्य होगा। पाठक से किसी छोटे संकेत, कठिन सरकारी शब्द या
> अधूरे वाक्य का अर्थ समझने की उम्मीद नहीं की जाएगी।

Every instruction is a complete, clear sentence. The reader is never expected to
work out the meaning of a small hint, a difficult official term, or an
unfinished phrase. The design may be visually simple, but saving space must
never make the writing cryptic.

## Complete sentences, not fragments

Write each instruction as a full sentence a first-time reader can act on.

- Not just `खाते में पैसा रखें`
  → `हर साल प्रीमियम कटने से पहले अपने बैंक खाते में पर्याप्त पैसा रखें।`
- Not just `नॉमिनी जरूरी`
  → `योजना में जुड़ते समय नॉमिनी का नाम जरूर दर्ज कराएँ। मृत्यु होने पर बीमा का पैसा उसी व्यक्ति को मिलता है।`
- Not just `अस्पताल की जाँच करें`
  → `इलाज कराने से पहले जाँच लें कि अस्पताल आयुष्मान भारत योजना की सूची में शामिल है।`

## Familiar, everyday Hindi

- Use words people already use. Explain any scheme term the first time it
  appears.
- Do not make the reader decode an abbreviation, an icon, or a compressed label
  without explanation.
- Keep numbers, helplines and web addresses exact.

## Honesty and privacy

- State plainly that the guide is **not** an official government document
  (`यह सरकारी कागज नहीं है`), and do not imitate an official form.
- Point the reader to official sources (helplines, government websites, the bank
  or a valid centre) for the final word.
- No personal mobile number, and no personal identifier of any kind. The
  institution's own name, registration, address and website may appear.
- Include the preparation date so a reader knows how current it is.

## Scope labels are verified from the PDF

A guide's geographic scope label on Our Work (`— Bihar-focused`, `— India-wide`)
is set **only after reading the finished PDF** and confirming it:

- Label a national scheme national. Label practical, state-specific help for what
  it is.
- Do not call a guide India-wide if it presents a state-specific process as if it
  applied everywhere. If the content is narrower than a label would suggest, use
  a more accurate, narrower label — and report why.

## Publishing a revised guide

- Replace the file at its existing permanent URL (the visitor-facing URL never
  changes because a new version is published).
- Run the Privacy Pipeline: the PDF must carry no metadata, including metadata
  hidden inside compressed object streams.
- When a finished guide replaces a draft, set `state: 'final'` in
  `src/data/work-records.ts` and remove that path's draft-only
  `X-Robots-Tag: noindex` from `public/_headers`.
- Guides open in a new tab so the website stays open.
- Replacing a PDF at an existing URL requires cache verification — follow the
  Cloudflare Cache Policy in `CLAUDE.md` and confirm the live bytes match.
