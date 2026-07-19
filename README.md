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
