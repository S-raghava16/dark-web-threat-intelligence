import type { Metadata } from "next";

import { GraphView } from "@/components/graph/graph-view";
import {
  getActorRelationships,
  getActors,
  getInfrastructure,
} from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Graph",
};

export default async function GraphPage(props: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const initialMode =
    searchParams?.mode === "infrastructure"
      ? "infrastructure"
      : "relationships";

  const [relationships, indicators, actors] = await Promise.all([
    getActorRelationships(),
    getInfrastructure(),
    getActors(),
  ]);

  const graphRelationships = relationships.map((relationship) => ({
    id: relationship.id,
    fromActorId: relationship.fromActorId,
    toActorId: relationship.toActorId,
    fromActorName: relationship.fromActor.name,
    toActorName: relationship.toActor.name,
    type: relationship.type,
    confidence: relationship.confidence,
    hypothesis: relationship.hypothesis,
  }));

  const formattedIndicators = indicators.map((item: any) => ({
    id: item.id,
    type: item.type,
    value: item.value,
    confidence: item.confidence,
    source: item.source,
    reliability: item.reliability ?? "HIGH",
    associatedActorIds:
      item.actors?.map(
        (relation: any) => relation.actor?.id ?? relation.actorId ?? relation,
      ) ?? item.associatedActorIds ?? [],
  }));

  const actorMap = Object.fromEntries(
    actors.map((actor: any) => [actor.id, actor.name]),
  );

  return (
    <GraphView
      relationships={graphRelationships}
      infrastructure={formattedIndicators}
      actorMap={actorMap}
      initialMode={initialMode}
    />
  );
}