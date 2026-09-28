/*
  Warnings:

  - Made the column `hypothesis` on table `ActorRelationship` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ActorRelationship" ADD COLUMN     "evidence" JSONB,
ALTER COLUMN "hypothesis" SET NOT NULL,
ALTER COLUMN "provenance" SET DEFAULT 'generated_intelligence_engine';
