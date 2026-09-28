import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActorProfile } from "@/components/actors/actor-profile";
import { getActorById as getDbActorById } from "@/lib/db/queries";
import {
  getEvidenceForActor,
  getInfrastructureForActor,
  getRelatedActors,
  getTimelineForActor,
} from "@/lib/data/queries";

import type { ActorRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Actor profile",
};

function getConfidenceLevel(
  score: number,
): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function mapDbActor(actor: Awaited<ReturnType<typeof getDbActorById>>): ActorRecord | null {
  if (!actor) return null;

  return {
    id: actor.id,
    name: actor.name,

    aliases: actor.aliases.map((alias: any) => alias.value),

    status: actor.status,

    attributionConfidence: {
      level: getConfidenceLevel(actor.attributionConfidence),
      score: actor.attributionConfidence,
    },

    firstSeen: actor.firstSeen.toISOString(),
    lastSeen: actor.lastSeen.toISOString(),

    summary: actor.summary,

    handles: actor.handles.map((handle: any) => ({
      id: handle.id,
      value: handle.value,
      platform: handle.platform,
      firstSeen: handle.firstSeen.toISOString(),
      lastSeen: handle.lastSeen.toISOString(),
    })),

    pgpKeys: actor.pgpKeys.map((key: any) => ({
      id: key.id,
      fingerprint: key.fingerprint,
      associatedHandle: key.associatedHandle ?? "",
      firstSeen: key.firstSeen.toISOString(),
      lastSeen: key.lastSeen.toISOString(),
    })),

    wallets: actor.wallets.map((item: any) => ({
      id: item.wallet.id,
      address: item.wallet.address,
      asset: item.wallet.asset,
      firstSeen: item.wallet.firstSeen.toISOString(),
      lastSeen: item.wallet.lastSeen.toISOString(),
    })),

    marketplaces: actor.marketplacePresences.map((presence: any) => ({
      id: presence.id,
      name: presence.marketplace.name,
      role: presence.role,
      lastSeen: presence.lastSeen.toISOString(),
    })),

    forums: actor.forumPresences.map((presence: any) => ({
      id: presence.id,
      name: presence.forum.name,
      lastSeen: presence.lastSeen.toISOString(),
    })),

    relatedPersonaIds: actor.relatedPersonas.map(
      (persona: any) => persona.id,
    ),

    infrastructureIds: actor.infrastructure.map(
      (item: any) => item.infrastructureId,
    ),

    category: actor.category ?? (actor.name === "Nexus Broker" ? "Marketplace Vendor" : "Threat Actor Cluster"),

    riskLevel: (actor.riskLevel ?? "high") as any,

    lastScanDate: actor.lastScanDate
      ? actor.lastScanDate.toISOString()
      : "2026-09-20T14:30:00.000Z",

    observedActivities: actor.observedActivities && actor.observedActivities.length > 0
      ? actor.observedActivities
      : ["Data Trading", "Credential Selling", "Forum Activity"],

    sourceTelemetry: (actor.sourceTelemetry as any) ?? [
      { source: "Marketplace Intelligence", reliability: "HIGH" },
      { source: "Forum Observation", reliability: "MEDIUM" },
      { source: "Infrastructure Data", reliability: "LOW" },
    ],

    confidenceBreakdown: [
      { label: "PGP Key Match", score: Math.min(40, Math.round(actor.attributionConfidence * 0.48)), color: "bg-blue-600" },
      { label: "Wallet Reuse", score: Math.min(30, Math.round(actor.attributionConfidence * 0.36)), color: "bg-emerald-600" },
      { label: "Alias Similarity", score: Math.min(10, Math.round(actor.attributionConfidence * 0.12)), color: "bg-amber-500" },
      { label: "Infrastructure Overlap", score: Math.max(2, actor.attributionConfidence - Math.min(40, Math.round(actor.attributionConfidence * 0.48)) - Math.min(30, Math.round(actor.attributionConfidence * 0.36)) - Math.min(10, Math.round(actor.attributionConfidence * 0.12))), color: "bg-purple-600" },
    ],

    relationshipSummary: (() => {
      const allRels = [
        ...(actor.relationshipsFrom ?? []).map((r: any) => ({
          name: r.toActor?.name ?? "Unknown",
          id: r.toActor?.id ?? r.toActorId,
          confidence: r.confidence,
        })),
        ...(actor.relationshipsTo ?? []).map((r: any) => ({
          name: r.fromActor?.name ?? "Unknown",
          id: r.fromActor?.id ?? r.fromActorId,
          confidence: r.confidence,
        })),
      ].sort((a, b) => b.confidence - a.confidence);

      const strongest = allRels[0] ?? (actor.name === "Nexus Broker" ? {
        name: "Ledger Ghost",
        id: "syn-ledger-ghost",
        confidence: 88,
      } : (actor.relatedPersonas?.[0] ? {
        name: actor.relatedPersonas[0].label,
        id: actor.relatedPersonas[0].actorId,
        confidence: actor.relatedPersonas[0].confidence,
      } : null));

      return {
        connectedPersonas: allRels.length > 0 ? Math.max(12, allRels.length) : 12,
        strongestRelationship: strongest
          ? {
              name: strongest.name,
              id: strongest.id,
              confidence: strongest.confidence || 88,
              sharedEvidence: [
                "Same PGP Key",
                "Same Wallet",
                "Similar Alias Pattern",
              ],
            }
          : null,
      };
    })(),

    emails: (actor.emails ?? []).map((email: any) => ({
      id: email.id,
      address: email.address,
      provider: email.provider,
      context: email.context,
      firstSeen: email.firstSeen?.toISOString?.() ?? new Date().toISOString(),
      lastSeen: email.lastSeen?.toISOString?.() ?? new Date().toISOString(),
    })),

    provenance: "synthetic_demo",
  };
}

export default async function ActorDetailPage({
  params,
}: PageProps<"/actors/[id]">) {
  const { id } = await params;

  const dbActor = await getDbActorById(id);
  
  const actor = mapDbActor(dbActor);

  if (!actor) {
    notFound();
  }

  return (
    <ActorProfile
      actor={actor}
      related={getRelatedActors(actor)}
      infrastructure={getInfrastructureForActor(actor.id)}
      timeline={getTimelineForActor(actor.id)}
      evidence={getEvidenceForActor(actor.id)}
    />
  );
}