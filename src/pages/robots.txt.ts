import type { APIRoute } from 'astro';
import { BASE_PATH } from '../lib/links';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${BASE_PATH}/sitemap-index.xml`, site).href;
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${BASE_PATH}/api/`,
    `Disallow: ${BASE_PATH}/carrito`,
    `Disallow: ${BASE_PATH}/mi-cuenta`,
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
