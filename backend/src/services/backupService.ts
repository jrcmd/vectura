import { execFile } from 'child_process';
import { mkdir, readdir, stat, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma';

const DEFAULT_BACKUP_DIR = path.resolve(process.env.BACKUP_DIR ?? './backups');
const DEFAULT_UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads');

type BackupMetadata = {
  createdAt: string;
  environment: string;
  databaseUrlConfigured: boolean;
  uploadDir: string;
};

export async function runPostgresBackup(environment = process.env.NODE_ENV ?? 'development') {
  const startedAt = new Date();
  const backup = await prisma.backupRun.create({
    data: {
      environment,
      status: 'RUNNING',
      startedAt,
    },
  });

  try {
    await mkdir(DEFAULT_BACKUP_DIR, { recursive: true });
    const databaseUrl = process.env.DATABASE_URL;
    const backupPath = path.join(DEFAULT_BACKUP_DIR, `vectura-${environment}-${startedAt.toISOString().replace(/[:.]/g, '-')}.dump`);
    const metadataPath = `${backupPath}.json`;

    if (databaseUrl && process.env.BACKUP_USE_METADATA_ONLY !== 'true') {
      await runPgDump(databaseUrl, backupPath);
    } else {
      await writeFile(backupPath, 'metadata-only-backup\n', 'utf8');
    }

    const metadata: BackupMetadata = {
      createdAt: startedAt.toISOString(),
      environment,
      databaseUrlConfigured: Boolean(databaseUrl),
      uploadDir: DEFAULT_UPLOAD_DIR,
    };
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    const sizeBytes = await getDirectorySize(DEFAULT_BACKUP_DIR);
    const completed = await prisma.backupRun.update({
      where: { id: backup.id },
      data: {
        completedAt: new Date(),
        status: 'SUCCESS',
        backupPath,
        sizeBytes,
      },
    });

    return { ok: true, backup: completed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backup error';
    const failed = await prisma.backupRun.update({
      where: { id: backup.id },
      data: {
        completedAt: new Date(),
        status: 'FAILED',
        error: message,
      },
    });
    return { ok: false, backup: failed, error: message };
  }
}

export async function listBackupRuns(limit = 20) {
  return prisma.backupRun.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function runPgDump(databaseUrl: string, backupPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile('pg_dump', ['--dbname', databaseUrl, '--format=custom', '--file', backupPath], (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function getDirectorySize(dir: string): Promise<number> {
  const entries = await readdir(dir, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return getDirectorySize(fullPath);
      const fileStat = await stat(fullPath);
      return fileStat.size;
    }),
  );

  return sizes.reduce((sum, size) => sum + size, 0);
}
