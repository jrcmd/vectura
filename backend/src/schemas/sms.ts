import { z } from 'zod';

// --- SmsService -----------------------------------------------------------

export const sendSmsSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Numéro invalide (E.164 attendu : +33612345678)'),
  body: z.string().min(2).max(160),
  provider: z.enum(['twilio', 'supabase']).optional().default('twilio'),
});

export const validateCredentialsSchema = z.object({
  provider: z.enum(['twilio', 'supabase']),
});

// --- EnrollmentService ----------------------------------------------------

export const createEnrollmentInvitationSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Numéro invalide (E.164 attendu)'),
  firstName: z.string().min(2).max(80).optional().nullable(),
  lastName: z.string().min(2).max(80).optional().nullable(),
  inviteeRole: z.enum(['CHAUFFEUR', 'ENTREPRISE']).default('CHAUFFEUR'),
  expiresInHours: z.coerce.number().int().positive().max(720).default(72),
  sendSms: z.boolean().default(true),
  messageTemplate: z.string().max(160).optional().nullable(),
});

export const acceptEnrollmentInvitationSchema = z.object({
  invitationId: z.string().min(8),
  password: z.string().min(8),
  firstName: z.string().min(1).max(80).optional().nullable(),
  lastName: z.string().min(1).max(80).optional().nullable(),
});

// --- Frontend types / hooks ------------------------------------------------

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type ValidateCredentialsInput = z.infer<typeof validateCredentialsSchema>;
export type CreateEnrollmentInvitationInput = z.infer<typeof createEnrollmentInvitationSchema>;
export type AcceptEnrollmentInvitationInput = z.infer<typeof acceptEnrollmentInvitationSchema>;
