import { defineCollection, z } from 'astro:content';

/**
 * `updates` — the only content collection in version one.
 * A dated stream that makes the site feel alive over time.
 *
 * Rules:
 * - Filename (without .md) is the permanent URL slug: /updates/<slug>/.
 *   Treat filenames as immutable once published — renaming breaks a URL.
 * - Ordering is reverse-chronological by `date`.
 * - `draft` entries build in dev only; they are excluded from production
 *   output and the sitemap.
 * - Do not invent updates. Each entry records something that actually happened.
 */
const updates = defineCollection({
  type: 'content',
  schema: z.object({
    /** Short, factual title. */
    title: z.string().min(1),
    /** The real date of the update. Drives ordering. */
    date: z.coerce.date(),
    /** One line; used on the index and as the meta description (<= 160 chars). */
    summary: z.string().min(1).max(160),
    /** published (built + listed) | draft (dev only). */
    status: z.enum(['published', 'draft']).default('published'),
    /** Optional attached document, path under /documents/. */
    document: z.string().startsWith('/documents/').optional(),
    /** Optional image. `alt` is required whenever an image is present. */
    image: z
      .object({
        src: z.string(),
        alt: z.string().min(1),
        caption: z.string().optional(),
      })
      .optional(),
    /** Forward-compat only: language of the entry. Default English. */
    lang: z.enum(['en', 'hi']).default('en'),
  }),
});

export const collections = { updates };
