import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getDaysUntilExpiration,
  getCertificateStatus,
  getStatusColor,
} from '../../../../app/sm-certs/src/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats YYYY-MM-DD to US locale string', () => {
      expect(formatDate('2025-01-15')).toBe('Jan 15, 2025');
    });

    it('handles month boundaries', () => {
      expect(formatDate('2025-12-31')).toBe('Dec 31, 2025');
    });

    it('handles single-digit day', () => {
      expect(formatDate('2025-03-01')).toBe('Mar 1, 2025');
    });
  });

  describe('getDaysUntilExpiration', () => {
    it('returns positive days for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const dateStr = future.toISOString().split('T')[0];
      expect(getDaysUntilExpiration(dateStr)).toBe(30);
    });

    it('returns negative days for past date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const dateStr = past.toISOString().split('T')[0];
      expect(getDaysUntilExpiration(dateStr)).toBe(-10);
    });

    it('returns 0 for today', () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      expect(getDaysUntilExpiration(dateStr)).toBe(0);
    });
  });

  describe('getCertificateStatus', () => {
    it('returns expired for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getCertificateStatus(past.toISOString().split('T')[0])).toBe('expired');
    });

    it('returns expiring within 90 days', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 45);
      expect(getCertificateStatus(soon.toISOString().split('T')[0])).toBe('expiring');
    });

    it('returns valid beyond 90 days', () => {
      const far = new Date();
      far.setDate(far.getDate() + 180);
      expect(getCertificateStatus(far.toISOString().split('T')[0])).toBe('valid');
    });

    it('returns expiring at exactly 90 days', () => {
      const boundary = new Date();
      boundary.setDate(boundary.getDate() + 90);
      expect(getCertificateStatus(boundary.toISOString().split('T')[0])).toBe('expiring');
    });
  });

  describe('getStatusColor', () => {
    it('returns green classes for valid', () => {
      expect(getStatusColor('valid')).toBe('text-green-600 bg-green-100');
    });

    it('returns amber classes for expiring', () => {
      expect(getStatusColor('expiring')).toBe('text-amber-600 bg-amber-100');
    });

    it('returns red classes for expired', () => {
      expect(getStatusColor('expired')).toBe('text-red-600 bg-red-100');
    });

    it('returns gray classes for unknown status', () => {
      expect(getStatusColor('whatever')).toBe('text-gray-600 bg-gray-100');
    });
  });
});
