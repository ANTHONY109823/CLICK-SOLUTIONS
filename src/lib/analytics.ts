/**
 * Medición de conversiones, preparada pero DESACTIVADA (PUBLIC_ANALYTICS_ENABLED=false).
 *
 * Los elementos marcan su evento con `data-track="nombre"` (p. ej. whatsapp_click, email_click,
 * quote_cta, form_submit). Cuando se elija una herramienta (y se agregue el aviso de cookies
 * si corresponde), basta con conectarla en `send()`. Hoy no se envía nada a ningún tercero.
 */
import { PUBLIC_ANALYTICS_ENABLED } from 'astro:env/client';

type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function send(event: string, props: EventProps) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
}

export function track(event: string, props: EventProps = {}) {
  if (!PUBLIC_ANALYTICS_ENABLED) return;
  send(event, { path: location.pathname, ...props });
}

export function initTracking() {
  document.addEventListener('click', (e) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (!target) return;
    track(target.dataset.track!, { label: target.dataset.trackLabel });
  });
}
