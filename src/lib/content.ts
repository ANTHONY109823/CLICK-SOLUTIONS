/**
 * Capa de acceso a contenido. Las páginas leen SIEMPRE desde aquí, nunca directo de src/data.
 * Cuando exista el panel administrativo, estas funciones pasarán a consultar la API/base de datos
 * y las páginas no tendrán que cambiar.
 */
import { site } from '../config/site';
import { services, type Service, type ServiceSlug } from '../data/services';
import { projects, type Project } from '../data/projects';
import { licenses, type LicenseProduct } from '../data/licenses';
import { generalFaqs } from '../data/faqs';

const isShown = (item: { demo?: boolean }) => !item.demo || site.showDemoContent;

export function getServices(): Service[] {
  return services.map((service) => ({
    ...service,
    offerings: service.offerings.filter((offering) => offering.enabled),
  }));
}

export function getService(slug: string): Service | undefined {
  return getServices().find((service) => service.slug === slug);
}

export function getProjects(service?: ServiceSlug): Project[] {
  return projects.filter((project) => isShown(project) && (!service || project.service === service));
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

export function getLicenses(): LicenseProduct[] {
  return licenses.filter((product) => product.visible && isShown(product));
}

export function getGeneralFaqs() {
  return generalFaqs;
}
