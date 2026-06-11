import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token manquant' });
  }

  const token = header.slice(7);

  let payload: { sub: string; role: Role };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? 'change-me') as {
      sub: string;
      role: Role;
    };
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalide' });
  }

  if (payload.role !== Role.ADMIN) {
    return res.status(403).json({ ok: false, message: 'Accès réservé aux administrateurs' });
  }

  // verify the user still exists (also blocks timing attack)
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, status: true },
  });
  if (!user || user.status === 'SUSPENDU' || user.status === 'RADIE') {
    return res.status(403).json({ ok: false, message: 'Session invalide' });
  }

  (req as unknown as { adminId: string }).adminId = user.id;
  next();
}
