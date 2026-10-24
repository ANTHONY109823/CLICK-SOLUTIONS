/**
 * POST /api/contacto — recibe el formulario, lo valida en el servidor y lo envía por correo (Resend).
 * No guarda datos personales: solo los reenvía al correo configurado.
 */
import type { APIRoute } from 'astro';
import { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } from 'astro:env/server';
import { validateContact, labelFor, serviceOptions, budgetOptions, priorityOptions, type ContactPayload } from '../lib/contact';

export const prerender = false;

const MAX_BODY_BYTES = 16_000;
const MIN_FILL_MS = 3_000; // un humano tarda más que esto en completar el formulario
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

// Límite por IP en memoria. Es una protección básica: cada instancia serverless tiene su propia
// memoria. Para tráfico alto, usar un almacén compartido (p. ej. Netlify Blobs o Upstash).
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim();

function buildEmail(data: ContactPayload) {
  const rows: [string, string][] = [
    ['Nombre', data.name],
    ['Empresa', data.company],
    ['Correo', data.email],
    ['Teléfono', data.phone],
    ['Servicio', labelFor(serviceOptions, data.service)],
    ['Categoría', data.category],
    ['Prioridad', data.priority && labelFor(priorityOptions, data.priority)],
    ['Presupuesto', data.budget && labelFor(budgetOptions, data.budget)],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', 'Mensaje:', data.message].join('\n');
  const html = `
    <h2 style="font-family:sans-serif">Nueva solicitud desde la web</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#4b5b70">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
    </table>
    <p style="font-family:sans-serif;color:#4b5b70;margin-top:16px">Mensaje:</p>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(data.message)}</p>`;

  return {
    subject: oneLine(`Nueva solicitud: ${labelFor(serviceOptions, data.service)} — ${data.name}`).slice(0, 200),
    text,
    html,
  };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return json(503, { ok: false, message: 'El envío en línea aún no está habilitado. Contáctanos por otro medio.' });
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, message: 'Formato de solicitud no válido.' });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: 'El mensaje es demasiado largo.' });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, message: 'Solicitud no válida.' });
  }

  // Anti-spam: campo trampa lleno o envío demasiado rápido → se responde "ok" sin enviar nada.
  const startedAt = Number(body.ts);
  if (body.website || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  if (rateLimited(clientAddress ?? 'unknown')) {
    return json(429, { ok: false, message: 'Recibimos varias solicitudes seguidas. Inténtalo de nuevo en unos minutos.' });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return json(422, { ok: false, errors: result.errors, message: 'Revisa los campos marcados.' });
  }

  const email = buildEmail(result.data);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: result.data.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    if (!res.ok) {
      // Se registra solo el código de estado: nunca datos personales ni la clave.
      console.error(`[contacto] Resend respondió ${res.status}`);
      return json(502, { ok: false, message: 'No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos.' });
    }
  } catch {
    console.error('[contacto] Error de red al contactar Resend');
    return json(502, { ok: false, message: 'No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos.' });
  }

  return json(200, { ok: true });
};
