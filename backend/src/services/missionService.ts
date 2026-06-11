import { PrismaClient, MissionStatus } from '@prisma/client';
import { createBillingForMission } from './billingService';

const prisma = new PrismaClient();

export async function getMissionWithRelations(missionId: string) {
  return prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      creator: { select: { id: true, email: true, companyProfile: { select: { companyName: true } } } },
      driver: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
}

export async function assignDriverToMission(missionId: string, driverId: string) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('MISSION_NOT_FOUND');
  if (mission.status !== MissionStatus.OUVERTE) throw new Error('MISSION_NOT_AVAILABLE');
  if (mission.driverId) throw new Error('MISSION_ALREADY_ASSIGNED');

  const updated = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.POURVUE,
      driverId,
      assignedAt: new Date(),
    },
  });

  await prisma.missionStatusHistory.create({
    data: {
      missionId: updated.id,
      status: MissionStatus.POURVUE,
      changedBy: driverId,
      reason: 'ASSIGNED_BY_DRIVER',
    },
  });

  return updated;
}

export async function completeMission(missionId: string, driverId: string) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('MISSION_NOT_FOUND');
  if (mission.status !== MissionStatus.POURVUE) throw new Error('MISSION_NOT_IN_PROGRESS');

  const updated = await prisma.mission.update({
    where: { id: missionId },
    data: { status: MissionStatus.TERMINEE },
  });

  await prisma.missionStatusHistory.create({
    data: {
      missionId: updated.id,
      status: MissionStatus.TERMINEE,
      changedBy: driverId,
      reason: 'COMPLETED_BY_DRIVER',
    },
  });

  await createBillingForMission(missionId);

  return updated;
}

export async function cancelMissionByDriver(missionId: string, driverId: string) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('MISSION_NOT_FOUND');
  if (mission.status !== MissionStatus.POURVUE || mission.driverId !== driverId) {
    throw new Error('CANCEL_NOT_ALLOWED');
  }

  const updated = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.ANNULEE,
      driverId: null,
      assignedAt: null,
      acceptedAt: null,
    },
  });

  await prisma.missionStatusHistory.create({
    data: {
      missionId: updated.id,
      status: MissionStatus.ANNULEE,
      changedBy: driverId,
      reason: 'CANCELLED_BY_DRIVER',
    },
  });

  await createBillingForMission(missionId);

  return updated;
}

export async function cancelMissionByCompany(missionId: string, companyId: string) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('MISSION_NOT_FOUND');
  if (mission.status !== MissionStatus.OUVERTE && mission.status !== MissionStatus.POURVUE) {
    throw new Error('CANCEL_NOT_ALLOWED');
  }

  const updated = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.ANNULEE,
      driverId: null,
      assignedAt: null,
      acceptedAt: null,
    },
  });

  await prisma.missionStatusHistory.create({
    data: {
      missionId: updated.id,
      status: MissionStatus.ANNULEE,
      changedBy: companyId,
      reason: 'CANCELLED_BY_COMPANY',
    },
  });

  await createBillingForMission(missionId);

  return updated;
}
