import cron from 'node-cron';
import { UserStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { sendTemplateMail } from './mailService';
import { recordCronRun } from './monitoringService';

export function startSanctionExpiryScheduler() {
  // Vérification toutes les heures
  cron.schedule('0 * * * *', async () => {
    const started = Date.now();
    try {
      const now = new Date();

      // Réactiver les suspensions dont la date de fin est dépassée
      const expiredSuspensions = await prisma.sanction.findMany({
        where: {
          type: 'SUSPENSION',
          endDate: { lte: now },
          driver: { status: UserStatus.SUSPENDU },
        },
        include: {
          driver: {
            select: { id: true, email: true, firstName: true, status: true },
          },
        },
      });

      for (const sanction of expiredSuspensions) {
        await prisma.user.update({
          where: { id: sanction.driverId },
          data: { status: UserStatus.VALIDE },
        });

        await prisma.sanction.update({
          where: { id: sanction.id },
          data: { endDate: now },
        });

        if (sanction.driver.email) {
          try {
            await sendTemplateMail(sanction.driver.email, 'SANCTION_APPLIED', {
              firstName: sanction.driver.firstName ?? '',
              sanctionType: 'SUSPENSION_LEVEE',
              reason: 'Votre suspension a été levée.',
            });
          } catch (mailErr) {
            console.error(`[CRON] Sanction expiry notif failed ${sanction.id}`, mailErr);
          }
        }
      }
    } catch (err) {
      console.error('[CRON] sanction expiry check failed', err);
      await recordCronRun({ name: 'sanction_expiry_scheduler', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'sanction_expiry_scheduler', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });
}
