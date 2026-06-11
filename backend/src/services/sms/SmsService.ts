import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import prisma from '../../lib/prisma';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SmsProvider = 'twilio' | 'supabase';

export interface SendSmsInput {
  to: string;
  body: string;
  provider: SmsProvider;
}

export interface SmsSendResult {
  ok: boolean;
  providerRef?: string;
  status: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// SmsService
// ---------------------------------------------------------------------------

export class SmsService {
  private twilioClient: ReturnType<typeof twilio> | null = null;
  private supabaseClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceRoleKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }

  async validateCredentials(): Promise<{ ok: boolean; provider: SmsProvider | null }> {
    if (this.twilioClient) {
      return { ok: true, provider: 'twilio' };
    }
    if (this.supabaseClient) {
      return { ok: true, provider: 'supabase' };
    }
    return { ok: false, provider: null };
  }

  async send(input: SendSmsInput): Promise<SmsSendResult> {
    if (input.provider === 'twilio') {
      return this.sendViaTwilio(input);
    }
    if (input.provider === 'supabase') {
      return this.sendViaSupabase(input);
    }
    return { ok: false, status: 'ERROR', error: 'Provider inconnu' };
  }

  // ---------------------------------------------------------------------------
  // Twilio
  // ---------------------------------------------------------------------------

  private async sendViaTwilio(input: SendSmsInput): Promise<SmsSendResult> {
    if (!this.twilioClient) {
      return { ok: false, status: 'ERROR', error: 'Twilio non configuré' };
    }

    const fromNumber = process.env.TWILIO_FROM_NUMBER!;

    try {
      const message = await this.twilioClient.messages.create({
        body: input.body,
        from: fromNumber as string,
        to: input.to,
      });

      return {
        ok: true,
        providerRef: message.sid,
        status: 'SENT',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, status: 'ERROR', error: message };
    }
  }

  // ---------------------------------------------------------------------------
  // Supabase
  // ---------------------------------------------------------------------------

  private async sendViaSupabase(_input: SendSmsInput): Promise<SmsSendResult> {
    if (!this.supabaseClient) {
      return { ok: false, status: 'ERROR', error: 'Supabase non configuré' };
    }

    try {
      const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseProjectRef || !supabaseServiceRoleKey) {
        return { ok: false, status: 'ERROR', error: 'Supabase project ref or service key missing' };
      }

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${supabaseProjectRef}/sms/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
          },
          body: JSON.stringify({
            to: _input.to,
            body: _input.body,
          }),
        },
      );

      const data = (await response.json().catch(() => null)) as { messageId?: string; error?: string } | null;

      if (!response.ok || data?.error) {
        return {
          ok: false,
          status: 'ERROR',
          error: data?.error ?? `HTTP ${response.status}`,
        };
      }

      return {
        ok: true,
        providerRef: data?.messageId,
        status: 'SENT',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, status: 'ERROR', error: message };
    }
  }

  // ---------------------------------------------------------------------------
  // Log helpers
  // ---------------------------------------------------------------------------

  async logSms(params: {
    recipientPhone: string;
    recipientId?: string;
    invitationId?: string;
    message: string;
    provider: SmsProvider;
    status: string;
    providerRef?: string;
    error?: string;
    sentAt?: Date;
  }): Promise<{ id: string }> {
    return prisma.smsLog.create({
      data: {
        recipientPhone: params.recipientPhone,
        recipientId: params.recipientId ?? null,
        invitationId: params.invitationId ?? null,
        message: params.message,
        provider: params.provider,
        status: params.status,
        providerRef: params.providerRef ?? null,
        error: params.error ?? null,
        sentAt: params.sentAt ?? null,
      },
      select: { id: true },
    });
  }
}

export const smsService = new SmsService();
