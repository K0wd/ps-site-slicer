import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync, copyFileSync, statSync, appendFileSync } from 'fs';
import { resolve, basename, relative } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

const MAX_ROUNDS = 2;
const CLAUDE_TIMEOUT_MS = 15 * 60 * 1000;
const CLASSIFY_TIMEOUT_MS = 3 * 60 * 1000;

interface RoundLog {
  round: number;
  errorSummary: string;
  fixSummary: string;
  passed: boolean;
}

export class Eng03HealScenario extends Step {
  readonly stepNumber = 103;
  readonly stepName = 'Healing';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');
    const elapsed = this.timer();

    // ─── Auto-run prerequisites if no .test files to heal ────────────────────
    const hasTestFiles = () => existsSync(testrunDir) && readdirSync(testrunDir).some(f => f.endsWith('.test'));
    const hasInProgressHeal = () => existsSync(testrunDir) && readdirSync(testrunDir)
      .some(f => f.endsWith('.test') && existsSync(resolve(testrunDir, f.replace('.test', ''), 'heal-state.json')));

    if (!hasInProgressHeal() && !hasTestFiles() && ctx.runPrerequisite) {
      this.log('No .test files found — running prerequisites');
      this.log('Running Step 101 (Check Steps)...');
      const step101 = await ctx.runPrerequisite(101);
      this.log(`Step 101 result: ${step101.status} — ${step101.message} (${elapsed()})`);

      if (step101.status === 'fail') {
        this.log('Step 101 found missing steps — will heal from .test files');
      } else {
        this.log('Step 101 passed — running Step 102 (Run Tests)...');
        const step102 = await ctx.runPrerequisite(102);
        this.log(`Step 102 result: ${step102.status} — ${step102.message} (${elapsed()})`);

        if (step102.status === 'pass') {
          this.log('All tests green — nothing to heal');
          return { status: 'pass', message: 'All steps defined and all tests passing — nothing to heal', artifacts: [] };
        }
        this.log('Step 102 found a failure — proceeding to heal');
      }
    }

    if (!existsSync(testrunDir)) {
      return { status: 'warn', message: 'No tests/testrun/ directory — run Step 101 first', artifacts: [] };
    }

    const testFiles = readdirSync(testrunDir).filter(f => f.endsWith('.test')).sort();

    if (testFiles.length === 0) {
      return { status: 'pass', message: 'No .test files to heal — all scenarios are healthy', artifacts: [] };
    }

    const targetFile = testFiles[0];
    const targetPath = resolve(testrunDir, targetFile);
    const testContent = readFileSync(targetPath, 'utf-8');

    const scenarioName = this.extractField(testContent, '# Scenario:');
    const tags = this.extractField(testContent, 'Tags:');
    const featurePath = this.extractField(testContent, 'Feature:');
    const failureType = this.extractField(testContent, 'Type:');

    const testId = targetFile.replace(/\.test$/, '');
    const logsDir = resolve(testrunDir, testId);
    mkdirSync(logsDir, { recursive: true });
    const ts = () => new Date().toISOString();

    const isTestId = /^[A-Z]+-\d+$/.test(testId);
    const tagId = tags.match(/@TC-\d+/)?.[0] || tags.match(/@SC-\d+/)?.[0] || tags.match(/@EC-\d+/)?.[0] || `@${scenarioName}`;
    const grepId = isTestId ? testId : tagId.replace('@', '');
    const grepPattern = `${grepId}\\b`;

    const debug = ctx.options?.debugHeal === true;
    const stateFile = resolve(logsDir, 'heal-state.json');
    const healState = this.readState(stateFile);

    // Snapshot relevant project files BEFORE heal so we can diff at the end.
    // Captures: tests/properties/*.properties.ts, tests/steps/*.steps.ts, the feature file.
    const fileSnapshot = this.snapshotProjectFiles(ctx.projectDir, featurePath);
    const healStartTime = Date.now();

    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.log(`Heal Target: ${testId}`);
    this.log(`Scenario: ${scenarioName}`);
    this.log(`Feature: ${featurePath ? basename(featurePath) : 'unknown'}`);
    this.log(`Tags: ${tags}`);
    this.log(`Type: ${failureType || 'unknown'}`);
    this.log(`Remaining .test files: ${testFiles.length} [${testFiles.join(', ')}]`);
    this.log(`Logs: tests/testrun/${testId}/`);
    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    let round = healState.round || 1;
    let phase = debug ? (healState.phase || 0) : 0;
    const roundLogs: RoundLog[] = healState.roundLogs || [];

    if (healState.round) {
      this.log(`Resuming from saved state: round ${round}, phase ${phase}`);
      if (roundLogs.length > 0) {
        this.log(`Previous rounds:`);
        for (const rl of roundLogs) {
          this.log(`  Round ${rl.round}: ${rl.passed ? 'PASSED' : 'FAILED'} — ${rl.errorSummary.substring(0, 80)}`);
        }
      }
    }

    if (debug) this.log(`Debug mode ON — round ${round}, phase ${phase + 1}/3`);

