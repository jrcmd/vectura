import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma';
import { BillingStatus, MissionStatus } from '@prisma/client';



const INVOICE_DIR = path.resolve(process.env.INVOICE_DIR ?? './uploads/invoices');

type InvoiceItem = {
  missionId: string;
  missionTitle: string;
  missionDate: Date;
  startTime: string;
  endTime: string | null;
  status: MissionStatus;
  amountBilled: number;
  amountDriver: number;
  margin: number;
};

type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  invoiceUrl: string | null;
  weekStart: Date;
  weekEnd: Date;
  totalAmountBilled: number;
  totalAmountDriver: number;
  totalMargin: number;
  status: BillingStatus;
  generatedAt: Date | null;
};

type GenerateInvoiceResult = InvoiceSummary & {
  items: InvoiceItem[];
};

export function getWeekStart(input: Date | string = new Date()): Date {
  const date = input instanceof Date ? input : new Date(input);
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Arrondit un nombre au centime le plus proche (2 décimales) */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number): string {
  return `${roundMoney(value).toFixed(2)} €`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR');
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function toAscii(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatInvoiceNumber(weekStart: Date, suffix: string): string {
  const yyyy = weekStart.getFullYear();
  const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
  const dd = String(weekStart.getDate()).padStart(2, '0');
  return `FAC-${yyyy}${mm}${dd}-${suffix}`;
}

function safeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function buildInvoiceCsv(invoice: InvoiceSummary, items: InvoiceItem[]): string {
  const rows = [
    [
      'factureNumero',
      'semaineDebut',
      'semaineFin',
      'missionId',
      'missionTitre',
      'dateMission',
      'heureDebut',
      'heureFin',
      'montantFacture',
      'montantChauffeur',
      'marge',
      'statutFacture',
      'statutMission',
    ],
    ...items.map((item) => [
      invoice.invoiceNumber,
      formatDate(invoice.weekStart),
      formatDate(invoice.weekEnd),
      item.missionId,
      item.missionTitle,
      formatDate(item.missionDate),
      item.startTime,
      item.endTime ?? '',
      String(item.amountBilled),
      String(item.amountDriver),
      String(item.margin),
      invoice.status,
      item.status,
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function buildInvoiceExcel(invoice: InvoiceSummary, items: InvoiceItem[]): string {
  const headers = [
    'factureNumero',
    'semaineDebut',
    'semaineFin',
    'missionId',
    'missionTitre',
    'dateMission',
    'heureDebut',
    'heureFin',
    'montantFacture',
    'montantChauffeur',
    'marge',
    'statutFacture',
    'statutMission',
  ];

  const rows = [
    headers,
    ...items.map((item) => [
      invoice.invoiceNumber,
      formatDate(invoice.weekStart),
      formatDate(invoice.weekEnd),
      item.missionId,
      item.missionTitle,
      formatDate(item.missionDate),
      item.startTime,
      item.endTime ?? '',
      item.amountBilled.toFixed(2),
      item.amountDriver.toFixed(2),
      item.margin.toFixed(2),
      invoice.status,
      item.status,
    ]),
  ];

  const htmlRows = rows
    .map((row, index) => {
      const tag = index === 0 ? 'th' : 'td';
      return `<tr>${row.map((cell) => `<${tag}>${htmlEscape(String(cell))}</${tag}>`).join('')}</tr>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${htmlEscape(invoice.invoiceNumber)}</title></head><body><table border="1">${htmlRows}</table></body></html>`;
}

function csvEscape(value: string): string {
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function htmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildInvoicePdf(invoice: InvoiceSummary, items: InvoiceItem[]): string {
  const lines: string[] = [];
  const push = (text: string, size: number, x: number, y: number) => {
    lines.push(`/F1 ${size} Tf ${x} ${y} Td (${escapePdfText(toAscii(text))}) Tj`);
  };

  push('Vectura - Facture hebdomadaire', 18, 50, 790);
  push(`Numero: ${invoice.invoiceNumber}`, 11, 50, 760);
  push(`Semaine: ${formatDate(invoice.weekStart)} au ${formatDate(invoice.weekEnd)}`, 11, 50, 740);
  push(`Statut: ${invoice.status}`, 11, 50, 720);
  push(`Total facture: ${formatMoney(invoice.totalAmountBilled)}`, 12, 50, 690);
  push(`Total chauffeur: ${formatMoney(invoice.totalAmountDriver)}`, 11, 50, 670);
  push(`Marge: ${formatMoney(invoice.totalMargin)}`, 11, 50, 650);

  let y = 610;
  push('Missions', 13, 50, y);
  y -= 20;
  for (const item of items) {
    if (y < 120) break;
    push(`${formatDate(item.missionDate)} - ${item.startTime}-${item.endTime ?? 'N/A'} - ${item.missionTitle}`, 9, 50, y);
    y -= 14;
    push(`Montant facture: ${formatMoney(item.amountBilled)} | Chauffeur: ${formatMoney(item.amountDriver)} | Marge: ${formatMoney(item.margin)}`, 9, 50, y);
    y -= 18;
  }

  if (items.length === 0) {
    push('Aucune mission facturable pour cette semaine.', 11, 50, y);
  }

  const stream = `BT\n${lines.join('\n')}\nET`;
  const header = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    'endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >>`,
    'stream',
    stream,
    'endstream',
    'endobj',
  ];

  const body = header.join('\n');
  const xrefStart = Buffer.byteLength(body);
  return `${body}\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000264 00000 n \n0000000346 00000 n \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n${xrefStart}\n%%EOF\n`;
}

async function generateInvoiceNumber(companyId: string, weekStart: Date): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = `${companyId.slice(0, 4).toUpperCase()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const candidate = formatInvoiceNumber(weekStart, suffix);
    const exists = await prisma.invoice.findUnique({ where: { invoiceNumber: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  const suffix = `${companyId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  return formatInvoiceNumber(weekStart, suffix);
}

async function getInvoiceItems(companyId: string, weekStart: Date, weekEnd: Date): Promise<InvoiceItem[]> {
  const billings = await prisma.billing.findMany({
    where: {
      mission: { creatorId: companyId },
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
    },
    include: {
      mission: {
        select: {
          id: true,
          title: true,
          missionDate: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      },
    },
    orderBy: { 'mission': { missionDate: 'asc' } },
  });

  return billings.map((billing) => ({
    missionId: billing.mission.id,
    missionTitle: billing.mission.title,
    missionDate: billing.mission.missionDate,
    startTime: billing.mission.startTime,
    endTime: billing.mission.endTime,
    status: billing.mission.status,
    amountBilled: billing.amountBilled,
    amountDriver: billing.amountDriver,
    margin: billing.margin,
  }));
}

async function ensureInvoiceDirectory(): Promise<void> {
  await mkdir(INVOICE_DIR, { recursive: true });
}

async function storeInvoicePdf(invoiceNumber: string, weekStart: Date, pdf: string): Promise<string> {
  await ensureInvoiceDirectory();
  const filename = `${safeFilename(invoiceNumber)}_${safeFilename(formatDate(weekStart).replace(/\//g, '-'))}.pdf`;
  const filePath = path.join(INVOICE_DIR, filename);
  await writeFile(filePath, pdf, 'utf8');
  return filePath;
}

export async function generateInvoiceForCompanyWeek(companyId: string, weekStartInput?: Date | string): Promise<GenerateInvoiceResult> {
  const weekStart = weekStartInput ? getWeekStart(weekStartInput) : getWeekStart(new Date());
  const weekEnd = getWeekEnd(weekStart);
  const items = await getInvoiceItems(companyId, weekStart, weekEnd);

  if (items.length === 0) {
    throw new Error('Aucune mission facturable pour cette semaine.');
  }
  const existingInvoice = await prisma.invoice.findUnique({
    where: { companyId_weekStart: { companyId, weekStart } },
    select: { invoiceNumber: true },
  });
  const invoiceNumber = existingInvoice?.invoiceNumber ?? await generateInvoiceNumber(companyId, weekStart);

  const totalAmountBilled = roundMoney(items.reduce((sum, item) => sum + item.amountBilled, 0));
  const totalAmountDriver = roundMoney(items.reduce((sum, item) => sum + item.amountDriver, 0));
  const totalMargin = roundMoney(items.reduce((sum, item) => sum + item.margin, 0));
  const pdf = buildInvoicePdf(
    {
      id: '',
      invoiceNumber,
      invoiceUrl: null,
      weekStart,
      weekEnd,
      totalAmountBilled,
      totalAmountDriver,
      totalMargin,
      status: BillingStatus.INVOICED,
      generatedAt: new Date(),
    },
    items,
  );
  const invoiceUrl = await storeInvoicePdf(invoiceNumber, weekStart, pdf);

  const invoice = await prisma.invoice.upsert({
    where: { companyId_weekStart: { companyId, weekStart } },
    create: {
      companyId,
      invoiceNumber,
      invoiceUrl,
      weekStart,
      weekEnd,
      totalAmountBilled,
      totalAmountDriver,
      totalMargin,
      status: BillingStatus.INVOICED,
      generatedAt: new Date(),
    },
    update: {
      invoiceNumber,
      invoiceUrl,
      totalAmountBilled,
      totalAmountDriver,
      totalMargin,
      status: BillingStatus.INVOICED,
      generatedAt: new Date(),
    },
  });

  await prisma.billing.updateMany({
    where: {
      mission: { creatorId: companyId },
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
    },
    data: { invoiceId: invoice.id },
  });

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceUrl: invoice.invoiceUrl,
    weekStart: invoice.weekStart,
    weekEnd: invoice.weekEnd,
    totalAmountBilled: invoice.totalAmountBilled,
    totalAmountDriver: invoice.totalAmountDriver,
    totalMargin: invoice.totalMargin,
    status: invoice.status,
    generatedAt: invoice.generatedAt,
    items,
  };
}

export async function listCompanyInvoices(companyId: string): Promise<InvoiceSummary[]> {
  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { weekStart: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceUrl: true,
      weekStart: true,
      weekEnd: true,
      totalAmountBilled: true,
      totalAmountDriver: true,
      totalMargin: true,
      status: true,
      generatedAt: true,
    },
  });

  return invoices;
}

export async function listDriverInvoices(driverId: string): Promise<InvoiceSummary[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      billings: {
        some: {
          mission: { driverId },
        },
      },
    },
    orderBy: { weekStart: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceUrl: true,
      weekStart: true,
      weekEnd: true,
      totalAmountBilled: true,
      totalAmountDriver: true,
      totalMargin: true,
      status: true,
      generatedAt: true,
    },
  });

  return invoices;
}

export async function getCompanyInvoice(invoiceId: string, companyId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, companyId },
    include: { billings: { include: { mission: { select: { id: true, title: true, missionDate: true, startTime: true, endTime: true, status: true } } } } },
  });
}

