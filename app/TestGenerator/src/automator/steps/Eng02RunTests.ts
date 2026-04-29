import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

interface TestCaseTag {
  tag: string;
  featureFile: string;
  scenarioName: string;
  gherkin: string;
  gherkinSteps: string[];
  allTags: string[];
}

type RunOutcome = 'pass' | 'flaky' | 'fail';
type TagStatus = 'stable-pass' | 'stable-fail' | 'flaky' | 'unknown';

interface TagHistory {
  outcomes: RunOutcome[];
  status: TagStatus;
  lastRun: string;
  // True once the most-recent outcome has been posted as a KB-3 Jira comment.
  // Reset to false on each new outcome and flipped to true when the post resolves.
  postedToKB3: boolean;
}

interface SummaryFile {
  updated: string;
  tags: Record<string, TagHistory>;
}

const SUMMARY_HISTORY_DEPTH = 2;

function classify(outcomes: RunOutcome[]): TagStatus {
  if (outcomes.length < SUMMARY_HISTORY_DEPTH) return 'unknown';
  const last = outcomes.slice(-SUMMARY_HISTORY_DEPTH);
  if (last.every(o => o === 'pass')) return 'stable-pass';
  if (last.every(o => o === 'fail')) return 'stable-fail';
  return 'flaky';
}

// Playwright prints "N flaky" in its summary when a test fails on the first
// attempt and passes on retry. Exit code is 0 in that case, so we'd otherwise
// misclassify it as a clean pass.
function detectFlaky(output: string): boolean {
  return /\b\d+\s+flaky\b/.test(output);
}

export class Eng02RunTests extends Step {
  readonly stepNumber = 102;
  readonly stepName = 'Run Tests';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');

    if (!existsSync(testrunDir)) {
      mkdirSync(testrunDir, { recursive: true });
    }

    const summaryPath = resolve(testrunDir, 'summary.json');
    const summary = this.loadSummary(summaryPath);

    const featuresDir = resolve(ctx.projectDir, 'tests', 'features');
    const testCases = this.collectTestCases(featuresDir);

    if (testCases.length === 0) {
      this.log('No test case tags found in feature files');
      return { status: 'warn', message: 'No test case tags found', artifacts: [] };
    }

    this.log(`Found ${testCases.length} test case(s) to run`);

    let passed = 0;
    let flaky = 0;
    let failed = 0;
    let skipped = 0;
    let stableSkipped = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testFilePath = resolve(testrunDir, `${tc.tag}.test`);
      const flakyFilePath = resolve(testrunDir, `${tc.tag}.flaky`);

      if (existsSync(testFilePath)) {
        this.log(`[${i + 1}/${testCases.length}] ${tc.tag}: skipped — pending heal`);
        skipped++;
        continue;
      }

      if (existsSync(flakyFilePath)) {
        this.log(`[${i + 1}/${testCases.length}] ${tc.tag}: skipped — pending decalcification`);
        skipped++;
        continue;
      }

      if (summary.tags[tc.tag]?.status === 'stable-pass') {
        this.log(`[${i + 1}/${testCases.length}] ${tc.tag}: skipped — stable-pass (last ${summary.tags[tc.tag].lastRun})`);
        stableSkipped++;
        continue;
      }

      // ─── Report scenario info ──────────────────────────────────────────
      this.log(`━━━ [${i + 1}/${testCases.length}] ${tc.tag}: ${tc.scenarioName} ━━━`);
      this.log(`Feature: ${basename(tc.featureFile)}`);
      this.log(`Tags: ${tc.allTags.join(' ')}`);

      // Report Gherkin steps
      for (const step of tc.gherkinSteps) {
        this.log(`  ${step}`, 'debug');
      }

      // ─── Run test with streaming output ────────────────────────────────
      this.log(`Running: --grep "${tc.tag}" --project=chromium`);

      const startTime = Date.now();
      let lastLine = '';

