import { site } from '../config/site';
import { socialLinks, absoluteUrl } from './links';

/** Datos estructurados de la organización: solo incluye lo que está configurado. */
export function organizationSchema(siteUrl: URL) {
  const sameAs = socialLinks().map((link) => link.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: absoluteUrl('/', siteUrl),
    logo: absoluteUrl('/brand/clicksolutions-logo.png', siteUrl),
    description: site.description,
    ...(site.legalName && { legalName: site.legalName }),
    ...(site.contact.email && { email: site.contact.email }),
    ...(site.contact.phone && { telephone: site.contact.phone }),
    ...(sameAs.length && { sameAs }),
    areaServed: { '@type': 'Country', name: site.country },
  };
}

export function serviceSchema(siteUrl: URL, service: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path, siteUrl),
    provider: { '@type': 'Organization', name: site.name, url: absoluteUrl('/', siteUrl) },
    areaServed: { '@type': 'Country', name: site.country },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(siteUrl: URL, items: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href, siteUrl),
    })),
  };
}
