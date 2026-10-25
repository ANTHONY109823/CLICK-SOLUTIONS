# ClickSolutions — Plan del sitio web

Fecha: 2026-10-24 · Estado: Fase 1–3 (primera versión) en curso.

## 1. Situación actual

- La carpeta del proyecto estaba **vacía**: no hay repositorio ni código previo.
- Herramientas instaladas: Node 24.15, npm 11.12, Git 2.47. No hay Python ni .NET.
- **Logo oficial** encontrado como imagen incrustada en `Descargas/Click Solutions.xlsx`
  (PNG 1386×2500, fondo transparente, versión vertical: isotipo + texto “Click solutions”).
  Se copió **sin modificar** a `public/brand/clicksolutions-logo.png`.
- Isotipo pequeño (92×100) encontrado en `Descargas/L5290/diagnosticar/codigo-fuente/logo.png`
  (de tu programa ResetEpson). Se copió **sin modificar** a `public/brand/clicksolutions-isotipo.png`.
- `Click Solutions.xlsx` contiene un registro privado de clientes y claves de licencia.
  **No se usa en la web** y nunca debe subirse al repositorio.
- No hay fotos, proyectos, textos ni datos de contacto reales disponibles todavía.

## 2. Arquitectura recomendada

**Astro 7 + TypeScript + CSS propio con variables** (opción A), desplegado en **Netlify** (plan gratuito con uso comercial permitido).

| | Astro (elegido) | React + Vite |
|---|---|---|
| Velocidad | HTML estático, casi sin JavaScript → muy rápido | Envía React al navegador en todas las páginas |
| SEO | Excelente: cada página es HTML real | Necesita SSR/prerender adicional |
| Interactividad | Solo donde hace falta (menú, formulario, buscador) | Total, pero innecesaria en un sitio comercial |
| Crecimiento | Permite rutas de servidor (API) y componentes React más adelante | Habría que sumar un framework de servidor |
| Costo | Gratis en Netlify | Igual |

- **Formulario**: ruta de servidor `/api/contacto` (función serverless de Netlify) que valida en
  el servidor y envía el correo mediante la API de **Resend**. Sin claves configuradas, el
  formulario se muestra deshabilitado con un aviso honesto: **nunca se simula el envío**.
- **Sin base de datos, sin login, sin pagos** en la v1: no son necesarios todavía.
- **Contenido centralizado** en `src/data/*` y leído a través de `src/lib/content.ts`.
- **Panel editorial preparado con Pages CMS**: `.pages.yml` permite editar datos de la empresa,
  textos de inicio e imágenes desde GitHub. Cada guardado dispara la publicación automática.
- **Fase futura transaccional**: API ASP.NET Core o funciones de servidor + PostgreSQL para
  pedidos, clientes, pagos y entrega autorizada de licencias.

Nota: se descartó Vercel porque su plan gratuito “Hobby” es solo para uso no comercial
(Pro ~20 USD/mes). Cloudflare Pages también sería válido: cambiar de plataforma solo
implica cambiar el adaptador de Astro.

## 3. Mapa del sitio

```
/                                   Inicio
/servicios                          Resumen de los 4 servicios
/servicios/drones
/servicios/desarrollo-web
/servicios/soporte-tecnico
/servicios/licencias-software       Catálogo con búsqueda y filtros
/proyectos                          Portafolio
/proyectos/[slug]                   Detalle (se genera por cada proyecto real)
/nosotros
/contacto
/preguntas-frecuentes
/ayuda
/politica-de-privacidad             Borrador (Ley 29733)
/terminos-y-condiciones             Borrador
/politica-de-cookies
/carrito                            “Próximamente”, noindex, fuera del menú
/mi-cuenta                          “Próximamente”, noindex, fuera del menú
/404                                Página de error
/api/contacto                       Endpoint del formulario (POST)
/sitemap-index.xml, /robots.txt
```

## 4. Estructura de carpetas

```
public/brand/            Logo oficial e isotipo (originales, sin tocar)
public/images/           Fotos reales (cuando las envíes)
src/config/site.ts       Datos de la empresa: contacto, redes, RUC, opciones (null = pendiente)
src/data/                services.ts · projects.ts · licenses.ts · faqs.ts
src/lib/                 content.ts (capa de datos) · contact.ts (validación) · seo.ts · analytics.ts
src/components/          layout/ · ui/ · sections/ · forms/
src/layouts/             BaseLayout.astro · LegalLayout.astro (servicios usan pages/servicios/[slug].astro)
src/pages/               Rutas del sitio + api/contacto.ts
src/styles/              tokens.css (diseño) · global.css
docs/                    PLAN.md · DEPLOY.md
```

## 5. Diseño visual y paleta

El texto del logo es azul marino sobre transparente: **sobre el fondo oscuro #0B1220 no se
lee**. Por eso el sitio usa **superficies claras donde aparece el logo** (header, footer
claro, página Nosotros) y **bandas oscuras** para el hero y las llamadas a la acción, de modo que
se conserva el carácter tecnológico de tu paleta sin alterar el logo.