      const result = await ctx.services.playwright.runTest(`${tc.tag}\\b`, (chunk) => {
        const lines = chunk.split('\n').filter(l => l.trim());
        for (const line of lines) {
          // Strip ANSI escape codes (color/cursor) and orphaned [1A[2K cursor seqs.
          const clean = line
            .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
            .replace(/\[1A\[2K/g, '')
            .trim();
          if (!clean) continue;
          if (clean.includes('ExperimentalWarning')) continue;
          if (clean.includes('trace-warnings')) continue;
          if (clean.includes('injected env')) continue;
          lastLine = clean;

          if (/\d+\s+(passed|failed|skipped)/.test(clean)) {
            this.log(`${clean}`);
          } else if (/^\s*\d+\)\s+\[/.test(clean)) {
            this.log(`${clean}`, 'error');
          } else if (/^(Error|Timeout|expect\()/.test(clean) || clean.includes('strict mode')) {
            this.log(`  ${clean}`, 'error');
          } else if (clean.startsWith('Running ') || clean.includes('› ')) {
            this.log(`${clean}`, 'debug');
          }
        }
      });

      const duration = Math.round((Date.now() - startTime) / 1000);
      // Trust Playwright's exit code. Retried-but-eventually-passing tests
      // emit "1 failed" in intermediate status lines while still exiting 0;
      // grepping the output for "failed" misclassifies those as failures.
      // The only failure mode the exit code misses is "No tests found" —
      // Playwright still exits 0 in that case, so we guard against it.
      const noTestsFound = /No tests? found/i.test(result.output);
      const isFlaky = result.success && !noTestsFound && detectFlaky(result.output);
      const testPassed = result.success && !noTestsFound && !isFlaky;

      if (testPassed) {
        passed++;
        this.recordOutcome(summary, tc.tag, 'pass');
        this.saveSummary(summaryPath, summary);
        this.postToKB3(ctx, summary, summaryPath, tc.tag, this.buildJiraComment(tc, 'pass', duration, summary.tags[tc.tag]));
        for (const step of tc.gherkinSteps) {
          this.log(`  ✓ ${step}`);
        }
        this.log(`✓ ${tc.tag} PASSED (${duration}s)`);
        this.log('');
        continue;
      }

      if (isFlaky) {
        flaky++;
        this.recordOutcome(summary, tc.tag, 'flaky');
        this.saveSummary(summaryPath, summary);
        this.postToKB3(ctx, summary, summaryPath, tc.tag, this.buildJiraComment(tc, 'flaky', duration, summary.tags[tc.tag], result.output));
        writeFileSync(flakyFilePath, this.buildTestFile(tc, result.output), 'utf-8');
        this.log(`⚠ ${tc.tag} FLAKY — passed on retry (${duration}s)`, 'warn');
        this.log(`Wrote ${tc.tag}.flaky — pending decalcification`);
        this.log('');
        continue;
      }

      // ─── Failed — report details and stop ──────────────────────────────
      failed++;
      this.recordOutcome(summary, tc.tag, 'fail');
      this.saveSummary(summaryPath, summary);
      this.postToKB3(ctx, summary, summaryPath, tc.tag, this.buildJiraComment(tc, 'fail', duration, summary.tags[tc.tag], result.output));
      this.log(`✗ ${tc.tag} FAILED (${duration}s)`, 'error');

      // Parse and report Gherkin step results from output
      this.reportStepResults(result.output, tc.gherkinSteps);

      writeFileSync(testFilePath, this.buildTestFile(tc, result.output), 'utf-8');
      this.log(`Wrote ${tc.tag}.test — stopping to heal`);

      const progress = this.buildProgressSummary(passed, flaky, failed, skipped, stableSkipped, testCases.length);
      return {
        status: 'warn',
        message: `${tc.tag} failed — ${progress}`,
        artifacts: [
          { name: `${tc.tag}.test`, path: testFilePath, type: 'txt' },
          { name: 'summary.json', path: summaryPath, type: 'txt' },
        ],
        data: { passed, flaky, failed, skipped, stableSkipped, total: testCases.length, failedTag: tc.tag },
      };
    }

    if (failed > 0 || flaky > 0 || skipped > 0) {
      const progress = this.buildProgressSummary(passed, flaky, failed, skipped, stableSkipped, testCases.length);
      this.log(progress);
      return {
        status: 'warn',
        message: progress,
        artifacts: [{ name: 'summary.json', path: summaryPath, type: 'txt' }],
        data: { passed, flaky, failed, skipped, stableSkipped, total: testCases.length },
      };
    }

    const tail = stableSkipped > 0 ? ` (${stableSkipped} stable-pass skipped)` : '';
    this.log(`All ${passed} test(s) passed${tail}!`);
    return {
      status: 'pass',
      message: `All ${passed} test(s) passed${tail}`,
      artifacts: [{ name: 'summary.json', path: summaryPath, type: 'txt' }],
      data: { passed, flaky: 0, failed: 0, skipped: 0, stableSkipped, total: testCases.length },
    };
  }

  private loadSummary(path: string): SummaryFile {
    if (!existsSync(path)) {
      return { updated: new Date().toISOString(), tags: {} };
    }
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf-8')) as SummaryFile;
      if (!parsed.tags || typeof parsed.tags !== 'object') {
        return { updated: new Date().toISOString(), tags: {} };
      }
      return parsed;
    } catch {
      this.log(`summary.json unreadable — starting fresh`, 'warn');
      return { updated: new Date().toISOString(), tags: {} };
    }
  }

