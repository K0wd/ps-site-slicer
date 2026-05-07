import { writeFileSync, statSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

// MIME types Claude can read directly via the Read tool (multimodal).
export const VISUAL_MIMES = /^(image\/(png|jpe?g|gif|webp)|application\/pdf)$/i;
export const VISUAL_EXT = /\.(png|jpe?g|gif|webp|pdf)$/i;
// Cap individual attachment size to keep downloads bounded (10 MB).
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Sanitize an arbitrary user-supplied filename to a safe path component.
// Strips path separators, control bytes, leading dots; caps length at 200.
export function safeName(name: string): string {
  return name.replace(/[/\\\x00-\x1f]/g, '_').replace(/^\.+/, '_').slice(0, 200) || 'attachment';
}

// Decide whether an attachment is something Claude can Read as visual context
// (PNG/JPG/GIF/WebP/PDF). MIME type wins when present, extension is the fallback.
export function isVisualAttachment(filename: string, mimeType: string | undefined | null): boolean {
  const mime = (mimeType || '').trim();
  return (mime !== '' && VISUAL_MIMES.test(mime)) || VISUAL_EXT.test(filename);
}

export class Step03ReviewTicket extends Step {
  readonly stepNumber = 3;
  readonly stepName = 'Review Ticket';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(3, 'Review Ticket');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

    // --- Skip if all output files already exist ---
    const issueFile = resolve(ticketDir, '3_issue.json');
    const commentsFile = resolve(ticketDir, '3_comments.json');
    const attachFile = resolve(ticketDir, '3_attachments.md');

    if (existsSync(issueFile) && existsSync(commentsFile) && existsSync(attachFile)) {
      const issueSize = statSync(issueFile).size;
      this.log(`All 3_* files already exist for ${ticketKey} — skipping Jira fetch`);
      ctx.logger.logInfo(`Cached: \`3_issue.json\`, \`3_comments.json\`, \`3_attachments.md\` already on disk`);
      ctx.logger.logResult('PASS', `${ticketKey} review cached`);
      return {
        status: 'pass',
        message: `${ticketKey} — cached (3_* files exist)`,
        artifacts: [
          { name: '3_issue.json', path: issueFile, type: 'json', sizeBytes: issueSize },
          { name: '3_comments.json', path: commentsFile, type: 'json' },
          { name: '3_attachments.md', path: attachFile, type: 'md' },
        ],
      };
    }

    // --- Issue details ---
    this.log('Fetching issue details...');
    const issueFields = 'summary,description,issuetype,status,priority,parent,assignee,reporter,labels,attachment,environment';
    const rawIssue = await ctx.services.jira.getIssue(ticketKey, issueFields);

    const f = rawIssue.fields || {};
    const userName = (obj: any) => (obj && typeof obj === 'object' ? obj.displayName || '' : '');
    const attachmentNames = (f.attachment || [])
      .filter((a: any) => typeof a === 'object')
      .map((a: any) => a.filename || '');

    const parentData: Record<string, string> = {};
    if (f.parent && typeof f.parent === 'object') {
      parentData.key = f.parent.key || '';
      parentData.summary = f.parent.fields?.summary || '';
    }

    const trimmedIssue = {
      key: rawIssue.key,
      fields: {
        summary: f.summary || '',
        description: f.description || '',
        issuetype: f.issuetype?.name || '',
        status: f.status?.name || '',
        priority: f.priority?.name || '',
        assignee: userName(f.assignee),
        reporter: userName(f.reporter),
        labels: f.labels || [],
        environment: f.environment || '',
        parent: parentData,
        attachments: attachmentNames,
      },
    };

    writeFileSync(issueFile, JSON.stringify(trimmedIssue, null, 2), 'utf-8');
    const issueSize = statSync(issueFile).size;

    this.log(`Issue: ${issueSize} bytes — ${trimmedIssue.fields.summary}`);
    ctx.logger.logInfo(`Issue: **${issueSize}** bytes`);

    // --- Comments ---
    this.log('Fetching comments...');
    const rawComments = await ctx.services.jira.getComments(ticketKey);
    const commentsList = rawComments.comments || rawComments;
    const trimmedComments = (Array.isArray(commentsList) ? commentsList : []).map((c: any) => ({
      author: c.author?.displayName || '',
      body: c.body || '',
      created: c.created || '',
    }));

    writeFileSync(commentsFile, JSON.stringify(trimmedComments, null, 2), 'utf-8');
    const commentCount = trimmedComments.length;

    this.log(`Comments: ${commentCount}`);
    ctx.logger.logInfo(`Comments: **${commentCount}**`);

    // --- Attachments ---
    this.log('Fetching attachment metadata...');
    const attachments = await ctx.services.jira.getAttachments(ticketKey);

    // Download each attachment to logs/info/<ticket>/attachments/. Skips files that already exist
    // on disk (idempotent re-runs) and files larger than MAX_ATTACHMENT_BYTES.
    const attachDir = resolve(ticketDir, 'attachments');
    const lines: string[] = [];
    let visualCount = 0;
    let downloadedCount = 0;
    let skippedCount = 0;

    if (attachments.length === 0) {
      lines.push(`No attachments on ${ticketKey}`);
    } else {
      lines.push(`# Attachments for ${ticketKey}`);
      lines.push('');
      for (const a of attachments) {
        const filename = safeName(a.filename || 'attachment');
        const size = a.size || 0;
        const mime = a.mimeType || '';
        const localPath = resolve(attachDir, filename);
        const isVisual = isVisualAttachment(filename, mime);
        const tooBig = size > MAX_ATTACHMENT_BYTES;

        let status = 'metadata only';
        if (existsSync(localPath)) {
          status = 'cached on disk';
          downloadedCount += 1;
        } else if (tooBig) {
          status = `skipped: ${size} bytes exceeds ${MAX_ATTACHMENT_BYTES}-byte cap`;
          skippedCount += 1;
        } else {
          try {
            const dl = await ctx.services.jira.downloadAttachment(a.content, localPath);
            status = `downloaded ${dl.bytes} bytes (${dl.contentType})`;
            downloadedCount += 1;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            status = `download failed: ${msg}`;
            skippedCount += 1;
            this.log(`  ${filename}: ${msg}`, 'warn');
          }
        }
        if (isVisual && existsSync(localPath)) visualCount += 1;

        lines.push(`## ${a.filename}`);
        lines.push('');
        lines.push(`- **Local path:** \`${localPath}\``);
        lines.push(`- **Remote URL:** ${a.content}`);
        lines.push(`- **MIME:** ${mime || '(unknown)'}`);
        lines.push(`- **Size:** ${size} bytes`);
        lines.push(`- **Visual (Claude can Read):** ${isVisual ? 'yes' : 'no'}`);
        lines.push(`- **Status:** ${status}`);
        lines.push('');
      }
    }

    writeFileSync(attachFile, lines.join('\n'), 'utf-8');

    this.log(`Attachments: ${attachments.length} (downloaded ${downloadedCount}, skipped ${skippedCount}, ${visualCount} readable by Claude)`);
    ctx.logger.logInfo(`Attachments: **${attachments.length}** (downloaded **${downloadedCount}**, **${visualCount}** readable by Claude)`);
    ctx.logger.logResult('PASS', `${ticketKey} reviewed`);

    return {
      status: 'pass',
      message: `${ticketKey} — ${trimmedIssue.fields.summary} | Comments: ${commentCount} | Attachments: ${attachments.length} (${visualCount} visual)`,
      artifacts: [
        { name: '3_issue.json', path: issueFile, type: 'json', sizeBytes: issueSize },
        { name: '3_comments.json', path: commentsFile, type: 'json' },
        { name: '3_attachments.md', path: attachFile, type: 'md' },
      ],
      data: {
        summary: trimmedIssue.fields.summary,
        status: trimmedIssue.fields.status,
        assignee: trimmedIssue.fields.assignee,
        commentCount,
        attachmentCount: attachments.length,
        visualCount,
      },
    };
  }
}
