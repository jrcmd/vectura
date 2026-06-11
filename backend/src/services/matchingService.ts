import { MissionStatus, TruckType, UserStatus } from '@prisma/client';
import { evaluateDriverQualification } from './qualificationService';
import prisma from '../lib/prisma';
import { getMaxRadiusKm, haversineDistanceKm } from './distanceService';



export type MissionMatch = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  missionDate: Date;
  startTime: string;
  endTime: string | null;
  truckType: TruckType;
  hourlyRate: number;
  status: MissionStatus;
  favoritePriorityHours: number;
  favoritePriorityStart: Date | null;
};

function hasRequiredLicense(driverProfile: { hasPermisC: boolean; hasPermisCE: boolean; hasADR: boolean; hasFrigo: boolean }, truckType: TruckType): boolean {
  switch (truckType) {
    case TruckType.PL:
      return driverProfile.hasPermisC;
    case TruckType.SPL:
      return driverProfile.hasPermisCE;
    case TruckType.ADR:
      return driverProfile.hasADR;
    case TruckType.FRIGO:
      return driverProfile.hasFrigo;
    default:
      return false;
  }
}

export async function findCompatibleMissions(driverId: string): Promise<MissionMatch[]> {
  const driver = await prisma.user.findUnique({
    where: { id: driverId },
    select: {
      status: true,
      latitude: true,
      longitude: true,
      driverProfile: { select: { hasPermisC: true, hasPermisCE: true, hasADR: true, hasFrigo: true } },
    },
  });

  if (!driver || !driver.driverProfile) {
    return [];
  }

  if (driver.status === UserStatus.EN_ATTENTE || driver.status === UserStatus.SUSPENDU || driver.status === UserStatus.RADIE) {
    return [];
  }

  const qualification = await evaluateDriverQualification(driverId);
  if (!qualification.qualificationsValid) {
    return [];
  }

  const now = new Date();
  const openMissions = await prisma.mission.findMany({
    where: {
      status: MissionStatus.OUVERTE,
      missionDate: { gte: now },
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      missionDate: true,
      startTime: true,
      endTime: true,
      truckType: true,
      hourlyRate: true,
      status: true,
      favoritePriorityHours: true,
      favoritePriorityStart: true,
      latitude: true,
      longitude: true,
      creatorId: true,
    },
  });

  const maxRadius = getMaxRadiusKm();

  const matches: MissionMatch[] = [];

  for (const mission of openMissions) {
    if (!hasRequiredLicense(driver.driverProfile, mission.truckType)) {
      continue;
    }

    if (driver.latitude != null && driver.longitude != null && mission.latitude != null && mission.longitude != null) {
      const distance = haversineDistanceKm(driver.latitude, driver.longitude, mission.latitude, mission.longitude);
      if (distance > maxRadius) {
        continue;
      }
    }

    if (mission.favoritePriorityHours > 0 && mission.favoritePriorityStart) {
      const priorityEnd = new Date(mission.favoritePriorityStart.getTime() + mission.favoritePriorityHours * 60 * 60 * 1000);
      if (now < priorityEnd) {
        const isFavorite = await prisma.favorite.findFirst({
          where: { companyId: mission.creatorId, driverId },
        });
        if (!isFavorite) {
          continue;
        }
      }
    }

    matches.push({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      location: mission.location,
      missionDate: mission.missionDate,
      startTime: mission.startTime,
      endTime: mission.endTime,
      truckType: mission.truckType,
      hourlyRate: mission.hourlyRate,
      status: mission.status,
      favoritePriorityHours: mission.favoritePriorityHours,
      favoritePriorityStart: mission.favoritePriorityStart,
    });
  }

  return matches;
}
