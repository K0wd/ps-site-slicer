import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, join, basename } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

const CLAUDE_TIMEOUT_MS = 15 * 60 * 1000;

export class Step07WriteAutomatedTests extends Step {
  readonly stepNumber = 7;
  readonly stepName = 'Implement Gherkin Steps';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const elapsed = this.timer();
    const testTypes = ctx.options?.testTypes ?? ['ui'];
    this.log(`Test types: ${testTypes.join(', ')}`);

    const results = await Promise.all(testTypes.map(t => this.runForType(t, ctx)));

    const anyFail = results.some(r => r.status === 'fail');
    const anyWarn = results.some(r => r.status === 'warn');
    const allArtifacts = results.flatMap(r => r.artifacts);
    const messages = results.map((r, i) => `[${testTypes[i]}] ${r.message}`).join(' | ');

    this.log(`Step 7 complete (${elapsed()})`);

    return {
      status: anyFail ? 'fail' : anyWarn ? 'warn' : 'pass',
      message: messages,
      artifacts: allArtifacts,
      data: results.reduce((acc, r) => ({ ...acc, ...r.data }), {}),
    };
  }

  private runForType(type: 'ui' | 'api' | 'unit', ctx: StepContext): Promise<StepOutput> {
    if (type === 'api') return this.executeApiStub(ctx);
    if (type === 'unit') return this.executeUnitStub(ctx);
    return this.executeUi(ctx);
  }

  private async executeApiStub(ctx: StepContext): Promise<StepOutput> {
    this.log('[api] API test generation not yet implemented — skipping');
    return { status: 'warn', message: '[api] not yet implemented', artifacts: [] };
  }

  private async executeUnitStub(ctx: StepContext): Promise<StepOutput> {
    this.log('[unit] Unit test generation not yet implemented — skipping');
    return { status: 'warn', message: '[unit] not yet implemented', artifacts: [] };
  }

  private async executeUi(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const testsDir = resolve(ctx.projectDir, 'tests');
    const featureFile = resolve(testsDir, 'features', `${ticketKey}.feature`);
    const elapsed = this.timer();

    ctx.logger.logStep(7, 'Implement Gherkin Steps');

    if (!existsSync(featureFile)) {
      if (ctx.runPrerequisite) {
        this.log('Feature file not found — auto-running step 6...');
        const prereq = await ctx.runPrerequisite(6);
        if (prereq.status === 'fail') {
          return { status: 'fail', message: `Prerequisite step 6 failed: ${prereq.message}`, artifacts: [] };
        }
      }
      if (!existsSync(featureFile)) {
        return { status: 'fail', message: `Feature file not found. Run step 6 first.`, artifacts: [] };
      }
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 15);
    const runDir = resolve(ticketDir, 'test-runs', timestamp);
    const tcLogsDir = resolve(runDir, '7_tc_logs');
    mkdirSync(tcLogsDir, { recursive: true });

    const featureContent = readFileSync(featureFile, 'utf-8');

    const allTagPairs = [...featureContent.matchAll(/@((?:SC|TC|EC)-\d+)/g)].map(m => m[1]);
    if (allTagPairs.length === 0) {
      return { status: 'fail', message: 'No @TC-X tags found in feature file', artifacts: [] };
    }
    const singleTcMode = !!ctx.tcId;
    const tagPairs = singleTcMode
      ? (allTagPairs.includes(ctx.tcId!) ? [ctx.tcId!] : [])
      : allTagPairs;
    if (singleTcMode && tagPairs.length === 0) {
      return { status: 'fail', message: `tcId ${ctx.tcId} not found in feature file`, artifacts: [] };
    }

    // Build context
    const contextContent = ctx.services.context.buildStep7Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step7-context.md');

    const stepsFiles = this.listFiles(join(testsDir, 'steps'), '.steps.ts');
    const propsFiles = this.listFiles(join(testsDir, 'properties'), '.properties.ts');
    const allStepsContent = stepsFiles.map(f => { try { return readFileSync(f, 'utf-8'); } catch { return ''; } }).join('\n');

    // Resolve HTML context for Claude prompts
    const htmlDir = resolve(ctx.projectDir, 'html');
    const htmlContext = this.resolveHtmlContext(featureFile, htmlDir);

    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.log(`Ticket: ${ticketKey}`);
    this.log(`Feature: ${basename(featureFile)}`);
    this.log(`Test cases: ${tagPairs.length}${singleTcMode ? ` (single: ${ctx.tcId})` : ''}`);
    this.log(`System prompt: ${this.formatBytes(contextContent.length)}`);
    if (htmlContext) this.log(`HTML context: ${basename(featureFile, '.feature')}.html (${this.formatBytes(htmlContext.length)})`);
    else this.log(`HTML context: none found`, 'warn');
    this.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    let passCount = 0;
    let failCount = 0;
    const summaryRows: string[] = [];
    const useParallel = ctx.options?.parallel ?? false;
    this.log(`Processing ${tagPairs.length} test cases (${useParallel ? 'parallel' : 'sequential'})...`);

    const processTc = async (tcId: string, idx: number) => {
      const tcElapsed = this.timer();

      this.log(`┌─── [${idx + 1}/${tagPairs.length}] ${tcId} ─────────────────────────────`);

      const scenario = this.extractScenario(featureContent, tcId, ticketKey);
      const stepLines = this.extractStepLines(scenario);
      const totalSteps = stepLines.length;

      this.log(`│ ${totalSteps} Gherkin steps to process`);

      let existingCount = 0;
      let addedCount = 0;
      let lastRealKeyword = 'Given';

      for (let i = 0; i < stepLines.length; i++) {
        const line = stepLines[i];
        const keyword = line.split(/\s+/)[0];
        const stepText = line.replace(/^\S+\s+/, '');
        const realKeyword = ['And', 'But'].includes(keyword) ? lastRealKeyword : keyword;
        if (['Given', 'When', 'Then'].includes(keyword)) lastRealKeyword = keyword;

        this.log(`│ Step ${i + 1}/${totalSteps}: ${keyword} ${stepText}`);

        if (this.stepDefExists(allStepsContent, line)) {
          this.log(`│   → EXISTING`);
          existingCount++;
          continue;
        }

        this.log(`│   → MISSING — implementing...`);

        const stepPrompt = `You are a senior test automation engineer. Implement exactly ONE Playwright-BDD step definition.

## STEP TO IMPLEMENT

Keyword: **${realKeyword}**
Full Gherkin line: \`${keyword} ${stepText}\`

Scenario context:
\`\`\`gherkin
${scenario}
\`\`\`

## EXISTING FILES

Step definitions: ${stepsFiles.map(f => `\n- ${f}`).join('')}
Properties: ${propsFiles.map(f => `\n- ${f}`).join('')}
Feature file: ${featureFile}

${htmlContext || ''}

## TASK

1. READ existing step definition files
2. CONFIRM this step text is not already defined
3. ADD the step definition to the appropriate .steps.ts file
4. ADD any missing XPath selectors to the appropriate .properties.ts file
5. DO NOT create new files if appropriate ones exist
6. DO NOT modify the feature file

## RULES

- XPath ONLY — no CSS selectors
- Use \`page.locator(\\\`xpath=\\\${SELECTOR}\\\`)\` pattern
- Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible
- Test URL: ${ctx.config.baseUrl}spa
- Keep it KISS`;

        const promptFile = resolve(tcLogsDir, `${tcId}_step_${i + 1}_prompt.md`);
        writeFileSync(promptFile, stepPrompt, 'utf-8');
        this.log(`│   Prompt: ${this.formatBytes(stepPrompt.length)}`);
        this.log(`│   Calling Claude (timeout: ${CLAUDE_TIMEOUT_MS / 1000}s)...`);

        const claudeStart = this.timer();
        let result: { result: string };
        try {
          result = await this.withTimeout(
            ctx.services.claude.promptStreaming(stepPrompt, {
              allowedTools: 'Bash,Read,Write,Edit,Grep,Glob,mcp__context7,mcp__playwright',
              appendSystemPromptFile: contextFile,
            }, (chunk) => {
              this.emitClaudeProgress(chunk);
            }),
            CLAUDE_TIMEOUT_MS,
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.log(`│   Claude FAILED after ${claudeStart()}: ${errMsg}`, 'error');
          writeFileSync(resolve(tcLogsDir, `${tcId}_step_${i + 1}_log.md`), `Claude error: ${errMsg}`, 'utf-8');
          ctx.logger.logResult('FAIL', `Claude timeout on ${tcId} step ${i + 1}`);
          return { status: 'fail' as const, message: `Claude timeout on ${tcId} step ${i + 1}`, artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }] };
        }

        const responseSize = result.result.length;
        const filesChanged = this.summarizeClaudeChanges(result.result);
        this.log(`│   Claude responded in ${claudeStart()} (${this.formatBytes(responseSize)})`);
        if (filesChanged) this.log(`│   Files changed: ${filesChanged}`);

        writeFileSync(resolve(tcLogsDir, `${tcId}_step_${i + 1}_log.md`), result.result, 'utf-8');

        this.log(`│   Verifying compile (bddgen)...`);
        const bddgen = await ctx.services.playwright.runBddgen();
        writeFileSync(resolve(tcLogsDir, `${tcId}_step_${i + 1}_bddgen.md`), bddgen.output, 'utf-8');

        if (!bddgen.success && this.isBlocker(bddgen.output)) {
          this.log(`│   BLOCKER — bddgen failed`, 'error');
          ctx.logger.logResult('FAIL', `BLOCKER on ${tcId} step ${i + 1}`);
          return {
            status: 'fail' as const,
            message: `BLOCKER on ${tcId} step ${i + 1}: ${keyword} ${stepText}`,
            artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }],
          };
        }

        this.log(`│   → ADDED (compile OK)`);
        addedCount++;
      }

      // Run playwright test for this TC
      this.log(`│ Running playwright test: --grep "${tcId}\\b"`);
      const testStart = this.timer();
      const testResult = await ctx.services.playwright.runTest(`${tcId}\\b`);
      writeFileSync(resolve(tcLogsDir, `${tcId}_test_output.md`), testResult.output, 'utf-8');

      if (this.isBlocker(testResult.output)) {
        this.log(`│ BLOCKER — build error in test (${testStart()})`, 'error');
        this.log(`└─── ${tcId} BLOCKER (${tcElapsed()}) ────────────────────`);
        return { passed: false, blocker: true };
      }

      const passed = testResult.success && !this.isBlocker(testResult.output);
      if (passed) {
        passCount++;
        this.log(`│ ✓ ${tcId} PASSED (${testStart()})`);
      } else {
        failCount++;
        this.logTestResults(testResult.output, testResult.success, '│ ');
        this.log(`│ ✗ ${tcId} FAILED (${testStart()})`, 'warn');
      }

      summaryRows.push(`| ${tcId} | ${passed ? 'PASS' : 'FAIL'} | ${totalSteps} | ${existingCount} | ${addedCount} | ${passed ? 'PASS' : 'FAIL'} |`);
      this.log(`└─── ${tcId} ${passed ? 'PASS' : 'FAIL'} (${tcElapsed()}) ────────────────────`);
      return { passed, blocker: false };
    };

    if (useParallel) {
      const results = await Promise.allSettled(tagPairs.map((tc, i) => processTc(tc, i)));
      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value.blocker) {
            return { status: 'fail' as const, message: 'BLOCKER in parallel mode', artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }] };
          }
          if (r.value.passed) passCount++; else failCount++;
        } else {
          failCount++;
        }
      }
    } else {
      for (let i = 0; i < tagPairs.length; i++) {
        const result = await processTc(tagPairs[i], i);
        if (result.blocker) {
          return { status: 'fail' as const, message: `BLOCKER on ${tagPairs[i]}`, artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }] };
        }
      }
    }

    // Write summary report
    const readyFile = resolve(runDir, '7_automation_ready.md');
    const report = `# Automation Ready — ${ticketKey}

**Date:** ${new Date().toISOString().split('T')[0]}
**Feature:** \`tests/features/${ticketKey}.feature\`

## Test Case Results

| TC | Status | Steps | Existing | Added | Test Run |
|----|--------|:---:|:---:|:---:|--------|
${summaryRows.join('\n')}

## Summary

- **Total:** ${tagPairs.length}
- **Passed:** ${passCount}
- **Failed:** ${failCount}
- **Duration:** ${elapsed()}
`;
    writeFileSync(readyFile, report, 'utf-8');

    ctx.logger.logResult(failCount === 0 ? 'PASS' : 'WARN', `${passCount}/${tagPairs.length} test cases passing`);

    this.log(`━━━ ${passCount}/${tagPairs.length} TCs passing (${elapsed()}) ━━━`);

    return {
      status: failCount === 0 ? 'pass' : 'warn',
      message: `${passCount}/${tagPairs.length} TCs passing (${failCount} failed)`,
      artifacts: [
        { name: '7_automation_ready.md', path: readyFile, type: 'md' },
        { name: '7_tc_logs', path: tcLogsDir, type: 'md' },
      ],
      data: { passCount, failCount, totalTCs: tagPairs.length },
    };
  }

  private listFiles(dir: string, ext: string): string[] {
    try {
      return readdirSync(dir).filter(f => f.endsWith(ext)).map(f => join(dir, f));
    } catch { return []; }
  }

  private stepDefExists(allStepsContent: string, stepLine: string): boolean {
    const rawText = stepLine.replace(/^\s*(Given|When|Then|And|But)\s+/, '');
    const pattern = rawText.replace(/"[^"]*"/g, '.*').replace(/[()]/g, '\\$&');
    try {
      return new RegExp(pattern, 'm').test(allStepsContent);
    } catch { return false; }
  }

  private extractScenario(featureContent: string, tcId: string, ticketKey: string): string {
    const lines = featureContent.split('\n');
    let capturing = false;
    const result: string[] = [];
    for (const line of lines) {
      if (line.includes(`@${tcId}`) && line.includes(`@${ticketKey}`)) capturing = true;
      else if (capturing && /^\s+@(SC|TC|EC)-\d+/.test(line)) break;
      if (capturing) result.push(line);
    }
    return result.join('\n');
  }

  private extractStepLines(scenario: string): string[] {
    return scenario.split('\n')
      .filter(l => /^\s+(Given|When|Then|And|But)\s/.test(l))
      .map(l => l.trim());
  }

  private isBlocker(output: string): boolean {
    const blockerPatterns = [
      /error.*bddgen|bddgen.*error/i,
      /Cannot find module/i,
      /SyntaxError/i,
      /TypeError.*compile/i,
      /error TS\d/i,
      /Cannot find name/i,
      /has no exported member/i,
      /is not assignable/i,
    ];
    return blockerPatterns.some(p => p.test(output));
  }

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

    if (readMatch) this.log(`│   Claude → read ${readMatch[1]}`);
    else if (editMatch) this.log(`│   Claude → edit ${editMatch[1]}`);
    else if (writeMatch) this.log(`│   Claude → write ${writeMatch[1]}`);

    this.ctx.emitSSE('log', {
      stepNumber: 7,
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

  private resolveHtmlContext(featurePath: string, htmlDir: string): string {
    if (!existsSync(htmlDir)) return '';
    const featureName = basename(featurePath, '.feature');
    const htmlFile = resolve(htmlDir, `${featureName}.html`);
    if (!existsSync(htmlFile)) return '';
    try {
      const content = readFileSync(htmlFile, 'utf-8');
      const size = statSync(htmlFile).size;
      return `## HTML PAGE SNAPSHOT (${this.formatBytes(size)})\n\nUse this DOM structure to build accurate XPath selectors:\n\n\`\`\`html\n${content.substring(0, 15000)}\n\`\`\`\n`;
    } catch { return ''; }
  }

  private logTestResults(output: string, success: boolean, prefix: string): void {
    const cleaned = output.split('\n').map(l => this.stripAnsi(l).trim());

    for (const line of cleaned) {
      if (/\d+\s+(passed|failed|skipped)/.test(line)) {
        this.log(`${prefix}${line}`);
      } else if (/^\s*\d+\)\s+\[/.test(line)) {
        this.log(`${prefix}${line}`, 'error');
      } else if (/^(Error|Timeout|expect\()/.test(line) || line.includes('strict mode')) {
        this.log(`${prefix}  ${line}`, 'error');
      }
    }
  }
}
