export const NOTIFICATION_TYPES = {
  MISSION_REMINDER_J_MINUS_1: 'MISSION_REMINDER_J_MINUS_1',
  MISSION_REMINDER_J_DAY: 'MISSION_REMINDER_J_DAY',
  DOCUMENT_EXPIRY: 'DOCUMENT_EXPIRY',
  DOCUMENT_VALIDATED: 'DOCUMENT_VALIDATED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  COMPLIANCE_URSSAF: 'COMPLIANCE_URSSAF',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type MissionReminderJob = {
  type: typeof NOTIFICATION_TYPES.MISSION_REMINDER_J_MINUS_1 | typeof NOTIFICATION_TYPES.MISSION_REMINDER_J_DAY;
  missionId: string;
  driverId: string;
  companyId: string;
  sendAt: Date;
};

export type DocumentNotificationJob = {
  type: typeof NOTIFICATION_TYPES.DOCUMENT_EXPIRY | typeof NOTIFICATION_TYPES.DOCUMENT_VALIDATED | typeof NOTIFICATION_TYPES.DOCUMENT_REJECTED | typeof NOTIFICATION_TYPES.COMPLIANCE_URSSAF;
  recipientId: string;
  email: string;
  sendAt: Date;
};

export type NotificationJob = MissionReminderJob | DocumentNotificationJob;

const jobs: NotificationJob[] = [];

export function scheduleMissionReminder(reminder: MissionReminderJob) {
  jobs.push(reminder);
}

export function scheduleDocumentNotification(notification: DocumentNotificationJob) {
  jobs.push(notification);
}

export function getDueReminders(now: Date) {
  return jobs.filter((job) => job.sendAt <= now);
}

export function markSent(missionId: string, type: string) {
  const index = jobs.findIndex((job) => job.type === type && 'missionId' in job && job.missionId === missionId);
  if (index >= 0) jobs.splice(index, 1);
}

export function markDocumentNotificationSent(recipientId: string, type: string) {
  const index = jobs.findIndex((job) => job.type === type && 'recipientId' in job && job.recipientId === recipientId);
  if (index >= 0) jobs.splice(index, 1);
}
