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
    solicitudes por el formulario, usar Railway (abajo).
  - **No ejecuta el middleware del servidor**: las cabeceras de seguridad se aplican en Railway.
  - Plan gratuito: el repositorio debe ser público.
- Dominio propio en Pages: Settings → Pages → Custom domain. Al usar un dominio propio, el
  sitio queda en la raíz: cambiar `GITHUB_PAGES` en `astro.config.mjs` (site = dominio, base = '/').

Para probarlo localmente (Git Bash): `DEPLOY_TARGET=github npm run build` y luego
`DEPLOY_TARGET=github npx astro preview`.

---

# Railway (servidor principal)

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

## 2. Railway

1. Ejecuta `railway login` y autoriza tu cuenta.
2. Crea y vincula el proyecto con `railway init --name clicksolutions`.
3. Despliega con `railway up`. Railway usa `railway.json`, ejecuta `npm run build` y luego `npm run start`.
4. En **Service → Variables** agrega:

| Variable | Valor | Notas |
|---|---|---|
| `SITE_URL` | `https://tudominio.pe` | Sin barra final. Se usa en sitemap, canonical y Open Graph. |
| `RESEND_API_KEY` | clave de Resend | **Secreta.** Márcala como “secret”. |
| `CONTACT_TO_EMAIL` | correo que recibe solicitudes | |
| `CONTACT_FROM_EMAIL` | `ClickSolutions <web@tudominio.pe>` | Debe pertenecer a un dominio verificado en Resend. |
| `PUBLIC_CONTACT_FORM_ENABLED` | `true` | Solo cuando las tres anteriores estén configuradas. |

5. Genera una URL pública con `railway domain`.

## 3. Formulario de contacto (Resend)

1. Crea una cuenta en [resend.com](https://resend.com) (plan gratuito: 3 000 correos/mes).
2. **Domains → Add domain**: agrega tu dominio y crea en tu proveedor DNS los registros que indica (SPF/DKIM).
3. **API Keys → Create**: permiso “Sending access”. Copia la clave solo en Railway, nunca en el código.
4. Configura las variables del paso 2 y vuelve a desplegar.
5. Prueba: envía el formulario desde el sitio publicado y confirma que el correo llega.
   Si falla, el visitante verá un mensaje de error (nunca un falso “enviado”) y en
   `railway logs` mostrará el código de estado devuelto por Resend.

## 4. Dominio propio

1. Compra el dominio (`.pe` en un registrador acreditado por PUNTO.pe, o `.com`).
2. En Railway: **Settings → Networking → Custom Domain** y sigue las instrucciones DNS.
3. Railway emite el certificado HTTPS automáticamente.
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

## Panel de administración en Railway

Abre /login en el mismo dominio para acceder a /panel. En Railway configura
ADMIN_USER, ADMIN_PASSWORD y ADMIN_SESSION_SECRET (secreto aleatorio largo, por ejemplo
32 bytes generados con un gestor de contraseñas), además de SITE_URL con el origen
HTTPS real y NODE_ENV=production. No publiques estas credenciales. Las sesiones
duran ocho horas; cambiar el secreto invalida todas las sesiones.

En GitHub: Settings > Developer settings > Personal access tokens > Fine-grained
tokens > Generate new token. Selecciona el propietario, una expiración y
Only select repositories: únicamente CLICK-SOLUTIONS. En Repository permissions
concede Contents: Read and write (sin permisos adicionales). Si la organización
requiere aprobación, espera a que apruebe el token.
[Documentación de GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

Guarda el token como GITHUB_TOKEN en Railway. GITHUB_REPO es opcional
(predeterminado: ANTHONY109823/CLICK-SOLUTIONS) y GITHUB_BRANCH también
(predeterminado: main). La rama debe permitir commits del propietario del token.
Cada acción guarda todos sus archivos en un solo commit mediante Git Data; no se
guarda en el disco efímero. Conecta Railway a esa rama y habilita el despliegue
automático: el sitio reflejará los cambios al terminar el redespliegue. Si falta
el token, el panel permite consultar los datos compilados pero guardar devuelve 503.

El límite de login es cinco intentos por IP cada quince minutos por proceso;
se reinicia al redesplegar. En Railway se usa X-Real-IP del proxy HTTP público
([cabeceras de Railway](https://docs.railway.com/networking/public-networking/specs-and-limits));
no expongas directamente el puerto del contenedor a Internet.
Las rutas privadas no existen en el build de GitHub Pages. El panel local
sigue disponible con npm run admin.
