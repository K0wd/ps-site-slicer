import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export class Step06WriteGherkin extends Step {
  readonly stepNumber = 6;
  readonly stepName = 'Write Gherkin Steps';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const planFile = resolve(ticketDir, '5_plan.md');
    const testsDir = resolve(ctx.projectDir, 'tests');
    const scratchDir = resolve(ticketDir, '6_gherkin_scratch');

    ctx.logger.logStep(6, 'Write Gherkin Steps');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

    if (!existsSync(planFile)) {
      if (ctx.runPrerequisite) {
        this.log('Test plan not found — auto-running step 5...');
        const prereq = await ctx.runPrerequisite(5);
        if (prereq.status === 'fail') {
          return { status: 'fail', message: `Prerequisite step 5 failed: ${prereq.message}`, artifacts: [] };
        }
      }
      if (!existsSync(planFile)) {
        return { status: 'fail', message: 'Test plan not found. Run step 5 first.', artifacts: [] };
      }
    }

    mkdirSync(scratchDir, { recursive: true });
    const planContent = readFileSync(planFile, 'utf-8');

    // --- Parse TC IDs from plan ---
    const tcIds = [...planContent.matchAll(/^### ((?:SC|TC|EC)-\d+)/gm)].map(m => m[1]);
    if (tcIds.length === 0) {
      return { status: 'fail', message: 'No scenarios (SC-XX/TC-XX/EC-XX) found in plan', artifacts: [] };
    }
    this.log(`Found ${tcIds.length} test cases: ${tcIds.join(', ')}`);

    // --- Gather existing step sigs, features, properties ---
    let existingStepSigs = '(none found)';
    try {
      const raw = execSync(`grep -rh "Given\\|When\\|Then" "${testsDir}/steps/" --include="*.steps.ts" 2>/dev/null | grep -oE "(Given|When|Then)\\(['\\\`].*['\\\`]" | sort -u | head -80`, { encoding: 'utf-8' });
      if (raw.trim()) existingStepSigs = raw.trim();
    } catch { /* ok */ }

    let existingFeatures = '(none)';
    try { existingFeatures = readdirSync(join(testsDir, 'features')).join(', '); } catch { /* ok */ }

    let existingProperties = '(none)';
    try { existingProperties = readdirSync(join(testsDir, 'properties')).join(', '); } catch { /* ok */ }

    let rulesSummary = '';
    const rulesFile = resolve(ctx.projectDir, '.claude/test-automation-expert/rules/effective-rules-summary.mdc');
    if (existsSync(rulesFile)) rulesSummary = readFileSync(rulesFile, 'utf-8');

    const planTitle = (planContent.match(/^# (.+)/m) || [])[1] || ticketKey;

    // --- Build context file ---
    const contextContent = ctx.services.context.buildStep6Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step6-context.md');

    // --- Extract TC sections ---
    const extractSection = (tcId: string): string => {
      const regex = new RegExp(`### ${tcId}[^0-9][\\s\\S]*?(?=### (?:SC|TC|EC)-\\d+|## |$)`, 'm');
      const match = planContent.match(regex);
      return match ? match[0].substring(0, 3000) : '';
    };

    // --- Launch Claude calls (parallel or sequential) ---
    const useParallel = ctx.options?.parallel ?? true;
    this.log(`Launching ${tcIds.length} Claude calls (${useParallel ? 'parallel' : 'sequential'})...`);
    let totalTokens = 0;

    const callClaude = async (tcId: string) => {
      const section = extractSection(tcId);
      const outputFile = resolve(scratchDir, `${tcId}.gherkin`);
      const logFile = resolve(scratchDir, `${tcId}_log.md`);

      writeFileSync(resolve(scratchDir, `${tcId}_section.md`), section, 'utf-8');

      const prompt = `You are a Gherkin test writer. Write exactly ONE Gherkin Scenario for the test case below.

## TEST CASE

${section}

## OUTPUT

Write ONLY the Scenario block (no Feature header, no imports, no code) to: ${outputFile}

Format:
  @${tcId} @${ticketKey}
  Scenario: <descriptive name>
    Given <precondition>
    When <action>
    Then <expected result>

## CANONICAL PATTERN

Background handles login. Individual scenarios MUST NOT repeat login steps.
Each scenario starts from the dashboard.

## REUSE

Existing step phrasings:
${existingStepSigs}

Existing features: ${existingFeatures}
Existing properties: ${existingProperties}

## CONVENTIONS

${rulesSummary}

## STRICT RULES

- Output ONLY the Scenario block — no Feature header, no Background, no fences, no explanation
- Do NOT include login steps — Background handles login
- Reuse existing Given/When/Then phrasings exactly when semantics match
- Business-readable Gherkin only — no XPath, no code
- Tag with @${tcId} @${ticketKey} above the Scenario line
- Use the Write tool to write the output file`;

      const result = await ctx.services.claude.prompt(prompt, {
        outputFormat: 'json',
        appendSystemPromptFile: contextFile,
        allowedTools: 'Read,Write,Glob',
      });

      writeFileSync(logFile, JSON.stringify(result.raw || result.result, null, 2), 'utf-8');
      totalTokens += result.tokenUsage;

      return { tcId, outputFile, success: existsSync(outputFile) && readFileSync(outputFile, 'utf-8').trim().length > 0 };
    };

    let results: PromiseSettledResult<{ tcId: string; outputFile: string; success: boolean }>[];
    if (useParallel) {
      results = await Promise.allSettled(tcIds.map(callClaude));
    } else {
      results = [];
      for (const tcId of tcIds) {
        try {
          const val = await callClaude(tcId);
          results.push({ status: 'fulfilled', value: val });
        } catch (reason) {
          results.push({ status: 'rejected', reason });
        }
      }
    }

    // --- Tally results ---
    let passCount = 0;
    let failCount = 0;
    const failedTcs: string[] = [];

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.success) {
        this.log(`  [OK]   ${r.value.tcId}`);
        passCount++;
      } else {
        const tcId = r.status === 'fulfilled' ? r.value.tcId : 'unknown';
        this.log(`  [FAIL] ${tcId}`, 'warn');
        failCount++;
        failedTcs.push(tcId);
      }
    }
    this.log(`Results: ${passCount} OK, ${failCount} failed (${totalTokens} tokens)`);

    // --- Compile feature file ---
    this.log('Compiling Gherkin scenarios...');
    const featureFile = resolve(testsDir, 'features', `${ticketKey}.feature`);
    const existingContent = existsSync(featureFile) ? readFileSync(featureFile, 'utf-8') : '';

    const sortedIds = [
      ...tcIds.filter(id => id.startsWith('SC-')).sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])),
      ...tcIds.filter(id => id.startsWith('TC-')).sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])),
      ...tcIds.filter(id => id.startsWith('EC-')).sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])),
    ];

    let compiled = '';
    for (const tcId of sortedIds) {
      const outputFile = resolve(scratchDir, `${tcId}.gherkin`);
      if (existsSync(outputFile) && readFileSync(outputFile, 'utf-8').trim()) {
        compiled += '\n' + readFileSync(outputFile, 'utf-8') + '\n';
      } else {
        compiled += `\n  @${tcId} @${ticketKey}\n  Scenario: ${tcId} — TODO (generation failed)\n    Given TODO\n\n`;
      }
    }

    if (existingContent) {
      const dateStr = new Date().toISOString().split('T')[0];
      writeFileSync(featureFile, `${existingContent}\n\n  # --- ${ticketKey} scenarios added ${dateStr} ---\n${compiled}`, 'utf-8');
    } else {
      const dateStr = new Date().toISOString().split('T')[0];
      const header = `Feature: ${ticketKey} — ${planTitle}
  Jira: ${ticketKey}
  Generated by TestGenerator step 6 on ${dateStr}

  Background:
    Given I am on the login page
    When I enter my username
    And I click the next button
    And I enter my password
    And I click the "Let's go" button
    Then I should see the Safe Day's Alert modal
    When I dismiss the Safe Day's Alert
    Then I should be on the dashboard
`;
      writeFileSync(featureFile, header + compiled, 'utf-8');
    }

    const scenarioCount = (readFileSync(featureFile, 'utf-8').match(/^\s*Scenario/gm) || []).length;
    this.log(`Feature file: ${scenarioCount} scenarios`);

    // --- Run bddgen ---
    this.log('Running bddgen...');
    const bddgen = await ctx.services.playwright.runBddgen();
    if (bddgen.success) {
      this.log('bddgen: OK');
    } else {
      this.log('bddgen: FAILED — check output before running step 8', 'warn');
    }

    ctx.logger.logResult('PASS', `Gherkin steps written for ${ticketKey} — ${passCount}/${tcIds.length} test cases`);

    return {
      status: failCount === 0 ? 'pass' : 'warn',
      message: `${passCount}/${tcIds.length} scenarios generated (${totalTokens} tokens)`,
      artifacts: [{ name: `${ticketKey}.feature`, path: featureFile, type: 'txt' }],
      tokenUsage: totalTokens,
      data: { passCount, failCount, failedTcs, scenarioCount },
    };
  }
}
