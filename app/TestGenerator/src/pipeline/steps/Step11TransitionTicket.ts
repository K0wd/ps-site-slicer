import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Step11TransitionTicket extends Step {
  readonly stepNumber = 11;
  readonly stepName = 'Transition Ticket';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(11, 'Transition Ticket');

    // Find verdict from results file
    let runDir = this.findLatestTestRunDir(ticketDir);
    if (!runDir && ctx.runPrerequisite) {
      this.log('No test-run directory — auto-running step 7...');
      const p = await ctx.runPrerequisite(7);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 7 failed: ${p.message}`, artifacts: [] };
      runDir = this.findLatestTestRunDir(ticketDir);
    }
    if (!runDir) {
      return { status: 'fail', message: 'No test-run directory found', artifacts: [] };
    }

    const resultsFile = resolve(runDir, '8_results.md');
    if (!existsSync(resultsFile) && ctx.runPrerequisite) {
      this.log('Results file not found — auto-running step 9...');
      const p = await ctx.runPrerequisite(9);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 9 failed: ${p.message}`, artifacts: [] };
    }
    if (!existsSync(resultsFile)) {
      return { status: 'fail', message: 'Results file not found. Run steps 8-9 first.', artifacts: [] };
    }

    const resultsContent = readFileSync(resultsFile, 'utf-8');
    const verdictMatch = resultsContent.match(/RESULT:\s*(PASS|FAIL|NOT TESTED)/);
    const verdict = verdictMatch ? verdictMatch[1] : null;

    if (!verdict) {
      return { status: 'fail', message: 'Could not extract verdict from results file', artifacts: [] };
    }

    this.log(`Verdict: ${verdict}`);
    ctx.logger.logInfo(`Verdict: **${verdict}**`);

    // Show available transitions
    this.log('Fetching available transitions...');
    const transitions = await ctx.services.jira.getTransitions(ticketKey);
    this.log(`Available: ${transitions.map((t: any) => t.name).join(', ')}`);

    // Determine target
    let target: string;
    switch (verdict) {
      case 'PASS':
        target = 'Verify';
        break;
      case 'FAIL':
      case 'NOT TESTED':
      default:
        target = 'QA Failed';
        break;
    }

    // Transition
    this.log(`Transitioning ${ticketKey} → ${target}`);
    await ctx.services.jira.transition(ticketKey, target);

    this.log(`${ticketKey} transitioned to ${target}`);
    ctx.logger.logResult('PASS', `${ticketKey} transitioned to **${target}**`);

    return {
      status: 'pass',
      message: `${ticketKey} transitioned to ${target} (verdict: ${verdict})`,
      artifacts: [],
      data: { verdict, target },
    };
  }

  private findLatestTestRunDir(ticketDir: string): string | null {
    const testRunsDir = resolve(ticketDir, 'test-runs');
    if (!existsSync(testRunsDir)) return null;
    const dirs = readdirSync(testRunsDir).sort().reverse();
    return dirs.length > 0 ? resolve(testRunsDir, dirs[0]) : null;
  }
}
