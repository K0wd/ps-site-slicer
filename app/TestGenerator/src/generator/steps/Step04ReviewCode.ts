import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

interface ReviewCommit {
  source: 'gitlab' | 'local';
  repoLabel: string;     // sm-spa, sm-certs, ...
  hash: string;
  shortHash: string;
  subject: string;
  webUrl?: string;
  // gitlab-only
  gitlabProjectId?: number;
  // local-only
  localRepoPath?: string;
}

export class Step04ReviewCode extends Step {
  readonly stepNumber = 4;
  readonly stepName = 'Review Code';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(4, 'Review Code');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

    // --- Skip if all output files already exist ---
    const commitsFile = resolve(ticketDir, '4_commits.md');
    const changedFile = resolve(ticketDir, '4_changed_files.md');
    const detailsFile = resolve(ticketDir, '4_commit_details.md');

    if (existsSync(commitsFile) && existsSync(changedFile) && existsSync(detailsFile)) {
      this.log(`All 4_* files already exist for ${ticketKey} — skipping code review`);
      ctx.logger.logInfo(`Cached: \`4_commits.md\`, \`4_changed_files.md\`, \`4_commit_details.md\` already on disk`);
      ctx.logger.logResult('PASS', `${ticketKey} code review cached`);
      return {
        status: 'pass',
        message: `${ticketKey} — cached (4_* files exist)`,
        artifacts: [
          { name: '4_commits.md', path: commitsFile, type: 'md' },
          { name: '4_changed_files.md', path: changedFile, type: 'md' },
          { name: '4_commit_details.md', path: detailsFile, type: 'md' },
        ],
      };
    }

    const useGitLab = ctx.services.gitlab.isConfigured;
    let commits: ReviewCommit[] = [];

