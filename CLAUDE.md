# Fula Devi Memorial Sewa Sansthan

Permanent operating rules for this repository.

## Project

The public website of a small registered charitable institution in Bihar, India
(registered 2022). Astro + TypeScript, static output, no adapter, deployed on
Cloudflare Pages. No backend, database, CMS, authentication, or client-side
JavaScript. Live at https://fuladevi.org.

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
