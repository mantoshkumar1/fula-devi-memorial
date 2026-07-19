/**
 * Primary navigation — the seven public routes for version one.
 * Order is intentional. Do not add routes here without an architecture decision
 * (the brief explicitly forbids Donate, Join Us, Blog, Team, etc.).
 */

export interface NavItem {
  /** Visible label. */
  label: string;
  /** Route (trailing slash, matches astro trailingSlash: 'always'). */
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'The Institution', href: '/institution/' },
  { label: 'Fula Devi', href: '/fula-devi/' },
  { label: 'Our Work', href: '/our-work/' },
  { label: 'Updates', href: '/updates/' },
  { label: 'Governance', href: '/governance/' },
  { label: 'Contact', href: '/contact/' },
];
