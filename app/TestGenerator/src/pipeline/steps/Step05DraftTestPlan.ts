import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Step05DraftTestPlan extends Step {
  readonly stepNumber = 5;
  readonly stepName = 'Draft Test Plan';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);
    const planFile = resolve(ticketDir, '5_plan.md');
    const manualFile = resolve(ticketDir, '5_plan_manual.html');

    ctx.logger.logStep(5, 'Draft Test Plan');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

    // --- Gather context from previous steps ---
    this.log('Gathering context from previous steps...');
    let context = '';
    const files = [
      { path: '3_issue.json', label: 'Issue Details' },
      { path: '3_comments.json', label: 'Comments' },
      { path: '4_commits.md', label: 'Commits' },
      { path: '4_changed_files.md', label: 'Changed Files' },
    ];
    for (const f of files) {
      const p = resolve(ticketDir, f.path);
      if (existsSync(p)) {
        context += `\n--- ${f.label} ---\n${readFileSync(p, 'utf-8')}`;
      }
    }

    // --- Build system prompt context ---
    const contextContent = ctx.services.context.buildStep6Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step5-context.md');

    // --- Claude call 1: Test plan ---
    this.log('Generating test plan via Claude...');
    const prompt = `You are a senior QA test analyst applying ISTQB principles. Based on the Jira ticket data below, write a test plan using TEST SCENARIOS — not individual test cases.

## ISTQB PRINCIPLES TO APPLY

- **Exhaustive testing is impossible** — focus effort on the highest-risk flows
- **Defects cluster together** — concentrate scenarios around the changed functionality
- **Testing is context-dependent** — match scenarios to the feature under test
- A test SCENARIO is an end-to-end flow that verifies multiple related checks in a single logical sequence
- Group related verifications into one scenario instead of splitting each into a separate test case
- Aim for **3-7 scenarios total** — not 10-17 individual test cases

## SCENARIO STRUCTURE

Each scenario MUST follow this format:

### SC-XX: <Scenario Title>

**Objective:** What this scenario proves
**Pre-conditions:** What must be true before starting

**Steps:**
1. <Action> → **Expected:** <result>
2. <Action> → **Expected:** <result>
3. <Action> → **Expected:** <result>

A single scenario can have 5-10 steps. Each step includes the action AND its expected result inline.

## PLAN STRUCTURE

The plan must include:
- **Summary** of what is being tested (1-2 sentences)
- **Pre-conditions** (shared across all scenarios)
- **Scenarios** (SC-01 through SC-XX) — the main test flows
- **Edge cases** (EC-01 through EC-XX) — boundary/negative flows (keep to 2-3 max)

## TEST ENVIRONMENT

- SM project URL: ${ctx.config.baseUrl}spa
- SM-PWA project URL: ${ctx.config.baseUrl}testpwa
- Credentials: username: ${ctx.config.testUsername} / password: ${ctx.config.testPassword}

## TICKET DATA

Ticket: ${ticketKey}

${context}

Write the test plan now. Output only the markdown content.`;

    const planResult = await ctx.services.claude.prompt(prompt, {
      outputFormat: 'json',
      appendSystemPromptFile: contextFile,
    });

    writeFileSync(planFile, planResult.result, 'utf-8');
    let totalTokens = planResult.tokenUsage;

    const planSize = statSync(planFile).size;
    const scCount = (planResult.result.match(/^### (SC|TC|EC)-/gm) || []).length;
    this.log(`Plan: ${scCount} scenarios (${planSize} bytes, ${planResult.tokenUsage} tokens)`);
    ctx.logger.logInfo(`Test plan: \`5_plan.md\` (${scCount} scenarios, ${planSize} bytes)`);

    // --- Claude call 2: Manual HTML checklist ---
    this.log('Generating HTML checklist via Claude...');
    const manualPrompt = `You are a QA test analyst. Convert the test plan below into a self-contained HTML snippet designed to be copy-pasted into a Jira comment editor. The rich formatting (bold, inline code, bulleted list, colored PASSED markers, screenshot placeholders) must survive the paste into Jira.

## OUTPUT REQUIREMENTS

- Output raw HTML only — no markdown code fences, no preamble, no trailing commentary
- Use inline styles only (Jira strips <style> blocks and <script>)
- Use semantic tags: <h4>, <ul>, <li>, <b>, <code>, <span>, <div>

## STRUCTURE (follow exactly)

<div>
  <div style="background:#e3fcef;color:#006644;padding:8px 12px;border-left:4px solid #006644;font-weight:bold;margin-bottom:12px;">&#10003; PASSED in TEST</div>

  <h4 style="margin:12px 0 4px 0;"><b>Testing on TEST</b></h4>
  <ul>
    <li><b>Verify</b> &lt;concise action, present tense&gt; &mdash; should &lt;expected outcome&gt;.</li>
  </ul>

  <h4 style="margin:16px 0 4px 0;"><b>Results on TEST</b></h4>
  <ul>
    <li>
      <b>Verified</b> &lt;same action, past tense&gt; &mdash; should &lt;expected outcome&gt;. <span style="color:#006644;font-weight:bold;">PASSED</span>
      <div style="color:#888;font-style:italic;padding:8px 0;">[screenshot placeholder]</div>
    </li>
  </ul>
</div>

## CHECKLIST WRITING RULES

- Each <li> is a single end-to-end check — one assertion per bullet
- Start with <b>Verify</b> (Testing section) or <b>Verified</b> (Results section)
- Aim for 3-8 bullets total — derive from the scenarios (SC-XX) and edge cases (EC-XX) in the plan
- The Results section mirrors the Testing section one-for-one, in the same order

## TEST PLAN TO CONVERT

${planResult.result}`;

    const manualResult = await ctx.services.claude.prompt(manualPrompt, {
      outputFormat: 'json',
      appendSystemPromptFile: contextFile,
    });

    writeFileSync(manualFile, manualResult.result, 'utf-8');
    totalTokens += manualResult.tokenUsage;

    const manualSize = statSync(manualFile).size;
    this.log(`HTML checklist: ${manualSize} bytes (${manualResult.tokenUsage} tokens)`);
    ctx.logger.logInfo(`HTML checklist: \`5_plan_manual.html\` (${manualSize} bytes)`);
    ctx.logger.logResult('PASS', `Test plans drafted for ${ticketKey}`);

    return {
      status: 'pass',
      message: `${scCount} scenarios drafted (${totalTokens} tokens)`,
      artifacts: [
        { name: '5_plan.md', path: planFile, type: 'md', sizeBytes: planSize },
        { name: '5_plan_manual.html', path: manualFile, type: 'html', sizeBytes: manualSize },
      ],
      tokenUsage: totalTokens,
      data: { scenarioCount: scCount },
    };
  }
}
