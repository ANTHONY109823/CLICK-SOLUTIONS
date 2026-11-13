import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { APIContext } from 'astro';

const COOKIE = 'click_admin';
const TTL = 8 * 60 * 60;
export const configured = () => Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
const equal = (a: string, b: string) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
export const credentialsMatch = (user: string, password: string) => {
  const userOK = equal(user, process.env.ADMIN_USER || '');
  const passwordOK = equal(password, process.env.ADMIN_PASSWORD || '');
  return userOK && passwordOK;
};
const sign = (value: string) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('base64url');
const options = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: TTL });
export function setSession(context: APIContext) {
  const payload = `${Math.floor(Date.now() / 1000) + TTL}.${randomBytes(24).toString('base64url')}`;
  context.cookies.set(COOKIE, `${payload}.${sign(payload)}`, options());
}
export function clearSession(context: APIContext) {
  context.cookies.set(COOKIE, '', { ...options(), maxAge: 0 });
}
export function hasSession(context: APIContext) {
  if (!configured()) return false;
  const token = context.cookies.get(COOKIE)?.value || '';
  if (token.length > 256) return false;
  const [expires, nonce, signature, extra] = token.split('.');
  const now = Math.floor(Date.now() / 1000);
  if (!expires || !nonce || !signature || extra || !/^\d+$/.test(expires)) return false;
  return Number(expires) > now && Number(expires) <= now + TTL && equal(signature, sign(`${expires}.${nonce}`));
}
export function sameOrigin(context: APIContext) {
  const origin = context.request.headers.get('origin');
  const expected = new URL(process.env.SITE_URL || context.request.url).origin;
  if (context.request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (origin) return origin === expected;
  // Browsers omit Origin on same-origin GETs. Mutations always require it.
  return ['GET', 'HEAD'].includes(context.request.method);
}
const attempts = new Map<string, { count: number; until: number }>();
export function allowLogin(context: APIContext) {
  const now = Date.now();
  for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
  // Only trust this header behind Railway's public HTTP edge, which supplies it.
  const forwarded = process.env.RAILWAY_ENVIRONMENT_ID ? context.request.headers.get('x-real-ip')?.trim() : undefined;
  const ip = forwarded && isIP(forwarded) ? forwarded : context.clientAddress;
  const entry = attempts.get(ip) || { count: 0, until: now + 15 * 60_000 };
  if (entry.count >= 5 || (!attempts.has(ip) && attempts.size >= 10000)) return false;
  entry.count++;
  attempts.set(ip, entry);
  return true;
}
export function reply(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
export const unavailable = () => reply({ error: 'Acceso no configurado' }, 503);
export class PanelError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get('content-length')) > limit) throw new PanelError(413, 'El archivo supera el límite permitido.');
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) { await reader.cancel(); throw new PanelError(413, 'El archivo supera el límite permitido.'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  return Buffer.concat(chunks);
}
