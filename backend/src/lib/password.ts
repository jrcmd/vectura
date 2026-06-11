import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}.${password}`).digest('hex');
  return `sha256$${salt}.${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith('sha256$')) {
    const [, rest] = storedHash.split('$');
    const [salt, hash] = rest.split('.');
    const candidate = createHash('sha256').update(`${salt}.${password}`).digest('hex');
    return timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
  }

  if (storedHash.startsWith('$2')) {
    return false;
  }

  return false;
}
