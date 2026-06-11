import cron from 'node-cron';
import { MissionStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { sendMail } from './mailService';
import { recordCronRun } from './monitoringService';

async function alreadyScheduled(missionId: string, days: number): Promise<boolean> {
  const key = `MISSION_REMINDER_J${days === 0 ? '_DAY' : '_MINUS_' + days}_${missionId}`;
  const existing = await prisma.notificationLog.findFirst({
    where: { type: key },
    select: { id: true },
  });
  return !!existing;
}

async function markScheduled(missionId: string, days: number): Promise<void> {
  const key = `MISSION_REMINDER_J${days === 0 ? '_DAY' : '_MINUS_' + days}_${missionId}`;
  await prisma.notificationLog.create({
    data: {
      type: key,
      recipientId: missionId,
      email: '',
      subject: '',
      status: 'SENT',
    },
  });
}

async function getMissionsStartingIn(days = 1) {
  const now = new Date();
  const from = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  return prisma.mission.findMany({
    where: {
      status: MissionStatus.POURVUE,
      missionDate: { gte: from, lt: to },
    },
    select: {
      id: true,
      title: true,
      missionDate: true,
      startTime: true,
      driverId: true,
      creatorId: true,
      driver: { select: { email: true, firstName: true, lastName: true } },
      creator: { select: { email: true, companyProfile: { select: { companyName: true } } } },
    },
  });
}

export function startMissionReminderScheduler() {
  // J-1 à 08:00
  cron.schedule('0 8 * * *', async () => {
    const started = Date.now();
    try {
      const missions = await getMissionsStartingIn(1);
      for (const mission of missions) {
        if (await alreadyScheduled(mission.id, 1)) continue;

        let driverOk = false;
        let companyOk = false;
        if (mission.driver?.email) {
          try {
            await sendMail({
              to: mission.driver.email,
              subject: 'Rappel : mission demain',
              text: `Bonjour ${mission.driver.firstName ?? ''},\n\nRappel : vous avez la mission "${mission.title}" demain à ${mission.startTime}.`,
            });
            driverOk = true;
          } catch (err) {
            console.error(`[CRON] J-1 driver mail failed ${mission.id}`, err);
          }
        }
        if (mission.creator?.email) {
          try {
            await sendMail({
              to: mission.creator.email,
              subject: 'Rappel : mission demain',
              text: `Bonjour,\n\nRappel : la mission "${mission.title}" aura lieu demain.`,
            });
            companyOk = true;
          } catch (err) {
            console.error(`[CRON] J-1 company mail failed ${mission.id}`, err);
          }
        }

        if (driverOk || companyOk) {
          await markScheduled(mission.id, 1);
        }
      }
    } catch (err) {
      console.error('[CRON] mission reminder J-1 failed', err);
      await recordCronRun({ name: 'mission_reminder_scheduler_j_minus_1', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'mission_reminder_scheduler_j_minus_1', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });

  // J0 à 06:00
  cron.schedule('0 6 * * *', async () => {
    const started = Date.now();
    try {
      const missions = await getMissionsStartingIn(0);
      for (const mission of missions) {
        if (await alreadyScheduled(mission.id, 0)) continue;

        let driverOk = false;
        if (mission.driver?.email) {
          try {
            await sendMail({
              to: mission.driver.email,
               subject: "Rappel : mission aujourd'hui",
              text: `Bonjour ${mission.driver.firstName ?? ''},\n\nRappel : votre mission "${mission.title}" commence aujourd'hui à ${mission.startTime}.`,
            });
            driverOk = true;
          } catch (err) {
            console.error(`[CRON] J0 driver mail failed ${mission.id}`, err);
          }
        }

        // Also notify company on J0
        if (mission.creator?.email) {
          try {
            await sendMail({
              to: mission.creator.email,
              subject: 'Rappel : mission aujourd\'hui',
              text: `Bonjour,\n\nRappel : la mission "${mission.title}" a lieu aujourd'hui.`,
            });
          } catch (err) {
            console.error(`[CRON] J0 company mail failed ${mission.id}`, err);
          }
        }

        if (driverOk) {
          await markScheduled(mission.id, 0);
        }
      }
    } catch (err) {
      console.error('[CRON] mission reminder J0 failed', err);
      await recordCronRun({ name: 'mission_reminder_scheduler_j0', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'mission_reminder_scheduler_j0', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });
}
