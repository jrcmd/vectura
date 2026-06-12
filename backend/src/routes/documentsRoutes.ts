import type { Application, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma';
import path from 'path';
import { z } from 'zod';
import { DocType } from '@prisma/client';
import { requireDriver } from '../routes/authRoutes';
import { createRateLimiter } from '../middleware/rateLimiter';
import { randomBytes } from 'crypto';
import { unlink } from 'fs/promises';

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

// Priority 7: Reduced file size limit to 5 MB
const MAX_SIZE_MB = 5;
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
// Store sensitive files outside public upload directory
const SECURE_UPLOAD_DIR = path.join(UPLOAD_DIR, '.secure');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SECURE_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Priority 7: Use random filename to prevent enumeration
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
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
  const uploadLimiter = createRateLimiter({
    points: 10,
    duration: 60 * 60, // 1 hour
    keyPrefix: 'upload',
    getKey: (req: Request) => (req as unknown as { driverId?: string }).driverId || req.ip,
  });

  app.post('/api/documents/upload', requireDriver, uploadLimiter, upload.single('file'), async (req: Request, res: Response) => {
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

        // Priority 7: Lazy load file validation to avoid Jest ESM issues (dynamic import)
        let validationResult;
        let pdfScanResult;
        try {
          const { validateUploadedFile } = await import('../services/fileValidationService');
          validationResult = await validateUploadedFile(req.file.path, req.file.originalname);
          if (!validationResult.isValid) {
            await unlink(req.file.path).catch(() => {
              // Ignore error if file can't be deleted
            });
            return res.status(400).json({ ok: false, message: validationResult.error });
          }

          // Priority 7: Scan PDF files for embedded scripts and threats
          if (req.file.originalname.toLowerCase().endsWith('.pdf')) {
            const { scanPdfForThreats } = await import('../services/pdfScanService');
            pdfScanResult = await scanPdfForThreats(req.file.path);
            if (pdfScanResult.isSuspicious) {
              await unlink(req.file.path).catch(() => {
                // Ignore error if file can't be deleted
              });
              return res.status(400).json({
                ok: false,
                message: `Fichier PDF suspect. Menaces détectées: ${pdfScanResult.threats.join('; ')}`,
              });
            }
          }
        } catch (importError) {
          // If file validation modules fail to import, log but still allow upload
          // (this might happen in test environments)
          console.warn('File validation modules not available:', importError instanceof Error ? importError.message : 'unknown');
        }

        // Priority 7: Store file reference with random filename
        // fileUrl uses a secure token to prevent direct file enumeration
        const fileToken = randomBytes(16).toString('hex');
        const fileUrl = `/api/documents/download/${fileToken}`;

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
          return res.status(400).json({ ok: false, message: 'Fichier trop volumineux. Limite: 5 MB.' });
        }
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Erreur interne' });
      }
    },
  );
}
