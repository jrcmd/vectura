import prisma from '../lib/prisma';
import { Prisma, Role } from '@prisma/client';

export type AuditInput = {
  actorId?: string | null;
  actorRole?: Role | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  status?: string;
  message?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type AuditListInput = {
  limit?: number;
  offset?: number;
  action?: string;
  status?: string;
};

export type IncidentInput = {
  title: string;
  severity: string;
  source?: string | null;
  url?: string | null;
  description?: string | null;
  ownerId?: string | null;
};

export type IncidentUpdateInput = {
  status?: string;
  description?: string | null;
  ownerId?: string | null;
  resolvedAt?: Date | null;
};

export async function createAuditEvent(input: AuditInput) {
  return prisma.auditEvent.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      ip: input.ip,
      userAgent: input.userAgent,
      status: input.status ?? 'success',
      message: input.message,
      metadata: input.metadata,
    },
  });
}

export async function listAuditEvents(input: AuditListInput = {}) {
  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;
  const where: Prisma.AuditEventWhereInput = {};

  if (input.action) where.action = input.action;
  if (input.status) where.status = input.status;

  const [items, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return { items, total, limit, offset };
}

export async function createIncident(input: IncidentInput) {
  return prisma.incidentTicket.create({
    data: {
      title: input.title,
      severity: input.severity,
      source: input.source,
      url: input.url,
      description: input.description,
      ownerId: input.ownerId,
      status: 'OPEN',
    },
  });
}

export async function listIncidents(input: AuditListInput = {}) {
  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;
  const where: Prisma.IncidentTicketWhereInput = {};

  if (input.status) where.status = input.status;

  const [items, total] = await Promise.all([
    prisma.incidentTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.incidentTicket.count({ where }),
  ]);

  return { items, total, limit, offset };
}

export async function updateIncident(id: string, input: IncidentUpdateInput) {
  const data: Prisma.IncidentTicketUpdateInput = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.description !== undefined) data.description = input.description;
  if (input.ownerId !== undefined) data.ownerId = input.ownerId;
  if (input.resolvedAt !== undefined) data.resolvedAt = input.resolvedAt;

  return prisma.incidentTicket.update({
    where: { id },
    data,
  });
}
