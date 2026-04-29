import { describe, it, expect } from 'vitest';
import { STEP_DEFINITIONS } from './models.js';

describe('STEP_DEFINITIONS', () => {
  it('declares 16 steps', () => {
    expect(STEP_DEFINITIONS).toHaveLength(16);
  });

  it('covers QA pipeline (1-11) and engineering loop (101-105)', () => {
    const numbers = STEP_DEFINITIONS.map((s) => s.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 101, 102, 103, 104, 105]);
  });

  it('every step has a non-empty name', () => {
    for (const s of STEP_DEFINITIONS) {
      expect(s.name).toBeTypeOf('string');
      expect(s.name.length).toBeGreaterThan(0);
    }
  });

  it('every step has a boolean requiresTicket flag', () => {
    for (const s of STEP_DEFINITIONS) {
      expect(typeof s.requiresTicket).toBe('boolean');
    }
  });

  it('steps 1-2 do not require a ticket; 3-11 do', () => {
    const lookup = new Map(STEP_DEFINITIONS.map((s) => [s.number, s.requiresTicket]));
    expect(lookup.get(1)).toBe(false);
    expect(lookup.get(2)).toBe(false);
    for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      expect(lookup.get(n)).toBe(true);
    }
  });

  it('engineering steps (101-105) do not require a ticket', () => {
    const lookup = new Map(STEP_DEFINITIONS.map((s) => [s.number, s.requiresTicket]));
    for (const n of [101, 102, 103, 104, 105]) {
      expect(lookup.get(n)).toBe(false);
    }
  });

  it('step numbers are unique', () => {
    const numbers = STEP_DEFINITIONS.map((s) => s.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
