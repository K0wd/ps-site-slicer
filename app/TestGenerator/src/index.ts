import { execSync } from 'child_process';
import { Config } from './shared/config/Config.js';
import { Database } from './shared/data/Database.js';
import { StoryLogger } from './shared/logger/StoryLogger.js';
import { JiraService } from './services/JiraService.js';
import { ClaudeService } from './services/ClaudeService.js';
import { GitService } from './services/GitService.js';
import { GitLabService } from './services/GitLabService.js';
import { PlaywrightService } from './services/PlaywrightService.js';
import { ContextBuilder } from './services/ContextBuilder.js';
import { Pipeline } from './shared/pipeline/Pipeline.js';
import { Scheduler } from './automator/scheduler/Scheduler.js';
import { createServer } from './server.js';
import type { Response } from 'express';

try { execSync('claude config set reasoning_effort medium', { timeout: 5000 }); } catch {}

const config = new Config();
const db = new Database(config.dataDir);
db.cleanupStaleRuns();
const logger = new StoryLogger(config);

const services = {
  jira: new JiraService(config),
  claude: new ClaudeService(config),
  git: new GitService(config),
  gitlab: new GitLabService(config),
  playwright: new PlaywrightService(config),
  context: new ContextBuilder(config),
};

const sseClients = new Set<Response>();

function emitSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

const pipeline = new Pipeline(db, config, logger, services, emitSSE);
const scheduler = new Scheduler(db, pipeline, emitSSE);
const { app } = createServer(config, db, pipeline, sseClients, () => scheduler.computeAllNextRuns(), services.claude);

app.listen(config.port, () => {
  console.log(`TestGenerator running at http://localhost:${config.port}`);
  console.log(`Project dir: ${config.projectDir}`);
  scheduler.start();
});

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down gracefully...`);
  scheduler.stop();
  if (pipeline.isRunning) {
    console.log('Pipeline is running — requesting cancel and waiting up to 10s...');
    pipeline.cancel();
    const deadline = Date.now() + 10_000;
    while (pipeline.isRunning && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 200));
    }
    if (pipeline.isRunning) console.log('Pipeline did not stop in time — force-exiting');
  }
  services.context.cleanup();
  db.close();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
