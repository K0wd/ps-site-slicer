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

    // --- Detect existing scenarios tagged with @<ticketKey> across all feature files ---
    // If found, short-circuit: report the count and surface the scenario list.
    // Operator can force regen via runAll, and per-TC mode (ctx.tcId) bypasses this.
    const forceRegen = !!ctx.options?.runAll;
    if (!forceRegen && !ctx.tcId) {
      const existing = this.detectExistingScenarios(testsDir, ticketKey);
      if (existing.count > 0) {
        const scratchOk = (() => { try { mkdirSync(scratchDir, { recursive: true }); return true; } catch { return false; } })();
        const summaryFile = resolve(ticketDir, '6_existing_scenarios.md');
        writeFileSync(summaryFile, existing.summary, 'utf-8');
        this.log(`${existing.count} existing test cases found for @${ticketKey}`);
        ctx.logger.logInfo(`**${existing.count}** existing test case(s) found for \`@${ticketKey}\``);
        ctx.logger.logCode(`Existing @${ticketKey} scenarios`, existing.summary);
        ctx.logger.logResult('PASS', `Reused ${existing.count} existing scenarios for ${ticketKey}`);
        const artifacts: StepOutput['artifacts'] = [{ name: '6_existing_scenarios.md', path: summaryFile, type: 'md' }];
        if (existing.featureFile) artifacts.push({ name: existing.featureFile.split('/').pop()!, path: existing.featureFile, type: 'txt' });
        return {
          status: 'pass',
          message: `${existing.count} existing scenarios found for @${ticketKey} — skipping generation`,
          artifacts,
          data: { passCount: existing.count, failCount: 0, scenarioCount: existing.count, reused: true, scratchOk },
        };
      }
    } else if (forceRegen) {
      this.log('runAll=true — skipping existing-scenario detection, regenerating');
    }

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

    // --- Parse TC IDs from plan (or scope to a single tcId in per-TC mode) ---
    const allTcIds = [...planContent.matchAll(/^### ((?:SC|TC|EC)-\d+)/gm)].map(m => m[1]);
    if (allTcIds.length === 0) {
      return { status: 'fail', message: 'No scenarios (SC-XX/TC-XX/EC-XX) found in plan', artifacts: [] };
    }
    const singleTcMode = !!ctx.tcId;
    const tcIds = singleTcMode
      ? (allTcIds.includes(ctx.tcId!) ? [ctx.tcId!] : [])
      : allTcIds;
    if (singleTcMode && tcIds.length === 0) {
      return { status: 'fail', message: `tcId ${ctx.tcId} not found in plan`, artifacts: [] };
    }
    this.log(singleTcMode
      ? `Per-TC mode: generating gherkin for ${ctx.tcId}`
      : `Found ${tcIds.length} test cases: ${tcIds.join(', ')}`);

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
    const rulesFile = resolve(ctx.projectDir, '.claude-self/rules/effective-rules-summary.mdc');
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

      const hasDraftGherkin = section.includes('Draft Gherkin:') || section.includes('**Draft Gherkin**');
      const prompt = hasDraftGherkin
        ? `You are a Gherkin formatter. The test plan section below already contains a **Draft Gherkin** block. Your job is to finalize it — not invent from scratch.

## TEST CASE (with Draft Gherkin)

${section}

## YOUR TASK

1. Locate the **Draft Gherkin:** block in the test case above
2. Finalize it: ensure tags are @${tcId} @${ticketKey}, reuse existing step phrasings where they match semantically, tighten wording for business readability
3. Write the final Scenario block to: ${outputFile}

## CANONICAL PATTERN

Background handles login. Do NOT include login steps — each scenario starts from the dashboard.

## REUSE EXISTING STEP PHRASINGS

When an existing phrasing matches the intent, use it EXACTLY:
${existingStepSigs}

Existing features: ${existingFeatures}
Existing properties: ${existingProperties}

## CONVENTIONS

${rulesSummary}

## STRICT RULES

- Output ONLY the finalized Scenario block — no Feature header, no Background, no fences, no explanation
- Tags MUST be @${tcId} @${ticketKey} on the line above Scenario
- Do NOT include login steps
- Business-readable Gherkin only — no XPath, no code
- Use the Write tool to write the output file`
        : `You are a Gherkin test writer. Write exactly ONE Gherkin Scenario for the test case below.

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
        allowedTools: 'Read,Write,Glob,mcp__context7',
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

    const buildBlock = (tcId: string): string => {
      const outputFile = resolve(scratchDir, `${tcId}.gherkin`);
      if (existsSync(outputFile) && readFileSync(outputFile, 'utf-8').trim()) {
        return readFileSync(outputFile, 'utf-8').trim() + '\n';
      }
      return `  @${tcId} @${ticketKey}\n  Scenario: ${tcId} — TODO (generation failed)\n    Given TODO\n`;
    };

    const featureHeader = (): string => {
      const dateStr = new Date().toISOString().split('T')[0];
      return `Feature: ${ticketKey} — ${planTitle}
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
    };

    if (singleTcMode) {
      // Per-TC upsert: replace this TC's block in-place if it exists, else append.
      const tcId = sortedIds[0];
      const block = buildBlock(tcId);
      let updated: string;
      if (!existingContent) {
        updated = featureHeader() + '\n' + block;
      } else {
        const blockRegex = new RegExp(`\\n?\\s*@${tcId}\\s+@${ticketKey}[\\s\\S]*?(?=\\n\\s*@(?:SC|TC|EC)-\\d+|\\s*$)`, 'm');
        if (blockRegex.test(existingContent)) {
          updated = existingContent.replace(blockRegex, '\n' + block);
        } else {
          updated = existingContent.replace(/\s*$/, '') + '\n\n' + block;
        }
      }
      writeFileSync(featureFile, updated, 'utf-8');
    } else {
      let compiled = '';
      for (const tcId of sortedIds) compiled += '\n' + buildBlock(tcId);
      if (existingContent) {
        const dateStr = new Date().toISOString().split('T')[0];
        writeFileSync(featureFile, `${existingContent}\n\n  # --- ${ticketKey} scenarios added ${dateStr} ---\n${compiled}`, 'utf-8');
      } else {
        writeFileSync(featureFile, featureHeader() + compiled, 'utf-8');
      }
    }

    const scenarioCount = (readFileSync(featureFile, 'utf-8').match(/^\s*Scenario/gm) || []).length;
    this.log(`Feature file: ${scenarioCount} scenarios`);

    // --- Run bddgen ---
    this.log('Running bddgen...');
    const bddgen = await ctx.services.playwright.runBddgen();
    // "Missing step definitions" is expected at step 6 — step 7 adds the implementations.
    // Only treat bddgen as a hard failure if there is a real parse/syntax error.
    const missingStepsOnly = !bddgen.success && bddgen.output.includes('Missing step definitions');
    if (bddgen.success) {
      this.log('bddgen: OK');
    } else if (missingStepsOnly) {
      this.log('bddgen: missing step definitions (will be added in step 7)', 'warn');
    } else {
      this.log('bddgen: FAILED — check output before running step 8', 'warn');
    }

    ctx.logger.logResult('PASS', `Gherkin steps written for ${ticketKey} — ${passCount}/${tcIds.length} test cases`);

    const hardFail = !bddgen.success && !missingStepsOnly;
    return {
      status: hardFail ? 'fail' : failCount === 0 ? (missingStepsOnly ? 'warn' : 'pass') : 'warn',
      message: hardFail
        ? `bddgen failed — ${passCount}/${tcIds.length} scenarios generated (${totalTokens} tokens)`
        : missingStepsOnly
          ? `${passCount}/${tcIds.length} scenarios generated (missing step definitions — run step 7) (${totalTokens} tokens)`
          : `${passCount}/${tcIds.length} scenarios generated (${totalTokens} tokens)`,
      artifacts: [{ name: `${ticketKey}.feature`, path: featureFile, type: 'txt' }],
      tokenUsage: totalTokens,
      data: { passCount, failCount, failedTcs, scenarioCount, bddgenFailed: hardFail },
    };
  }

  // Scan tests/features/*.feature for scenarios tagged with @<ticketKey>.
  // A "scenario" is any tag line that includes @<ticketKey>; we capture the
  // tag triplet and the line of the next Scenario header for context.
  private detectExistingScenarios(testsDir: string, ticketKey: string): { count: number; summary: string; featureFile?: string } {
    const featuresDir = join(testsDir, 'features');
    if (!existsSync(featuresDir)) return { count: 0, summary: '' };

    const tagRe = new RegExp(`@${ticketKey.replace(/[-]/g, '\\-')}\\b`);
    const lines: string[] = [];
    let count = 0;
    let firstFile: string | undefined;

    let files: string[] = [];
    try { files = readdirSync(featuresDir).filter(f => f.endsWith('.feature')); } catch { return { count: 0, summary: '' }; }

    for (const f of files) {
      const path = join(featuresDir, f);
      const content = readFileSync(path, 'utf-8');
      const fileLines = content.split('\n');
      for (let i = 0; i < fileLines.length; i++) {
        const line = fileLines[i];
        if (!tagRe.test(line)) continue;
        const tags = line.trim();
        const scenarioLine = (fileLines[i + 1] || '').trim();
        lines.push(`- **${f}** — \`${tags}\` → ${scenarioLine}`);
        count++;
        if (!firstFile) firstFile = path;
      }
    }

    const summary = count === 0
      ? `No scenarios tagged with @${ticketKey} found.`
      : `# Existing scenarios for @${ticketKey}\n\nFound **${count}** scenario(s):\n\n${lines.join('\n')}\n`;

    return { count, summary, featureFile: firstFile };
  }
}
