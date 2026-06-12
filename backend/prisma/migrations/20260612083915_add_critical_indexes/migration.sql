/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `BackupRun` table. All the data in the column will be lost.
  - The primary key for the `CronJob` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `CronJob` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,type]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocType" ADD VALUE 'ADR';
ALTER TYPE "DocType" ADD VALUE 'FRIGO';

-- DropIndex
DROP INDEX "Billing_invoiceId_idx";

-- AlterTable
ALTER TABLE "BackupRun" DROP COLUMN "updatedAt",
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CronJob" DROP CONSTRAINT "CronJob_pkey",
ADD CONSTRAINT "CronJob_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "priorityHours" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientId" TEXT,
    "invitationId" TEXT,
    "message" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'twilio',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "providerRef" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentInvitation" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "smsLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_token_key" ON "ResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentInvitation_invitationId_key" ON "EnrollmentInvitation"("invitationId");

-- CreateIndex
CREATE INDEX "EnrollmentInvitation_invitationId_idx" ON "EnrollmentInvitation"("invitationId");

-- CreateIndex
CREATE INDEX "EnrollmentInvitation_phoneNumber_idx" ON "EnrollmentInvitation"("phoneNumber");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CronJob_name_key" ON "CronJob"("name");

-- CreateIndex
CREATE INDEX "Document_expiryDate_idx" ON "Document"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_type_key" ON "Document"("userId", "type");

-- CreateIndex
CREATE INDEX "Favorite_companyId_driverId_idx" ON "Favorite"("companyId", "driverId");

-- CreateIndex
CREATE INDEX "Mission_status_missionDate_idx" ON "Mission"("status", "missionDate");

-- CreateIndex
CREATE INDEX "Mission_driverId_status_idx" ON "Mission"("driverId", "status");

-- AddForeignKey
ALTER TABLE "ResetToken" ADD CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
