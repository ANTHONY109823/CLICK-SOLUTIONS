// @ts-check
/**
 * GitHub Pages publica el sitio en una subruta (/CLICK-SOLUTIONS). Los componentes usan
 * enlaces absolutos como "/contacto"; esta integración les agrega la subruta en el HTML final.
 * Los recursos que Astro ya genera con la subruta (/_astro, imágenes) no se tocan.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} base p. ej. "/CLICK-SOLUTIONS" */
export default function githubPagesBase(base) {
  const prefix = base.replace(/\/$/, '');
  const ATTR_RE = /\b(href|src|action)="(\/(?!\/)[^"]*)"/g;

  /** @param {string} url */
  const withBase = (url) => (url === prefix || url.startsWith(`${prefix}/`) ? url : `${prefix}${url}`);

  /** @param {string} dir @returns {Promise<string[]>} */
  async function htmlFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((e) => {
        const path = join(dir, e.name);
        if (e.isDirectory()) return htmlFiles(path);
        return Promise.resolve(e.name.endsWith('.html') ? [path] : []);
      }),
    );
    return nested.flat();
  }

  return {
    name: 'github-pages-base',
    hooks: {
      /** @param {{ dir: URL, logger: { info: (msg: string) => void } }} options */
      'astro:build:done': async ({ dir, logger }) => {
        const files = await htmlFiles(fileURLToPath(dir));
        for (const file of files) {
          const html = await readFile(file, 'utf8');
          const updated = html.replace(ATTR_RE, (_, attr, url) => `${attr}="${withBase(url)}"`);
          if (updated !== html) await writeFile(file, updated);
        }
        logger.info(`Subruta ${prefix} aplicada a ${files.length} páginas.`);
      },
    },
  };
}
