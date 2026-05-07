import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { Database } from '../../shared/data/Database.js';
import type { StepContext } from '../../shared/pipeline/Step.js';
import { Step04ReviewCode } from './Step04ReviewCode.js';

// Step04 reaches into ctx.services.{gitlab,git} and ctx.logger. We stub each surface
// with the smallest fake that satisfies the call sites the step actually exercises.

interface FakeLogger {
  initTicket: (k: string) => string;
  logStep: (...args: any[]) => void;
  logInfo: (...args: any[]) => void;
  logCode: (...args: any[]) => void;
  logResult: (...args: any[]) => void;
  ticketDir: string;
}

function makeLogger(ticketDir: string): FakeLogger {
  return {
    initTicket: () => ticketDir,
    logStep: () => {},
    logInfo: () => {},
    logCode: () => {},
    logResult: () => {},
    ticketDir,
  };
}

interface MakeCtxOpts {
  ticketKey: string;
  ticketDir: string;
  db: Database;
  stepResultId: number;
  gitlab?: any;
  git?: any;
  config?: any;
}

function makeCtx(opts: MakeCtxOpts): StepContext {
  return {
    ticketKey: opts.ticketKey,
    runId: 1,
    stepResultId: opts.stepResultId,
    projectDir: '/tmp',
    config: opts.config ?? { gitlabGroupPath: 'powerslice-software-development' },
    services: {
      jira: {} as any,
      claude: {} as any,
      git: opts.git ?? {
        repoDirs: [],
        getCommitsForTicket: vi.fn().mockResolvedValue([]),
        getChangedFiles: vi.fn().mockResolvedValue(''),
        getCommitDetails: vi.fn().mockResolvedValue(''),
      },
      gitlab: opts.gitlab ?? { isConfigured: false },
      playwright: {} as any,
      context: {} as any,
    },
    db: opts.db,
    logger: makeLogger(opts.ticketDir) as any,
    emitSSE: () => {},
  } as StepContext;
}

