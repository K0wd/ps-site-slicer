import { readFileSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';
import { findLatestTestRunDir } from './stepUtils.js';
import type { JiraAttachment } from '../../services/JiraService.js';

const KB_TICKET = 'KB-3';

export class Step10PostResults extends Step {
  readonly stepNumber = 10;
  readonly stepName = 'Post Results';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(10, `Post Results to ${KB_TICKET} and ${ticketKey}`);

    let runDir = findLatestTestRunDir(ticketDir);
    if (!runDir && ctx.runPrerequisite) {
      this.log('No test-run directory — auto-running step 7...');
      const p = await ctx.runPrerequisite(7);
      if (p.status === 'fail') return { status: 'fail', message: `Prerequisite step 7 failed: ${p.message}`, artifacts: [] };
      runDir = findLatestTestRunDir(ticketDir);
    }
    if (!runDir) {
      return { status: 'fail', message: 'No test-run directory found. Run step 7 first.', artifacts: [] };
    }

    // --- Discover per-TC result files ---
    const screenshotsDir = resolve(runDir, '7_tc_logs');
    const allRunFiles = readdirSync(runDir);

    const tcIdsFromResults = allRunFiles
      .map(f => f.match(/^8_results_((?:SC|TC|EC)-\d+)\.md$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map(m => m[1]);

    const tcIds = tcIdsFromResults.length > 0
      ? tcIdsFromResults.sort()
      : (existsSync(resolve(runDir, '8_results.md')) ? ['__all__'] : []);

    if (tcIds.length === 0) {
      return { status: 'fail', message: 'No 8_results*.md files found. Run steps 8-9 first.', artifacts: [] };
    }

    // --- Group media by TC (scan only — no upload yet) ---
    const screenshotsByTc = new Map<string, string[]>();
    const videosByTc = new Map<string, string[]>();
    let mediaFiles: string[] = [];

    if (existsSync(screenshotsDir)) {
      mediaFiles = readdirSync(screenshotsDir).filter(f => /\.(png|jpg|jpeg|webm|mp4|mov)$/i.test(f));
      for (const file of mediaFiles) {
        const tcMatch = file.match(/^((?:SC|TC|EC)-\d+)/);
        const tc = tcMatch ? tcMatch[1] : '__all__';
        const isVideo = /\.(webm|mp4|mov)$/i.test(file);
        const bucket = isVideo ? videosByTc : screenshotsByTc;
        if (!bucket.has(tc)) bucket.set(tc, []);
        bucket.get(tc)!.push(file);
      }
    }

    // --- Upload to KB-3, capture attachment IDs ---
    let kbAttachments: JiraAttachment[] = [];
    if (mediaFiles.length > 0) {
      this.log(`Uploading ${mediaFiles.length} media file(s) to ${KB_TICKET}...`);
      kbAttachments = await this.uploadMedia(ctx, KB_TICKET, screenshotsDir, mediaFiles);
      this.log(`  ${kbAttachments.length} file(s) uploaded to ${KB_TICKET}`);
    }

    // --- Upload to source ticket, capture attachment IDs ---
    let ticketAttachments: JiraAttachment[] = [];
    if (mediaFiles.length > 0) {
      this.log(`Uploading ${mediaFiles.length} media file(s) to ${ticketKey}...`);
      ticketAttachments = await this.uploadMedia(ctx, ticketKey, screenshotsDir, mediaFiles);
      this.log(`  ${ticketAttachments.length} file(s) uploaded to ${ticketKey}`);
    }

    // --- Build journey comment text ---
    const journey = this.buildJourneyComment(ticketKey, ticketDir, runDir, tcIds, screenshotsByTc, videosByTc);

    // --- Write local HTML proof ---
    const htmlPath = resolve(runDir, '10_journey.html');
    writeFileSync(htmlPath, this.buildLocalHTML(ticketKey, runDir, tcIds, screenshotsByTc, videosByTc), 'utf-8');
    this.log(`Local proof: ${htmlPath}`);

    // --- Post to KB-3 with inline screenshots ---
    this.log(`Posting journey comment to ${KB_TICKET}...`);
    await ctx.services.jira.addComment(KB_TICKET, journey, kbAttachments);

    // --- Post to source ticket with inline screenshots ---
    this.log(`Posting journey comment to ${ticketKey}...`);
    await ctx.services.jira.addComment(ticketKey, journey, ticketAttachments);

    ctx.logger.logInfo(`Uploaded **${kbAttachments.length}** screenshot(s) to ${KB_TICKET} and **${ticketAttachments.length}** to ${ticketKey}`);
    ctx.logger.logInfo(`Journey comment with inline screenshots posted to ${KB_TICKET} and ${ticketKey}`);
    ctx.logger.logResult('PASS', `Journey for ${ticketKey} posted to ${KB_TICKET} + ${ticketKey} (${tcIds.length} TC${tcIds.length === 1 ? '' : 's'})`);

    return {
      status: 'pass',
      message: `${kbAttachments.length} screenshots uploaded, journey posted to ${KB_TICKET} + ${ticketKey} for ${tcIds.length} TC(s)`,
      artifacts: [{ name: '10_journey.html', path: htmlPath, type: 'html' }],
      data: { uploadCount: kbAttachments.length, tcCount: tcIds.length, postedTo: [KB_TICKET, ticketKey] },
    };
  }

  private async uploadMedia(
    ctx: StepContext,
    issueKey: string,
    screenshotsDir: string,
    files: string[],
  ): Promise<JiraAttachment[]> {
    const attachments: JiraAttachment[] = [];
    for (const file of files) {
      try {
        const result = await ctx.services.jira.uploadAttachment(issueKey, resolve(screenshotsDir, file));
        const uploaded = Array.isArray(result) ? result[0] : result;
        if (uploaded?.id) attachments.push({ id: String(uploaded.id), filename: file });
        this.log(`  Uploaded: ${file}`, 'debug');
      } catch (err) {
        this.log(`  Failed to upload ${file} to ${issueKey}: ${err}`, 'warn');
      }
    }
    return attachments;
  }

  private buildLocalHTML(
    ticketKey: string,
    runDir: string,
    tcIds: string[],
    screenshotsByTc: Map<string, string[]>,
    videosByTc: Map<string, string[]>,
  ): string {
    const readIfExists = (p: string) => existsSync(p) ? readFileSync(p, 'utf-8') : '';

    type TcData = { id: string; verdict: string; summary: string; steps: { name: string; result: string; notes: string }[] };
    const tcData: TcData[] = [];
    let totalPass = 0; let totalFail = 0; let totalNotTested = 0;

    for (const tcId of tcIds) {
      const suffix = tcId === '__all__' ? '' : `_${tcId}`;
      const md = readIfExists(resolve(runDir, `8_results${suffix}.md`));
      const verdict = (md.match(/RESULT:\s*(PASS|FAIL|NOT TESTED)/) || [])[1] || 'UNKNOWN';
      tcData.push({ id: tcId, verdict, summary: this.extractSection(md, 'Summary'), steps: this.extractTestCaseRows(md) });
      if (verdict === 'PASS') totalPass++;
      else if (verdict === 'FAIL') totalFail++;
      else totalNotTested++;
    }

    const overallVerdict = totalFail > 0 ? '✗ FAIL'
      : totalNotTested > 0 && totalPass === 0 ? '· NOT TESTED'
      : totalPass > 0 ? '✓ PASS' : '· UNKNOWN';
    const verdictColor = totalFail > 0 ? '#ae2a19' : totalPass > 0 ? '#006644' : '#6b7280';

    const tcBlocks = tcData.map(tc => {
      const mark = tc.verdict === 'PASS' ? '✓' : tc.verdict === 'FAIL' ? '✗' : '·';
      const color = tc.verdict === 'PASS' ? '#006644' : tc.verdict === 'FAIL' ? '#ae2a19' : '#6b7280';
      const label = tc.id === '__all__' ? 'Combined' : tc.id;

      const stepRows = tc.steps.map(s => {
        const rc = s.result.toUpperCase().includes('PASS') ? '#006644' : '#ae2a19';
        return `<li style="padding:3px 0;font-size:13px;">${s.name} — <span style="color:${rc};font-weight:600;">${s.result}</span>${s.notes ? ` <span style="color:#888;font-size:12px;">(${s.notes})</span>` : ''}</li>`;
      }).join('');

      const shots = screenshotsByTc.get(tc.id) ?? [];
      const vids = videosByTc.get(tc.id) ?? [];

      const imgTags = shots.map(f =>
        `<a href="7_tc_logs/${f}" target="_blank"><img src="7_tc_logs/${f}" alt="${f}" style="max-width:380px;border:1px solid #ddd;border-radius:4px;margin:4px;cursor:pointer;" title="${f}"></a>`
      ).join('');

      const vidLinks = vids.map(f =>
        `<a href="7_tc_logs/${f}" target="_blank" style="display:inline-block;margin:4px;padding:6px 10px;background:#f0f0f0;border-radius:4px;font-size:12px;color:#333;text-decoration:none;">&#9654; ${f}</a>`
      ).join('');

      const mediaBlock = (imgTags || vidLinks)
        ? `<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;">${imgTags}${vidLinks}</div>`
        : `<p style="color:#888;font-size:12px;margin:8px 0 0;">No screenshots captured.</p>`;

      return `
<div style="background:white;border-radius:8px;padding:20px;margin-bottom:16px;border-left:4px solid ${color};">
  <h3 style="margin:0 0 10px;font-size:16px;color:${color};">${mark} ${label} — ${tc.verdict}</h3>
  ${tc.summary ? `<p style="margin:0 0 10px;font-size:13px;color:#444;line-height:1.5;">${tc.summary.replace(/\n/g, '<br>')}</p>` : ''}
  ${stepRows ? `<ul style="margin:0 0 10px;padding-left:20px;list-style:disc;">${stepRows}</ul>` : ''}
  ${mediaBlock}
</div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Test Journey — ${ticketKey}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;margin:0;padding:24px;}
    *{box-sizing:border-box;}
    img:hover{outline:2px solid #0052cc;}
  </style>
</head>
<body>
  <div style="max-width:960px;margin:0 auto;">
    <div style="background:white;border-radius:8px;padding:20px;margin-bottom:16px;border-left:4px solid ${verdictColor};">
      <h1 style="margin:0 0 6px;font-size:20px;">TestGenerator Journey — ${ticketKey}</h1>
      <p style="margin:0;font-size:16px;color:${verdictColor};font-weight:600;">${overallVerdict}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#888;">${new Date().toISOString()} · ${totalPass} passed · ${totalFail} failed · ${totalNotTested} not tested</p>
    </div>
    ${tcBlocks}
  </div>
</body>
</html>`;
  }

  private buildJourneyComment(
    ticketKey: string,
    ticketDir: string,
    runDir: string,
    tcIds: string[],
    screenshotsByTc: Map<string, string[]>,
    videosByTc: Map<string, string[]>,
  ): string {
    const readIfExists = (p: string) => existsSync(p) ? readFileSync(p, 'utf-8') : '';

    type TcData = {
      id: string;
      verdict: string;
      summary: string;
      steps: { name: string; result: string; notes: string }[];
    };
    const tcData: TcData[] = [];
    let totalPass = 0;
    let totalFail = 0;
    let totalNotTested = 0;

    for (const tcId of tcIds) {
      const suffix = tcId === '__all__' ? '' : `_${tcId}`;
      const md = readIfExists(resolve(runDir, `8_results${suffix}.md`));
      const verdict = (md.match(/RESULT:\s*(PASS|FAIL|NOT TESTED)/) || [])[1] || 'UNKNOWN';
      tcData.push({
        id: tcId,
        verdict,
        summary: this.extractSection(md, 'Summary'),
        steps: this.extractTestCaseRows(md),
      });
      if (verdict === 'PASS') totalPass++;
      else if (verdict === 'FAIL') totalFail++;
      else totalNotTested++;
    }

    const overallVerdict = totalFail > 0 ? '✗ FAIL'
      : totalNotTested > 0 && totalPass === 0 ? '· NOT TESTED'
      : totalPass > 0 ? '✓ PASS'
      : '· UNKNOWN';

    const lines: string[] = [];
    lines.push(`TestGenerator Journey — ${ticketKey}`);
    lines.push(`Run: ${runDir.split('/').slice(-2).join('/')}`);
    lines.push(`Date: ${new Date().toISOString()}`);
    lines.push('');
    lines.push(`Overall Verdict: ${overallVerdict}`);
    lines.push('');

    lines.push('Test items');
    for (const tc of tcData) {
      const mark = tc.verdict === 'PASS' ? '✓' : tc.verdict === 'FAIL' ? '✗' : '·';
      const label = tc.id === '__all__' ? 'All' : tc.id;
      lines.push(`  - ${label}: ${mark} ${tc.verdict}`);
    }
    lines.push('');
    lines.push('─────────────────────────────────────────');
    lines.push('');

    for (const tc of tcData) {
      const mark = tc.verdict === 'PASS' ? '✓' : tc.verdict === 'FAIL' ? '✗' : '·';
      const label = tc.id === '__all__' ? 'Combined' : tc.id;
      lines.push(`${label} — ${mark} ${tc.verdict}`);
      lines.push('');

      lines.push('What is tested:');
      lines.push(tc.summary || '(no summary recorded)');
      lines.push('');

      if (tc.steps.length > 0) {
        lines.push('Step results:');
        for (const s of tc.steps) {
          lines.push(`  - ${s.name} — ${s.result}`);
          if (s.notes) lines.push(`    Note: ${s.notes}`);
        }
        lines.push('');
      }

      const shots = screenshotsByTc.get(tc.id) ?? [];
      const vids = videosByTc.get(tc.id) ?? [];
      if (shots.length > 0) lines.push(`Screenshots: ${shots.join(', ')}`);
      if (vids.length > 0) lines.push(`Video: ${vids.join(', ')}`);
      if (shots.length === 0 && vids.length === 0) lines.push('Screenshots/Video: (none uploaded)');
      lines.push('');
      lines.push('─────────────────────────────────────────');
      lines.push('');
    }

    lines.push('Summary');
    lines.push(`  ✓ PASS: ${totalPass}`);
    lines.push(`  ✗ FAIL: ${totalFail}`);
    lines.push(`  · NOT TESTED / UNKNOWN: ${totalNotTested}`);
    lines.push('');
    lines.push(`Source ticket: ${ticketKey}`);

    return lines.join('\n');
  }

  private extractSection(md: string, heading: string): string {
    if (!md) return '';
    const re = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const m = md.match(re);
    return m ? m[1].trim() : '';
  }

  private extractTestCaseRows(md: string): { name: string; result: string; notes: string }[] {
    const section = this.extractSection(md, 'Test Cases');
    if (!section) return [];
    const rows: { name: string; result: string; notes: string }[] = [];
    for (const line of section.split('\n')) {
      if (!line.startsWith('|')) continue;
      const cells = line.split('|').map(c => c.trim());
      if (cells.length < 4) continue;
      const [, name, result, notes] = cells;
      if (/^Test Case$/i.test(name) || /^[-:]+$/.test(name)) continue;
      rows.push({
        name: name.replace(/^`|`$/g, ''),
        result,
        notes: notes ?? '',
      });
    }
    return rows;
  }

}
