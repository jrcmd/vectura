import dotenv from 'dotenv';
import { createServer } from './server';
import { startDocumentExpirationCron } from './services/documentExpirationCron';
import { startDocumentAlertScheduler } from './services/documentAlertScheduler';
import { startMissionReminderScheduler } from './services/missionReminderScheduler';

dotenv.config();

const app = createServer();
startDocumentExpirationCron();
startDocumentAlertScheduler();
startMissionReminderScheduler();

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
});

