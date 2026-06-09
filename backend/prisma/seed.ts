import { PrismaClient, Role, UserStatus, DocStatus, DocType, TruckType, MissionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vectura.fr' },
    update: {},
    create: {
      email: 'admin@vectura.fr',
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.VALIDE,
      firstName: 'Admin',
      lastName: 'Vectura',
    },
  });

  // Company
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@vectura.fr' },
    update: {},
    create: {
      email: 'company@vectura.fr',
      password: passwordHash,
      role: Role.ENTREPRISE,
      status: UserStatus.VALIDE,
      firstName: 'Société',
      lastName: 'Démo',
      companyProfile: {
        create: {
          companyName: 'Vectura Démo',
          siret: '12345678901234',
          address: '1 Rue de Paris, 75001 Paris',
        },
      },
    },
    include: { companyProfile: true },
  });

  // Drivers
  const driverValidated = await prisma.user.upsert({
    where: { email: 'driver_valid@vectura.fr' },
    update: {},
    create: {
      email: 'driver_valid@vectura.fr',
      password: passwordHash,
      role: Role.CHAUFFEUR,
      status: UserStatus.VALIDE,
      firstName: 'Paul',
      lastName: 'Validé',
      phone: '0600000001',
      city: 'Paris',
      driverProfile: {
        create: {
          hasPermisC: true,
          hasPermisCE: false,
          hasADR: false,
          hasFrigo: false,
          lateCancellationCount: 0,
          qualificationsValid: true,
        },
      },
    },
  });

  const driverPending = await prisma.user.upsert({
    where: { email: 'driver_pending@vectura.fr' },
    update: {},
    create: {
      email: 'driver_pending@vectura.fr',
      password: passwordHash,
      role: Role.CHAUFFEUR,
      status: UserStatus.EN_ATTENTE,
      firstName: 'Camille',
      lastName: 'En attente',
      phone: '0600000002',
      city: 'Lyon',
      driverProfile: {
        create: {
          hasPermisC: false,
          hasPermisCE: false,
          hasADR: false,
          hasFrigo: false,
          lateCancellationCount: 0,
          qualificationsValid: false,
        },
      },
    },
  });

  // Documents for validated driver
  const docs = [
    {
      type: DocType.PERMIS_C,
      fileUrl: 'uploads/documents/seed/permis_c.pdf',
      status: DocStatus.VALIDE,
    },
    {
      type: DocType.FIMO,
      fileUrl: 'uploads/documents/seed/fimo.pdf',
      status: DocStatus.VALIDE,
    },
    {
      type: DocType.CARTE_CHRONO,
      fileUrl: 'uploads/documents/seed/carte_chrono.pdf',
      status: DocStatus.VALIDE,
    },
    {
      type: DocType.KBIS,
      fileUrl: 'uploads/documents/seed/kbis.pdf',
      status: DocStatus.VALIDE,
    },
    {
      type: DocType.URSSAF,
      fileUrl: 'uploads/documents/seed/urssaf.pdf',
      status: DocStatus.VALIDE,
    },
    {
      type: DocType.RC_PRO,
      fileUrl: 'uploads/documents/seed/rc_pro.pdf',
      status: DocStatus.VALIDE,
    },
  ];

  for (const d of docs) {
    await prisma.document.upsert({
      where: { id: `${driverValidated.id}-${d.type}` },
      update: {
        userId: driverValidated.id,
        type: d.type,
        fileUrl: d.fileUrl,
        status: d.status,
      },
      create: {
        id: `${driverValidated.id}-${d.type}`,
        userId: driverValidated.id,
        type: d.type,
        fileUrl: d.fileUrl,
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 200),
        status: d.status,
        uploadedAt: new Date(),
        validatedAt: new Date(),
        validatedBy: admin.id,
      },
    });
  }

  // Missions
  const openMission = await prisma.mission.upsert({
    where: { id: 'mission_open_seed' },
    update: {},
    create: {
      id: 'mission_open_seed',
      title: 'Mission ouverte PL',
      description: 'Transport PL - démo',
      location: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      missionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      startTime: '09:00',
      endTime: '12:00',
      truckType: TruckType.PL,
      hourlyRate: 25,
      status: MissionStatus.OUVERTE,
      creatorId: companyUser.id,
      favoritePriorityHours: 0,
      favoritePriorityStart: null,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission_assigned_seed' },
    update: {},
    create: {
      id: 'mission_assigned_seed',
      title: 'Mission pourvue démo',
      description: 'Transport PL - démo',
      location: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      missionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      startTime: '09:00',
      endTime: '12:00',
      truckType: TruckType.PL,
      hourlyRate: 25,
      status: MissionStatus.TERMINEE,
      creatorId: companyUser.id,
      driverId: driverValidated.id,
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      favoritePriorityHours: 0,
      favoritePriorityStart: null,
    },
  });

  // Update driver profile flags (optional consistency)
  await prisma.driverProfile.update({
    where: { userId: driverValidated.id },
    data: { qualificationsValid: true },
  });

  console.log({
    adminId: admin.id,
    companyId: companyUser.id,
    driverValidatedId: driverValidated.id,
    driverPendingId: driverPending.id,
    openMissionId: openMission.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

