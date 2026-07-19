/**
 * Single source of truth for institutional facts and site-wide metadata.
 *
 * IMPORTANT: Do not invent facts. Fields marked `pending: true` hold clearly
 * marked placeholders and MUST be confirmed before the copy/launch stage.
 * Every public page reads these values instead of hardcoding them, so a fact
 * is corrected in exactly one place.
 */

export interface SiteData {
  /** Full legal name of the institution. */
  name: string;
  /** Short name for tight spaces (still accurate). */
  shortName: string;
  /** Year the institution was registered. */
  registeredYear: number;
  /** State / country of registration. */
  jurisdiction: string;
  /** Registration number — public only if confirmed. */
  registrationNumber: string | null;
  /** Official contact email — rendered as a mailto link. */
  contactEmail: string | null;
  /** Default Open Graph image (path under /public). Placeholder for now. */
  ogImage: string;
  /** Default social/meta locale. */
  locale: string;
}

/**
 * `pending` flags mark values awaiting confirmation from the institution.
 * Search this file for `PENDING` before launch — none should remain public.
 */
export const site: SiteData = {
  name: 'Fula Devi Memorial Sewa Sansthan',
  shortName: 'Fula Devi Memorial Sewa Sansthan',
  registeredYear: 2022,
  jurisdiction: 'Bihar, India',

  // PENDING: confirm whether the registration number is to be shown publicly.
  registrationNumber: null,

  // PENDING: confirm the official, publishable contact email.
  contactEmail: null,

  // PENDING: replace with a real 1200x630 raster social image before launch.
  ogImage: '/og-default.svg',

  locale: 'en',
};
