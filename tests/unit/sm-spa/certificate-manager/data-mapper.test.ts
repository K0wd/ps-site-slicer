import { describe, it, expect } from 'vitest';
import {
  mapBackendCertificate,
  mapToCertificateBackend,
  mapBackendCertificateType,
  mapBackendIssuingAuthority,
  mapBackendCertificates,
} from '../../../../app/sm-spa/src/app/certificate-manager/utils/data-mapper.util';

describe('data-mapper.util', () => {
  describe('mapBackendCertificate', () => {
    it('maps snake_case backend fields to camelCase', () => {
      const backend = {
        id: '1',
        employee_id: '42',
        employee_name: 'Jane Doe',
        certificate_type: 'OSHA-10',
        issue_date: '2025-01-01',
        expiration_date: '2026-01-01',
        issuing_authority: 'OSHA',
        certificate_number: 'CERT-001',
        status: 'active',
        review_status: 'approved',
      };

      const result = mapBackendCertificate(backend);
      expect(result.employeeId).toBe('42');
      expect(result.employeeName).toBe('Jane Doe');
      expect(result.certificateType).toBe('OSHA-10');
      expect(result.expirationDate).toBe('2026-01-01');
      expect(result.certificateNumber).toBe('CERT-001');
    });

    it('unwraps nested Certificate key', () => {
      const backend = {
        Certificate: { id: '5', employee_name: 'Nested' },
        User: { name: 'Admin' },
      };

      const result = mapBackendCertificate(backend);
      expect(result.id).toBe('5');
      expect(result.employeeName).toBe('Nested');
      expect(result.user).toEqual({ name: 'Admin' });
    });

    it('returns null for falsy input', () => {
      expect(mapBackendCertificate(null)).toBeNull();
      expect(mapBackendCertificate(undefined)).toBeNull();
    });

    it('falls back to file_path when image_url is missing', () => {
      const backend = { file_path: '/uploads/cert.jpg' };
      expect(mapBackendCertificate(backend).imageUrl).toBe('/uploads/cert.jpg');
    });
  });

  describe('mapToCertificateBackend', () => {
    it('maps camelCase frontend fields to snake_case', () => {
      const frontend = {
        id: '1',
        employeeId: '42',
        employeeName: 'Jane Doe',
        certificateType: 'OSHA-10',
        issueDate: '2025-01-01',
        expirationDate: '2026-01-01',
      };

      const result = mapToCertificateBackend(frontend);
      expect(result.employee_id).toBe('42');
      expect(result.employee_name).toBe('Jane Doe');
      expect(result.certificate_type).toBe('OSHA-10');
      expect(result.expiration_date).toBe('2026-01-01');
    });

    it('round-trips with mapBackendCertificate', () => {
      const original = {
        id: '7',
        employee_id: '10',
        employee_name: 'Round Trip',
        certificate_type: 'CPR',
        issue_date: '2025-06-01',
        expiration_date: '2027-06-01',
        issuing_authority: 'Red Cross',
        certificate_number: 'RC-999',
        status: 'active',
        review_status: 'pending',
      };

      const frontend = mapBackendCertificate(original);
      const backAgain = mapToCertificateBackend(frontend);
      expect(backAgain.employee_id).toBe(original.employee_id);
      expect(backAgain.certificate_type).toBe(original.certificate_type);
    });
  });

  describe('mapBackendCertificateType', () => {
    it('maps type fields to camelCase', () => {
      const backend = {
        id: '3',
        name: 'OSHA-30',
        validity_period_days: 365,
        is_active: true,
      };

      const result = mapBackendCertificateType(backend);
      expect(result.validityPeriodDays).toBe(365);
      expect(result.isActive).toBe(true);
    });

    it('unwraps nested CertificateType key', () => {
      const result = mapBackendCertificateType({
        CertificateType: { id: '9', name: 'Wrapped' },
      });
      expect(result.name).toBe('Wrapped');
    });

    it('returns null for falsy input', () => {
      expect(mapBackendCertificateType(null)).toBeNull();
    });
  });

  describe('mapBackendIssuingAuthority', () => {
    it('maps authority fields', () => {
      const result = mapBackendIssuingAuthority({
        id: '1',
        name: 'OSHA',
        website: 'https://osha.gov',
        contact_email: 'info@osha.gov',
      });
      expect(result.contactEmail).toBe('info@osha.gov');
      expect(result.website).toBe('https://osha.gov');
    });

    it('returns null for falsy input', () => {
      expect(mapBackendIssuingAuthority(null)).toBeNull();
    });
  });

  describe('mapBackendCertificates', () => {
    it('maps an array of certificates', () => {
      const result = mapBackendCertificates([
        { id: '1', employee_name: 'A' },
        { id: '2', employee_name: 'B' },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].employeeName).toBe('A');
    });

    it('returns empty array for non-array input', () => {
      expect(mapBackendCertificates(null as any)).toEqual([]);
      expect(mapBackendCertificates('bad' as any)).toEqual([]);
    });
  });
});
