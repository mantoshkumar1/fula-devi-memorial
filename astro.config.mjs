// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { validateI18nFoundation } from './src/i18n/validate.ts';
import { publicationOutputGuard } from './src/i18n/output-guard.ts';

// Validate the Version 1.1 localization declarations whenever Astro loads the
// project. This does not enable i18n routing or create Hindi pages.
validateI18nFoundation();

// The production domain. It drives canonical URLs, the sitemap, and Open Graph
// absolute paths — change it here and everything else follows.
// www.fuladevi.org permanently redirects to the apex domain.
const SITE_URL = 'https://fuladevi.org';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  // No adapter: pure static output. `dist/` is portable to any static host.
  integrations: [sitemap(), publicationOutputGuard()],
  build: {
    // Emit `page/index.html` so trailing-slash URLs resolve cleanly everywhere.
    format: 'directory',
  },
});
