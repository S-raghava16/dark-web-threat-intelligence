import type { Metadata } from "next";

import { InfrastructureExplorer } from "@/components/infrastructure/infrastructure-explorer";
import { getActors, getInfrastructure } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Infrastructure",
};

function getConfidenceLevel(
  score: number,
): "low" | "medium" | "high" {
  if (score >= 80) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
}

export default async function InfrastructurePage() {
  const [indicators, actors] = await Promise.all([
    getInfrastructure(),
    getActors(),
  ]);

  const formattedIndicators = indicators.map((item: any) => ({
    id: item.id,
    type: item.type,
    value: item.value,
    firstSeen:
      typeof item.firstSeen === "string"
        ? item.firstSeen
        : item.firstSeen?.toISOString?.() ?? new Date().toISOString(),
    lastSeen:
      typeof item.lastSeen === "string"
        ? item.lastSeen
        : item.lastSeen?.toISOString?.() ?? new Date().toISOString(),
    confidence: {
      score: item.confidence,
      level: getConfidenceLevel(item.confidence),
    },
    source: item.source,
    reliability: item.reliability ?? "HIGH",
    contributionWeight: item.contributionWeight ?? 25,
    usedFor:
      item.usedFor ??
      (item.type === "wallet"
        ? "Escrow & Settlement"
        : item.type === "onion_service"
        ? "Hidden Service Portal"
        : item.type === "domain"
        ? "Mirror / Clearnet Proxy"
        : "Operational Infrastructure"),
    serverTechnology: item.serverTechnology ?? (item.type === "onion_service" ? "nginx/1.24.0 (Tor daemon proxy)" : undefined),
    certificateFingerprint: item.certificateFingerprint ?? undefined,
    hostingPattern: item.hostingPattern ?? (item.type === "onion_service" ? "Bulletproof VPS / Fast-Flux" : undefined),
    associatedActorIds:
      item.actors?.map(
        (relation: any) => relation.actor?.id ?? relation.actorId ?? relation,
      ) ?? item.associatedActorIds ?? [],
    investigationIds: item.investigations?.map((inv: any) => inv.id) ?? item.investigationIds ?? [],
    note: item.note ?? "",
    provenance: "synthetic_demo" as const,
  }));

  const actorNames = Object.fromEntries(
    actors.map((actor: any) => [actor.id, actor.name]),
  );

  const actorOptions = actors.map((actor: any) => ({
    id: actor.id,
    name: actor.name,
  }));

  return (
    <InfrastructureExplorer
      indicators={formattedIndicators}
      actorNames={actorNames}
      actorOptions={actorOptions}
    />
  );
}