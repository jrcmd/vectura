import { fileTypeFromBuffer, fileTypeFromFile } from 'file-type';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * MIME type mappings for validation (priority 7)
 * Maps allowed extensions to their expected MIME types
 */
const MIME_TYPE_MAP: Record<string, Set<string>> = {
  '.pdf': new Set(['application/pdf']),
  '.jpg': new Set(['image/jpeg', 'image/jpg']),
  '.jpeg': new Set(['image/jpeg', 'image/jpg']),
  '.png': new Set(['image/png']),
};

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per priority 7

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
}

/**
 * Validate file by checking:
 * 1. Extension is whitelisted
 * 2. File size doesn't exceed limit
 * 3. MIME type matches expected types for the extension
 */
export async function validateUploadedFile(
  filePath: string,
  originalFilename: string,
): Promise<FileValidationResult> {
  try {
    // 1. Check extension is whitelisted
    const ext = path.extname(originalFilename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        isValid: false,
        error: `Extension non autorisée. Formats acceptés: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
      };
    }

    // 2. Check file size
    const buffer = await readFile(filePath);
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Fichier trop volumineux. Limite: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB, Reçu: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      };
    }

    // 3. Verify MIME type matches extension
    const detectedType = await fileTypeFromBuffer(buffer);
    if (!detectedType) {
      return {
        isValid: false,
        error: 'Impossible de déterminer le type de fichier. Le fichier pourrait être corrompu.',
      };
    }

    const allowedMimes = MIME_TYPE_MAP[ext];
    if (!allowedMimes || !allowedMimes.has(detectedType.mime)) {
      return {
        isValid: false,
        error: `Extension ${ext} ne correspond pas au type MIME détecté (${detectedType.mime}). Fraude potentielle.`,
      };
    }

    return {
      isValid: true,
      mimeType: detectedType.mime,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Erreur lors de la validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get allowed MIME types for a given file extension
 */
export function getAllowedMimesForExtension(ext: string): Set<string> | null {
  return MIME_TYPE_MAP[ext.toLowerCase()] ?? null;
}

/**
 * Export for testing/validation purposes
 */
export function getMaxFileSizeBytes(): number {
  return MAX_FILE_SIZE_BYTES;
}
