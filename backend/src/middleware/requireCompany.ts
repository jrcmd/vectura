import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { verifyAccess } from '../lib/jwt';

export async function requireCompany(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token manquant' });
  }

  const token = header.slice(7);

  let payload: { sub: string; role: Role };
  try {
    payload = verifyAccess(token) as { sub: string; role: Role };
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalide' });
  }

  if (payload.role !== Role.ENTREPRISE) {
    return res.status(403).json({ ok: false, message: 'Accès réservé aux entreprises' });
  }

  // Db lookup blocks timing-attack and ensures the account is active
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, status: true },
  });

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Utilisateur introuvable' });
  }

  if (user.status === 'SUSPENDU' || user.status === 'RADIE') {
    return res.status(403).json({ ok: false, message: 'Compte non autorisé' });
  }

  (req as unknown as { companyId: string }).companyId = user.id;
  next();
}