  private saveSummary(path: string, summary: SummaryFile): void {
    summary.updated = new Date().toISOString();
    writeFileSync(path, JSON.stringify(summary, null, 2), 'utf-8');
  }

  private recordOutcome(summary: SummaryFile, tag: string, outcome: RunOutcome): void {
    const prev = summary.tags[tag]?.outcomes ?? [];
    const outcomes = [...prev, outcome].slice(-SUMMARY_HISTORY_DEPTH);
    summary.tags[tag] = {
      outcomes,
      status: classify(outcomes),
      lastRun: new Date().toISOString(),
      postedToKB3: false,
    };
  }

  private postToKB3(ctx: StepContext, summary: SummaryFile, summaryPath: string, tag: string, body: string): void {
    ctx.services.jira.addComment('KB-3', body)
      .then(() => {
        const entry = summary.tags[tag];
        if (entry) {
          entry.postedToKB3 = true;
          this.saveSummary(summaryPath, summary);
        }
        this.log(`→ Posted ${tag} result to KB-3`, 'debug');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        this.log(`Failed to post ${tag} to KB-3: ${msg}`, 'warn');
      });
  }

  private buildJiraComment(tc: TestCaseTag, outcome: RunOutcome, duration: number, history: TagHistory, errorOutput?: string): string {
    const icon = outcome === 'pass' ? '✅' : outcome === 'flaky' ? '⚠️' : '❌';
    const verdict = outcome === 'pass' ? 'PASSED' : outcome === 'flaky' ? 'FLAKY' : 'FAILED';
    const round = history.outcomes.length;
    const lines: string[] = [
      `${icon} ${tc.tag} ${verdict} (${duration}s)`,
      `Feature: ${basename(tc.featureFile)}`,
      `Scenario: ${tc.scenarioName}`,
      `Round: ${round}/${SUMMARY_HISTORY_DEPTH}  |  History: [${history.outcomes.join(', ')}]  |  Status: ${history.status}`,
      `Run: ${history.lastRun}`,
      '',
      'Gherkin:',
    ];

    if (outcome === 'pass') {
      for (const step of tc.gherkinSteps) lines.push(`  ✓ ${step}`);
      return lines.join('\n');
    }

    if (outcome === 'flaky') {
      for (const step of tc.gherkinSteps) lines.push(`  ⚠ ${step}`);
      lines.push('');
      lines.push('Failed on first attempt, passed on retry — pending decalcification.');
      return lines.join('\n');
    }

    const { failedIdx, errorLines } = this.analyzeStepResults(errorOutput ?? '', tc.gherkinSteps);
    for (let i = 0; i < tc.gherkinSteps.length; i++) {
      const step = tc.gherkinSteps[i];
      if (failedIdx === -1)            lines.push(`  ? ${step}`);
      else if (i < failedIdx)          lines.push(`  ✓ ${step}`);
      else if (i === failedIdx)        lines.push(`  ✗ ${step}`);
      else                             lines.push(`  − ${step}`);
    }
    if (errorLines.length > 0) {
      lines.push('');
      lines.push('Why it fails:');
      for (const e of errorLines) lines.push(`  ${e}`);
    } else if (failedIdx === -1) {
      lines.push('');
      lines.push('Why it fails: (could not localize — see test artifact for full output)');
    }
    return lines.join('\n');
  }

