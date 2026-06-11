import { PrismaClient, MissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PLATFORM_MARGIN_PERCENT = 15;

export function getPlatformMarginPercent(): number {
  const raw = process.env.PLATFORM_MARGIN_PERCENT;
  if (!raw) return DEFAULT_PLATFORM_MARGIN_PERCENT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : DEFAULT_PLATFORM_MARGIN_PERCENT;
}

function parseTimeToHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
}

export function calculateMissionAmount(hourlyRate: number, startTime: string, endTime?: string): number {
  const startHours = parseTimeToHours(startTime);
  if (!endTime) {
    return hourlyRate;
  }
  const endHours = parseTimeToHours(endTime);
  const duration = endHours - startHours;
  if (duration <= 0) return hourlyRate;
  const amount = hourlyRate * duration;
  return Math.round(amount * 100) / 100;
}

export function calculateMargin(amountBilled: number, percent: number): number {
  const margin = amountBilled * (percent / 100);
  return Math.round(margin * 100) / 100;
}

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
    return {
      amountBilled: 0,
      amountDriver: 0,
      margin: 0,
    };
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
    update: {
      amountBilled,
      amountDriver,
      margin,
    },
  });

  return { amountBilled, amountDriver, margin };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

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