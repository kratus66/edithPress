/*
  Warnings:

  - Added the required column `ipHash` to the `PageView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `PageView` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PageView_siteId_path_idx";

-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "ipHash" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DomainVerification" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "status" "CustomDomainStatus" NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomainVerification_domainId_idx" ON "DomainVerification"("domainId");

-- CreateIndex
CREATE INDEX "PageView_tenantId_idx" ON "PageView"("tenantId");

-- CreateIndex
CREATE INDEX "PageView_siteId_idx" ON "PageView"("siteId");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- AddForeignKey
ALTER TABLE "DomainVerification" ADD CONSTRAINT "DomainVerification_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "CustomDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
