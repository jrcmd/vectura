import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, UserStatus } from '@prisma/client';

export function requireCompany(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token manquant' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'change-me') as {
      sub: string;
      role: Role;
      status: UserStatus;
    };

    if (payload.role !== Role.ENTREPRISE) {
      return res.status(403).json({ ok: false, message: 'Accès réservé aux entreprises' });
    }

    if (payload.status === UserStatus.SUSPENDU || payload.status === UserStatus.RADIE) {
      return res.status(403).json({ ok: false, message: 'Compte non autorisé' });
    }

    (req as unknown as { companyId: string }).companyId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalide' });
  }
}
