import * as PdfParseModule from 'pdf-parse';
import { readFile } from 'fs/promises';

// Handle both ESM and CJS imports
const pdfParse = ((PdfParseModule as unknown as { default: unknown }).default || PdfParseModule) as (
  buffer: Buffer,
) => Promise<{ info: Record<string, unknown>; numpages: number }>;


/**
 * PDF scanning service for priority 7 security
 * Detects suspicious elements in PDF files:
 * - JavaScript embedded scripts
 * - Forms with submit handlers
 * - Launch actions and Open actions
 * - Embedded files and data
 */

export interface PDFScanResult {
  isSuspicious: boolean;
  threats: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Scan a PDF file for potentially malicious content
 * Returns list of suspicious patterns found
 */
export async function scanPdfForThreats(filePath: string): Promise<PDFScanResult> {
  try {
    const buffer = await readFile(filePath);
    const pdfData = await pdfParse(buffer);

    const threats: string[] = [];

    // 1. Check for JavaScript in PDF
    if (buffer.toString('latin1').includes('/JavaScript') || buffer.toString('latin1').includes('/JS')) {
      threats.push('Contenu JavaScript détecté dans le PDF');
    }

    // 2. Check for ActionName (triggers suspicious actions)
    if (buffer.toString('latin1').includes('/Action') || buffer.toString('latin1').includes('/AA')) {
      threats.push('Actions JavaScript potentielles détectées (/AA ou /Action)');
    }

    // 3. Check for OpenAction (auto-execute on open)
    if (buffer.toString('latin1').includes('/OpenAction')) {
      threats.push('Action d\'ouverture détectée (peut exécuter du code automatiquement)');
    }

    // 4. Check for Launch actions
    if (buffer.toString('latin1').includes('/Launch')) {
      threats.push('Actions de lancement détectées (possiblement malveillantes)');
    }

    // 5. Check for embedded files
    if (buffer.toString('latin1').includes('/EmbeddedFile') || buffer.toString('latin1').includes('/Encrypt')) {
      threats.push('Fichiers embarqués ou chiffrement détecté');
    }

    // 6. Check for embedded data streams (UF signatures)
    if (buffer.toString('latin1').includes('/SubmitForm') || buffer.toString('latin1').includes('/GoToR')) {
      threats.push('Soumission de formulaire ou références externes détectées');
    }

    // 7. Check for suspicious Unicode patterns
    if (buffer.includes(Buffer.from([0x00, 0x20])) || buffer.includes(Buffer.from([0xff, 0xfe]))) {
      threats.push('Encodage suspect détecté (Unicode embedded)');
    }

    return {
      isSuspicious: threats.length > 0,
      threats,
      metadata: pdfData.info,
    };
  } catch (error) {
    // If PDF parsing fails, it might be a malformed PDF
    if (error instanceof Error && error.message.includes('Invalid PDF')) {
      return {
        isSuspicious: true,
        threats: ['Fichier PDF invalide ou corrompu'],
      };
    }
    // Don't fail completely - just log the error and return non-suspicious
    console.warn(`PDF scanning error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isSuspicious: false,
      threats: [],
    };
  }
}

/**
 * Check if a PDF is safe to process
 * Returns true only if no threats detected
 */
export async function isPdfSafe(filePath: string): Promise<boolean> {
  const result = await scanPdfForThreats(filePath);
  return !result.isSuspicious;
}
