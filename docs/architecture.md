# Architecture specification (v1)

The website of Fula Devi Memorial Sewa Sansthan. This document is the source of
truth for structure and technical decisions. It is committed so future
contributors inherit the reasoning, not just the code.

## Guiding intent

We are not building a beautiful website; we are building an institution that
happens to have a beautiful website. The architecture makes **adding content
frictionless and adding features slightly annoying** — that asymmetry is the
whole design. The site should feel living and growing, never finished, never
inflated beyond the institution's real size.

## Resolved decisions

- **Language:** English-only at the site root (no `/en/` prefix) for v1.
  Content carries an optional `lang` field defaulting to `en`, and no URL hard-
  codes a language, so Hindi can be added later without a rewrite.
- **Rendering:** Astro `output: 'static'`, no adapter. `dist/` is portable.
- **Content:** one collection, `updates`. "Our Work" and the document register
  are typed `src/data/` files, not collections. No speculative collections.
- **Fonts:** system sans + Georgia serif; zero web-font downloads. A self-hosted
  serif is a possible future upgrade (never a CDN font).
- **No** hero image, hamburger/JS menu, dark mode, PDF embed, or contact form in
  v1. Each is deliberate subtraction.
- **Node** pinned to 22 (`.nvmrc` + Cloudflare `NODE_VERSION`).
- **Trailing slash:** `always`; directory build format; canonical URLs absolute.

## Repository structure

```
public/documents/   legal PDFs, served as-is
public/images/      web-ready images only (masters off-repo)
src/components/      only components that earn their place
src/layouts/         BaseLayout.astro — the one layout
src/pages/           one file per public route
src/content/updates/ the updates stream (Markdown) + config.ts schema
src/data/            site.ts, nav.ts, governance.ts — typed facts
src/styles/          tokens.css, global.css
docs/                this spec
```

## Pages (v1)

| Page | Route | Source |
|---|---|---|
| Home | `/` | static |
| The Institution | `/institution/` | static + `data/site.ts` |
| Fula Devi | `/fula-devi/` | static |
| Our Work | `/our-work/` | static (Ongoing / Completed / Focus ahead) |
| Updates | `/updates/`, `/updates/[slug]/` | `updates` collection |
| Governance | `/governance/` | static + `data/governance.ts` |
| Contact | `/contact/` | static (mailto, no form) |

Each page has a single purpose, is understandable in under 30 seconds, and
clearly distinguishes current, completed, and future work. No page invents
facts, statistics, testimonials, or people.

## Content model — `updates`

Filename is the permanent slug (`/updates/<slug>/`). Reverse-chronological by
`date`. `draft` builds in dev only, excluded from production and sitemap.

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `date` | date | yes |
| `summary` | string ≤160 | yes |
| `status` | `published` \| `draft` | default `published` |
| `document` | path under `/documents/` | no |
| `image` | `{ src, alt (required), caption? }` | no |
| `lang` | `en` \| `hi` | default `en` |

## Components

`Header`, `Footer`, `PageIntro`, `UpdateList`, `UpdateItem`, `DocumentLink`,
`Figure`, `EmptyState`. No quote-block or status-badge component (they invite
overuse / dashboard styling). No design-system library for its own sake.

## Design tokens

Warm off-white, charcoal, earthy brown, muted green (sparse accent), subtle
hairline borders, small radii only. No gradients, glass, decorative shadows,
bright colors, or dashboard styling. All values live in `src/styles/tokens.css`.

## Accessibility (WCAG 2.2 AA target)

One `<h1>` per page; semantic landmarks; skip link; visible `:focus-visible`
rings; contrast ≥ 4.5:1; 44px touch targets; reduced-motion honored; required
alt text enforced by component prop types; `<html lang>` set.

## SEO

Per-page factual `title`/`description`; absolute canonicals; `@astrojs/sitemap`;
static `robots.txt`; Open Graph defaults with a placeholder social image; a
single factual `Organization` JSON-LD on Home. Nothing inflated.

## Documents & images

PDFs served as-is; **never** transcribe or separately publish personal data from
inside them. If a supplied PDF contains sensitive personal data, flag before
publishing. Images: web-ready only in the repo, masters off-repo; `astro:assets`
optimization is a deferred upgrade for when real photos arrive.

## Contact

`mailto:` link only. No form in v1 (would need a backend or third-party
endpoint). A dead form styled to look functional is forbidden.

## Deployment (Cloudflare Pages, free tier)

- Build command: `npm run build`
- Output directory: `dist`
- Node: `NODE_VERSION=22` (+ `.nvmrc`)
- Production branch: `main`; preview deployments on for other branches/PRs
- No Functions/KV/D1/paid features. Portable to any static host.

## Quality gates

Build clean; `astro check` clean; content schema valid; no broken internal or
document links; responsive at 320/480/768/1024; automated a11y with zero serious
issues + manual keyboard pass; unique factual metadata; no-placeholder scan
(only intentionally marked placeholders allowed); human fabricated-content
review.

## Pending factual inputs

Official contact email; final domain; the four legal PDFs (web-ready, cleared)
with dates/sizes; Fula Devi biographical facts; registration number/registrar if
public; the confirmed public list of work items per state. None block scaffold.
