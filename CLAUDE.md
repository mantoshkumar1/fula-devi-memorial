# Fula Devi Memorial Sewa Sansthan

Permanent operating rules for this repository.

## Project

The public website of a small registered charitable institution in Bihar, India
(registered 2022). Astro + TypeScript, static output, no adapter, deployed on
Cloudflare Pages. No backend, database, CMS or authentication. Live at
https://fuladevi.org.

The website is primarily static and requires no client-side JavaScript for its
core content. One small, same-origin JavaScript module progressively enhances
public-record media browsing (the in-site viewer); every public record remains
accessible through ordinary links when JavaScript is unavailable. Keep it this
way: static-first, no client framework and no application architecture beyond
that one module; same-origin scripts only; no inline executable scripts and no
third-party scripts; a strict CSP (`script-src 'self'`); and an ordinary-link
fallback so core content never depends on JavaScript.

## Content Integrity

These rules outrank convenience, and outrank the execution policy below.

- Never invent facts, dates, people, statistics, testimonials, images, or
  activity.
- Never make the institution appear larger than it is.
- Where a fact is not yet supplied, render an honest state — never a
  fabrication, never a fake link, never a form that does not work.
- Real work only: the institution grows through years of execution, not through
  website features.
- Before publishing any legal PDF or photograph, review it for personal data
  (names, addresses, ID numbers, signatures, EXIF/GPS). Publication is
  irreversible.

## Editing Content

Content Integrity governs what may be said. This governs how it is written.

- Prefer explanation over persuasion.
- Prefer evidence over claims.
- Prefer simple words over impressive words.
- If a sentence can lose one adjective without losing meaning, remove it.
- If a paragraph can lose one sentence without losing meaning, remove it.
- Do not rewrite merely because another wording is possible.

The goal is clarity, not cleverness.

Before changing any existing sentence, ask: *am I improving clarity, or am I
only rewriting?* If it is only rewriting, leave it alone. Restraint is the
default; an unchanged sentence needs no justification, a changed one does.

## Editorial Stability

Editing Content governs the sentence. This governs the page.

A page should not be reopened simply because the writing could be improved.

Editorial refinement has diminishing returns. Once a page meets the
institution's editorial standard and accurately reflects verified facts, treat
it as stable.

Reopen a published page only when one of the following occurs:

- a factual error is discovered;
- historical evidence requires correction;
- governance or legal information changes;
- new institutional work genuinely belongs on that page;
- accessibility, security or technical issues require modification.

Do not reopen pages for stylistic preference alone.

Before recommending an edit to an existing page, first decide whether the
proposed change introduces new factual value. If it does not, recommend leaving
the page unchanged.

After a page is declared **Frozen**, assume no further editorial change is
required unless one of the conditions above applies.

When reviewing future edits, prefer preserving stability over pursuing marginal
improvements in wording.

The institution's credibility grows through sustained work, not through
continuous rewriting.

### Editorial Recommendation vs. User Decision

That recommendation is editorial advice, not a refusal to edit.

If the user chooses a different reasonable editorial direction after receiving
it, implement the user's decision, preserving:

- factual accuracy;
- historical integrity;
- consistency with the institution's editorial standards.

The responsibility is therefore twofold:

1. Recommend what best serves the institution.
2. Faithfully implement the user's final editorial decision once it is made.

Recommendation and implementation are separate decisions.

## Public Records

`public/records/` is the permanent home for published artefacts: photographs,
report cards, newspaper coverage, public guides and informational material. It
is a public record, not a private archive. Private originals stay outside
`public/` — see `docs/FULA_DEVI_IMAGE_ARCHIVE.md`.

- Public pages should reference files from this structure when appropriate.
- Photographs should not be scattered through unrelated directories.
- Every published artefact should have one permanent location, and should keep
  it. A published URL is a promise.
- Records stay organised by programme, and by year where a programme runs on an
  annual cycle.
- Each programme directory carries a README explaining what belongs in it. Add a
  directory only when there is a record to put in it.

The institution's public pages should make factual claims. Whenever practical,
those claims should be supported by public records stored under
`public/records`.

Everything under `public/` is served, including README files. Write them as
public documents: no internal repository detail, nothing that would embarrass
the institution if read by a stranger.

Everything placed here is subject to the Privacy Pipeline: images and PDFs under
`public/`, and supported text files under `public/records/` — Markdown, HTML,
plain text, JSON, CSV and YAML — are scanned for personal identifiers before
commit and before every build.

Automated scanning complements editorial review; it does not replace it. A scan
catches identifiers it has patterns for. It cannot tell whether a photograph
should have been published at all, whether a name in prose belongs to a child,
or whether consent was given. Every public record still needs human editorial
review before publication.

