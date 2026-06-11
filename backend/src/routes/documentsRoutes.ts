import type { Application, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma';
import path from 'path';
import { z } from 'zod';
import { DocType } from '@prisma/client';
import { requireDriver } from '../routes/authRoutes';



const ALLOWED_TYPES = new Set<DocType>([
  DocType.PERMIS_C,
  DocType.PERMIS_CE,
  DocType.FIMO,
  DocType.FCO,
  DocType.CARTE_CHRONO,
  DocType.KBIS,
  DocType.URSSAF,
  DocType.RC_PRO,
]);

const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB ?? 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${base}-${timestamp}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

const uploadDocumentSchema = z.object({
  type: z.enum([
    'PERMIS_C',
    'PERMIS_CE',
    'FIMO',
    'FCO',
    'CARTE_CHRONO',
    'KBIS',
    'URSSAF',
    'RC_PRO',
  ]),
  expiryDate: z.coerce.date().optional(),
});

export function registerDocumentsRoutes(app: Application) {
  app.post(
    '/api/documents/upload',
    requireDriver,
    upload.single('file'),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ ok: false, message: 'Fichier manquant.' });
        }

        const parsed = uploadDocumentSchema.parse({
          type: req.body.type,
          expiryDate: req.body.expiryDate,
        });

        if (!ALLOWED_TYPES.has(parsed.type)) {
          return res.status(400).json({ ok: false, message: 'Type de document invalide.' });
        }

        const driverId = (req as unknown as { driverId: string }).driverId;

        const user = await prisma.user.findUnique({
          where: { id: driverId },
          select: { role: true },
        });

        if (!user || user.role !== 'CHAUFFEUR') {
          return res.status(403).json({ ok: false, message: 'Accès réservé aux chauffeurs.' });
        }

        const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;

        const doc = await prisma.document.upsert({
          where: {
            userId_type: {
              userId: driverId,
              type: parsed.type,
            },
          },
          update: {
            fileUrl,
            expiryDate: parsed.expiryDate ?? undefined,
            status: 'EN_ATTENTE',
            uploadedAt: new Date(),
            validatedAt: null,
            validatedBy: null,
            rejectionReason: null,
          },
          create: {
            userId: driverId,
            type: parsed.type,
            fileUrl,
            expiryDate: parsed.expiryDate ?? undefined,
            status: 'EN_ATTENTE',
          },
        });

        return res.status(201).json({ ok: true, document: doc });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ ok: false, message: 'Données invalides', errors: err.flatten() });
        }
        if (err instanceof Error && (err.message === 'LIMIT_FILE_SIZE' || err.message.includes('too large'))) {
          return res.status(400).json({ ok: false, message: 'Fichier trop volumineux.' });
        }
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Erreur interne' });
      }
    },
  );
}
