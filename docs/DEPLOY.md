# Publicación del sitio

## GitHub Pages (publicación actual)

El sitio se publica en **https://anthony109823.github.io/CLICK-SOLUTIONS/** con el workflow
`.github/workflows/deploy.yml`, que se ejecuta en cada push a `main`.

- Configuración única: en GitHub → **Settings → Pages → Build and deployment → Source**,
  elegir **GitHub Actions**.
- El build usa `DEPLOY_TARGET=github`: sitio estático en la subruta `/CLICK-SOLUTIONS`
  (la integración `integrations/github-pages-base.mjs` agrega la subruta a los enlaces).
- Limitaciones de GitHub Pages:
  - **No hay servidor**: el formulario queda deshabilitado con su aviso. Para recibir
    solicitudes por el formulario, publicar en Netlify (abajo).
  - **No permite cabeceras propias**: la CSP y demás cabeceras de `netlify.toml` no se aplican.
  - Plan gratuito: el repositorio debe ser público.
- Dominio propio en Pages: Settings → Pages → Custom domain. Al usar un dominio propio, el
  sitio queda en la raíz: cambiar `GITHUB_PAGES` en `astro.config.mjs` (site = dominio, base = '/').

Para probarlo localmente (Git Bash): `DEPLOY_TARGET=github npm run build` y luego
`DEPLOY_TARGET=github npx astro preview`.

---

# Netlify (recomendado cuando se active el formulario)

## 1. Repositorio en GitHub

```bash
git init
git add .
git commit -m "Primera versión del sitio ClickSolutions"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/clicksolutions-web.git
git push -u origin main
```

Antes de subir, confirma que no haya archivos `.env` ni hojas de cálculo (`git status`).

## 2. Netlify

1. Entra a [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → GitHub.
2. Elige el repositorio. La configuración se lee de `netlify.toml` (comando `npm run build`, carpeta `dist`).
3. En **Site configuration → Environment variables** agrega:

| Variable | Valor | Notas |
|---|---|---|
| `SITE_URL` | `https://tudominio.pe` | Sin barra final. Se usa en sitemap, canonical y Open Graph. |
| `RESEND_API_KEY` | clave de Resend | **Secreta.** Márcala como “secret”. |
| `CONTACT_TO_EMAIL` | correo que recibe solicitudes | |
| `CONTACT_FROM_EMAIL` | `ClickSolutions <web@tudominio.pe>` | Debe pertenecer a un dominio verificado en Resend. |
| `PUBLIC_CONTACT_FORM_ENABLED` | `true` | Solo cuando las tres anteriores estén configuradas. |

4. Despliega (**Deploys → Trigger deploy**).

## 3. Formulario de contacto (Resend)

1. Crea una cuenta en [resend.com](https://resend.com) (plan gratuito: 3 000 correos/mes).
2. **Domains → Add domain**: agrega tu dominio y crea en tu proveedor DNS los registros que indica (SPF/DKIM).
3. **API Keys → Create**: permiso “Sending access”. Copia la clave solo en Netlify, nunca en el código.
4. Configura las variables del paso 2 y vuelve a desplegar.
5. Prueba: envía el formulario desde el sitio publicado y confirma que el correo llega.
   Si falla, el visitante verá un mensaje de error (nunca un falso “enviado”) y en
   **Netlify → Logs → Functions** verás el código de estado devuelto por Resend.

## 4. Dominio propio

1. Compra el dominio (`.pe` en un registrador acreditado por PUNTO.pe, o `.com`).
2. En Netlify: **Domain management → Add a domain** y sigue las instrucciones:
   - Opción simple: usar los DNS de Netlify (cambias los nameservers en tu registrador).
   - Opción alternativa: registros `A`/`CNAME` que indica Netlify.
3. Netlify emite el certificado HTTPS automáticamente (Let’s Encrypt).
4. Actualiza `SITE_URL` con el dominio definitivo y vuelve a desplegar.

## 5. Lista de comprobación antes de publicar

- [ ] Datos reales en `src/config/site.ts` (correo, WhatsApp, zona, razón social, RUC).
- [ ] Ofertas de cada servicio revisadas en `src/data/services.ts` (`enabled: false` en lo que no ofreces).
- [ ] Modalidades de soporte confirmadas (`site.support`).
- [ ] Catálogo de licencias con productos reales y autorizados (o vacío).
- [ ] Políticas legales revisadas por un profesional → `legalReviewed: true`.
- [ ] Variables de entorno configuradas y formulario probado de punta a punta.
- [ ] `SITE_URL` con el dominio final; revisar `/robots.txt` y `/sitemap-index.xml`.
- [ ] Probar en un celular real: menú, formulario, botón de WhatsApp.
- [ ] Registrar el sitio en Google Search Console y enviar el sitemap.

## 6. Mantenimiento

- `npm outdated` y `npm audit` una vez al mes; actualizar dependencias y volver a compilar.
- El sitio no guarda datos personales: no requiere copias de seguridad de base de datos.
  Cuando se agregue una base de datos (fase 2), configurar copias automáticas.
