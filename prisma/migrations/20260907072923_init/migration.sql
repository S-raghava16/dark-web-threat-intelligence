-- CreateEnum
CREATE TYPE "ActorStatus" AS ENUM ('active', 'monitored', 'dormant');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('actor', 'handle', 'pgp_key', 'wallet', 'onion_service', 'domain');

-- CreateEnum
CREATE TYPE "InfrastructureType" AS ENUM ('onion_service', 'domain', 'wallet', 'pgp_key', 'hosting_cluster');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('post', 'listing', 'pgp_signature', 'wallet_reuse', 'infrastructure_overlap', 'linguistic_marker');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('listing', 'forum_post', 'pgp_rotation', 'wallet_activity', 'infrastructure_change', 'alert');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('info', 'low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('open', 'acknowledged', 'investigating', 'closed');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('open', 'active', 'review', 'closed');

-- CreateEnum
CREATE TYPE "WalletAsset" AS ENUM ('BTC', 'XMR', 'ETH');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('related_persona', 'shared_wallet', 'shared_pgp', 'shared_infrastructure', 'linguistic_similarity', 'behavioral_similarity');

-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ActorStatus" NOT NULL,
    "attributionConfidence" INTEGER NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "provenance" TEXT NOT NULL DEFAULT 'synthetic_demo',

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "ActorAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorHandle" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "ActorHandle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PgpKey" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "associatedHandle" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "PgpKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "asset" "WalletAsset" NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marketplace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplacePresence" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,

    CONSTRAINT "MarketplacePresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPresence" (
    "id" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,

    CONSTRAINT "ForumPresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedPersona" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,

    CONSTRAINT "RelatedPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "InvestigationStatus" NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationActor" (
    "investigationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "InvestigationActor_pkey" PRIMARY KEY ("investigationId","actorId")
);

-- CreateTable
CREATE TABLE "InfrastructureIndicator" (
    "id" TEXT NOT NULL,
    "type" "InfrastructureType" NOT NULL,
    "value" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "note" TEXT,
    "provenance" TEXT NOT NULL DEFAULT 'synthetic_demo',
    "walletId" TEXT,
    "pgpKeyId" TEXT,

    CONSTRAINT "InfrastructureIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorInfrastructure" (
    "actorId" TEXT NOT NULL,
    "infrastructureId" TEXT NOT NULL,

    CONSTRAINT "ActorInfrastructure_pkey" PRIMARY KEY ("actorId","infrastructureId")
);

-- CreateTable
CREATE TABLE "InvestigationInfrastructure" (
    "investigationId" TEXT NOT NULL,
    "infrastructureId" TEXT NOT NULL,

    CONSTRAINT "InvestigationInfrastructure_pkey" PRIMARY KEY ("investigationId","infrastructureId")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "provenance" TEXT NOT NULL DEFAULT 'synthetic_demo',
    "investigationId" TEXT NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceActor" (
    "evidenceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "EvidenceActor_pkey" PRIMARY KEY ("evidenceId","actorId")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "investigationId" TEXT,
    "actorId" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "actorId" TEXT,
    "investigationId" TEXT,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorRelationship" (
    "id" TEXT NOT NULL,
    "fromActorId" TEXT NOT NULL,
    "toActorId" TEXT NOT NULL,
    "type" "RelationshipType" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "hypothesis" TEXT,
    "provenance" TEXT NOT NULL DEFAULT 'synthetic_demo',

    CONSTRAINT "ActorRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActorAlias_actorId_idx" ON "ActorAlias"("actorId");

-- CreateIndex
CREATE INDEX "ActorHandle_actorId_idx" ON "ActorHandle"("actorId");

-- CreateIndex
CREATE INDEX "ActorHandle_value_idx" ON "ActorHandle"("value");

-- CreateIndex
CREATE UNIQUE INDEX "PgpKey_fingerprint_key" ON "PgpKey"("fingerprint");

-- CreateIndex
CREATE INDEX "PgpKey_actorId_idx" ON "PgpKey"("actorId");

-- CreateIndex
CREATE INDEX "PgpKey_fingerprint_idx" ON "PgpKey"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_actorId_idx" ON "Wallet"("actorId");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Marketplace_name_key" ON "Marketplace"("name");

-- CreateIndex
CREATE INDEX "MarketplacePresence_actorId_idx" ON "MarketplacePresence"("actorId");

-- CreateIndex
CREATE INDEX "MarketplacePresence_marketplaceId_idx" ON "MarketplacePresence"("marketplaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_name_key" ON "Forum"("name");

-- CreateIndex
CREATE INDEX "ForumPresence_actorId_idx" ON "ForumPresence"("actorId");

-- CreateIndex
CREATE INDEX "ForumPresence_forumId_idx" ON "ForumPresence"("forumId");

-- CreateIndex
CREATE INDEX "RelatedPersona_actorId_idx" ON "RelatedPersona"("actorId");

-- CreateIndex
CREATE INDEX "InvestigationActor_actorId_idx" ON "InvestigationActor"("actorId");

-- CreateIndex
CREATE INDEX "InfrastructureIndicator_type_idx" ON "InfrastructureIndicator"("type");

-- CreateIndex
CREATE INDEX "InfrastructureIndicator_value_idx" ON "InfrastructureIndicator"("value");

-- CreateIndex
CREATE INDEX "ActorInfrastructure_infrastructureId_idx" ON "ActorInfrastructure"("infrastructureId");

-- CreateIndex
CREATE INDEX "InvestigationInfrastructure_infrastructureId_idx" ON "InvestigationInfrastructure"("infrastructureId");

-- CreateIndex
CREATE INDEX "Evidence_investigationId_idx" ON "Evidence"("investigationId");

-- CreateIndex
CREATE INDEX "Evidence_type_idx" ON "Evidence"("type");

-- CreateIndex
CREATE INDEX "EvidenceActor_actorId_idx" ON "EvidenceActor"("actorId");

-- CreateIndex
CREATE INDEX "Alert_timestamp_idx" ON "Alert"("timestamp");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "TimelineEvent_timestamp_idx" ON "TimelineEvent"("timestamp");

-- CreateIndex
CREATE INDEX "TimelineEvent_actorId_idx" ON "TimelineEvent"("actorId");

-- CreateIndex
CREATE INDEX "TimelineEvent_investigationId_idx" ON "TimelineEvent"("investigationId");

-- CreateIndex
CREATE INDEX "ActorRelationship_fromActorId_idx" ON "ActorRelationship"("fromActorId");

-- CreateIndex
CREATE INDEX "ActorRelationship_toActorId_idx" ON "ActorRelationship"("toActorId");

-- CreateIndex
CREATE INDEX "ActorRelationship_type_idx" ON "ActorRelationship"("type");

-- AddForeignKey
ALTER TABLE "ActorAlias" ADD CONSTRAINT "ActorAlias_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorHandle" ADD CONSTRAINT "ActorHandle_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PgpKey" ADD CONSTRAINT "PgpKey_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePresence" ADD CONSTRAINT "MarketplacePresence_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePresence" ADD CONSTRAINT "MarketplacePresence_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPresence" ADD CONSTRAINT "ForumPresence_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPresence" ADD CONSTRAINT "ForumPresence_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedPersona" ADD CONSTRAINT "RelatedPersona_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationActor" ADD CONSTRAINT "InvestigationActor_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationActor" ADD CONSTRAINT "InvestigationActor_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfrastructureIndicator" ADD CONSTRAINT "InfrastructureIndicator_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfrastructureIndicator" ADD CONSTRAINT "InfrastructureIndicator_pgpKeyId_fkey" FOREIGN KEY ("pgpKeyId") REFERENCES "PgpKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorInfrastructure" ADD CONSTRAINT "ActorInfrastructure_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorInfrastructure" ADD CONSTRAINT "ActorInfrastructure_infrastructureId_fkey" FOREIGN KEY ("infrastructureId") REFERENCES "InfrastructureIndicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationInfrastructure" ADD CONSTRAINT "InvestigationInfrastructure_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationInfrastructure" ADD CONSTRAINT "InvestigationInfrastructure_infrastructureId_fkey" FOREIGN KEY ("infrastructureId") REFERENCES "InfrastructureIndicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceActor" ADD CONSTRAINT "EvidenceActor_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceActor" ADD CONSTRAINT "EvidenceActor_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorRelationship" ADD CONSTRAINT "ActorRelationship_fromActorId_fkey" FOREIGN KEY ("fromActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorRelationship" ADD CONSTRAINT "ActorRelationship_toActorId_fkey" FOREIGN KEY ("toActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
