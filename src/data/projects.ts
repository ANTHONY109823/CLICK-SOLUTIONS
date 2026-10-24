/**
 * Portafolio. Agrega aquí SOLO proyectos reales y con permiso del cliente para mostrarlos.
 * Las imágenes van en /public/images/proyectos/<slug>/.
 *
 * Los elementos con `demo: true` son ejemplos de estructura: solo se muestran en desarrollo
 * (site.showDemoContent) y siempre con la etiqueta “Demostración”.
 */
import type { ServiceSlug } from './services';

export interface Project {
  slug: string;
  title: string;
  service: ServiceSlug;
  summary: string;
  /** Párrafos de descripción. */
  description: string[];
  technologies: string[];
  /** Nombre del cliente solo si autorizó mostrarlo. */
  client?: string;
  year?: number;
  url?: string;
  cover?: { src: string; alt: string };
  images: { src: string; alt: string; caption?: string }[];
  demo?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'ejemplo-catalogo-digital',
    title: 'Ejemplo: catálogo digital para un negocio',
    service: 'desarrollo-web',
    summary: 'Proyecto de demostración que muestra cómo se verá una ficha del portafolio.',
    description: [
      'Este es contenido de demostración, no un proyecto real. Sirve para revisar el diseño de la página de detalle.',
      'Reemplázalo por un proyecto real: describe el problema del cliente, la solución y el resultado obtenido.',
    ],
    technologies: ['Astro', 'TypeScript', 'CSS'],
    images: [],
    demo: true,
  },
];
