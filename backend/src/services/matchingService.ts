import { MissionStatus, TruckType, UserStatus } from '@prisma/client';
import { evaluateDriverQualification } from './qualificationService';
import prisma from '../lib/prisma';
import { getBoundingBox, getMaxRadiusKm, haversineDistanceKm } from './distanceService';



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

export type FindCompatibleMissionsOptions = {
  limit?: number;
  offset?: number;
  page?: number;
};

export async function findCompatibleMissions(driverId: string, options: FindCompatibleMissionsOptions = {}): Promise<MissionMatch[]> {
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
  const maxRadius = getMaxRadiusKm();
  const limit = options.limit ?? 20;
  const page = options.page && options.page > 0 ? options.page : 1;
  const offset = options.offset ?? (page - 1) * limit;

  const locationFilter =
    driver.latitude != null && driver.longitude != null
      ? {
          OR: [
            {
              AND: [
                { latitude: { gte: 0 } },
                { longitude: { gte: 0 } },
              ],
            },
          ],
        }
      : undefined;

  const whereBase: any = {
    status: MissionStatus.OUVERTE,
    missionDate: { gte: now },
  };

  if (driver.latitude != null && driver.longitude != null) {
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(driver.latitude, driver.longitude, maxRadius);
    whereBase.AND = [
      {
        OR: [
          {
            AND: [
              { latitude: { gte: minLat, lte: maxLat } },
              { longitude: { gte: minLng, lte: maxLng } },
            ],
          },
          { latitude: null },
          { longitude: null },
        ],
      },
    ];
  }

  const openMissions = await prisma.mission.findMany({
    where: whereBase,
    orderBy: { missionDate: 'asc' },
    take: limit,
    skip: offset,
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

  const creatorIds = Array.from(new Set(openMissions.map((mission) => mission.creatorId)));
  const favoriteRecords = await prisma.favorite.findMany({
    where: {
      driverId,
      companyId: { in: creatorIds },
    },
    select: { companyId: true },
  });
  const favoriteCompanyIds = new Set(favoriteRecords.map((f) => f.companyId));

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
      if (now < priorityEnd && !favoriteCompanyIds.has(mission.creatorId)) {
        continue;
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

  // eslint-disable-next-line no-console
  console.debug('[matchingService] findCompatibleMissions', {
    driverId,
    resultCount: matches.length,
    queriedMissions: openMissions.length,
    limit,
    offset,
  });

  return matches;
}
