import { Step, type StepContext, type StepOutput } from '../Step.js';

export class Step01VerifyAuth extends Step {
  readonly stepNumber = 1;
  readonly stepName = 'Verify Jira Auth';
  readonly requiresTicket = false;

  protected async execute(ctx: StepContext): Promise<StepOutput> {
    this.log('Checking Jira API access...');

    const result = await ctx.services.jira.testAuth();

    this.log(`Authenticated as ${result.displayName} (${result.email})`);

    return {
      status: 'pass',
      message: `Authenticated as ${result.displayName}`,
      artifacts: [],
    };
  }
}
