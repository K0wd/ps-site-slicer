import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

interface PageEntry {
  name: string;
  route: string;
  slug: string;
}

export class Eng05AppScraper extends Step {
  readonly stepNumber = 105;
  readonly stepName = 'App Scraper';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const htmlDir = resolve(ctx.projectDir, 'html');
    const featureFile = resolve(ctx.projectDir, 'tests', 'features', 'sidebar-navigation.feature');

    if (!existsSync(featureFile)) {
      return { status: 'fail', message: 'sidebar-navigation.feature not found', artifacts: [] };
    }

    // ─── Parse the feature file for the page list ────────────────────────────
    const pages = this.parseFeaturePages(featureFile);
    this.log(`Found ${pages.length} pages in sidebar-navigation.feature`);

    if (pages.length === 0) {
      return { status: 'warn', message: 'No pages found in feature Examples table', artifacts: [] };
    }

    // ─── Check html/ for existing snapshots ──────────────────────────────────
    if (!existsSync(htmlDir)) {
      mkdirSync(htmlDir, { recursive: true });
    }

    const existingFiles = new Set(
      readdirSync(htmlDir)
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace(/\.html$/, '')),
    );

    const missing = pages.filter(p => !existingFiles.has(p.slug));
    const alreadyPresent = pages.length - missing.length;

    this.log(`HTML inventory: ${alreadyPresent} present, ${missing.length} missing`);

    if (missing.length === 0) {
      const inventoryPath = this.writeInventory(ctx, pages, existingFiles);
      this.log('All pages already have HTML snapshots — nothing to scrape');
      return {
        status: 'pass',
        message: `All ${pages.length} pages have HTML snapshots`,
        artifacts: [{ name: 'page-inventory.txt', path: inventoryPath, type: 'txt' }],
        data: { totalPages: pages.length, present: alreadyPresent, scraped: 0, stillMissing: 0 },
      };
    }

    // ─── Log missing pages ───────────────────────────────────────────────────
    for (const p of missing) {
      this.log(`  missing: ${p.slug} (${p.name})`);
    }

    // ─── Run Playwright for missing pages ────────────────────────────────────
    this.log('Running sidebar-navigation tests to scrape missing pages...');

    const grepPatterns = missing.map(p => this.escapeRegex(p.name));
    const grepArg = grepPatterns.join('|');

    const pw = await this.runPlaywright(ctx.projectDir, grepArg);

    // ─── Re-check for still-missing pages ────────────────────────────────────
    const postFiles = new Set(
      readdirSync(htmlDir)
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace(/\.html$/, '')),
    );

    const stillMissing = missing.filter(p => !postFiles.has(p.slug));
    const scraped = missing.length - stillMissing.length;

    this.log(`Scrape complete: ${scraped} new snapshots saved`);

    if (stillMissing.length > 0) {
      for (const p of stillMissing) {
        this.log(`  still missing: ${p.slug} (${p.name})`, 'warn');
      }
    }

    const inventoryPath = this.writeInventory(ctx, pages, postFiles);

    const artifacts: Array<{ name: string; path: string; type: 'txt' }> = [
      { name: 'page-inventory.txt', path: inventoryPath, type: 'txt' },
    ];

    if (pw.output) {
      const resultPath = resolve(ctx.projectDir, 'tests', 'testrun', 'scraper-result.testrun');
      mkdirSync(resolve(ctx.projectDir, 'tests', 'testrun'), { recursive: true });
      writeFileSync(resultPath, pw.output, 'utf-8');
      artifacts.push({ name: 'scraper-result.testrun', path: resultPath, type: 'txt' });
    }

    const totalPresent = alreadyPresent + scraped;
    const status = stillMissing.length === 0 ? 'pass' : 'warn';
    const message = stillMissing.length === 0
      ? `Scraped ${scraped} pages — all ${pages.length} pages now have HTML snapshots`
      : `Scraped ${scraped} pages — ${stillMissing.length} still missing (${totalPresent}/${pages.length} total)`;

    return {
      status,
      message,
      artifacts,
      data: {
        totalPages: pages.length,
        present: totalPresent,
        scraped,
        stillMissing: stillMissing.length,
        missingPages: stillMissing.map(p => p.name),
      },
    };
  }

  private parseFeaturePages(featurePath: string): PageEntry[] {
    const content = readFileSync(featurePath, 'utf-8');
    const lines = content.split('\n');
    const pages: PageEntry[] = [];
    const seen = new Set<string>();

    let inExamples = false;
    let hasHeader = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('Examples:')) {
        inExamples = true;
        hasHeader = false;
        continue;
      }

      if (inExamples && trimmed.startsWith('|')) {
        if (!hasHeader) {
          hasHeader = true;
          continue;
        }

        const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          const name = cells[0];
          const route = cells[1];
          const slug = this.toSlug(name);

          if (!seen.has(slug)) {
            seen.add(slug);
            pages.push({ name, route, slug });
          }
        }
        continue;
      }

      if (inExamples && !trimmed.startsWith('|') && trimmed !== '') {
        inExamples = false;
        hasHeader = false;
      }
    }

    return pages;
  }

  private toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private writeInventory(ctx: StepContext, pages: PageEntry[], existingFiles: Set<string>): string {
    const lines: string[] = [
      `# App Scraper — Page Inventory`,
      `Generated: ${new Date().toISOString()}`,
      `Total pages: ${pages.length}`,
      '',
      '| Status | Page | Slug | Route |',
      '|--------|------|------|-------|',
    ];

    for (const p of pages) {
      const icon = existingFiles.has(p.slug) ? 'OK' : 'MISSING';
      lines.push(`| ${icon} | ${p.name} | ${p.slug} | ${p.route} |`);
    }

    const inventoryPath = resolve(ctx.projectDir, 'tests', 'testrun', 'page-inventory.txt');
    mkdirSync(resolve(ctx.projectDir, 'tests', 'testrun'), { recursive: true });
    writeFileSync(inventoryPath, lines.join('\n'), 'utf-8');
    return inventoryPath;
  }

  private runPlaywright(cwd: string, grepPattern: string): Promise<{ output: string; exitCode: number }> {
    return new Promise((res) => {
      const args = ['playwright', 'test', '--project=edge', '--grep', grepPattern];
      const proc = spawn('npx', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: true });
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
}
