import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export function findLatestTestRunDir(ticketDir: string): string | null {
  const testRunsDir = resolve(ticketDir, 'test-runs');
  if (!existsSync(testRunsDir)) return null;
  const dirs = readdirSync(testRunsDir).sort().reverse();
  return dirs.length > 0 ? resolve(testRunsDir, dirs[0]) : null;
}
