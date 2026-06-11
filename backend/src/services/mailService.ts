type SendMailOptions = {
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

const TEMPLATES: Record<string, (vars: Record<string, string>) => string> = {
  DOCUMENT_EXPIRY: ({ firstName }) =>
    `Bonjour ${firstName},\n\nVotre document va bientôt expirer. Veuillez renouveler votre pièce dans votre espace chauffeur.`,
  MISSION_REMINDER_J_MINUS_1: ({ firstName, missionTitle, missionDate }) =>
    `Bonjour ${firstName},\n\nRappel : vous avez la mission "${missionTitle}" prévue le ${missionDate}.`,
  MISSION_REMINDER_J_DAY: ({ firstName, missionTitle, startTime }) =>
    `Bonjour ${firstName},\n\nRappel : votre mission "${missionTitle}" commence aujourd'hui à ${startTime}.`,
  COMPLIANCE_URSSAF: ({ firstName }) =>
    `Bonjour ${firstName},\n\nVotre attestation URSSAF n'est plus conforme. Merci de la renouveler.`,
  DOCUMENT_VALIDATED: ({ firstName, documentType }) =>
    `Bonjour ${firstName},\n\nVotre document "${documentType}" a été validé.`,
  DOCUMENT_REJECTED: ({ firstName, documentType, reason }) =>
    `Bonjour ${firstName},\n\nVotre document "${documentType}" a été rejeté. Motif : ${reason}`,
};

export async function sendMail({ to, subject }: SendMailOptions): Promise<SendResult> {
  // TODO: brancher le fournisseur SMTP/API (STORY 7.1)
  console.info(`[MAIL] to=${to} subject=${subject}`);
  return { success: true, messageId: `mock-${Date.now()}` };
}

export async function sendTemplateMail(to: string, type: string, variables: Record<string, string>) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Template inconnu : ${type}`);
  }
  const text = template(variables);
  return sendMail({ to, subject: type, text });
}
