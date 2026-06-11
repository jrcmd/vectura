import cron from 'node-cron';
import { getExpiringDocuments, getExpiredDocuments } from './documentRules';
import { sendTemplateMail } from './mailService';
import { markSent } from './notificationService';

export function startDocumentExpirationCron() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const expiring = await getExpiringDocuments(30);
      for (const doc of expiring) {
        if (doc.user.role !== 'CHAUFFEUR') continue;
        await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
          firstName: doc.user.firstName ?? '',
          documentType: doc.type,
        });
        await markSent(doc.id, 'DOCUMENT_EXPIRY');
      }

      const expired = await getExpiredDocuments();
      for (const doc of expired) {
        if (doc.user.role !== 'CHAUFFEUR') continue;
        await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
          firstName: doc.user.firstName ?? '',
          documentType: doc.type,
        });
        await markSent(doc.id, 'DOCUMENT_EXPIRED');
      }
    } catch (err) {
      console.error('[CRON] document expiration failed', err);
    }
  });
}
