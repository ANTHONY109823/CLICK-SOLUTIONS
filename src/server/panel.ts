import type { APIRoute } from 'astro';
import html from './panel-ui/index.html?raw';
import { hasSession } from './panel-auth';

export const prerender = false;
export const GET: APIRoute = (context) => {
  if (!hasSession(context)) return new Response(null, { status: 303, headers: { Location: '/login', 'Cache-Control': 'no-store' } });
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
};
