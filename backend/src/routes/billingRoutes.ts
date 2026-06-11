import type { Application, Request, Response } from 'express';
import { requireDriver } from './authRoutes';
import {
  buildInvoiceCsv,
  buildInvoiceExcel,
  getDriverInvoice,
  getInvoiceDownloadPath,
  invoiceItemsFromDb,
  listDriverInvoices,
} from '../services/invoiceService';

export function registerBillingRoutes(app: Application) {
  app.get('/api/billing/invoices', requireDriver, async (req: Request, res: Response) => {
    const driverId = (req as unknown as { driverId: string }).driverId;
    const invoices = await listDriverInvoices(driverId);
    return res.status(200).json({ ok: true, invoices });
  });

  app.get('/api/billing/invoices/:id/download', requireDriver, async (req: Request, res: Response) => {
    try {
      const driverId = (req as unknown as { driverId: string }).driverId;
      const { id } = req.params;
      const invoice = await getDriverInvoice(id, driverId);
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

  app.get('/api/billing/invoices/:id/csv', requireDriver, async (req: Request, res: Response) => {
    try {
      const driverId = (req as unknown as { driverId: string }).driverId;
      const { id } = req.params;
      const invoice = await getDriverInvoice(id, driverId);
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

  app.get('/api/billing/invoices/:id/excel', requireDriver, async (req: Request, res: Response) => {
    try {
      const driverId = (req as unknown as { driverId: string }).driverId;
      const { id } = req.params;
      const invoice = await getDriverInvoice(id, driverId);
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
