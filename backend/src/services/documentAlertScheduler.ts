import cron from 'node-cron';
import { PrismaClient, DocStatus } from '@prisma/client';
import { sendTemplateMail } from './mailService';

const prisma = new PrismaClient();

type ExpirationAlert = {
  docId: string;
  daysBefore: number;
  sentAt: Date;
};

const sentAlerts: ExpirationAlert[] = [];

function alreadySent(docId: string, daysBefore: number, withinHours = 23) {
  return sentAlerts.some(
    (a) =>
      a.docId === docId &&
      a.daysBefore === daysBefore &&
      Date.now() - a.sentAt.getTime() < withinHours * 60 * 60 * 1000,
  );
}

function markSent(docId: string, daysBefore: number) {
  sentAlerts.push({ docId, daysBefore, sentAt: new Date() });
}

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

export function startDocumentAlertScheduler() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const thresholds = [30, 7, 1];
      for (const days of thresholds) {
        const docs = await getDocsExpiringIn(days);
        for (const doc of docs) {
          if (!doc.user?.email) continue;
          if (alreadySent(doc.id, days)) continue;

          await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
            firstName: doc.user.firstName ?? '',
            documentType: doc.type,
          });

          markSent(doc.id, days);
        }
      }

      const expired = await getExpiredDocuments();
      for (const doc of expired) {
        if (!doc.user?.email) continue;
        if (alreadySent(doc.id, 0)) continue;

        await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRED', {
          firstName: doc.user.firstName ?? '',
          documentType: doc.type,
        });

        markSent(doc.id, 0);
      }
    } catch (err) {
      console.error('[CRON] document alert failed', err);
    }
  });
}