    if (useGitLab) {
      this.log(`GITLAB_TOKEN configured — searching group "${ctx.config.gitlabGroupPath}" via GitLab API for ${ticketKey}...`);
      ctx.logger.logInfo(`Searching GitLab group **${ctx.config.gitlabGroupPath}** for ${ticketKey}`);
      try {
        const found = await ctx.services.gitlab.searchCommitsInGroup(ticketKey);
        commits = found.map(c => ({
          source: 'gitlab' as const,
          repoLabel: c.projectName,
          hash: c.hash,
          shortHash: c.shortHash,
          subject: c.subject,
          webUrl: c.webUrl,
          gitlabProjectId: c.projectId,
        }));
        this.log(`GitLab API returned ${commits.length} commit(s) for ${ticketKey}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log(`GitLab API search failed: ${msg}`, 'warn');
        ctx.logger.logInfo(`GitLab API search failed: ${msg}`);
      }
    }

    if (commits.length === 0) {
      const repoDirs = ctx.services.git.repoDirs;
      this.log(`Falling back to local git: searching ${repoDirs.length} repo(s)...`);
      ctx.logger.logInfo(`Local repos searched: ${repoDirs.map(r => `\`${r}\``).join(', ') || '(none)'}`);
      try {
        const found = await ctx.services.git.getCommitsForTicket(ticketKey);
        commits = found.map(c => ({
          source: 'local' as const,
          repoLabel: c.repoName,
          hash: c.hash,
          shortHash: c.hash.slice(0, 8),
          subject: c.subject,
          localRepoPath: c.repoPath,
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log(`Local git search failed: ${msg}`, 'warn');
        ctx.logger.logInfo(`Local git search failed: ${msg}`);
      }
    }

    const byRepo = new Map<string, ReviewCommit[]>();
    for (const c of commits) {
      const list = byRepo.get(c.repoLabel) ?? [];
      list.push(c);
      byRepo.set(c.repoLabel, list);
    }

    const commitsMd = commits.length === 0
      ? '(no commits found)'
      : Array.from(byRepo.entries()).map(([repoLabel, list]) => {
          const first = list[0];
          const lines = list.map(c => {
            const link = c.webUrl ? ` — ${c.webUrl}` : '';
            return `${c.shortHash} ${c.subject}${link}`;
          }).join('\n');
          const sourceTag = first.source === 'gitlab' ? '_(via GitLab API)_' : `_(local: ${first.localRepoPath})_`;
          return `## ${repoLabel}\n${sourceTag}\n\n\`\`\`\n${lines}\n\`\`\``;
        }).join('\n\n');

    writeFileSync(commitsFile, commitsMd, 'utf-8');

    const commitCount = commits.length;
    this.log(`Found ${commitCount} commit(s) across ${byRepo.size} repo(s)`);
    ctx.logger.logInfo(`Found **${commitCount}** commit(s) across **${byRepo.size}** repo(s)`);
    if (commitCount > 0) ctx.logger.logCode('Commits', commitsMd);

    const artifacts: StepOutput['artifacts'] = [
      { name: '4_commits.md', path: commitsFile, type: 'md' },
    ];

    let changedCount = 0;

    if (commitCount > 0) {
      const changedSections: string[] = [];
      for (const [repoLabel, list] of byRepo) {
        const first = list[0];
        const newest = list[0];
        const oldest = list[list.length - 1];
        this.log(`[${repoLabel}] gathering changed files...`);
        try {
          let changed: string[] = [];
          if (first.source === 'gitlab') {
            const seen = new Set<string>();
            for (const c of list) {
              const diff = await ctx.services.gitlab.getCommitDiff(c.gitlabProjectId!, c.hash);
              for (const d of diff) {
                const path = d.newPath || d.oldPath;
                if (path && !seen.has(path)) { seen.add(path); changed.push(path); }
              }
            }
          } else {
            const raw = await ctx.services.git.getChangedFiles(first.localRepoPath!, oldest.hash, newest.hash);
            changed = raw ? raw.split('\n').filter(l => l.trim()) : [];
          }
          changedCount += changed.length;
          changedSections.push(
            `## ${repoLabel}\n\n` +
            (changed.length === 0 ? '_(no changed files)_' : '```\n' + changed.join('\n') + '\n```'),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.log(`  [${repoLabel}] diff failed: ${msg}`, 'warn');
          changedSections.push(`## ${repoLabel}\n\n_diff failed: ${msg}_`);
        }
      }

      const changedMd = changedSections.join('\n\n');
      writeFileSync(changedFile, changedMd, 'utf-8');
      this.log(`Changed files: ${changedCount}`);
      ctx.logger.logInfo(`Changed files: **${changedCount}**`);
      if (changedCount > 0) ctx.logger.logCode('Changed files', changedMd);
      artifacts.push({ name: '4_changed_files.md', path: changedFile, type: 'md' });

      this.log(`Opening ${commitCount} commit(s) to record change details...`);
      const detailParts: string[] = [];
      for (const c of commits) {
        try {
          let details: string;
          if (c.source === 'gitlab') {
            const detail = await ctx.services.gitlab.getCommitDetails(c.gitlabProjectId!, c.hash);
            details = detail
              ? `URL: ${detail.webUrl}\nStats: +${detail.stats.additions} -${detail.stats.deletions} (${detail.stats.total} total)\n\n${detail.message}`
              : '(no details returned)';
          } else {
            details = await ctx.services.git.getCommitDetails(c.localRepoPath!, c.hash);
          }
          detailParts.push(`## [${c.repoLabel}] ${c.shortHash}\n\n\`\`\`\n${details}\n\`\`\``);
          ctx.logger.logCode(`[${c.repoLabel}] ${c.shortHash}`, details);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          detailParts.push(`## [${c.repoLabel}] ${c.shortHash}\n\n_Could not open: ${msg}_`);
          this.log(`  Could not open [${c.repoLabel}] ${c.shortHash}: ${msg}`, 'warn');
        }
      }
      writeFileSync(detailsFile, detailParts.join('\n\n') || '(no commit details)', 'utf-8');
      ctx.logger.logInfo(`Recorded details for **${commitCount}** commit(s)`);
      artifacts.push({ name: '4_commit_details.md', path: detailsFile, type: 'md' });
    }

    ctx.logger.logResult('PASS', `Code review complete for ${ticketKey}`);

    return {
      status: 'pass',
      message: `Commits: ${commitCount} | Changed files: ${changedCount} | Source: ${useGitLab && commits.some(c => c.source === 'gitlab') ? 'gitlab' : 'local'}`,
      artifacts,
      data: { commitCount, changedCount, repoCount: byRepo.size },
    };
  }
}
