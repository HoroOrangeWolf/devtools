// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://dev-utils.example.com/';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react(), sitemap()],
  vite: {
    plugins: [
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
