import { sendMail } from './mailService';
import { getDueReminders, markSent, NotificationJob, NOTIFICATION_TYPES } from './notificationService';

export async function processDueReminders(now = new Date()) {
  const due = getDueReminders(now);
  const results: Array<{ ok: boolean; error?: string }> = [];

  for (const job of due) {
    try {
      if (job.type === NOTIFICATION_TYPES.MISSION_REMINDER_J_MINUS_1 || job.type === NOTIFICATION_TYPES.MISSION_REMINDER_J_DAY) {
        const missionJob = job as Extract<NotificationJob, { missionId: string; driverId: string }>;
        await sendMail({
          to: `driver-${missionJob.driverId}@example.com`,
          subject: 'Rappel de mission',
          text: `Rappel mission ${missionJob.missionId}`,
        });
        markSent(missionJob.missionId, job.type);
      }
      results.push({ ok: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`[NOTIFICATION] failed job=${job.type} error=${errorMessage}`);
      results.push({ ok: false, error: errorMessage });
    }
  }

  return results;
}
