-- CreateEnum
CREATE TYPE "EvidenceContributionType" AS ENUM ('PGP_KEY', 'WALLET', 'ALIAS', 'INFRASTRUCTURE', 'MESSAGE_PATTERN');

-- CreateEnum
CREATE TYPE "ReliabilityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- AlterTable
ALTER TABLE "Actor" ADD COLUMN     "category" TEXT DEFAULT 'Marketplace Vendor',
ADD COLUMN     "lastScanDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "observedActivities" TEXT[] DEFAULT ARRAY['Data Trading', 'Credential Selling', 'Forum Activity']::TEXT[],
ADD COLUMN     "riskLevel" "SeverityLevel" DEFAULT 'high',
ADD COLUMN     "sourceTelemetry" JSONB;

-- AlterTable
ALTER TABLE "InfrastructureIndicator" ADD COLUMN     "certificateFingerprint" TEXT,
ADD COLUMN     "contributionWeight" INTEGER DEFAULT 30,
ADD COLUMN     "hostingPattern" TEXT,
ADD COLUMN     "reliability" TEXT DEFAULT 'High',
ADD COLUMN     "serverTechnology" TEXT,
ADD COLUMN     "usedFor" TEXT DEFAULT 'Relationship attribution';

-- CreateTable
CREATE TABLE "ActorEmail" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "provider" TEXT,
    "context" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "ActorEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceContribution" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "evidenceType" "EvidenceContributionType" NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "reliability" "ReliabilityLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActorEmail_actorId_idx" ON "ActorEmail"("actorId");

-- CreateIndex
CREATE INDEX "ActorEmail_address_idx" ON "ActorEmail"("address");

-- CreateIndex
CREATE INDEX "EvidenceContribution_relationshipId_idx" ON "EvidenceContribution"("relationshipId");

-- CreateIndex
CREATE INDEX "EvidenceContribution_evidenceType_idx" ON "EvidenceContribution"("evidenceType");

-- AddForeignKey
ALTER TABLE "ActorEmail" ADD CONSTRAINT "ActorEmail_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceContribution" ADD CONSTRAINT "EvidenceContribution_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "ActorRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
