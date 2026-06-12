import { execFile, exec } from 'child_process';
import { mkdir, readdir, stat, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import prisma from '../lib/prisma';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const DEFAULT_BACKUP_DIR = path.resolve(process.env.BACKUP_DIR ?? './backups');
const DEFAULT_UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
const BACKUP_RETENTION_DAYS = 30;
const BACKUP_ENCRYPTION_ENABLED = process.env.BACKUP_ENCRYPTION_ENABLED !== 'false';
const BACKUP_ENCRYPTION_PASSPHRASE = process.env.BACKUP_ENCRYPTION_PASSPHRASE ?? 'default-passphrase-change-in-production';

type BackupMetadata = {
  createdAt: string;
  environment: string;
  databaseUrlConfigured: boolean;
  uploadDir: string;
  encrypted: boolean;
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
    const timestamp = startedAt.toISOString().replace(/[:.]/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-mm-ss
    const backupPath = path.join(DEFAULT_BACKUP_DIR, `vectura-${environment}-${timestamp}.dump`);
    const metadataPath = `${backupPath}.json`;
    let encryptedBackupPath: string | null = null;

    if (databaseUrl && process.env.BACKUP_USE_METADATA_ONLY !== 'true') {
      await runPgDump(databaseUrl, backupPath);
    } else {
      await writeFile(backupPath, 'metadata-only-backup\n', 'utf8');
    }

    // Encrypt backup if enabled
    if (BACKUP_ENCRYPTION_ENABLED) {
      encryptedBackupPath = await encryptBackup(backupPath);
      // Delete unencrypted backup after successful encryption
      await unlink(backupPath);
    }

    const metadata: BackupMetadata = {
      createdAt: startedAt.toISOString(),
      environment,
      databaseUrlConfigured: Boolean(databaseUrl),
      uploadDir: DEFAULT_UPLOAD_DIR,
      encrypted: BACKUP_ENCRYPTION_ENABLED,
    };
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Clean up old backups (retention policy: 30 days)
    await cleanupOldBackups();

    const sizeBytes = await getDirectorySize(DEFAULT_BACKUP_DIR);
    const completed = await prisma.backupRun.update({
      where: { id: backup.id },
      data: {
        completedAt: new Date(),
        status: 'SUCCESS',
        backupPath: encryptedBackupPath || backupPath,
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

/**
 * Encrypt a backup file using OpenSSL AES-256-CBC
 * Returns the path to the encrypted file (.enc extension)
 */
async function encryptBackup(backupPath: string): Promise<string> {
  const encryptedPath = `${backupPath}.enc`;
  try {
    await execFileAsync('openssl', [
      'enc',
      '-aes-256-cbc',
      '-salt',
      '-in',
      backupPath,
      '-out',
      encryptedPath,
      '-k',
      BACKUP_ENCRYPTION_PASSPHRASE,
      '-md',
      'sha256',
    ]);
    return encryptedPath;
  } catch (error) {
    throw new Error(`Backup encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a backup file using OpenSSL AES-256-CBC
 * Returns the path to the decrypted file
 */
export async function decryptBackup(encryptedPath: string, outputPath: string, passphrase: string): Promise<string> {
  try {
    await execFileAsync('openssl', [
      'enc',
      '-d',
      '-aes-256-cbc',
      '-in',
      encryptedPath,
      '-out',
      outputPath,
      '-k',
      passphrase,
      '-md',
      'sha256',
    ]);
    return outputPath;
  } catch (error) {
    throw new Error(`Backup decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clean up backup files older than BACKUP_RETENTION_DAYS (default: 30 days)
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const files = await readdir(DEFAULT_BACKUP_DIR, { withFileTypes: true });
    const now = Date.now();
    const retentionMs = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    for (const file of files) {
      // Skip directories and metadata files
      if (file.isDirectory() || file.name.endsWith('.json')) {
        continue;
      }

      // Only process backup files (.dump or .dump.enc)
      if (!file.name.includes('.dump')) {
        continue;
      }

      const fullPath = path.join(DEFAULT_BACKUP_DIR, file.name);
      const fileStat = await stat(fullPath);
      const ageMs = now - fileStat.mtimeMs;

      if (ageMs > retentionMs) {
        await unlink(fullPath);
        console.log(`Deleted old backup: ${file.name} (${Math.floor(ageMs / (24 * 60 * 60 * 1000))} days old)`);

        // Also delete associated metadata file
        const metadataPath = `${fullPath}.json`;
        try {
          await unlink(metadataPath);
        } catch {
          // Metadata file might not exist, that's OK
        }
      }
    }
  } catch (error) {
    console.error(`Backup cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Don't throw - cleanup failure shouldn't block backup completion
  }
}

/**
 * Restore a database from encrypted backup
 * Example: restoreFromBackup('vectura-production-2026-06-12T10-30-45.dump.enc', passphrase)
 */
export async function restoreFromBackup(backupFile: string, passphrase: string): Promise<{ ok: boolean; message: string }> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { ok: false, message: 'DATABASE_URL not configured' };
    }

    const backupPath = path.join(DEFAULT_BACKUP_DIR, backupFile);
    const decryptedPath = path.join(DEFAULT_BACKUP_DIR, `.${backupFile}.decrypted`);

    // Decrypt backup if encrypted
    if (backupFile.endsWith('.enc')) {
      await decryptBackup(backupPath, decryptedPath, passphrase);
    }

    const sourceFile = backupFile.endsWith('.enc') ? decryptedPath : backupPath;

    // Restore using pg_restore
    await execFileAsync('pg_restore', ['--dbname', databaseUrl, '--clean', '--if-exists', sourceFile]);

    // Clean up decrypted temporary file
    if (backupFile.endsWith('.enc')) {
      try {
        await unlink(decryptedPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    return { ok: true, message: `Database restored from ${backupFile}` };
  } catch (error) {
    return { ok: false, message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Helper: Run pg_dump command
 */
async function runPgDump(databaseUrl: string, backupPath: string): Promise<void> {
  try {
    await execFileAsync('pg_dump', [
      '--dbname',
      databaseUrl,
      '--format=custom',
      '--file',
      backupPath,
      '--verbose',
    ]);
  } catch (error) {
    throw new Error(`pg_dump failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper: Calculate total size of backup directory
 */
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
