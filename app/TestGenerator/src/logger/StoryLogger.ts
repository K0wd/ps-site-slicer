import { writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Config } from '../config/Config.js';

export class StoryLogger {
  private logsDir: string;
  private currentLog: string | null = null;
  private currentTicketDir: string | null = null;

  constructor(private config: Config) {
    this.logsDir = config.logsDir;
    mkdirSync(this.logsDir, { recursive: true });
  }

  initTicket(ticketKey: string): string {
    this.currentTicketDir = resolve(this.logsDir, ticketKey);
    mkdirSync(this.currentTicketDir, { recursive: true });
    this.currentLog = resolve(this.currentTicketDir, 'story.md');

    if (!existsSync(this.currentLog)) {
      const now = new Date();
      const header = [
        `# Chomp Story — ${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString()}`,
        '',
        `> Automated QA journey for **[${ticketKey}](https://powerslicesoftware.atlassian.net/browse/${ticketKey})**`,
        '',
        '---',
        '',
      ].join('\n');
      writeFileSync(this.currentLog, header, 'utf-8');
    }

    return this.currentTicketDir;
  }

  get ticketDir(): string | null {
    return this.currentTicketDir;
  }

  logStep(stepNumber: number, stepName: string): void {
    if (!this.currentLog) return;
    const time = new Date().toLocaleTimeString();
    appendFileSync(this.currentLog, `\n## Step ${stepNumber} — ${stepName}\n**Time:** ${time}\n\n`, 'utf-8');
  }

  logInfo(message: string): void {
    if (!this.currentLog) return;
    appendFileSync(this.currentLog, `- ${message}\n`, 'utf-8');
  }

  logResult(status: string, message: string): void {
    if (!this.currentLog) return;
    appendFileSync(this.currentLog, `\n> **${status}** — ${message}\n\n`, 'utf-8');
  }

  logCode(label: string, content: string): void {
    if (!this.currentLog) return;
    appendFileSync(this.currentLog, `\n<details>\n<summary>${label}</summary>\n\n\`\`\`\n${content}\n\`\`\`\n\n</details>\n\n`, 'utf-8');
  }
}
