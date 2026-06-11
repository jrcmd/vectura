import { BillingStatus, MissionStatus } from '@prisma/client';
import {
  buildInvoiceCsv,
  buildInvoiceExcel,
  buildInvoicePdf,
  getWeekEnd,
  getWeekStart,
} from '../services/invoiceService';

const invoice = {
  id: 'invoice-id',
  invoiceNumber: 'FAC-20260608-ACME-0001',
  invoiceUrl: './uploads/invoices/FAC-20260608-ACME-0001.pdf',
  weekStart: new Date('2026-06-08T00:00:00.000Z'),
  weekEnd: new Date('2026-06-14T23:59:59.999Z'),
  totalAmountBilled: 2300,
  totalAmountDriver: 1955,
  totalMargin: 345,
  status: BillingStatus.INVOICED,
  generatedAt: new Date('2026-06-15T08:00:00.000Z'),
};

const items = [
  {
    missionId: 'mission-1',
    missionTitle: 'Livraison PL',
    missionDate: new Date('2026-06-08T00:00:00.000Z'),
    startTime: '08:00',
    endTime: '16:00',
    status: MissionStatus.TERMINEE,
    amountBilled: 2300,
    amountDriver: 1955,
    margin: 345,
  },
];

describe('invoiceService', () => {
  describe('getWeekStart', () => {
    it('returns Monday for mid-week date', () => {
      expect(getWeekStart(new Date(2026, 5, 10, 12))).toEqual(new Date(2026, 5, 8, 0, 0, 0, 0));
    });

    it('returns Monday for Sunday date', () => {
      expect(getWeekStart(new Date(2026, 5, 14, 12))).toEqual(new Date(2026, 5, 8, 0, 0, 0, 0));
    });
  });

  describe('getWeekEnd', () => {
    it('returns Sunday 23:59:59.999', () => {
      expect(getWeekEnd(new Date(2026, 5, 8, 0, 0, 0, 0))).toEqual(new Date(2026, 5, 14, 23, 59, 59, 999));
    });
  });

  describe('buildInvoiceCsv', () => {
    it('includes accounting columns and mission financial data', () => {
      const csv = buildInvoiceCsv(invoice, items);
      expect(csv).toContain('factureNumero,semaineDebut,semaineFin,missionId');
      expect(csv).toContain('FAC-20260608-ACME-0001');
      expect(csv).toContain('Livraison PL');
      expect(csv).toContain('2300,1955,345');
    });
  });

  describe('buildInvoiceExcel', () => {
    it('returns Excel-compatible HTML table', () => {
      const html = buildInvoiceExcel(invoice, items);
      expect(html).toContain('<table border="1">');
      expect(html).toContain('FAC-20260608-ACME-0001');
      expect(html).toContain('Livraison PL');
    });
  });

  describe('buildInvoicePdf', () => {
    it('returns a PDF document containing invoice totals', () => {
      const pdf = buildInvoicePdf(invoice, items);
      expect(pdf).toContain('%PDF-1.4');
      expect(pdf).toContain('FAC-20260608-ACME-0001');
      expect(pdf).toContain('2300.00');
      expect(pdf).toContain('Livraison PL');
    });
  });
});
