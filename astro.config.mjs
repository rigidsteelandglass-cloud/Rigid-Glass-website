// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Update this to the final URL once the site is live (used for SEO/sitemaps).
  site: 'https://noahs-showers.netlify.app',
  vite: {
    plugins: [tailwindcss()],
  },
});
