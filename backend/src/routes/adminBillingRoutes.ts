import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { BillingStatus, Prisma } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';
import { getWeekStart } from '../services/invoiceService';



const periodSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

type AdminBillingRow = {
  id: string;
  invoiceNumber: string;
  companyName: string;
  weekStart: Date;
  weekEnd: Date;
  totalAmountBilled: number;
  totalAmountDriver: number;
  totalMargin: number;
  status: BillingStatus;
  generatedAt: Date | null;
  missionCount: number;
};

type AccountExportRow = {
  invoiceNumber: string;
  semaineDebut: string;
  semaineFin: string;
  entreprise: string;
  nbMissions: number;
  montantFactureHT: number;
  montantChauffeur: number;
  marge: number;
  statutFacture: string;
  dateGeneration: string;
};

function buildPeriodFilter(from?: string, to?: string): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {};
  if (from || to) {
    where.weekStart = {};
    if (from) (where.weekStart as { gte?: Date }).gte = getWeekStart(from);
  }
  if (to) {
    where.weekEnd = {};
    (where.weekEnd as { lte?: Date }).lte = getWeekStart(to);
  }
  return where;
}

export function registerAdminBillingRoutes(app: Application) {
  app.get('/api/admin/billing/invoices', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = periodSchema.parse(req.query);
      const where = buildPeriodFilter(query.from, query.to);

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { weekStart: 'desc' },
        include: {
          company: { select: { companyProfile: { select: { companyName: true } } } },
          billings: { select: { missionId: true } },
        },
      });

      const rows: AdminBillingRow[] = invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        companyName: inv.company.companyProfile?.companyName ?? '',
        weekStart: inv.weekStart,
        weekEnd: inv.weekEnd,
        totalAmountBilled: inv.totalAmountBilled,
        totalAmountDriver: inv.totalAmountDriver,
        totalMargin: inv.totalMargin,
        status: inv.status,
        generatedAt: inv.generatedAt,
        missionCount: inv.billings.length,
      }));

      return res.status(200).json({ ok: true, invoices: rows });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/admin/billing/export/csv', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = periodSchema.parse(req.query);
      const where = buildPeriodFilter(query.from, query.to);

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { weekStart: 'desc' },
        include: {
          company: { select: { companyProfile: { select: { companyName: true } } } },
          billings: { select: { missionId: true } },
        },
      });

      const rows: AccountExportRow[] = invoices.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        semaineDebut: inv.weekStart.toLocaleDateString('fr-FR'),
        semaineFin: inv.weekEnd.toLocaleDateString('fr-FR'),
        entreprise: inv.company.companyProfile?.companyName ?? '',
        nbMissions: inv.billings.length,
        montantFactureHT: inv.totalAmountBilled,
        montantChauffeur: inv.totalAmountDriver,
        marge: inv.totalMargin,
        statutFacture: inv.status,
        dateGeneration: inv.generatedAt ? inv.generatedAt.toLocaleString('fr-FR') : '',
      }));

      const headers = Object.keys(rows[0] ?? {});
      const csvRows = [
        headers.join(','),
        ...rows.map((row) =>
          headers.map((key) => csvEscape(String((row as Record<string, unknown>)[key] ?? ''))).join(','),
        ),
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="export_facturation.csv"');
      return res.status(200).send(csvRows.join('\n'));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/admin/billing/export/excel', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = periodSchema.parse(req.query);
      const where = buildPeriodFilter(query.from, query.to);

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { weekStart: 'desc' },
        include: {
          company: { select: { companyProfile: { select: { companyName: true } } } },
          billings: { select: { missionId: true } },
        },
      });

      const rows: AccountExportRow[] = invoices.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        semaineDebut: inv.weekStart.toLocaleDateString('fr-FR'),
        semaineFin: inv.weekEnd.toLocaleDateString('fr-FR'),
        entreprise: inv.company.companyProfile?.companyName ?? '',
        nbMissions: inv.billings.length,
        montantFactureHT: inv.totalAmountBilled,
        montantChauffeur: inv.totalAmountDriver,
        marge: inv.totalMargin,
        statutFacture: inv.status,
        dateGeneration: inv.generatedAt ? inv.generatedAt.toLocaleString('fr-FR') : '',
      }));

      const headers = Object.keys(rows[0] ?? {});
      const excel = buildExcel(rows, headers);

      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="export_facturation.xls"');
      return res.status(200).send(excel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/admin/billing/margins', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = periodSchema.parse(req.query);
      const where = buildPeriodFilter(query.from, query.to);

      const invoices = await prisma.invoice.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          weekStart: true,
          weekEnd: true,
          totalAmountBilled: true,
          totalAmountDriver: true,
          totalMargin: true,
          status: true,
          billings: {
            select: {
              missionId: true,
              amountBilled: true,
              amountDriver: true,
              margin: true,
              mission: {
                select: {
                  id: true,
                  title: true,
                  missionDate: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      const margins = invoices.map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        weekStart: inv.weekStart,
        weekEnd: inv.weekEnd,
        totalMargin: inv.totalMargin,
        totalRevenue: inv.totalAmountBilled,
        marginPercent: inv.totalAmountBilled > 0 ? Number((inv.totalMargin / inv.totalAmountBilled).toFixed(4)) : 0,
        missionMargins: inv.billings.map((b) => ({
          missionId: b.mission.id,
          missionTitle: b.mission.title,
          missionDate: b.mission.missionDate,
          missionStatus: b.mission.status,
          margin: b.margin,
          revenue: b.amountBilled,
          marginPercent: b.amountBilled > 0 ? Number((b.margin / b.amountBilled).toFixed(4)) : 0,
        })),
      }));

      return res.status(200).json({ ok: true, margins });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}

function csvEscape(value: string): string {
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function buildExcel(rows: Record<string, unknown>[], headers: string[]): string {
  const excelRows = rows
    .map((row, index) => {
      const tag = index === 0 ? 'th' : 'td';
      return `<tr>${headers.map((key) => `<${tag}>${htmlEscape(String((row as Record<string, string>)[key] ?? ''))}</${tag}>`).join('')}</tr>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>export_facturation</title></head><body><table border="1">${excelRows}</table></body></html>`;
}

function htmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
