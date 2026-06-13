// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://github.com/astrojs/astro/', // TODO: Zrobić to
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