import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClaudeService, DEFAULT_SCRIPT_MODEL } from './ClaudeService.js';

// extractResult and resolveModel are private — cast to any to exercise them directly.
// This is intentional: these helpers are pure transformations of CLI output / option
// resolution. Testing through the public spawn path would require mocking child_process,
// which adds noise without exercising the actual logic that broke on SM-1118.
function svc(): any {
  return new ClaudeService({ projectDir: '/tmp', logsDir: '/tmp' } as any);
}

describe('ClaudeService.extractResult', () => {
  describe('single-object output', () => {
    it('extracts result + token usage from a well-formed result object', () => {
      const stdout = JSON.stringify({
        type: 'result',
        result: 'hello world',
        usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 7 },
      });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('hello world');
      expect(out.tokenUsage).toBe(22);
      expect(out.raw).toBeTypeOf('object');
    });

    it('throws on is_error=true with the error detail surfaced', () => {
      const stdout = JSON.stringify({ is_error: true, result: 'rate limited' });
      expect(() => svc().extractResult(stdout, '', 0)).toThrow(/is_error.*rate limited/);
    });

    it('throws on missing/empty result with stderr surfaced', () => {
      const stdout = JSON.stringify({ type: 'result', result: '' });
      expect(() => svc().extractResult(stdout, 'context too large', 0)).toThrow(/empty result/);
    });

    it('throws on missing result string entirely', () => {
      const stdout = JSON.stringify({ type: 'result' });
      expect(() => svc().extractResult(stdout, '', 0)).toThrow(/empty result/);
    });
  });

  describe('array-of-events output (the SM-1118 regression case)', () => {
    it('finds the result event at the end of an event array', () => {
      const stdout = JSON.stringify([
        { type: 'system', subtype: 'init', tools: [] },
        { type: 'assistant', message: { content: [{ type: 'text', text: 'partial' }] } },
        {
          type: 'result',
          subtype: 'success',
          is_error: false,
          result: 'final answer',
          usage: { input_tokens: 100, output_tokens: 20 },
        },
      ]);
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('final answer');
      expect(out.tokenUsage).toBe(120);
    });

    it('finds the LAST result event when multiple are present', () => {
      const stdout = JSON.stringify([
        { type: 'result', subtype: 'success', result: 'first' },
        { type: 'result', subtype: 'success', result: 'second', usage: { input_tokens: 1, output_tokens: 1 } },
      ]);
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('second');
    });

    it('aggregates assistant message text when no result event is present', () => {
      const stdout = JSON.stringify([
        { type: 'system', subtype: 'init' },
        { type: 'assistant', message: { content: [{ type: 'text', text: 'first ' }, { type: 'text', text: 'second' }] } },
        { type: 'assistant', message: { content: 'plain string' } },
      ]);
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('first secondplain string');
      expect(out.tokenUsage).toBe(0);
    });

    it('throws on is_error=true result event in array', () => {
      const stdout = JSON.stringify([
        { type: 'system', subtype: 'init' },
        { type: 'result', subtype: 'error_during_execution', is_error: true, result: 'context too large' },
      ]);
      expect(() => svc().extractResult(stdout, '', 0)).toThrow(/is_error.*context too large/);
    });

    it('throws when the array contains only init/system events (the literal SM-1118 case)', () => {
      const stdout = JSON.stringify([
        { type: 'system', subtype: 'init', cwd: '/x', session_id: 'abc', tools: ['Read'] },
      ]);
      expect(() => svc().extractResult(stdout, '', 0)).toThrow(/no usable result/);
    });

    it('throws when assistant content is non-text only and no result event', () => {
      const stdout = JSON.stringify([
        { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read' }] } },
      ]);
      expect(() => svc().extractResult(stdout, '', 0)).toThrow(/no usable result/);
    });
  });

  describe('NDJSON output (line-delimited events)', () => {
    it('parses NDJSON without an outer array wrapper', () => {
      const stdout =
        JSON.stringify({ type: 'system', subtype: 'init' }) + '\n' +
        JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'mid' }] } }) + '\n' +
        JSON.stringify({ type: 'result', is_error: false, result: 'ndjson works', usage: { input_tokens: 5, output_tokens: 3 } });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('ndjson works');
      expect(out.tokenUsage).toBe(8);
    });

    it('skips unparseable lines but still extracts from the valid ones', () => {
      const stdout =
        '{"type":"system","subtype":"init"}\n' +
        'not-json-garbage\n' +
        JSON.stringify({ type: 'result', is_error: false, result: 'still works', usage: { input_tokens: 1, output_tokens: 1 } });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.result).toBe('still works');
    });
  });

  describe('error paths', () => {
    it('throws on empty stdout with stderr in the message', () => {
      expect(() => svc().extractResult('   ', 'oops something broke', 1)).toThrow(/empty stdout.*oops something broke/);
    });

    it('throws with first 400 chars when stdout is unparseable garbage', () => {
      const garbage = 'this is not JSON or NDJSON ' + 'x'.repeat(500);
      expect(() => svc().extractResult(garbage, '', 0)).toThrow(/unparseable output/);
    });

    it('reports exit code in error messages', () => {
      expect(() => svc().extractResult('', 'died', 137)).toThrow(/exit 137/);
    });
  });

  describe('token usage edge cases', () => {
    it('returns 0 tokens when usage is missing', () => {
      const stdout = JSON.stringify({ type: 'result', result: 'no usage' });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.tokenUsage).toBe(0);
    });

    it('returns 0 tokens when usage is null', () => {
      const stdout = JSON.stringify({ type: 'result', result: 'null usage', usage: null });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.tokenUsage).toBe(0);
    });

    it('sums input + output + cache_read', () => {
      const stdout = JSON.stringify({
        type: 'result',
        result: 'sum',
        usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 25 },
      });
      const out = svc().extractResult(stdout, '', 0);
      expect(out.tokenUsage).toBe(175);
    });
  });
});

describe('ClaudeService.resolveModel', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.TESTGEN_CLAUDE_MODEL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to DEFAULT_SCRIPT_MODEL (Sonnet) when nothing is set', () => {
    expect(svc().resolveModel({})).toBe(DEFAULT_SCRIPT_MODEL);
    expect(DEFAULT_SCRIPT_MODEL).toBe('claude-sonnet-4-6');
  });

  it('honors TESTGEN_CLAUDE_MODEL env override', () => {
    process.env.TESTGEN_CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
    expect(svc().resolveModel({})).toBe('claude-haiku-4-5-20251001');
  });

  it('per-call options.model wins over env', () => {
    process.env.TESTGEN_CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
    expect(svc().resolveModel({ model: 'claude-opus-4-7' })).toBe('claude-opus-4-7');
  });

  it('per-call options.model wins over default', () => {
    expect(svc().resolveModel({ model: 'claude-opus-4-7' })).toBe('claude-opus-4-7');
  });

  it('trims whitespace from env value', () => {
    process.env.TESTGEN_CLAUDE_MODEL = '  claude-opus-4-7  ';
    expect(svc().resolveModel({})).toBe('claude-opus-4-7');
  });

  it('falls back to default when env is whitespace-only', () => {
    process.env.TESTGEN_CLAUDE_MODEL = '   ';
    expect(svc().resolveModel({})).toBe(DEFAULT_SCRIPT_MODEL);
  });
});
