"use client";

import { useEffect, useMemo, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { humanizeKey } from "@/lib/format";

export type InvestigationGraphRelationship = {
  id: string;
  fromActorId: string;
  toActorId: string;
  fromActorName: string;
  toActorName: string;
  type: string;
  confidence: number;
  hypothesis: string | null;
};

type InvestigationGraphProps = {
  relationships: InvestigationGraphRelationship[];
  focalActorId?: string | null;
};

type GraphRelationship = InvestigationGraphRelationship & {
  key: string;
};

export function InvestigationGraph({
  relationships,
  focalActorId = null,
}: InvestigationGraphProps) {
  const [selectedActorId, setSelectedActorId] =
    useState<string | null>(focalActorId);

  /*
   * Keep the selected actor synchronized with a new investigation.
   */
  useEffect(() => {
    setSelectedActorId(focalActorId);
  }, [focalActorId]);

  /*
   * The database can contain reciprocal relationships:
   *
   * Nexus Broker -> Ledger Ghost
   * Ledger Ghost -> Nexus Broker
   *
   * For visualization purposes, those represent one correlation.
   * Deduplicate them so the graph doesn't show two identical edges.
   */
  const graphRelationships = useMemo<GraphRelationship[]>(() => {
    const unique = new Map<string, GraphRelationship>();

    for (const relationship of relationships) {
      const actorPair = [
        relationship.fromActorId,
        relationship.toActorId,
      ].sort();

      const key = `${actorPair[0]}::${actorPair[1]}::${relationship.type}`;

      const existing = unique.get(key);

      /*
       * Keep the strongest relationship if duplicates exist.
       */
      if (
        !existing ||
        relationship.confidence > existing.confidence
      ) {
        unique.set(key, {
          ...relationship,
          key,
        });
      }
    }

    return [...unique.values()];
  }, [relationships]);

  /*
   * Build Cytoscape nodes and edges.
   */
  const elements = useMemo(() => {
    const nodes = new Map<
      string,
      {
        data: {
          id: string;
          label: string;
          focal: boolean;
        };
      }
    >();

    for (const relationship of graphRelationships) {
      if (!nodes.has(relationship.fromActorId)) {
        nodes.set(relationship.fromActorId, {
          data: {
            id: relationship.fromActorId,
            label: relationship.fromActorName,
            focal:
              relationship.fromActorId === focalActorId,
          },
        });
      }

      if (!nodes.has(relationship.toActorId)) {
        nodes.set(relationship.toActorId, {
          data: {
            id: relationship.toActorId,
            label: relationship.toActorName,
            focal:
              relationship.toActorId === focalActorId,
          },
        });
      }
    }

    const edges = graphRelationships.map((relationship) => ({
      data: {
        id: relationship.key,
        source: relationship.fromActorId,
        target: relationship.toActorId,
        label: `${humanizeKey(
          relationship.type,
        )} · ${relationship.confidence}%`,
      },
    }));

    return [...nodes.values(), ...edges];
  }, [graphRelationships, focalActorId]);

  const selectedActor = useMemo(() => {
    if (!selectedActorId) {
      return null;
    }

    for (const relationship of graphRelationships) {
      if (relationship.fromActorId === selectedActorId) {
        return {
          id: relationship.fromActorId,
          name: relationship.fromActorName,
        };
      }

      if (relationship.toActorId === selectedActorId) {
        return {
          id: relationship.toActorId,
          name: relationship.toActorName,
        };
      }
    }

    return null;
  }, [graphRelationships, selectedActorId]);

  const selectedRelationships = useMemo(() => {
    if (!selectedActorId) {
      return [];
    }

    return graphRelationships.filter(
      (relationship) =>
        relationship.fromActorId === selectedActorId ||
        relationship.toActorId === selectedActorId,
    );
  }, [graphRelationships, selectedActorId]);

  if (graphRelationships.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader
        title="Investigation relationship graph"
        description="Interactive visualization of actor correlation hypotheses."
      />

      <CardBody>
        <div className="overflow-hidden rounded-lg border border-slate-200">
        <CytoscapeComponent
            elements={elements}
            style={{
                width: "100%",
                height: "520px",
                background: "#f8fafc",
            }}
            layout={{
                name: "cose",
                animate: false,
                fit: true,
                padding: 60,
            }}
            cy={(cy: any) => {
                cy.on("tap", "node", (event: any) => {
                const actorId = event.target.id();
                setSelectedActorId(actorId);
                });
            }}
            stylesheet={[
                {
                selector: "node",
                style: {
                    label: "data(label)",
                    "background-color": "#2563eb",
                    color: "#ffffff",
                    "font-size": 13,
                    "font-weight": "bold",
                    "text-valign": "center",
                    "text-halign": "center",
                    "border-width": 2,
                    "border-color": "#1d4ed8",
                    width: 65,
                    height: 65,
                },
                },
                {
                selector: "node[focal = true]",
                style: {
                    "background-color": "#1d4ed8",
                    "border-width": 4,
                    "border-color": "#60a5fa",
                    width: 78,
                    height: 78,
                },
                },
                {
                selector: "node:selected",
                style: {
                    "background-color": "#1e40af",
                    "border-width": 4,
                    "border-color": "#3b82f6",
                    width: 82,
                    height: 82,
                },
                },
                {
                selector: "edge",
                style: {
                    label: "data(label)",
                    width: 2,
                    "line-color": "#94a3b8",
                    "target-arrow-color": "#94a3b8",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier",
                    color: "#334155",
                    "font-size": 11,
                    "font-weight": "500",
                    "text-background-color": "#ffffff",
                    "text-background-opacity": 1,
                    "text-background-padding": 3,
                    "text-border-color": "#cbd5e1",
                    "text-border-width": 1,
                    "text-border-opacity": 1,
                },
                },
            ]}
            />
        </div>

        {selectedActor ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Selected actor
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {selectedActor.name}
            </p>

            <div className="mt-4 space-y-3">
              {selectedRelationships.map(
                (relationship) => {
                  const otherActor =
                    relationship.fromActorId ===
                    selectedActor.id
                      ? relationship.toActorName
                      : relationship.fromActorName;

                  return (
                    <div
                      key={relationship.key}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {otherActor}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {humanizeKey(
                              relationship.type,
                            )}
                          </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {relationship.confidence}%
                        </span>
                      </div>

                      {relationship.hypothesis ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {relationship.hypothesis}
                        </p>
                      ) : null}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}