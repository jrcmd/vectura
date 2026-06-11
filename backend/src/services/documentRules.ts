import { PrismaClient, DocStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function getExpiringDocuments(days = 30) {
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

export async function getExpiredDocuments() {
  const now = new Date();

  return prisma.document.findMany({
    where: {
      status: DocStatus.VALIDE,
      expiryDate: { lt: now },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
    },
  });
}
