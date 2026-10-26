import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const host = '127.0.0.1';
const port = Number(process.env.CLICKSOLUTIONS_ADMIN_PORT || 4323);

const files = new Map([
  ['/', [join(here, 'index.html'), 'text/html; charset=utf-8']],
  ['/styles.css', [join(here, 'styles.css'), 'text/css; charset=utf-8']],
  ['/app.js', [join(here, 'app.js'), 'text/javascript; charset=utf-8']],
  ['/vendor/jspdf.umd.min.js', [join(root, 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js'), 'text/javascript; charset=utf-8']],
  ['/brand/clicksolutions-logo.png', [join(root, 'public', 'brand', 'clicksolutions-logo.png'), 'image/png']],
  ['/brand/clicksolutions-isotipo.png', [join(root, 'public', 'brand', 'clicksolutions-isotipo.png'), 'image/png']],
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${host}:${port}`);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');

    if (url.pathname === '/api/config') {
      const [business, quote] = await Promise.all([
        readFile(join(root, 'src', 'data', 'business.json'), 'utf8'),
        readFile(join(root, 'src', 'data', 'drone-quote.json'), 'utf8'),
      ]);
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ business: JSON.parse(business), quote: JSON.parse(quote) }));
      return;
    }

    const target = files.get(url.pathname);
    if (!target) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('No encontrado');
      return;
    }

    const [path, contentType] = target;
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`No se pudo cargar el portal: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.listen(port, host, () => {
  console.log(`Portal privado ClickSolutions: http://${host}:${port}`);
  console.log('Solo es accesible desde esta computadora. Presiona Ctrl+C para cerrarlo.');
});
