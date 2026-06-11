import { PrismaClient, DocType, DocStatus } from '@prisma/client';

const prisma = new PrismaClient();

export type DriverQualification = {
  hasPermisC: boolean;
  hasPermisCE: boolean;
  hasADR: boolean;
  hasFrigo: boolean;
  qualificationsValid: boolean;
  blockingDocuments: string[];
};

export async function evaluateDriverQualification(userId: string): Promise<DriverQualification> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      driverProfile: true,
      documents: true,
    },
  });

  if (!user || !user.driverProfile) {
    return {
      hasPermisC: false,
      hasPermisCE: false,
      hasADR: false,
      hasFrigo: false,
      qualificationsValid: false,
      blockingDocuments: [],
    };
  }

  const docsByType = new Map<string, (typeof user.documents)[number]>();
  for (const doc of user.documents) {
    docsByType.set(doc.type, doc);
  }

  const requiredDocs: { type: DocType; label: string }[] = [
    { type: DocType.PERMIS_C, label: 'Permis C' },
    { type: DocType.FIMO, label: 'FIMO' },
    { type: DocType.CARTE_CHRONO, label: 'Carte conducteur' },
    { type: DocType.URSSAF, label: 'Attestation URSSAF' },
    { type: DocType.RC_PRO, label: 'RC Pro' },
  ];

  const blockingDocuments: string[] = [];
  let qualificationsValid = true;

  for (const req of requiredDocs) {
    const doc = docsByType.get(req.type);
    if (!doc) {
      qualificationsValid = false;
      blockingDocuments.push(`Document manquant : ${req.label}`);
    } else if (doc.status === DocStatus.REJETE || doc.status === DocStatus.EXPIRE) {
      qualificationsValid = false;
      blockingDocuments.push(`Document invalide : ${req.label} (${doc.status})`);
    } else if (doc.status === DocStatus.EN_ATTENTE) {
      qualificationsValid = false;
      blockingDocuments.push(`Document en attente : ${req.label}`);
    }
  }

  const permisC = docsByType.get(DocType.PERMIS_C);
  const permisCE = docsByType.get(DocType.PERMIS_CE);

  await prisma.driverProfile.update({
    where: { userId },
    data: {
      hasPermisC: (permisC?.status === DocStatus.VALIDE),
      hasPermisCE: (permisCE?.status === DocStatus.VALIDE),
    },
  });

  return {
    hasPermisC: (permisC?.status === DocStatus.VALIDE),
    hasPermisCE: (permisCE?.status === DocStatus.VALIDE),
    hasADR: false,
    hasFrigo: false,
    qualificationsValid,
    blockingDocuments,
  };
}