    // ═══ MAIN HEAL LOOP ═════════════════════════════════════════════════════
    while (round <= MAX_ROUNDS) {
      const roundElapsed = this.timer();
      const roundDir = resolve(logsDir, `round-${round}`);
      mkdirSync(roundDir, { recursive: true });
      const writeRoundLog = (name: string, content: string) => writeFileSync(resolve(roundDir, name), content, 'utf-8');

      this.log(`┌─── Round ${round}/${MAX_ROUNDS} ─────────────────────────────────────`);

      // ─── Phase 1: Run targeted test ──────────────────────────────────────
      if (phase === 0) {
        this.log(`│ [Phase 1/3] Run test`);
        this.log(`│ Command: npx bddgen && npx playwright test --grep '${grepId}\\b' --project chromium`);

        const prevRoundAfter = resolve(logsDir, `round-${round - 1}`, '04-test-after.md');
        if (round > 1 && existsSync(prevRoundAfter)) {
          copyFileSync(prevRoundAfter, resolve(roundDir, '01-test-before.md'));
          const size = statSync(resolve(roundDir, '01-test-before.md')).size;
          this.log(`│ Carried forward round-${round - 1}/04-test-after.md (${this.formatBytes(size)})`);
        } else {
          const testStart = this.timer();
          const testRun = await ctx.services.playwright.runTest(grepPattern);
          writeRoundLog('01-test-before.md', `# Test run — round ${round} — ${ts()}\n\n- **grep:** \`${grepPattern}\`\n- **success:** \`${testRun.success}\`\n\n## Output\n\n\`\`\`\n${this.stripAnsi(testRun.output)}\n\`\`\`\n`);
          this.log(`│ Test completed in ${testStart()}`);
          this.log(`│ Exit status: ${testRun.success ? 'SUCCESS' : 'FAILURE'}`);
          this.logTestResults(testRun.output, testRun.success, '│ ');

          if (testRun.success && testRun.output.includes('passed') && !testRun.output.includes('failed')) {
            this.cleanState(stateFile);
            this.writeSummary(logsDir, testId, scenarioName, 0, roundLogs, ts());
            this.appendHealingReport({
              projectDir: ctx.projectDir, testId, scenarioName, featurePath, failureType,
              outcome: 'already-passing', rounds: [], beforeSnapshot: fileSnapshot,
              initialError: '', durationMs: Date.now() - healStartTime,
            });
            unlinkSync(targetPath);
            this.log(`│ Test already passes — .test file removed`);
            this.log(`└─── Done (${elapsed()}) ────────────────────────────`);
            return {
              status: 'pass',
              message: `"${scenarioName}" already passes — ${testFiles.length - 1} scenario(s) remaining`,
              artifacts: [],
              data: { healed: scenarioName, scenarioName, remaining: testFiles.length - 1, alreadyPassing: true, roundLogs: [] },
            };
          }
        }

        this.log(`│ Wrote: round-${round}/01-test-before.md`);

        if (debug) {
          this.writeState(stateFile, { round, phase: 1, roundLogs });
          this.log(`│ Debug pause after phase 1 (${roundElapsed()})`);
          this.log(`└─── ► Click play to continue to phase 2 ──────────`);
          return {
            status: 'warn',
            message: `[R${round} Debug 1/3] Test failed — click again to heal`,
            artifacts: [{ name: '01-test-before.md', path: resolve(roundDir, '01-test-before.md'), type: 'md' }],
            data: { debugPhase: 1, round, testId, remaining: testFiles.length },
          };
        }
        phase = 1;
      }

      // ─── Phase 2: Claude fix ─────────────────────────────────────────────
      if (phase <= 1) {
        const errorLogPath = resolve(roundDir, '01-test-before.md');
        const errorLogSize = existsSync(errorLogPath) ? statSync(errorLogPath).size : 0;
        const testError = this.readLogFile(errorLogPath).substring(0, 8000);

        this.log(`│ [Phase 2/3] Claude heal`);
        this.log(`│ Error input: round-${round}/01-test-before.md (${this.formatBytes(errorLogSize)})`);

        // Report what we're feeding Claude
        const errorPreview = this.extractErrorSummary(testError);
        this.log(`│ Error: ${errorPreview}`);

        const htmlDir = resolve(ctx.projectDir, 'html');
        const htmlContext = this.resolveHtmlContext(featurePath, htmlDir);
        if (htmlContext) {
          const featureName = basename(featurePath, '.feature');
          this.log(`│ HTML context: ${featureName}.html (${this.formatBytes(htmlContext.length)})`);
        } else {
          this.log(`│ HTML context: none found`, 'warn');
        }

        let previousAttempts = '';
        if (roundLogs.length > 0) {
          previousAttempts = '\n## PREVIOUS HEAL ATTEMPTS\n\n';
          for (const rl of roundLogs) {
            previousAttempts += `### Round ${rl.round} (${rl.passed ? 'PASSED' : 'FAILED'})\n`;
            previousAttempts += `Error: ${rl.errorSummary}\n`;
            previousAttempts += `Fix attempted: ${rl.fixSummary}\n\n`;
          }
          previousAttempts += 'Do NOT repeat the same fix. Try a different approach.\n';
          this.log(`│ Including ${roundLogs.length} previous attempt(s) as context for Claude`);
        }

        const contextContent = ctx.services.context.buildStep7Context();
        const contextFile = ctx.services.context.writeToTempFile(contextContent, 'eng03-context.md');
        this.log(`│ System prompt context: ${this.formatBytes(contextContent.length)}`);

        const healPrompt = this.buildHealPrompt(testContent, testError, htmlContext, previousAttempts, ctx.config.baseUrl);
        writeRoundLog('02-claude-prompt.md', `# Claude heal prompt — round ${round} — ${ts()}\n\n${healPrompt}`);
        this.log(`│ Prompt size: ${this.formatBytes(healPrompt.length)}`);
        this.log(`│ Wrote: round-${round}/02-claude-prompt.md`);
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
          roundLogs.push({ round, errorSummary: this.extractErrorSummary(testError), fixSummary: `Claude error: ${errMsg}`, passed: false });

          if (round >= MAX_ROUNDS) break;
          this.log(`│ Skipping to round ${round + 1} due to Claude failure`);
          this.log(`└─── Round ${round} failed (${roundElapsed()}) ─────────────`);
          round++;
          phase = 0;
          this.writeState(stateFile, { round, phase, roundLogs });
          continue;
        }

        writeRoundLog('03-claude-response.md', `# Claude response — round ${round} — ${ts()}\n\n${claudeResult.result}`);
        const responseSize = claudeResult.result.length;
        const filesChanged = this.summarizeClaudeChanges(claudeResult.result);
        this.log(`│ Claude responded in ${claudeStart()} (${this.formatBytes(responseSize)})`);
        if (filesChanged) this.log(`│ Files changed: ${filesChanged}`);
        this.log(`│ Wrote: round-${round}/03-claude-response.md`);

        if (debug) {
          this.writeState(stateFile, { round, phase: 2, roundLogs });
          this.log(`│ Debug pause after phase 2 (${roundElapsed()})`);
          this.log(`└─── ► Click play to verify fix ────────────────────`);
          return {
            status: 'warn',
            message: `[R${round} Debug 2/3] Claude applied fix — click again to verify`,
            artifacts: [{ name: '03-claude-response.md', path: resolve(roundDir, '03-claude-response.md'), type: 'md' }],
            data: { debugPhase: 2, round, testId, remaining: testFiles.length },
          };
        }
        phase = 2;
      }

