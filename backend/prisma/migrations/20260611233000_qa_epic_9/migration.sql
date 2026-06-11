-- Create QA, audit, monitoring and deployment support tables.
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" "Role",
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IncidentTicket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "source" TEXT,
    "url" TEXT,
    "description" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "IncidentTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackupRun" (
    "id" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'development',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "backupPath" TEXT,
    "sizeBytes" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BackupRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CronJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastDurationMs" INTEGER,
    "lastError" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CronJob_pkey" PRIMARY KEY ("name")
);

CREATE TABLE "QaCheck" (
    "id" TEXT NOT NULL,
    "suite" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "notes" TEXT,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QaCheck_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");
CREATE INDEX "IncidentTicket_status_createdAt_idx" ON "IncidentTicket"("status", "createdAt");
CREATE INDEX "BackupRun_environment_createdAt_idx" ON "BackupRun"("environment", "createdAt");
CREATE INDEX "QaCheck_suite_status_idx" ON "QaCheck"("suite", "status");
CREATE UNIQUE INDEX "QaCheck_suite_name_key" ON "QaCheck"("suite", "name");
