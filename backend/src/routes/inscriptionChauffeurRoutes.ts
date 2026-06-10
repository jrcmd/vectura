import type { Application, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaClient, Role, UserStatus, DocType, DocStatus } from '@prisma/client';

const prisma = new PrismaClient();

const registerDriverSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/)
    .describe('Téléphone FR au format international ou national (10 à 15 chiffres).'),
  city: z.string().min(1).max(120),
});

/**
 * Enregistre un chauffeur en base.
 * - Crée User (role=CHAUFFEUR, status=EN_ATTENTE)
 * - Crée DriverProfile avec qualifications initialement à false
 *
 * NOTE : Les uploads de documents (permis, fimo, etc.) ne sont pas encore gérés dans ce sprint.
 * Le statut EN_ATTENTE bloquera l'accès aux missions.
 */
export function registerInscriptionChauffeurRoutes(app: Application) {
  app.post('/api/drivers/register', async (req: Request, res: Response) => {
    try {
      const body = registerDriverSchema.parse(req.body);

      const passwordHash = await bcrypt.hash(body.password, 12);

      // 1) Création utilisateur
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: passwordHash,
          role: Role.CHAUFFEUR,
          status: UserStatus.EN_ATTENTE,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          city: body.city,
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
        select: { id: true, email: true, status: true },
      });

      // 2) Pré-enregistrer des documents manquants en EN_ATTENTE (placeholder)
      // Cela simplifie le front pour afficher "documents manquants".
      const requiredDocs: DocType[] = [
        DocType.PERMIS_C,
        DocType.PERMIS_CE,
        DocType.FIMO,
        DocType.FCO,
        DocType.CARTE_CHRONO,
        DocType.KBIS,
        DocType.URSSAF,
        DocType.RC_PRO,
      ];

      await prisma.document.createMany({
        data: requiredDocs.map((type) => ({
          userId: user.id,
          type,
          fileUrl: '',
          expiryDate: null,
          status: DocStatus.EN_ATTENTE,
        })),
      });

      return res.status(201).json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
        },
      });
    } catch (err) {
      // Validation Zod
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }

      // Prisma / unicité email
      // Prisma / unicité email (gestion sans any explicite)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof (err as { code?: unknown }).code === 'string' &&
        (err as { code?: string }).code === 'P2002'
      ) {
        return res.status(409).json({ ok: false, message: 'Email déjà utilisé' });
      }

      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}

