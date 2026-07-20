# Fula Devi Memorial Sewa Sansthan — website

The public website of a small registered charitable institution in Bihar, India
(registered 2022). Static, fast, inexpensive, and built to last decades while
growing through real work rather than added features.

## Stack

- [Astro](https://astro.build) (static output, no adapter)
- TypeScript
- Markdown content collections
- Deployed on Cloudflare Pages (free tier)
- No backend, no database, no CMS, no third-party runtime scripts

## Requirements

- Node **22** (see `.nvmrc`). Run `nvm use` if you use nvm.

## Commands

```bash
npm install      # install dependencies
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run check    # TypeScript + content-schema type checking
```

## Structure

See [`docs/architecture.md`](docs/architecture.md) for the full specification.
In short:

- `src/pages/` — one file per public route
- `src/content/updates/` — the dated updates stream (Markdown)
- `src/data/` — institutional facts, navigation, document register (typed)
- `src/components/`, `src/layouts/`, `src/styles/` — presentation
- `public/documents/`, `public/images/` — PDFs and web-ready images

## Editing content

Adding an update or a document does **not** require touching code. See
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Privacy Pipeline

A permanent feature of this repository. Nothing reaches the public site
carrying private data, and the enforcement is automated rather than written
down and hoped for.

It protects three things:

| What       | Where       | Removed / detected                                                  |
| ---------- | ----------- | ------------------------------------------------------------------- |
| **Images** | `public/`   | EXIF, GPS, IPTC, XMP, comments, embedded thumbnails, device details   |
| **PDFs**   | `public/`   | Info dictionary, XMP, embedded files/JavaScript, recoverable remnants |
| **Text**   | `src/`      | Aadhaar, PAN, IFSC, phone numbers, emails, GPS coordinates            |

Images and PDFs are **sanitized** automatically. Text is only **reported** —
removing a name or a number from published copy is an editorial decision, so a
human makes it.

```bash
npm run privacy:sanitize   # strip metadata from images and PDFs in public/
npm run privacy:check      # verify only; no tools required, never modifies files
```

Enforcement runs in three places, so it cannot be forgotten:

- a **pre-commit hook** sanitizes and re-stages staged images and PDFs, then
  runs the full check and blocks the commit if anything remains;
- **GitHub Actions** re-checks every push and pull request;
- the **production build** runs the check first, so a deploy fails rather than
  publishing private data.

The hook is enabled automatically by `npm install`. Verification needs nothing
beyond Node — which is why it can run in the Cloudflare build. Sanitizing needs
two tools locally:

```bash
brew install exiftool qpdf     # macOS
sudo apt-get install -y libimage-exiftool-perl qpdf   # Debian/Ubuntu
```

Quality is preserved: images are a metadata-only edit with orientation and
colour profile kept, and PDFs keep their pages — nothing is re-encoded or
re-rendered.

**Why PDFs need qpdf.** ExifTool removes PDF metadata by appending an
incremental update. It will then report the file as clean while the original
author name and XMP packet are still in the bytes, recoverable by anyone. qpdf
rewrites the file so those objects are physically gone. The checker reads raw
bytes precisely so it catches this.

If something intentional trips the text scan — the institution's own contact
email, say — add it to `scripts/privacy-allowlist.json` after a privacy review,
or put `privacy-allow` in a comment on that line.

### Automation is not enough — still review every photograph and document

Stripping metadata does not make a file safe to publish. Before adding any
image or PDF, look at what it actually shows:

- names, addresses, phone numbers, signatures, ID cards or documents in frame;
- children — including the child whose education we support;
- homes, schools, or anything that identifies where someone lives or studies;
- anything a person in the file would not want published.

Publication is irreversible: files get crawled, cached and archived. When in
doubt, leave it out.


## Deployment (Cloudflare Pages)

The site is a fully static build with no adapter, so hosting is just serving
`dist/`.

**One-time setup**

1. Create a GitHub repository and push this project's `main` branch to it.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
   Git**, and select the repository.
3. Set the build configuration:

   | Setting            | Value           |
   | ------------------ | --------------- |
   | Production branch  | `main`          |
   | Framework preset   | Astro           |
   | Build command      | `npm run build` |
   | Build output dir   | `dist`          |
   | Environment var    | `NODE_VERSION` = `22` |

4. Save and deploy. Every push to `main` redeploys production; pull requests get
   preview URLs automatically. HTTPS is provisioned by Cloudflare.

**Production domain**

The site is live at **https://fuladevi.org** (`www.fuladevi.org` permanently
redirects to the apex domain).

If the domain ever changes, update `site` in
[`astro.config.mjs`](astro.config.mjs) and the `Sitemap:` line in
[`public/robots.txt`](public/robots.txt) — canonical URLs, Open Graph, and the
sitemap all derive from those two values — then add the domain under the Pages
project's **Custom domains** tab.

No paid Cloudflare features are used.

## Portability

Output is plain static HTML in `dist/`. It can be deployed to any static host
(Netlify, GitHub Pages, a bucket) without code changes.
