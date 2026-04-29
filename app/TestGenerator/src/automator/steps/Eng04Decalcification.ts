import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync, statSync, appendFileSync } from 'fs';
import { resolve, basename } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

const MAX_ROUNDS = 2;
const VERIFY_RUNS = 3;
const CLAUDE_TIMEOUT_MS = 15 * 60 * 1000;

interface RoundLog {
  round: number;
  errorSummary: string;
  fixSummary: string;
  verifyOutcomes: Array<'pass' | 'flaky' | 'fail'>;
  stable: boolean;
}

export class Eng04Decalcification extends Step {
  readonly stepNumber = 104;
  readonly stepName = 'Decalcification';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');
    const elapsed = this.timer();

    if (!existsSync(testrunDir)) {
      return { status: 'pass', message: 'No tests/testrun/ directory — nothing to decalcify', artifacts: [] };
    }

    const flakyFiles = readdirSync(testrunDir).filter(f => f.endsWith('.flaky')).sort();

    if (flakyFiles.length === 0) {
      return { status: 'pass', message: 'No .flaky files — nothing to decalcify', artifacts: [] };
    }

    const targetFile = flakyFiles[0];
    const targetPath = resolve(testrunDir, targetFile);
    const testContent = readFileSync(targetPath, 'utf-8');

    const scenarioName = this.extractField(testContent, '# Scenario:');
    const tags = this.extractField(testContent, 'Tags:');
    const featurePath = this.extractField(testContent, 'Feature:');

    const testId = targetFile.replace(/\.flaky$/, '');
    const logsDir = resolve(testrunDir, testId);
    mkdirSync(logsDir, { recursive: true });
    const ts = () => new Date().toISOString();

    const isTestId = /^[A-Z]+-\d+$/.test(testId);
    const tagId = tags.match(/@TC-\d+/)?.[0] || tags.match(/@SC-\d+/)?.[0] || tags.match(/@EC-\d+/)?.[0] || `@${scenarioName}`;
    const grepId = isTestId ? testId : tagId.replace('@', '');
    const grepPattern = `${grepId}\\b`;

    const startTimeMs = Date.now();
    const roundLogs: RoundLog[] = [];

    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.log(`Decalcify Target: ${testId}`);
    this.log(`Scenario: ${scenarioName}`);
    this.log(`Feature: ${featurePath ? basename(featurePath) : 'unknown'}`);
    this.log(`Tags: ${tags}`);
    this.log(`Remaining .flaky files: ${flakyFiles.length} [${flakyFiles.join(', ')}]`);
    this.log(`Verification: ${VERIFY_RUNS} consecutive runs at --retries=0`);
    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      const roundElapsed = this.timer();
      const roundDir = resolve(logsDir, `decalc-round-${round}`);
      mkdirSync(roundDir, { recursive: true });
      const writeRoundLog = (name: string, content: string) => writeFileSync(resolve(roundDir, name), content, 'utf-8');

      this.log(`┌─── Round ${round}/${MAX_ROUNDS} ─────────────────────────────────────`);

      // ─── Phase 1: Capture flaky failure (single run, no retries) ────────
      this.log(`│ [Phase 1/3] Capture flaky failure`);
      this.log(`│ Command: npx playwright test --grep '${grepId}\\b' --retries=0`);

      const captureStart = this.timer();
      const capture = await ctx.services.playwright.runTest(grepPattern, undefined, { retries: 0 });
      writeRoundLog('01-capture.md', `# Capture run — round ${round} — ${ts()}\n\n- **success:** \`${capture.success}\`\n\n## Output\n\n\`\`\`\n${this.stripAnsi(capture.output)}\n\`\`\`\n`);
      this.log(`│ Capture in ${captureStart()} — exit ${capture.success ? 'SUCCESS' : 'FAILURE'}`);

      const errorSummary = this.extractErrorSummary(capture.output);
      this.log(`│ Error: ${errorSummary}`);

      // ─── Phase 2: Claude heal — narrow to wait/timing fixes ──────────────
      const errorLogPath = resolve(roundDir, '01-capture.md');
      const errorLogSize = existsSync(errorLogPath) ? statSync(errorLogPath).size : 0;
      const testError = this.readLogFile(errorLogPath).substring(0, 8000);

      this.log(`│ [Phase 2/3] Claude heal (deterministic waits)`);
      this.log(`│ Error input: decalc-round-${round}/01-capture.md (${this.formatBytes(errorLogSize)})`);

