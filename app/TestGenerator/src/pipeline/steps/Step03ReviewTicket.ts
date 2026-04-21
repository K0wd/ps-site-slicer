import { writeFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Step03ReviewTicket extends Step {
  readonly stepNumber = 3;
  readonly stepName = 'Review Ticket';
  readonly requiresTicket = true;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const ticketKey = ctx.ticketKey!;
    const ticketDir = ctx.logger.initTicket(ticketKey);

    ctx.logger.logStep(3, 'Review Ticket');
    ctx.logger.logInfo(`Ticket: **${ticketKey}**`);

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

    const issueFile = resolve(ticketDir, '3_issue.json');
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

    const commentsFile = resolve(ticketDir, '3_comments.json');
    writeFileSync(commentsFile, JSON.stringify(trimmedComments, null, 2), 'utf-8');
    const commentCount = trimmedComments.length;

    this.log(`Comments: ${commentCount}`);
    ctx.logger.logInfo(`Comments: **${commentCount}**`);

    // --- Attachments ---
    this.log('Fetching attachments...');
    const attachments = await ctx.services.jira.getAttachments(ticketKey);
    const attachmentLines = attachments.length === 0
      ? `No attachments on ${ticketKey}`
      : attachments.map((a: any) => `  - ${a.filename} (${a.size || 0} bytes) URL: ${a.content}`).join('\n');

    const attachFile = resolve(ticketDir, '3_attachments.md');
    writeFileSync(attachFile, attachmentLines, 'utf-8');

    this.log(`Attachments: ${attachments.length}`);
    ctx.logger.logInfo(`Attachments: **${attachments.length}**`);
    ctx.logger.logResult('PASS', `${ticketKey} reviewed`);

    return {
      status: 'pass',
      message: `${ticketKey} — ${trimmedIssue.fields.summary} | Comments: ${commentCount} | Attachments: ${attachments.length}`,
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
      },
    };
  }
}
