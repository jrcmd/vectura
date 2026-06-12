import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';

// Fonctions utilitaires centralisées pour signer et vérifier les JWT.
// Elles évitent tout fallback et utilisent les secrets validés par validateEnv().

export function signAccess(
  payload: string | object | Buffer,
  expiresIn = process.env.JWT_ACCESS_EXPIRATION ?? '15m',
) {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function signRefresh(
  payload: string | object | Buffer,
  expiresIn = process.env.JWT_REFRESH_EXPIRATION ?? '7d',
) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret) as jwt.JwtPayload;
}
