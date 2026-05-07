import express from 'express';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { execSync, spawn } from 'child_process';
import type { Config } from './shared/config/Config.js';
import type { Database } from './shared/data/Database.js';
import type { Pipeline } from './shared/pipeline/Pipeline.js';
import type { ClaudeService } from './services/ClaudeService.js';
import type { Response, Request } from 'express';

// Normalize a ticket key: bare numeric → SM-N; trim & uppercase; pass through null/undefined.
function normalizeTicketKey<T extends string | null | undefined>(input: T): T {
  if (input === undefined || input === null) return input;
  const s = String(input).trim();
  if (s === '') return input;
  if (/^\d+$/.test(s)) return ('SM-' + s) as T;
  return s.toUpperCase() as T;
}

export function createServer(config: Config, db: Database, pipeline: Pipeline, sseClients: Set<Response>, onScheduleChange?: () => void, claude?: ClaudeService) {
  const app = express();

  app.use(express.json());

  // --- SSE ---
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    sseClients.add(res);
    res.write('event: connected\ndata: {}\n\n');
    req.on('close', () => { sseClients.delete(res); });
  });

  // --- Pipeline Status ---
  app.get('/api/status', (_req: Request, res: Response) => {
    const steps = pipeline.getState();
    if (!pipeline.isRunning) {
      const lastRuns = db.getRecentRuns(1);
      if (lastRuns.length > 0) {
        const lastSteps = db.getStepResults(lastRuns[0].id);
        for (const ls of lastSteps) {
          const s = steps.find((st: any) => st.stepNumber === ls.stepNumber);
          if (s && s.status === 'idle') s.status = ls.status;
        }
      }
    }
    const stepHistory = db.getRecentStepStatuses(5);
    res.json({ running: pipeline.isRunning, steps, stepHistory, jiraBaseUrl: config.jiraBaseUrl });
  });

  // --- Schedules ---
  app.get('/api/schedules', (_req: Request, res: Response) => {
    res.json(db.getSchedules());
  });

  app.post('/api/schedules', (req: Request, res: Response) => {
    const { name, minute, hour, stepStart, stepEnd, filter, ticketKey, intervalHours } = req.body;
    if (name === undefined || minute === undefined || hour === undefined) {
      res.status(400).json({ error: 'name, minute, and hour are required' }); return;
    }
    const id = db.createSchedule(name, minute, hour, stepStart || 1, stepEnd || 10, filter, ticketKey, intervalHours || undefined);
    onScheduleChange?.();
    res.json({ id, message: 'Schedule created' });
  });

  app.post('/api/schedules/delete/:sid', (req: Request, res: Response) => {
    db.deleteSchedule(parseInt(req.params.sid as string, 10));
    onScheduleChange?.();
    res.json({ message: 'Deleted' });
  });

  app.post('/api/schedules/toggle/:sid', (req: Request, res: Response) => {
    const id = parseInt(req.params.sid as string, 10);
    const sched = db.getSchedule(id);
    if (!sched) { res.status(404).json({ error: 'Not found' }); return; }
    db.updateSchedule(id, { enabled: !sched.enabled });
    onScheduleChange?.();
    res.json({ enabled: !sched.enabled });
  });

  // --- Run All (4-Thread Mode) ---
  app.post('/api/run/all', (req: Request, res: Response) => {
    const { filter, parallel6, t2Only, resetBlocked } = req.body || {};
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    const modeDesc = t2Only ? 'T2-only (Gherkin generation)' : 'Thread 1 bootstrap → Threads 2/3/4 concurrent';
    res.json({ message: `Run-all started (${modeDesc})` });
    pipeline.runAll(filter, { parallel6: !!parallel6, t2Only: !!t2Only, resetBlocked: !!resetBlocked }).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
  });

  // --- Run Pipeline ---
  app.post('/api/run', (req: Request, res: Response) => {
    const { stepStart, stepEnd, filter } = req.body;
    const ticketKey = normalizeTicketKey(req.body.ticketKey);
    if (!stepStart || !stepEnd) { res.status(400).json({ error: 'stepStart and stepEnd required' }); return; }
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    // Range runs cap at Step 10 — Step 11 (transition) is operator-only via the single-step panel.
    const cappedEnd = stepStart < 100 ? Math.min(stepEnd, 10) : stepEnd;
    res.json({ message: 'Pipeline started' });
    pipeline.runSteps(stepStart, cappedEnd, ticketKey, filter).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
  });

  // --- Cancel ---
  app.post('/api/cancel', (_req: Request, res: Response) => {
    if (!pipeline.isRunning) { res.json({ message: 'Nothing running' }); return; }
    pipeline.cancel();
    res.json({ message: 'Cancel requested' });
  });

  // --- Heal Loop (Eng03 in a loop until clean / unhealable / max-iters) ---
  app.post('/api/heal/loop', (req: Request, res: Response) => {
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    const { debugHeal } = req.body || {};
    res.json({ message: 'Heal loop started' });
    pipeline.runHealLoop({ debugHeal }).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
  });

  // --- Run Single Step ---
  app.post('/api/run/step/:num', (req: Request, res: Response) => {
    const stepNum = parseInt(req.params.num as string, 10);
    const { parallel, debugHeal, runAll, testTypes } = req.body;
    const ticketKey = normalizeTicketKey(req.body.ticketKey);
    const validStepNums = new Set([1,2,3,4,5,6,7,8,9,10,11,101,102,103,104,105]);
    if (isNaN(stepNum) || !validStepNums.has(stepNum)) { res.status(400).json({ error: 'Invalid step number' }); return; }
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    res.json({ message: `Step ${stepNum} started` });
    pipeline.runSingleStep(stepNum, ticketKey, { parallel, debugHeal, runAll, testTypes }).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
  });

  // --- Known Tickets (from logs/info) ---
  app.get('/api/tickets', (_req: Request, res: Response) => {
    try {
      const infoDir = config.infoDir;
      if (!existsSync(infoDir)) { res.json([]); return; }
      const tickets = readdirSync(infoDir)
        .filter((d: string) => {
          const full = resolve(infoDir, d);
          return statSync(full).isDirectory() && /^[A-Z]+-/.test(d);
        })
        .map((d: string) => {
          const ticketKey = d.replace(/\s+(done|failed).*$/i, '');
          const dir = resolve(infoDir, d);
          const hasPlan = existsSync(resolve(dir, '5_plan.md'));
          const hasFeature = existsSync(resolve(dir, '6_gherkin_scratch'));
          const stat = statSync(dir);
          return { ticketKey, dirName: d, hasPlan, hasFeature, lastModified: stat.mtime.toISOString() };
        })
        .sort((a: any, b: any) => b.lastModified.localeCompare(a.lastModified));
      res.json(tickets);
    } catch { res.json([]); }
  });

  // --- Run History ---
  app.get('/api/runs', (_req: Request, res: Response) => {
    const runs = db.getRecentRuns().map((r: any) => ({
      ...r,
      steps: db.getStepResults(r.id).map((s: any) => ({ step_number: s.step_number, status: s.status })),
    }));
    res.json(runs);
  });

  app.get('/api/steps/:stepNum/history', (req: Request, res: Response) => {
    const stepNum = parseInt(req.params.stepNum as string, 10);
    const results = db.getStepHistory(stepNum).map((s: any) => ({
      ...s,
      logs: db.getLogs(s.id, 200),
    }));
    res.json(results);
  });

  app.get('/api/runs/:rid', (req: Request, res: Response) => {
    const id = parseInt(req.params.rid as string, 10);
    const run = db.getRun(id);
    if (!run) { res.status(404).json({ error: 'Run not found' }); return; }
    const steps = db.getStepResults(id).map((s: any) => ({
      ...s,
      logs: db.getLogs(s.id, 200),
      artifacts: db.getArtifacts(s.id),
    }));
    res.json({ ...run, steps });
  });

  // --- Bug Creator ---
  const bugCreatorDir = resolve(config.testGeneratorDir, '..', 'BugCreator');
  const bugDraftsDir = resolve(config.dataDir, 'bug-drafts');
  mkdirSync(bugDraftsDir, { recursive: true });

  app.post('/api/bug-draft', async (req: Request, res: Response) => {
    if (!claude) { res.status(500).json({ error: 'Claude service not available' }); return; }
    const { brief } = req.body;
    if (!brief || !brief.trim()) { res.status(400).json({ error: 'brief is required' }); return; }

    try {
      let rules = '';
      let template = '';
      try { rules = readFileSync(resolve(config.projectDir, '.claude-self/rules/jira-ticket-creation.md'), 'utf-8'); } catch { /* ok */ }
      try { template = readFileSync(resolve(bugCreatorDir, 'template.html'), 'utf-8'); } catch { /* ok */ }

      const prompt = [
        'You are a senior QA test analyst drafting a Jira ticket. Follow the company rules below exactly.',
        '',
        '## COMPANY RULES',
        rules,
        '',
        '## TARGET HTML LAYOUT (fill placeholders, keep inline styles)',
        template,
        '',
        '## TICKET BRIEF',
        brief.trim(),
        '',
        '## OUTPUT FORMAT',
        'Line 1: TYPE: Bug|Story|Task|Epic',
        'Lines 2+: The filled HTML (no markdown fences, just raw HTML).',
      ].join('\n');

      const result = await claude.prompt(prompt, { outputFormat: 'json' });
      const lines = result.result.split('\n');
      const typeLine = lines[0] || '';
      const typeMatch = typeLine.match(/TYPE:\s*(Bug|Story|Task|Epic)/i);
      const workType = typeMatch ? typeMatch[1] : 'Bug';
      const html = lines.slice(1).join('\n').trim();

      const refMatch = brief.match(/[A-Z]+-\d+/);
      const refTicket = refMatch ? refMatch[0] : 'NEW';
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `${refTicket}_${workType}-${ts}.html`;
      writeFileSync(resolve(bugDraftsDir, filename), html, 'utf-8');

      res.json({ workType, html, filename });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/api/bug-drafts', (_req: Request, res: Response) => {
    try {
      const files = readdirSync(bugDraftsDir)
        .filter((f: string) => f.endsWith('.html'))
        .map((f: string) => {
          const stat = statSync(resolve(bugDraftsDir, f));
          return { filename: f, size: stat.size, createdAt: stat.mtime.toISOString() };
        })
        .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      res.json(files);
    } catch { res.json([]); }
  });

  app.get('/api/bug-drafts/:filename', (req: Request, res: Response) => {
    try {
      const html = readFileSync(resolve(bugDraftsDir, req.params.filename as string), 'utf-8');
      res.type('html').send(html);
    } catch { res.status(404).json({ error: 'Draft not found' }); }
  });

  // --- Claude Insights ---
  const insightsReportPath = resolve(process.env.HOME || '', '.claude-self', 'usage-data', 'report.html');

  app.get('/api/claude/insights', (_req: Request, res: Response) => {
    if (existsSync(insightsReportPath)) {
      const stat = statSync(insightsReportPath);
      res.json({ available: true, updatedAt: stat.mtime.toISOString() });
    } else {
      res.json({ available: false });
    }
  });

  app.post('/api/claude/insights/generate', async (_req: Request, res: Response) => {
    try {
      execSync('claude -p "/insights"', { encoding: 'utf-8', timeout: 120000, cwd: config.projectDir });
      res.json({ message: 'Insights report generated' });
    } catch (err) {
      res.json({ message: 'Insights generation attempted', note: String(err).substring(0, 200) });
    }
  });

  app.post('/api/restart', (_req: Request, res: Response) => {
    if (pipeline.isRunning) pipeline.cancel();
    res.json({ message: 'Restarting server...' });
    setTimeout(() => {
      // Re-spawn through npm so the tsx loader is registered for the new process.
      // process.argv[0] is bare `node` and would fail on .ts files.
      const lifecycleEvent = process.env.npm_lifecycle_event;
      let cmd: string;
      let args: string[];
      if (lifecycleEvent) {
        cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        args = ['run', lifecycleEvent];
      } else {
        cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        args = ['tsx', 'src/index.ts'];
      }
      const child = spawn(cmd, args, {
        cwd: process.cwd(),
        env: process.env,
        detached: true,
        stdio: 'inherit',
      });
      child.unref();
      process.exit(0);
    }, 200);
  });

  app.get('/api/claude/insights/report', (_req: Request, res: Response) => {
    if (!existsSync(insightsReportPath)) {
      res.status(404).send('<h1>No insights report found. Run /insights in Claude Code first.</h1>');
      return;
    }
    const html = readFileSync(insightsReportPath, 'utf-8');
    res.type('html').send(html);
  });

  // Static files
  app.use(express.static(config.uiDir));

  return { app };
}
