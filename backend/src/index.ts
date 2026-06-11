import dotenv from 'dotenv';
import { createServer } from './server';
import { startDocumentExpirationCron } from './services/documentExpirationCron';
import { startDocumentAlertScheduler } from './services/documentAlertScheduler';
import { startMissionReminderScheduler } from './services/missionReminderScheduler';
import { startLateCancellationScheduler } from './services/lateCancellationScheduler';
import { startSanctionExpiryScheduler } from './services/sanctionScheduler';
import { startWeeklyBillingCron } from './services/billingService';
import { upsertCronJob } from './services/monitoringService';

dotenv.config();

const app = createServer();
startDocumentExpirationCron();
startDocumentAlertScheduler();
startMissionReminderScheduler();
startLateCancellationScheduler();
startSanctionExpiryScheduler();
startWeeklyBillingCron();

void upsertCronJob('document_expiration_cron');
void upsertCronJob('document_alert_scheduler');
void upsertCronJob('mission_reminder_scheduler');
void upsertCronJob('late_cancellation_scheduler');
void upsertCronJob('sanction_expiry_scheduler');
void upsertCronJob('weekly_billing_cron');

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
});