      let previousAttempts = '';
      if (roundLogs.length > 0) {
        previousAttempts = '\n## PREVIOUS DECALCIFICATION ATTEMPTS\n\n';
        for (const rl of roundLogs) {
          previousAttempts += `### Round ${rl.round} (${rl.stable ? 'STABLE' : 'STILL FLAKY'})\n`;
          previousAttempts += `Error: ${rl.errorSummary}\n`;
          previousAttempts += `Fix attempted: ${rl.fixSummary}\n`;
          previousAttempts += `Verify outcomes: [${rl.verifyOutcomes.join(', ')}]\n\n`;
        }
        previousAttempts += 'Do NOT repeat the same fix. Try a different timing approach.\n';
      }

      const contextContent = ctx.services.context.buildStep7Context();
      const contextFile = ctx.services.context.writeToTempFile(contextContent, 'eng04-context.md');
      const healPrompt = this.buildDecalcPrompt(testContent, testError, previousAttempts, ctx.config.baseUrl);
      writeRoundLog('02-claude-prompt.md', `# Claude prompt — round ${round} — ${ts()}\n\n${healPrompt}`);
      this.log(`│ Prompt size: ${this.formatBytes(healPrompt.length)}`);
      this.log(`│ Calling Claude (timeout: ${CLAUDE_TIMEOUT_MS / 1000}s)...`);

      const claudeStart = this.timer();
      let claudeResult: { result: string };
      try {
        claudeResult = await this.withTimeout(
          ctx.services.claude.promptStreaming(healPrompt, {
            allowedTools: 'Bash,Read,Write,Edit,Grep,Glob',
            appendSystemPromptFile: contextFile,
          }, (chunk) => {
            this.emitClaudeProgress(chunk);
          }),
          CLAUDE_TIMEOUT_MS,
        );
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.log(`│ Claude FAILED after ${claudeStart()}: ${errMsg}`, 'error');
        writeRoundLog('03-claude-response.md', `# Claude FAILED — round ${round} — ${ts()}\n\nError: ${errMsg}`);
        roundLogs.push({ round, errorSummary, fixSummary: `Claude error: ${errMsg}`, verifyOutcomes: [], stable: false });
        if (round >= MAX_ROUNDS) break;
        this.log(`│ Skipping to round ${round + 1}`);
        this.log(`└─── Round ${round} failed (${roundElapsed()}) ─────────────`);
        continue;
      }

      writeRoundLog('03-claude-response.md', `# Claude response — round ${round} — ${ts()}\n\n${claudeResult.result}`);
      this.log(`│ Claude responded in ${claudeStart()} (${this.formatBytes(claudeResult.result.length)})`);

      // ─── Phase 3: Verify with 3 consecutive runs (no retries) ────────────
      this.log(`│ [Phase 3/3] Verify stability — ${VERIFY_RUNS} consecutive runs at --retries=0`);

      const verifyOutcomes: Array<'pass' | 'flaky' | 'fail'> = [];
      let stable = true;

      for (let attempt = 1; attempt <= VERIFY_RUNS; attempt++) {
        const verifyStart = this.timer();
        const verify = await ctx.services.playwright.runTest(grepPattern, undefined, { retries: 0 });
        const noTestsFound = /No tests? found/i.test(verify.output);
        const outcome: 'pass' | 'flaky' | 'fail' = (verify.success && !noTestsFound) ? 'pass' : 'fail';
        verifyOutcomes.push(outcome);

        writeRoundLog(`04-verify-${attempt}.md`, `# Verify ${attempt}/${VERIFY_RUNS} — round ${round} — ${ts()}\n\n- **outcome:** \`${outcome}\`\n\n## Output\n\n\`\`\`\n${this.stripAnsi(verify.output)}\n\`\`\`\n`);

        const icon = outcome === 'pass' ? '✓' : '✗';
        this.log(`│   ${icon} Attempt ${attempt}/${VERIFY_RUNS}: ${outcome.toUpperCase()} (${verifyStart()})`, outcome === 'pass' ? 'info' : 'error');

        if (outcome !== 'pass') {
          stable = false;
          // Continue all runs anyway so the log shows full picture
        }
      }

      const fixSummary = this.summarizeClaudeChanges(claudeResult.result) || '(no file changes detected)';
      roundLogs.push({ round, errorSummary, fixSummary, verifyOutcomes, stable });

      if (stable) {
        unlinkSync(targetPath);
        this.writeSummary(logsDir, testId, scenarioName, round, roundLogs, ts());
        this.appendDecalcReport({
          projectDir: ctx.projectDir, testId, scenarioName, featurePath,
          outcome: 'stabilized', rounds: roundLogs, durationMs: Date.now() - startTimeMs,
        });
        this.log(`│ ✓ STABILIZED in round ${round} — all ${VERIFY_RUNS} runs passed`);
        this.log(`└─── Done — stabilized in ${elapsed()} ──────────────────`);
        return {
          status: 'pass',
          message: `Decalcified "${scenarioName}" in ${round} round(s) — ${flakyFiles.length - 1} remaining`,
          artifacts: [],
          data: { decalcified: scenarioName, scenarioName, rounds: round, remaining: flakyFiles.length - 1, roundLogs },
        };
      }

