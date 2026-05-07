import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export interface ParsedVisualEntry {
  localPath: string;
  status: string;
}

// Parse `3_attachments.md` for entries Claude can Read. Each attachment is a
// `## <filename>` block; we only return entries flagged "Visual (Claude can
// Read): yes" with a non-failed/non-skipped status. Pure transformation —
// existence-on-disk is checked at the caller.
//
// The patterns are tolerant of the markdown bold markers Step03 emits
// (`**Field:**`); they match `Field:` with optional `**` on either side.
export function parseVisualEntries(attachmentsMd: string): ParsedVisualEntry[] {
  const out: ParsedVisualEntry[] = [];
  const entries = attachmentsMd.split(/^## /m).slice(1);
  const visualFlag = /Visual \(Claude can Read\)\*{0,2}:\*{0,2}\s*yes\b/i;
  const localPath = /Local path\*{0,2}:\*{0,2}\s*`([^`]+)`/i;
  const statusLine = /Status\*{0,2}:\*{0,2}\s*([^\n]+)/i;

  for (const entry of entries) {
    if (!visualFlag.test(entry)) continue;
    const pathMatch = entry.match(localPath);
    if (!pathMatch) continue;
    const statusMatch = entry.match(statusLine);
    const status = (statusMatch?.[1] || '').trim();
    if (/skipped|failed/i.test(status)) continue;
    out.push({ localPath: pathMatch[1]!, status });
  }
  return out;
}

// Convert Atlassian Document Format (ADF) to plain text.
// ADF is the nested JSON structure Jira uses for rich text (description, comments).
// Raw ADF is ~3-5x larger in tokens than the equivalent plain text due to all the
// structural JSON. This strips the boilerplate while preserving the readable content.
export function adfToText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  const type = n.type as string | undefined;

  if (type === 'text') {
    return (n.text as string) || '';
  }
  if (type === 'hardBreak') return '\n';
  if (type === 'rule') return '\n---\n';

  const children = Array.isArray(n.content)
    ? (n.content as unknown[]).map(adfToText).join('')
    : '';

  switch (type) {
    case 'heading': {
      const level = (n.attrs as any)?.level || 3;
      return `\n${'#'.repeat(level)} ${children}\n`;
    }
    case 'paragraph': return `${children}\n`;
    case 'bulletList': return children;
    case 'orderedList': return children;
    case 'listItem': return `- ${children}`;
    case 'inlineCard': return (n.attrs as any)?.url || children;
    case 'media':
    case 'mediaSingle':
    case 'file': return '';
    default: return children;
  }
}

// Flatten 3_comments.json from raw ADF to readable text, preserving author + date.
export function flattenComments(raw: string): string {
  try {
    const comments = JSON.parse(raw);
    if (!Array.isArray(comments)) return raw;
    return comments.map((c: any) => {
      const author = c.author || 'Unknown';
      const date = c.created ? new Date(c.created).toISOString().slice(0, 10) : '';
      const body = typeof c.body === 'object' ? adfToText(c.body).trim() : String(c.body || '');
      return `[${author}${date ? ` — ${date}` : ''}]\n${body}`;
    }).join('\n\n---\n\n');
  } catch { return raw; }
}

// Flatten 3_issue.json description from ADF to plain text.
export function flattenIssueDescription(raw: string): string {
  try {
    const issue = JSON.parse(raw);
    if (issue?.fields?.description && typeof issue.fields.description === 'object') {
      issue.fields.description = adfToText(issue.fields.description).trim();
    }
    return JSON.stringify(issue, null, 2);
  } catch { return raw; }
}

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

    // --- Skip if both output files already exist ---
    if (existsSync(planFile) && existsSync(manualFile) && statSync(planFile).size > 0 && statSync(manualFile).size > 0) {
      const planSize = statSync(planFile).size;
      const manualSize = statSync(manualFile).size;
      this.log(`Both 5_plan.md and 5_plan_manual.html already exist for ${ticketKey} — skipping`);
      ctx.logger.logInfo(`Cached: \`5_plan.md\` (${planSize}b) + \`5_plan_manual.html\` (${manualSize}b)`);
      ctx.logger.logResult('PASS', `Test plans cached for ${ticketKey}`);
      const content = readFileSync(planFile, 'utf-8');
      const tcIds = [...content.matchAll(/^### ((?:SC|TC|EC)-\d+)/gm)].map(m => m[1]);
      return {
        status: 'pass',
        message: `Cached — ${tcIds.length} scenarios`,
        artifacts: [
          { name: '5_plan.md', path: planFile, type: 'md', sizeBytes: planSize },
          { name: '5_plan_manual.html', path: manualFile, type: 'html', sizeBytes: manualSize },
        ],
        data: { scenarioCount: tcIds.length, tcIds, cached: true },
      };
    }

    // --- Ensure prerequisites exist (auto-run Steps 03/04 if missing) ---
    const issueFile = resolve(ticketDir, '3_issue.json');
    if (!existsSync(issueFile) && ctx.runPrerequisite) {
      this.log('3_issue.json missing — running Step 03 (Review Ticket)...');
      const prereq = await ctx.runPrerequisite(3);
      if (prereq.status === 'fail') {
        return { status: 'fail', message: `Prerequisite Step 03 failed: ${prereq.message}`, artifacts: [] };
      }
    }
    const commitsFilePath = resolve(ticketDir, '4_commits.md');
    if (!existsSync(commitsFilePath) && ctx.runPrerequisite) {
      this.log('4_commits.md missing — running Step 04 (Review Code)...');
      const prereq = await ctx.runPrerequisite(4);
      if (prereq.status === 'fail') {
        return { status: 'fail', message: `Prerequisite Step 04 failed: ${prereq.message}`, artifacts: [] };
      }
    }

    // --- Gather context from previous steps ---
    // ADF (Atlassian Document Format) is flattened to plain text to cut token
    // usage by ~3-5x. Raw JSON stays on disk for traceability.
    this.log('Gathering context from previous steps...');
    let context = '';
    const files = [
      { path: '3_issue.json', label: 'Issue Details', flatten: flattenIssueDescription },
      { path: '3_comments.json', label: 'Comments', flatten: flattenComments },
      { path: '3_attachments.md', label: 'Attachments (with local paths)' },
      { path: '4_commits.md', label: 'Commits' },
      { path: '4_changed_files.md', label: 'Changed Files' },
      { path: '4_commit_details.md', label: 'Commit Details (full messages + stats)' },
    ];
    for (const f of files) {
      const p = resolve(ticketDir, f.path);
      if (existsSync(p)) {
        const raw = readFileSync(p, 'utf-8');
        const content = f.flatten ? f.flatten(raw) : raw;
        context += `\n--- ${f.label} ---\n${content}`;
      }
    }

    // --- Identify visual attachments Claude can Read ---
    // 3_attachments.md is parsed for entries marked "Visual (Claude can Read): yes" with a
    // local path. Each is listed in a VISUAL CONTEXT block in the prompt and Claude is told
    // to use the Read tool on every path before drafting the plan.
    const visualPaths: string[] = [];
    const attachMd = resolve(ticketDir, '3_attachments.md');
    if (existsSync(attachMd)) {
      const parsed = parseVisualEntries(readFileSync(attachMd, 'utf-8'));
      for (const e of parsed) {
        if (existsSync(e.localPath)) visualPaths.push(e.localPath);
      }
    }
    if (visualPaths.length > 0) {
      this.log(`Found ${visualPaths.length} visual attachment(s) Claude will Read for context`);
    }

    // --- Detect existing test plan in Jira (description + comments) ---
    // If found, reuse it as 5_plan.md. Still generates 5_plan_manual.html if missing.
    const forceRegen = !!ctx.options?.runAll;
    let reusedPlan: { content: string; scenarioCount: number; tcIds: string[]; source: string } | null = null;
    if (!forceRegen) {
      const existing = this.detectExistingPlan(ticketDir);
      if (existing) {
        writeFileSync(planFile, existing.content, 'utf-8');
        this.log(`Existing test plan detected in ${existing.source} (${existing.scenarioCount} scenarios)`);
        ctx.logger.logInfo(`Existing test plan detected in **${existing.source}** — **${existing.scenarioCount}** scenarios`);
        reusedPlan = existing;
      }
    } else {
      this.log('runAll=true — skipping existing-plan detection, regenerating');
    }

    // --- Determine environment label from Jira ticket status ---
    // Testing / QA Verified  → TEST
    // On Stage / Stage Verified / Stage Prep → STAGE
    // Anything else → TEST (safe default)
    let envLabel: 'TEST' | 'STAGE' = 'TEST';
    let ticketStatus = '';
    const issuePath = resolve(ticketDir, '3_issue.json');
    if (existsSync(issuePath)) {
      try {
        const issue = JSON.parse(readFileSync(issuePath, 'utf-8'));
        ticketStatus = issue?.fields?.status?.name || '';
        if (/stage/i.test(ticketStatus)) envLabel = 'STAGE';
      } catch { /* fall back to TEST */ }
    }
    this.log(`Ticket status: "${ticketStatus || 'unknown'}" → env: ${envLabel}`);

    // --- Build system prompt context ---
    const contextContent = ctx.services.context.buildStep6Context();
    const contextFile = ctx.services.context.writeToTempFile(contextContent, 'step5-context.md');

    // --- Claude call 1: Test plan (skip if reused from Jira) ---
    let planContent: string;
    let totalTokens = 0;

    if (reusedPlan) {
      planContent = reusedPlan.content;
      this.log(`Using reused plan from ${reusedPlan.source} — skipping Claude generation`);
    } else {
      this.log('Generating test plan via Claude...');
      const visualBlock = visualPaths.length === 0 ? '' : `

## VISUAL CONTEXT (must be read before drafting)

The Jira ticket has ${visualPaths.length} visual attachment(s) — screenshots, mockups, or PDFs that contain information not present in the text fields. Use the **Read** tool on EACH of these absolute paths before you draft the plan, and let what you see in the images influence the scenarios you write (UI flows shown, error states, layout, copy, screenshots of bugs). Do not skip them.

${visualPaths.map(p => `- \`${p}\``).join('\n')}
`;
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

**Draft Gherkin:**

  @SC-XX @${ticketKey}
  Scenario: <Scenario Title>
    Given <setup from pre-conditions>
    When <main user action>
    And <next action if needed>
    Then <primary expected result>
    And <additional assertion if needed>

Map the numbered steps directly to Given/When/Then. Use "Given" for setup (pre-conditions and navigation), "When" for the key user action, "Then" for the expected result. Chain additional steps with "And". Keep it business-readable — no XPaths, no code. Background already handles login so do NOT include login steps here.

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
${visualBlock}
Write the test plan now. Output only the markdown content.`;

      const planResult = await ctx.services.claude.prompt(prompt, {
        outputFormat: 'json',
        appendSystemPromptFile: contextFile,
        allowedTools: visualPaths.length > 0 ? 'Read,mcp__context7' : 'mcp__context7',
      });

      if (!planResult.result.trim()) {
        throw new Error('Claude returned empty test plan content');
      }

      planContent = planResult.result;
      writeFileSync(planFile, planContent, 'utf-8');
      totalTokens = planResult.tokenUsage;
    }

    const planSize = statSync(planFile).size;
    const tcIds = [...planContent.matchAll(/^### ((?:SC|TC|EC)-\d+)/gm)].map(m => m[1]);
    const scCount = tcIds.length;
    if (scCount === 0 && !reusedPlan) {
      throw new Error(`Claude produced ${planSize}-byte plan but no SC-/TC-/EC- scenarios were detected. Check ${planFile} and prompt formatting.`);
    }
    this.log(`Plan: ${scCount} scenarios (${planSize} bytes${reusedPlan ? ', reused' : `, ${totalTokens} tokens`})`);
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
  <div style="background:#e3fcef;color:#006644;padding:8px 12px;border-left:4px solid #006644;font-weight:bold;margin-bottom:12px;">&lt;ChangeMe&gt; in &lt;Env&gt;</div>

  <h4 style="margin:16px 0 4px 0;"><b>Results on ${envLabel}</b></h4>
  <ul>
    <li>
      <b>Verified</b> &lt;action in past tense&gt; &mdash; should &lt;expected outcome&gt;. <span style="color:#006644;font-weight:bold;">PASSED</span>
      <div style="color:#888;font-style:italic;padding:8px 0;">[screenshot placeholder]</div>
    </li>
  </ul>
</div>

## CHECKLIST WRITING RULES

- Do NOT include a "Testing" or "Verify" (present tense) section — go straight to Results
- Each <li> is a single end-to-end check — one assertion per bullet
- Start each bullet with <b>Verified</b> (past tense)
- End each bullet with <span style="color:#006644;font-weight:bold;">PASSED</span>
- Follow each bullet with a [screenshot placeholder] div
- Aim for 3-8 bullets total — derive from the scenarios (SC-XX) and edge cases (EC-XX) in the plan
- The banner says "&lt;ChangeMe&gt; in &lt;Env&gt;" — the tester will replace these placeholders with their own status and environment before pasting

## TEST PLAN TO CONVERT

${planContent}`;

    const manualResult = await ctx.services.claude.prompt(manualPrompt, {
      outputFormat: 'json',
      appendSystemPromptFile: contextFile,
    });

    if (!manualResult.result.trim()) {
      throw new Error('Claude returned empty HTML checklist');
    }

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
      data: { scenarioCount: scCount, tcIds },
    };
  }

  // Scan Jira issue description + comments for an existing test plan.
  // Returns the plan content (markdown-ish) plus a parsed scenario count, or null.
  private detectExistingPlan(ticketDir: string): { content: string; scenarioCount: number; tcIds: string[]; source: string } | null {
    const candidates: Array<{ source: string; text: string }> = [];

    const issuePath = resolve(ticketDir, '3_issue.json');
    if (existsSync(issuePath)) {
      try {
        const issue = JSON.parse(readFileSync(issuePath, 'utf-8'));
        const desc = issue?.fields?.description || '';
        const descText = typeof desc === 'string' ? desc : JSON.stringify(desc);
        if (descText) candidates.push({ source: 'issue description', text: descText });
      } catch { /* ok */ }
    }

    const commentsPath = resolve(ticketDir, '3_comments.json');
    if (existsSync(commentsPath)) {
      try {
        const comments = JSON.parse(readFileSync(commentsPath, 'utf-8'));
        if (Array.isArray(comments)) {
          for (let i = 0; i < comments.length; i++) {
            const body = comments[i]?.body;
            const text = typeof body === 'string' ? body : JSON.stringify(body || '');
            if (text) candidates.push({ source: `comment #${i + 1}`, text });
          }
        }
      } catch { /* ok */ }
    }

    // Heuristic signals: SC-/TC-/EC- markers, "Test Plan" heading, or a Verify/Verified bullet block.
    const tcIdRe = /\b(SC|TC|EC)-\d+\b/g;
    const verifyBulletRe = /<li[^>]*>\s*<b>\s*Verifie?d?\s*<\/b>/i;
    const planHeadingRe = /^(#{1,4}\s*Test\s*Plan|<h\d[^>]*>\s*Test\s*Plan)/im;

    for (const c of candidates) {
      const tcMatches = [...c.text.matchAll(tcIdRe)].map(m => m[0]);
      const tcIds = [...new Set(tcMatches)];
      const hasBullets = verifyBulletRe.test(c.text);
      const hasHeading = planHeadingRe.test(c.text);

      if (tcIds.length >= 2 || (tcIds.length >= 1 && (hasBullets || hasHeading)) || (hasBullets && hasHeading)) {
        return {
          content: c.text,
          scenarioCount: tcIds.length || (c.text.match(/<li[^>]*>/gi) || []).length,
          tcIds,
          source: c.source,
        };
      }
    }
    return null;
  }
}
