import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { requireCompany } from '../middleware/requireCompany';
import {
  buildInvoiceCsv,
  buildInvoiceExcel,
  generateInvoiceForCompanyWeek,
  getCompanyInvoice,
  getInvoiceDownloadPath,
  invoiceItemsFromDb,
  listCompanyInvoices,
} from '../services/invoiceService';

const weekStartSchema = z.object({ weekStart: z.string().datetime().optional() });

export function registerCompanyBillingRoutes(app: Application) {
  app.get('/api/companies/billing/invoices', requireCompany, async (req: Request, res: Response) => {
    try {
      const companyId = (req as unknown as { companyId: string }).companyId;
      const invoices = await listCompanyInvoices(companyId);
      return res.status(200).json({ ok: true, invoices });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/companies/billing/invoices/generate', requireCompany, async (req: Request, res: Response) => {
    try {
      const companyId = (req as unknown as { companyId: string }).companyId;
      const { weekStart } = weekStartSchema.parse(req.body ?? {});
      const invoice = await generateInvoiceForCompanyWeek(companyId, weekStart);

      return res.status(200).json({ ok: true, invoice });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/companies/billing/invoices/:id/download', requireCompany, async (req: Request, res: Response) => {
    try {
      const companyId = (req as unknown as { companyId: string }).companyId;
      const { id } = req.params;
      const invoice = await getCompanyInvoice(id, companyId);
      if (!invoice) {
        return res.status(404).json({ ok: false, message: 'Facture introuvable' });
      }

      const filePath = await getInvoiceDownloadPath(id);
      return res.download(filePath, `${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVOICE_FILE_MISSING') {
        return res.status(400).json({ ok: false, message: 'Fichier de facture absent' });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/companies/billing/invoices/:id/csv', requireCompany, async (req: Request, res: Response) => {
    try {
      const companyId = (req as unknown as { companyId: string }).companyId;
      const { id } = req.params;
      const invoice = await getCompanyInvoice(id, companyId);
      if (!invoice) {
        return res.status(404).json({ ok: false, message: 'Facture introuvable' });
      }

      const data = invoiceItemsFromDb(invoice);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.csv"`);
      return res.status(200).send(buildInvoiceCsv(data, data.items));
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/companies/billing/invoices/:id/excel', requireCompany, async (req: Request, res: Response) => {
    try {
      const companyId = (req as unknown as { companyId: string }).companyId;
      const { id } = req.params;
      const invoice = await getCompanyInvoice(id, companyId);
      if (!invoice) {
        return res.status(404).json({ ok: false, message: 'Facture introuvable' });
      }

      const data = invoiceItemsFromDb(invoice);
      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.xls"`);
      return res.status(200).send(buildInvoiceExcel(data, data.items));
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
