import prisma from '../lib/prisma';
import { DocStatus, DocType, MissionStatus, Role, TruckType, UserStatus } from '@prisma/client';
import { hashPassword } from '../lib/password';

type SeedResult = {
  driverId: string;
  companyId: string;
  missionIds: string[];
  qaChecks: number;
};

const QA_PASSWORD = process.env.QA_SEED_PASSWORD ?? 'password123';

export async function seedQaData(adminId: string): Promise<SeedResult> {
  if (process.env.NODE_ENV === 'production' && process.env.QA_SEED_ALLOW !== 'true') {
    throw new Error('Seed QA disabled in production. Set QA_SEED_ALLOW=true explicitly.');
  }

  const passwordHash = hashPassword(QA_PASSWORD);
  const company = await prisma.user.upsert({
    where: { email: 'qa-company@vectura.fr' },
    update: {},
    create: {
      email: 'qa-company@vectura.fr',
      password: passwordHash,
      role: Role.ENTREPRISE,
      status: UserStatus.VALIDE,
      firstName: 'QA',
      lastName: 'Company',
      companyProfile: {
        create: {
          companyName: 'QA Transports',
          siret: '99999999999999',
          address: '10 Rue QA, 75011 Paris',
        },
      },
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'qa-driver@vectura.fr' },
    update: {},
    create: {
      email: 'qa-driver@vectura.fr',
      password: passwordHash,
      role: Role.CHAUFFEUR,
      status: UserStatus.VALIDE,
      firstName: 'QA',
      lastName: 'Driver',
      phone: '+33699999999',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      driverProfile: {
        create: {
          hasPermisC: true,
          hasPermisCE: true,
          hasADR: true,
          hasFrigo: true,
          lateCancellationCount: 0,
          qualificationsValid: true,
        },
      },
    },
  });

  const requiredDocs: DocType[] = [
    DocType.PERMIS_C,
    DocType.PERMIS_CE,
    DocType.FIMO,
    DocType.CARTE_CHRONO,
    DocType.URSSAF,
    DocType.RC_PRO,
  ];

  for (const type of requiredDocs) {
    await prisma.document.upsert({
      where: { userId_type: { userId: driver.id, type } },
      update: {
        fileUrl: `/uploads/qa/${type.toLowerCase()}.pdf`,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: DocStatus.VALIDE,
        validatedAt: new Date(),
        validatedBy: adminId,
      },
      create: {
        userId: driver.id,
        type,
        fileUrl: `/uploads/qa/${type.toLowerCase()}.pdf`,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: DocStatus.VALIDE,
        validatedAt: new Date(),
        validatedBy: adminId,
      },
    });
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const missionIds: string[] = [];

  for (const truckType of [TruckType.PL, TruckType.SPL, TruckType.ADR, TruckType.FRIGO]) {
    const mission = await prisma.mission.upsert({
      where: { id: `qa-mission-${truckType}` },
      update: {},
      create: {
        id: `qa-mission-${truckType}`,
        title: `Mission QA ${truckType}`,
        description: 'Jeu de données de recette pour le matching.',
        location: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        missionDate: truckType === TruckType.FRIGO ? nextWeek : tomorrow,
        startTime: '09:00',
        endTime: '17:00',
        truckType,
        hourlyRate: truckType === TruckType.PL ? 25 : 35,
        status: MissionStatus.OUVERTE,
        creatorId: company.id,
        favoritePriorityHours: 0,
        favoritePriorityStart: null,
      },
    });
    missionIds.push(mission.id);
  }

  const qaChecks = await seedQaChecks();

  return {
    driverId: driver.id,
    companyId: company.id,
    missionIds,
    qaChecks,
  };
}

async function seedQaChecks(): Promise<number> {
  const checks = [
    ['functional', 'Inscription chauffeur'],
    ['functional', 'Inscription entreprise'],
    ['functional', 'Login logout'],
    ['functional', 'Upload documents'],
    ['functional', 'Validation admin'],
    ['functional', 'Création mission'],
    ['functional', 'Matching'],
    ['security', 'Annulation tardive'],
    ['security', 'Facturation'],
    ['security', 'Exports'],
    ['security', 'Accès non autorisés'],
    ['security', 'Rôles et permissions'],
    ['security', 'Upload malveillant'],
    ['security', 'Erreurs API'],
    ['preproduction', 'Limites taille fichier'],
    ['preproduction', 'Journalisation incidents'],
    ['preproduction', 'Déploiement staging'],
    ['preproduction', 'Données de test'],
    ['preproduction', 'Mails automatiques'],
    ['preproduction', 'Cron jobs'],
    ['preproduction', 'Sauvegardes'],
    ['production', 'Performance minimale'],
    ['production', 'Déploiement production'],
    ['production', 'Domaine final'],
    ['production', 'SSL final'],
    ['production', 'Migrations production'],
    ['production', 'Monitoring'],
    ['production', 'Disponibilité publique'],
    ['stabilization', 'Bugs post lancement'],
    ['stabilization', 'Erreurs critiques'],
    ['stabilization', 'UX terrain'],
    ['stabilization', 'Règles métier'],
    ['stabilization', 'Roadmap V1'],
  ];

  let count = 0;
  for (const [suite, name] of checks) {
    await prisma.qaCheck.upsert({
      where: { suite_name: { suite, name } },
      update: {},
      create: {
        suite,
        name,
        status: 'TODO',
        owner: 'PO',
      },
    });
    count += 1;
  }
  return count;
}
