// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';
import path from 'node:path';
import { createRequire } from 'node:module';

const site = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://dev-utils.example.com/';

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(
    require.resolve('pdfjs-dist/package.json'),
);

const workerFile = path.join(pdfjsDistPath, 'build', 'pdf.worker.mjs')

const cMapsFiles = path.join(pdfjsDistPath, 'cmaps', '*')


// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react(), sitemap()],
  vite: {
    define: {
      'process.env.DRAGGABLE_DEBUG': 'false',
    },
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: workerFile,
            dest: '.',
            rename: { stripBase: true },
          },
          {
            src: cMapsFiles,
            dest: 'cmaps',
            rename: { stripBase: true },
          },
        ]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
