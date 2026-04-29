import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

interface MissingStep {
  keyword: string;
  stepText: string;
  featureFile: string;
  line: number;
  snippet: string;
}

interface ScenarioGroup {
  scenarioName: string;
  featureFile: string;
  tags: string[];
  gherkin: string;
  missingSteps: MissingStep[];
}

export class Eng01CheckSteps extends Step {
  readonly stepNumber = 101;
  readonly stepName = 'Check Steps';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');
    const summaryPath = resolve(testrunDir, 'summary.json');

    // Preserve cross-run history (round outcomes per tag) across the wipe.
    const preservedSummary = existsSync(summaryPath)
      ? readFileSync(summaryPath, 'utf-8')
      : null;

    if (existsSync(testrunDir)) {
      rmSync(testrunDir, { recursive: true });
    }
    mkdirSync(testrunDir, { recursive: true });

    if (preservedSummary !== null) {
      writeFileSync(summaryPath, preservedSummary, 'utf-8');
    }

    this.log('Running npx bddgen...');
    const result = await this.runBddgen(ctx.projectDir);

    const resultFile = resolve(testrunDir, 'result.testrun');
    writeFileSync(resultFile, result.output, 'utf-8');

    const missingSteps = this.parseMissing(result.output, ctx.projectDir);

    if (missingSteps.length === 0) {
      this.log('All Gherkin steps have definitions');
      return {
        status: 'pass',
        message: 'bddgen OK — all steps defined',
        artifacts: [{ name: 'result.testrun', path: resultFile, type: 'txt' }],
        data: { totalMissing: 0 },
      };
    }

    this.log(`${missingSteps.length} missing step definition(s)`);
    const scenarios = this.groupByScenario(missingSteps, ctx.projectDir);
    this.log(`Across ${scenarios.length} scenario(s). Writing .test files...`);

    const artifacts: Array<{ name: string; path: string; type: 'txt' }> = [
      { name: 'result.testrun', path: resultFile, type: 'txt' },
    ];

    for (const sc of scenarios) {
      const testId = this.extractTestId(sc.scenarioName, sc.tags);
      const fileName = testId ? `${testId}.test` : this.sanitize(sc.scenarioName) + '.test';
      const filePath = resolve(testrunDir, fileName);
      writeFileSync(filePath, this.buildTestFile(sc), 'utf-8');
      this.log(`  → ${fileName} (${sc.missingSteps.length} missing)`);
      artifacts.push({ name: fileName, path: filePath, type: 'txt' });
    }

    return {
      status: 'fail',
      message: `${missingSteps.length} missing step(s) across ${scenarios.length} scenario(s)`,
      artifacts,
      data: { totalMissing: missingSteps.length, totalScenarios: scenarios.length },
    };
  }

  private runBddgen(cwd: string): Promise<{ output: string; exitCode: number }> {
    return new Promise((res) => {
      const proc = spawn('npx', ['bddgen'], { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: true });
      let output = '';
      proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
      proc.on('close', (code) => { res({ output, exitCode: code || 0 }); });
    });
  }

  private parseMissing(output: string, projectDir: string): MissingStep[] {
    const missing: MissingStep[] = [];
    const lines = output.split('\n');

    const headerIdx = lines.findIndex(l => /Missing step definitions:\s*\d+/.test(l));
    if (headerIdx === -1) return [];

    let i = headerIdx + 1;
    while (i < lines.length) {
      const defMatch = lines[i].match(/^(Given|When|Then)\('(.+?)',\s*async/);
      if (defMatch) {
        const keyword = defMatch[1];
        const stepText = defMatch[2];
        const snippetStart = i;
        while (i < lines.length && !lines[i].startsWith('});')) i++;
        if (i < lines.length) i++;
        const snippet = lines.slice(snippetStart, i).join('\n');

        const fromMatch = snippet.match(/\/\/ From:\s*(.+?):(\d+):\d+/);
        let featureFile = '';
        let line = 0;
        if (fromMatch) {
          featureFile = resolve(projectDir, fromMatch[1]);
          line = parseInt(fromMatch[2], 10);
        }

        missing.push({ keyword, stepText, featureFile, line, snippet });
        continue;
      }
      i++;
    }

    return missing;
  }

  private groupByScenario(steps: MissingStep[], projectDir: string): ScenarioGroup[] {
    const map = new Map<string, ScenarioGroup>();

    for (const step of steps) {
      if (!step.featureFile || !existsSync(step.featureFile)) continue;

      const content = readFileSync(step.featureFile, 'utf-8');
      const { scenarioName, tags, gherkin } = this.findScenarioAtLine(content, step.line);
      const key = `${step.featureFile}::${scenarioName}`;

      if (!map.has(key)) {
        map.set(key, { scenarioName, featureFile: step.featureFile, tags, gherkin, missingSteps: [] });
      }
      map.get(key)!.missingSteps.push(step);
    }

    return Array.from(map.values());
  }

  private findScenarioAtLine(content: string, targetLine: number): { scenarioName: string; tags: string[]; gherkin: string } {
    const lines = content.split('\n');
    let scenarioName = 'Unknown';
    let startIdx = -1;
    const tags: string[] = [];

    for (let i = Math.min(targetLine - 1, lines.length - 1); i >= 0; i--) {
      const sm = lines[i].trim().match(/^Scenario(?:\s*Outline)?:\s*(.+)/);
      if (sm) {
        scenarioName = sm[1].trim();
        startIdx = i;
        let j = i - 1;
        while (j >= 0 && lines[j].trim().startsWith('@')) {
          const m = lines[j].trim().match(/@[\w-]+/g);
          if (m) tags.push(...m);
          startIdx = j;
          j--;
        }
        break;
      }
    }

    if (startIdx === -1) return { scenarioName, tags, gherkin: '' };

    const result: string[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (i > startIdx + 1 && (
        trimmed.startsWith('Scenario:') || trimmed.startsWith('Scenario Outline:') ||
        trimmed.startsWith('Rule:') ||
        (trimmed.startsWith('@') && i + 1 < lines.length && /^\s*(Scenario|Rule)/.test(lines[i + 1]))
      )) break;
      result.push(lines[i]);
    }

    return { scenarioName, tags, gherkin: result.join('\n').trimEnd() };
  }

  private buildTestFile(sc: ScenarioGroup): string {
    const sections: string[] = [
      `# Scenario: ${sc.scenarioName}`,
      `Feature: ${sc.featureFile}`,
      `Tags: ${sc.tags.join(' ') || 'none'}`,
      `Type: missing-steps`,
      '',
      '## Gherkin',
      '```gherkin',
      sc.gherkin || '(could not extract)',
      '```',
      '',
      `## Missing Steps (${sc.missingSteps.length})`,
    ];

    for (const step of sc.missingSteps) {
      sections.push('', `### ${step.keyword} ${step.stepText}`, `Line: ${step.line}`, '```typescript', step.snippet, '```');
    }

    return sections.join('\n');
  }

  private extractTestId(scenarioName: string, tags: string[]): string | null {
    for (const tag of tags) {
      const m = tag.match(/^@([A-Z]+-\d+)$/);
      if (m && !m[1].startsWith('SM-') && !m[1].startsWith('SC-') && !m[1].startsWith('TC-') && !m[1].startsWith('EC-')) return m[1];
    }
    const nameMatch = scenarioName.match(/^([A-Z]+-\d+)\b/);
    if (nameMatch) return nameMatch[1];
    return null;
  }

  private sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').substring(0, 80);
  }
}
