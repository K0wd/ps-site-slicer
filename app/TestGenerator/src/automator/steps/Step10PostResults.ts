import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export class Step10PostResults extends Step {
  readonly stepNumber = 10;
  readonly stepName = 'Post Results';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(10, 'Post Results to Jira');

    let runDir = this.findLatestTestRunDir(ticketDir);
    if (!runDir && ctx.runPrerequisite) {
      this.log('No test-run directory — auto-running step 7...');
      const p = await ctx.runPrerequisite(7);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 7 failed: ${p.message}`, artifacts: [] };
      runDir = this.findLatestTestRunDir(ticketDir);
    }
    if (!runDir) {
      return { status: 'fail', message: 'No test-run directory found. Run step 7 first.', artifacts: [] };
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

    // --- Upload screenshots ---
    const screenshotsDir = resolve(runDir, '7_tc_logs');
    let uploadCount = 0;

    if (existsSync(screenshotsDir)) {
      const images = readdirSync(screenshotsDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
      if (images.length > 0) {
        this.log(`Uploading ${images.length} screenshot(s)...`);
        for (const img of images) {
          const imgPath = resolve(screenshotsDir, img);
          try {
            await ctx.services.jira.uploadAttachment(ticketKey, imgPath);
            this.log(`  Uploaded: ${img}`);
            uploadCount++;
          } catch (err) {
            this.log(`  Failed to upload ${img}: ${err}`, 'warn');
          }
        }
      } else {
        this.log('No screenshots found to upload');
      }
    }

    // --- Post results comment ---
    this.log('Posting results comment to Jira...');
    const resultsContent = readFileSync(resultsFile, 'utf-8');
    await ctx.services.jira.addComment(ticketKey, resultsContent);

    this.log('Results comment posted');
    ctx.logger.logInfo(`Uploaded **${uploadCount}** screenshot(s)`);
    ctx.logger.logInfo('Results comment posted to Jira');
    ctx.logger.logResult('PASS', `Results posted to ${ticketKey}`);

    return {
      status: 'pass',
      message: `${uploadCount} screenshots uploaded, results comment posted`,
      artifacts: [],
      data: { uploadCount },
    };
  }

  private findLatestTestRunDir(ticketDir: string): string | null {
    const testRunsDir = resolve(ticketDir, 'test-runs');
    if (!existsSync(testRunsDir)) return null;
    const dirs = readdirSync(testRunsDir).sort().reverse();
    return dirs.length > 0 ? resolve(testRunsDir, dirs[0]) : null;
  }
}
