/*
  Warnings:

  - You are about to drop the column `actorId` on the `Wallet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_actorId_fkey";

-- DropIndex
DROP INDEX "Wallet_actorId_idx";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "actorId";

-- CreateTable
CREATE TABLE "ActorWallet" (
    "actorId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "ActorWallet_pkey" PRIMARY KEY ("actorId","walletId")
);

-- CreateIndex
CREATE INDEX "ActorWallet_walletId_idx" ON "ActorWallet"("walletId");

-- AddForeignKey
ALTER TABLE "ActorWallet" ADD CONSTRAINT "ActorWallet_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorWallet" ADD CONSTRAINT "ActorWallet_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
