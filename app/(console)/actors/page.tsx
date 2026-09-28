import type { Metadata } from "next";
import { ActorsExplorer } from "@/components/actors/actors-explorer";
import { getActors } from "@/lib/db/queries";
import type { ActorRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Actors",
};

function getConfidenceLevel(
  score: number,
): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export default async function ActorsPage() {
  const dbActors = await getActors();

  const actors: ActorRecord[] = dbActors.map((actor: any) => ({
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

    provenance: "synthetic_demo",
  }));

  const relatedNames: Record<string, string> = Object.fromEntries(
    actors.map((actor) => [
      actor.id,
      actor.relatedPersonaIds.join(", "),
    ]),
  );

  return (
    <ActorsExplorer
      actors={actors}
      relatedNames={relatedNames}
    />
  );
}