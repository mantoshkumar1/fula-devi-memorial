// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: `site` is a PLACEHOLDER until the final domain is confirmed.
// It drives canonical URLs, the sitemap, and Open Graph absolute paths.
// Update this one value when the domain is attached (see docs/architecture.md).
const SITE_URL = 'https://fula-devi-memorial.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  // No adapter: pure static output. `dist/` is portable to any static host.
  integrations: [sitemap()],
  build: {
    // Emit `page/index.html` so trailing-slash URLs resolve cleanly everywhere.
    format: 'directory',
  },
});