  private analyzeStepResults(output: string, gherkinSteps: string[]): { failedIdx: number; errorLines: string[] } {
    const cleaned = output.split('\n').map(l => l.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').trim());
    const cleanedJoined = cleaned.join('\n');

    let failedIdx = -1;
    for (let i = 0; i < gherkinSteps.length; i++) {
      const stepText = gherkinSteps[i].replace(/^(Given|When|Then|And|But)\s+/, '');
      if (cleanedJoined.includes(stepText)) failedIdx = i;
    }

    const errorLines = cleaned.filter(t =>
      /^(Error|Timeout|expect\(|Locator|Call log|waiting for|received|expected|Pending operations)/.test(t) ||
      t.includes('strict mode violation')
    ).slice(0, 12);

    return { failedIdx, errorLines };
  }

  private reportStepResults(output: string, gherkinSteps: string[]): void {
    const { failedIdx, errorLines } = this.analyzeStepResults(output, gherkinSteps);

    for (let i = 0; i < gherkinSteps.length; i++) {
      if (failedIdx === -1)            this.log(`  ? ${gherkinSteps[i]}`, 'warn');
      else if (i < failedIdx)          this.log(`  ✓ ${gherkinSteps[i]}`);
      else if (i === failedIdx)        this.log(`  ✗ ${gherkinSteps[i]}`, 'error');
      else                             this.log(`  − ${gherkinSteps[i]}`, 'debug');
    }

    for (const e of errorLines) this.log(`  ${e}`, 'error');

    if (/No tests? found/i.test(output)) this.log('  No tests matched the grep pattern', 'error');
  }

  private buildProgressSummary(passed: number, flaky: number, failed: number, skipped: number, stableSkipped: number, total: number): string {
    const parts: string[] = [];
    if (passed > 0) parts.push(`${passed} passed`);
    if (flaky > 0) parts.push(`${flaky} flaky`);
    if (failed > 0) parts.push(`${failed} failed`);
    if (skipped > 0) parts.push(`${skipped} pending`);
    if (stableSkipped > 0) parts.push(`${stableSkipped} stable-pass skipped`);
    return `${parts.join(', ')} of ${total} total`;
  }

  private collectTestCases(featuresDir: string): TestCaseTag[] {
    const testCases: TestCaseTag[] = [];
    if (!existsSync(featuresDir)) return testCases;

    for (const file of readdirSync(featuresDir).filter(f => f.endsWith('.feature'))) {
      const fullPath = resolve(featuresDir, file);
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const scenarioMatch = lines[i].trim().match(/^Scenario(?:\s*Outline)?:\s*(.+)/);
        if (!scenarioMatch) continue;

        const scenarioName = scenarioMatch[1].trim();

        const allTags: string[] = [];
        let j = i - 1;
        while (j >= 0 && lines[j].trim().startsWith('@')) {
          const found = lines[j].trim().match(/@[\w-]+/g);
          if (found) allTags.push(...found);
          j--;
        }

        const testIdTag = allTags.find(t => {
          const m = t.match(/^@([A-Z]+-\d+)$/);
          return m && !m[1].startsWith('SM-') && !m[1].startsWith('SC-') && !m[1].startsWith('TC-') && !m[1].startsWith('EC-');
        });

        if (!testIdTag) continue;

        // Extract gherkin lines and step texts
        const gherkinLines: string[] = [];
        const gherkinSteps: string[] = [];
        let k = i - 1;
        while (k >= 0 && lines[k].trim().startsWith('@')) { gherkinLines.unshift(lines[k]); k--; }
        for (let s = i; s < lines.length; s++) {
          const t = lines[s].trim();
          if (s > i && (
            t.startsWith('Scenario:') || t.startsWith('Scenario Outline:') || t.startsWith('Rule:') ||
            (t.startsWith('@') && s + 1 < lines.length && /^\s*(Scenario|Rule)/.test(lines[s + 1]))
          )) break;
          gherkinLines.push(lines[s]);
          if (/^\s*(Given|When|Then|And|But)\s+/.test(lines[s])) {
            gherkinSteps.push(t);
          }
        }

        testCases.push({
          tag: testIdTag.replace('@', ''),
          featureFile: fullPath,
          scenarioName,
          gherkin: gherkinLines.join('\n').trimEnd(),
          gherkinSteps,
          allTags,
        });
      }
    }

    return testCases.sort((a, b) => a.tag.localeCompare(b.tag));
  }

  private buildTestFile(tc: TestCaseTag, errorOutput: string): string {
    return [
      `# Scenario: ${tc.scenarioName}`,
      `Feature: ${tc.featureFile}`,
      `Tags: ${tc.allTags.join(' ') || 'none'}`,
      `Type: test-failure`,
      '',
      '## Gherkin',
      '```gherkin',
      tc.gherkin || '(could not extract)',
      '```',
      '',
      '## Error Output',
      '```',
      errorOutput.substring(0, 5000),
      '```',
    ].join('\n');
  }
}
