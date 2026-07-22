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
  /** Full date of registration (ISO 8601), as shown on the certificate. */
  registrationDate: string;
  /** City of the registered office. */
  registeredCity: string;
  /**
   * Registered office address, exactly as printed on the Registration
   * Certificate (only clarified for readability, never normalised).
   */
  registeredAddress: string;
  /** State / country of registration. */
  jurisdiction: string;
  /** Registration number — public only if confirmed. */
  registrationNumber: string | null;
  /** Official contact email — rendered as a mailto link. */
  contactEmail: string | null;
  /** Default Open Graph image (path under /public). Placeholder for now. */
  ogImage: string;
}

/**
 * `pending` flags mark values awaiting confirmation from the institution.
 * Search this file for `PENDING` before launch — none should remain public.
 */
export const site: SiteData = {
  name: 'Fula Devi Memorial Sewa Sansthan',
  shortName: 'Fula Devi Memorial Sewa Sansthan',
  registeredYear: 2022,
  registrationDate: '2022-02-27',
  registeredCity: 'Patna',
  registeredAddress:
    'Sarswati Vihar Colony, Saichak, P.O. + P.S. Beur, Distt. Patna, Patna, Bihar 800002',
  jurisdiction: 'Bihar, India',

  // Confirmed public: the registration number appears on the institution's own
  // public banner and may be shown on the site.
  registrationNumber: 'S000380',

  // Confirmed: the official institutional email, published as the primary
  // public contact channel.
  contactEmail: 'Fula.Devi.NGO@outlook.com',

  // PENDING: replace with a real 1200x630 raster social image before launch.
  ogImage: '/og-default.svg',
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Format an ISO date (YYYY-MM-DD) as, e.g., "27 February 2022".
 *
 * Parses the parts directly rather than constructing a Date, so the result is
 * independent of the build machine's time zone (a UTC-midnight Date can render
 * as the previous day in a negative-offset zone).
 */
export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
