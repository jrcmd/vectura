import nodemailer, { type Transporter, type SentMessageInfo } from 'nodemailer';
import prisma from '../lib/prisma';

type SendMailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

type SendResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

let cached: Promise<Transporter<SentMessageInfo>> | null = null;

function buildTransport(): Transporter<SentMessageInfo> | Promise<Transporter<SentMessageInfo>> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return nodemailer.createTestAccount().then((account) =>
      nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      }),
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

async function getTransport(): Promise<Transporter<SentMessageInfo>> {
  if (!cached) {
    const t = buildTransport();
    cached = Promise.resolve(t);
  }
  return cached;
}

export async function sendMail({ to, subject, html, text }: SendMailInput): Promise<SendResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const client = await getTransport();
      const info = await client.sendMail({
        from: process.env.FROM_EMAIL ?? process.env.SMTP_USER ?? 'noreply@vectura.fr',
        to,
        subject,
        html,
        text: text ?? html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  return { success: false, error: lastError?.message ?? 'Erreur SMTP inconnue' };
}

const TEMPLATES: Record<string, (vars: Record<string, string>) => { subject: string; text: string }> = {
  DOCUMENT_EXPIRY: ({ firstName, documentType }) => ({
    subject: 'Votre document va bientôt expirer',
    text: `Bonjour ${firstName},\n\nVotre document "${documentType}" va bientôt expirer. Veuillez le renouveler dans votre espace chauffeur.`,
  }),
  MISSION_REMINDER_J_MINUS_1: ({ firstName, missionTitle, missionDate }) => ({
    subject: 'Rappel : mission prévue demain',
    text: `Bonjour ${firstName},\n\nRappel : vous avez la mission "${missionTitle}" prévue le ${missionDate}.`,
  }),
  MISSION_REMINDER_J_DAY: ({ firstName, missionTitle, startTime }) => ({
    subject: "Rappel : mission aujourd'hui",
    text: `Bonjour ${firstName},\n\nRappel : votre mission "${missionTitle}" commence aujourd'hui à ${startTime}.`,
  }),
  COMPLIANCE_URSSAF: ({ firstName }) => ({
    subject: 'Votre attestation URSSAF n\'est plus conforme',
    text: `Bonjour ${firstName},\n\nVotre attestation URSSAF n'est plus conforme. Merci de la renouveler.`,
  }),
  DOCUMENT_VALIDATED: ({ firstName, documentType }) => ({
    subject: 'Document validé',
    text: `Bonjour ${firstName},\n\nVotre document "${documentType}" a été validé.`,
  }),
  DOCUMENT_REJECTED: ({ firstName, documentType, reason }) => ({
    subject: 'Document rejeté',
    text: `Bonjour ${firstName},\n\nVotre document "${documentType}" a été rejeté. Motif : ${reason}`,
  }),
  SANCTION_APPLIED: ({ firstName, sanctionType, reason }) => ({
    subject: sanctionType === 'RADIATION' ? 'Compte radié' : 'Compte suspendu',
    text: `Bonjour ${firstName},\n\nVotre compte a fait l'objet d'une sanction : ${sanctionType}. Motif : ${reason}.`,
  }),
};

export async function sendTemplateMail(to: string, type: string, variables: Record<string, string>, recipientId?: string) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Template inconnu : ${type}`);
  }
  const { subject, text } = template(variables);

  const result = await sendMail({ to, subject, text });

  // Log dans NotificationLog avec retryCount et body pour retry
  await prisma.notificationLog.create({
    data: {
      type,
      recipientId: recipientId ?? '',
      email: to,
      subject,
      body: text,
      status: result.success ? 'SENT' : 'FAILED',
      error: result.error,
      retryCount: result.success ? 0 : 1,
      maxRetries: 3,
    },
  });

  return result;
}

/** Retourne le délai de retry exponentiel en millisecondes */
export function getRetryDelaySeconds(retryCount: number): number {
  // 1min, 5min, 15min selon le nombre de retries
  const delays = [60, 300, 900]; // en secondes
  return delays[retryCount] ?? 900;
}

/** Récupère les notifications en échec ou en retry avec retryCount < maxRetries */
export async function getFailedNotifications() {
  return prisma.notificationLog.findMany({
    where: {
      status: { in: ['FAILED', 'RETRY'] },
      retryCount: { lt: 3 },
    },
    orderBy: { sentAt: 'asc' },
  });
}

/** Incrémente le retryCount et marque FAILED quand maxRetries atteint */
export async function recordRetryAttempt(notificationId: string, success: boolean, error?: string) {
  const notification = await prisma.notificationLog.findUnique({
    where: { id: notificationId },
  });

  if (!notification) return null;

  if (success) {
    return prisma.notificationLog.update({
      where: { id: notificationId },
      data: { status: 'SENT', retryCount: { increment: 1 } },
    });
  }

  const newRetryCount = (notification.retryCount ?? 0) + 1;
  const shouldFail = newRetryCount >= (notification.maxRetries ?? 3);

  return prisma.notificationLog.update({
    where: { id: notificationId },
    data: {
      retryCount: newRetryCount,
      status: shouldFail ? 'FAILED' : 'RETRY',
      error: error ?? notification.error,
    },
  });
}
