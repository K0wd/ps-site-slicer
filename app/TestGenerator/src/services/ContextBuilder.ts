import { readFileSync, readdirSync, existsSync, mkdtempSync, writeFileSync } from 'fs';
import { resolve, join, basename } from 'path';
import { tmpdir } from 'os';
import type { Config } from '../config/Config.js';

export class ContextBuilder {
  private tempDir: string | null = null;

  constructor(private config: Config) {}

  private appendFile(src: string, out: string[]): void {
    if (existsSync(src)) {
      out.push(`\n---\n## ${basename(src)}\n`);
      out.push(readFileSync(src, 'utf-8'));
    }
  }

  private appendDir(dir: string, ext: string, out: string[]): void {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).sort()) {
      if (name.endsWith(ext)) {
        this.appendFile(join(dir, name), out);
      }
    }
  }

  buildBaseContext(): string {
    const out: string[] = ['# Project Context — SiteManager\n'];
    const p = this.config.projectDir;
    this.appendFile(resolve(p, '.claude/wiki.md'), out);
    this.appendFile(resolve(p, '.claude/client-powerslice/wiki.md'), out);
    this.appendFile(resolve(p, '.claude/client-powerslice/brain.md'), out);
    this.appendFile(resolve(p, 'rules/brain.md'), out);
    return out.join('\n');
  }

  buildStep6Context(): string {
    const out: string[] = [this.buildBaseContext()];
    const p = this.config.projectDir;
    out.push('\n\n# QA Expert Knowledge\n');
    this.appendDir(resolve(p, '.claude/qa-expert'), '.md', out);
    this.appendDir(resolve(p, '.claude/qa-expert/rules'), '.mdc', out);
    return out.join('\n');
  }

  buildStep7Context(): string {
    const out: string[] = [this.buildBaseContext()];
    const p = this.config.projectDir;
    out.push('\n\n# ISTQB Test Automation References\n');
    this.appendFile(resolve(p, '.claude/qa-expert/rules/istqb-ct-tas-test-automation-strategy-aide-context.mdc'), out);
    this.appendFile(resolve(p, '.claude/qa-expert/rules/istqb-ctal-tae-test-automation-engineering-aide-context.mdc'), out);
    out.push('\n\n# Test Automation Expert Knowledge\n');
    this.appendDir(resolve(p, '.claude/test-automation-expert'), '.md', out);
    this.appendDir(resolve(p, '.claude/test-automation-expert/rules'), '.mdc', out);
    return out.join('\n');
  }

  writeToTempFile(content: string, name: string): string {
    if (!this.tempDir) {
      this.tempDir = mkdtempSync(join(tmpdir(), 'testgen-ctx-'));
    }
    const filePath = join(this.tempDir, name);
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  cleanup(): void {
    if (this.tempDir) {
      const { rmSync } = require('fs');
      rmSync(this.tempDir, { recursive: true, force: true });
      this.tempDir = null;
    }
  }
}
