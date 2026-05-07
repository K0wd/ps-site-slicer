import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, basename } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';
import { findLatestTestRunDir } from './stepUtils.js';

const CLAUDE_TIMEOUT_MS = 15 * 60 * 1000;

export class Step08ExecuteTests extends Step {
  readonly stepNumber = 8;
  readonly stepName = 'Execute Tests';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const planFile = resolve(ticketDir, '5_plan.md');
    const elapsed = this.timer();

    ctx.logger.logStep(8, 'Execute Tests');

    if (!existsSync(planFile) && ctx.runPrerequisite) {
      this.log('Test plan not found — auto-running step 5...');
      const p = await ctx.runPrerequisite(5);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 5 failed: ${p.message}`, artifacts: [] };
    }
    if (!existsSync(planFile)) {
      return { status: 'fail', message: 'Test plan not found. Run step 5 first.', artifacts: [] };
    }

    let runDir = findLatestTestRunDir(ticketDir);
    if (!runDir && ctx.runPrerequisite) {
      this.log('No test-run directory — auto-running step 7...');
      const p = await ctx.runPrerequisite(7);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 7 failed: ${p.message}`, artifacts: [] };
      runDir = findLatestTestRunDir(ticketDir);
    }
    if (!runDir) {
      return { status: 'fail', message: 'No test-run directory found. Run step 7 first.', artifacts: [] };
    }

    const tcSuffix = ctx.tcId ? `_${ctx.tcId}` : '';
    const resultsFile = resolve(runDir, `8_results${tcSuffix}.md`);
    const executionLogFile = resolve(runDir, `8_execution_log${tcSuffix}.md`);
    const screenshotsDir = resolve(runDir, '7_tc_logs');
    mkdirSync(screenshotsDir, { recursive: true });

    const planContent = readFileSync(planFile, 'utf-8');

    // Build context
    const contextContent = ctx.services.context.buildBaseContext();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step8-context.md');

    // Resolve HTML context
    const featureFile = resolve(ctx.projectDir, 'tests', 'features', `${ticketKey}.feature`);
    const htmlDir = resolve(ctx.projectDir, 'html');
    const htmlContext = this.resolveHtmlContext(featureFile, htmlDir);

    const dateStr = new Date().toISOString().split('T')[0];

    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.log(`Execute Tests: ${ticketKey}${ctx.tcId ? ` (${ctx.tcId})` : ''}`);
    this.log(`Plan: ${basename(planFile)} (${this.formatBytes(statSync(planFile).size)})`);
    this.log(`System prompt: ${this.formatBytes(contextContent.length)}`);
    if (htmlContext) this.log(`HTML context: ${basename(featureFile, '.feature')}.html (${this.formatBytes(htmlContext.length)})`);
    else this.log(`HTML context: none found`, 'warn');
    this.log(`Screenshots: ${screenshotsDir}`);
    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const scopeNote = ctx.tcId
      ? `\n## SCOPE\n\nExecute ONLY the test case **${ctx.tcId}** from the plan below. Skip every other scenario.\n`
      : '';

    const prompt = `You are an automated QA tester. Execute the test plan below using Playwright against the test server.${scopeNote}
Test environment:
- SM project URL: ${ctx.config.baseUrl}spa
- SM-PWA project URL: ${ctx.config.baseUrl}testpwa
- Certmgr React app: ${ctx.config.baseUrl}main/cmdist/
- Credentials: username: ${ctx.config.testUsername} / password: ${ctx.config.testPassword}

For each test case${ctx.tcId ? ` (only ${ctx.tcId})` : ''}:
1. Run the test steps in a browser using Playwright
2. Capture a screenshot to: ${screenshotsDir}/${ctx.tcId ? `${ctx.tcId}.png` : '<test-case-name>.png'}
3. Record the actual result (PASS/FAIL + brief note)

After all tests, write the full results to: ${resultsFile}
Use this exact markdown format:

# Test Results — ${ticketKey}

| Field | Value |
|-------|-------|
| **Environment** | ${ctx.config.baseUrl} |
| **Tested by** | Claude Code + Playwright |
| **Date** | ${dateStr} |

## Test Cases

| Test Case | Result | Notes |
|-----------|--------|-------|
| \`<test case name>\` | PASS / FAIL / SKIP | <brief note> |

## Summary

<2-3 sentence summary>

## Verdict

\`\`\`
RESULT: PASS
\`\`\`
(or RESULT: FAIL or RESULT: NOT TESTED)

${htmlContext || ''}

--- Test Plan ---
${planContent}`;

    this.log(`┌─── Claude execution ─────────────────────────────`);
    this.log(`│ Prompt: ${this.formatBytes(prompt.length)}`);
    this.log(`│ Calling Claude (timeout: ${CLAUDE_TIMEOUT_MS / 1000}s)...`);

    const claudeStart = this.timer();
    let result: { result: string };
    try {
      result = await this.withTimeout(
        ctx.services.claude.promptStreaming(prompt, {
          allowedTools: 'Bash,Read,Write,Edit,Grep,Glob,mcp__context7,mcp__playwright',
          appendSystemPromptFile: contextFile,
        }, (chunk) => {
          this.emitClaudeProgress(chunk);
        }),
        CLAUDE_TIMEOUT_MS,
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.log(`│ Claude FAILED after ${claudeStart()}: ${errMsg}`, 'error');
      writeFileSync(executionLogFile, `Claude error: ${errMsg}`, 'utf-8');
      this.log(`└─── FAILED (${elapsed()}) ────────────────────────`);
      return { status: 'fail', message: `Claude failed: ${errMsg}`, artifacts: [{ name: `8_execution_log${tcSuffix}.md`, path: executionLogFile, type: 'md' }] };
    }

    const responseSize = result.result.length;
    const filesChanged = this.summarizeClaudeChanges(result.result);
    this.log(`│ Claude responded in ${claudeStart()} (${this.formatBytes(responseSize)})`);
    if (filesChanged) this.log(`│ Files changed: ${filesChanged}`);

    writeFileSync(executionLogFile, result.result, 'utf-8');
    this.log(`│ Wrote: 8_execution_log${tcSuffix}.md`);

    // Parse verdict from results file if Claude wrote it
    let verdict = 'UNKNOWN';
    if (existsSync(resultsFile)) {
      const resultsContent = readFileSync(resultsFile, 'utf-8');
      const verdictMatch = resultsContent.match(/RESULT:\s*(PASS|FAIL|NOT TESTED)/i);
      if (verdictMatch) verdict = verdictMatch[1].toUpperCase();
      this.log(`│ Results file: 8_results${tcSuffix}.md — verdict: ${verdict}`);
    } else {
      this.log(`│ Results file not written by Claude`, 'warn');
    }

    const status = verdict === 'PASS' ? 'pass' : verdict === 'FAIL' ? 'warn' : 'warn';
    this.log(`└─── ${verdict} (${elapsed()}) ────────────────────────`);

    ctx.logger.logInfo(`Execution log: \`8_execution_log${tcSuffix}.md\``);
    ctx.logger.logResult(verdict === 'PASS' ? 'PASS' : 'WARN', `Test execution complete for ${ticketKey}${ctx.tcId ? ` (${ctx.tcId})` : ''} — ${verdict}`);

    return {
      status,
      message: `Test execution complete${ctx.tcId ? ` for ${ctx.tcId}` : ''} — ${verdict}`,
      artifacts: [
        { name: `8_execution_log${tcSuffix}.md`, path: executionLogFile, type: 'md' },
        ...(existsSync(resultsFile) ? [{ name: `8_results${tcSuffix}.md`, path: resultsFile, type: 'md' as const }] : []),
      ],
      data: { verdict },
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private timer(): () => string {
    const start = Date.now();
    return () => {
      const ms = Date.now() - start;
      if (ms < 1000) return `${ms}ms`;
      const s = Math.floor(ms / 1000);
      if (s < 60) return `${s}s`;
      return `${Math.floor(s / 60)}m ${s % 60}s`;
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out after ${Math.round(ms / 1000)}s`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private emitClaudeProgress(chunk: string): void {
    const trimmed = chunk.trimEnd();
    if (!trimmed) return;

    const readMatch = trimmed.match(/Read(?:ing)?\s+[`"]?([^\s`"]+)/i);
    const editMatch = trimmed.match(/Edit(?:ing)?\s+[`"]?([^\s`"]+)/i);
    const writeMatch = trimmed.match(/Writ(?:e|ing)\s+[`"]?([^\s`"]+)/i);

    if (readMatch) this.log(`│ Claude → read ${readMatch[1]}`);
    else if (editMatch) this.log(`│ Claude → edit ${editMatch[1]}`);
    else if (writeMatch) this.log(`│ Claude → write ${writeMatch[1]}`);

    this.ctx.emitSSE('log', {
      stepNumber: 8,
      level: 'debug',
      message: trimmed,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  private summarizeClaudeChanges(response: string): string {
    const files = new Set<string>();
    const patterns = [
      /(?:Edit|Writ|Creat)(?:ed|ing)\s+[`"]?([^\s`"]+\.(?:ts|properties\.ts|feature|png|md))/gi,
      /(?:updated|modified|created|wrote)\s+[`"]?([^\s`"]+\.(?:ts|properties\.ts|feature|png|md))/gi,
    ];
    for (const pattern of patterns) {
      for (const match of response.matchAll(pattern)) {
        const file = basename(match[1]);
        if (file) files.add(file);
      }
    }
    if (files.size === 0) return '';
    return [...files].join(', ');
  }

  private resolveHtmlContext(featurePath: string, htmlDir: string): string {
    if (!existsSync(htmlDir)) return '';
    const featureName = basename(featurePath, '.feature');
    const htmlFile = resolve(htmlDir, `${featureName}.html`);
    if (!existsSync(htmlFile)) return '';
    try {
      const content = readFileSync(htmlFile, 'utf-8');
      const size = statSync(htmlFile).size;
      return `## HTML PAGE SNAPSHOT (${this.formatBytes(size)})\n\nUse this DOM structure as reference when verifying page elements:\n\n\`\`\`html\n${content.substring(0, 15000)}\n\`\`\`\n`;
    } catch { return ''; }
  }
}
