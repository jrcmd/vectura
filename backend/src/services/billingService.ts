import { MissionStatus } from '@prisma/client';
import cron from 'node-cron';
import prisma from '../lib/prisma';
import { generateInvoiceForCompanyWeek } from '../services/invoiceService';
import { recordCronRun } from './monitoringService';

/** Marge par défaut de la plateforme en pourcentage (15%) */
const DEFAULT_PLATFORM_MARGIN_PERCENT = 15;

/** Retourne la marge configurée ou la valeur par défaut (15%) */
export function getPlatformMarginPercent(): number {
  const raw = process.env.PLATFORM_MARGIN_PERCENT;
  if (!raw) return DEFAULT_PLATFORM_MARGIN_PERCENT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : DEFAULT_PLATFORM_MARGIN_PERCENT;
}

/** Convertit un horaire "HH:MM" en nombre d'heures décimal */
function parseTimeToHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
}

/** Calcule le montant d'une mission selon le tarif horaire et la durée */
export function calculateMissionAmount(hourlyRate: number, startTime: string, endTime?: string): number {
  const startHours = parseTimeToHours(startTime);
  if (!endTime) return hourlyRate;
  const endHours = parseTimeToHours(endTime);
  const duration = endHours - startHours;
  if (duration <= 0) return hourlyRate;
  const amount = hourlyRate * duration;
  return Math.round(amount * 100) / 100;
}

/** Calcule la marge (commission) sur le montant facturé */
export function calculateMargin(amountBilled: number, percent: number): number {
  const margin = amountBilled * (percent / 100);
  return Math.round(margin * 100) / 100;
}

/** Calcule le montant reversé au chauffeur après déduction de la marge */
export function calculateDriverAmount(amountBilled: number, margin: number): number {
  const driverAmount = amountBilled - margin;
  return Math.round(driverAmount * 100) / 100;
}

export async function createBillingForMission(missionId: string): Promise<{
  amountBilled: number;
  amountDriver: number;
  margin: number;
} | null> {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { driver: true },
  });

  if (!mission) return null;

  if (mission.status === MissionStatus.ANNULEE) {
    return { amountBilled: 0, amountDriver: 0, margin: 0 };
  }

  const amountBilled = calculateMissionAmount(mission.hourlyRate, mission.startTime, mission.endTime ?? undefined);
  const margin = calculateMargin(amountBilled, getPlatformMarginPercent());
  const amountDriver = calculateDriverAmount(amountBilled, margin);

  await prisma.billing.upsert({
    where: { missionId },
    create: {
      missionId,
      amountBilled,
      amountDriver,
      margin,
      weekStart: getWeekStart(mission.missionDate),
      weekEnd: getWeekEnd(mission.missionDate),
    },
    update: { amountBilled, amountDriver, margin },
  });

  return { amountBilled, amountDriver, margin };
}

/** Retourne le lundi de la semaine calendaire (début de semaine) */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Retourne le dimanche de la semaine calendaire (fin de semaine) */
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const sunday = new Date(start);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export async function getWeeklyBillingSummary(companyId: string, weekStart: Date, weekEnd: Date) {
  const billings = await prisma.billing.findMany({
    where: {
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
      mission: { creatorId: companyId },
    },
    include: {
      mission: {
        select: {
          id: true,
          title: true,
          missionDate: true,
        },
      },
    },
  });

  return billings.map((b) => ({
    missionId: b.missionId,
    missionTitle: b.mission.title,
    missionDate: b.mission.missionDate,
    amountBilled: b.amountBilled,
    amountDriver: b.amountDriver,
    margin: b.margin,
    weekStart: b.weekStart,
    weekEnd: b.weekEnd,
  }));
}

export function startWeeklyBillingCron() {
  // Every Monday at 00:05 — generates invoices for all companies with billed missions
  cron.schedule('5 0 * * 1', async () => {
    const started = Date.now();
    try {
      const weekStart = getWeekStart(new Date());
      const weekEnd = getWeekEnd(weekStart);

      const billings = await prisma.billing.findMany({
        where: { weekStart: { gte: weekStart }, weekEnd: { lte: weekEnd } },
        select: { missionId: true },
      });

      const missions = await prisma.mission.findMany({
        where: { id: { in: billings.map((b) => b.missionId) } },
        select: { id: true, creatorId: true },
      });

      const companyIds = Array.from(new Set(missions.map((m) => m.creatorId).filter((id): id is string => !!id)));

      for (const companyId of companyIds) {
        try {
          await generateInvoiceForCompanyWeek(companyId, weekStart);
        } catch (err) {
          console.error(`[CRON] weekly billing failed for company ${companyId}`, err);
        }
      }
    } catch (err) {
      console.error('[CRON] weekly billing cron failed', err);
      await recordCronRun({ name: 'weekly_billing_cron', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'weekly_billing_cron', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });
}
