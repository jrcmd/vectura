-- AlterTable
ALTER TABLE "Billing" ADD COLUMN "invoiceId" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "generatedAt" TIMESTAMP(3),
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "totalAmountBilled" DOUBLE PRECISION NOT NULL,
    "totalAmountDriver" DOUBLE PRECISION NOT NULL,
    "totalMargin" DOUBLE PRECISION NOT NULL,
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_weekStart_key" ON "Invoice"("companyId", "weekStart");

-- CreateIndex
CREATE INDEX "Billing_invoiceId_idx" ON "Billing"("invoiceId");

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
