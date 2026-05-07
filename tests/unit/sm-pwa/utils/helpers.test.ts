import { describe, it, expect, vi } from 'vitest';
import {
  notEmpty,
  getTimeFromHours,
  displayHours,
  debounce,
} from '../../../../app/sm-pwa/src/utils/helpers';

describe('helpers', () => {
  describe('notEmpty', () => {
    it('returns false for null', () => {
      expect(notEmpty(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(notEmpty(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(notEmpty('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      expect(notEmpty('   ')).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(notEmpty([])).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(notEmpty({})).toBe(false);
    });

    it('returns true for non-empty string', () => {
      expect(notEmpty('hello')).toBe(true);
    });

    it('returns true for non-empty array', () => {
      expect(notEmpty([1])).toBe(true);
    });

    it('returns true for non-empty object', () => {
      expect(notEmpty({ key: 'value' })).toBe(true);
    });

    it('returns true for number 0', () => {
      expect(notEmpty(0)).toBe(true);
    });

    it('returns true for boolean false', () => {
      expect(notEmpty(false)).toBe(true);
    });
  });

  describe('getTimeFromHours', () => {
    it('converts whole hours', () => {
      expect(getTimeFromHours(8)).toBe('8:00');
    });

    it('converts fractional hours', () => {
      expect(getTimeFromHours(1.5)).toBe('1:30');
    });

    it('converts quarter hours', () => {
      expect(getTimeFromHours(2.25)).toBe('2:15');
    });

    it('returns 0:00 for zero', () => {
      expect(getTimeFromHours(0)).toBe('0:00');
    });

    it('returns 0:00 for NaN', () => {
      expect(getTimeFromHours(NaN)).toBe('0:00');
    });
  });

  describe('displayHours', () => {
    it('converts decimal to HH:MM', () => {
      expect(displayHours(8.5)).toBe('8:30');
    });

    it('handles string input', () => {
      expect(displayHours('2.25')).toBe('2:15');
    });

    it('handles zero', () => {
      expect(displayHours(0)).toBe('0:00');
    });

    it('handles non-numeric string as 0', () => {
      expect(displayHours('abc')).toBe('0:00');
    });
  });

  describe('debounce', () => {
    it('delays execution', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
      vi.useRealTimers();
    });

    it('resets timer on subsequent calls', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
      vi.useRealTimers();
    });
  });
});
