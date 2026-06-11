import cron from 'node-cron';
import { DocStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { sendTemplateMail } from './mailService';
import { recordCronRun } from './monitoringService';

async function getDocsExpiringIn(days = 30) {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.document.findMany({
    where: {
      status: DocStatus.VALIDE,
      expiryDate: { lte: threshold, gte: now },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
}

async function getExpiredDocuments() {
  const now = new Date();

  return prisma.document.findMany({
    where: {
      status: DocStatus.VALIDE,
      expiryDate: { lt: now },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
}

async function alreadyNotified(docId: string, type: string): Promise<boolean> {
  const exists = await prisma.notificationLog.findFirst({
    where: { type, recipientId: docId },
    select: { id: true },
  });
  return !!exists;
}

async function markNotified(docId: string, type: string, email: string) {
  await prisma.notificationLog.create({
    data: {
      type,
      recipientId: docId,
      email,
      subject: type,
      status: 'SENT',
    },
  });
}

export function startDocumentAlertScheduler() {
  // J-30, J-7 et J-1 à 08:00
  cron.schedule('0 8 * * *', async () => {
    const started = Date.now();
    try {
      const thresholds = [30, 7, 1];
      for (const days of thresholds) {
        const docs = await getDocsExpiringIn(days);
        const alertType = `DOC_EXPIRY_J${days === 0 ? '_DAY' : '_MINUS_' + days}`;
        for (const doc of docs) {
          if (!doc.user?.email) continue;
          if (await alreadyNotified(doc.id, alertType)) continue;

          await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
            firstName: doc.user.firstName ?? '',
            documentType: doc.type,
          });

          await markNotified(doc.id, alertType, doc.user.email);
        }
      }

      const expired = await getExpiredDocuments();
      for (const doc of expired) {
        if (!doc.user?.email) continue;
        if (await alreadyNotified(doc.id, 'DOC_EXPIRED')) continue;

        await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
          firstName: doc.user.firstName ?? '',
          documentType: doc.type,
        });

        await markNotified(doc.id, 'DOC_EXPIRED', doc.user.email);
      }
    } catch (err) {
      console.error('[CRON] document alert failed', err);
      await recordCronRun({ name: 'document_alert_scheduler', status: 'FAILED', durationMs: Date.now() - started, error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
    await recordCronRun({ name: 'document_alert_scheduler', status: 'SUCCESS', durationMs: Date.now() - started, error: null });
  });
}
