import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export type CronRunInput = {
  name: string;
  status: string;
  durationMs?: number | null;
  error?: string | null;
  nextRunAt?: Date | null;
};

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true, latencyMs: Date.now() - started };
}

export function getRuntimeStatus() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    domain: process.env.DOMAIN ?? null,
    sslMode: process.env.SSL_MODE ?? 'external',
    apiBaseUrl: process.env.API_BASE_URL ?? null,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? null,
    backupEnabled: process.env.BACKUP_ENABLED !== 'false',
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.FROM_EMAIL),
  };
}

export async function upsertCronJob(name: string, nextRunAt?: Date | null) {
  return prisma.cronJob.upsert({
    where: { name },
    create: { name, enabled: true, nextRunAt },
    update: { enabled: true, nextRunAt },
  });
}

export async function recordCronRun(input: CronRunInput) {
  return prisma.cronJob.upsert({
    where: { name: input.name },
    create: {
      name: input.name,
      enabled: true,
      lastRunAt: new Date(),
      lastStatus: input.status,
      lastDurationMs: input.durationMs ?? null,
      lastError: input.error,
      nextRunAt: input.nextRunAt,
    },
    update: {
      lastRunAt: new Date(),
      lastStatus: input.status,
      lastDurationMs: input.durationMs ?? null,
      lastError: input.error,
      nextRunAt: input.nextRunAt,
    },
  });
}

export async function listCronJobs() {
  return prisma.cronJob.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getMonitoringSnapshot() {
  const started = Date.now();
  const db = await pingDatabase().catch((error: Error) => ({ ok: false, latencyMs: Date.now() - started, error: error.message }));
  const cronJobs = await listCronJobs();
  const runtime = getRuntimeStatus();

  return {
    ok: db.ok === true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: db,
    cronJobs,
    runtime,
  };
}

export function getMailHealth() {
  return {
    ok: Boolean(process.env.SMTP_HOST && process.env.FROM_EMAIL),
    smtpHost: process.env.SMTP_HOST ? 'configured' : 'missing',
    fromEmail: process.env.FROM_EMAIL ?? 'missing',
  };
}

export async function getBackupSummary() {
  return prisma.backupRun.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function updateCronJobEnabled(name: string, enabled: boolean) {
  return prisma.cronJob.update({
    where: { name },
    data: { enabled },
  });
}

export async function listCronJobsFiltered(input: { enabled?: boolean } = {}) {
  const where: Prisma.CronJobWhereInput = {};
  if (input.enabled !== undefined) where.enabled = input.enabled;
  return prisma.cronJob.findMany({ where, orderBy: { name: 'asc' } });
}
