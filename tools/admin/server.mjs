import { createServer } from 'node:http';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const host = '127.0.0.1';
const port = Number(process.env.CLICKSOLUTIONS_ADMIN_PORT || 4323);
const portfolioPath = join(root, 'src', 'data', 'web-projects.json');
const portfolioImages = join(root, 'public', 'images', 'proyectos-web');

const json = (response, status, value) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
};

const readBody = async (request, maxBytes = 12_000_000) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('La imagen supera el límite permitido de 8 MB.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const slugify = (value) => String(value || 'proyecto')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56) || 'proyecto';

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
      const [business, quote, portfolio] = await Promise.all([
        readFile(join(root, 'src', 'data', 'business.json'), 'utf8'),
        readFile(join(root, 'src', 'data', 'drone-quote.json'), 'utf8'),
        readFile(portfolioPath, 'utf8'),
      ]);
      json(response, 200, { business: JSON.parse(business), quote: JSON.parse(quote), portfolio: JSON.parse(portfolio) });
      return;
    }

    if (url.pathname === '/api/web-projects' && request.method === 'POST') {
      const body = await readBody(request);
      const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(String(body.image || ''));
      if (!match) return json(response, 400, { error: 'Selecciona una imagen JPG, PNG o WebP.' });
      if (!String(body.title || '').trim()) return json(response, 400, { error: 'Escribe el nombre del proyecto.' });

      const portfolio = JSON.parse(await readFile(portfolioPath, 'utf8'));
      const id = `${slugify(body.title)}-${Date.now().toString(36)}`;
      const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
      const imageBytes = Buffer.from(match[2], 'base64');
      if (imageBytes.length > 8_000_000) return json(response, 413, { error: 'La imagen supera el límite de 8 MB.' });

      await mkdir(portfolioImages, { recursive: true });
      await writeFile(join(portfolioImages, `${id}.${extension}`), imageBytes);
      const project = {
        id,
        title: String(body.title).trim(),
        category: String(body.category || 'Desarrollo web').trim(),
        image: `/images/proyectos-web/${id}.${extension}`,
        alt: String(body.alt || `Vista del proyecto ${body.title}`).trim(),
        visible: true,
      };
      portfolio.projects.unshift(project);
      await writeFile(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`, 'utf8');
      json(response, 201, { project, portfolio });
      return;
    }

    if (url.pathname.startsWith('/api/web-projects/') && request.method === 'DELETE') {
      const id = decodeURIComponent(url.pathname.slice('/api/web-projects/'.length));
      const portfolio = JSON.parse(await readFile(portfolioPath, 'utf8'));
      const project = portfolio.projects.find((item) => item.id === id);
      if (!project) return json(response, 404, { error: 'Proyecto no encontrado.' });
      portfolio.projects = portfolio.projects.filter((item) => item.id !== id);
      await writeFile(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`, 'utf8');
      if (String(project.image).startsWith('/images/proyectos-web/')) {
        await unlink(join(root, 'public', project.image)).catch(() => {});
      }
      json(response, 200, { portfolio });
      return;
    }

    if (request.method === 'GET' && (url.pathname.startsWith('/images/proyectos-web/') || url.pathname.startsWith('/images/hero/'))) {
      const imagePath = join(root, 'public', ...url.pathname.split('/').filter(Boolean));
      const extension = imagePath.split('.').pop()?.toLowerCase();
      const contentType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
      const body = await readFile(imagePath);
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(body);
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
