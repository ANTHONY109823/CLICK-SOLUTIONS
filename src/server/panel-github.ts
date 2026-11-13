import { PanelError } from './panel-auth';

export const PORTFOLIO = 'src/data/web-projects.json';
export const SOFTWARE = 'src/data/click-software.json';
export const githubConfigured = () => Boolean(process.env.GITHUB_TOKEN);
export class GithubStore {
  private base: string;
  private branch: string;
  constructor() {
    const repo = process.env.GITHUB_REPO || 'ANTHONY109823/CLICK-SOLUTIONS';
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new PanelError(503, 'No se pudo acceder al almacenamiento.');
    this.base = `https://api.github.com/repos/${repo}`;
    this.branch = (process.env.GITHUB_BRANCH || 'main').split('/').map(encodeURIComponent).join('/');
  }
  private async api(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(`${this.base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) throw new PanelError(response.status === 422 || response.status === 409 ? 409 : 502,
      response.status === 422 || response.status === 409 ? 'No se pudo guardar. Recarga el panel e inténtalo de nuevo.' : 'No se pudo completar la operación en GitHub.');
    return response.json();
  }
  async head(): Promise<{ sha: string; tree: string }> {
    const ref = await this.api(`/git/ref/heads/${this.branch}`);
    const commit = await this.api(`/git/commits/${ref.object.sha}`);
    return { sha: ref.object.sha, tree: commit.tree.sha };
  }
  async json(path: string, sha: string) {
    const file = await this.api(`/contents/${path}?ref=${encodeURIComponent(sha)}`);
    return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  }
  async commit(head: { sha: string; tree: string }, files: Map<string, Buffer | null>) {
    const tree: { path: string; mode: string; type: string; sha: string | null }[] = [];
    for (const [path, bytes] of files) {
      const blob = bytes === null ? null : await this.api('/git/blobs', 'POST', { content: bytes.toString('base64'), encoding: 'base64' });
      tree.push({ path, mode: '100644', type: 'blob', sha: blob?.sha ?? null });
    }
    const nextTree = await this.api('/git/trees', 'POST', { base_tree: head.tree, tree });
    const commit = await this.api('/git/commits', 'POST', { message: 'Actualiza contenido desde el panel', tree: nextTree.sha, parents: [head.sha] });
    // Never force: a concurrent writer must not be overwritten.
    await this.api(`/git/refs/heads/${this.branch}`, 'PATCH', { sha: commit.sha, force: false });
  }
}
