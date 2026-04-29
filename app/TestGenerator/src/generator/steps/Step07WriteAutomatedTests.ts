import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export class Step07WriteAutomatedTests extends Step {
  readonly stepNumber = 7;
  readonly stepName = 'Write Automated Tests';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const testsDir = resolve(ctx.projectDir, 'tests');
    const featureFile = resolve(testsDir, 'features', `${ticketKey}.feature`);

    ctx.logger.logStep(7, 'Write Automated Tests');

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

    // Create timestamped test-run dir
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 15);
    const runDir = resolve(ticketDir, 'test-runs', timestamp);
    const tcLogsDir = resolve(runDir, '7_tc_logs');
    mkdirSync(tcLogsDir, { recursive: true });

    const featureContent = readFileSync(featureFile, 'utf-8');

    // Extract TC tags from feature
    const tagPairs = [...featureContent.matchAll(/@((?:SC|TC|EC)-\d+)\s+@/g)].map(m => m[1]);
    if (tagPairs.length === 0) {
      return { status: 'fail', message: 'No @TC-X tags found in feature file', artifacts: [] };
    }

    this.log(`Found ${tagPairs.length} test case(s) in feature file`);

    // Build context
    const contextContent = ctx.services.context.buildStep7Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step7-context.md');

    // Collect existing files for prompt
    const stepsFiles = this.listFiles(join(testsDir, 'steps'), '.steps.ts');
    const propsFiles = this.listFiles(join(testsDir, 'properties'), '.properties.ts');

    let passCount = 0;
    let failCount = 0;
    const summaryRows: string[] = [];
    const useParallel = ctx.options?.parallel ?? false;
    this.log(`Processing ${tagPairs.length} test cases (${useParallel ? 'parallel' : 'sequential'})...`);

    const processTc = async (tcId: string) => {
      this.log(`━━━ ${tcId} ━━━`);

      const scenario = this.extractScenario(featureContent, tcId, ticketKey);
      const stepLines = this.extractStepLines(scenario);
      const totalSteps = stepLines.length;

      this.log(`  ${totalSteps} Gherkin steps to process`);

      let existingCount = 0;
      let addedCount = 0;
      let lastRealKeyword = 'Given';

      for (let i = 0; i < stepLines.length; i++) {
        const line = stepLines[i];
        const keyword = line.split(/\s+/)[0];
        const stepText = line.replace(/^\S+\s+/, '');
        const realKeyword = ['And', 'But'].includes(keyword) ? lastRealKeyword : keyword;
        if (['Given', 'When', 'Then'].includes(keyword)) lastRealKeyword = keyword;

        this.log(`  [${tcId}] Step ${i + 1}/${totalSteps}: ${keyword} ${stepText}`);

        if (this.stepDefExists(testsDir, line)) {
          this.log(`    → EXISTING`);
          existingCount++;
          continue;
        }

        this.log(`    → MISSING — implementing...`);

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

        const result = await ctx.services.claude.promptStreaming(stepPrompt, {
          allowedTools: 'Bash,Read,Write,Edit,Grep,Glob',
          appendSystemPromptFile: contextFile,
        }, (chunk) => {
          this.ctx.emitSSE('log', { stepNumber: 7, level: 'debug', message: chunk.trimEnd(), timestamp: new Date().toLocaleTimeString() });
        });

        writeFileSync(resolve(tcLogsDir, `${tcId}_step_${i + 1}_log.md`), result.result, 'utf-8');

        // Verify compile with bddgen
        this.log(`    Verifying compile (bddgen)...`);
        const bddgen = await ctx.services.playwright.runBddgen();
        writeFileSync(resolve(tcLogsDir, `${tcId}_step_${i + 1}_bddgen.md`), bddgen.output, 'utf-8');

        if (!bddgen.success && this.isBlocker(bddgen.output)) {
          this.log(`    BLOCKER — bddgen failed`, 'error');
          ctx.logger.logResult('FAIL', `BLOCKER on ${tcId} step ${i + 1}`);
          return {
            status: 'fail',
            message: `BLOCKER on ${tcId} step ${i + 1}: ${keyword} ${stepText}`,
            artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' }],
          };
        }

        this.log(`    → ADDED (compile OK)`);
        addedCount++;
      }

      // Run playwright test for this TC
      this.log(`  [${tcId}] Running playwright test...`);
      const testResult = await ctx.services.playwright.runTest(`${tcId}\\b`);
      writeFileSync(resolve(tcLogsDir, `${tcId}_test_output.md`), testResult.output, 'utf-8');

      if (this.isBlocker(testResult.output)) {
        this.log(`  [${tcId}] BLOCKER — build error in test`, 'error');
        return { passed: false, blocker: true };
      }

      const passed = testResult.output.includes('passed') && !testResult.output.includes('failed');
      if (passed) {
        this.log(`  [PASS] ${tcId}`);
        passCount++;
      } else {
        this.log(`  [FAIL] ${tcId}`, 'warn');
        failCount++;
      }

      summaryRows.push(`| ${tcId} | ${passed ? 'PASS' : 'FAIL'} | ${totalSteps} | ${existingCount} | ${addedCount} | ${passed ? 'PASS' : 'FAIL'} |`);
      return { passed, blocker: false };
    };

    if (useParallel) {
      const results = await Promise.allSettled(tagPairs.map(processTc));
      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value.blocker) {
            return { status: 'fail' as const, message: 'BLOCKER in parallel mode', artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }] };
          }
        } else {
          failCount++;
        }
      }
    } else {
      for (const tcId of tagPairs) {
        const result = await processTc(tcId);
        if (result.blocker) {
          return { status: 'fail' as const, message: `BLOCKER on ${tcId}`, artifacts: [{ name: '7_tc_logs', path: tcLogsDir, type: 'md' as const }] };
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
`;
    writeFileSync(readyFile, report, 'utf-8');

    ctx.logger.logResult(failCount === 0 ? 'PASS' : 'WARN', `${passCount}/${tagPairs.length} test cases passing`);

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

  private stepDefExists(testsDir: string, stepLine: string): boolean {
    const rawText = stepLine.replace(/^\s*(Given|When|Then|And|But)\s+/, '');
    const pattern = rawText.replace(/"[^"]*"/g, '.*').replace(/[()]/g, '\\$&');
    try {
      execSync(`grep -rq "${pattern}" "${testsDir}/steps/" --include="*.steps.ts"`, { stdio: 'ignore' });
      return true;
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
}
