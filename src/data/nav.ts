import type { StaticRouteKey } from '../i18n/routes.ts';

/**
 * Locale-independent navigation order. Labels belong to each locale's shared
 * UI module; destinations are resolved from the typed route map.
 */
export const PRIMARY_NAV_ROUTE_KEYS = [
  'home',
  'institution',
  'fulaDevi',
  'ourWork',
  'updates',
  'governance',
  'contact',
] as const satisfies readonly StaticRouteKey[];
