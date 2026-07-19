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

## Portability

Output is plain static HTML in `dist/`. It can be deployed to any static host
(Netlify, GitHub Pages, a bucket) without code changes.
