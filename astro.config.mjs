// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  markdown: {
    // Render code as plain <pre><code> so the site's own light code-block
    // styling applies, instead of Shiki's dark theme clashing with the
    // bone-white palette.
    syntaxHighlight: false,
  },
  // The /work/ section was renamed to /portfolio/. These keep old external
  // links working; Netlify serves them as real 301s (see netlify.toml).
  redirects: {
    '/work': '/portfolio',
    '/work/[category]': '/portfolio/[category]',
    '/work/[category]/[slug]': '/portfolio/[category]/[slug]',
  },
});
