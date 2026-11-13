import type { APIRoute } from 'astro';
import { configured, hasSession } from './panel-auth';

export const prerender = false;
export const GET: APIRoute = (context) => {
  if (hasSession(context)) return new Response(null, { status: 303, headers: { Location: '/panel', 'Cache-Control': 'no-store' } });
  const enabled = configured();
  const content = enabled ? `<form method="post" action="/api/panel/login">
    <label>Usuario <input name="user" autocomplete="username" maxlength="256" required /></label>
    <label>Contraseña <input name="password" type="password" autocomplete="current-password" maxlength="1024" required /></label>
    <button type="submit">Iniciar sesión</button>
  </form>${context.url.searchParams.has('error') ? '<p role="alert">No se pudo iniciar sesión.</p>' : ''}` : '<p>Acceso no configurado</p>';
  return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex,nofollow" /><title>Acceso privado | ClickSolutions</title><style>body{font-family:system-ui;background:#eef6fa;color:#05455c;display:grid;min-height:95vh;place-items:center}main{background:white;padding:2rem;border-radius:1rem;width:min(24rem,80vw)}form,label{display:grid;gap:.6rem}form{gap:1.2rem}input,button{font:inherit;padding:.7rem}button{background:#05455c;color:white;border:0;border-radius:.4rem}</style></head><body><main><h1>Panel privado</h1>${content}</main></body></html>`, { status: enabled ? 200 : 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
};
