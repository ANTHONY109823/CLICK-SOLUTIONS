# ClickSolutions — sitio web

Sitio comercial de ClickSolutions: drones, desarrollo web, soporte técnico y licencias de software.
Construido con [Astro](https://astro.build) + TypeScript, desplegable en Netlify.

- Plan, arquitectura y datos pendientes: [docs/PLAN.md](docs/PLAN.md)
- Publicación, variables de entorno y dominio: [docs/DEPLOY.md](docs/DEPLOY.md)

## Requisitos

Node.js 22.23 o superior (probado con Node 24).

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor local en http://localhost:4321
npm run build      # verificación de tipos + compilación de producción en dist/
```

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Correo, WhatsApp, teléfono, zona, RUC, redes, modalidades de soporte | `src/config/site.ts` |
| Textos, ofertas (activar/desactivar), procesos y FAQ de los 4 servicios | `src/data/services.ts` |
| Proyectos del portafolio | `src/data/projects.ts` |
| Catálogo de licencias | `src/data/licenses.ts` |
| Preguntas frecuentes generales | `src/data/faqs.ts` |
| Menús | `src/data/navigation.ts` |
| Colores, tipografía, espacios | `src/styles/tokens.css` |
| Fotos reales | `public/images/` |

Todo dato `null` en `src/config/site.ts` está pendiente y se oculta automáticamente.
En `npm run dev` aparece una barra amarilla con la lista de datos que faltan (no se ve en producción).

## Reglas del proyecto

- El logo oficial (`src/assets/brand/`, `public/brand/`) no se edita ni se reemplaza.
- No se inventan clientes, proyectos, testimonios, cifras ni certificaciones.
- El contenido marcado `demo: true` solo se ve en desarrollo y con la etiqueta “Demostración”.
- Nunca poner claves de licencia, contraseñas ni API keys en el código: todo lo de `src/` es público.
- No subir hojas de cálculo con datos de clientes (están excluidas en `.gitignore`).
