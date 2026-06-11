import cron from 'node-cron';
import { PrismaClient, MissionStatus } from '@prisma/client';
import { sendMail } from './mailService';
import { markSent } from './notificationService';

const prisma = new PrismaClient();

type ScheduledKey = { missionId: string; days: number };

const scheduled = new Map<string, ScheduledKey>();

function alreadyScheduled(missionId: string, days: number) {
  const key = `${missionId}:${days}`;
  if (scheduled.has(key)) return true;
  scheduled.set(key, { missionId, days });
  return false;
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
    try {
      const missions = await getMissionsStartingIn(1);
      for (const mission of missions) {
        if (alreadyScheduled(mission.id, 1)) continue;

        if (mission.driver?.email) {
          await sendMail({
            to: mission.driver.email,
            subject: 'Rappel : mission demain',
            text: `Bonjour ${mission.driver.firstName ?? ''},\n\nRappel : vous avez la mission "${mission.title}" demain à ${mission.startTime}.`,
          });
        }

        if (mission.creator?.email) {
          await sendMail({
            to: mission.creator.email,
            subject: 'Rappel : mission demain',
            text: `Bonjour,\n\nRappel : la mission "${mission.title}" aura lieu demain.`,
          });
        }

        markSent(mission.id, 'MISSION_REMINDER_J_MINUS_1');
      }
    } catch (err) {
      console.error('[CRON] mission reminder J-1 failed', err);
    }
  });

  // J0 à 06:00
  cron.schedule('0 6 * * *', async () => {
    try {
      const missions = await getMissionsStartingIn(0);
      for (const mission of missions) {
        if (alreadyScheduled(mission.id, 0)) continue;

        if (mission.driver?.email) {
          await sendMail({
            to: mission.driver.email,
            subject: 'Rappel : mission aujourd’hui',
            text: `Bonjour ${mission.driver.firstName ?? ''},\n\nRappel : votre mission "${mission.title}" commence aujourd'hui à ${mission.startTime}.`,
          });
        }

        markSent(mission.id, 'MISSION_REMINDER_J_DAY');
      }
    } catch (err) {
      console.error('[CRON] mission reminder J0 failed', err);
    }
  });
}
