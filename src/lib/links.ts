import { site } from '../config/site';

const WHATSAPP_RE = /^\d{8,15}$/;

/** Subruta de publicación sin barra final ("" en Netlify, "/CLICK-SOLUTIONS" en GitHub Pages). */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

/** URL absoluta de una ruta interna, incluyendo la subruta de publicación. */
export function absoluteUrl(path: string, siteUrl: URL): string {
  return new URL(`${BASE_PATH}${path}`, siteUrl).href;
}

/** Ruta actual sin la subruta, para comparar con los enlaces del menú. */
export function routePath(pathname: string): string {
  const path = BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  // En el build la ruta incluye el archivo (".../contacto.html", ".../index.html").
  return path.replace(/(\/index)?\.html$/, '').replace(/\/$/, '') || '/';
}

/** Enlace de WhatsApp solo si el número configurado es válido; si no, `null`. */
export function whatsappUrl(message?: string): string | null {
  const number = site.contact.whatsapp?.replace(/\D/g, '');
  if (!number || !WHATSAPP_RE.test(number)) return null;
  const text = message ?? `Hola ${site.name}, quisiera información sobre sus servicios.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(subject?: string): string | null {
  const email = site.contact.email;
  if (!email) return null;
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

export function telUrl(): string | null {
  const phone = site.contact.phone;
  if (!phone) return null;
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Redes sociales configuradas, en orden estable. */
export function socialLinks(): { network: string; label: string; url: string }[] {
  const labels: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
  };
  return Object.entries(site.social)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([network, url]) => ({ network, label: labels[network] ?? network, url }));
}
