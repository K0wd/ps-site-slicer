import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export class Step08ExecuteTests extends Step {
  readonly stepNumber = 8;
  readonly stepName = 'Execute Tests';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const planFile = resolve(ticketDir, '5_plan.md');

    ctx.logger.logStep(8, 'Execute Tests');

    if (!existsSync(planFile) && ctx.runPrerequisite) {
      this.log('Test plan not found — auto-running step 5...');
      const p = await ctx.runPrerequisite(5);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 5 failed: ${p.message}`, artifacts: [] };
    }
    if (!existsSync(planFile)) {
      return { status: 'fail', message: 'Test plan not found. Run step 5 first.', artifacts: [] };
    }

    let runDir = this.findLatestTestRunDir(ticketDir);
    if (!runDir && ctx.runPrerequisite) {
      this.log('No test-run directory — auto-running step 7...');
      const p = await ctx.runPrerequisite(7);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 7 failed: ${p.message}`, artifacts: [] };
      runDir = this.findLatestTestRunDir(ticketDir);
    }
    if (!runDir) {
      return { status: 'fail', message: 'No test-run directory found. Run step 7 first.', artifacts: [] };
    }

    const resultsFile = resolve(runDir, '8_results.md');
    const screenshotsDir = resolve(runDir, '7_tc_logs');
    mkdirSync(screenshotsDir, { recursive: true });

    const planContent = readFileSync(planFile, 'utf-8');

    // Build context
    const contextContent = ctx.services.context.buildBaseContext();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step8-context.md');

    const dateStr = new Date().toISOString().split('T')[0];

    const prompt = `You are an automated QA tester. Execute the test plan below using Playwright against the test server.

Test environment:
- SM project URL: ${ctx.config.baseUrl}spa
- SM-PWA project URL: ${ctx.config.baseUrl}testpwa
- Certmgr React app: ${ctx.config.baseUrl}main/cmdist/
- Credentials: username: ${ctx.config.testUsername} / password: ${ctx.config.testPassword}

For each test case:
1. Run the test steps in a browser using Playwright
2. Capture a screenshot to: ${screenshotsDir}/<test-case-name>.png
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

--- Test Plan ---
${planContent}`;

    this.log('Executing tests via Claude + Playwright...');
    const result = await ctx.services.claude.promptStreaming(prompt, {
      allowedTools: 'Bash,Read,Write,Edit,Grep,Glob',
      appendSystemPromptFile: contextFile,
    }, (chunk) => {
      this.ctx.emitSSE('log', { stepNumber: 8, level: 'debug', message: chunk.trimEnd(), timestamp: new Date().toLocaleTimeString() });
    });

    writeFileSync(resolve(runDir, '8_execution_log.md'), result.result, 'utf-8');

    ctx.logger.logInfo(`Execution log: \`8_execution_log.md\``);
    ctx.logger.logResult('PASS', `Test execution complete for ${ticketKey}`);

    return {
      status: 'pass',
      message: 'Test execution complete',
      artifacts: [
        { name: '8_execution_log.md', path: resolve(runDir, '8_execution_log.md'), type: 'md' },
        ...(existsSync(resultsFile) ? [{ name: '8_results.md', path: resultsFile, type: 'md' as const }] : []),
      ],
    };
  }

  private findLatestTestRunDir(ticketDir: string): string | null {
    const testRunsDir = resolve(ticketDir, 'test-runs');
    if (!existsSync(testRunsDir)) return null;
    const dirs = readdirSync(testRunsDir).sort().reverse();
    return dirs.length > 0 ? resolve(testRunsDir, dirs[0]) : null;
  }
}
