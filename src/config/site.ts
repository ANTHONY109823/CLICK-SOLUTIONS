/**
 * Datos comerciales de ClickSolutions.
 *
 * Todo valor `null` está PENDIENTE: el sitio oculta automáticamente lo que no está
 * configurado (no se inventa teléfono, dirección, RUC ni redes). Completa estos datos
 * y el sitio los mostrará en header, footer, contacto, datos estructurados, etc.
 */
import { PUBLIC_CONTACT_FORM_ENABLED, PUBLIC_ANALYTICS_ENABLED } from 'astro:env/client';

export const site = {
  name: 'ClickSolutions',
  /** Razón social o nombre del titular (políticas legales). PENDIENTE */
  legalName: null as string | null,
  /** RUC (11 dígitos). PENDIENTE */
  ruc: null as string | null,
  locale: 'es-PE',
  country: 'Perú',
  description:
    'Servicios con drones, desarrollo web, soporte técnico y licencias de software para personas y empresas en Perú.',

  contact: {
    /** Correo público de contacto. PENDIENTE */
    email: null as string | null,
    /** Teléfono en formato internacional, p. ej. "+51 987 654 321". PENDIENTE */
    phone: null as string | null,
    /** WhatsApp: solo dígitos con código de país, p. ej. "51987654321". PENDIENTE */
    whatsapp: null as string | null,
    /** Ciudad o zona de atención, p. ej. "Lima, Perú". PENDIENTE */
    area: null as string | null,
    /** Dirección física (solo si deseas publicarla). PENDIENTE */
    address: null as string | null,
    /** Horario de atención, p. ej. "Lunes a sábado, 9:00–18:00". PENDIENTE */
    hours: null as string | null,
  },

  /** URLs completas de redes sociales. PENDIENTE */
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    tiktok: null as string | null,
    linkedin: null as string | null,
    youtube: null as string | null,
  },

  /** Soporte técnico: modalidades de atención. PENDIENTE DE CONFIRMAR */
  support: {
    onsite: true,
    remote: false,
  },

  /** Funciones que aún no existen: mientras estén en false no se muestran como operativas. */
  features: {
    cart: false,
    account: false,
    onlinePayments: false,
  },

  /** Las políticas legales son borradores hasta que un profesional las revise. */
  legalReviewed: false,

  /** Formulario: se activa con PUBLIC_CONTACT_FORM_ENABLED=true cuando Resend esté configurado. */
  contactFormEnabled: PUBLIC_CONTACT_FORM_ENABLED,
  analyticsEnabled: PUBLIC_ANALYTICS_ENABLED,

  /** Contenido de demostración (marcado como tal): solo en desarrollo, nunca en producción. */
  showDemoContent: import.meta.env.DEV,
};

export type SocialNetwork = keyof typeof site.social;

/** Lista de datos pendientes, mostrada como aviso solo en desarrollo. */
export function getMissingData(): string[] {
  const missing: string[] = [];
  if (!site.contact.email) missing.push('correo');
  if (!site.contact.whatsapp) missing.push('WhatsApp');
  if (!site.contact.phone) missing.push('teléfono');
  if (!site.contact.area) missing.push('zona de atención');
  if (!site.legalName || !site.ruc) missing.push('razón social y RUC');
  if (!Object.values(site.social).some(Boolean)) missing.push('redes sociales');
  if (!site.contactFormEnabled) missing.push('envío del formulario (Resend)');
  return missing;
}
