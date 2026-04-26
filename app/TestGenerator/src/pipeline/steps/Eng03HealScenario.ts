import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Eng03HealScenario extends Step {
  readonly stepNumber = 103;
  readonly stepName = 'Heal Scenario';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    // ─── Run prerequisites: 101 → conditionally 102 ──────────────────────────
    if (ctx.runPrerequisite) {
      this.log('Running Step 101 (Check Steps)...');
      const step101 = await ctx.runPrerequisite(101);

      if (step101.status === 'fail') {
        this.log('Step 101 failed (missing steps) — skipping Step 102, healing from missing-step .test files');
      } else {
        this.log('Step 101 passed — running Step 102 (Run Tests)...');
        const step102 = await ctx.runPrerequisite(102);

        if (step102.status === 'pass') {
          this.log('Step 102 passed — nothing to heal');
          return { status: 'pass', message: 'All steps defined and all tests passing — nothing to heal', artifacts: [] };
        }

        this.log(`Step 102 done (${step102.status}) — healing from test-failure .test files`);
      }
    }

    // ─── Heal one .test file ─────────────────────────────────────────────────
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');

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
    const failureType = this.extractField(testContent, 'Type:');

    this.log(`Healing: ${targetFile} [${failureType}] (${testFiles.length} total remaining)`);

    const contextContent = ctx.services.context.buildStep7Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'eng03-context.md');

    const healPrompt = `You are a senior test automation engineer fixing a failing Playwright-BDD scenario.

## FAILING SCENARIO

${testContent}

## TASK

1. READ the feature file, related step definition files, and property files
2. ANALYZE the failure to determine the root cause
3. FIX the issue — this could be:
   - A missing step definition that needs implementing (Type: missing-steps)
   - A broken XPath selector in a .properties.ts file (Type: test-failure)
   - A bug in a step definition in a .steps.ts file (Type: test-failure)
   - A timing issue needing better waits (Type: test-failure)
4. DO NOT modify the .feature file unless the Gherkin itself is clearly wrong
5. After fixing, verify the fix makes sense

## RULES

- XPath ONLY — no CSS selectors
- Use \`page.locator(\`xpath=\${SELECTOR}\`)\` pattern
- Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible
- Test URL: ${ctx.config.baseUrl}spa
- Keep it KISS — minimal fix, don't refactor surrounding code
- Read the error-context.md page snapshot if available for fixing broken XPaths`;

    this.log('Calling Claude to analyze and fix...');
    const claudeResult = await ctx.services.claude.promptStreaming(healPrompt, {
      allowedTools: 'Bash,Read,Write,Edit,Grep,Glob',
      appendSystemPromptFile: contextFile,
    }, (chunk) => {
      this.ctx.emitSSE('log', {
        stepNumber: 103,
        level: 'debug',
        message: chunk.trimEnd(),
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    // Verify: run bddgen + targeted test
    this.log('Verifying fix — running bddgen...');
    await ctx.services.playwright.runBddgen();

    const tcTag = tags.match(/@TC-\d+/)?.[0] || tags.match(/@SC-\d+/)?.[0];
    const grepPattern = tcTag ? `${tcTag.replace('@', '')}\\b` : scenarioName;

    this.log(`Running test for: ${grepPattern}`);
    const verify = await ctx.services.playwright.runTest(grepPattern, 'edge');

    const passed = verify.success ||
      (verify.output.includes('passed') && !verify.output.includes('failed'));

    if (passed) {
      unlinkSync(targetPath);
      this.log(`HEALED: "${scenarioName}" — .test file removed`);
      return {
        status: 'pass',
        message: `Healed "${scenarioName}" — ${testFiles.length - 1} scenario(s) remaining`,
        artifacts: [],
        data: { healed: scenarioName, remaining: testFiles.length - 1 },
      };
    }

    this.log(`Still failing: "${scenarioName}" — updating .test file`, 'warn');

    const updatedContent = testContent.replace(
      /## Error Output\n```\n[\s\S]*?\n```/,
      [
        '## Error Output',
        '```',
        verify.output.substring(0, 5000),
        '```',
        '',
        '## Heal Attempt',
        '```',
        claudeResult.result.substring(0, 2000),
        '```',
      ].join('\n'),
    );
    writeFileSync(targetPath, updatedContent, 'utf-8');

    return {
      status: 'warn',
      message: `Failed to heal "${scenarioName}" — ${testFiles.length} scenario(s) remaining`,
      artifacts: [{ name: targetFile, path: targetPath, type: 'txt' }],
      data: { healed: null, remaining: testFiles.length },
    };
  }

  private extractField(content: string, prefix: string): string {
    const line = content.split('\n').find(l => l.startsWith(prefix));
    return line ? line.substring(prefix.length).trim() : '';
  }
}