      // ─── Phase 3: Verify ─────────────────────────────────────────────────
      this.log(`│ [Phase 3/3] Verify fix`);
      this.log(`│ Command: npx bddgen && npx playwright test --grep '${grepId}\\b' --project chromium`);

      const verifyStart = this.timer();
      const verify = await ctx.services.playwright.runTest(grepPattern);
      writeRoundLog('04-test-after.md', `# Test run AFTER heal — round ${round} — ${ts()}\n\n- **grep:** \`${grepPattern}\`\n- **success:** \`${verify.success}\`\n\n## Output\n\n\`\`\`\n${this.stripAnsi(verify.output)}\n\`\`\`\n`);
      this.log(`│ Verify completed in ${verifyStart()}`);
      this.log(`│ Exit status: ${verify.success ? 'SUCCESS' : 'FAILURE'}`);
      this.logTestResults(verify.output, verify.success, '│ ');
      this.log(`│ Wrote: round-${round}/04-test-after.md`);

      const passed = verify.success ||
        (verify.output.includes('passed') && !verify.output.includes('failed'));

      const errorSummary = this.extractErrorSummary(this.readLogFile(resolve(roundDir, '01-test-before.md')));
      const claudeLog = this.readLogFile(resolve(roundDir, '03-claude-response.md'));
      roundLogs.push({ round, errorSummary, fixSummary: claudeLog.substring(0, 500).replace(/\n/g, ' ').trim(), passed });

      if (passed) {
        this.cleanState(stateFile);
        this.writeSummary(logsDir, testId, scenarioName, round, roundLogs, ts());
        this.appendHealingReport({
          projectDir: ctx.projectDir, testId, scenarioName, featurePath, failureType,
          outcome: 'healed', rounds: roundLogs, beforeSnapshot: fileSnapshot,
          initialError: roundLogs[0]?.errorSummary || '', durationMs: Date.now() - healStartTime,
        });
        unlinkSync(targetPath);
        this.log(`│ ✓ HEALED in round ${round}`);
        this.log(`└─── Done — healed in ${elapsed()} ──────────────────`);
        return {
          status: 'pass',
          message: `Healed "${scenarioName}" in ${round} round(s) — ${testFiles.length - 1} remaining`,
          artifacts: [],
          data: { healed: scenarioName, scenarioName, rounds: round, remaining: testFiles.length - 1, roundLogs },
        };
      }

