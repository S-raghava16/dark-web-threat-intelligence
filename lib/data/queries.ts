import {
  SYNTHETIC_ACTORS,
  SYNTHETIC_ALERTS,
  SYNTHETIC_EVIDENCE,
  SYNTHETIC_INFRASTRUCTURE,
  SYNTHETIC_INVESTIGATIONS,
  SYNTHETIC_TIMELINE,
} from "@/lib/data/catalog";
import type {
  ActorRecord,
  AlertRecord,
  DashboardStats,
  EvidenceRecord,
  IndicatorType,
  InfrastructureIndicator,
  InvestigationRecord,
  SearchHit,
  TimelineEvent,
} from "@/lib/types";

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function getActors(): ActorRecord[] {
  return SYNTHETIC_ACTORS;
}

export function getActorById(id: string): ActorRecord | undefined {
  return SYNTHETIC_ACTORS.find((actor) => actor.id === id);
}

export function getRelatedActors(actor: ActorRecord): ActorRecord[] {
  return SYNTHETIC_ACTORS.filter((candidate) =>
    actor.relatedPersonaIds.includes(candidate.id),
  );
}

export function getInvestigations(): InvestigationRecord[] {
  return SYNTHETIC_INVESTIGATIONS;
}

export function getInvestigationById(
  id: string,
): InvestigationRecord | undefined {
  return SYNTHETIC_INVESTIGATIONS.find((investigation) => investigation.id === id);
}

export function getInfrastructure(): InfrastructureIndicator[] {
  return SYNTHETIC_INFRASTRUCTURE;
}

export function getInfrastructureForActor(
  actorId: string,
): InfrastructureIndicator[] {
  return SYNTHETIC_INFRASTRUCTURE.filter((item) =>
    item.associatedActorIds.includes(actorId),
  );
}

export function getEvidence(): EvidenceRecord[] {
  return SYNTHETIC_EVIDENCE;
}

export function getEvidenceForActor(actorId: string): EvidenceRecord[] {
  return SYNTHETIC_EVIDENCE.filter((item) => item.actorIds.includes(actorId));
}

export function getAlerts(): AlertRecord[] {
  return [...SYNTHETIC_ALERTS].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
  );
}

export function getTimelineEvents(): TimelineEvent[] {
  return [...SYNTHETIC_TIMELINE].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
  );
}

export function getTimelineForActor(actorId: string): TimelineEvent[] {
  return getTimelineEvents().filter((event) => event.actorId === actorId);
}

export function getDashboardStats(): DashboardStats {
  return {
    totalActors: SYNTHETIC_ACTORS.length,
    activeInvestigations: SYNTHETIC_INVESTIGATIONS.filter(
      (investigation) =>
        investigation.status === "active" || investigation.status === "open",
    ).length,
    highConfidenceRelationships: SYNTHETIC_ACTORS.filter(
      (actor) =>
        actor.attributionConfidence.level === "high" &&
        actor.relatedPersonaIds.length > 0,
    ).length,
    infrastructureIndicators: SYNTHETIC_INFRASTRUCTURE.length,
  };
}

export function getAttributionBuckets(): {
  level: "high" | "medium" | "low";
  count: number;
}[] {
  const buckets = { high: 0, medium: 0, low: 0 } as const;
  const counts = { high: 0, medium: 0, low: 0 };
  for (const actor of SYNTHETIC_ACTORS) {
    counts[actor.attributionConfidence.level] += 1;
  }
  return (Object.keys(buckets) as Array<keyof typeof buckets>).map((level) => ({
    level,
    count: counts[level],
  }));
}

export function searchCatalog(
  query: string,
  type: IndicatorType | "all" = "all",
): SearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits: SearchHit[] = [];

  for (const actor of SYNTHETIC_ACTORS) {
    if (
      (type === "all" || type === "actor") &&
      (includesQuery(actor.name, trimmed) ||
        actor.aliases.some((alias) => includesQuery(alias, trimmed)) ||
        includesQuery(actor.id, trimmed))
    ) {
      hits.push({
        id: `hit-actor-${actor.id}`,
        type: "actor",
        label: actor.name,
        value: actor.id,
        actorId: actor.id,
        investigationId: null,
        confidence: actor.attributionConfidence,
        context: actor.summary,
      });
    }

    for (const handle of actor.handles) {
      if (
        (type === "all" || type === "handle") &&
        includesQuery(handle.value, trimmed)
      ) {
        hits.push({
          id: `hit-handle-${handle.id}`,
          type: "handle",
          label: handle.value,
          value: handle.value,
          actorId: actor.id,
          investigationId: null,
          confidence: actor.attributionConfidence,
          context: `${handle.platform} · last seen ${handle.lastSeen}`,
        });
      }
    }

    for (const key of actor.pgpKeys) {
      if (
        (type === "all" || type === "pgp_key") &&
        includesQuery(key.fingerprint, trimmed)
      ) {
        hits.push({
          id: `hit-pgp-${key.id}`,
          type: "pgp_key",
          label: key.fingerprint,
          value: key.fingerprint,
          actorId: actor.id,
          investigationId: null,
          confidence: actor.attributionConfidence,
          context: `Associated handle ${key.associatedHandle}`,
        });
      }
    }

    for (const wallet of actor.wallets) {
      if (
        (type === "all" || type === "wallet") &&
        includesQuery(wallet.address, trimmed)
      ) {
        hits.push({
          id: `hit-wallet-${wallet.id}`,
          type: "wallet",
          label: wallet.address,
          value: wallet.address,
          actorId: actor.id,
          investigationId: null,
          confidence: actor.attributionConfidence,
          context: `${wallet.asset} synthetic address`,
        });
      }
    }
  }

  for (const indicator of SYNTHETIC_INFRASTRUCTURE) {
    const mappedType: IndicatorType | null =
      indicator.type === "onion_service"
        ? "onion_service"
        : indicator.type === "domain"
          ? "domain"
          : null;

    if (
      mappedType &&
      (type === "all" || type === mappedType) &&
      includesQuery(indicator.value, trimmed)
    ) {
      hits.push({
        id: `hit-infra-${indicator.id}`,
        type: mappedType,
        label: indicator.value,
        value: indicator.value,
        actorId: indicator.associatedActorIds[0] ?? null,
        investigationId: indicator.investigationIds[0] ?? null,
        confidence: indicator.confidence,
        context: indicator.note,
      });
    }
  }

  return hits;
}

export function getActorNamesById(): Record<string, string> {
  return Object.fromEntries(
    SYNTHETIC_ACTORS.map((actor) => [actor.id, actor.name]),
  );
}

export function getInvestigationTitlesById(): Record<string, string> {
  return Object.fromEntries(
    SYNTHETIC_INVESTIGATIONS.map((investigation) => [
      investigation.id,
      investigation.title,
    ]),
  );
}

export function getActorIds(): string[] {
  return SYNTHETIC_ACTORS.map((actor) => actor.id);
}