export async function getDriverInvoice(invoiceId: string, driverId: string) {
  return prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      billings: { some: { mission: { driverId } } },
    },
    include: { billings: { include: { mission: { select: { id: true, title: true, missionDate: true, startTime: true, endTime: true, status: true } } } } },
  });
}

export async function getInvoiceDownloadPath(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { invoiceUrl: true, invoiceNumber: true } });
  if (!invoice?.invoiceUrl) throw new Error('INVOICE_FILE_MISSING');
  return invoice.invoiceUrl;
}

export function invoiceItemsFromDb(invoice: {
  invoiceNumber: string;
  invoiceUrl: string | null;
  weekStart: Date;
  weekEnd: Date;
  totalAmountBilled: number;
  totalAmountDriver: number;
  totalMargin: number;
  status: BillingStatus;
  generatedAt: Date | null;
  billings: Array<{
    amountBilled: number;
    amountDriver: number;
    margin: number;
    mission: {
      id: string;
      title: string;
      missionDate: Date;
      startTime: string;
      endTime: string | null;
      status: MissionStatus;
    };
  }>;
}): GenerateInvoiceResult {
  return {
    id: '',
    invoiceNumber: invoice.invoiceNumber,
    invoiceUrl: invoice.invoiceUrl,
    weekStart: invoice.weekStart,
    weekEnd: invoice.weekEnd,
    totalAmountBilled: invoice.totalAmountBilled,
    totalAmountDriver: invoice.totalAmountDriver,
    totalMargin: invoice.totalMargin,
    status: invoice.status,
    generatedAt: invoice.generatedAt,
    items: invoice.billings.map((billing) => ({
      missionId: billing.mission.id,
      missionTitle: billing.mission.title,
      missionDate: billing.mission.missionDate,
      startTime: billing.mission.startTime,
      endTime: billing.mission.endTime,
      status: billing.mission.status,
      amountBilled: billing.amountBilled,
      amountDriver: billing.amountDriver,
      margin: billing.margin,
    })),
  };
}
