import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Server } from 'http';

const spawnMock = vi.fn(() => ({ unref: vi.fn() }));
vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return { ...actual, spawn: spawnMock };
});

const { createServer } = await import('./server.js');

describe('POST /api/restart', () => {
  let server: Server;
  let baseUrl: string;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let tmp: string;

  beforeEach(async () => {
    spawnMock.mockClear();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    tmp = mkdtempSync(join(tmpdir(), 'testgen-server-'));

    const config = {
      projectDir: tmp,
      uiDir: tmp,
      dataDir: tmp,
      testGeneratorDir: tmp,
      insightsReportPath: join(tmp, 'none.html'),
    } as any;
    const db = {} as any;
    const pipeline = {} as any;
    const sseClients = new Set() as any;
    const { app } = createServer(config, db, pipeline, sseClients);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === 'string') throw new Error('no address');
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterEach(async () => {
    exitSpy.mockRestore();
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(tmp, { recursive: true, force: true });
  });

  it('responds 200 with restart message immediately', async () => {
    const resp = await fetch(`${baseUrl}/api/restart`, { method: 'POST' });
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body).toEqual({ message: 'Restarting server...' });
    // Drain pending restart timer so it doesn't bleed into the next test
    await new Promise((r) => setTimeout(r, 250));
  });

  it('spawns a detached child via npm run <lifecycle> and calls process.exit(0) after delay', async () => {
    const originalLifecycle = process.env.npm_lifecycle_event;
    process.env.npm_lifecycle_event = 'dev';
    try {
      await fetch(`${baseUrl}/api/restart`, { method: 'POST' });

      expect(spawnMock).not.toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();

      await new Promise((r) => setTimeout(r, 350));

      expect(spawnMock).toHaveBeenCalledTimes(1);
      const [cmd, args, opts] = spawnMock.mock.calls[0] as any;
      expect(cmd).toMatch(/^npm(\.cmd)?$/);
      expect(args).toEqual(['run', 'dev']);
      expect(opts.detached).toBe(true);
      expect(opts.stdio).toBe('inherit');

      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      if (originalLifecycle === undefined) delete process.env.npm_lifecycle_event;
      else process.env.npm_lifecycle_event = originalLifecycle;
    }
  });

  it('falls back to npx tsx when npm_lifecycle_event is unset', async () => {
    const originalLifecycle = process.env.npm_lifecycle_event;
    delete process.env.npm_lifecycle_event;
    try {
      await fetch(`${baseUrl}/api/restart`, { method: 'POST' });
      await new Promise((r) => setTimeout(r, 350));

      const [cmd, args] = spawnMock.mock.calls[0] as any;
      expect(cmd).toMatch(/^npx(\.cmd)?$/);
      expect(args).toEqual(['tsx', 'src/index.ts']);
    } finally {
      if (originalLifecycle !== undefined) process.env.npm_lifecycle_event = originalLifecycle;
    }
  });
});
