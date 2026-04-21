import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Step04ReviewCode extends Step {
  readonly stepNumber = 4;
  readonly stepName = 'Review Code';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(4, 'Review Code');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

    // --- Find commits ---
    this.log('Searching for commits...');
    let commits = '';
    try {
      commits = await ctx.services.git.getCommitsForTicket(ticketKey);
    } catch {
      commits = '';
    }

    const commitsFile = resolve(ticketDir, '4_commits.md');
    writeFileSync(commitsFile, commits || '(no commits found)', 'utf-8');

    const commitLines = commits ? commits.split('\n').filter(l => l.trim()) : [];
    const commitCount = commitLines.length;
    this.log(`Found ${commitCount} commit(s)`);
    ctx.logger.logInfo(`Found **${commitCount}** commit(s)`);
    if (commits) ctx.logger.logCode('Commits', commits);

    // --- Changed files ---
    let changedCount = 0;
    const artifacts: StepOutput['artifacts'] = [
      { name: '4_commits.md', path: commitsFile, type: 'md' },
    ];

    if (commitCount > 0) {
      const firstCommit = commitLines[commitLines.length - 1].split(' ')[0];
      const lastCommit = commitLines[0].split(' ')[0];

      this.log(`Diffing ${firstCommit}..${lastCommit}...`);
      let changed = '';
      try {
        changed = await ctx.services.git.getChangedFiles(firstCommit, lastCommit);
      } catch {
        changed = '';
      }

      const changedFile = resolve(ticketDir, '4_changed_files.md');
      writeFileSync(changedFile, changed || '(no changed files)', 'utf-8');
      changedCount = changed ? changed.split('\n').filter(l => l.trim()).length : 0;

      this.log(`Changed files: ${changedCount}`);
      ctx.logger.logInfo(`Changed files: **${changedCount}**`);
      if (changed) ctx.logger.logCode('Changed files', changed);

      artifacts.push({ name: '4_changed_files.md', path: changedFile, type: 'md' });
    }

    ctx.logger.logResult('PASS', `Code review complete for ${ticketKey}`);

    return {
      status: 'pass',
      message: `Commits: ${commitCount} | Changed files: ${changedCount}`,
      artifacts,
      data: { commitCount, changedCount },
    };
  }
}
