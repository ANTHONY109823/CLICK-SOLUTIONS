# Portal de gestión de ClickSolutions

## Abrir el cotizador privado

Desde la carpeta del proyecto:

```powershell
npm run admin
```

Luego abre `http://127.0.0.1:4323/`.

El servidor escucha únicamente en `127.0.0.1`: no queda publicado en internet ni acepta
conexiones desde otros equipos. Los borradores se guardan en el almacenamiento local del
navegador. Los datos de clientes no se escriben en el repositorio.

## Flujo para crear una cotización

1. Completa los datos del documento, cliente y proyecto.
2. Elige Servicio estándar, Video Express o Video corporativo.
3. Agrega servicios adicionales, movilidad o descuento cuando corresponda.
4. Revisa el total y el adelanto en la vista previa.
5. Pulsa **Generar y descargar PDF**.

El PDF se genera en la computadora, en formato A4 y con dos páginas. Incluye alcance,
partidas, inversión total, adelanto, datos del proyecto, términos y contacto comercial.

## Sincronización de precios

La página pública de Drones y el cotizador leen `src/data/drone-quote.json`. Modificar ese
archivo actualiza ambos después de compilar/publicar el sitio.

Para editarlo desde formularios, entra a `https://app.pagescms.org/`, autoriza el repositorio
`CLICK-SOLUTIONS` y abre **Tarifas y cotizaciones de drones**. Pages CMS guarda el cambio en
GitHub y el flujo de GitHub Pages vuelve a publicar la web.

## Límites actuales

- Pages CMS requiere una autorización inicial del propietario en GitHub.
- El cotizador es local y no incluye usuarios, contraseñas ni historial compartido.
- Un portal en línea privado con historial central requiere autenticación y base de datos;
  esa es una fase posterior y no debe publicarse como una página estática sin protección.
