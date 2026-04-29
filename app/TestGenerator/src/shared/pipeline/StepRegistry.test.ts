import { describe, it, expect } from 'vitest';
import { createStep, getStepNumbers } from './StepRegistry.js';
import { Step } from './Step.js';

describe('StepRegistry', () => {
  describe('getStepNumbers', () => {
    it('returns 16 step numbers', () => {
      expect(getStepNumbers()).toHaveLength(16);
    });

    it('returns generator + automator + engineering ranges', () => {
      const nums = getStepNumbers();
      expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 101, 102, 103, 104, 105]);
    });

    it('returns numbers in ascending order', () => {
      const nums = getStepNumbers();
      const sorted = [...nums].sort((a, b) => a - b);
      expect(nums).toEqual(sorted);
    });
  });

  describe('createStep', () => {
    it.each(getStepNumbers())('returns a Step subclass for step %i', (num) => {
      const step = createStep(num);
      expect(step).toBeInstanceOf(Step);
      expect(step.stepNumber).toBe(num);
      expect(typeof step.stepName).toBe('string');
      expect(step.stepName.length).toBeGreaterThan(0);
    });

    it('throws on unknown step number', () => {
      expect(() => createStep(999)).toThrow(/Unknown step number: 999/);
    });

    it('throws on negative step number', () => {
      expect(() => createStep(-1)).toThrow(/Unknown step number: -1/);
    });

    it('throws on zero step number', () => {
      expect(() => createStep(0)).toThrow(/Unknown step number: 0/);
    });

    it('returns a fresh instance each call', () => {
      const a = createStep(1);
      const b = createStep(1);
      expect(a).not.toBe(b);
    });
  });
});
