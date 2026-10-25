export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** Enlaces del menú principal (los servicios se generan desde src/data/services.ts). */
export const mainNav: NavLink[] = [
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Ayuda', href: '/ayuda' },
];

export const companyNav: NavLink[] = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Contacto', href: '/contacto' },
];

export const helpNav: NavLink[] = [
  { label: 'Centro de ayuda', href: '/ayuda' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
  { label: 'Solicitar cotización', href: '/contacto' },
];

export const legalNav: NavLink[] = [
  { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
  { label: 'Política de cookies', href: '/politica-de-cookies' },
];
