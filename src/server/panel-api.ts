import type { APIRoute } from 'astro';
import app from './panel-ui/app.js?raw';
import proposal from './panel-ui/proposal.js?raw';
import styles from './panel-ui/styles.css?raw';
import vendor from 'jspdf/dist/jspdf.umd.min.js?raw';
import { allowLogin, clearSession, configured, credentialsMatch, hasSession, PanelError, readBody, reply, sameOrigin, setSession, unavailable } from './panel-auth';
import { GithubStore, githubConfigured, PORTFOLIO, SOFTWARE } from './panel-github';
import { attachImages, dataPath, documents, imageFolders, knownDocument, templates, validate, type Json } from './panel-data';

export const prerender = false;
const saved = 'Guardado en GitHub. El sitio se actualizará cuando termine el redespliegue.';
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56) || 'proyecto';
function image(value: unknown) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(String(value || ''));
  if (!match) throw new PanelError(400, 'Selecciona una imagen JPG, PNG o WebP.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 8_000_000) throw new PanelError(413, 'La imagen supera el límite de 8 MB.');
  if (!bytes.length) throw new PanelError(400, 'El archivo está vacío.');
  return { bytes, extension: match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1] };
}
async function bodyJSON(request: Request, limit = 12_000_000) {
  try { return JSON.parse((await readBody(request, limit)).toString('utf8')); }
  catch (error) { if (error instanceof PanelError) throw error; throw new PanelError(400, 'Solicitud no válida.'); }
}
export const ALL: APIRoute = async (context) => {
  const { request } = context;
  const path = context.params.path || '';
  const redirect = (target: string) => new Response(null, { status: 303, headers: { Location: target, 'Cache-Control': 'no-store' } });
  try {
    if (!configured()) return unavailable();
    if (path === 'login') {
      if (request.method !== 'POST') return reply({ error: 'Método no permitido.' }, 405);
      if (!sameOrigin(context)) return reply({ error: 'Solicitud no permitida.' }, 403);
      if (!allowLogin(context)) return reply({ error: 'No se pudo iniciar sesión. Inténtalo más tarde.' }, 429);
      const raw = (await readBody(request, 4096)).toString('utf8');
      let user: unknown, password: unknown;
      try {
        if (request.headers.get('content-type')?.includes('application/json')) {
          ({ user, password } = JSON.parse(raw));
        } else {
          const form = new URLSearchParams(raw);
          user = form.get('user'); password = form.get('password');
        }
      } catch { return reply({ error: 'No se pudo iniciar sesión.' }, 401); }
      if (!credentialsMatch(String(user || ''), String(password || ''))) {
        if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) return redirect('/login?error=1');
        return reply({ error: 'No se pudo iniciar sesión.' }, 401);
      }
      setSession(context);
      return redirect('/panel');
    }
    if (!hasSession(context)) return reply({ error: 'Sesión no válida.' }, 401);
    if (!sameOrigin(context)) return reply({ error: 'Solicitud no permitida.' }, 403);
    if (path === 'logout' && request.method === 'POST') {
      clearSession(context);
      return redirect('/login');
    }
    if (request.method === 'GET' && path.startsWith('assets/')) {
      const assets: Record<string, [string, string]> = { 'assets/app.js': [app, 'text/javascript'], 'assets/proposal.js': [proposal, 'text/javascript'], 'assets/styles.css': [styles, 'text/css'], 'assets/jspdf.js': [vendor, 'text/javascript'] };
      const asset = assets[path];
      return asset ? new Response(asset[0], { headers: { 'Content-Type': `${asset[1]}; charset=utf-8`, 'Cache-Control': 'no-store' } }) : reply({ error: 'No encontrado.' }, 404);
    }
    if (path === 'status' && request.method === 'GET') {
      const head = githubConfigured() ? await new GithubStore().head() : null;
      return reply({ syncConfigured: githubConfigured(), lastCommit: head ? { sha: head.sha, message: head.message, date: head.date } : null });
    }
    if (path === "config" && request.method === "GET") {
      const store = githubConfigured() ? new GithubStore() : null;
      const head = store ? await store.head() : null;
      const entries = await Promise.all(
        Object.entries(documents).map(async ([name, fallback]) => {
          const data =
            store && head
              ? await store.json(dataPath(name), head.sha)
              : fallback;
          return [
            name,
            { data, templates: { ...templates(fallback), ...templates(data) } },
          ] as const;
        }),
      );
      const sections = Object.fromEntries(entries);
      return reply({
        business: sections.business!.data,
        quote: sections["drone-quote"]!.data,
        portfolio: sections["web-projects"]!.data,
        software: sections["click-software"]!.data,
        documents: sections,
        imageFolders,
        syncConfigured: githubConfigured(),
        lastCommit: head
          ? { sha: head.sha, message: head.message, date: head.date }
          : null,
      });
    }
    if (path.startsWith("data/")) {
      const name = path.slice("data/".length);
      if (!knownDocument(name))
        return reply({ error: "Apartado no permitido." }, 404);
      if (!["GET", "PUT"].includes(request.method))
        return reply({ error: "Método no permitido." }, 405);
      const store = githubConfigured() ? new GithubStore() : null;
      const head = store ? await store.head() : null;
      const current =
        store && head
          ? await store.json(dataPath(name), head.sha)
          : documents[name]!;
      if (request.method === "GET")
        return reply({
          name,
          data: current,
          templates: { ...templates(documents[name]!), ...templates(current) },
          imageFolders,
        });
      const body = await bodyJSON(request, 100_000_000);
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        !Object.hasOwn(body, "data") ||
        Object.keys(body).some((k) => !["data", "images"].includes(k))
      )
        throw new PanelError(
          400,
          "Envía los datos del apartado y sus imágenes.",
        );
      validate(name, body.data as Json, current);
      const files = new Map<string, Buffer | null>();
      attachImages(body.data as Json, body.images ?? [], files);
      validate(name, body.data as Json, current);
      if (!store || !head)
        return reply(
          { error: "Guardado no configurado: falta GITHUB_TOKEN." },
          503,
        );
      files.set(dataPath(name), jsonBytes(body.data));
      await store.commit(head, files);
      return reply({ data: body.data, message: saved });
    }
    const mutation = (request.method === 'POST' && ['software/dr-click', 'software/antivirus-image', 'web-projects'].includes(path)) || (request.method === 'DELETE' && path.startsWith('web-projects/'));
    if (!mutation) return reply({ error: 'No encontrado.' }, 404);
    if (!githubConfigured()) return reply({ error: 'Guardado no configurado: falta GITHUB_TOKEN.' }, 503);
    // Validate uploads before making any GitHub request.
    const files = new Map<string, Buffer | null>();
    let executable: Buffer | undefined;
    let body;
    let upload: ReturnType<typeof image> | undefined;
    if (path === 'software/dr-click') {
      let name;
      try { name = decodeURIComponent(request.headers.get('x-file-name') || 'DrClickSolutions.exe'); }
      catch { throw new PanelError(400, 'Nombre de archivo no válido.'); }
      if (!name.toLowerCase().endsWith('.exe')) throw new PanelError(400, 'Selecciona un archivo .exe.');
      executable = await readBody(request, 60_000_000);
      if (!executable.length) throw new PanelError(400, 'El archivo está vacío.');
    } else if (request.method === 'POST') {
      body = await bodyJSON(request);
      if (path === 'software/antivirus-image' && !['eset', 'panda', 'bitdefender'].includes(String(body.id || '').trim().toLowerCase())) throw new PanelError(400, 'Selecciona una marca válida.');
      if (path === 'web-projects' && !String(body.title || '').trim()) throw new PanelError(400, 'Escribe el nombre del proyecto.');
      upload = image(body.image);
    }
    const store = new GithubStore();
    const head = await store.head();
    let result;
    if (path.startsWith('software/')) {
      const software = await store.json(SOFTWARE, head.sha);
      if (executable) {
        files.set('public/downloads/DrClickSolutions.exe', executable);
        Object.assign(software.drClick, { available: true, filename: 'DrClickSolutions.exe', download: '/downloads/DrClickSolutions.exe', size: executable.length });
      } else if (upload) {
        const id = String(body.id).trim().toLowerCase();
        const filename = `${id}.${upload.extension}`;
        files.set(`public/images/software/antivirus/${filename}`, upload.bytes);
        software.antivirus[id].image = `/images/software/antivirus/${filename}`;
      }
      files.set(SOFTWARE, jsonBytes(software));
      result = { software };
    } else {
      const portfolio = await store.json(PORTFOLIO, head.sha);
      if (request.method === 'DELETE') {
        const id = decodeURIComponent(path.slice('web-projects/'.length));
        const project = portfolio.projects.find((item: { id: string }) => item.id === id);
        if (!project) throw new PanelError(404, 'Proyecto no encontrado.');
        portfolio.projects = portfolio.projects.filter((item: { id: string }) => item.id !== id);
        if (/^\/images\/proyectos-web\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(String(project.image))) files.set(`public${project.image}`, null);
        result = { portfolio };
      } else if (upload) {
        const id = `${slugify(String(body.title))}-${crypto.randomUUID()}`;
        const project = { id, title: String(body.title).trim(), category: String(body.category || 'Desarrollo web').trim(), image: `/images/proyectos-web/${id}.${upload.extension}`, alt: String(body.alt || `Vista del proyecto ${body.title}`).trim(), visible: true };
        files.set(`public${project.image}`, upload.bytes);
        portfolio.projects.unshift(project);
        result = { portfolio, project };
      }
      files.set(PORTFOLIO, jsonBytes(portfolio));
    }
    await store.commit(head, files);
    return reply({ ...result, message: saved }, request.method === 'POST' ? 201 : 200);
  } catch (error) {
    return error instanceof PanelError ? reply({ error: error.message, ...('field' in error ? { field: error.field } : {}) }, error.status) : reply({ error: 'No se pudo completar la operación.' }, 500);
  }
};