describe('Step04ReviewCode — orchestration (gitlab vs local)', () => {
  let tmp: string;
  let ticketDir: string;
  let dataDir: string;
  let db: Database;
  let stepResultId: number;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'step04-'));
    ticketDir = resolve(tmp, 'ticket');
    mkdirSync(ticketDir, { recursive: true });
    dataDir = mkdtempSync(join(tmpdir(), 'step04-db-'));
    db = new Database(dataDir);
    const runId = db.createRun(1, 1);
    stepResultId = db.createStepResult(runId, 4, 'Review Code');
  });

  afterEach(() => {
    db.close();
    rmSync(tmp, { recursive: true, force: true });
    rmSync(dataDir, { recursive: true, force: true });
  });

  describe('GitLab path (token configured)', () => {
    it('uses GitLab when isConfigured=true and skips local git entirely', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([
          {
            projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'abc123def', shortHash: 'abc123', subject: 'SM-1118: feature',
            message: 'SM-1118: feature\n\nbody', authorName: 'a', authorEmail: 'b',
            authoredDate: '', webUrl: 'https://gitlab.example/c/abc123',
          },
        ]),
        getCommitDiff: vi.fn().mockResolvedValue([
          { oldPath: 'a.ts', newPath: 'a.ts', newFile: false, deletedFile: false, renamedFile: false },
          { oldPath: 'b.ts', newPath: 'b.ts', newFile: true, deletedFile: false, renamedFile: false },
        ]),
        getCommitDetails: vi.fn().mockResolvedValue({
          stats: { additions: 10, deletions: 2, total: 12 },
          message: 'SM-1118: feature\n\nbody',
          webUrl: 'https://gitlab.example/c/abc123',
        }),
      };
      const git = {
        repoDirs: ['/tmp/sm-spa'],
        getCommitsForTicket: vi.fn(),
        getChangedFiles: vi.fn(),
        getCommitDetails: vi.fn(),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1118', ticketDir, db, stepResultId, gitlab, git }),
      );

      expect(gitlab.searchCommitsInGroup).toHaveBeenCalledWith('SM-1118');
      expect(git.getCommitsForTicket).not.toHaveBeenCalled();
      expect(out.status).toBe('pass');
      expect((out.data as any).commitCount).toBe(1);
      expect((out.data as any).changedCount).toBe(2);
      expect(out.message).toMatch(/Source: gitlab/);
    });

    it('writes per-repo grouped 4_commits.md with web URLs', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([
          {
            projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'aaa111aaa', shortHash: 'aaa111', subject: 'feat A',
            message: 'feat A', authorName: '', authorEmail: '', authoredDate: '',
            webUrl: 'https://gitlab.example/sm-spa/c/aaa111',
          },
          {
            projectId: 2, projectName: 'sm-pwa', projectPath: 'pwr/sm-pwa',
            hash: 'bbb222bbb', shortHash: 'bbb222', subject: 'feat B',
            message: 'feat B', authorName: '', authorEmail: '', authoredDate: '',
            webUrl: 'https://gitlab.example/sm-pwa/c/bbb222',
          },
        ]),
        getCommitDiff: vi.fn().mockResolvedValue([]),
        getCommitDetails: vi.fn().mockResolvedValue({ stats: { additions: 0, deletions: 0, total: 0 }, message: '', webUrl: '' }),
      };
      await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1118', ticketDir, db, stepResultId, gitlab }),
      );
      const md = readFileSync(resolve(ticketDir, '4_commits.md'), 'utf-8');
      expect(md).toContain('## sm-spa');
      expect(md).toContain('## sm-pwa');
      expect(md).toContain('aaa111 feat A');
      expect(md).toContain('https://gitlab.example/sm-spa/c/aaa111');
      expect(md).toContain('via GitLab API');
    });

    it('aggregates+dedupes diff file paths across multiple commits in the same repo', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([
          { projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'h1', shortHash: 'h1', subject: 's1', message: '', authorName: '', authorEmail: '', authoredDate: '', webUrl: '' },
          { projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'h2', shortHash: 'h2', subject: 's2', message: '', authorName: '', authorEmail: '', authoredDate: '', webUrl: '' },
        ]),
        getCommitDiff: vi.fn()
          .mockResolvedValueOnce([{ oldPath: 'shared.ts', newPath: 'shared.ts', newFile: false, deletedFile: false, renamedFile: false }])
          .mockResolvedValueOnce([
            { oldPath: 'shared.ts', newPath: 'shared.ts', newFile: false, deletedFile: false, renamedFile: false },
            { oldPath: 'extra.ts', newPath: 'extra.ts', newFile: true, deletedFile: false, renamedFile: false },
          ]),
        getCommitDetails: vi.fn().mockResolvedValue({ stats: { additions: 1, deletions: 0, total: 1 }, message: '', webUrl: '' }),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab }),
      );
      // shared.ts dedupe → 2 unique files (shared.ts + extra.ts), not 3.
      expect((out.data as any).changedCount).toBe(2);
      const md = readFileSync(resolve(ticketDir, '4_changed_files.md'), 'utf-8');
      expect(md.split('shared.ts').length - 1).toBe(1);
      expect(md).toContain('extra.ts');
    });
  });

  describe('GitLab → local fallback', () => {
    it('falls back to local git when GitLab returns zero commits', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([]),
        getCommitDiff: vi.fn(),
        getCommitDetails: vi.fn(),
      };
      const git = {
        repoDirs: ['/tmp/sm-spa'],
        getCommitsForTicket: vi.fn().mockResolvedValue([
          { repoPath: '/tmp/sm-spa', repoName: 'sm-spa', hash: 'localhash', subject: 'fallback worked' },
        ]),
        getChangedFiles: vi.fn().mockResolvedValue('a.ts\nb.ts'),
        getCommitDetails: vi.fn().mockResolvedValue('commit details body'),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab, git }),
      );

      expect(gitlab.searchCommitsInGroup).toHaveBeenCalled();
      expect(git.getCommitsForTicket).toHaveBeenCalled();
      expect((out.data as any).commitCount).toBe(1);
      expect(out.message).toMatch(/Source: local/);
    });

    it('falls back to local git when GitLab throws an error', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockRejectedValue(new Error('GitLab API 500 Server Error')),
        getCommitDiff: vi.fn(),
        getCommitDetails: vi.fn(),
      };
      const git = {
        repoDirs: ['/tmp/sm-spa'],
        getCommitsForTicket: vi.fn().mockResolvedValue([
          { repoPath: '/tmp/sm-spa', repoName: 'sm-spa', hash: 'h', subject: 's' },
        ]),
        getChangedFiles: vi.fn().mockResolvedValue('x.ts'),
        getCommitDetails: vi.fn().mockResolvedValue('body'),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab, git }),
      );

      expect(out.status).toBe('pass');
      expect((out.data as any).commitCount).toBe(1);
      expect(out.message).toMatch(/Source: local/);
    });

    it('uses git.getChangedFiles + getCommitDetails (not gitlab) when source is local', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([]),
        getCommitDiff: vi.fn(),
        getCommitDetails: vi.fn(),
      };
      const git = {
        repoDirs: ['/tmp/sm-spa'],
        getCommitsForTicket: vi.fn().mockResolvedValue([
          { repoPath: '/tmp/sm-spa', repoName: 'sm-spa', hash: 'newest', subject: 'b' },
          { repoPath: '/tmp/sm-spa', repoName: 'sm-spa', hash: 'oldest', subject: 'a' },
        ]),
        getChangedFiles: vi.fn().mockResolvedValue('one.ts\ntwo.ts'),
        getCommitDetails: vi.fn().mockResolvedValue('details'),
      };

      await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab, git }),
      );
      expect(git.getChangedFiles).toHaveBeenCalledWith('/tmp/sm-spa', 'oldest', 'newest');
      expect(git.getCommitDetails).toHaveBeenCalledTimes(2);
      expect(gitlab.getCommitDiff).not.toHaveBeenCalled();
    });
  });

  describe('Local-only path (no GitLab token)', () => {
    it('uses git directly when isConfigured=false', async () => {
      const gitlab = { isConfigured: false };
      const git = {
        repoDirs: ['/tmp/r'],
        getCommitsForTicket: vi.fn().mockResolvedValue([
          { repoPath: '/tmp/r', repoName: 'r', hash: 'h', subject: 's' },
        ]),
        getChangedFiles: vi.fn().mockResolvedValue('a.ts'),
        getCommitDetails: vi.fn().mockResolvedValue('details'),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab, git }),
      );
      expect(out.status).toBe('pass');
      expect(out.message).toMatch(/Source: local/);
      expect(git.getCommitsForTicket).toHaveBeenCalled();
    });

    it('returns 0 commits cleanly when both sources are empty', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([]),
        getCommitDiff: vi.fn(),
        getCommitDetails: vi.fn(),
      };
      const git = {
        repoDirs: ['/tmp/r'],
        getCommitsForTicket: vi.fn().mockResolvedValue([]),
        getChangedFiles: vi.fn(),
        getCommitDetails: vi.fn(),
      };

      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-NONE', ticketDir, db, stepResultId, gitlab, git }),
      );
      expect(out.status).toBe('pass');
      expect((out.data as any).commitCount).toBe(0);
      expect((out.data as any).changedCount).toBe(0);
      // 4_commits.md is always written even when empty.
      expect(existsSync(resolve(ticketDir, '4_commits.md'))).toBe(true);
      // 4_changed_files.md and 4_commit_details.md only written when commits found.
      expect(existsSync(resolve(ticketDir, '4_changed_files.md'))).toBe(false);
      expect(existsSync(resolve(ticketDir, '4_commit_details.md'))).toBe(false);
    });
  });

  describe('error handling within the loops', () => {
    it('surfaces a per-commit detail failure as a warning without failing the step', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([
          { projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'h', shortHash: 'h', subject: 's', message: '', authorName: '', authorEmail: '', authoredDate: '', webUrl: '' },
        ]),
        getCommitDiff: vi.fn().mockResolvedValue([]),
        getCommitDetails: vi.fn().mockRejectedValue(new Error('rate limited')),
      };
      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab }),
      );
      expect(out.status).toBe('pass');
      const detailsMd = readFileSync(resolve(ticketDir, '4_commit_details.md'), 'utf-8');
      expect(detailsMd).toMatch(/Could not open.*rate limited/);
    });

    it('surfaces a per-repo diff failure as a warning without failing the step', async () => {
      const gitlab = {
        isConfigured: true,
        searchCommitsInGroup: vi.fn().mockResolvedValue([
          { projectId: 1, projectName: 'sm-spa', projectPath: 'pwr/sm-spa',
            hash: 'h', shortHash: 'h', subject: 's', message: '', authorName: '', authorEmail: '', authoredDate: '', webUrl: '' },
        ]),
        getCommitDiff: vi.fn().mockRejectedValue(new Error('diff timeout')),
        getCommitDetails: vi.fn().mockResolvedValue({ stats: { additions: 0, deletions: 0, total: 0 }, message: '', webUrl: '' }),
      };
      const out = await new Step04ReviewCode().run(
        makeCtx({ ticketKey: 'SM-1', ticketDir, db, stepResultId, gitlab }),
      );
      expect(out.status).toBe('pass');
      const changedMd = readFileSync(resolve(ticketDir, '4_changed_files.md'), 'utf-8');
      expect(changedMd).toMatch(/diff failed.*diff timeout/);
    });
  });
});