| Token | Color | Uso |
|---|---|---|
| `--brand-cyan` | #00AAE7 | Del logo. Acentos, iconos, detalles (no para texto pequeño sobre blanco) |
| `--brand-navy` | #033F5C | Del logo. Botones primarios, enlaces |
| `--brand-ink` | #1B2B42 | Del logo. Títulos |
| `--bg` / `--surface` | #FFFFFF / #F5F8FB | Fondos claros |
| `--dark-bg` / `--dark-surface` | #0B1220 / #172338 | Hero y bandas oscuras (tu paleta) |
| `--border` | #E2E8F0 (claro) / #29384D (oscuro) | |
| `--text` / `--text-muted` | #0F1C2E / #4B5B70 | Contraste ≥ 4.5:1 |
| `--success` `--warning` `--danger` | #15803D #B45309 #DC2626 | Versiones accesibles sobre blanco |

Tipografía: **Inter** (variable, alojada en el propio sitio, sin Google Fonts → sin rastreo).

## 6. Primera versión (v1)

- Todas las rutas del mapa, con diseño responsive y menú móvil.
- Panel editorial basado en Git para datos comerciales, inicio e imágenes.
- Inicio orientado a conversión; 4 páginas de servicio con oferta, proceso, FAQ y formulario.
- Catálogo de licencias con búsqueda y filtros (vacío hasta cargar productos reales).
- Portafolio y galerías con estado vacío honesto hasta tener trabajos reales.
- Formulario de contacto con validación cliente + servidor, honeypot, límite de envíos y
  consentimiento. Funciona en cuanto se configuren las claves de Resend.
- Botón de WhatsApp y enlaces de correo **solo si** se configura un dato válido.
- SEO: títulos y descripciones únicos, Open Graph, sitemap, robots, JSON-LD (Organization,
  Service) solo con datos reales.
- Cabeceras de seguridad (CSP, etc.) en `netlify.toml`.
- Analítica preparada (`data-track` + `track()`), **desactivada**: no se instala ningún rastreador.

## 7. Segunda fase (no se construye ahora)

Edición estructurada de catálogo/precios/proyectos/FAQ · base de datos PostgreSQL ·
carrito y pagos (Culqi, Niubiz, Mercado Pago o Izipay) · pedidos · área de clientes ·
entrega autorizada de licencias · historial de compras · automatización de solicitudes ·
versión en inglés.

## 8. Datos que necesito de ti

Esenciales para publicar:
1. Correo de contacto donde recibir solicitudes.
2. Número de WhatsApp (formato internacional, p. ej. 51 9XX XXX XXX).
3. Dominio (¿ya tienes uno? p. ej. clicksolutions.pe).
4. Razón social / nombre del titular y RUC (para la política de privacidad y términos).
5. Ciudad o zona de atención (no publicaré una dirección sin que me la des).
6. Confirmar qué servicios ofreces realmente de cada lista (dron, web, soporte).
7. Soporte: ¿presencial, remoto o ambos?
8. Drones: ¿qué equipo usas y qué registros/autorizaciones de la DGAC tienes? (solo se
   mencionará lo que esté acreditado).
9. Licencias: ¿qué productos vendes, de qué fabricante, a qué precio y a través de qué
   distribuidor autorizado? ¿Política de devoluciones?

Deseables:
10. Versión horizontal del logo (para el header) y versión en negativo/blanco (para fondos oscuros).
11. Fotos reales: vuelos con dron, equipo, trabajos de soporte, capturas de webs hechas.
12. Proyectos reales con permiso del cliente para mostrarlos.
13. Redes sociales (Facebook, Instagram, TikTok, LinkedIn).
14. Breve historia de la marca para “Nosotros”.

## 9. Costos externos potenciales

| Concepto | Costo aproximado |
|---|---|
| Dominio `.pe` (PUNTO.pe) | ~USD 30–45/año |
| Dominio `.com` | ~USD 10–15/año |
| Hosting Netlify (plan gratuito) | Gratis (uso comercial permitido, con límites de uso) |
| Envío de correos (Resend) | Gratis hasta 3 000 correos/mes |
| Correo corporativo (Google Workspace / Zoho) | ~USD 0–7/usuario/mes |
| Fotografía profesional / bancos de imágenes | Variable |
| Pasarela de pagos (fase 2) | Comisión por transacción (~3–5 %) |
| Base de datos PostgreSQL (fase 2) | Gratis–USD 25/mes (Neon, Supabase) |

Precios orientativos; verifícalos con cada proveedor antes de contratar.

## 10. Plan de implementación

1. ✅ Auditoría de la carpeta, logo y herramientas.
2. ✅ Proyecto Astro, sistema de diseño (tokens), layout, header con menús y menú móvil, footer.
3. ✅ Inicio + 4 páginas de servicios + componentes reutilizables.
4. ✅ Resto de páginas, legales en borrador, 404, SEO, formulario con endpoint.
5. ✅ Compilación y pruebas en navegador (rutas, menú, formulario, tamaños, consola).
6. ⏳ Recibir tus datos → completar `src/config/site.ts`, fotos y catálogo.
7. ⏳ Repositorio en GitHub, despliegue, variables de entorno y dominio (`docs/DEPLOY.md`).
8. ⏳ Fase 2: panel y comercio.
