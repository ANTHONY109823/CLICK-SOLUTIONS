// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import githubPagesBase from './integrations/github-pages-base.mjs';

/**
 * Dos destinos de publicación:
 * - Railway (por defecto): servidor Node + endpoint /api/contacto.
 * - GitHub Pages (DEPLOY_TARGET=github): solo archivos estáticos en una subruta;
 *   sin servidor, así que el formulario queda deshabilitado con su aviso.
 */
const isGithubPages = process.env.DEPLOY_TARGET === 'github';
const GITHUB_PAGES = { site: 'https://anthony109823.github.io', base: '/CLICK-SOLUTIONS' };

// Dominio provisional hasta que se configure SITE_URL (ver .env.example).
const SITE_URL = process.env.SITE_URL || 'https://clicksolutions.example';

// Páginas reservadas para funciones futuras: no se indexan.
const NOT_INDEXED = /\/(carrito|mi-cuenta)\/?$/;

/** Registra el endpoint del formulario solo cuando hay servidor. */
const contactApi = {
  name: 'contact-api',
  hooks: {
    /** @param {{ injectRoute: (route: { pattern: string, entrypoint: string }) => void }} options */
    'astro:config:setup': ({ injectRoute }) => {
      injectRoute({ pattern: '/api/contacto', entrypoint: './src/server/contacto.ts' });
    },
  },
};

export default defineConfig({
  site: isGithubPages ? GITHUB_PAGES.site : SITE_URL,
  base: isGithubPages ? GITHUB_PAGES.base : undefined,
  output: isGithubPages ? 'static' : 'server',
  adapter: isGithubPages ? undefined : node({ mode: 'standalone' }),
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !NOT_INDEXED.test(page) }),
    isGithubPages ? githubPagesBase(GITHUB_PAGES.base) : contactApi,
  ],
  env: {
    schema: {
      PUBLIC_CONTACT_FORM_ENABLED: envField.boolean({ context: 'client', access: 'public', default: false }),
      PUBLIC_ANALYTICS_ENABLED: envField.boolean({ context: 'client', access: 'public', default: false }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    // Scripts siempre como archivos externos: permite una CSP estricta (script-src 'self').
    build: { assetsInlineLimit: 0 },
  },
});
