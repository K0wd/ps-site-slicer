import { Step, type StepContext, type StepOutput } from '../../shared/pipeline/Step.js';

export class Step02FindTicket extends Step {
  readonly stepNumber = 2;
  readonly stepName = 'Find Ticket';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    const filter = ctx.ticketKey || 'all';
    this.log(`Searching for tickets (filter: ${filter})...`);

    let jql: string;
    let maxResults = 20;

    const ELIGIBLE_STATUSES = '"To Do", "In Progress", "Testing", "QA Verified", "Stage Prep", "On Stage", "Stage Verified", "Push to Live", "Merged", "Done"';

    if (ctx.ticketKey?.match(/^SM(-[A-Z]+)?-\d+$/i)) {
      jql = `project = SM AND key = ${ctx.ticketKey} AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, rank ASC`;
      maxResults = 1;
    } else if (filter === 'me') {
      jql = `project = SM AND assignee in ("kbandeleon@gmail.com", "Kim Bandeleon") AND status in (${ELIGIBLE_STATUSES}) AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY updated DESC`;
    } else {
      jql = `project = SM AND status in (${ELIGIBLE_STATUSES}) AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY updated DESC`;
    }

    const result = await ctx.services.jira.search(jql, 'summary,status,assignee,reporter,priority', maxResults);

    if (!result.issues || result.issues.length === 0) {
      return { status: 'warn', message: 'No eligible SM tickets found', artifacts: [] };
    }

    const tickets = result.issues.map((issue: any) => ({
      key: issue.key,
      summary: issue.fields?.summary || '',
      status: issue.fields?.status?.name || '',
      assignee: issue.fields?.assignee?.displayName || 'Unassigned',
      priority: issue.fields?.priority?.name || '',
    }));

    this.log(`Found ${tickets.length} ticket(s)`);
    for (const t of tickets) {
      this.log(`  ${t.key} | ${t.status} | ${t.assignee} | ${t.summary.substring(0, 60)}`);
      ctx.db.upsertTicketTracker(t.key, {
        jiraStatus: t.status,
        jiraSummary: t.summary,
      });
    }

    const selected = tickets[0];
    this.log(`Selected: ${selected.key}`);

    return {
      status: 'pass',
      message: `Found ${tickets.length} ticket(s), selected ${selected.key}`,
      artifacts: [],
      data: { tickets, selectedTicket: selected.key },
    };
  }
}
