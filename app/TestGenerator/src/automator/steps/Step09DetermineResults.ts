import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';
import { findLatestTestRunDir } from './stepUtils.js';

export class Step09DetermineResults extends Step {
  readonly stepNumber = 9;
  readonly stepName = 'Determine Results';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const planFile = resolve(ticketDir, '5_plan.md');

    ctx.logger.logStep(9, 'Determine Results');

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
    if (!existsSync(resultsFile) && ctx.runPrerequisite) {
      this.log('Results file not found — auto-running step 8...');
      const p = await ctx.runPrerequisite(8);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 8 failed: ${p.message}`, artifacts: [] };
    }
    if (!existsSync(resultsFile)) {
      return { status: 'fail', message: 'Results file not found. Run step 8 first.', artifacts: [] };
    }

    const resultsContent = readFileSync(resultsFile, 'utf-8');

    // Extract verdict
    const verdictMatch = resultsContent.match(/RESULT:\s*(PASS|FAIL|NOT TESTED)/);
    const verdict = verdictMatch ? verdictMatch[1] : null;

    if (!verdict) {
      this.log('Could not extract verdict from results file', 'warn');
      return { status: 'fail', message: 'Could not extract verdict from results file', artifacts: [] };
    }

    this.log(`Verdict: ${verdict}`);
    ctx.logger.logInfo(`Verdict: **${verdict}**`);

    // Collect screenshots
    const screenshotsDir = resolve(runDir, '7_tc_logs');
    let screenshotList = '';
    if (existsSync(screenshotsDir)) {
      const images = readdirSync(screenshotsDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
      screenshotList = images.map(f => `  - ${f}`).join('\n') || '(none)';
    }

    const planContent = existsSync(planFile) ? readFileSync(planFile, 'utf-8') : '';
    const reportFile = resolve(runDir, `9_test_report${tcSuffix}.md`);

    // Build context
    const contextContent = ctx.services.context.buildBaseContext();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step9-context.md');

    const dateStr = new Date().toISOString().split('T')[0];

    const prompt = `You are a QA report generator. Create a structured Markdown test report for Jira ticket ${ticketKey}.

Write the report to: ${reportFile}

## REPORT FORMAT

# Test Report: ${ticketKey}
**Date:** ${dateStr}
**Tester:** Claude Code + Playwright
**Environment:** ${ctx.config.baseUrl}
**Overall Result:** <PASS|FAIL|NOT TESTED>

---

## Test Results

| Test Name | Test Steps | Result per Step | Image Proof |
|-----------|-----------|----------------|-------------|
| TC-01: <name> | 1. <step><br>2. <step> | 1. PASS<br>2. PASS | ![TC-01](<filename>.png) |

---

## Summary

- **Total:** <count>
- **Passed:** <count>
- **Failed:** <count>

## INPUT DATA

### Test Plan
${planContent}

### Execution Results
${resultsContent}

### Available Screenshots
${screenshotList}

### Overall Verdict
${verdict}

## RULES
- Every test case from the plan MUST appear
- Use the Write tool to create the report file`;

    this.log('Generating test report via Claude...');
    const result = await ctx.services.claude.prompt(prompt, {
      allowedTools: 'Read,Write,Glob',
      appendSystemPromptFile: contextFile,
      cwd: runDir,
    });

    const reportLogFile = resolve(runDir, `9_report_log${tcSuffix}.md`);
    writeFileSync(reportLogFile, result.result, 'utf-8');

    const reportExists = existsSync(reportFile);
    const verdictStatus = verdict === 'PASS' ? 'pass' : verdict === 'FAIL' ? 'fail' : 'warn';

    ctx.logger.logResult(verdict, `Final result for ${ticketKey}${ctx.tcId ? ` (${ctx.tcId})` : ''} is **${verdict}**`);

    return {
      status: verdictStatus,
      message: `Verdict: ${verdict}${reportExists ? ' — report generated' : ''}`,
      artifacts: [
        ...(reportExists ? [{ name: `9_test_report${tcSuffix}.md`, path: reportFile, type: 'md' as const }] : []),
        { name: `9_report_log${tcSuffix}.md`, path: reportLogFile, type: 'md' },
      ],
      data: { verdict },
    };
  }

}
