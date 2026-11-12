interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const legalNav: NavLink[] = [
  { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
  { label: 'Política de cookies', href: '/politica-de-cookies' },
];
