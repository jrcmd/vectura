import cron from 'node-cron';
import { UserStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { sendTemplateMail } from './mailService';
import { recordCronRun } from './monitoringService';

export function startLateCancellationScheduler() {
  cron.schedule('0 * * * *', async () => {
    const started = Date.now();
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentLateCancellations = await prisma.cancellation.findMany({
        where: {
          isLate: true,
          cancelledAt: { gte: oneHourAgo },
        },
        select: { id: true, driverId: true, missionId: true, reason: true, cancelledAt: true },
      });

      // Fetch driver + mission data separately (no direct relation in schema)
      const enriched = await Promise.all(
        recentLateCancellations.map(async (c) => {
          const driver = await prisma.user.findUnique({
            where: { id: c.driverId },
            select: { id: true, email: true, firstName: true, lastName: true, status: true },
          });
          return driver ? { ...c, driver } : null;
        }),
      );

      const sanctioned = enriched.filter((c): c is NonNullable<typeof c> =>
        c !== null && (c.driver.status === 'SUSPENDU' || c.driver.status === 'RADIE'),
      );

      for (const cancellation of sanctioned) {
        const driverUser = cancellation.driver;
        if (!driverUser.email) continue;

        const alreadyNotified = await prisma.notificationLog.findFirst({
          where: {
            type: 'LATE_CANCELLELATION_NOTIFIED',
            recipientId: cancellation.driverId,
          },
          select: { id: true },
        });

        if (alreadyNotified) continue;

        try {
          const sanctionLabel = driverUser.status === UserStatus.RADIE ? 'RADIATION' : 'SUSPENSION';
          await sendTemplateMail(driverUser.email, 'SANCTION_APPLIED', {
            firstName: driverUser.firstName ?? '',
            sanctionType: sanctionLabel,
            reason: 'Annulation tardive de mission',
          });

          await prisma.notificationLog.create({
            data: {
              type: 'LATE_CANCELLELATION_NOTIFIED',
              recipientId: cancellation.driverId,
              email: driverUser.email,
              subject: 'Sanction appliquée',
              status: 'sent',
            },
          });
        } catch (mailErr) {
          console.error(`[CRON] Late cancellation notif failed ${cancellation.id}`, mailErr);
        }
      }
    } catch (err) {
      console.error('[CRON] late cancellation check failed', err);
      await recordCronRun({ name: 'late_cancellation_scheduler', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'late_cancellation_scheduler', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });
}
