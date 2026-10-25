/**
 * Validación del formulario de contacto. Se usa en el navegador (respuesta inmediata)
 * y en el servidor (/api/contacto), que es la validación que realmente cuenta.
 */

export const serviceOptions = [
  { value: 'drones', label: 'Servicios con drones' },
  { value: 'desarrollo-web', label: 'Desarrollo web' },
  { value: 'soporte-tecnico', label: 'Soporte técnico' },
  { value: 'licencias-software', label: 'Software y licencias' },
  { value: 'otro', label: 'Otro / no estoy seguro' },
] as const;

export const budgetOptions = [
  { value: 'menos-500', label: 'Menos de S/ 500' },
  { value: '500-1500', label: 'S/ 500 – S/ 1 500' },
  { value: '1500-5000', label: 'S/ 1 500 – S/ 5 000' },
  { value: 'mas-5000', label: 'Más de S/ 5 000' },
  { value: 'no-se', label: 'Aún no lo sé' },
] as const;

export const priorityOptions = [
  { value: 'baja', label: 'Baja: puede esperar' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta: me impide trabajar' },
] as const;

export interface ContactPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  budget: string;
  category: string;
  priority: string;
  consent: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

export type ValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; errors: ContactErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{5,19}$/;

/** Convierte a texto, quita caracteres de control y espacios sobrantes, y limita el largo. */
function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

const allowed = (options: readonly { value: string }[], value: string) =>
  options.some((option) => option.value === value);

export function validateContact(input: Record<string, unknown>): ValidationResult {
  const data: ContactPayload = {
    name: clean(input.name, 100),
    company: clean(input.company, 120),
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 20),
    service: clean(input.service, 40),
    message: clean(input.message, 3000),
    budget: clean(input.budget, 20),
    category: clean(input.category, 80),
    priority: clean(input.priority, 10),
    consent: input.consent === true || input.consent === 'on' || input.consent === 'true',
  };

  const errors: ContactErrors = {};
  if (data.name.length < 2) errors.name = 'Escribe tu nombre.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Escribe un correo electrónico válido.';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'Escribe un teléfono válido o deja el campo vacío.';
  if (!allowed(serviceOptions, data.service)) errors.service = 'Elige el servicio que te interesa.';
  if (data.message.length < 10) errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres).';
  if (data.budget && !allowed(budgetOptions, data.budget)) errors.budget = 'Elige una opción de la lista.';
  if (data.priority && !allowed(priorityOptions, data.priority)) errors.priority = 'Elige una opción de la lista.';
  if (!data.consent) errors.consent = 'Necesitamos tu autorización para responder tu solicitud.';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function labelFor(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
