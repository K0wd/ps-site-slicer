import type { Config } from '../shared/config/Config.js';

export interface GitLabProject {
  id: number;
  name: string;
  pathWithNamespace: string;
  webUrl: string;
}

export interface GitLabCommit {
  projectId: number;
  projectName: string;
  projectPath: string;
  hash: string;
  shortHash: string;
  subject: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authoredDate: string;
  webUrl: string;
}

export interface GitLabDiffEntry {
  oldPath: string;
  newPath: string;
  newFile: boolean;
  deletedFile: boolean;
  renamedFile: boolean;
}

export class GitLabService {
  constructor(private config: Config) {}

  get isConfigured(): boolean {
    return !!this.config.gitlabToken;
  }

  private async api<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    if (!this.isConfigured) {
      throw new Error('GITLAB_TOKEN is not set in .env — GitLab API calls are disabled.');
    }
    const url = new URL(`${this.config.gitlabBaseUrl}/api/v4${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url, {
      headers: { 'PRIVATE-TOKEN': this.config.gitlabToken, Accept: 'application/json' },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`GitLab API ${res.status} ${res.statusText} for ${url.pathname}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T>;
  }

  // Walk paginated GET endpoints (REST v4 returns up to 100 per page).
  private async paginate<T>(path: string, params: Record<string, string | number | boolean> = {}): Promise<T[]> {
    const all: T[] = [];
    const perPage = 100;
    let page = 1;
    while (true) {
      const batch = await this.api<T[]>(path, { ...params, per_page: perPage, page });
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < perPage) break;
      page += 1;
      if (page > 50) break; // hard cap, 5000 items
    }
    return all;
  }

  async listGroupProjects(): Promise<GitLabProject[]> {
    const groupPath = encodeURIComponent(this.config.gitlabGroupPath);
    const raw = await this.paginate<any>(`/groups/${groupPath}/projects`, {
      include_subgroups: true,
      archived: false,
      simple: true,
    });
    return raw.map(p => ({
      id: p.id,
      name: p.name,
      pathWithNamespace: p.path_with_namespace,
      webUrl: p.web_url,
    }));
  }

  async searchCommitsInProject(projectId: number, query: string, projectName: string, projectPath: string): Promise<GitLabCommit[]> {
    // GitLab does not natively grep commit messages, but the `?all=true&search=...` filter on
    // /repository/commits performs a substring match on commit messages.
    const raw = await this.paginate<any>(`/projects/${projectId}/repository/commits`, {
      all: true,
      search: query,
    });
    return raw.map(c => ({
      projectId,
      projectName,
      projectPath,
      hash: c.id,
      shortHash: c.short_id,
      subject: c.title,
      message: c.message,
      authorName: c.author_name,
      authorEmail: c.author_email,
      authoredDate: c.authored_date,
      webUrl: c.web_url,
    }));
  }

  async searchCommitsInGroup(query: string): Promise<GitLabCommit[]> {
    const projects = await this.listGroupProjects();
    const all: GitLabCommit[] = [];
    const errors: string[] = [];
    await Promise.all(projects.map(async p => {
      try {
        const found = await this.searchCommitsInProject(p.id, query, p.name, p.pathWithNamespace);
        all.push(...found);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${p.pathWithNamespace}: ${msg}`);
      }
    }));
    if (errors.length > 0 && all.length === 0) {
      throw new Error(`GitLab commit search failed for all projects:\n${errors.join('\n')}`);
    }
    // Filter false positives: GitLab's substring search is loose; require the query token to
    // appear in title or message body.
    const needle = query.toUpperCase();
    const filtered = all.filter(c =>
      c.subject.toUpperCase().includes(needle) || c.message.toUpperCase().includes(needle),
    );
    // Dedupe by (projectId, hash) — `?all=true` returns the same commit once per branch.
    const seen = new Set<string>();
    const unique: GitLabCommit[] = [];
    for (const c of filtered) {
      const key = `${c.projectId}:${c.hash}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(c);
    }
    return unique;
  }

  async getCommitDiff(projectId: number, sha: string): Promise<GitLabDiffEntry[]> {
    const raw = await this.api<any[]>(`/projects/${projectId}/repository/commits/${sha}/diff`);
    return raw.map(d => ({
      oldPath: d.old_path,
      newPath: d.new_path,
      newFile: !!d.new_file,
      deletedFile: !!d.deleted_file,
      renamedFile: !!d.renamed_file,
    }));
  }

  async getCommitDetails(projectId: number, sha: string): Promise<{ stats: { additions: number; deletions: number; total: number }; message: string; webUrl: string } | null> {
    const raw = await this.api<any>(`/projects/${projectId}/repository/commits/${sha}?stats=true`);
    if (!raw) return null;
    return {
      stats: { additions: raw.stats?.additions ?? 0, deletions: raw.stats?.deletions ?? 0, total: raw.stats?.total ?? 0 },
      message: raw.message ?? '',
      webUrl: raw.web_url ?? '',
    };
  }
}
