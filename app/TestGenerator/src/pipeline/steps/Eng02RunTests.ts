import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

interface TestFailure {
  scenarioName: string;
  featureFile: string;
  tags: string[];
  gherkin: string;
  errorOutput: string;
}

export class Eng02RunTests extends Step {
  readonly stepNumber = 102;
  readonly stepName = 'Run Tests';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const testrunDir = resolve(ctx.projectDir, 'tests', 'testrun');

    if (existsSync(testrunDir)) {
      rmSync(testrunDir, { recursive: true });
    }
    mkdirSync(testrunDir, { recursive: true });

    // Run bddgen to generate spec files
    this.log('Running npx bddgen...');
    const bddgen = await this.exec('npx', ['bddgen'], ctx.projectDir);
    if (/Missing step definitions:\s*\d+/.test(bddgen.output)) {
      this.log('bddgen reports missing steps — run Step 101 to inspect', 'warn');
    }

    // Run Playwright
    this.log('Running npx playwright test --project=edge...');
    const pw = await this.exec('npx', ['playwright', 'test', '--project=edge'], ctx.projectDir);

    const resultFile = resolve(testrunDir, 'result.testrun');
    writeFileSync(resultFile, pw.output, 'utf-8');
    this.log('Test output saved to tests/testrun/result.testrun');

    const failures = this.parseFailures(pw.output, ctx.projectDir);

    if (failures.length === 0 && pw.exitCode === 0) {
      this.log('All tests passed!');
      return {
        status: 'pass',
        message: 'All tests passed',
        artifacts: [{ name: 'result.testrun', path: resultFile, type: 'txt' }],
        data: { totalFailures: 0 },
      };
    }

    if (failures.length === 0 && pw.exitCode !== 0) {
      this.log('Playwright exited with errors but no parseable failures', 'warn');
      return {
        status: 'fail',
        message: 'Playwright failed — check result.testrun for details',
        artifacts: [{ name: 'result.testrun', path: resultFile, type: 'txt' }],
        data: { totalFailures: 0 },
      };
    }

    this.log(`${failures.length} test failure(s). Writing .test files...`);

    const artifacts: Array<{ name: string; path: string; type: 'txt' }> = [
      { name: 'result.testrun', path: resultFile, type: 'txt' },
    ];

    for (const f of failures) {
      const fileName = this.sanitize(f.scenarioName) + '.test';
      const filePath = resolve(testrunDir, fileName);
      writeFileSync(filePath, this.buildTestFile(f), 'utf-8');
      this.log(`  → ${fileName}`);
      artifacts.push({ name: fileName, path: filePath, type: 'txt' });
    }

    return {
      status: 'warn',
      message: `${failures.length} failed scenario(s) — .test files written`,
      artifacts,
      data: { totalFailures: failures.length, scenarios: failures.map(f => f.scenarioName) },
    };
  }

  private exec(cmd: string, args: string[], cwd: string): Promise<{ output: string; exitCode: number }> {
    return new Promise((res) => {
      const proc = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: true });
      let output = '';
      proc.stdout.on('data', (d: Buffer) => {
        const chunk = d.toString();
        output += chunk;
        for (const line of chunk.split('\n').filter(Boolean)) {
          this.emitProgress({ line: line.trimEnd() });
        }
      });
      proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
      proc.on('close', (code) => { res({ output, exitCode: code || 0 }); });
    });
  }

  private parseFailures(output: string, projectDir: string): TestFailure[] {
    const failures: TestFailure[] = [];
    const lines = output.split('\n');
    let i = 0;

    while (i < lines.length) {
      const failMatch = lines[i].match(/^\s+\d+\)\s+\[.*?\]\s+›\s+(.+)$/);
      if (failMatch) {
        const parts = failMatch[1].split('›').map(s => s.trim());

        let scenarioName = '';
        let featureTitle = '';
        let specFile = parts[0]?.replace(/:\d+:\d+$/, '').trim() || '';
        const tags: string[] = [];

        for (const part of parts) {
          const sm = part.match(/Scenario(?:\s*Outline)?:\s*(.+)/);
          if (sm) {
            let text = sm[1].trim();
            const tm = text.match(/@[\w-]+/g);
            if (tm) { tags.push(...tm); text = text.replace(/@[\w-]+/g, '').trim(); }
            scenarioName = text.replace(/\s*[─━]+\s*$/, '').trim();
          }
          const fm = part.match(/Feature:\s*(.+)/);
          if (fm) featureTitle = fm[1].trim();
        }

        if (!scenarioName && parts.length > 0) {
          scenarioName = parts[parts.length - 1].replace(/@[\w-]+/g, '').replace(/\s*[─━]+\s*$/, '').trim();
        }

        i++;
        let errorOutput = '';
        while (i < lines.length) {
          if (/^\s+\d+\)\s+\[/.test(lines[i])) break;
          if (/^\s+\d+\s+(passed|failed|skipped)/.test(lines[i])) break;
          errorOutput += lines[i] + '\n';
          i++;
        }

        const featureFile = this.findFeature(specFile, projectDir, featureTitle);
        let gherkin = '';
        if (existsSync(featureFile) && featureFile.endsWith('.feature')) {
          gherkin = this.extractScenario(readFileSync(featureFile, 'utf-8'), scenarioName);
        }

        failures.push({
          scenarioName: scenarioName || 'Unknown_Scenario',
          featureFile, tags, gherkin,
          errorOutput: errorOutput.trim(),
        });
        continue;
      }
      i++;
    }

    return failures;
  }

  private findFeature(specFile: string, projectDir: string, featureTitle: string): string {
    const specBase = basename(specFile);
    const featureBase = specBase.replace(/\.spec\.(js|ts)$/, '');
    const featuresDir = resolve(projectDir, 'tests', 'features');

    if (existsSync(join(featuresDir, featureBase))) return join(featuresDir, featureBase);

    try {
      for (const f of readdirSync(featuresDir).filter(f => f.endsWith('.feature'))) {
        const fullPath = join(featuresDir, f);
        if (featureTitle && readFileSync(fullPath, 'utf-8').includes(`Feature: ${featureTitle}`)) return fullPath;
      }
    } catch {}

    return specFile;
  }

  private extractScenario(content: string, scenarioName: string): string {
    const lines = content.split('\n');
    let foundIdx = -1;

    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t.includes(`Scenario: ${scenarioName}`) || t.includes(`Scenario Outline: ${scenarioName}`)) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx === -1) return '';

    const result: string[] = [];
    let j = foundIdx - 1;
    while (j >= 0 && lines[j].trim().startsWith('@')) { result.unshift(lines[j]); j--; }

    for (let i = foundIdx; i < lines.length; i++) {
      const t = lines[i].trim();
      if (i > foundIdx && (
        t.startsWith('Scenario:') || t.startsWith('Scenario Outline:') || t.startsWith('Rule:') ||
        (t.startsWith('@') && i + 1 < lines.length && /^\s*(Scenario|Rule)/.test(lines[i + 1]))
      )) break;
      result.push(lines[i]);
    }

    return result.join('\n').trimEnd();
  }

  private buildTestFile(f: TestFailure): string {
    return [
      `# Scenario: ${f.scenarioName}`,
      `Feature: ${f.featureFile}`,
      `Tags: ${f.tags.join(' ') || 'none'}`,
      `Type: test-failure`,
      '',
      '## Gherkin',
      '```gherkin',
      f.gherkin || '(could not extract)',
      '```',
      '',
      '## Error Output',
      '```',
      f.errorOutput,
      '```',
    ].join('\n');
  }

  private sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').substring(0, 80);
  }
}
