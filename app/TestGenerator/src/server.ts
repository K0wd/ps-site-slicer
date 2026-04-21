import express from 'express';
import type { Config } from './config/Config.js';
import type { Database } from './data/Database.js';
import type { Pipeline } from './pipeline/Pipeline.js';
import type { Response, Request } from 'express';

export function createServer(config: Config, db: Database, pipeline: Pipeline, sseClients: Set<Response>, onScheduleChange?: () => void) {
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
          const s = steps.find((st: any) => st.stepNumber === ls.step_number);
          if (s && s.status === 'idle') s.status = ls.status;
        }
      }
    }
    res.json({ running: pipeline.isRunning, steps });
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
    const id = db.createSchedule(name, minute, hour, stepStart || 1, stepEnd || 11, filter, ticketKey, intervalHours || undefined);
    onScheduleChange?.();
    res.json({ id, message: 'Schedule created' });
  });

  app.post('/api/schedules/delete/:sid', (req: Request, res: Response) => {
    db.deleteSchedule(parseInt(req.params.sid, 10));
    onScheduleChange?.();
    res.json({ message: 'Deleted' });
  });

  app.post('/api/schedules/toggle/:sid', (req: Request, res: Response) => {
    const id = parseInt(req.params.sid, 10);
    const sched = db.getSchedule(id);
    if (!sched) { res.status(404).json({ error: 'Not found' }); return; }
    db.updateSchedule(id, { enabled: !sched.enabled });
    onScheduleChange?.();
    res.json({ enabled: !sched.enabled });
  });

  // --- Run Pipeline ---
  app.post('/api/run', (req: Request, res: Response) => {
    const { stepStart, stepEnd, ticketKey, filter } = req.body;
    if (!stepStart || !stepEnd) { res.status(400).json({ error: 'stepStart and stepEnd required' }); return; }
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    res.json({ message: 'Pipeline started' });
    pipeline.runSteps(stepStart, stepEnd, ticketKey, filter).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
  });

  // --- Run Single Step ---
  app.post('/api/run/step/:num', (req: Request, res: Response) => {
    const stepNum = parseInt(req.params.num, 10);
    const { ticketKey } = req.body;
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 11) { res.status(400).json({ error: 'Step 1-11' }); return; }
    if (pipeline.isRunning) { res.status(409).json({ error: 'Pipeline is already running' }); return; }
    res.json({ message: `Step ${stepNum} started` });
    pipeline.runSingleStep(stepNum, ticketKey).catch(err => {
      const payload = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
      for (const client of sseClients) client.write(payload);
    });
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
    const stepNum = parseInt(req.params.stepNum, 10);
    const results = db.getStepHistory(stepNum).map((s: any) => ({
      ...s,
      logs: db.getLogs(s.id, 200),
    }));
    res.json(results);
  });

  app.get('/api/runs/:rid', (req: Request, res: Response) => {
    const id = parseInt(req.params.rid, 10);
    const run = db.getRun(id);
    if (!run) { res.status(404).json({ error: 'Run not found' }); return; }
    const steps = db.getStepResults(id).map((s: any) => ({
      ...s,
      logs: db.getLogs(s.id, 200),
      artifacts: db.getArtifacts(s.id),
    }));
    res.json({ ...run, steps });
  });

  // Static files
  app.use(express.static(config.uiDir));

  return { app };
}