      this.log(`│ ✗ Round ${round} did not stabilize — outcomes: [${verifyOutcomes.join(', ')}]`);

      if (round >= MAX_ROUNDS) {
        this.log(`└─── Max rounds reached (${elapsed()}) ──────────────`);
        break;
      }

      this.log(`│ Advancing to round ${round + 1}/${MAX_ROUNDS}`);
      this.log(`└─── Round ${round} failed (${roundElapsed()}) ─────────────`);
    }

    // ─── Exhausted — annotate .flaky and return ─────────────────────────────
    this.writeSummary(logsDir, testId, scenarioName, MAX_ROUNDS, roundLogs, ts());
    this.appendDecalcReport({
      projectDir: ctx.projectDir, testId, scenarioName, featurePath,
      outcome: 'unstable', rounds: roundLogs, durationMs: Date.now() - startTimeMs,
    });

    const annotated = `${testContent}\n\n## Decalcification\nResult: still flaky after ${MAX_ROUNDS} round(s)\nLast verify outcomes: [${roundLogs[roundLogs.length - 1]?.verifyOutcomes.join(', ') || 'none'}]\nClassified at: ${ts()}\n`;
    try { writeFileSync(targetPath, annotated, 'utf-8'); } catch { /* skip */ }

    this.log(`✗ GAVE UP after ${MAX_ROUNDS} round(s) — "${scenarioName}" still flaky (${elapsed()})`, 'warn');
    this.log(`Round history:`);
    for (const rl of roundLogs) {
      this.log(`  R${rl.round}: ${rl.stable ? 'STABLE' : 'FLAKY'} — verify [${rl.verifyOutcomes.join(', ')}]`,
        rl.stable ? 'info' : 'warn');
    }

    return {
      status: 'warn',
      message: `Could not stabilize "${scenarioName}" after ${MAX_ROUNDS} round(s) — manual review needed`,
      artifacts: [{ name: basename(targetPath), path: targetPath, type: 'md' }],
      data: { decalcified: null, scenarioName, rounds: MAX_ROUNDS, remaining: flakyFiles.length, roundLogs },
    };
  }

  // ─── Prompt builder ──────────────────────────────────────────────────────
  private buildDecalcPrompt(testContent: string, testError: string, previousAttempts: string, baseUrl: string): string {
    return `You are a senior test automation engineer fixing a FLAKY Playwright-BDD scenario.

A flaky test is one that fails on the first attempt but passes on retry. The test logic is correct — the issue is timing, race conditions, or non-deterministic waits.

## FLAKY SCENARIO

${testContent}

## ACTUAL TEST ERROR (first-attempt failure)

\`\`\`
${testError}
\`\`\`

${previousAttempts}

## PROJECT STRUCTURE

- Feature files: tests/features/*.feature
- Step definitions: tests/steps/*.steps.ts
- XPath properties: tests/properties/*.properties.ts

## TASK — focus exclusively on flakiness mitigation

1. READ the matching step definition file
2. ANALYZE the error to find the racy step (element not yet visible, navigation not complete, network call still pending, etc.)
3. APPLY one or more of these deterministic-wait fixes:
   - Replace arbitrary sleeps (\`waitForTimeout\`) with deterministic waits
   - Add \`await page.waitForLoadState('networkidle')\` after navigation
   - Add \`await page.waitForURL(...)\` after route changes
   - Add \`await expect(locator).toBeVisible({ timeout: 10000 })\` before interactions
   - Increase \`toBeVisible\`/\`toBeEnabled\` timeouts on the racy step (default 5s → 10–15s)
   - Wait for a specific network response when relevant
4. DO NOT modify the .feature file
5. DO NOT change XPath selectors unless the error proves the selector is wrong (rare for flake)
6. DO NOT refactor — minimal, targeted fix only

## RULES

- KISS — smallest possible diff
- Only touch .steps.ts files (occasionally .properties.ts if a brittle selector is the cause)
- Test URL: ${baseUrl}spa
- Avoid arbitrary sleeps — they mask flake instead of fixing it`;
  }

  // ─── Summary writer ──────────────────────────────────────────────────────
  private writeSummary(logsDir: string, testId: string, scenarioName: string, totalRounds: number, roundLogs: RoundLog[], timestamp: string): void {
    const stable = roundLogs.some(r => r.stable);
    const lines: string[] = [
      `# Decalcification Summary: ${testId}`,
      `Scenario: ${scenarioName}`,
      `Result: ${stable ? 'STABILIZED' : 'STILL FLAKY'}`,
      `Rounds: ${totalRounds}`,
      `Verification runs per round: ${VERIFY_RUNS}`,
      `Timestamp: ${timestamp}`,
      '',
    ];

    for (const rl of roundLogs) {
      lines.push(`## Round ${rl.round} — ${rl.stable ? 'STABLE' : 'FLAKY'}`);
      lines.push(`Error: ${rl.errorSummary}`);
      lines.push(`Fix: ${rl.fixSummary}`);
      lines.push(`Verify: [${rl.verifyOutcomes.join(', ')}]`);
      lines.push('');
    }

    writeFileSync(resolve(logsDir, 'decalc-summary.md'), lines.join('\n'), 'utf-8');
  }

  // ─── Reusable decalcification log ────────────────────────────────────────
  private appendDecalcReport(opts: {
    projectDir: string;
    testId: string;
    scenarioName: string;
    featurePath: string;
    outcome: 'stabilized' | 'unstable';
    rounds: RoundLog[];
    durationMs: number;
  }): void {
    const reportDir = resolve(opts.projectDir, 'app', 'TestGenerator', 'logs', 'decalcification');
    try { mkdirSync(reportDir, { recursive: true }); } catch { /* ok */ }
    const logFile = resolve(reportDir, `scenario-${opts.testId}.log`);

    const fmtDur = (ms: number) => {
      const s = Math.round(ms / 1000);
      return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
    };
    const icon = opts.outcome === 'stabilized' ? '✓' : '⚠';
    const verdict = opts.outcome === 'stabilized' ? 'STABILIZED' : 'STILL FLAKY';

    const lines: string[] = [];
    if (!existsSync(logFile)) {
      lines.push(`# ${opts.testId} — ${opts.scenarioName}`);
      lines.push('');
      lines.push(`**Feature:** \`${opts.featurePath ? basename(opts.featurePath) : 'unknown'}\``);
      lines.push('');
    }
    lines.push(`## ${icon} Attempt — ${new Date().toISOString()} — ${verdict} (${fmtDur(opts.durationMs)})`);
    lines.push('');
    lines.push(`**Rounds:** ${opts.rounds.length}  |  **Outcome:** ${verdict}  |  **Duration:** ${fmtDur(opts.durationMs)}`);
    lines.push('');

    if (opts.rounds.length > 0) {
      lines.push('### Rounds');
      lines.push('');
      for (const r of opts.rounds) {
        const rIcon = r.stable ? '✅' : '⚠️';
        lines.push(`${r.round}. ${rIcon} ${r.stable ? 'STABLE' : 'FLAKY'} — verify [${r.verifyOutcomes.join(', ')}]`);
        if (r.errorSummary) lines.push(`   - error: \`${r.errorSummary.substring(0, 120).replace(/`/g, "'")}\``);
        if (r.fixSummary) lines.push(`   - fix: ${r.fixSummary.substring(0, 200).replace(/`/g, "'")}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    try { appendFileSync(logFile, lines.join('\n'), 'utf-8'); } catch (err) {
      this.log(`Failed to write decalcification report: ${err instanceof Error ? err.message : String(err)}`, 'warn');
    }
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

  private extractErrorSummary(logContent: string): string {
    const lines = logContent.split('\n');
    const failLine = lines.find(l => /^\s+\d+\)\s+\[/.test(l));
    if (failLine) return failLine.trim();
    const errorLine = lines.find(l => /^(Error|Timeout)/.test(l.trim()));
    if (errorLine) return errorLine.trim();
    const noTests = lines.find(l => /No tests found/.test(l));
    if (noTests) return 'No tests found — grep pattern matched nothing';
    return 'Unknown error — see capture log';
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
      stepNumber: 104,
      level: 'debug',
      message: trimmed,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  private summarizeClaudeChanges(response: string): string {
    const files = new Set<string>();
    const patterns = [
      /(?:Edit|Writ|Creat)(?:ed|ing)\s+[`"]?([^\s`"]+\.(?:ts|properties\.ts|feature))/gi,
      /(?:updated|modified|created|wrote)\s+[`"]?([^\s`"]+\.(?:ts|properties\.ts|feature))/gi,
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

  private extractField(content: string, prefix: string): string {
    const line = content.split('\n').find(l => l.startsWith(prefix));
    return line ? line.substring(prefix.length).trim() : '';
  }

  private readLogFile(path: string): string {
    if (!existsSync(path)) return '';
    return readFileSync(path, 'utf-8');
  }
}
