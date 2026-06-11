import { randomUUID } from 'crypto';
import { SmsProvider } from '../sms/SmsService';
import { smsService } from '../sms/SmsService';
import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';

export interface EnrollmentInvitationInput {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  inviteeRole: Role;
  expiresInHours?: number;
  sendSms: boolean;
  messageTemplate?: string;
  provider: SmsProvider;
  createdBy: string;
}

export interface EnrollmentInvitationResult {
  invitationId: string;
  phoneNumber: string;
  status: string;
  smsSent: boolean;
  smsError?: string;
}

export class EnrollmentService {
  async createInvitation(input: EnrollmentInvitationInput): Promise<EnrollmentInvitationResult> {
    const invitationId = `ENR-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (input.expiresInHours ?? 72));

    // Build the message
    const rawBody = input.messageTemplate?.trim();
    let message: string;
    if (rawBody) {
      message = rawBody;
    } else {
      const roleLabel = input.inviteeRole === 'ENTREPRISE' ? 'entreprise' : 'chauffeur';
      message = `Vectura : vous êtes invité à créer un compte ${roleLabel}. Rendez-vous sur https://vectura.fr/accept-invitation/${invitationId} (valable 72h).`;
    }

    let smsSent = false;
    let smsError: string | undefined;

    if (input.sendSms) {
      const sendResult = await smsService.send({
        to: input.phoneNumber,
        body: message,
        provider: input.provider,
      });

      const smsLog = await smsService.logSms({
        recipientPhone: input.phoneNumber,
        recipientId: undefined,
        invitationId,
        message,
        provider: input.provider,
        status: sendResult.ok ? 'SENT' : 'FAILED',
        providerRef: sendResult.providerRef,
        error: sendResult.error,
        sentAt: sendResult.ok ? new Date() : undefined,
      });

      smsSent = sendResult.ok;
      smsError = sendResult.error;

      await prisma.enrollmentInvitation.create({
        data: {
          invitationId,
          phoneNumber: input.phoneNumber,
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          invitedBy: input.createdBy,
          status: sendResult.ok ? 'PENDING' : 'FAILED',
          expiresAt,
          smsLogId: smsLog.id,
        },
      });
    } else {
      await prisma.enrollmentInvitation.create({
        data: {
          invitationId,
          phoneNumber: input.phoneNumber,
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          invitedBy: input.createdBy,
          status: 'PENDING',
          expiresAt,
        },
      });
    }

    return {
      invitationId,
      phoneNumber: input.phoneNumber,
      status: smsSent ? 'PENDING' : 'FAILED',
      smsSent,
      smsError,
    };
  }

  // Used by the frontend after accept
  async markAccepted(invitationId: string): Promise<void> {
    await prisma.enrollmentInvitation.updateMany({
      where: { invitationId, status: 'PENDING' },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
  }
}

export const enrollmentService = new EnrollmentService();
