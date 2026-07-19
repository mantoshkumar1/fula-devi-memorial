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

## Image privacy

**Metadata is stripped automatically.** Every image added to the site has its
EXIF, GPS, IPTC and XMP metadata removed — camera and device details,
timestamps, author, comments, software, embedded thumbnails, and above all
location data. Orientation and the colour profile are kept, and pixels are
never re-encoded, so image quality is unchanged.

Enforcement is automated in three places, so it cannot be forgotten:

- a **pre-commit hook** sanitizes and re-stages staged images, and blocks the
  commit if anything remains;
- **GitHub Actions** re-checks every push and pull request;
- the **production build** runs the check first, so a deploy fails rather than
  publishing an image with metadata.

```bash
npm run images:sanitize   # strip metadata from images in public/ (needs ExifTool)
npm run images:check      # verify only; no tools required, never modifies files
```

The hook is enabled automatically by `npm install`. Sanitizing needs ExifTool
(`brew install exiftool`, or `sudo apt-get install -y libimage-exiftool-perl`);
verification needs nothing beyond Node.

### Automation is not enough — still review every photograph

Stripping metadata does not make a photograph safe to publish. Before adding
any image, look at what it actually shows:

- names, addresses, phone numbers, ID cards or documents visible in frame;
- children — including the child whose education we support;
- homes, schools, or anything that identifies where someone lives or studies;
- anything a person in the photograph would not want published.

Publication is irreversible: images get crawled, cached and archived. When in
doubt, leave the photograph out.


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
