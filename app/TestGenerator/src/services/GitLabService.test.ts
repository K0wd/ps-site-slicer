import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GitLabService } from './GitLabService.js';

const baseConfig = {
  gitlabToken: 'fake-token',
  gitlabBaseUrl: 'https://gitlab.example.com',
  gitlabGroupPath: 'powerslice-software-development',
} as any;

// Build a minimal Response-like object the service can `await response.json()` /
// `response.text()` on. The service only ever calls .ok, .status, .statusText, .text(),
// and .json() so we don't need a real Response instance.
function fakeResponse(body: any, status = 200): any {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Bad',
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

// Match a request URL to a path/query and return the configured response.
function makeFetchMock(handlers: Array<{ match: (url: URL) => boolean; response: any }>) {
  return vi.fn(async (input: any) => {
    const url = new URL(typeof input === 'string' ? input : input.toString());
    for (const h of handlers) {
      if (h.match(url)) return h.response;
    }
    throw new Error(`No fetch mock for ${url.toString()}`);
  });
}

describe('GitLabService', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('isConfigured', () => {
    it('returns true when token is set', () => {
      const svc = new GitLabService(baseConfig);
      expect(svc.isConfigured).toBe(true);
    });

    it('returns false when token is empty string', () => {
      const svc = new GitLabService({ ...baseConfig, gitlabToken: '' } as any);
      expect(svc.isConfigured).toBe(false);
    });
  });

  describe('api authentication & errors', () => {
    it('throws a useful error when token is missing', async () => {
      const svc = new GitLabService({ ...baseConfig, gitlabToken: '' } as any);
      await expect(svc.listGroupProjects()).rejects.toThrow(/GITLAB_TOKEN is not set/);
    });

    it('sends the PRIVATE-TOKEN header on every request', async () => {
      const fetchMock = makeFetchMock([
        { match: () => true, response: fakeResponse([]) },
      ]);
      global.fetch = fetchMock as any;
      await new GitLabService(baseConfig).listGroupProjects();
      const callArgs = (fetchMock.mock.calls[0] as any[])[1] as any;
      expect(callArgs.headers['PRIVATE-TOKEN']).toBe('fake-token');
    });

    it('surfaces non-2xx responses with status, statusText, and a body excerpt', async () => {
      global.fetch = makeFetchMock([
        { match: () => true, response: fakeResponse('access denied: read_api scope required', 401) },
      ]) as any;
      await expect(new GitLabService(baseConfig).listGroupProjects()).rejects.toThrow(
        /GitLab API 401.*access denied/,
      );
    });
  });

  describe('searchCommitsInGroup', () => {
    function setupFetchForGroup(opts: {
      projects: Array<{ id: number; name: string; pathWithNamespace: string }>;
      commitsByProject: Record<number, any[]>;
    }) {
      global.fetch = makeFetchMock([
        {
          match: (url) => url.pathname.endsWith('/projects'),
          response: fakeResponse(
            opts.projects.map(p => ({
              id: p.id,
              name: p.name,
              path_with_namespace: p.pathWithNamespace,
              web_url: `https://gitlab.example.com/${p.pathWithNamespace}`,
            })),
          ),
        },
        {
          match: (url) => /\/projects\/\d+\/repository\/commits$/.test(url.pathname),
          response: null,
        },
      ]) as any;

      // Replace the per-project handler with project-id routing.
      global.fetch = vi.fn(async (input: any) => {
        const url = new URL(typeof input === 'string' ? input : input.toString());
        if (url.pathname.endsWith('/projects') && url.searchParams.get('include_subgroups') === 'true') {
          return fakeResponse(
            opts.projects.map(p => ({
              id: p.id,
              name: p.name,
              path_with_namespace: p.pathWithNamespace,
              web_url: `https://gitlab.example.com/${p.pathWithNamespace}`,
            })),
          );
        }
        const m = url.pathname.match(/\/projects\/(\d+)\/repository\/commits$/);
        if (m) {
          const projectId = parseInt(m[1]!, 10);
          return fakeResponse(opts.commitsByProject[projectId] || []);
        }
        throw new Error(`Unmocked URL: ${url.toString()}`);
      }) as any;
    }

    it('aggregates commits across all projects in the group', async () => {
      setupFetchForGroup({
        projects: [
          { id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' },
          { id: 2, name: 'sm-pwa', pathWithNamespace: 'pwr/sm-pwa' },
        ],
        commitsByProject: {
          1: [{ id: 'aaa111aaa', short_id: 'aaa111', title: 'SM-1118: foo', message: 'SM-1118: foo body' }],
          2: [{ id: 'bbb222bbb', short_id: 'bbb222', title: 'SM-1118: bar', message: 'SM-1118: bar body' }],
        },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1118');
      expect(out).toHaveLength(2);
      expect(out.map(c => c.projectName).sort()).toEqual(['sm-pwa', 'sm-spa']);
    });

    it('dedupes commits returned multiple times by --all=true (once per branch)', async () => {
      setupFetchForGroup({
        projects: [{ id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' }],
        commitsByProject: {
          1: [
            { id: 'aaa111aaa', short_id: 'aaa111', title: 'SM-1118: x', message: 'SM-1118: x' },
            { id: 'aaa111aaa', short_id: 'aaa111', title: 'SM-1118: x', message: 'SM-1118: x' },
            { id: 'aaa111aaa', short_id: 'aaa111', title: 'SM-1118: x', message: 'SM-1118: x' },
            { id: 'bbb222bbb', short_id: 'bbb222', title: 'SM-1118: y', message: 'SM-1118: y' },
          ],
        },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1118');
      expect(out).toHaveLength(2);
      expect(out.map(c => c.hash).sort()).toEqual(['aaa111aaa', 'bbb222bbb']);
    });

    it('does NOT dedupe across projects — same hash in two repos counts as two', async () => {
      setupFetchForGroup({
        projects: [
          { id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' },
          { id: 2, name: 'sm-pwa', pathWithNamespace: 'pwr/sm-pwa' },
        ],
        commitsByProject: {
          1: [{ id: 'cafe', short_id: 'cafe', title: 'SM-1: x', message: 'SM-1: x' }],
          2: [{ id: 'cafe', short_id: 'cafe', title: 'SM-1: x', message: 'SM-1: x' }],
        },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1');
      expect(out).toHaveLength(2);
    });

    it('filters false positives that do not contain the ticket key in title or message', async () => {
      setupFetchForGroup({
        projects: [{ id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' }],
        commitsByProject: {
          1: [
            // Real match
            { id: 'a', short_id: 'a', title: 'SM-1118: real', message: 'SM-1118: body' },
            // GitLab loose match returns this when it shouldn't (no SM-1118 in title or msg)
            { id: 'b', short_id: 'b', title: 'unrelated work', message: 'about something else' },
          ],
        },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1118');
      expect(out).toHaveLength(1);
      expect(out[0]!.hash).toBe('a');
    });

    it('matches case-insensitively (uppercases the needle)', async () => {
      setupFetchForGroup({
        projects: [{ id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' }],
        commitsByProject: {
          1: [
            { id: 'a', short_id: 'a', title: 'sm-1118: lowercase', message: 'sm-1118: lowercase' },
          ],
        },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1118');
      expect(out).toHaveLength(1);
    });

    it('returns empty array when no project matches', async () => {
      setupFetchForGroup({
        projects: [{ id: 1, name: 'sm-spa', pathWithNamespace: 'pwr/sm-spa' }],
        commitsByProject: { 1: [] },
      });
      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-9999');
      expect(out).toEqual([]);
    });

    it('continues despite a single project failing, but throws if ALL projects fail', async () => {
      const projects = [
        { id: 1, name: 'good', pathWithNamespace: 'pwr/good' },
        { id: 2, name: 'bad', pathWithNamespace: 'pwr/bad' },
      ];
      global.fetch = vi.fn(async (input: any) => {
        const url = new URL(typeof input === 'string' ? input : input.toString());
        if (url.pathname.endsWith('/projects') && url.searchParams.get('include_subgroups') === 'true') {
          return fakeResponse(
            projects.map(p => ({
              id: p.id,
              name: p.name,
              path_with_namespace: p.pathWithNamespace,
              web_url: '',
            })),
          );
        }
        const m = url.pathname.match(/\/projects\/(\d+)\/repository\/commits$/);
        if (m) {
          const projectId = parseInt(m[1]!, 10);
          if (projectId === 1) return fakeResponse([{ id: 'a', short_id: 'a', title: 'SM-1: x', message: 'SM-1: x' }]);
          return fakeResponse('forbidden', 403);
        }
        throw new Error(`Unmocked URL: ${url.toString()}`);
      }) as any;

      const out = await new GitLabService(baseConfig).searchCommitsInGroup('SM-1');
      expect(out).toHaveLength(1);
      expect(out[0]!.hash).toBe('a');
    });

    it('throws when every project fails', async () => {
      global.fetch = vi.fn(async (input: any) => {
        const url = new URL(typeof input === 'string' ? input : input.toString());
        if (url.pathname.endsWith('/projects') && url.searchParams.get('include_subgroups') === 'true') {
          return fakeResponse([
            { id: 1, name: 'a', path_with_namespace: 'pwr/a', web_url: '' },
            { id: 2, name: 'b', path_with_namespace: 'pwr/b', web_url: '' },
          ]);
        }
        return fakeResponse('boom', 500);
      }) as any;

      await expect(new GitLabService(baseConfig).searchCommitsInGroup('SM-1')).rejects.toThrow(
        /failed for all projects/,
      );
    });
  });
});