Records are declared in one typed data source, `src/data/work-records.ts`, from
which both the Our Work previews and the dedicated record pages derive. The
`records:check` script (run in the pre-commit hook, in `prebuild`, and in GitHub
Actions) verifies that data source against the files it references: existence,
stable naming, generated routes, and that draft guides carry `noindex`.

When new public records are added, follow `docs/ADDING_PUBLIC_RECORDS.md`. Do
not improvise a new publication structure. Public guides must follow
`docs/WRITING_PUBLIC_GUIDES.md`.

## Privacy Pipeline

A permanent repository feature, not an optional add-on. It protects images,
PDFs and public text content through one shared set of scripts
(`scripts/privacy-check.mjs`, `scripts/privacy-sanitize.mjs`, `scripts/lib/`).

- `npm run privacy:check` — read-only verification. Zero dependencies by
  design, so the identical check runs in the pre-commit hook, in GitHub
  Actions and in the Cloudflare build.
- `npm run privacy:sanitize` — strips metadata from images and PDFs. Local and
  pre-commit only; the production build must never modify files.

Rules for anyone extending it:

- Extend this pipeline. Do not build a second privacy system alongside it.
- Verification must stay dependency-free. Sanitizing may use native tools
  (ExifTool, qpdf); verification may not.
- Fail closed: unknown tags, unrecognised formats and unverifiable files are
  reported as failures, never silently passed.
- Never trust a tool's own report. Verify the resulting bytes — ExifTool will
  report a PDF as clean while the original metadata is still recoverable,
  which is why PDFs are rewritten with qpdf.
- Sanitizing must be idempotent and must not degrade quality: metadata-only
  edits, no re-encoding, orientation and colour profile preserved.
- Text is reported, never auto-edited. Editing published copy is an editorial
  decision for a human.
- `prebuild` runs `privacy:check`, so a deploy fails rather than publishing
  private data. Keep it that way.

## Execution Policy

Work autonomously.

Do not stop for intermediate confirmations.

Complete the entire requested task before responding.

Assume approval for:

- creating, modifying, moving and deleting project files
- installing development dependencies
- updating package.json
- creating scripts
- creating Git hooks
- creating GitHub Actions
- running shell commands
- running tests
- running builds
- fixing build failures
- committing
- pushing to GitHub
- verifying deployment
- refactoring
- documentation updates

Only stop when:

- external authentication is required
- payment is required
- a legal or policy decision is required
- an irreversible action outside the repository is required
- there is an unrecoverable error

## Engineering Principles

- Prefer simple solutions.
- Keep dependencies minimal.
- Never add unnecessary complexity.
- Verify every change.
- Never claim success without verification.
- Always run the build before committing.
- Keep the repository production-ready.

## Deployment

After code changes:

1. Build.
2. Test.
3. Commit.
4. Push.
5. Verify Cloudflare deployment.
6. Verify the live website.
7. If a public asset was replaced at an existing URL, apply the Cloudflare
   Cache Policy below.

## Cloudflare Cache Policy

Whenever an existing public asset is replaced at the same URL — photographs,
PDFs, downloadable documents, logos, images, or any other static asset —
**assume Cloudflare may keep serving the previous version from edge cache for a
short period after deployment.**

This is not theoretical. It has been observed on this site: immediately after a
deploy, a superseded image kept returning HTTP 200 with the old bytes
(`cf-cache-status: REVALIDATED`) while the new file was already live, and a
deleted path kept serving its old content before eventually returning 404.

Because of that, a stale edge copy can outlive the deployment that was supposed
to remove it. **This matters most for privacy-related replacements** — a
redacted photograph or a re-issued document is worthless if the unredacted
version is still being served from cache.

**If Cloudflare credentials are available** (e.g. `CLOUDFLARE_API_TOKEN` plus
the zone id, or an authenticated `wrangler`):

- purge **only the affected asset path(s)** from the cache after deployment.

**If Cloudflare credentials are not available** (the current situation — no
token, no `wrangler`):

- state the **exact asset path(s)** that need purging manually, as full URLs,
  so they can be pasted straight into the Cloudflare dashboard
  (Caching → Configuration → Purge Custom URLs).

Never purge the entire cache unless there is genuinely no narrower option.

Always verify after deployment that:

- the live asset matches the repository version — compare checksums, not just
  HTTP status;
- the old asset is no longer reachable at its previous URL, if it was removed
  or renamed;
- no stale cached copy is being served — repeat the check with cache-busting
  query strings, and more than once, since different edge nodes can disagree
  during a rollout.

Report the result plainly. A single passing request is not proof.

## Communication

Do not narrate every step.

Only report:

- what changed
- verification
- commit hash
- next action (if any)

Never pause to ask for confirmation unless it matches the exceptions above.