      // Failed — advance
      this.log(`│ ✗ Round ${round} did not fix the issue`);

      if (round >= MAX_ROUNDS) {
        this.log(`└─── Max rounds reached (${elapsed()}) ──────────────`);
        break;
      }

      const nextRound = round + 1;
      this.log(`│ Advancing to round ${nextRound}/${MAX_ROUNDS}`);
      this.log(`└─── Round ${round} failed (${roundElapsed()}) ─────────────`);

      if (debug) {
        this.writeState(stateFile, { round: nextRound, phase: 0, roundLogs });
        this.log(`► Click play to start round ${nextRound}`);
        return {
          status: 'warn',
          message: `[R${round} failed] Round ${nextRound} ready — click play`,
          artifacts: [{ name: '04-test-after.md', path: resolve(roundDir, '04-test-after.md'), type: 'md' }],
          data: { debugPhase: 0, round: nextRound, testId, remaining: testFiles.length },
        };
      }

      round = nextRound;
      phase = 0;
      this.writeState(stateFile, { round, phase, roundLogs });
    }

    // ─── Exhausted all rounds — classify root cause ──────────────────────────
    this.cleanState(stateFile);
    this.writeSummary(logsDir, testId, scenarioName, round, roundLogs, ts());
    this.log(`✗ GAVE UP after ${round} round(s) — "${scenarioName}" (${elapsed()})`, 'error');

    this.log(`Classifying root cause via Claude...`);
    const classification = await this.classifyFailure(ctx, testContent, roundLogs, logsDir);
    this.log(`Classification: ${classification.category.toUpperCase()} — ${classification.reasoning}`,
      classification.category === 'bug' ? 'warn' :
      classification.category === 'not-implemented' ? 'warn' : 'error');

    // Rename .test → .test.<category> for bug/not-implemented so the heal scanner
    // skips them on subsequent passes. heal-exhausted leaves .test in place.
    let finalArtifactPath = targetPath;
    if (classification.category !== 'heal-exhausted') {
      const newPath = `${targetPath}.${classification.category}`;
      try {
        const original = readFileSync(targetPath, 'utf-8');
        const annotated = `${original}\n\n## Classification\nCategory: ${classification.category}\nReasoning: ${classification.reasoning}\nClassified at: ${ts()}\n`;
        writeFileSync(newPath, annotated, 'utf-8');
        unlinkSync(targetPath);
        finalArtifactPath = newPath;
        this.log(`Marked as ${classification.category}: ${basename(newPath)}`);
      } catch (err) {
        this.log(`Failed to mark scenario file: ${err instanceof Error ? err.message : err}`, 'warn');
      }
    }

    this.appendHealingReport({
      projectDir: ctx.projectDir, testId, scenarioName, featurePath, failureType,
      outcome: 'unhealable', rounds: roundLogs, beforeSnapshot: fileSnapshot,
      initialError: roundLogs[0]?.errorSummary || '', durationMs: Date.now() - healStartTime,
      classification,
    });

    this.log(`Round history:`);
    for (const rl of roundLogs) {
      this.log(`  R${rl.round}: ${rl.passed ? 'PASS' : 'FAIL'} — ${rl.errorSummary.substring(0, 80)}`, rl.passed ? 'info' : 'error');
    }

    return {
      status: classification.category === 'heal-exhausted' ? 'fail' : 'warn',
      message: `${classification.category}: ${classification.reasoning.substring(0, 120)}`,
      artifacts: [{ name: basename(finalArtifactPath), path: finalArtifactPath, type: 'md' }],
      data: {
        healed: null,
        scenarioName,
        rounds: round,
        remaining: testFiles.length,
        classification: classification.category,
        reasoning: classification.reasoning,
        roundLogs,
      },
    };
  }

  // ─── Prompt builder ──────────────────────────────────────────────────────
  private buildHealPrompt(testContent: string, testError: string, htmlContext: string, previousAttempts: string, baseUrl: string): string {
    return `You are a senior test automation engineer fixing a failing Playwright-BDD scenario.

## FAILING SCENARIO

${testContent}

## ACTUAL TEST ERROR OUTPUT

\`\`\`
${testError}
\`\`\`

${htmlContext}
${previousAttempts}

## PROJECT STRUCTURE

- Feature files: tests/features/*.feature
- Step definitions: tests/steps/*.steps.ts
- XPath properties: tests/properties/*.properties.ts
- HTML page snapshots: html/*.html (DOM reference for building XPaths)

## EXISTING STEP FILE PATTERN

Step files follow this pattern:
\`\`\`typescript
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { SELECTOR_NAME } from '../properties/<page>.properties';

const { Given, When, Then } = createBdd();

When('step text', async ({ page }) => {
  const el = page.locator(\`xpath=\${SELECTOR_NAME}\`);
  await expect(el).toBeVisible({ timeout: 10000 });
});
\`\`\`

## TASK

1. READ the feature file, the matching step definition file, and the matching properties file
2. READ the HTML page snapshot listed above to understand the page DOM structure
3. ANALYZE the test error output to determine the root cause
4. FIX the issue:
   - Missing step definition → implement it in the correct .steps.ts file using the existing pattern
   - Broken XPath selector → fix it in the .properties.ts file using the HTML snapshot as reference
   - Timing issue → add deterministic waits (waitForLoadState, toBeVisible)
5. DO NOT modify the .feature file unless the Gherkin itself is clearly wrong

## RULES

- XPath ONLY — no CSS selectors
- Use \`page.locator(\`xpath=\${SELECTOR}\`)\` pattern
- Define XPath selectors in .properties.ts, import them in .steps.ts
- Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible
- Test URL: ${baseUrl}spa
- Keep it KISS — minimal fix, don't refactor surrounding code`;
  }

  // ─── Summary writer ──────────────────────────────────────────────────────
  private writeSummary(logsDir: string, testId: string, scenarioName: string, totalRounds: number, roundLogs: RoundLog[], timestamp: string): void {
    const healed = roundLogs.some(r => r.passed);
    const lines: string[] = [
      `# Heal Summary: ${testId}`,
      `Scenario: ${scenarioName}`,
      `Result: ${healed ? 'HEALED' : 'FAILED'}`,
      `Rounds: ${totalRounds}`,
      `Timestamp: ${timestamp}`,
      '',
    ];

    if (totalRounds === 0) {
      lines.push('Test was already passing — no heal needed.');
    } else {
      for (const rl of roundLogs) {
        lines.push(`## Round ${rl.round} — ${rl.passed ? 'PASSED' : 'FAILED'}`);
        lines.push(`Error: ${rl.errorSummary}`);
        lines.push(`Fix: ${rl.fixSummary}`);
        lines.push('');
      }

      if (healed) {
        const winningRound = roundLogs.find(r => r.passed);
        lines.push('## What Worked');
        lines.push(`The fix in round ${winningRound?.round} resolved the issue.`);
        lines.push(`Approach: ${winningRound?.fixSummary}`);
      } else {
        lines.push('## What Failed');
        lines.push(`After ${totalRounds} round(s), the scenario still fails.`);
        lines.push('Manual investigation needed.');
      }
    }

    writeFileSync(resolve(logsDir, 'summary.md'), lines.join('\n'), 'utf-8');
  }

  // ─── Failure classifier (decides bug / not-implemented / heal-exhausted) ─
  private async classifyFailure(
    ctx: StepContext,
    testContent: string,
    roundLogs: RoundLog[],
    logsDir: string,
  ): Promise<{ category: 'bug' | 'not-implemented' | 'heal-exhausted'; reasoning: string }> {
    const roundsBlock = roundLogs.map((r) =>
      `## Round ${r.round} — ${r.passed ? 'PASSED' : 'FAILED'}\n` +
      `Error: ${r.errorSummary.substring(0, 800)}\n` +
      `Fix attempted: ${r.fixSummary.substring(0, 600)}\n`
    ).join('\n');

    const prompt = `You are a senior QA engineer classifying why an automated test heal failed after ${roundLogs.length} rounds.

## Failed scenario

\`\`\`
${testContent.substring(0, 4000)}
\`\`\`

## Heal rounds

${roundsBlock}

## Task

Classify the root cause as exactly ONE of:

- **bug**: the SUT element/route exists and responds, but its behavior is incorrect (button visible but click does nothing, form submits but data isn't saved, expected message never appears). The TEST is correct; the APP misbehaves.
- **not-implemented**: the SUT element/route/feature being tested does not exist yet (404 page, missing element after multiple selector attempts, route not registered, "Coming soon" page). The feature has not been built.
- **heal-exhausted**: ${roundLogs.length} fix attempts could not produce a green test, but evidence is unclear or mixed (could be either of the above, or a tooling/timing issue). Use this only when you genuinely cannot decide.

Respond with strict JSON only — no markdown fences, no preamble, no trailing text:
{"category":"<bug|not-implemented|heal-exhausted>","reasoning":"<one or two sentences explaining the call, citing specific evidence from the rounds>"}
`;

    let raw = '';
    try {
      const result = await this.withTimeout(
        ctx.services.claude.prompt(prompt, { outputFormat: 'json' }),
        CLASSIFY_TIMEOUT_MS,
      );
      raw = result.result;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const cat = parsed.category;
        const reasoning = String(parsed.reasoning || '').trim() || '(no reasoning provided)';
        if (cat === 'bug' || cat === 'not-implemented' || cat === 'heal-exhausted') {
          // Persist classification.md alongside the round-N folders
          const md = [
            `# Classification — ${new Date().toISOString()}`,
            '',
            `**Category:** ${cat}`,
            `**Reasoning:** ${reasoning}`,
            '',
            '## Round history',
            ...roundLogs.map((r) => `${r.round}. ${r.passed ? '✅' : '❌'} ${r.errorSummary.substring(0, 200)}`),
          ].join('\n');
          try { writeFileSync(resolve(logsDir, 'classification.md'), md, 'utf-8'); } catch { /* skip */ }
          return { category: cat, reasoning };
        }
      }
    } catch (err) {
      this.log(`Classification call failed: ${err instanceof Error ? err.message : String(err)}`, 'warn');
    }
    // Fallback when Claude returns garbage or call fails
    const fallback = { category: 'heal-exhausted' as const, reasoning: 'Claude classification unavailable or returned invalid JSON; defaulting to heal-exhausted.' };
    try {
      writeFileSync(resolve(logsDir, 'classification.md'),
        `# Classification — ${new Date().toISOString()} (fallback)\n\n**Category:** ${fallback.category}\n**Reasoning:** ${fallback.reasoning}\n\n## Raw Claude output\n\n\`\`\`\n${raw.substring(0, 1500)}\n\`\`\`\n`,
        'utf-8');
    } catch { /* skip */ }
    return fallback;
  }

  // ─── Reusable healing log (logs/healing/scenario-<id>.log) ───────────────
  // Appends one section per heal attempt. Captures before/after diffs of
  // properties/steps/feature files, plus pattern hints for future heals.

  private snapshotProjectFiles(projectDir: string, featurePath: string): Map<string, string> {
    const snap = new Map<string, string>();
    const propsDir = resolve(projectDir, 'tests', 'properties');
    const stepsDir = resolve(projectDir, 'tests', 'steps');
    const collect = (dir: string, suffix: string) => {
      if (!existsSync(dir)) return;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(suffix)) continue;
        const p = resolve(dir, f);
        try { snap.set(p, readFileSync(p, 'utf-8')); } catch { /* skip */ }
      }
    };
    collect(propsDir, '.properties.ts');
    collect(stepsDir, '.steps.ts');
    if (featurePath && existsSync(featurePath)) {
      try { snap.set(featurePath, readFileSync(featurePath, 'utf-8')); } catch { /* skip */ }
    }
    return snap;
  }

  private simpleDiff(before: string, after: string): { removed: string[]; added: string[] } {
    const beforeLines = new Set(before.split('\n'));
    const afterLines = new Set(after.split('\n'));
    const removed: string[] = [];
    const added: string[] = [];
    for (const l of before.split('\n')) {
      if (!afterLines.has(l) && l.trim() !== '') removed.push(l);
    }
    for (const l of after.split('\n')) {
      if (!beforeLines.has(l) && l.trim() !== '') added.push(l);
    }
    return { removed, added };
  }

  private categorizePatterns(diffsByFile: Array<{ path: string; removed: string[]; added: string[] }>): string[] {
    const patterns: string[] = [];
    for (const d of diffsByFile) {
      const fname = basename(d.path);
      const all = [...d.removed, ...d.added].join('\n');
      if (fname.endsWith('.properties.ts')) {
        const oldX = d.removed.filter((l) => /['"]\/\/|['"]xpath/i.test(l) || /['"]\/\//.test(l));
        const newX = d.added.filter((l) => /['"]\/\/|['"]xpath/i.test(l) || /['"]\/\//.test(l));
        if (oldX.length > 0 || newX.length > 0) {
          patterns.push(`🎯 selector drift in \`${fname}\` — ${oldX.length} old / ${newX.length} new XPath line(s)`);
        }
      }
      if (fname.endsWith('.steps.ts')) {
        if (/waitForLoadState|waitForURL|waitForSelector|waitForTimeout|toBeVisible.*timeout/i.test(all)) {
          patterns.push(`⏱ wait/timing tweak in \`${fname}\``);
        }
        if (/createBdd\(\)\.(?:Given|When|Then)/.test(d.added.join('\n'))) {
          patterns.push(`➕ new step definition added in \`${fname}\``);
        }
      }
      if (fname.endsWith('.feature')) {
        patterns.push(`📝 feature file edited: \`${fname}\``);
      }
    }
    return patterns;
  }

  private fmtDiffBlock(diffsByFile: Array<{ path: string; removed: string[]; added: string[] }>, projectDir: string): string {
    if (diffsByFile.length === 0) return '_No file changes detected._';
    const out: string[] = [];
    for (const d of diffsByFile) {
      out.push(`**\`${relative(projectDir, d.path)}\`** — ${d.removed.length} removed, ${d.added.length} added`);
      out.push('');
      out.push('```diff');
      for (const l of d.removed.slice(0, 30)) out.push(`- ${l}`);
      if (d.removed.length > 30) out.push(`- ... (+${d.removed.length - 30} more removed)`);
      for (const l of d.added.slice(0, 30)) out.push(`+ ${l}`);
      if (d.added.length > 30) out.push(`+ ... (+${d.added.length - 30} more added)`);
      out.push('```');
      out.push('');
    }
    return out.join('\n');
  }

  private appendHealingReport(opts: {
    projectDir: string;
    testId: string;
    scenarioName: string;
    featurePath: string;
    failureType: string;
    outcome: 'healed' | 'unhealable' | 'already-passing';
    rounds: RoundLog[];
    beforeSnapshot: Map<string, string>;
    initialError: string;
    durationMs: number;
    classification?: { category: 'bug' | 'not-implemented' | 'heal-exhausted'; reasoning: string };
  }): void {
    const healingDir = resolve(opts.projectDir, 'app', 'TestGenerator', 'logs', 'healing');
    try { mkdirSync(healingDir, { recursive: true }); } catch { /* ok */ }
    const logFile = resolve(healingDir, `scenario-${opts.testId}.log`);

    // Compute diffs (before vs current on disk)
    const diffsByFile: Array<{ path: string; removed: string[]; added: string[] }> = [];
    for (const [path, before] of opts.beforeSnapshot) {
      let after = '';
      try { after = existsSync(path) ? readFileSync(path, 'utf-8') : ''; } catch { /* skip */ }
      if (before === after) continue;
      const { removed, added } = this.simpleDiff(before, after);
      if (removed.length === 0 && added.length === 0) continue;
      diffsByFile.push({ path, removed, added });
    }

    const fmtDur = (ms: number) => {
      const s = Math.round(ms / 1000);
      return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
    };
    const icon = opts.outcome === 'healed' ? '✓' : opts.outcome === 'unhealable' ? '✗' : '·';
    const verdict = opts.outcome === 'healed' ? 'HEALED' : opts.outcome === 'unhealable' ? 'UNHEALABLE' : 'ALREADY-PASSING';
    const patterns = this.categorizePatterns(diffsByFile);

    const lines: string[] = [];
    // Header (only on first attempt — heuristic: file doesn't exist yet)
    if (!existsSync(logFile)) {
      lines.push(`# ${opts.testId} — ${opts.scenarioName}`);
      lines.push('');
      lines.push(`**Feature:** \`${opts.featurePath ? basename(opts.featurePath) : 'unknown'}\``);
      lines.push('');
    }
    lines.push(`## ${icon} Attempt — ${new Date().toISOString()} — ${verdict} (${fmtDur(opts.durationMs)})`);
    lines.push('');
    lines.push(`**Rounds:** ${opts.rounds.length}  |  **Outcome:** ${verdict}  |  **Duration:** ${fmtDur(opts.durationMs)}`);
    if (opts.failureType) lines.push(`**Failure type:** ${opts.failureType}`);
    lines.push('');

    if (opts.classification) {
      lines.push(`### Classification: \`${opts.classification.category}\``);
      lines.push('');
      lines.push(opts.classification.reasoning);
      lines.push('');
    }

    if (opts.initialError) {
      lines.push('### Initial error');
      lines.push('```');
      lines.push(opts.initialError.substring(0, 500));
      lines.push('```');
      lines.push('');
    }

    lines.push('### Before → After (file changes)');
    lines.push('');
    lines.push(this.fmtDiffBlock(diffsByFile, opts.projectDir));

    if (patterns.length > 0) {
      lines.push('### Reusable patterns');
      lines.push('');
      for (const p of patterns) lines.push(`- ${p}`);
      lines.push('');
    } else if (opts.outcome === 'healed') {
      lines.push('### Reusable patterns');
      lines.push('');
      lines.push('_(none detected — fix may have been a config/data change outside tracked files)_');
      lines.push('');
    }

    if (opts.rounds.length > 0) {
      lines.push('### Rounds');
      lines.push('');
      for (const r of opts.rounds) {
        const rIcon = r.passed ? '✅' : '❌';
        lines.push(`${r.round}. ${rIcon} ${r.passed ? 'PASSED' : 'FAILED'} — error: \`${r.errorSummary.substring(0, 120).replace(/`/g, "'")}\``);
        if (r.fixSummary) lines.push(`   - fix: ${r.fixSummary.substring(0, 200).replace(/`/g, "'")}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    try { appendFileSync(logFile, lines.join('\n'), 'utf-8'); } catch (err) {
      this.log(`Failed to write healing report: ${err instanceof Error ? err.message : String(err)}`, 'warn');
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

  private logTestResults(output: string, success: boolean, prefix = ''): void {
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('not found. Available')) {
        this.log(`${prefix}CONFIG ERROR: ${line.trim()}`, 'error');
        return;
      }
    }

    const summaryLine = lines.find(l => /\d+\s+(passed|failed|skipped)/.test(l));
    if (summaryLine) this.log(`${prefix}Result: ${summaryLine.trim()}`);

    const missingHeader = lines.find(l => /Missing step definitions:\s*\d+/.test(l));
    if (missingHeader) {
      this.log(`${prefix}${missingHeader.trim()}`, 'warn');
      const missingSteps = lines.filter(l => /^\s*(Given|When|Then)\('/.test(l));
      for (const step of missingSteps.slice(0, 5)) this.log(`${prefix}  ${step.trim()}`, 'warn');
      if (missingSteps.length > 5) this.log(`${prefix}  ... and ${missingSteps.length - 5} more`, 'warn');
      return;
    }

    const noTests = lines.find(l => /No tests found/.test(l));
    if (noTests) {
      this.log(`${prefix}No tests matched grep pattern "${lines.find(l => l.includes('grep'))?.trim() || '?'}"`, 'error');
      return;
    }

    const failureIndices: number[] = [];
    lines.forEach((l, i) => { if (/^\s+\d+\)\s+\[/.test(l)) failureIndices.push(i); });

    for (const idx of failureIndices.slice(0, 3)) {
      const header = lines[idx]?.trim();
      if (header) this.log(`${prefix}FAIL: ${header}`, 'error');
      for (let i = idx + 1; i < Math.min(idx + 20, lines.length); i++) {
        const l = lines[i];
        if (/^\s+\d+\)\s+\[/.test(l) || /^\s+\d+\s+(passed|failed|skipped)/.test(l)) break;
        const trimmed = l.trim();
        if (!trimmed) continue;
        if (/^(Error|Timeout|expect\(|Locator|Call log|waiting for)/.test(trimmed) ||
            trimmed.includes('strict mode violation') || trimmed.includes('expected') ||
            trimmed.includes('received') || trimmed.includes('Pending operations')) {
          this.log(`${prefix}  ${trimmed}`, 'error');
        }
      }
    }

    if (!success && failureIndices.length === 0 && !summaryLine && !missingHeader && !noTests) {
      const meaningful = lines.filter(l => l.trim() && !l.includes('ExperimentalWarning') && !l.includes('trace-warnings'));
      for (const l of meaningful.slice(-5)) this.log(`${prefix}  ${l.trim()}`, 'warn');
    }
  }

  private extractErrorSummary(logContent: string): string {
    const lines = logContent.split('\n');
    for (const line of lines) {
      if (line.includes('not found. Available')) return line.trim();
    }
    const missingHeader = lines.find(l => /Missing step definitions:\s*\d+/.test(l));
    if (missingHeader) return missingHeader.trim();
    const noTests = lines.find(l => /No tests found/.test(l));
    if (noTests) return 'No tests found — grep pattern matched nothing';
    const failLine = lines.find(l => /^\s+\d+\)\s+\[/.test(l));
    if (failLine) return failLine.trim();
    const errorLine = lines.find(l => /^(Error|Timeout)/.test(l.trim()));
    if (errorLine) return errorLine.trim();
    return 'Unknown error — see log file';
  }

  private emitClaudeProgress(chunk: string): void {
    const trimmed = chunk.trimEnd();
    if (!trimmed) return;

    const readMatch = trimmed.match(/Read(?:ing)?\s+[`"]?([^\s`"]+)/i);
    const editMatch = trimmed.match(/Edit(?:ing)?\s+[`"]?([^\s`"]+)/i);
    const writeMatch = trimmed.match(/Writ(?:e|ing)\s+[`"]?([^\s`"]+)/i);
    const grepMatch = trimmed.match(/Grep(?:ping)?\s+.*?[`"]([^\s`"]+)/i);

    if (readMatch) this.log(`│ Claude → read ${readMatch[1]}`);
    else if (editMatch) this.log(`│ Claude → edit ${editMatch[1]}`);
    else if (writeMatch) this.log(`│ Claude → write ${writeMatch[1]}`);
    else if (grepMatch) this.log(`│ Claude → grep ${grepMatch[1]}`);

    this.ctx.emitSSE('log', {
      stepNumber: 103,
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

  private readState(stateFile: string): { round?: number; phase?: number; roundLogs?: RoundLog[] } {
    if (!existsSync(stateFile)) return {};
    try { return JSON.parse(readFileSync(stateFile, 'utf-8')); }
    catch { return {}; }
  }

  private writeState(stateFile: string, state: { round: number; phase: number; roundLogs: RoundLog[] }): void {
    writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
  }

  private cleanState(stateFile: string): void {
    if (existsSync(stateFile)) unlinkSync(stateFile);
  }

  private readLogFile(path: string): string {
    if (!existsSync(path)) return '';
    return readFileSync(path, 'utf-8');
  }

  private resolveHtmlContext(featurePath: string, htmlDir: string): string {
    if (!featurePath || !existsSync(htmlDir)) return '';

    const featureName = basename(featurePath, '.feature');
    const htmlFiles: string[] = [];

    const directMatch = resolve(htmlDir, `${featureName}.html`);
    if (existsSync(directMatch)) htmlFiles.push(directMatch);

    const navMatch = resolve(htmlDir, `nav-bar-${featureName}.html`);
    if (existsSync(navMatch)) htmlFiles.push(navMatch);

    if (htmlFiles.length === 0) return '';

    const sections: string[] = ['## HTML PAGE SNAPSHOT(S)', ''];
    for (const htmlFile of htmlFiles) {
      const content = readFileSync(htmlFile, 'utf-8');
      sections.push(`### ${basename(htmlFile)}`, '```html', content.substring(0, 30000), '```', '');
    }
    sections.push('Use the HTML above to identify correct XPath selectors for page elements.');
    return sections.join('\n');
  }
}
