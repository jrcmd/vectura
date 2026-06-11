import { PrismaClient, DocStatus } from '@prisma/client';
import { sendTemplateMail } from './mailService';

const prisma = new PrismaClient();

export async function getExpiringSoonDocuments(days = 7) {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.document.findMany({
    where: {
      status: DocStatus.VALIDE,
      expiryDate: { lte: threshold, gte: now },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
    },
  });
}

export async function notifyDocumentExpiration(doc: {
  id: string;
  type: string;
  expiryDate: Date;
  user: { email: string; firstName: string | null; lastName: string | null; role: string };
}) {
  if (doc.user.role !== 'CHAUFFEUR') return;

  const firstName = doc.user.firstName ?? '';

  await sendTemplateMail(doc.user.email, 'DOCUMENT_EXPIRY', {
    firstName,
    documentType: doc.type,
  });
}
