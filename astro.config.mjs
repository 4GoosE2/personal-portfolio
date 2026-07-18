// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The /work/ section was renamed to /portfolio/. These keep old external
  // links working; Netlify serves them as real 301s (see netlify.toml).
  redirects: {
    '/work': '/portfolio/valuation-financial-modeling',
    '/work/[category]': '/portfolio/[category]',
    '/work/[category]/[slug]': '/portfolio/[category]/[slug]',
  },
});
