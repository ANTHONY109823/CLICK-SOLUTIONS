/**
 * Catálogo de licencias de software.
 *
 * Reglas:
 * - Solo productos que puedas distribuir legítimamente (con derechos del fabricante o distribuidor).
 * - NUNCA pongas claves, seriales ni credenciales en este archivo: todo lo que está aquí es público.
 * - `price: null` muestra “Precio a consultar”.
 * - `visible: false` oculta un producto sin borrarlo.
 * - `demo: true` = ejemplo de estructura; solo se ve en desarrollo y con etiqueta “Demostración”.
 */

export type Availability = 'disponible' | 'bajo-pedido' | 'agotado';

export interface LicenseProduct {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  description: string;
  edition: string;
  platforms: string[];
  licenseType: string;
  duration: string;
  /** Número de dispositivos permitidos; null si no aplica. */
  devices: number | null;
  price: { amount: number; currency: 'PEN' | 'USD' } | null;
  availability: Availability;
  terms: string;
  refundPolicy: string;
  /** Imagen oficial autorizada por el fabricante (opcional). */
  image?: { src: string; alt: string };
  visible: boolean;
  demo?: boolean;
}

export const availabilityLabels: Record<Availability, string> = {
  disponible: 'Disponible',
  'bajo-pedido': 'Bajo pedido',
  agotado: 'No disponible',
};

export const licenses: LicenseProduct[] = [
  {
    id: 'demo-antivirus',
    name: 'Producto de ejemplo: antivirus',
    manufacturer: 'Fabricante de ejemplo',
    category: 'Seguridad',
    description: 'Ficha de demostración para revisar el diseño del catálogo. No es un producto real.',
    edition: 'Edición de ejemplo',
    platforms: ['Windows', 'macOS'],
    licenseType: 'Suscripción',
    duration: '12 meses',
    devices: 1,
    price: null,
    availability: 'bajo-pedido',
    terms: 'Condiciones de uso del fabricante (ejemplo).',
    refundPolicy: 'Política de devoluciones aplicable (ejemplo).',
    visible: true,
    demo: true,
  },
  {
    id: 'demo-ofimatica',
    name: 'Producto de ejemplo: suite de oficina',
    manufacturer: 'Otro fabricante de ejemplo',
    category: 'Productividad',
    description: 'Ficha de demostración para probar la búsqueda y los filtros. No es un producto real.',
    edition: 'Hogar (ejemplo)',
    platforms: ['Windows'],
    licenseType: 'Perpetua',
    duration: 'Sin vencimiento',
    devices: 1,
    price: null,
    availability: 'disponible',
    terms: 'Condiciones de uso del fabricante (ejemplo).',
    refundPolicy: 'Política de devoluciones aplicable (ejemplo).',
    visible: true,
    demo: true,
  },
];
